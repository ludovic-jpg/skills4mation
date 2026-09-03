import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const CODE_RELANCE_FINANCEMENT = "relance_demande_financement";

const schema = z.object({ dossierId: z.string().uuid() });

/**
 * Envoie à chaque apprenant du dossier l'e-mail lui demandant de déposer sa demande
 * de financement, puis journalise l'envoi dans `document_envois`.
 * Déclenché automatiquement au passage en « Dossier validé » et rejouable manuellement.
 */
export const envoyerRelanceFinancement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }) => {
    // La lecture passe par RLS : seul le formateur propriétaire ou l'équipe voit le dossier.
    const { data: dossier, error } = await context.supabase
      .from("dossiers")
      .select("id, formateur_id, dossier_nom, titre_formation, entreprise_nom, date_debut")
      .eq("id", data.dossierId)
      .maybeSingle();
    if (error || !dossier) throw new Error("Dossier introuvable.");

    const { data: apprenants } = await context.supabase
      .from("dossier_apprenants")
      .select("id, prenom, nom, email")
      .eq("dossier_id", dossier.id);

    const cibles = (apprenants ?? []).filter((a) => Boolean(a.email));
    if (cibles.length === 0) {
      return { envoyes: 0, supprimes: 0, message: "Aucun apprenant avec e-mail sur ce dossier." };
    }

    const { data: formateur } = await context.supabase
      .from("profiles")
      .select("prenom, nom")
      .eq("id", dossier.formateur_id)
      .maybeSingle();

    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const dossierLabel =
      dossier.dossier_nom ||
      [dossier.entreprise_nom, dossier.titre_formation].filter(Boolean).join(" - ") ||
      `Dossier ${dossier.id.slice(0, 8)}`;

    let envoyes = 0;
    let supprimes = 0;

    for (const apprenant of cibles) {
      const result = await sendTemplateEmail("relance-demande-financement", apprenant.email, {
        templateData: {
          apprenantPrenom: apprenant.prenom,
          dossierLabel,
          formationIntitule: dossier.titre_formation ?? "",
          dateDebut: dossier.date_debut
            ? new Date(dossier.date_debut).toLocaleDateString("fr-FR")
            : "",
          formateurNom: `${formateur?.prenom ?? ""} ${formateur?.nom ?? ""}`.trim(),
        },
        idempotencyKey: `${CODE_RELANCE_FINANCEMENT}-${dossier.id}-${apprenant.id}-${new Date().toISOString().slice(0, 13)}`,
      });

      if (result.sent) envoyes += 1;
      else supprimes += 1;

      await supabaseAdmin.from("document_envois").insert({
        dossier_id: dossier.id,
        apprenant_id: apprenant.id,
        formateur_id: dossier.formateur_id,
        code: CODE_RELANCE_FINANCEMENT,
        label: "Relance : déposer la demande de financement",
        statut: result.sent ? "envoye" : "non_delivre",
        sent_at: new Date().toISOString(),
      });
    }

    return { envoyes, supprimes, message: null as string | null };
  });
