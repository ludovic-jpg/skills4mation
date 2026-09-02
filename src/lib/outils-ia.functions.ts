import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { QuestionOutil } from "@/lib/outils";

const schema = z.object({
  parcoursId: z.string().uuid(),
  type: z.enum(["positionnement", "acquis"]),
  /** Test de positionnement existant dont les acquis évalués doivent reprendre les objectifs. */
  positionnementId: z.string().uuid().optional(),
});

export type OutilGenere = { titre: string; questions: QuestionOutil[] };

const FORME = `Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, de la forme :
{"titre":"","questions":[{"enonce":"","type":"qcm","options":["",""]}]}
- type vaut "qcm" (avec 3 à 4 propositions dans options) ou "ouverte" (options vide).
- 8 à 12 questions, rédigées en français, progressives, sans numérotation dans l'énoncé.`;

/**
 * Propose une série de questions alignées sur les modules et objectifs d'un parcours
 * de formation, via l'IA Lovable. Le résultat est destiné à être relu et modifié par
 * le formateur avant enregistrement.
 */
export const genererQuestionsOutil = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }): Promise<OutilGenere> => {
    const cle = process.env["LOVABLE_API_KEY"];
    if (!cle) throw new Error("La génération IA n'est pas configurée sur cet environnement.");

    const { data: parcours, error } = await context.supabase
      .from("parcours_formation")
      .select("titre, description, objectifs, prerequis, duree_heures, modules")
      .eq("id", data.parcoursId)
      .eq("formateur_id", context.userId)
      .maybeSingle();
    if (error || !parcours) throw new Error("Parcours introuvable.");

    let base = "";
    if (data.type === "acquis" && data.positionnementId) {
      const { data: test } = await context.supabase
        .from("outils_positionnement")
        .select("titre, questions")
        .eq("id", data.positionnementId)
        .eq("formateur_id", context.userId)
        .maybeSingle();
      if (test) {
        base = `\n\nTest de positionnement déjà utilisé en amont (« ${test.titre} ») : les acquis évalués doivent reprendre exactement les objectifs couverts par ces questions.\n${JSON.stringify(test.questions).slice(0, 6000)}`;
      }
    }

    const consigne =
      data.type === "positionnement"
        ? `Tu conçois un test de positionnement à faire passer AVANT la formation, pour situer le niveau de départ de l'apprenant sur les modules du parcours.`
        : `Tu conçois une évaluation des acquis à faire passer À L'ISSUE de la formation, pour mesurer l'atteinte des objectifs pédagogiques du parcours.`;

    const contexte = `Parcours de formation :
Titre : ${parcours.titre}
Objectifs : ${parcours.objectifs ?? ""}
Prérequis : ${parcours.prerequis ?? ""}
Durée : ${parcours.duree_heures ?? ""} heures
Modules : ${JSON.stringify(parcours.modules).slice(0, 8000)}${base}`;

    const reponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${cle}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.7-flash",
        messages: [{ role: "user", content: `${consigne}\n${FORME}\n\n${contexte}` }],
      }),
    });
    if (!reponse.ok) {
      const corps = await reponse.text();
      throw new Error(`Génération IA impossible [${reponse.status}] : ${corps}`);
    }
    const json = (await reponse.json()) as { choices?: { message?: { content?: string } }[] };
    const brut = json.choices?.[0]?.message?.content ?? "";
    const bloc = brut.slice(brut.indexOf("{"), brut.lastIndexOf("}") + 1);
    let parse: unknown;
    try {
      parse = JSON.parse(bloc);
    } catch {
      throw new Error("La réponse de l'IA n'a pas pu être interprétée. Réessayez.");
    }
    const sortie = z
      .object({
        titre: z.string().default(""),
        questions: z
          .array(
            z.object({
              enonce: z.string().default(""),
              type: z.enum(["qcm", "ouverte"]).default("ouverte"),
              options: z.array(z.string()).default([]),
            }),
          )
          .default([]),
      })
      .parse(parse);

    return {
      titre:
        sortie.titre.trim() ||
        `${data.type === "positionnement" ? "Test de positionnement" : "Évaluation des acquis"} — ${parcours.titre}`,
      questions: sortie.questions
        .filter((q) => q.enonce.trim().length > 0)
        .map((q) => ({
          enonce: q.enonce.trim(),
          type: q.type,
          options: q.type === "qcm" ? q.options.map((o) => o.trim()).filter(Boolean) : [],
        })),
    };
  });
