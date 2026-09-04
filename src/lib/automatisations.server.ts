/**
 * Automatisations documentaires du dossier (server-only).
 * - 3A / F0C : générés et envoyés dès l'accord de financement ;
 * - 1B : attestation de réalisation envoyée dès que l'émargement F3 est complété ;
 * - F7 : satisfaction à froid envoyée 3 mois après la fin de la formation.
 * Chaque envoi est idempotent : la présence d'une ligne `document_envois` du même
 * code pour le même destinataire empêche toute régénération.
 */
import { CRM_PIPELINE, type CrmStatut } from "@/lib/crm";
import { mergeDonnees, nomRangement } from "@/lib/dossier/types";
import type { PieceStatut } from "@/lib/dossier/pieces";

const SITE = "https://skills4mation.com";

type Apprenant = { id: string; prenom: string; nom: string; email: string };

function apprenantLabel(a: Apprenant) {
  return `${a.prenom} ${a.nom}`.trim() || a.email;
}

function atteint(statut: CrmStatut | null, cible: CrmStatut) {
  if (!statut || statut === "refuse") return false;
  const rang = CRM_PIPELINE.indexOf(statut);
  return rang > -1 && rang >= CRM_PIPELINE.indexOf(cible);
}

/** Génère un PDF, l'archive (Storage + Drive) et retourne son chemin de stockage. */
async function produirePdf(input: {
  html: string;
  fileName: string;
  formateurId: string;
  dossierId: string;
  dossierLabel: string;
  sousDossier: string;
  apprenantLabel?: string;
}) {
  const { htmlToPdfAvecRepli } = await import("@/lib/pdf-repli.server");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const pdf = await htmlToPdfAvecRepli(input.html, input.fileName);
  const chemin = `${input.formateurId}/${input.dossierId}/${input.sousDossier}/${input.fileName}`;
  await supabaseAdmin.storage
    .from("documents")
    .upload(chemin, pdf, { contentType: "application/pdf", upsert: true });

  let driveUrl: string | null = null;
  let driveFileId: string | null = null;
  try {
    const { ensureDossierTree, uploadToFolder, folderUrl } = await import("@/lib/drive.server");
    const { targetFolderId } = await ensureDossierTree(input.dossierLabel, input.apprenantLabel);
    const uploaded = await uploadToFolder(
      input.fileName,
      "application/pdf",
      pdf,
      targetFolderId,
    );
    driveFileId = uploaded.id;
    driveUrl = uploaded.webViewLink ?? folderUrl(targetFolderId);
  } catch (error) {
    console.error(`[automatisations] Archivage Drive impossible pour ${input.fileName} :`, error);
  }
  return { chemin, driveUrl, driveFileId };
}

async function lienSigne(chemin: string, secondes = 60 * 60 * 24 * 7) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage.from("documents").createSignedUrl(chemin, secondes);
  return data?.signedUrl ?? `${SITE}/apprenant`;
}

async function envoyerEmail(
  template: string,
  to: string,
  idempotencyKey: string,
  templateData: Record<string, unknown>,
) {
  if (!to) return;
  try {
    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    await sendTemplateEmail(template, to, { idempotencyKey, templateData });
  } catch (error) {
    console.error(`[automatisations] E-mail ${template} non envoyé à ${to} :`, error);
  }
}

/**
 * Applique toutes les automatisations dues sur un dossier.
 * Sans effet si les conditions ne sont pas réunies : la fonction peut être
 * appelée à chaque changement d'étape et par la tâche quotidienne.
 */
export async function automatiserDossier(dossierId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { DOCUMENTS } = await import("@/lib/dossier/html");
  const actions: string[] = [];

  const { data: dossier } = await supabaseAdmin
    .from("dossiers")
    .select(
      "id, formateur_id, statut_crm, donnees, dossier_nom, entreprise_nom, titre_formation, date_debut, date_fin",
    )
    .eq("id", dossierId)
    .maybeSingle();
  if (!dossier) return { actions };

  const donnees = mergeDonnees(dossier.donnees);
  const dossierLabel =
    dossier.dossier_nom ||
    [dossier.entreprise_nom, dossier.titre_formation].filter(Boolean).join(" - ") ||
    `Dossier ${dossier.id.slice(0, 8)}`;
  const formationTitre = donnees.formation.titre || dossier.titre_formation || "Formation";
  const statut = dossier.statut_crm as CrmStatut;

  const { data: apprenantsRaw } = await supabaseAdmin
    .from("dossier_apprenants")
    .select("id, prenom, nom, email")
    .eq("dossier_id", dossier.id);
  const apprenants = (apprenantsRaw ?? []) as Apprenant[];

  const { data: envois } = await supabaseAdmin
    .from("document_envois")
    .select("code, apprenant_id")
    .eq("dossier_id", dossier.id);
  const dejaEnvoye = (code: string, apprenantId: string | null) =>
    (envois ?? []).some((e) => e.code === code && (e.apprenant_id ?? null) === apprenantId);

  const { data: pieces } = await supabaseAdmin
    .from("dossier_pieces")
    .select("code, statut")
    .eq("dossier_id", dossier.id);
  const pieceComplete = (code: string) =>
    (pieces ?? []).some((p) => p.code === code && p.statut === "complete");

  const doc = (code: string) => DOCUMENTS.find((d) => d.code === code);

  async function enregistrerEnvoi(input: {
    code: string;
    label: string;
    apprenantId: string | null;
    html: string;
    chemin: string;
    driveUrl: string | null;
    driveFileId: string | null;
    fileName: string;
  }) {
    await supabaseAdmin.from("document_envois").insert({
      dossier_id: dossier!.id,
      apprenant_id: input.apprenantId,
      formateur_id: dossier!.formateur_id,
      code: input.code,
      label: input.label,
      contenu_html: input.html,
      statut: "envoye",
      fichier_url: input.chemin,
      drive_file_id: input.driveFileId,
      drive_url: input.driveUrl,
      nom_archive: input.fileName,
      sent_at: new Date().toISOString(),
    });
  }

  async function majPiece(code: string, statutPiece: PieceStatut, chemin?: string) {
    await supabaseAdmin.from("dossier_pieces").upsert(
      {
        dossier_id: dossier!.id,
        formateur_id: dossier!.formateur_id,
        code,
        statut: statutPiece,
        generated_at: new Date().toISOString(),
        ...(chemin ? { fichier_url: chemin } : {}),
      },
      { onConflict: "dossier_id,code" },
    );
  }

  /* ---------- 3A : convocations, dès l'accord de financement ---------- */
  const def3A = doc("3A");
  if (def3A && atteint(statut, "accord_financement")) {
    for (const apprenant of apprenants) {
      if (dejaEnvoye("3A", apprenant.id)) continue;
      const label = apprenantLabel(apprenant);
      const base = nomRangement(label, formationTitre, donnees.formation.dateDebut || "");
      const fileName = `3A_${base}.pdf`;
      const html = def3A.build(donnees);
      const { chemin, driveUrl, driveFileId } = await produirePdf({
        html,
        fileName,
        formateurId: dossier.formateur_id,
        dossierId: dossier.id,
        dossierLabel,
        sousDossier: "convocations",
        apprenantLabel: label,
      });
      await enregistrerEnvoi({
        code: "3A",
        label: def3A.label,
        apprenantId: apprenant.id,
        html,
        chemin,
        driveUrl,
        driveFileId,
        fileName,
      });
      await envoyerEmail("convocation-stagiaire", apprenant.email, `3A-${apprenant.id}`, {
        apprenantNom: label,
        formationTitre,
        dateDebut: donnees.formation.dateDebut || dossier.date_debut || "",
        dateFin: donnees.formation.dateFin || dossier.date_fin || "",
        lieu: donnees.lieu.intitule || donnees.lieu.adresse || donnees.formation.lienConnexion || "",
        formateurNom: `${donnees.formateur.prenom} ${donnees.formateur.nom}`.trim(),
        lien: await lienSigne(chemin),
      });
      actions.push(`3A:${apprenant.id}`);
    }
    if (apprenants.length > 0) await majPiece("3A", "complete");
  }

  /* ---------- F0C : ordre de mission du formateur, à signer ---------- */
  const defF0C = doc("F0C");
  if (defF0C && atteint(statut, "accord_financement") && !dejaEnvoye("F0C", null)) {
    const base = nomRangement(
      `${donnees.formateur.prenom} ${donnees.formateur.nom}`.trim() || "Formateur",
      formationTitre,
      donnees.formation.dateDebut || "",
    );
    const fileName = `F0C_${base}.pdf`;
    const html = defF0C.build(donnees);
    const { chemin, driveUrl, driveFileId } = await produirePdf({
      html,
      fileName,
      formateurId: dossier.formateur_id,
      dossierId: dossier.id,
      dossierLabel,
      sousDossier: "a-signer",
    });
    await enregistrerEnvoi({
      code: "F0C",
      label: defF0C.label,
      apprenantId: null,
      html,
      chemin,
      driveUrl,
      driveFileId,
      fileName,
    });
    await majPiece("F0C", "en_attente_tally", chemin);

    const { data: formateur } = await supabaseAdmin
      .from("profiles")
      .select("prenom, email")
      .eq("id", dossier.formateur_id)
      .maybeSingle();
    await envoyerEmail(
      "ordre-de-mission-formateur",
      formateur?.email ?? donnees.formateur.email ?? "",
      `F0C-${dossier.id}`,
      {
        formateurPrenom: formateur?.prenom ?? donnees.formateur.prenom ?? "",
        formationTitre,
        dossierLabel,
        lien: `${SITE}/espace/dossiers/${dossier.id}`,
      },
    );
    await supabaseAdmin.from("notifications").insert({
      user_id: dossier.formateur_id,
      titre: "Ordre de mission à signer",
      message: `Votre ordre de mission pour « ${formationTitre} » est disponible : signez-le en ligne depuis la fiche du dossier.`,
      lien: `/espace/dossiers/${dossier.id}`,
    });
    actions.push("F0C");
  }

  /* ---------- 1B : attestation de réalisation dès l'émargement complété ---------- */
  const def1B = doc("1B");
  if (def1B && pieceComplete("F3")) {
    for (const apprenant of apprenants) {
      if (dejaEnvoye("1B", apprenant.id)) continue;
      const label = apprenantLabel(apprenant);
      const base = nomRangement(label, formationTitre, donnees.formation.dateFin || "");
      const fileName = `1B_${base}.pdf`;
      const html = def1B.build(donnees);
      const { chemin, driveUrl, driveFileId } = await produirePdf({
        html,
        fileName,
        formateurId: dossier.formateur_id,
        dossierId: dossier.id,
        dossierLabel,
        sousDossier: "attestations",
        apprenantLabel: label,
      });
      await enregistrerEnvoi({
        code: "1B",
        label: def1B.label,
        apprenantId: apprenant.id,
        html,
        chemin,
        driveUrl,
        driveFileId,
        fileName,
      });
      await envoyerEmail("attestation-realisation", apprenant.email, `1B-${apprenant.id}`, {
        apprenantNom: label,
        formationTitre,
        dateDebut: donnees.formation.dateDebut || dossier.date_debut || "",
        dateFin: donnees.formation.dateFin || dossier.date_fin || "",
        lien: await lienSigne(chemin),
      });
      actions.push(`1B:${apprenant.id}`);
    }
    if (apprenants.length > 0) await majPiece("1B", "complete");
  }

  return { actions };
}

/**
 * Envoie le questionnaire de satisfaction à froid (F7) aux apprenants d'un dossier.
 * Le formulaire est rempli en ligne dans l'espace apprenant (mode « formulaire »).
 */
export async function envoyerSatisfactionFroid(dossierId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { DOCUMENTS } = await import("@/lib/dossier/html");
  const envoyes: string[] = [];

  const { data: dossier } = await supabaseAdmin
    .from("dossiers")
    .select("id, formateur_id, donnees, dossier_nom, entreprise_nom, titre_formation, date_fin")
    .eq("id", dossierId)
    .maybeSingle();
  if (!dossier) return { envoyes };

  const donnees = mergeDonnees(dossier.donnees);
  const formationTitre = donnees.formation.titre || dossier.titre_formation || "Formation";
  const def = DOCUMENTS.find((d) => d.code === "F7");
  if (!def) return { envoyes };

  const { data: apprenantsRaw } = await supabaseAdmin
    .from("dossier_apprenants")
    .select("id, prenom, nom, email")
    .eq("dossier_id", dossier.id);
  const { data: envois } = await supabaseAdmin
    .from("document_envois")
    .select("code, apprenant_id")
    .eq("dossier_id", dossier.id);

  for (const apprenant of (apprenantsRaw ?? []) as Apprenant[]) {
    if ((envois ?? []).some((e) => e.code === "F7" && e.apprenant_id === apprenant.id)) continue;
    const label = apprenantLabel(apprenant);
    await supabaseAdmin.from("document_envois").insert({
      dossier_id: dossier.id,
      apprenant_id: apprenant.id,
      formateur_id: dossier.formateur_id,
      code: "F7",
      label: def.label,
      contenu_html: def.build(donnees),
      statut: "envoye",
      sent_at: new Date().toISOString(),
    });
    await supabaseAdmin.from("dossier_pieces").upsert(
      {
        dossier_id: dossier.id,
        formateur_id: dossier.formateur_id,
        code: "F7",
        statut: "en_attente_tally",
        generated_at: new Date().toISOString(),
      },
      { onConflict: "dossier_id,code" },
    );
    await envoyerEmail("satisfaction-a-froid", apprenant.email, `F7-${apprenant.id}`, {
      apprenantNom: label,
      formationTitre,
      lien: `${SITE}/apprenant`,
    });
    envoyes.push(apprenant.id);
  }

  return { envoyes };
}

/**
 * Tâche quotidienne : satisfaction à froid des formations terminées il y a 3 mois
 * (fenêtre de rattrapage de 7 jours) et rattrapage des automatisations manquées.
 */
export async function tacheQuotidienne() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const jour = 24 * 60 * 60 * 1000;
  const cible = new Date(Date.now() - 91 * jour);
  const debut = new Date(cible.getTime() - 6 * jour).toISOString().slice(0, 10);
  const fin = cible.toISOString().slice(0, 10);

  const { data: dossiers } = await supabaseAdmin
    .from("dossiers")
    .select("id")
    .neq("statut_crm", "refuse")
    .gte("date_fin", debut)
    .lte("date_fin", fin);

  let froid = 0;
  for (const d of dossiers ?? []) {
    const { envoyes } = await envoyerSatisfactionFroid(d.id);
    froid += envoyes.length;
  }

  // Rattrapage des automatisations (3A / F0C / 1B) sur les dossiers actifs récents.
  const { data: actifs } = await supabaseAdmin
    .from("dossiers")
    .select("id")
    .in("statut_crm", [
      "accord_financement",
      "finalisation_administrative",
      "formation_en_cours",
      "formation_realisee",
      "demande_paiement",
    ]);
  let rattrapages = 0;
  for (const d of actifs ?? []) {
    const { actions } = await automatiserDossier(d.id);
    rattrapages += actions.length;
  }

  return { satisfactionFroid: froid, rattrapages, fenetre: { debut, fin } };
}
