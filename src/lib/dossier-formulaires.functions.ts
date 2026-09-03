import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { formulaireDe, recapFormulaireHtml } from "@/lib/dossier/formulaires";
import { nomRangement } from "@/lib/dossier/types";

const schema = z.object({
  envoiId: z.string().uuid(),
  reponses: z.record(z.string(), z.string().max(4000)),
});

/**
 * Enregistre les réponses d'un formulaire générique rempli en ligne par l'apprenant
 * (Recueil des besoins, Satisfaction), génère le PDF récapitulatif, l'archive dans
 * Google Drive et le Storage, puis notifie le formateur.
 * Le flux de signature des documents à signer n'est pas concerné.
 */
export const repondreFormulaire = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: envoi, error } = await context.supabase
      .from("document_envois")
      .select("id, dossier_id, apprenant_id, formateur_id, code, label, statut")
      .eq("id", data.envoiId)
      .maybeSingle();
    if (error || !envoi) throw new Error("Document introuvable.");

    const def = formulaireDe(envoi.code);
    if (!def) throw new Error("Ce document ne se remplit pas en ligne.");

    const manquant = def.champs.find(
      (c) => c.requis && !String(data.reponses[c.id] ?? "").trim(),
    );
    if (manquant) throw new Error(`Réponse obligatoire manquante : ${manquant.label}`);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: apprenant } = await supabaseAdmin
      .from("dossier_apprenants")
      .select("prenom, nom, email, user_id")
      .eq("id", envoi.apprenant_id ?? "")
      .maybeSingle();

    // Seul l'apprenant destinataire (ou le formateur du dossier) peut répondre.
    if (apprenant?.user_id && apprenant.user_id !== context.userId && envoi.formateur_id !== context.userId) {
      throw new Error("Formulaire non autorisé.");
    }

    const { data: dossier } = await supabaseAdmin
      .from("dossiers")
      .select("id, dossier_nom, entreprise_nom, titre_formation, date_fin, date_debut")
      .eq("id", envoi.dossier_id)
      .maybeSingle();

    const apprenantLabel =
      `${apprenant?.prenom ?? ""} ${apprenant?.nom ?? ""}`.trim() || apprenant?.email || "Apprenant";
    const dossierLabel =
      dossier?.dossier_nom ||
      [dossier?.entreprise_nom, dossier?.titre_formation].filter(Boolean).join(" - ") ||
      `Dossier ${envoi.dossier_id.slice(0, 8)}`;

    const soumisLe = new Date().toISOString();
    const html = recapFormulaireHtml({
      code: envoi.code,
      label: envoi.label,
      signataire: apprenantLabel,
      email: apprenant?.email ?? null,
      dossierLabel,
      soumisLe: new Date(soumisLe).toLocaleString("fr-FR"),
      reponses: data.reponses,
    });

    const base = nomRangement(
      apprenantLabel,
      dossier?.titre_formation ?? "Formation",
      dossier?.date_fin || dossier?.date_debut || "",
    );
    const fileName = `${envoi.code}_${base}_REPONSES.pdf`;

    const { htmlToPdfAvecRepli } = await import("@/lib/pdf-repli.server");
    const pdf = await htmlToPdfAvecRepli(html, fileName);

    const { uploadToFolder, ensureDossierTree, folderUrl } = await import("@/lib/drive.server");
    const { targetFolderId } = await ensureDossierTree(dossierLabel, apprenantLabel);
    const uploaded = await uploadToFolder(fileName, "application/pdf", pdf, targetFolderId);

    const storagePath = `${envoi.formateur_id}/${envoi.dossier_id}/reponses/${fileName}`;
    await supabaseAdmin.storage
      .from("documents")
      .upload(storagePath, pdf, { contentType: "application/pdf", upsert: true });

    await supabaseAdmin
      .from("document_envois")
      .update({
        statut: "archive",
        received_at: soumisLe,
        reponse_json: data.reponses,
        reponse_nom: fileName,
        reponse_url: storagePath,
        drive_file_id: uploaded.id,
        drive_url: uploaded.webViewLink ?? folderUrl(targetFolderId),
      })
      .eq("id", envoi.id);

    // La pièce du dossier passe à « complet » : même effet qu'un dépôt classique.
    await supabaseAdmin.from("dossier_pieces").upsert(
      {
        dossier_id: envoi.dossier_id,
        formateur_id: envoi.formateur_id,
        code: envoi.code,
        statut: "complete",
      },
      { onConflict: "dossier_id,code" },
    );

    await supabaseAdmin.from("notifications").insert({
      user_id: envoi.formateur_id,
      titre: `Formulaire reçu : ${envoi.code}`,
      message: `${apprenantLabel} a complété en ligne « ${envoi.label} ». Récapitulatif PDF archivé dans Google Drive.`,
      lien: `/espace/dossiers/${envoi.dossier_id}`,
    });

    return { fileName, driveUrl: uploaded.webViewLink ?? folderUrl(targetFolderId) };
  });
