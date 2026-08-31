import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_catalogue",
  title: "Rechercher une formation au catalogue",
  description:
    "Recherche dans le catalogue public Skills4mation (titre, catégorie, tarif, durée, formateur) parmi les formations publiées.",
  inputSchema: {
    query: z.string().trim().min(2).optional().describe("Mots-clés recherchés dans le titre."),
    categorie: z.string().trim().optional().describe("Filtre optionnel sur la catégorie."),
    limit: z.number().int().min(1).max(50).optional().describe("Nombre maximum de résultats (défaut 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, categorie, limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Non authentifié." }], isError: true };
    const supabase = supabaseForUser(ctx);
    let request = supabase
      .from("formations_catalogue")
      .select(
        "id, slug, titre, categorie, intro, duree_texte, duree_heures, tarif_ht, tarif_unite, format, formateur_nom, inscriptions_ouvertes",
      )
      .eq("publiee", true)
      .order("titre")
      .limit(limit ?? 20);
    if (query) request = request.ilike("titre", `%${query}%`);
    if (categorie) request = request.eq("categorie", categorie);
    const { data, error } = await request;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const formations = (data ?? []).map((f) => ({
      ...f,
      url: `https://skills4mation.com/formations/${f.slug}`,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(formations) }],
      structuredContent: { formations },
    };
  },
});
