import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { parseProgramme } from "@/lib/formations";

const schema = z.object({
  formationId: z.string().uuid(),
  /** Index (base 0) du module dans le programme de la formation. */
  moduleIndex: z.number().int().min(0).max(99),
});

export const ROLES_DIAPO = [
  "titre",
  "accroche",
  "contenu",
  "activite",
  "synthese",
  "questions",
  "transition",
] as const;
export type RoleDiapo = (typeof ROLES_DIAPO)[number];

export type Diapositive = {
  role: RoleDiapo;
  /** Titre-assertion : une phrase qui énonce l'idée de la diapositive. */
  titre: string;
  /** Au plus 6 puces courtes. */
  puces: string[];
  /** Notes du présentateur : le détail oral, les consignes d'animation. */
  notes: string;
};

export type DeckModule = {
  formationTitre: string;
  moduleNumero: number;
  moduleTitre: string;
  totalModules: number;
  diapositives: Diapositive[];
};

const SCHEMA_SORTIE = {
  type: "object",
  additionalProperties: false,
  required: ["diapositives"],
  properties: {
    diapositives: {
      type: "array",
      description: "Les diapositives du module, dans l'ordre de projection (9 à 14 diapositives).",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["role", "titre", "puces", "notes"],
        properties: {
          role: { type: "string", enum: [...ROLES_DIAPO] },
          titre: {
            type: "string",
            description:
              "Titre-assertion : une phrase courte qui énonce l'idée clé (pas un simple mot-thème). Pour la diapositive « titre », le titre du module.",
          },
          puces: {
            type: "array",
            items: { type: "string" },
            description: "3 à 6 puces de quelques mots chacune (environ 30 mots au total).",
          },
          notes: {
            type: "string",
            description:
              "Notes du présentateur : explications orales, exemple concret, consigne et durée de l'activité, transition. 40 à 120 mots.",
          },
        },
      },
    },
  },
} as const;

const sortieSchema = z.object({
  diapositives: z
    .array(
      z.object({
        role: z.enum(ROLES_DIAPO),
        titre: z.string(),
        puces: z.array(z.string()).default([]),
        notes: z.string().default(""),
      }),
    )
    .min(3),
});

const SYSTEME_DIAPOS = `<conception_diapositives>
Tu conçois aussi des supports projetés, selon les principes multimédia de Mayer :
- une idée par diapositive, exprimée par un titre-assertion (phrase complète) ;
- au plus 6 puces courtes, environ 30 mots par diapositive : l'écran soutient la parole, il ne la remplace pas ;
- le détail, les exemples et les consignes d'animation vont dans les notes du présentateur, que le formateur lira en préparant sa séance ;
- aucun texte décoratif, aucun emoji, aucun markdown.
</conception_diapositives>`;

/**
 * Génère le contenu des diapositives d'un module de formation (texte uniquement) :
 * le fichier .pptx est ensuite construit dans le navigateur.
 */
export const genererDiapositivesModule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }): Promise<DeckModule> => {
    const { data: formation, error } = await context.supabase
      .from("formations_catalogue")
      .select(
        "titre, objectif, objectifs, public_cible, niveau, prerequis, duree_heures, programme",
      )
      .eq("id", data.formationId)
      .eq("formateur_id", context.userId)
      .maybeSingle();
    if (error || !formation) throw new Error("Formation introuvable.");

    const modules = parseProgramme(formation.programme);
    const module = modules[data.moduleIndex];
    if (!module) throw new Error("Ce module n'existe plus dans le programme de la formation.");

    const { claudeStructure, REFERENTIEL_PEDAGOGIQUE } = await import("@/lib/claude.server");

    const numero = data.moduleIndex + 1;
    const suivant = modules[data.moduleIndex + 1];
    const consigne = `<contexte>
<formation>
Titre : ${formation.titre}
Objectif général : ${formation.objectif ?? ""}
Objectifs pédagogiques :
${(formation.objectifs ?? []).map((o) => `- ${o}`).join("\n")}
Public visé : ${formation.public_cible ?? ""}
Niveau : ${formation.niveau ?? ""}
Prérequis : ${formation.prerequis ?? ""}
Durée totale : ${formation.duree_heures ?? ""} heures
Plan : ${modules.map((m, i) => `${i + 1}. ${m.titre}`).join(" ; ")}
</formation>
<module numero="${numero}" sur="${modules.length}">
Titre : ${module.titre}
Points clés :
${module.points.map((p) => `- ${p}`).join("\n")}
</module>
${suivant ? `<module_suivant>${suivant.titre}</module_suivant>` : "<module_suivant>Aucun : c'est le dernier module, la transition annonce la clôture et l'évaluation des acquis.</module_suivant>"}
</contexte>

<consigne>
Rédige le déroulé projeté du module ${numero} « ${module.titre} », pour que le formateur l'anime sans autre préparation. Respecte exactement cette structure, dans cet ordre :
1. role « titre » : titre du module ; puces = 2 à 4 objectifs du module formulés avec un verbe d'action observable.
2. role « accroche » : une situation, une question ou un chiffre qui donne envie d'apprendre et relie le module au quotidien professionnel du public.
3. 3 à 5 diapositives role « contenu », une par point clé majeur du module, chacune avec un exemple concret dans les notes.
4. au moins une diapositive role « activite » placée juste après le contenu qu'elle met en pratique : consigne, modalité (seul, binôme, groupe), durée et production attendue ; détaille le déroulement et le corrigé dans les notes.
5. role « synthese » : les 3 à 5 idées à retenir.
6. role « questions » : 2 à 3 questions formatives courtes pour vérifier la compréhension ; réponses attendues dans les notes.
7. role « transition » : ce qui a été acquis et le lien avec la suite.
Reste fidèle aux points clés fournis ; n'invente ni chiffre précis non vérifiable, ni norme, ni référence réglementaire.
</consigne>`;

    const sortie = await claudeStructure({
      systeme: `${REFERENTIEL_PEDAGOGIQUE}\n\n${SYSTEME_DIAPOS}`,
      consigne,
      outil: {
        nom: "enregistrer_diapositives",
        description: "Enregistre les diapositives du module, prêtes à être mises en page.",
        schemaJson: SCHEMA_SORTIE as unknown as Record<string, unknown>,
      },
      validation: sortieSchema,
      maxTokens: 8000,
    });

    const diapositives: Diapositive[] = sortie.diapositives
      .map((d) => ({
        role: d.role,
        titre: d.titre.trim(),
        puces: d.puces
          .map((p) => p.trim())
          .filter(Boolean)
          .slice(0, 6),
        notes: d.notes.trim(),
      }))
      .filter((d) => d.titre.length > 0);
    if (diapositives.length < 3) {
      throw new Error("La réponse de l'IA est incomplète pour ce module. Réessayez.");
    }

    return {
      formationTitre: formation.titre,
      moduleNumero: numero,
      moduleTitre: module.titre || `Module ${numero}`,
      totalModules: modules.length,
      diapositives,
    };
  });
