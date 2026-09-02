import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  /** Chemin du document dans le bucket privé `candidatures`. */
  path: z.string().min(1).max(500),
  nomFichier: z.string().min(1).max(200),
});

export type ParcoursAnalyse = {
  titre: string;
  objectifs: string;
  prerequis: string;
  dureeHeures: number | null;
  modules: { titre: string; points: string[] }[];
};

const CONSIGNE = `Tu analyses un support de formation professionnelle et tu en extrais un parcours structuré au format Skills4mation.
Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, de la forme :
{"titre":"","objectifs":"","prerequis":"","dureeHeures":0,"modules":[{"titre":"","points":[""]}]}
- titre : intitulé de la formation.
- objectifs : objectifs pédagogiques, une phrase par ligne.
- prerequis : prérequis attendus des apprenants.
- dureeHeures : durée totale estimée en heures (nombre entier, 0 si indéterminable).
- modules : découpage pédagogique, chaque module avec son titre et une liste de points clés.
N'invente pas d'information absente du document : laisse la chaîne vide si elle n'y figure pas.`;

/** Extrait le texte brut d'un .docx (zip OOXML) sans dépendance serveur supplémentaire. */
async function texteDocx(bytes: Uint8Array): Promise<string> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(bytes);
  const xml = await zip.file("word/document.xml")?.async("string");
  if (!xml) throw new Error("Document Word illisible.");
  return xml
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim()
    .slice(0, 60000);
}

/**
 * Analyse un support de formation déposé par le formateur et propose un parcours
 * structuré (titre, objectifs, prérequis, durée, modules) via l'IA Lovable.
 */
export const analyserFormationPourParcours = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }): Promise<ParcoursAnalyse> => {
    if (!data.path.startsWith(`${context.userId}/`)) {
      throw new Error("Document non autorisé.");
    }
    const cle = process.env["LOVABLE_API_KEY"];
    if (!cle) throw new Error("L'analyse IA n'est pas configurée sur cet environnement.");

    const telechargement = await context.supabase.storage.from("candidatures").download(data.path);
    if (telechargement.error || !telechargement.data) throw new Error("Document introuvable.");
    const bytes = new Uint8Array(await telechargement.data.arrayBuffer());
    if (bytes.byteLength === 0) throw new Error("Le document déposé est vide.");

    const nom = data.nomFichier.toLowerCase();
    const estPdf = nom.endsWith(".pdf");
    let contenu: Record<string, unknown>[];
    if (estPdf) {
      const base64 = Buffer.from(bytes).toString("base64");
      contenu = [
        { type: "text", text: CONSIGNE },
        {
          type: "file",
          file: { filename: data.nomFichier, file_data: `data:application/pdf;base64,${base64}` },
        },
      ];
    } else {
      const texte = await texteDocx(bytes);
      contenu = [{ type: "text", text: `${CONSIGNE}\n\nSupport de formation :\n${texte}` }];
    }

    const reponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${cle}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.7-flash",
        messages: [{ role: "user", content: contenu }],
      }),
    });
    if (!reponse.ok) {
      const corps = await reponse.text();
      throw new Error(`Analyse IA impossible [${reponse.status}] : ${corps}`);
    }
    const json = (await reponse.json()) as {
      choices?: { message?: { content?: string } }[];
    };
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
        objectifs: z.string().default(""),
        prerequis: z.string().default(""),
        dureeHeures: z.coerce.number().nullable().default(null),
        modules: z
          .array(
            z.object({
              titre: z.string().default(""),
              points: z.array(z.string()).default([]),
            }),
          )
          .default([]),
      })
      .parse(parse);
    return {
      ...sortie,
      dureeHeures: sortie.dureeHeures && sortie.dureeHeures > 0 ? Math.round(sortie.dureeHeures) : null,
    };
  });
