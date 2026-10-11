/**
 * Client Claude (API Anthropic) côté serveur — Server-only : ne jamais importer
 * depuis du code client (la clé API ne doit jamais atteindre le navigateur).
 *
 * Choix techniques (bonnes pratiques Anthropic, oct. 2026) :
 * - sortie structurée par appel d'outil forcé (tool_choice) + validation Zod :
 *   pas de JSON « deviné » dans du texte libre ;
 * - prompt système mis en cache (cache_control) : le référentiel pédagogique,
 *   identique d'un appel à l'autre, n'est facturé plein tarif qu'une fois ;
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
function cleApi(): string {
  const cle =
    process.env["ANTHROPIC_API_KEY"] || process.env["CLAUDE_API_KEY"] || process.env["ANTHROPIC_KEY"];
  if (!cle) {
    throw new Error(
      "La génération IA n'est pas configurée : ajoutez le secret ANTHROPIC_API_KEY dans Lovable Cloud.",
    );
  }
  return cle;
}

export function claudeConfigure(): boolean {
  return Boolean(
    process.env["ANTHROPIC_API_KEY"] || process.env["CLAUDE_API_KEY"] || process.env["ANTHROPIC_KEY"],
  );
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

/**
 * Appelle Claude et renvoie une sortie structurée validée.
 * Lève une erreur en français, affichable telle quelle au formateur.
 */
export async function claudeStructure<T>(options: Options<T>): Promise<T> {
  const contenu: Record<string, unknown>[] = [];
  for (const doc of options.documents ?? []) {
    if (doc.type === "pdf") {
      contenu.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: doc.base64 },
        ...(doc.titre ? { title: doc.titre } : {}),
      });
    } else {
      contenu.push({
        type: "text",
        text: `<document${doc.titre ? ` titre="${doc.titre.replace(/"/g, "'")}"` : ""}>\n${doc.contenu}\n</document>`,
      });
    }
  }
  contenu.push({ type: "text", text: options.consigne });

  const corps = {
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
  };

  let reponse: Response;
  try {
    reponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "x-api-key": cleApi(),
        "anthropic-version": API_VERSION,
        "content-type": "application/json",
      },
      body: JSON.stringify(corps),
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) throw error;
    console.error("[claude] erreur réseau", error);
    throw new Error("Le service IA est injoignable. Réessayez dans un instant.");
  }

  const json = (await reponse.json().catch(() => ({}))) as ReponseApi;
  if (!reponse.ok) {
    console.error(`[claude] ${reponse.status}`, json.error);
    if (reponse.status === 401) throw new Error("Clé API Claude invalide : vérifiez le secret ANTHROPIC_API_KEY.");
    if (reponse.status === 429 || reponse.status === 529) {
      throw new Error("Le service IA est momentanément saturé. Réessayez dans une minute.");
    }
    throw new Error(`Génération IA impossible [${reponse.status}]. Réessayez.`);
  }

  if (json.stop_reason === "max_tokens") {
    throw new Error("Le contenu demandé est trop long pour une seule génération. Réduisez le périmètre.");
  }
  const appel = json.content?.find((b) => b.type === "tool_use" && b.name === options.outil.nom);
  if (!appel) throw new Error("La réponse de l'IA est incomplète. Réessayez.");

  const resultat = options.validation.safeParse(appel.input);
  if (!resultat.success) {
    console.error("[claude] sortie non conforme", resultat.error.issues.slice(0, 5));
    throw new Error("La réponse de l'IA n'a pas le format attendu. Réessayez.");
  }
  return resultat.data;
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
