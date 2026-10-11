import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { SupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import type { DocumentClaude } from "@/lib/claude.server";

/**
 * Génération et import de programmes de formation par l'IA (Claude).
 * Le résultat est renvoyé au formulaire du formateur : rien n'est enregistré ici,
 * le formateur relit puis clique « Enregistrer ».
 */

export const NB_MODULES_MAX = 6;

/** Programme proposé par l'IA, prêt à remplir le formulaire de la formation. */
export type ProgrammeIa = {
  titre: string;
  categorie: string;
  niveau: string;
  public_cible: string;
  intro: string;
  objectif: string;
  objectifs: string[];
  prerequis: string;
  modalites: string[];
  moyens_pedagogiques: string;
  modalites_evaluation: string;
  accessibilite: string;
  duree_heures: number | null;
  duree_jours: number | null;
  /** Modules au format Skills4mation : la durée figure dans le titre, ex. « … (3 h) ». */
  programme: { titre: string; points: string[] }[];
};

export type ResultatProgrammeIa = {
  programme: ProgrammeIa;
  /** Remarques à montrer au formateur (ex. durées des modules réajustées). */
  avertissements: string[];
};

const categorieSchema = z.object({ slug: z.string().max(80), label: z.string().max(120) });

const saisieSchema = z.object({
  titre: z.string().max(300),
  duree_heures: z.number().positive().max(2000),
  niveau: z.string().max(500),
  public_cible: z.string().max(1000),
  objectif: z.string().max(3000),
  categorie: z.string().max(80).default(""),
  objectifs: z.array(z.string().max(1000)).max(30).default([]),
  prerequis: z.string().max(3000).default(""),
});

const genererSchema = z.object({
  formationId: z.string().uuid(),
  saisie: saisieSchema,
  categories: z.array(categorieSchema).max(40).default([]),
});

const importerSchema = z.object({
  formationId: z.string().uuid(),
  /** Chemin du document dans le bucket privé `candidatures` (dossier de l'utilisateur). */
  path: z.string().min(1).max(500),
  nomFichier: z.string().min(1).max(200),
  /** Durée déjà saisie, utilisée si le document n'en indique pas. */
  dureeHeures: z.number().positive().max(2000).nullable().default(null),
  categories: z.array(categorieSchema).max(40).default([]),
});

/* ---------- Sortie structurée de l'IA ---------- */

const chaine = { type: "string" } as const;
const listeChaines = { type: "array", items: { type: "string" } } as const;

const SCHEMA_JSON: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: [
    "titre",
    "categorie",
    "niveau",
    "public_cible",
    "intro",
    "objectif_general",
    "objectifs_pedagogiques",
    "prerequis",
    "modalites_pedagogiques",
    "moyens_pedagogiques",
    "modalites_evaluation",
    "accessibilite",
    "duree_heures",
    "duree_jours",
    "modules",
  ],
  properties: {
    titre: { ...chaine, description: "Intitulé de la formation." },
    categorie: {
      ...chaine,
      description:
        "Identifiant (slug) de la catégorie choisie dans la liste fournie, ou chaîne vide.",
    },
    niveau: { ...chaine, description: "Niveau visé (ex. Débutant, Avancé, Tous les niveaux)." },
    public_cible: { ...chaine, description: "Public visé." },
    intro: {
      ...chaine,
      description:
        "Présentation affichée sur le site : 3 à 5 phrases, bénéfices concrets pour le participant.",
    },
    objectif_general: { ...chaine, description: "Objectif général en une phrase." },
    objectifs_pedagogiques: {
      ...listeChaines,
      description:
        "Objectifs opérationnels, un par élément, chacun commençant par un verbe d'action observable à l'infinitif (sans la formule d'introduction).",
    },
    prerequis: { ...chaine, description: "Prérequis, ou « Aucun prérequis »." },
    modalites_pedagogiques: {
      ...listeChaines,
      description: "Modalités et méthodes pédagogiques mobilisées, une par élément.",
    },
    moyens_pedagogiques: { ...chaine, description: "Moyens pédagogiques et techniques." },
    modalites_evaluation: {
      ...chaine,
      description:
        "Chaîne d'évaluation : positionnement à l'entrée, évaluations formatives, évaluation des acquis, satisfaction.",
    },
    accessibilite: {
      ...chaine,
      description:
        "Accessibilité aux personnes en situation de handicap : contact du référent handicap, adaptations possibles.",
    },
    duree_heures: {
      type: ["number", "null"],
      description: "Durée totale en heures, null si inconnue.",
    },
    duree_jours: {
      type: ["number", "null"],
      description: "Nombre de jours si déductible (7 h par jour en général), sinon null.",
    },
    modules: {
      type: "array",
      description: "Modules du programme, 6 au maximum, dans l'ordre chronologique.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["titre", "duree_heures", "points"],
        properties: {
          titre: { ...chaine, description: "Titre du module, sans numéro ni durée." },
          duree_heures: { type: "number", description: "Durée du module en heures." },
          points: {
            ...listeChaines,
            description: "Contenus et activités du module, 3 à 6 points courts.",
          },
        },
      },
    },
  },
};

const texte = z
  .string()
  .nullish()
  .transform((v) => (v ?? "").trim());
const liste = z
  .array(z.string())
  .nullish()
  .transform((v) => (v ?? []).map((s) => s.trim()).filter(Boolean));
const nombre = z.coerce
  .number()
  .nullish()
  .transform((v) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null));

const sortieSchema = z.object({
  titre: texte,
  categorie: texte,
  niveau: texte,
  public_cible: texte,
  intro: texte,
  objectif_general: texte,
  objectifs_pedagogiques: liste,
  prerequis: texte,
  modalites_pedagogiques: liste,
  moyens_pedagogiques: texte,
  modalites_evaluation: texte,
  accessibilite: texte,
  duree_heures: nombre,
  duree_jours: nombre,
  modules: z
    .array(
      z.object({
        titre: texte,
        duree_heures: nombre,
        points: liste,
      }),
    )
    .nullish()
    .transform((v) => (v ?? []).filter((m) => m.titre || m.points.length > 0)),
});

type SortieIa = z.infer<typeof sortieSchema>;

const OUTIL = {
  nom: "programme_formation",
  description:
    "Enregistre le programme de formation complet au format Skills4mation (toutes les sections du document programme).",
  schemaJson: SCHEMA_JSON,
};

const SECTION_PROGRAMME = `<format_skills4mation>
Le programme Skills4mation comprend : présentation, objectif général, objectifs pédagogiques, prérequis, public visé, niveau, modalités pédagogiques, moyens pédagogiques et techniques, modalités d'évaluation, accessibilité handicap, durée (heures et jours), et au plus ${NB_MODULES_MAX} modules avec une durée en heures chacun.
- Objectifs pédagogiques : chaque élément commence directement par le verbe à l'infinitif (« Réaliser… », « Analyser… »), car le site ajoute lui-même « À l'issue de la formation, le participant sera capable de ».
- Modules : titres courts et explicites, sans numéro ni durée (ils sont ajoutés automatiquement). Les points décrivent apports ET activités pratiques (exercice, cas, mise en situation).
- Accessibilité : indiquer que les personnes en situation de handicap sont invitées à contacter le référent handicap de Skills4mation avant l'entrée en formation pour étudier les adaptations possibles ; ne pas inventer de nom ni de numéro.
- Champs texte : phrases complètes, sans puces, sans markdown. Sois concis : un auditeur lit le programme en deux minutes.
</format_skills4mation>`;

function listeCategories(categories: { slug: string; label: string }[]) {
  if (categories.length === 0) return "Aucune liste fournie : renvoie une chaîne vide.";
  return categories.map((c) => `- ${c.slug} : ${c.label}`).join("\n");
}

/* ---------- Contrôles côté code ---------- */

const arrondiDemiHeure = (h: number) => Math.round(h * 2) / 2;
const formatHeures = (h: number) => `${String(h).replace(".", ",")} h`;

/**
 * Garantit que la somme des durées des modules égale la durée totale (exigence Qualiopi).
 * En cas d'écart, les durées sont réparties au prorata (au demi-heure près) et le
 * formateur est prévenu.
 */
function normaliserModules(
  modules: SortieIa["modules"],
  dureeTotale: number | null,
): { programme: { titre: string; points: string[] }[]; avertissements: string[] } {
  const avertissements: string[] = [];
  let liste = modules.slice(0, NB_MODULES_MAX);
  if (modules.length > NB_MODULES_MAX) {
    avertissements.push(
      `L'IA proposait ${modules.length} modules : seuls les ${NB_MODULES_MAX} premiers ont été repris.`,
    );
  }

  let durees = liste.map((m) => m.duree_heures ?? 0);
  const somme = durees.reduce((a, b) => a + b, 0);

  if (dureeTotale && liste.length > 0 && Math.abs(somme - dureeTotale) > 0.01) {
    const base = somme > 0 ? durees : liste.map(() => 1);
    const poids = base.reduce((a, b) => a + b, 0);
    durees = base.map((d) => Math.max(0.5, arrondiDemiHeure((d / poids) * dureeTotale)));
    // Le dernier module absorbe l'écart d'arrondi pour tomber exactement sur la durée totale.
    const reste = dureeTotale - durees.slice(0, -1).reduce((a, b) => a + b, 0);
    if (reste >= 0.5) {
      durees[durees.length - 1] = reste;
      if (somme > 0) {
        avertissements.push(
          `Les durées des modules (${formatHeures(somme)}) ont été réajustées pour correspondre à la durée totale de ${formatHeures(dureeTotale)}.`,
        );
      }
    } else {
      avertissements.push(
        `La somme des durées des modules ne correspond pas à la durée totale de ${formatHeures(dureeTotale)} : vérifiez le découpage.`,
      );
    }
  } else if (!dureeTotale && somme > 0) {
    avertissements.push("Durée totale inconnue : vérifiez la durée de chaque module.");
  }

  liste = liste.map((m, i) => ({ ...m, duree_heures: durees[i] || null }));
  return {
    programme: liste.map((m, i) => {
      const titre = m.titre.replace(/^module\s*\d+\s*[—:.-]\s*/i, "").trim() || "Module";
      const duree = m.duree_heures ? ` (${formatHeures(m.duree_heures)})` : "";
      return { titre: `Module ${i + 1} — ${titre}${duree}`, points: m.points };
    }),
    avertissements,
  };
}

function versProgramme(
  sortie: SortieIa,
  dureeTotale: number | null,
  categories: { slug: string }[],
): ResultatProgrammeIa {
  const { programme, avertissements } = normaliserModules(sortie.modules, dureeTotale);
  const categorie = categories.some((c) => c.slug === sortie.categorie) ? sortie.categorie : "";
  const dureeJours =
    sortie.duree_jours ?? (dureeTotale && dureeTotale % 7 === 0 ? dureeTotale / 7 : null);
  return {
    programme: {
      titre: sortie.titre,
      categorie,
      niveau: sortie.niveau,
      public_cible: sortie.public_cible,
      intro: sortie.intro,
      objectif: sortie.objectif_general,
      objectifs: sortie.objectifs_pedagogiques,
      prerequis: sortie.prerequis,
      modalites: sortie.modalites_pedagogiques,
      moyens_pedagogiques: sortie.moyens_pedagogiques,
      modalites_evaluation: sortie.modalites_evaluation,
      accessibilite: sortie.accessibilite,
      duree_heures: dureeTotale,
      duree_jours: dureeJours,
      programme,
    },
    avertissements,
  };
}

type ContexteAuth = { userId: string; supabase: SupabaseClient<Database> };

/** Vérifie que la formation appartient au formateur connecté. */
async function verifierProprietaire(context: ContexteAuth, formationId: string) {
  const { data, error } = await context.supabase
    .from("formations_catalogue")
    .select("id, formateur_id")
    .eq("id", formationId)
    .maybeSingle();
  if (error || !data || data.formateur_id !== context.userId) {
    throw new Error("Formation introuvable ou non autorisée.");
  }
}

/* ---------- Server functions ---------- */

/**
 * Rédige le programme complet à partir des informations saisies à la main par le formateur.
 * Titre, durée, niveau, public et objectif général sont repris tels quels.
 */
export const genererProgrammeFormation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => genererSchema.parse(data))
  .handler(async ({ data, context }): Promise<ResultatProgrammeIa> => {
    await verifierProprietaire(context, data.formationId);
    const s = data.saisie;
    if (!s.titre.trim() || !s.niveau.trim() || !s.public_cible.trim() || !s.objectif.trim()) {
      throw new Error("Renseignez le titre, la durée, le niveau, le public et l'objectif général.");
    }

    const { claudeStructure, REFERENTIEL_PEDAGOGIQUE } = await import("@/lib/claude.server");
    const objectifsSaisis = s.objectifs.map((o) => o.trim()).filter(Boolean);

    const consigne = `<contexte>
Le formateur a saisi les informations suivantes pour sa formation :
- Titre : ${s.titre.trim()}
- Durée totale : ${formatHeures(s.duree_heures)}
- Niveau : ${s.niveau.trim()}
- Public visé : ${s.public_cible.trim()}
- Objectif général : ${s.objectif.trim()}
- Catégorie : ${s.categorie || "non renseignée"}
- Objectifs pédagogiques saisis : ${objectifsSaisis.length ? `\n  • ${objectifsSaisis.join("\n  • ")}` : "aucun"}
- Prérequis saisis : ${s.prerequis.trim() || "aucun"}
</contexte>

<categories>
${listeCategories(data.categories)}
</categories>

<consigne>
Rédige le programme complet de cette formation au format Skills4mation.
1. Recopie à l'identique le titre, le niveau, le public visé, l'objectif général et la durée totale : ce sont les choix du formateur, il en reste l'auteur.
2. Si des objectifs pédagogiques ont été saisis, garde leur sens et reformule-les avec un verbe d'action observable ; complète si nécessaire pour couvrir l'objectif général (3 à 6 objectifs par jour de formation).
3. Si des prérequis ont été saisis, garde-les en les clarifiant ; sinon propose des prérequis réalistes ou « Aucun prérequis ».
4. Si la catégorie n'est pas renseignée, choisis la plus pertinente dans la liste ; sinon recopie-la.
5. Découpe en modules (6 au maximum) dont la somme des durées est exactement ${formatHeures(s.duree_heures)}, en alternant apports et mises en pratique.
6. Rédige les autres sections (présentation, modalités, moyens, évaluation, accessibilité) de façon cohérente avec le public et le niveau.
</consigne>`;

    const sortie = await claudeStructure({
      systeme: `${REFERENTIEL_PEDAGOGIQUE}\n\n${SECTION_PROGRAMME}`,
      consigne,
      outil: OUTIL,
      validation: sortieSchema,
      maxTokens: 10000,
    });

    const resultat = versProgramme(sortie, s.duree_heures, data.categories);
    // Les choix du formateur priment toujours sur la proposition de l'IA.
    resultat.programme.titre = s.titre.trim();
    resultat.programme.niveau = s.niveau.trim();
    resultat.programme.public_cible = s.public_cible.trim();
    resultat.programme.objectif = s.objectif.trim();
    if (s.categorie) resultat.programme.categorie = s.categorie;
    if (resultat.programme.objectifs.length === 0) resultat.programme.objectifs = objectifsSaisis;
    return resultat;
  });

/**
 * Convertit le programme déposé par le formateur (PDF ou Word .docx) au format Skills4mation.
 */
export const importerProgrammeFormation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => importerSchema.parse(data))
  .handler(async ({ data, context }): Promise<ResultatProgrammeIa> => {
    await verifierProprietaire(context, data.formationId);
    if (!data.path.startsWith(`${context.userId}/`) || data.path.includes("..")) {
      throw new Error("Document non autorisé.");
    }
    const nom = data.nomFichier.toLowerCase();
    const estPdf = nom.endsWith(".pdf");
    if (!estPdf && !nom.endsWith(".docx")) {
      throw new Error("Format non pris en charge : déposez un PDF ou un document Word (.docx).");
    }

    const { TAILLE_MAX_DOCUMENT_IA, texteDocx, enBase64 } =
      await import("@/lib/documents-ia.server");
    const telechargement = await context.supabase.storage.from("candidatures").download(data.path);
    if (telechargement.error || !telechargement.data) throw new Error("Document introuvable.");
    const bytes = new Uint8Array(await telechargement.data.arrayBuffer());
    // Le document n'est conservé que le temps de l'analyse.
    void context.supabase.storage.from("candidatures").remove([data.path]);
    if (bytes.byteLength === 0) throw new Error("Le document déposé est vide.");
    if (bytes.byteLength > TAILLE_MAX_DOCUMENT_IA) {
      throw new Error("Document trop volumineux : 10 Mo maximum.");
    }

    const { claudeStructure, REFERENTIEL_PEDAGOGIQUE } = await import("@/lib/claude.server");
    const titreDoc = data.nomFichier.replace(/\.[^.]+$/, "");
    let documents: DocumentClaude[];
    if (estPdf) {
      documents = [{ type: "pdf", base64: enBase64(bytes), titre: titreDoc }];
    } else {
      const contenu = await texteDocx(bytes);
      if (!contenu.trim()) throw new Error("Aucun texte n'a pu être lu dans ce document Word.");
      documents = [{ type: "texte", contenu, titre: titreDoc }];
    }

    const consigne = `<categories>
${listeCategories(data.categories)}
</categories>

<consigne>
Le document ci-dessus est le programme de formation rédigé par le formateur. Convertis-le au format Skills4mation sans en changer le fond : c'est sa formation.
1. Reprends fidèlement le titre, la durée, le niveau, le public, l'objectif général, les prérequis et le contenu des modules quand ils figurent dans le document.
2. Reformule les objectifs pédagogiques avec un verbe d'action observable, en gardant leur sens.
3. Regroupe le contenu en 6 modules au maximum, avec une durée par module ; si le document ne donne pas les durées, répartis la durée totale de façon réaliste.
4. Pour les sections absentes du document (modalités, moyens, évaluation, accessibilité, présentation), propose une rédaction cohérente avec le reste du programme.
5. Choisis la catégorie la plus pertinente dans la liste.
6. Si la durée totale n'apparaît pas dans le document, mets null${data.dureeHeures ? ` (le formateur a indiqué ${formatHeures(data.dureeHeures)} : répartis les modules sur cette durée)` : ""}.
</consigne>`;

    const sortie = await claudeStructure({
      systeme: `${REFERENTIEL_PEDAGOGIQUE}\n\n${SECTION_PROGRAMME}`,
      documents,
      consigne,
      outil: OUTIL,
      validation: sortieSchema,
      maxTokens: 10000,
    });

    const dureeTotale = sortie.duree_heures ?? data.dureeHeures;
    return versProgramme(sortie, dureeTotale, data.categories);
  });
