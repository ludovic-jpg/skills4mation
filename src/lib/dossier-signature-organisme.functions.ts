import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { mergeDonnees, nomRangement } from "@/lib/dossier/types";
import { assertConseillerFormation } from "@/lib/roles-guard";

const schema = z.object({ dossierId: z.string().uuid() });


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
    await assertConseillerFormation(context.supabase, context.userId);

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
    let renduDegrade = false;
    const marquerDegrade = () => {
      renduDegrade = true;
    };
    const conventionPdf = await htmlToPdfAvecRepli(conventionHtml(donnees), conventionNom, {
      onDegrade: marquerDegrade,
    });

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
    const certificatPdf = await htmlToPdfAvecRepli(certificatHtml, certificatNom, {
      onDegrade: marquerDegrade,
    });

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
        signature_organisme_rendu_degrade: renduDegrade,
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

    /* ------------------ Demande de financement automatique ------------------ */

    // Mode brut : `mergeDonnees` retombe sur "opco" par défaut, on ne veut pas
    // envoyer d'e-mail si la conseillère n'a rien de renseigné dans le dossier.
    const modeBrut = (dossier.donnees as { tarifs?: { modeFinancement?: string } } | null)?.tarifs
      ?.modeFinancement;
    const { data: formateur } = await supabaseAdmin
      .from("profiles")
      .select("prenom, nom, email")
      .eq("id", dossier.formateur_id)
      .maybeSingle();

    const { euros } = await import("@/lib/dossier/types");
    const montant = euros(donnees.tarifs.prixTotal || donnees.tarifs.montantPrisEnCharge);
    const coutCertification = donnees.tarifs.coutCertification
      ? euros(donnees.tarifs.coutCertification)
      : "";

    let financement: {
      mode: string | null;
      envoye: boolean;
      raison?: string;
      message: string;
    } = {
      mode: modeBrut ?? null,
      envoye: false,
      message: "",
    };
    /** Lien moncompteformation retenu (mode CPF), journalisé pour le suivi admin. */
    let lienCpf: string | null = null;

    const notifier = async (titre: string, message: string) => {
      await supabaseAdmin.from("notifications").insert({
        user_id: dossier.formateur_id,
        titre,
        message,
        lien: `/espace/dossiers/${dossier.id}`,
      });
    };

    if (!modeBrut) {
      financement = {
        mode: null,
        envoye: false,
        raison: "mode_absent",
        message:
          "Aucun mode de financement n'est renseigné sur ce dossier : aucune demande de financement n'a été envoyée au formateur.",
      };
      await notifier(
        "Mode de financement manquant",
        `Le dossier « ${dossierLabel} » est validé mais aucun mode de financement n'est renseigné : la demande de financement n'a pas pu être transmise.`,
      );
    } else if (!formateur?.email) {
      financement = {
        mode: modeBrut,
        envoye: false,
        raison: "email_absent",
        message:
          "Le formateur n'a pas d'adresse e-mail dans son profil : la demande de financement n'a pas pu être envoyée.",
      };
    } else if (modeBrut === "fonds_propres") {
      financement = {
        mode: modeBrut,
        envoye: false,
        raison: "fonds_propres",
        message:
          "Financement sur fonds propres : aucun e-mail automatique, une notification interne a été envoyée au formateur.",
      };
      await notifier(
        "Dossier validé — financement sur fonds propres",
        `Le dossier « ${dossierLabel} » est validé. Aucune demande de financement externe n'est requise (fonds propres).`,
      );
    } else {
      try {
        const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
        if (modeBrut === "cpf") {
          const duree = Number(String(donnees.formation.heuresTotal).replace(",", "."));
          const { data: tarif } = await supabaseAdmin
            .from("tarifs_cpf")
            .select("intitule, duree_heures, prix_euros, url_moncompteformation")
            .ilike("intitule", donnees.formation.titre || "")
            .eq("duree_heures", Number.isFinite(duree) ? Math.round(duree) : -1)
            .maybeSingle();
          lienCpf = tarif?.url_moncompteformation ?? null;


          await sendTemplateEmail("demande-financement-cpf", formateur.email, {
            idempotencyKey: `financement-cpf-${dossier.id}`,
            templateData: {
              formateurPrenom: formateur.prenom ?? "",
              apprenantNom: donnees.apprenants[0]?.nom || "l'apprenant",
              dossierLabel,
              formationIntitule: donnees.formation.titre,
              dureeHeures: donnees.formation.heuresTotal,
              prixCpf: tarif?.prix_euros ? euros(String(tarif.prix_euros)) : montant,
              coutCertification,
              lienMonCompteFormation: tarif?.url_moncompteformation ?? "",
              lien: `https://skills4mation.com/espace/dossiers/${dossier.id}`,
            },
          });
          financement = {
            mode: modeBrut,
            envoye: true,
            message: tarif?.url_moncompteformation
              ? "Demande de financement CPF envoyée au formateur avec le lien moncompteformation."
              : "Demande de financement CPF envoyée, mais aucun lien moncompteformation ne correspond à cette formation et cette durée.",
          };
        } else {
          await sendTemplateEmail("demande-financement-opco", formateur.email, {
            idempotencyKey: `financement-opco-${dossier.id}`,
            templateData: {
              formateurPrenom: formateur.prenom ?? "",
              entrepriseNom: donnees.entreprise.nom || dossier.entreprise_nom || "",
              dossierLabel,
              montant,
              coutCertification,
              opco: donnees.tarifs.opco,
              pieces: [
                { label: `Convention signée (${conventionNom})`, url: driveUrl ?? undefined },
                { label: `Certificat de signature (${certificatNom})`, url: driveUrl ?? undefined },
              ],
              lien: `https://skills4mation.com/espace/dossiers/${dossier.id}`,
            },
          });
          financement = {
            mode: modeBrut,
            envoye: true,
            message: "Demande de financement OPCO envoyée au formateur.",
          };
        }

        await notifier(
          "Demande de financement transmise",
          `Votre demande de financement (${modeBrut === "cpf" ? "CPF" : "OPCO"}) pour « ${dossierLabel} » a été transmise par e-mail.`,
        );
      } catch (mailError) {
        console.error("[email] demande de financement non envoyée", mailError);
        financement = {
          mode: modeBrut,
          envoye: false,
          raison: "erreur_envoi",
          message:
            "La signature est enregistrée mais l'envoi de la demande de financement a échoué : relancez-la manuellement.",
        };
      }
    }

    // Traçabilité : chaque demande de financement transmise est journalisée pour
    // l'écran admin de suivi (OPCO / CPF) — statut et date d'envoi.
    const nombre = (v: string) => {
      const n = Number(String(v ?? "").replace(/\s/g, "").replace(",", "."));
      return Number.isFinite(n) && n > 0 ? n : null;
    };
    const { error: suiviError } = await supabaseAdmin.from("demandes_financement").insert({
      dossier_id: dossier.id,
      formateur_id: dossier.formateur_id,
      mode: financement.mode,
      montant: nombre(donnees.tarifs.prixTotal || donnees.tarifs.montantPrisEnCharge),
      cout_certification: nombre(donnees.tarifs.coutCertification),
      destinataire_email: formateur?.email ?? null,
      lien_moncompteformation: lienCpf,
      statut: financement.envoye ? "envoyee" : (financement.raison ?? "non_envoyee"),
      message: financement.message,
      envoye_le: financement.envoye ? new Date().toISOString() : null,
    });
    if (suiviError) console.error("[financement] journalisation impossible", suiviError);

    return {
      hash,
      signatureDate,
      certificatNom,
      certificatPath,
      driveUrl,
      financement,
      renduDegrade,
    };
  });
