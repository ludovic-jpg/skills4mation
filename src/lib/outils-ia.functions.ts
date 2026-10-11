import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { QuestionOutil } from "@/lib/outils";

const schema = z
  .object({
    /** Formation du catalogue du formateur (source privilégiée). */
    formationId: z.string().uuid().optional(),
    /** Ancien parcours de formation (rétro-compatibilité). */
    parcoursId: z.string().uuid().optional(),
    type: z.enum(["positionnement", "acquis"]),
    /** Test de positionnement existant dont les acquis évalués doivent reprendre les objectifs. */
    positionnementId: z.string().uuid().optional(),
  })
  .refine((d) => Boolean(d.formationId) !== Boolean(d.parcoursId), {
    message: "Choisissez une formation (ou un parcours).",
  });

export type OutilGenere = { titre: string; questions: QuestionOutil[] };

/** Forme de sortie imposée à Claude (appel d'outil forcé). */
const SCHEMA_SORTIE = {
  type: "object",
  additionalProperties: false,
  required: ["titre", "questions"],
  properties: {
    titre: { type: "string", description: "Titre court de l'outil, sans guillemets." },
    questions: {
      type: "array",
      description: "8 à 12 questions, dans l'ordre de passation.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["objectif", "enonce", "type", "options", "bonne_reponse"],
        properties: {
          objectif: {
            type: "string",
            description:
              "Objectif pédagogique (ou module) évalué par cette question, repris de la source.",
          },
          enonce: { type: "string", description: "Énoncé, sans numérotation." },
          type: { type: "string", enum: ["qcm", "ouverte"] },
          options: {
            type: "array",
            items: { type: "string" },
            description: "QCM : 3 ou 4 propositions homogènes. Question ouverte : liste vide.",
          },
          bonne_reponse: {
            type: "string",
            description:
              "QCM : texte exact de l'unique bonne proposition. Question ouverte : chaîne vide.",
          },
        },
      },
    },
  },
} as const;

const sortieSchema = z.object({
  titre: z.string(),
  questions: z
    .array(
      z.object({
        objectif: z.string().default(""),
        enonce: z.string(),
        type: z.enum(["qcm", "ouverte"]),
        options: z.array(z.string()).default([]),
        bonne_reponse: z.string().default(""),
      }),
    )
    .min(1),
});

const CONSIGNE_QCM = `<regles_qcm>
- Chaque question évalue un seul objectif ou module : renseigne le champ « objectif » avec son intitulé. Couvre tous les objectifs, chacun par au moins une question.
- QCM : une seule bonne réponse, 3 ou 4 propositions de longueur et de forme homogènes. Les distracteurs sont plausibles : ce sont des erreurs ou confusions réellement commises par des débutants, pour que la question discrimine vraiment.
- N'utilise jamais « toutes les réponses », « aucune des réponses », ni de double négation : ces formulations mesurent la lecture, pas la compétence.
- Énoncés courts, concrets, ancrés dans des situations professionnelles du public visé.
- Environ 80 % de QCM ; le reste en questions ouvertes courtes (mise en situation ou justification).
- Recopie dans « bonne_reponse » le texte exact de la bonne proposition.
</regles_qcm>`;

/** Mélange les propositions pour éviter que la bonne réponse soit toujours à la même place. */
function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

/**
 * Propose une série de questions alignées sur les objectifs et le programme d'une
 * formation du catalogue (ou d'un ancien parcours), via Claude. Le résultat est
 * destiné à être relu et modifié par le formateur avant enregistrement.
 */
export const genererQuestionsOutil = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }): Promise<OutilGenere> => {
    const { claudeStructure, REFERENTIEL_PEDAGOGIQUE } = await import("@/lib/claude.server");

    let titreSource = "";
    let source = "";
    if (data.formationId) {
      const { data: formation, error } = await context.supabase
        .from("formations_catalogue")
        .select(
          "titre, objectif, objectifs, prerequis, duree_heures, programme, public_cible, niveau",
        )
        .eq("id", data.formationId)
        .eq("formateur_id", context.userId)
        .maybeSingle();
      if (error || !formation) throw new Error("Formation introuvable.");
      titreSource = formation.titre;
      source = `<formation>
Titre : ${formation.titre}
Objectif général : ${formation.objectif ?? ""}
Objectifs pédagogiques :
${(formation.objectifs ?? []).map((o) => `- ${o}`).join("\n")}
Public visé : ${formation.public_cible ?? ""}
Niveau : ${formation.niveau ?? ""}
Prérequis : ${formation.prerequis ?? ""}
Durée : ${formation.duree_heures ?? ""} heures
Programme (modules) : ${JSON.stringify(formation.programme ?? []).slice(0, 10000)}
</formation>`;
    } else {
      const { data: parcours, error } = await context.supabase
        .from("parcours_formation")
        .select("titre, description, objectifs, prerequis, duree_heures, modules")
        .eq("id", data.parcoursId!)
        .eq("formateur_id", context.userId)
        .maybeSingle();
      if (error || !parcours) throw new Error("Parcours introuvable.");
      titreSource = parcours.titre;
      source = `<formation>
Titre : ${parcours.titre}
Description : ${parcours.description ?? ""}
Objectifs : ${parcours.objectifs ?? ""}
Prérequis : ${parcours.prerequis ?? ""}
Durée : ${parcours.duree_heures ?? ""} heures
Modules : ${JSON.stringify(parcours.modules ?? []).slice(0, 10000)}
</formation>`;
    }

    let amont = "";
    if (data.type === "acquis" && data.positionnementId) {
      const { data: test } = await context.supabase
        .from("outils_positionnement")
        .select("titre, questions")
        .eq("id", data.positionnementId)
        .eq("formateur_id", context.userId)
        .maybeSingle();
      if (test) {
        amont = `\n<test_positionnement titre="${test.titre.replace(/"/g, "'")}">
${JSON.stringify(test.questions).slice(0, 6000)}
</test_positionnement>`;
      }
    }

    const intention =
      data.type === "positionnement"
        ? `Conçois un test de positionnement à faire passer AVANT la formation (indicateur 8 Qualiopi). Il situe le niveau de départ de l'apprenant sur chaque module et objectif, pour adapter le parcours : progresse des notions de base vers les plus avancées, sans piéger.`
        : `Conçois une évaluation des acquis à faire passer À L'ISSUE de la formation (indicateur 11 Qualiopi). Elle mesure l'atteinte de chaque objectif pédagogique, objectif par objectif, à un niveau d'exigence cohérent avec le verbe d'action de l'objectif.${
            amont
              ? " Reprends exactement les objectifs couverts par le test de positionnement fourni, pour permettre la comparaison avant/après, sans recopier ses questions."
              : ""
          }`;

    const consigne = `<contexte>
${source}${amont}
</contexte>

<consigne>
${intention}
Rédige 8 à 12 questions en français, dans l'ordre de passation, et un titre court.
</consigne>

${CONSIGNE_QCM}`;

    const sortie = await claudeStructure({
      systeme: REFERENTIEL_PEDAGOGIQUE,
      consigne,
      outil: {
        nom: "enregistrer_questionnaire",
        description: "Enregistre le questionnaire (titre et questions) conçu pour le formateur.",
        schemaJson: SCHEMA_SORTIE as unknown as Record<string, unknown>,
      },
      validation: sortieSchema,
      maxTokens: 6000,
    });

    const questions: QuestionOutil[] = [];
    for (const q of sortie.questions) {
      const enonce = q.enonce.trim();
      if (!enonce) continue;
      if (q.type === "ouverte") {
        questions.push({ enonce, type: "ouverte", options: [] });
        continue;
      }
      const options = Array.from(new Set(q.options.map((o) => o.trim()).filter(Boolean)));
      if (options.length < 2) {
        questions.push({ enonce, type: "ouverte", options: [] });
        continue;
      }
      const bonne = q.bonne_reponse.trim();
      const question: QuestionOutil = { enonce, type: "qcm", options: melanger(options) };
      if (bonne && options.includes(bonne)) question.bonneReponse = bonne;
      questions.push(question);
    }
    if (!questions.length)
      throw new Error("La réponse de l'IA ne contient aucune question exploitable. Réessayez.");

    return {
      titre:
        sortie.titre.trim() ||
        `${data.type === "positionnement" ? "Test de positionnement" : "Évaluation des acquis"} — ${titreSource}`,
      questions,
    };
  });
