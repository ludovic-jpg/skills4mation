import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { mergeDonnees, nomRangement } from "@/lib/dossier/types";

const envoiSchema = z.object({
  dossierId: z.string().uuid(),
  apprenantId: z.string().uuid(),
  code: z.string().min(1).max(12),
  label: z.string().min(1).max(160),
  contenuHtml: z.string().min(1),
});

/**
 * Génère le PDF d'un document, l'archive dans Google Drive et dans le dossier CRM,
 * puis crée l'envoi à signer pour l'apprenant.
 */
export const envoyerDocumentApprenant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => envoiSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: dossier, error: dossierError } = await context.supabase
      .from("dossiers")
      .select("id, formateur_id, donnees, dossier_nom, titre_formation, entreprise_nom, drive_folder_id")
      .eq("id", data.dossierId)
      .maybeSingle();
    if (dossierError || !dossier) throw new Error("Dossier introuvable.");
    if (dossier.formateur_id !== context.userId) throw new Error("Dossier non autorisé.");

    const { data: apprenant, error: apprenantError } = await context.supabase
      .from("dossier_apprenants")
      .select("id, prenom, nom, email")
      .eq("id", data.apprenantId)
      .maybeSingle();
    if (apprenantError || !apprenant) throw new Error("Apprenant introuvable.");

    const donnees = mergeDonnees(dossier.donnees);
    const apprenantLabel = `${apprenant.prenom} ${apprenant.nom}`.trim() || apprenant.email;
    const base = nomRangement(
      apprenantLabel,
      donnees.formation.titre || dossier.titre_formation || "Formation",
      donnees.formation.dateFin || donnees.formation.dateDebut || "",
    );
    const fileName = `${data.code}_${base}.pdf`;

    const { uploadToFolder, ensureDossierTree, folderUrl } = await import("@/lib/drive.server");
    const { htmlToPdfAvecRepli } = await import("@/lib/pdf-repli.server");
    const pdf = await htmlToPdfAvecRepli(data.contenuHtml, fileName);

    const dossierLabel =
      dossier.dossier_nom ||
      [dossier.entreprise_nom, dossier.titre_formation].filter(Boolean).join(" - ") ||
      `Dossier ${dossier.id.slice(0, 8)}`;
    const { dossierFolderId, targetFolderId } = await ensureDossierTree(dossierLabel, apprenantLabel);
    const uploaded = await uploadToFolder(fileName, "application/pdf", pdf, targetFolderId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const storagePath = `${dossier.formateur_id}/${dossier.id}/a-signer/${fileName}`;
    await supabaseAdmin.storage
      .from("documents")
      .upload(storagePath, pdf, { contentType: "application/pdf", upsert: true });

    if (!dossier.drive_folder_id) {
      await context.supabase
        .from("dossiers")
        .update({ drive_folder_id: dossierFolderId, drive_folder_url: folderUrl(dossierFolderId) })
        .eq("id", dossier.id);
    }

    const { data: envoi, error: insertError } = await context.supabase
      .from("document_envois")
      .insert({
        dossier_id: dossier.id,
        apprenant_id: apprenant.id,
        formateur_id: context.userId,
        code: data.code,
        label: data.label,
        contenu_html: data.contenuHtml,
        statut: "envoye",
        fichier_url: storagePath,
        drive_file_id: uploaded.id,
        drive_url: uploaded.webViewLink ?? folderUrl(targetFolderId),
        nom_archive: fileName,
        sent_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (insertError) throw new Error("Enregistrement de l'envoi impossible.");

    if (apprenant.email) {
      await supabaseAdmin.from("notifications").insert({
        user_id: context.userId,
        titre: `Document ${data.code} transmis`,
        message: `« ${data.label} » a été transmis à ${apprenantLabel} et archivé dans Google Drive.`,
        lien: `/espace/dossiers/${dossier.id}`,
      });
    }

    return { envoiId: envoi.id, fileName, driveUrl: uploaded.webViewLink ?? folderUrl(targetFolderId) };
  });

const reponseSchema = z.object({
  envoiId: z.string().uuid(),
  consentement: z.literal(true),
  hash: z.string().regex(/^[0-9a-f]{64}$/),
  signatureDate: z.string().min(10),
});

/**
 * Enregistre la preuve de signature électronique, archive le document signé et son
 * certificat récapitulatif dans Google Drive, puis notifie le formateur.
 */
export const archiverReponseApprenant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => reponseSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: envoi, error } = await context.supabase
      .from("document_envois")
      .select(
        "id, dossier_id, formateur_id, code, label, reponse_url, reponse_nom, nom_archive, apprenant_id",
      )
      .eq("id", data.envoiId)
      .maybeSingle();
    if (error || !envoi) throw new Error("Document introuvable.");
    if (!envoi.reponse_url) throw new Error("Aucun fichier signé déposé.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: file, error: dlError } = await supabaseAdmin.storage
      .from("documents")
      .download(envoi.reponse_url);
    if (dlError || !file) throw new Error("Fichier signé illisible.");

    const { data: dossier } = await supabaseAdmin
      .from("dossiers")
      .select("id, dossier_nom, entreprise_nom, titre_formation")
      .eq("id", envoi.dossier_id)
      .maybeSingle();
    const { data: apprenant } = await supabaseAdmin
      .from("dossier_apprenants")
      .select("prenom, nom, email")
      .eq("id", envoi.apprenant_id ?? "")
      .maybeSingle();

    const apprenantLabel =
      `${apprenant?.prenom ?? ""} ${apprenant?.nom ?? ""}`.trim() || apprenant?.email || "Apprenant";
    const dossierLabel =
      dossier?.dossier_nom ||
      [dossier?.entreprise_nom, dossier?.titre_formation].filter(Boolean).join(" - ") ||
      `Dossier ${envoi.dossier_id.slice(0, 8)}`;

    const ext = (envoi.reponse_nom ?? envoi.reponse_url).split(".").pop() ?? "pdf";
    const baseName = (envoi.nom_archive ?? `${envoi.code}_${apprenantLabel}`).replace(/\.pdf$/i, "");
    const fileName = `${baseName}_SIGNE.${ext}`;

    const { uploadToFolder, ensureDossierTree, folderUrl } = await import("@/lib/drive.server");
    const { targetFolderId } = await ensureDossierTree(dossierLabel, apprenantLabel);
    const bytes = new Uint8Array(await file.arrayBuffer());

    // Empreinte recalculée côté serveur : la valeur cliente n'est jamais crue sur parole.
    const { sha256Hex, certificatSignatureHtml, certificatFileName } = await import(
      "@/lib/dossier/signature"
    );
    const hash = await sha256Hex(bytes);
    if (hash !== data.hash) throw new Error("L'empreinte du fichier déposé ne correspond pas.");

    const uploaded = await uploadToFolder(fileName, file.type || "application/pdf", bytes, targetFolderId);

    const signatureDate = new Date(data.signatureDate).toISOString();
    const certificatNom = certificatFileName(baseName);
    const certificatHtml = certificatSignatureHtml({
      code: envoi.code,
      label: envoi.label,
      signataire: apprenantLabel,
      email: apprenant?.email ?? null,
      signatureUserId: context.userId,
      signatureDate,
      hash,
      fichierNom: envoi.reponse_nom ?? fileName,
      dossierLabel,
    });

    const { htmlToPdfAvecRepli } = await import("@/lib/pdf-repli.server");
    const certificatPdf = await htmlToPdfAvecRepli(certificatHtml, certificatNom);
    const certificatUpload = await uploadToFolder(
      certificatNom,
      "application/pdf",
      certificatPdf,
      targetFolderId,
    );
    const certificatPath = `${envoi.formateur_id}/${envoi.dossier_id}/certificats/${certificatNom}`;
    await supabaseAdmin.storage
      .from("documents")
      .upload(certificatPath, certificatPdf, { contentType: "application/pdf", upsert: true });

    await supabaseAdmin
      .from("document_envois")
      .update({
        statut: "archive",
        received_at: new Date().toISOString(),
        drive_file_id: uploaded.id,
        drive_url: uploaded.webViewLink ?? folderUrl(targetFolderId),
        signature_consentement: true,
        signature_date: signatureDate,
        signature_hash: hash,
        signature_user_id: context.userId,
        certificat_url: certificatPath,
        certificat_drive_url: certificatUpload.webViewLink ?? folderUrl(targetFolderId),
      })
      .eq("id", envoi.id);

    await supabaseAdmin.from("notifications").insert({
      user_id: envoi.formateur_id,
      titre: `Document signé reçu : ${envoi.code}`,
      message: `${apprenantLabel} a signé électroniquement « ${envoi.label} ». Document et certificat de signature archivés dans Google Drive.`,
      lien: `/espace/dossiers/${envoi.dossier_id}`,
    });

    return {
      driveUrl: uploaded.webViewLink ?? folderUrl(targetFolderId),
      fileName,
      certificatNom,
      hash,
      signatureDate,
    };
  });

const syncSchema = z.object({ dossierId: z.string().uuid() });

/** Crée / met à jour les fiches apprenant du dossier à partir des données saisies. */
export const synchroniserApprenants = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => syncSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: dossier, error } = await context.supabase
      .from("dossiers")
      .select("id, formateur_id, donnees")
      .eq("id", data.dossierId)
      .maybeSingle();
    if (error || !dossier) throw new Error("Dossier introuvable.");
    if (dossier.formateur_id !== context.userId) throw new Error("Dossier non autorisé.");

    const donnees = mergeDonnees(dossier.donnees);
    const rows = donnees.apprenants
      .filter((a) => (a.email ?? "").includes("@"))
      .map((a) => {
        const parts = a.nom.trim().split(/\s+/);
        return {
          dossier_id: dossier.id,
          formateur_id: context.userId,
          email: (a.email ?? "").trim().toLowerCase(),
          prenom: parts.length > 1 ? parts.slice(0, -1).join(" ") : parts[0] ?? "",
          nom: parts.length > 1 ? (parts.at(-1) ?? "") : "",
          telephone: a.telephone ?? null,
        };
      });
    if (rows.length === 0) return { count: 0 };

    const { error: upsertError } = await context.supabase
      .from("dossier_apprenants")
      .upsert(rows, { onConflict: "dossier_id,email" });
    if (upsertError) throw new Error("Synchronisation des apprenants impossible.");
    return { count: rows.length };
  });
