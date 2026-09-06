import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertConseillerFormation } from "@/lib/roles-guard";

const schema = z.object({
  dossierId: z.string().uuid(),
  motif: z.string().trim().min(10, "Merci d'indiquer un motif de refus détaillé."),
});

/**
 * Refus d'un dossier par un conseiller formation : le dossier passe au statut
 * `refuse` (« Dossier refusé / annulé » du pipeline CRM), le motif est tracé dans
 * `dossier_historique` et dans `commentaire_admin`, puis le formateur est notifié
 * par e-mail et dans l'application.
 */
export const refuserDossier = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }) => {
    await assertConseillerFormation(context.supabase, context.userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: dossier, error } = await supabaseAdmin
      .from("dossiers")
      .select("id, formateur_id, statut_crm, dossier_nom, entreprise_nom, titre_formation")
      .eq("id", data.dossierId)
      .maybeSingle();
    if (error || !dossier) throw new Error("Dossier introuvable.");

    const { data: auteurProfil } = await supabaseAdmin
      .from("profiles")
      .select("prenom, nom, email")
      .eq("id", context.userId)
      .maybeSingle();
    const auteur =
      `${auteurProfil?.prenom ?? ""} ${auteurProfil?.nom ?? ""}`.trim() ||
      auteurProfil?.email ||
      "Équipe Skills4mation";

    const dossierLabel =
      dossier.dossier_nom ||
      [dossier.entreprise_nom, dossier.titre_formation].filter(Boolean).join(" - ") ||
      `Dossier ${dossier.id.slice(0, 8)}`;

    const { error: updateError } = await supabaseAdmin
      .from("dossiers")
      .update({ statut_crm: "refuse", commentaire_admin: data.motif })
      .eq("id", dossier.id);
    if (updateError) throw new Error("Enregistrement du refus impossible.");

    await supabaseAdmin.from("dossier_historique").insert({
      dossier_id: dossier.id,
      ancien_statut: dossier.statut_crm,
      nouveau_statut: "refuse",
      auteur_id: context.userId,
      commentaire: `Dossier refusé par ${auteur} — motif : ${data.motif}`,
    });

    await supabaseAdmin.from("notifications").insert({
      user_id: dossier.formateur_id,
      titre: "Dossier refusé",
      message: `${auteur} a refusé « ${dossierLabel} ». Motif : ${data.motif}`,
      lien: `/espace/dossiers/${dossier.id}`,
    });

    const { data: formateur } = await supabaseAdmin
      .from("profiles")
      .select("prenom, nom, email")
      .eq("id", dossier.formateur_id)
      .maybeSingle();

    let emailEnvoye = false;
    if (formateur?.email) {
      try {
        const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
        const result = await sendTemplateEmail("dossier-refuse", formateur.email, {
          templateData: {
            formateurPrenom: formateur.prenom ?? "",
            dossierLabel,
            formationIntitule: dossier.titre_formation ?? "",
            motif: data.motif,
            auteur,
            lien: `https://skills4mation.com/espace/dossiers/${dossier.id}`,
          },
          idempotencyKey: `dossier-refuse-${dossier.id}`,
        });
        emailEnvoye = result.sent;
      } catch (mailError) {
        console.error("[refus] échec d'envoi de l'e-mail", formateur.email, mailError);
      }
    }

    return { ok: true as const, emailEnvoye, dossierLabel };
  });
