import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DOCUMENTS } from "@/lib/dossier/html";
import { mergeDonnees, nomRangement } from "@/lib/dossier/types";

/** Pièces transmises ensemble pour constituer la demande de financement. */
export const CODES_FINANCEMENT = ["1A", "2", "1C"];

const groupeSchema = z.object({
  dossierId: z.string().uuid(),
  apprenantId: z.string().uuid(),
});

/**
 * Envoi groupé des pièces de financement (1A Convention, 2 Planning, 1C Programme) :
 * génération PDF, archivage Drive + Storage, une ligne `document_envois` par pièce
 * et un seul e-mail récapitulatif à l'apprenant.
 */
export const envoyerDocumentsFinancement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => groupeSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: dossier, error } = await context.supabase
      .from("dossiers")
      .select(
        "id, formateur_id, donnees, dossier_nom, titre_formation, entreprise_nom, drive_folder_id",
      )
      .eq("id", data.dossierId)
      .maybeSingle();
    if (error || !dossier) throw new Error("Dossier introuvable.");
    if (dossier.formateur_id !== context.userId) throw new Error("Dossier non autorisé.");

    const { data: apprenant } = await context.supabase
      .from("dossier_apprenants")
      .select("id, prenom, nom, email")
      .eq("id", data.apprenantId)
      .maybeSingle();
    if (!apprenant) throw new Error("Apprenant introuvable.");

    const donnees = mergeDonnees(dossier.donnees);
    const apprenantLabel = `${apprenant.prenom} ${apprenant.nom}`.trim() || apprenant.email;
    const dossierLabel =
      dossier.dossier_nom ||
      [dossier.entreprise_nom, dossier.titre_formation].filter(Boolean).join(" - ") ||
      `Dossier ${dossier.id.slice(0, 8)}`;

    const { uploadToFolder, ensureDossierTree, folderUrl } = await import("@/lib/drive.server");
    const { htmlToPdfAvecRepli } = await import("@/lib/pdf-repli.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { dossierFolderId, targetFolderId } = await ensureDossierTree(
      dossierLabel,
      apprenantLabel,
    );

    const base = nomRangement(
      apprenantLabel,
      donnees.formation.titre || dossier.titre_formation || "Formation",
      donnees.formation.dateFin || donnees.formation.dateDebut || "",
    );

    const envoyees: string[] = [];
    for (const code of CODES_FINANCEMENT) {
      const doc = DOCUMENTS.find((d) => d.code === code);
      if (!doc) continue;
      const html = doc.build(donnees);
      const fileName = `${code}_${base}.pdf`;
      const pdf = await htmlToPdfAvecRepli(html, fileName);
      const uploaded = await uploadToFolder(fileName, "application/pdf", pdf, targetFolderId);
      const storagePath = `${dossier.formateur_id}/${dossier.id}/a-signer/${fileName}`;
      await supabaseAdmin.storage
        .from("documents")
        .upload(storagePath, pdf, { contentType: "application/pdf", upsert: true });

      await supabaseAdmin.from("document_envois").insert({
        dossier_id: dossier.id,
        apprenant_id: apprenant.id,
        formateur_id: dossier.formateur_id,
        code,
        label: doc.label,
        contenu_html: html,
        statut: "envoye",
        fichier_url: storagePath,
        drive_file_id: uploaded.id,
        drive_url: uploaded.webViewLink ?? folderUrl(targetFolderId),
        nom_archive: fileName,
        sent_at: new Date().toISOString(),
      });
      envoyees.push(doc.label);
    }

    if (!dossier.drive_folder_id) {
      await context.supabase
        .from("dossiers")
        .update({ drive_folder_id: dossierFolderId, drive_folder_url: folderUrl(dossierFolderId) })
        .eq("id", dossier.id);
    }

    let email = false;
    if (apprenant.email) {
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      try {
        const result = await sendTemplateEmail("documents-financement", apprenant.email, {
          idempotencyKey: `documents-financement-${dossier.id}-${apprenant.id}-${Date.now()}`,
          templateData: {
            apprenantPrenom: apprenant.prenom,
            dossierLabel,
            formationIntitule: donnees.formation.titre || dossier.titre_formation || "",
            pieces: envoyees.join(", "),
          },
        });
        email = result.sent;
      } catch (mailError) {
        console.error("[email] documents de financement non envoyés", mailError);
      }
    }

    return { pieces: envoyees, email };
  });

const paiementSchema = z.object({ dossierId: z.string().uuid() });

/**
 * Passe le dossier en « Demande de paiement », journalise l'historique et invite
 * l'apprenant à déposer sa demande de paiement.
 */
export const demanderPaiement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => paiementSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: dossier, error } = await context.supabase
      .from("dossiers")
      .select("id, formateur_id, statut_crm, dossier_nom, entreprise_nom, titre_formation")
      .eq("id", data.dossierId)
      .maybeSingle();
    if (error || !dossier) throw new Error("Dossier introuvable.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    await supabaseAdmin
      .from("dossiers")
      .update({ statut_crm: "demande_paiement" })
      .eq("id", dossier.id);

    await supabaseAdmin.from("dossier_historique").insert({
      dossier_id: dossier.id,
      ancien_statut: dossier.statut_crm,
      nouveau_statut: "demande_paiement",
      auteur_id: context.userId,
      commentaire: "Dossier complet : demande de paiement déclenchée.",
    });

    const dossierLabel =
      dossier.dossier_nom ||
      [dossier.entreprise_nom, dossier.titre_formation].filter(Boolean).join(" - ") ||
      `Dossier ${dossier.id.slice(0, 8)}`;

    const { data: apprenants } = await supabaseAdmin
      .from("dossier_apprenants")
      .select("id, prenom, email")
      .eq("dossier_id", dossier.id);

    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    let envoyes = 0;
    for (const apprenant of apprenants ?? []) {
      if (!apprenant.email) continue;
      try {
        const result = await sendTemplateEmail("demande-paiement-apprenant", apprenant.email, {
          idempotencyKey: `demande-paiement-${dossier.id}-${apprenant.id}`,
          templateData: {
            apprenantPrenom: apprenant.prenom,
            dossierLabel,
            formationIntitule: dossier.titre_formation ?? "",
            lien: `https://skills4mation.com/apprenant`,
          },
        });
        if (result.sent) envoyes += 1;
      } catch (mailError) {
        console.error("[email] demande de paiement non envoyée", mailError);
      }
    }

    return { envoyes };
  });
