import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  dossierId: z.string().uuid(),
  mode: z.enum(["apprenant", "rh"]),
});

/**
 * L'apprenant déclare, depuis son espace, que la demande de prise en charge a été
 * déposée sur l'espace OPCO de son entreprise (par lui-même ou via son service RH).
 * Le rattachement de l'apprenant au dossier est vérifié côté serveur — même logique
 * de sécurité que les policies `envois_apprenant_*` sur `document_envois` — avant
 * d'écrire l'indicateur, de faire évoluer le statut CRM et de notifier le formateur.
 */
export const declarerDemandeFinancementDeposee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }) => {
    const email = String(context.claims?.["email"] ?? "").toLowerCase();

    // Rattachement de l'apprenant au dossier, lu avec ses propres droits (RLS).
    const { data: lien, error: lienError } = await context.supabase
      .from("dossier_apprenants")
      .select("id")
      .eq("dossier_id", data.dossierId)
      .or(`user_id.eq.${context.userId}${email ? `,email.ilike.${email}` : ""}`)
      .maybeSingle();
    if (lienError) throw new Error("Vérification du dossier impossible.");
    if (!lien) throw new Error("Ce dossier n'est pas rattaché à votre compte.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: dossier, error } = await supabaseAdmin
      .from("dossiers")
      .select(
        "id, formateur_id, statut_crm, titre_formation, entreprise_nom, demande_financement_deposee",
      )
      .eq("id", data.dossierId)
      .maybeSingle();
    if (error || !dossier) throw new Error("Dossier introuvable.");

    const dejaDeposee = Boolean(dossier.demande_financement_deposee);
    const passeEnDemande = !dejaDeposee && dossier.statut_crm === "dossier_valide";

    const { error: updateError } = await supabaseAdmin
      .from("dossiers")
      .update({
        demande_financement_deposee: true,
        demande_financement_mode: data.mode,
        ...(passeEnDemande ? { statut_crm: "demande_financement" as const } : {}),
      })
      .eq("id", data.dossierId);
    if (updateError) throw new Error("Enregistrement impossible.");

    const parQui =
      data.mode === "rh" ? "par le service RH de l'entreprise" : "par l'apprenant lui-même";

    if (passeEnDemande) {
      await supabaseAdmin.from("dossier_historique").insert({
        dossier_id: data.dossierId,
        ancien_statut: dossier.statut_crm,
        nouveau_statut: "demande_financement",
        auteur_id: context.userId,
        commentaire: `Demande de prise en charge déposée sur l'espace OPCO ${parQui}.`,
      });
    }


    await supabaseAdmin.from("notifications").insert({
      user_id: dossier.formateur_id,
      titre: "Demande de financement déposée",
      message: `La demande de prise en charge du dossier « ${dossier.titre_formation ?? dossier.entreprise_nom ?? "formation"} » a été déposée sur l'espace OPCO ${parQui}.`,
      lien: `/espace/dossiers/${dossier.id}`,
    });

    return { ok: true as const, statutCrm: passeEnDemande ? "demande_financement" : dossier.statut_crm };
  });
