import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Formulaire de clôture pédagogique : les quatre champs qui alimentent le BPF
 * (Bilan Pédagogique et Financier) et l'indicateur Qualiopi 11, plus le réalisé
 * financier. Une ligne par dossier — voir migration dossier_financement.
 */
const schema = z.object({
  dossierId: z.string().uuid(),
  heuresRealisees: z.number().min(0).optional(),
  stagiairesPresents: z.number().int().min(0).optional(),
  objectifBpf: z.string().trim().max(500).optional(),
  typeStagiaires: z.string().trim().max(500).optional(),
  montantEncaisse: z.number().min(0).optional(),
  dateReversementFormateur: z.string().optional(),
  montantReversementFormateur: z.number().min(0).optional(),
});

/**
 * Enregistre (ou met à jour) le réalisé pédagogique et financier d'un dossier.
 * L'accès est vérifié par les policies RLS de dossier_financement (formateur
 * propriétaire du dossier, ou conseiller) : on passe par context.supabase, pas
 * par le client admin, pour que la base reste la seule source de vérité sur qui
 * a le droit de clôturer quel dossier.
 */
export const cloturerFinancement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }) => {
    // Le conseiller peut clôturer un dossier qui n'est pas le sien : on lit le
    // formateur_id réel du dossier plutôt que de supposer que c'est l'appelant.
    // La lecture elle-même est filtrée par les policies RLS de `dossiers`
    // (formateur propriétaire ou conseiller) : si l'appelant n'a pas le droit de
    // voir ce dossier, aucune ligne ne revient et l'opération échoue proprement.
    const { data: dossier, error: dossierError } = await context.supabase
      .from("dossiers")
      .select("formateur_id")
      .eq("id", data.dossierId)
      .maybeSingle();
    if (dossierError || !dossier) throw new Error("Dossier introuvable ou accès refusé.");

    const { error } = await context.supabase.from("dossier_financement").upsert(
      {
        dossier_id: data.dossierId,
        formateur_id: dossier.formateur_id,
        heures_realisees: data.heuresRealisees ?? null,
        stagiaires_presents: data.stagiairesPresents ?? null,
        objectif_bpf: data.objectifBpf ?? null,
        type_stagiaires: data.typeStagiaires ?? null,
        montant_encaisse: data.montantEncaisse ?? null,
        date_reversement_formateur: data.dateReversementFormateur ?? null,
        montant_reversement_formateur: data.montantReversementFormateur ?? null,
        cloture_le: new Date().toISOString(),
        cloture_par: context.userId,
      },
      { onConflict: "dossier_id" },
    );
    if (error) throw new Error("Enregistrement du réalisé impossible : " + error.message);
    return { ok: true };
  });
