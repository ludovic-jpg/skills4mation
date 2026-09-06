import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertConseillerFormation } from "@/lib/roles-guard";
import { TARIFS_CPF, type LigneTarifCpf } from "@/data/tarifs-cpf";

const ligneSchema = z.object({
  categorie: z.string().min(1),
  intitule: z.string().min(1),
  dureeHeures: z.number().int().positive(),
  prixEuros: z.number().nonnegative(),
  urlMonCompteFormation: z.string().default(""),
});

const schema = z.object({ lignes: z.array(ligneSchema).optional() }).default({});



/**
 * Importe (ou met à jour) le barème CPF dans `tarifs_cpf`.
 * Sans argument, importe le catalogue de référence de `src/data/tarifs-cpf.ts`.
 */
export const importerTarifsCpf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data ?? {}))
  .handler(async ({ data, context }) => {
    await assertConseillerFormation(context.supabase, context.userId);

    const lignes: LigneTarifCpf[] = data.lignes ?? TARIFS_CPF;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.from("tarifs_cpf").upsert(
      lignes.map((l) => ({
        categorie: l.categorie,
        intitule: l.intitule,
        duree_heures: l.dureeHeures,
        prix_euros: l.prixEuros,
        url_moncompteformation: l.urlMonCompteFormation || null,
      })),
      { onConflict: "intitule,duree_heures" },
    );
    if (error) throw new Error(`Import du barème CPF impossible : ${error.message}`);

    return { importees: lignes.length };
  });
