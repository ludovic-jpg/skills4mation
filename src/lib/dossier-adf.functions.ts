import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({ dossierId: z.string().uuid() });

/**
 * Validation d'un dossier par le back-office : attribue le prochain numéro ADF
 * (séquence `adf_numero_seq`) dans `donnees.adf` puis passe le dossier au statut
 * `dossier_valide`. Le numéro est ensuite verrouillé côté formulaire formateur.
 */
export const validerEtGenererAdf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: roles, error: rolesError } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin");
    if (rolesError) throw new Error("Vérification des droits impossible.");
    if (!roles || roles.length === 0) throw new Error("Accès réservé aux administrateurs.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: dossier, error } = await supabaseAdmin
      .from("dossiers")
      .select("id, statut_crm, donnees")
      .eq("id", data.dossierId)
      .maybeSingle();
    if (error || !dossier) throw new Error("Dossier introuvable.");

    const donnees = (dossier.donnees ?? {}) as Record<string, unknown>;
    let adf = String(donnees["adf"] ?? "").trim();
    let attribueLe = String(donnees["adfAttribueLe"] ?? "").trim();

    // Numéro tiré une seule fois : un dossier déjà numéroté conserve son numéro.
    if (!adf) {
      const { data: numero, error: seqError } = await supabaseAdmin.rpc("next_adf_numero");
      if (seqError || !numero) throw new Error("Attribution du numéro ADF impossible.");
      adf = String(numero);
      attribueLe = new Date().toISOString();
    }

    const { error: updateError } = await supabaseAdmin
      .from("dossiers")
      .update({
        donnees: { ...donnees, adf, adfAttribueLe: attribueLe },
        statut_crm: "dossier_valide",
      })
      .eq("id", data.dossierId);
    if (updateError) throw new Error("Mise à jour du dossier impossible.");

    await supabaseAdmin.from("dossier_historique").insert({
      dossier_id: data.dossierId,
      ancien_statut: dossier.statut_crm,
      nouveau_statut: "dossier_valide",
      auteur_id: context.userId,
      commentaire: `Dossier validé — numéro ADF ${adf} attribué par Skills4mation.`,
    });

    return { ok: true as const, adf, attribueLe };
  });
