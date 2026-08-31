import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_dossiers",
  title: "Lister mes dossiers de formation",
  description:
    "Liste les dossiers de formation accessibles au formateur connecté (titre, entreprise, dates, statut CRM).",
  inputSchema: {
    statut_crm: z.string().trim().optional().describe("Filtre optionnel sur le statut CRM du dossier."),
    limit: z.number().int().min(1).max(50).optional().describe("Nombre maximum de dossiers (défaut 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ statut_crm, limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Non authentifié." }], isError: true };
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("dossiers")
      .select(
        "id, dossier_nom, titre_formation, entreprise_nom, entreprise_siret, date_debut, date_fin, statut, statut_crm, drive_folder_url, updated_at",
      )
      .order("updated_at", { ascending: false })
      .limit(limit ?? 20);
    if (statut_crm) query = query.eq("statut_crm", statut_crm as never);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { dossiers: data ?? [] },
    };
  },
});
