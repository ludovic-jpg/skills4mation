import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type FormationHistorique = Tables<"formations_catalogue">;

/** Catégories de référence du catalogue Skills4mation. */
export const CATEGORIES: { slug: string; label: string }[] = [
  { slug: "bien-etre", label: "Bien-être" },
  { slug: "bureautique", label: "Bureautique & digital" },
  { slug: "communication", label: "Communication" },
  { slug: "creation-dentreprise", label: "Business & création d’entreprise" },
  { slug: "langues", label: "Langues" },
  { slug: "metier-specifique", label: "Métier spécifique" },
  { slug: "rh-management", label: "RH & Management" },
  { slug: "rse", label: "RSE" },
  { slug: "ventes", label: "Ventes" },
];

export const categoryLabel = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;

/* -------------------------------------------------------------------------- */
/* Contenu éditorial des fiches (colonne programme)                           */
/* -------------------------------------------------------------------------- */

export type ProgrammeModule = { titre: string; points: string[] };

export type FormationCertification = {
  libelle: string;
  code: string;
  certificateur: string;
  dateEnregistrement: string;
  validiteJusquau?: string;
  description: string;
  modalitesEvaluation: string;
};

export type FormationAncien = {
  name: string;
  role: string;
  temoignage: string;
  note?: number;
  resultat?: string;
};

/** Champs éditoriaux sans colonne dédiée, rangés dans programme.meta. */
export type FicheMeta = {
  heading?: string;
  public?: string[];
  forts?: string[];
  resultats?: string[];
  anciens?: FormationAncien[];
  modalitesEvaluation?: string[];
  delaisAcces?: string;
  accessibiliteHandicap?: string;
  derniereMiseAJour?: string;
  certification?: FormationCertification;
};

const texte = (v: unknown) => (typeof v === "string" && v ? v : undefined);
const listeTexte = (v: unknown) =>
  Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean) : undefined;

/** Lit les modules pédagogiques, quel que soit le format enregistré. */
export function programmeModules(raw: unknown): ProgrammeModule[] {
  const brut = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { modules?: unknown }).modules)
      ? ((raw as { modules: unknown[] }).modules)
      : [];
  return brut
    .map((item) => {
      const m = (item ?? {}) as { titre?: unknown; title?: unknown; points?: unknown };
      return {
        titre: String(m.titre ?? m.title ?? ""),
        points: listeTexte(m.points) ?? [],
      };
    })
    .filter((m) => m.titre || m.points.length > 0);
}

/** Lit les champs éditoriaux complémentaires d'une fiche. */
export function ficheMeta(raw: unknown): FicheMeta {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const meta = (raw as { meta?: unknown }).meta;
  if (!meta || typeof meta !== "object") return {};
  const m = meta as Record<string, unknown>;
  const cert = m["certification"] as Record<string, unknown> | undefined;
  const out: FicheMeta = {};
  const heading = texte(m["heading"]);
  if (heading) out.heading = heading;
  const pub = listeTexte(m["public"]);
  if (pub) out.public = pub;
  const forts = listeTexte(m["forts"]);
  if (forts) out.forts = forts;
  const resultats = listeTexte(m["resultats"]);
  if (resultats) out.resultats = resultats;
  const modEval = listeTexte(m["modalitesEvaluation"]);
  if (modEval) out.modalitesEvaluation = modEval;
  const delais = texte(m["delaisAcces"]);
  if (delais) out.delaisAcces = delais;
  const acces = texte(m["accessibiliteHandicap"]);
  if (acces) out.accessibiliteHandicap = acces;
  const maj = texte(m["derniereMiseAJour"]);
  if (maj) out.derniereMiseAJour = maj;
  if (Array.isArray(m["anciens"])) out.anciens = m["anciens"] as FormationAncien[];
  if (cert && texte(cert["libelle"])) out.certification = cert as unknown as FormationCertification;
  return out;
}

/** Vue prête à afficher d'une fiche du catalogue historique. */
export type FicheFormation = {
  slug: string;
  titre: string;
  heading: string;
  categorie: string | null;
  image: string | null;
  intro: string;
  niveau: string;
  tarif: string;
  objectif: string;
  duree: string;
  prerequis: string;
  objectifs: string[];
  public: string[];
  modalites: string[];
  forts: string[];
  resultats: string[];
  programme: ProgrammeModule[];
  anciens: FormationAncien[];
  modalitesEvaluation?: string[];
  delaisAcces?: string;
  accessibiliteHandicap?: string;
  derniereMiseAJour?: string;
  certification?: FormationCertification;
};

const NON_RENSEIGNE = "Non renseigné";

/** Reconstitue une fiche affichable depuis une ligne de formations_catalogue. */
export function ficheDepuisLigne(row: FormationHistorique): FicheFormation {
  const meta = ficheMeta(row.programme);
  const fiche: FicheFormation = {
    slug: row.slug,
    titre: row.titre,
    heading: meta.heading ?? row.titre,
    categorie: row.categorie,
    image: row.visuel_url,
    intro: row.intro ?? "",
    niveau: row.niveau ?? NON_RENSEIGNE,
    tarif: row.tarif_details ?? NON_RENSEIGNE,
    objectif: row.objectif ?? NON_RENSEIGNE,
    duree: row.duree_texte ?? NON_RENSEIGNE,
    prerequis: row.prerequis ?? NON_RENSEIGNE,
    objectifs: row.objectifs ?? [],
    public: meta.public ?? (row.public_cible ? row.public_cible.split("\n").filter(Boolean) : []),
    modalites: row.modalites ?? [],
    forts: meta.forts ?? [],
    resultats: meta.resultats ?? [],
    programme: programmeModules(row.programme),
    anciens: meta.anciens ?? [],
  };
  if (meta.modalitesEvaluation) fiche.modalitesEvaluation = meta.modalitesEvaluation;
  if (meta.delaisAcces) fiche.delaisAcces = meta.delaisAcces;
  if (meta.accessibiliteHandicap) fiche.accessibiliteHandicap = meta.accessibiliteHandicap;
  if (meta.derniereMiseAJour) fiche.derniereMiseAJour = meta.derniereMiseAJour;
  if (meta.certification) fiche.certification = meta.certification;
  return fiche;
}

/* -------------------------------------------------------------------------- */
/* Accès aux données                                                          */
/* -------------------------------------------------------------------------- */

export const COLONNES_CARTE =
  "slug, titre, categorie, visuel_url, duree_texte, tarif_details" as const;

export type CarteHistorique = Pick<
  FormationHistorique,
  "slug" | "titre" | "categorie" | "visuel_url" | "duree_texte" | "tarif_details"
>;

/** Liste des fiches historiques publiées (utilisable dans un loader). */
export async function chargerCatalogueHistorique(categorie?: string) {
  let requete = supabase
    .from("formations_catalogue")
    .select(COLONNES_CARTE)
    .eq("source", "historique")
    .eq("publiee", true)
    .order("titre", { ascending: true });
  if (categorie) requete = requete.eq("categorie", categorie);
  const { data, error } = await requete;
  if (error) throw error;
  return (data ?? []) as CarteHistorique[];
}

/** Fiche historique complète par slug (utilisable dans un loader). */
export async function chargerFicheHistorique(slug: string) {
  const { data, error } = await supabase
    .from("formations_catalogue")
    .select("*")
    .eq("source", "historique")
    .eq("publiee", true)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? (data as FormationHistorique) : null;
}

/**
 * Remplace l'import statique de src/data/catalogue.ts.
 * Mise en cache 10 min : ce contenu change rarement.
 */
export function useCataloguesHistoriques(categorie?: string) {
  return useQuery({
    queryKey: ["catalogue-historique", categorie ?? "all"],
    queryFn: () => chargerCatalogueHistorique(categorie),
    staleTime: 10 * 60 * 1000,
  });
}

export function useFormationHistoriqueBySlug(slug: string) {
  return useQuery({
    queryKey: ["catalogue-historique", "slug", slug],
    queryFn: () => chargerFicheHistorique(slug),
    staleTime: 10 * 60 * 1000,
    enabled: Boolean(slug),
  });
}
