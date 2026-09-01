import { supabase } from "@/integrations/supabase/client";
import type { DossierDonnees } from "@/lib/dossier/types";

export type EntrepriseSuggestion = {
  id: string;
  nom: string;
  nom_commercial: string | null;
  adresse: string | null;
  siret: string | null;
  prenom_contact: string | null;
  nom_contact: string | null;
  telephone: string | null;
  email: string | null;
};

export type ApprenantSuggestion = {
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
};

function nettoieSiret(value: string) {
  return value.replace(/[\s.-]/g, "");
}

/**
 * Annuaire partagé : recherche des entreprises clientes déjà saisies par l'organisation.
 */
export async function chercherEntreprises(terme: string): Promise<EntrepriseSuggestion[]> {
  const q = terme.trim();
  if (q.length < 2) return [];
  const { data } = await supabase
    .from("entreprises_clientes")
    .select("id, nom, nom_commercial, adresse, siret, prenom_contact, nom_contact, telephone, email")
    .or(`nom.ilike.%${q}%,nom_commercial.ilike.%${q}%,siret.ilike.%${q}%`)
    .order("nom")
    .limit(8);
  return (data ?? []) as EntrepriseSuggestion[];
}

/**
 * Mémorise (ou met à jour) l'entreprise du dossier dans l'annuaire partagé.
 * Appelé en arrière-plan : ne bloque jamais la saisie et n'échoue jamais bruyamment.
 */
export async function memoriserEntreprise(
  entreprise: DossierDonnees["entreprise"],
  userId: string,
): Promise<void> {
  const siret = nettoieSiret(entreprise.siret ?? "");
  if (!entreprise.nom.trim() || siret.length !== 14) return;

  const payload = {
    created_by: userId,
    nom: entreprise.nom.trim(),
    nom_commercial: entreprise.nomCommercial || null,
    adresse: entreprise.adresse || null,
    siret,
    prenom_contact: entreprise.prenomRepresentant || null,
    nom_contact: entreprise.nomRepresentant || null,
    telephone: entreprise.telephone || null,
    email: entreprise.email || null,
  };

  const { data: existante } = await supabase
    .from("entreprises_clientes")
    .select("id")
    .eq("siret", siret)
    .maybeSingle();

  if (existante?.id) {
    const { created_by: _ignore, ...maj } = payload;
    await supabase.from("entreprises_clientes").update(maj).eq("id", existante.id);
    return;
  }
  await supabase.from("entreprises_clientes").insert(payload);
}

/**
 * Apprenants déjà connus du formateur connecté uniquement (scopé par RLS + filtre explicite).
 * Contrairement aux entreprises clientes, ces données ne sont jamais partagées entre formateurs.
 */
export async function chercherApprenantConnu(
  email: string,
  formateurId: string,
): Promise<ApprenantSuggestion | null> {
  const value = email.trim().toLowerCase();
  if (!value.includes("@")) return null;
  const { data } = await supabase
    .from("dossier_apprenants")
    .select("prenom, nom, email, telephone")
    .eq("formateur_id", formateurId)
    .ilike("email", value)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as ApprenantSuggestion | null) ?? null;
}
