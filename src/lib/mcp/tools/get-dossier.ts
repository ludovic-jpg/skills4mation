import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_dossier",
  title: "Détail d'un dossier de formation",
  description:
    "Renvoie le détail d'un dossier de formation (données, pièces générées et statuts) pour l'utilisateur connecté.",
  inputSchema: { id: z.string().uuid().describe("Identifiant du dossier.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Non authentifié." }], isError: true };
    const supabase = supabaseForUser(ctx);
    const [{ data: dossier, error }, { data: pieces }] = await Promise.all([
      supabase.from("dossiers").select("*").eq("id", id).maybeSingle(),
      supabase.from("dossier_pieces").select("*").eq("dossier_id", id),
    ]);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!dossier)
      return { content: [{ type: "text", text: "Dossier introuvable ou non accessible." }], isError: true };
    const payload = { dossier, pieces: pieces ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(payload) }],
      structuredContent: payload,
    };
  },
});
