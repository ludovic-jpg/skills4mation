import type { SupabaseClient } from "@supabase/supabase-js";

/** Rôle unique de l'équipe Skills4mation (fusion des anciens admin / super_admin / conseillère). */
export const ROLE_EQUIPE = "conseiller_formation" as const;

/**
 * Vérifie, côté serveur et avec le client RLS de l'appelant, que l'utilisateur
 * possède le rôle conseiller formation. Lève une erreur explicite sinon.
 */
export async function assertConseillerFormation(
  supabase: SupabaseClient<any, any, any>,
  userId: string,
) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", ROLE_EQUIPE);
  if (error) throw new Error("Vérification des droits impossible.");
  if (!data || data.length === 0) throw new Error("Accès réservé aux conseillers formation.");
}
