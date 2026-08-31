import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { supabaseForUser } from "../supabase";

const CRM_STATUTS = [
  "brouillon",
  "demande_validation",
  "dossier_valide",
  "demande_financement",
  "accord_financement",
  "finalisation_administrative",
  "paiement",
  "paiement_formateur",
  "refuse",
  "formation_en_cours",
  "formation_realisee",
  "demande_paiement",
  "paiement_organisme",
] as const;

export default defineTool({
  name: "update_dossier_statut_crm",
  title: "Mettre à jour le statut CRM d'un dossier",
  description: "Fait avancer un dossier de formation dans le pipeline CRM Skills4mation.",
  inputSchema: {
    id: z.string().uuid().describe("Identifiant du dossier."),
    statut_crm: z.enum(CRM_STATUTS).describe("Nouveau statut CRM du dossier."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ id, statut_crm }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Non authentifié." }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("dossiers")
      .update({ statut_crm })
      .eq("id", id)
      .select("id, dossier_nom, statut_crm")
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data)
      return { content: [{ type: "text", text: "Dossier introuvable ou non modifiable." }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { dossier: data },
    };
  },
});
