import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_mes_formations",
  title: "Lister mes formations enregistrées",
  description:
    "Liste les formations enregistrées par le formateur connecté, publiées ou non, avec tarifs et état de publication.",
  inputSchema: {
    publiee: z.boolean().optional().describe("Filtre optionnel sur l'état de publication."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ publiee }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Non authentifié." }], isError: true };
    const supabase = supabaseForUser(ctx);
    let request = supabase
      .from("formations_catalogue")
      .select(
        "id, slug, titre, categorie, publiee, inscriptions_ouvertes, tarif_ht, tarif_unite, duree_texte, updated_at",
      )
      .eq("formateur_id", ctx.getUserId() ?? "")
      .order("updated_at", { ascending: false });
    if (typeof publiee === "boolean") request = request.eq("publiee", publiee);
    const { data, error } = await request;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { formations: data ?? [] },
    };
  },
});
