import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { TARIFS_CPF, type LigneTarifCpf } from "@/data/tarifs-cpf";

const ligneSchema = z.object({
  categorie: z.string().min(1),
  intitule: z.string().min(1),
  dureeHeures: z.number().int().positive(),
  prixEuros: z.number().nonnegative(),
  urlMonCompteFormation: z.string().default(""),
});

const schema = z.object({ lignes: z.array(ligneSchema).optional() }).default({});

const ROLES_ADMIN = ["super_admin", "admin"] as const;

/**
 * Importe (ou met à jour) le barème CPF dans `tarifs_cpf`.
 * Sans argument, importe le catalogue de référence de `src/data/tarifs-cpf.ts`.
 */
export const importerTarifsCpf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data ?? {}))
  .handler(async ({ data, context }) => {
    const { data: roles, error: rolesError } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .in("role", [...ROLES_ADMIN]);
    if (rolesError) throw new Error("Vérification des droits impossible.");
    if (!roles?.length) throw new Error("Accès réservé aux super admins.");

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
