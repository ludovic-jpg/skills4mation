import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { mergeDonnees, nomRangement } from "@/lib/dossier/types";

const schema = z.object({ dossierId: z.string().uuid() });

/** Rôles autorisés à apposer la signature d'organisme. */
const ROLES_EQUIPE = ["conseillere", "super_admin", "admin"] as const;

/**
 * Appose la signature Skills4mation sur la convention (pièce 1A) d'un dossier :
 * empreinte SHA-256 du PDF, certificat récapitulatif archivé (Drive + Storage),
 * événement d'historique, puis passage du dossier en « dossier_valide ».
 *
 * Circuit parallèle à la signature apprenant (document_envois) : il ne la remplace pas.
 */
export const apposerSignatureOrganisme = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: roles, error: rolesError } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .in("role", ROLES_EQUIPE as unknown as string[]);
    if (rolesError) throw new Error("Vérification des droits impossible.");
    if (!roles || roles.length === 0)
      throw new Error("Accès réservé aux conseillères formation et super admins.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: dossier, error: dossierError } = await supabaseAdmin
      .from("dossiers")
      .select(
        "id, formateur_id, statut_crm, donnees, dossier_nom, entreprise_nom, titre_formation, drive_folder_id, signature_organisme_date",
      )
      .eq("id", data.dossierId)
      .maybeSingle();
    if (dossierError || !dossier) throw new Error("Dossier introuvable.");
    if (dossier.signature_organisme_date)
      throw new Error("La signature Skills4mation a déjà été apposée sur ce dossier.");

    const { data: signataireProfil } = await supabaseAdmin
      .from("profiles")
      .select("prenom, nom, email")
      .eq("id", context.userId)
      .maybeSingle();
    const signataire =
      `${signataireProfil?.prenom ?? ""} ${signataireProfil?.nom ?? ""}`.trim() ||
      signataireProfil?.email ||
      "Équipe Skills4mation";

    const donnees = mergeDonnees(dossier.donnees);
    const dossierLabel =
      dossier.dossier_nom ||
      [dossier.entreprise_nom, dossier.titre_formation].filter(Boolean).join(" - ") ||
      `Dossier ${dossier.id.slice(0, 8)}`;
    const base = nomRangement(
      donnees.entreprise.nom || dossier.entreprise_nom || "Entreprise",
      donnees.formation.titre || dossier.titre_formation || "Formation",
      donnees.formation.dateDebut || "",
    );

    // PDF de la convention (pièce 1A) tel que généré pour le dossier.
    const { conventionHtml } = await import("@/lib/dossier/render");
    const { htmlToPdfAvecRepli } = await import("@/lib/pdf-repli.server");
    const conventionNom = `1A_${base}.pdf`;
    const conventionPdf = await htmlToPdfAvecRepli(conventionHtml(donnees), conventionNom);

    const { sha256Hex, certificatSignatureHtml, certificatFileName } = await import(
      "@/lib/dossier/signature"
    );
    const hash = await sha256Hex(conventionPdf);
    const signatureDate = new Date().toISOString();

    const certificatNom = certificatFileName(`1A_${base}_SIGNATURE_ORGANISME`);
    const certificatHtml = certificatSignatureHtml({
      code: "1A",
      label: "Convention de formation — signature Skills4mation",
      signataire,
      email: signataireProfil?.email ?? null,
      signatureUserId: context.userId,
      signatureDate,
      hash,
      fichierNom: conventionNom,
      dossierLabel,
    });
    const certificatPdf = await htmlToPdfAvecRepli(certificatHtml, certificatNom);

    // Archivage Google Drive à côté des autres pièces du dossier.
    let driveUrl: string | null = null;
    let dossierFolderId: string | null = null;
    try {
      const { uploadToFolder, ensureDossierTree, folderUrl } = await import("@/lib/drive.server");
      const tree = await ensureDossierTree(dossierLabel);
      dossierFolderId = tree.dossierFolderId;
      await uploadToFolder(conventionNom, "application/pdf", conventionPdf, tree.targetFolderId);
      const uploaded = await uploadToFolder(
        certificatNom,
        "application/pdf",
        certificatPdf,
        tree.targetFolderId,
      );
      driveUrl = uploaded.webViewLink ?? folderUrl(tree.targetFolderId);
    } catch (driveError) {
      console.error("[drive] archivage de la signature organisme impossible", driveError);
    }

    const prefixe = `${dossier.formateur_id}/${dossier.id}/organisme`;
    await supabaseAdmin.storage
      .from("documents")
      .upload(`${prefixe}/${conventionNom}`, conventionPdf, {
        contentType: "application/pdf",
        upsert: true,
      });
    const certificatPath = `${prefixe}/${certificatNom}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("documents")
      .upload(certificatPath, certificatPdf, {
        contentType: "application/pdf",
        upsert: true,
      });
    if (uploadError) throw new Error("Archivage du certificat impossible.");

    const { error: updateError } = await supabaseAdmin
      .from("dossiers")
      .update({
        statut_crm: "dossier_valide",
        signature_organisme_date: signatureDate,
        signature_organisme_par: signataire,
        signature_organisme_user_id: context.userId,
        signature_organisme_hash: hash,
        signature_organisme_certificat_url: certificatPath,
        signature_organisme_certificat_drive_url: driveUrl,
        ...(dossier.drive_folder_id || !dossierFolderId
          ? {}
          : { drive_folder_id: dossierFolderId }),
      })
      .eq("id", dossier.id);
    if (updateError) throw new Error("Mise à jour du dossier impossible.");

    await supabaseAdmin.from("dossier_historique").insert({
      dossier_id: dossier.id,
      ancien_statut: dossier.statut_crm,
      nouveau_statut: "dossier_valide",
      auteur_id: context.userId,
      commentaire: `Signature Skills4mation apposée par ${signataire} (empreinte SHA-256 : ${hash.slice(0, 16)}…).`,
    });

    await supabaseAdmin.from("notifications").insert({
      user_id: dossier.formateur_id,
      titre: "Signature Skills4mation apposée",
      message: `${signataire} a validé et signé la convention de « ${dossierLabel} ». Le certificat de signature est archivé au dossier.`,
      lien: `/espace/dossiers/${dossier.id}`,
    });

    return { hash, signatureDate, certificatNom, certificatPath, driveUrl };
  });
