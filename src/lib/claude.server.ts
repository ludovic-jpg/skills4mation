/**
 * Client Claude (API Anthropic) côté serveur — Server-only : ne jamais importer
 * depuis du code client (la clé API ne doit jamais atteindre le navigateur).
 *
 * Choix techniques (bonnes pratiques Anthropic, oct. 2026) :
 * - sortie structurée par appel d'outil forcé (tool_choice) + validation Zod :
 *   pas de JSON « deviné » dans du texte libre ;
 * - prompt système marqué pour le cache (cache_control) : effectif dès que le
 *   préfixe dépasse le minimum cacheable du modèle (≈ 1 024 tokens sur Sonnet) ;
 *   sans effet ni risque en dessous ;
 * - délai maximal de 90 s (Cloudflare coupe une requête à 100 s) ;
 * - repli automatique sur la passerelle IA Lovable si aucune clé Anthropic
 *   n'est configurée, pour ne jamais casser une fonctionnalité existante ;
 * - documents longs (PDF, texte) placés AVANT la consigne dans le message ;
 * - fetch natif uniquement : compatible Cloudflare Workers, sans SDK.
 */
import { z } from "zod";

const API_URL = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";

/** Modèles par usage — surchargeables par variables d'environnement. */
export const MODELES = {
  /** Génération courante (programmes, QCM, diapositives) : meilleur rapport qualité/coût. */
  generation: () => process.env["ANTHROPIC_MODEL"] || "claude-sonnet-5-5",
  /** Contrôles légers (classification, extraction simple). */
  leger: () => process.env["ANTHROPIC_MODEL_LEGER"] || "claude-haiku-5-5",
};

/** La clé peut avoir été enregistrée sous plusieurs noms dans les secrets Lovable Cloud. */
function cleAnthropicOuNull(): string | null {
  return (
    process.env["ANTHROPIC_API_KEY"] ||
    process.env["CLAUDE_API_KEY"] ||
    process.env["ANTHROPIC_KEY"] ||
    null
  );
}

/** Vrai si une génération IA est possible (Claude, ou repli Lovable). */
export function claudeConfigure(): boolean {
  return Boolean(cleAnthropicOuNull() || process.env["LOVABLE_API_KEY"]);
}

export type DocumentClaude =
  | { type: "pdf"; base64: string; titre?: string }
  | { type: "texte"; contenu: string; titre?: string };

type Options<T> = {
  /** Rôle et référentiel stables (mis en cache). */
  systeme: string;
  /** Consigne propre à l'appel, placée après les documents. */
  consigne: string;
  documents?: DocumentClaude[];
  /** Nom et description de l'outil de sortie (la « forme » attendue). */
  outil: { nom: string; description: string; schemaJson: Record<string, unknown> };
  /** Validation stricte du résultat côté code (ce que le schéma JSON ne peut garantir). */
  validation: z.ZodType<T>;
  modele?: string;
  maxTokens?: number;
};

type ReponseApi = {
  stop_reason?: string;
  content?: { type: string; name?: string; input?: unknown; text?: string }[];
  error?: { type?: string; message?: string };
};

const DELAI_MS = 90_000;

function messageErreurApi(status: number, detail: string | undefined): string {
  if (status === 401 || status === 403) {
    return "Clé API Claude invalide : vérifiez le secret ANTHROPIC_API_KEY.";
  }
  if (status === 429 || status === 529 || status === 503) {
    return "Le service IA est momentanément saturé. Réessayez dans une minute.";
  }
  if (
    status === 413 ||
    (status === 400 && /too (long|large)|pages|exceed|maximum/i.test(detail ?? ""))
  ) {
    return "Le document est trop long pour être analysé : envoyez une version plus courte (moins de 100 pages).";
  }
  if (status === 400 && /pdf|document|media|base64|file/i.test(detail ?? "")) {
    return "Le document n'a pas pu être lu : vérifiez qu'il s'agit d'un PDF ou d'un Word valide.";
  }
  return `Génération IA impossible [${status}]. Réessayez.`;
}

async function appelerAvecDelai(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(DELAI_MS) });
  } catch (error) {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      throw new Error(
        "La génération a pris trop de temps. Réessayez, ou réduisez la durée ou le nombre de modules.",
      );
    }
    console.error("[ia] erreur réseau", error);
    throw new Error("Le service IA est injoignable. Réessayez dans un instant.");
  }
}

function valider<T>(options: Options<T>, entree: unknown): T {
  const resultat = options.validation.safeParse(entree);
  if (!resultat.success) {
    console.error("[ia] sortie non conforme", resultat.error.issues.slice(0, 5));
    throw new Error("La réponse de l'IA n'a pas le format attendu. Réessayez.");
  }
  return resultat.data;
}

async function viaAnthropic<T>(options: Options<T>, cle: string): Promise<T> {
  const contenu: Record<string, unknown>[] = [];
  for (const doc of options.documents ?? []) {
    if (doc.type === "pdf") {
      contenu.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: doc.base64 },
        ...(doc.titre ? { title: doc.titre } : {}),
      });
    } else {
      contenu.push({ type: "text", text: blocTexte(doc) });
    }
  }
  contenu.push({ type: "text", text: options.consigne });

  const reponse = await appelerAvecDelai(API_URL, {
    method: "POST",
    headers: {
      "x-api-key": cle,
      "anthropic-version": API_VERSION,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: options.modele ?? MODELES.generation(),
      max_tokens: options.maxTokens ?? 8000,
      system: [{ type: "text", text: options.systeme, cache_control: { type: "ephemeral" } }],
      tools: [
        {
          name: options.outil.nom,
          description: options.outil.description,
          input_schema: options.outil.schemaJson,
        },
      ],
      tool_choice: { type: "tool", name: options.outil.nom },
      messages: [{ role: "user", content: contenu }],
    }),
  });

  const json = (await reponse.json().catch(() => ({}))) as ReponseApi;
  if (!reponse.ok) {
    console.error(`[claude] ${reponse.status}`, json.error);
    throw new Error(messageErreurApi(reponse.status, json.error?.message));
  }
  if (json.stop_reason === "max_tokens") {
    throw new Error(
      "Le contenu demandé est trop long pour une seule génération. Réduisez le périmètre.",
    );
  }
  const appel = json.content?.find((b) => b.type === "tool_use" && b.name === options.outil.nom);
  if (!appel) throw new Error("La réponse de l'IA est incomplète. Réessayez.");
  return valider(options, appel.input);
}

/** Repli : passerelle IA Lovable (format OpenAI, appel de fonction forcé). */
async function viaLovable<T>(options: Options<T>, cle: string): Promise<T> {
  const contenu: Record<string, unknown>[] = [];
  for (const doc of options.documents ?? []) {
    if (doc.type === "pdf") {
      contenu.push({
        type: "file",
        file: {
          filename: doc.titre ?? "document.pdf",
          file_data: `data:application/pdf;base64,${doc.base64}`,
        },
      });
    } else {
      contenu.push({ type: "text", text: blocTexte(doc) });
    }
  }
  contenu.push({ type: "text", text: options.consigne });

  const reponse = await appelerAvecDelai("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${cle}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env["LOVABLE_AI_MODEL"] || "google/gemini-3.7-flash",
      messages: [
        { role: "system", content: options.systeme },
        { role: "user", content: contenu },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: options.outil.nom,
            description: options.outil.description,
            parameters: options.outil.schemaJson,
          },
        },
      ],
      tool_choice: { type: "function", function: { name: options.outil.nom } },
    }),
  });
  const json = (await reponse.json().catch(() => ({}))) as {
    choices?: {
      message?: { tool_calls?: { function?: { name?: string; arguments?: string } }[] };
    }[];
    error?: { message?: string };
  };
  if (!reponse.ok) {
    console.error(`[lovable-ai] ${reponse.status}`, json.error);
    throw new Error(messageErreurApi(reponse.status, json.error?.message));
  }
  const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new Error("La réponse de l'IA est incomplète. Réessayez.");
  let entree: unknown;
  try {
    entree = JSON.parse(args);
  } catch {
    throw new Error("La réponse de l'IA n'a pas pu être interprétée. Réessayez.");
  }
  return valider(options, entree);
}

function blocTexte(doc: { contenu: string; titre?: string }): string {
  const titre = doc.titre ? ` titre="${doc.titre.replace(/"/g, "'")}"` : "";
  return `<document${titre}>\n${doc.contenu}\n</document>`;
}

/**
 * Appelle Claude (ou, à défaut de clé Anthropic, la passerelle IA Lovable) et
 * renvoie une sortie structurée validée. Erreurs en français, affichables telles quelles.
 */
export async function claudeStructure<T>(options: Options<T>): Promise<T> {
  const cleAnthropic = cleAnthropicOuNull();
  if (cleAnthropic) return viaAnthropic(options, cleAnthropic);
  const cleLovable = process.env["LOVABLE_API_KEY"];
  if (cleLovable) {
    console.warn("[ia] ANTHROPIC_API_KEY absente : repli sur la passerelle IA Lovable.");
    return viaLovable(options, cleLovable);
  }
  throw new Error(
    "La génération IA n'est pas configurée : ajoutez le secret ANTHROPIC_API_KEY dans Lovable Cloud.",
  );
}

/** Référentiel pédagogique commun (mis en cache) — Qualiopi, guide de lecture v9 + évolutions au 01/11/2026. */
export const REFERENTIEL_PEDAGOGIQUE = `<role>
Tu es ingénieur pédagogique senior, expert de la formation professionnelle continue en France et du référentiel national qualité Qualiopi. Tu rédiges pour Skills4mation, organisme de formation qui porte des formateurs indépendants. Tes productions sont relues par le formateur puis contrôlées en audit Qualiopi : elles doivent être exactes, opérationnelles et immédiatement utilisables.
</role>

<referentiel>
- Indicateur 1 : le programme mentionne prérequis (ou « Aucun prérequis »), objectifs, durée, modalités et délais d'accès, tarifs, contacts, méthodes mobilisées, modalités d'évaluation, accessibilité aux personnes en situation de handicap. À partir du 1er novembre 2026 : modalités pédagogiques présentées clairement et modes de financement mobilisables.
- Indicateur 5 : objectifs opérationnels et évaluables.
- Indicateur 6 : contenus et méthodes adaptés aux objectifs et au public.
- Indicateur 8 : positionnement à l'entrée ; indicateur 11 : évaluation de l'atteinte des objectifs.
- Indicateur 26 : accessibilité handicap, recours à un référent et à un réseau de partenaires.
</referentiel>

<regles_redaction>
- Objectifs : « À l'issue de la formation, le participant sera capable de » + verbe d'action observable (taxonomie de Bloom révisée : citer, expliquer, appliquer, réaliser, analyser, comparer, évaluer, concevoir…) + objet + condition si utile. Jamais « connaître », « comprendre », « savoir », « maîtriser », « être sensibilisé à » : un auditeur les relève comme non évaluables.
- Au plus 3 à 6 objectifs par jour de formation ; chaque objectif est couvert par au moins un module et une évaluation.
- Modules : la somme des durées des modules est exactement égale à la durée totale annoncée. Chaque module alterne apports et mise en pratique (au moins la moitié du temps en activités : exercices, cas, mises en situation).
- Chaîne d'évaluation : positionnement à l'entrée, évaluations formatives, évaluation des acquis en fin de formation alignée objectif par objectif, satisfaction à chaud.
- Français professionnel, phrases courtes, sans jargon inutile, sans emoji, sans markdown dans les champs texte.
- N'invente ni certification, ni code RNCP/RS, ni tarif, ni nom de personne : laisse le champ vide si l'information n'est pas fournie.
</regles_redaction>`;
