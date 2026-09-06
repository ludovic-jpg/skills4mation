import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Registre des aménagements handicap (Qualiopi, indicateur 26) : marquer une
 * demande comme traitée. La policy RLS de demandes_amenagement_handicap
 * réserve l'écriture à l'équipe conseiller formation — on passe par
 * context.supabase pour que ce soit la base, pas ce code, qui tranche qui a
 * le droit de clôturer une demande.
 */
export const marquerAmenagementTraite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({ id: z.string().uuid(), notes: z.string().trim().max(2000).optional() })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("demandes_amenagement_handicap")
      .update({
        statut: "traite",
        traite_par: context.userId,
        traite_le: new Date().toISOString(),
        notes: data.notes ?? null,
      })
      .eq("id", data.id);
    if (error) throw new Error("Mise à jour impossible : " + error.message);
    return { ok: true };
  });

/**
 * Nomme (ou renomme) le référent handicap affiché aux formateurs. Même
 * logique d'accès : seule l'équipe peut écrire, via la policy RLS de
 * parametres_organisme.
 */
export const definirReferentHandicap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        nom: z.string().trim().max(200),
        contact: z.string().trim().max(200).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const maintenant = new Date().toISOString();
    const { error } = await context.supabase.from("parametres_organisme").upsert(
      [
        {
          cle: "referent_handicap_nom",
          valeur: data.nom,
          mis_a_jour_le: maintenant,
          mis_a_jour_par: context.userId,
        },
        {
          cle: "referent_handicap_contact",
          valeur: data.contact ?? "",
          mis_a_jour_le: maintenant,
          mis_a_jour_par: context.userId,
        },
      ],
      { onConflict: "cle" },
    );
    if (error) throw new Error("Enregistrement impossible : " + error.message);
    return { ok: true };
  });
