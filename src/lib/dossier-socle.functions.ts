import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DOCUMENTS_CONSULTABLES } from "@/lib/dossier/pieces";
import { mergeDonnees, nomRangement } from "@/lib/dossier/types";

const schema = z.object({ dossierId: z.string().uuid() });

/** Pièces du socle en attente d'une réponse de l'apprenant (formulaire en ligne). */
const EN_ATTENTE_APPRENANT = new Set(["F0A", "F5"]);

/**
 * Génère les six documents du socle (1A, 1C, 2, F0A, F3, F5) à la soumission du
 * dossier : PDF via le rendu Drive (repli natif si indisponible), dépôt dans le
 * bucket `documents`, mise à jour de `dossier_pieces` et rangement dans
 * l'arborescence Drive du dossier.
 */
export const genererSocleDossier = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: dossier, error } = await context.supabase
      .from("dossiers")
      .select(
        "id, formateur_id, donnees, dossier_nom, entreprise_nom, titre_formation, drive_folder_id",
      )
      .eq("id", data.dossierId)
      .maybeSingle();
    if (error || !dossier) throw new Error("Dossier introuvable.");

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

    const { DOCUMENTS } = await import("@/lib/dossier/html");
    const { htmlToPdfAvecRepli } = await import("@/lib/pdf-repli.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let dossierFolderId: string | null = dossier.drive_folder_id ?? null;
    let targetFolderId: string | null = null;
    let driveUrl: string | null = null;
    try {
      const { ensureDossierTree, folderUrl } = await import("@/lib/drive.server");
      const tree = await ensureDossierTree(dossierLabel);
      dossierFolderId = tree.dossierFolderId;
      targetFolderId = tree.targetFolderId;
      driveUrl = folderUrl(tree.dossierFolderId);
    } catch (err) {
      console.error("[socle] Arborescence Drive indisponible :", err);
    }

    const generes: string[] = [];
    for (const code of DOCUMENTS_CONSULTABLES) {
      const def = DOCUMENTS.find((d) => d.code === code);
      if (!def) continue;
      const nom = `${code}_${base}.pdf`;
      try {
        let rendu_degrade = false;
        const pdf = await htmlToPdfAvecRepli(def.build(donnees), nom, {
          onDegrade: () => {
            rendu_degrade = true;
          },
        });
        const chemin = `${dossier.formateur_id}/${dossier.id}/socle/${nom}`;
        const { error: uploadError } = await supabaseAdmin.storage
          .from("documents")
          .upload(chemin, pdf, { contentType: "application/pdf", upsert: true });
        if (uploadError) throw uploadError;

        await supabaseAdmin.from("dossier_pieces").upsert(
          {
            dossier_id: dossier.id,
            formateur_id: dossier.formateur_id,
            code,
            fichier_url: chemin,
            generated_at: new Date().toISOString(),
            statut: EN_ATTENTE_APPRENANT.has(code) ? "en_attente_tally" : "complete",
            rendu_degrade,
          },
          { onConflict: "dossier_id,code" },
        );

        if (targetFolderId) {
          const { uploadToFolder } = await import("@/lib/drive.server");
          await uploadToFolder(nom, "application/pdf", pdf, targetFolderId).catch((err) =>
            console.error(`[socle] Archivage Drive impossible pour ${nom} :`, err),
          );
        }
        generes.push(code);
      } catch (err) {
        console.error(`[socle] Génération impossible pour ${code} :`, err);
      }
    }

    if (dossierFolderId && !dossier.drive_folder_id) {
      await supabaseAdmin
        .from("dossiers")
        .update({
          drive_folder_id: dossierFolderId,
          ...(driveUrl ? { drive_folder_url: driveUrl } : {}),
        })
        .eq("id", dossier.id);
    }

    return { generes, total: DOCUMENTS_CONSULTABLES.length };
  });
