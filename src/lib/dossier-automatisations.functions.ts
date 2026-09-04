import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { mergeDonnees, nomRangement } from "@/lib/dossier/types";

const schema = z.object({ dossierId: z.string().uuid() });

/**
 * Déclenche les automatisations documentaires du dossier (convocations 3A,
 * ordre de mission F0C à l'accord de financement, attestation 1B dès
 * l'émargement complété). Idempotente : appelable à chaque changement d'étape.
 */
export const declencherAutomatisations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }) => {
    // RLS : l'appelant doit pouvoir lire le dossier (formateur propriétaire ou équipe).
    const { data: visible } = await context.supabase
      .from("dossiers")
      .select("id")
      .eq("id", data.dossierId)
      .maybeSingle();
    if (!visible) throw new Error("Dossier introuvable.");

    const { automatiserDossier } = await import("@/lib/automatisations.server");
    return automatiserDossier(data.dossierId);
  });

/**
 * Signature de l'ordre de mission (F0C) par le formateur : consentement explicite,
 * empreinte SHA-256 du PDF, horodatage et certificat de preuve archivé
 * (Storage + Drive) — même mécanisme que la signature de la convention.
 */
export const signerOrdreMission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    schema.extend({ consentement: z.literal(true) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: dossier } = await context.supabase
      .from("dossiers")
      .select("id, formateur_id, donnees, dossier_nom, entreprise_nom, titre_formation")
      .eq("id", data.dossierId)
      .maybeSingle();
    if (!dossier) throw new Error("Dossier introuvable.");
    if (dossier.formateur_id !== context.userId)
      throw new Error("Seul le formateur du dossier peut signer son ordre de mission.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: envoi } = await supabaseAdmin
      .from("document_envois")
      .select("id, signature_date, contenu_html")
      .eq("dossier_id", dossier.id)
      .eq("code", "F0C")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!envoi) throw new Error("Aucun ordre de mission n'a encore été généré pour ce dossier.");
    if (envoi.signature_date) throw new Error("Cet ordre de mission est déjà signé.");

    const donnees = mergeDonnees(dossier.donnees);
    const dossierLabel =
      dossier.dossier_nom ||
      [dossier.entreprise_nom, dossier.titre_formation].filter(Boolean).join(" - ") ||
      `Dossier ${dossier.id.slice(0, 8)}`;
    const base = nomRangement(
      `${donnees.formateur.prenom} ${donnees.formateur.nom}`.trim() || "Formateur",
      donnees.formation.titre || dossier.titre_formation || "Formation",
      donnees.formation.dateDebut || "",
    );

    const { DOCUMENTS } = await import("@/lib/dossier/html");
    const html = envoi.contenu_html ?? DOCUMENTS.find((d) => d.code === "F0C")?.build(donnees) ?? "";
    const { htmlToPdfAvecRepli } = await import("@/lib/pdf-repli.server");
    const nom = `F0C_${base}_SIGNE.pdf`;
    const pdf = await htmlToPdfAvecRepli(html, nom);

    const { sha256Hex, certificatSignatureHtml, certificatFileName } = await import(
      "@/lib/dossier/signature"
    );
    const hash = await sha256Hex(pdf);
    const signatureDate = new Date().toISOString();

    const { data: profil } = await supabaseAdmin
      .from("profiles")
      .select("prenom, nom, email")
      .eq("id", context.userId)
      .maybeSingle();
    const signataire =
      `${profil?.prenom ?? ""} ${profil?.nom ?? ""}`.trim() || profil?.email || "Formateur";

    const certificatNom = certificatFileName(`F0C_${base}`);
    const certificatPdf = await htmlToPdfAvecRepli(
      certificatSignatureHtml({
        code: "F0C",
        label: "Ordre de mission formateur",
        signataire,
        email: profil?.email ?? null,
        signatureUserId: context.userId,
        signatureDate,
        hash,
        fichierNom: nom,
        dossierLabel,
      }),
      certificatNom,
    );

    const prefixe = `${dossier.formateur_id}/${dossier.id}/a-signer`;
    await supabaseAdmin.storage.from("documents").upload(`${prefixe}/${nom}`, pdf, {
      contentType: "application/pdf",
      upsert: true,
    });
    const certificatPath = `${prefixe}/${certificatNom}`;
    await supabaseAdmin.storage.from("documents").upload(certificatPath, certificatPdf, {
      contentType: "application/pdf",
      upsert: true,
    });

    let certificatDriveUrl: string | null = null;
    try {
      const { ensureDossierTree, uploadToFolder, folderUrl } = await import("@/lib/drive.server");
      const tree = await ensureDossierTree(dossierLabel);
      await uploadToFolder(nom, "application/pdf", pdf, tree.targetFolderId);
      const uploaded = await uploadToFolder(
        certificatNom,
        "application/pdf",
        certificatPdf,
        tree.targetFolderId,
      );
      certificatDriveUrl = uploaded.webViewLink ?? folderUrl(tree.targetFolderId);
    } catch (error) {
      console.error("[F0C] archivage Drive impossible", error);
    }

    await supabaseAdmin
      .from("document_envois")
      .update({
        statut: "archive",
        fichier_url: `${prefixe}/${nom}`,
        nom_archive: nom,
        received_at: signatureDate,
        signature_consentement: true,
        signature_date: signatureDate,
        signature_hash: hash,
        signature_user_id: context.userId,
        certificat_url: certificatPath,
        certificat_drive_url: certificatDriveUrl,
      })
      .eq("id", envoi.id);

    await supabaseAdmin.from("dossier_pieces").upsert(
      {
        dossier_id: dossier.id,
        formateur_id: dossier.formateur_id,
        code: "F0C",
        statut: "complete",
        fichier_url: `${prefixe}/${nom}`,
        generated_at: signatureDate,
      },
      { onConflict: "dossier_id,code" },
    );

    return { hash, signatureDate, certificatPath, certificatDriveUrl };
  });
