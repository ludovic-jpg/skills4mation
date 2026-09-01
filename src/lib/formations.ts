import type { Tables } from "@/integrations/supabase/types";
import { DONNEES_VIDES, type DossierDonnees } from "@/lib/dossier/types";

export type FormationCatalogue = Tables<"formations_catalogue">;
export type FormationInscription = Tables<"formations_inscriptions">;

export type ModuleProgramme = { titre: string; points: string[] };

export const FORMAT_OPTIONS: { value: string; label: string }[] = [
  { value: "presentiel", label: "Présentiel" },
  { value: "distanciel", label: "Distanciel" },
  { value: "mixte", label: "Mixte (présentiel et distanciel)" },
];

export const TARIF_UNITES: { value: string; label: string }[] = [
  { value: "par participant", label: "Par participant" },
  { value: "par groupe", label: "Par groupe" },
  { value: "par heure", label: "Par heure" },
  { value: "par jour", label: "Par jour" },
];

export const FINANCEMENTS_APPRENANT: string[] = [
  "Financement par mon employeur / OPCO",
  "France Travail / dispositif public",
  "Fonds propres",
  "Je ne sais pas encore",
];

/** Slug d'URL normalisé pour la page publique de la formation. */
export function slugify(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "formation"
  );
}

/** Adresse publique et stable d'un visuel stocké dans l'espace « formations ». */
export function visuelUrl(path?: string | null) {
  if (!path) return null;
  // Les formations historiques du réseau référencent directement une image distante.
  if (/^https?:\/\//i.test(path)) return path;
  return `/api/public/formation-image/${path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/")}`;
}

export function parseProgramme(raw: unknown): ModuleProgramme[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const module = (item ?? {}) as Partial<ModuleProgramme>;
      return {
        titre: String(module.titre ?? ""),
        points: Array.isArray(module.points) ? module.points.map((p) => String(p)) : [],
      };
    })
    .filter((m) => m.titre || m.points.length > 0);
}

export function dureeLabel(
  f: Pick<FormationCatalogue, "duree_heures" | "duree_jours"> & { duree_texte?: string | null },
) {
  const parts: string[] = [];
  if (f.duree_heures) parts.push(`${f.duree_heures} h`);
  if (f.duree_jours) parts.push(`${f.duree_jours} jour(s)`);
  return parts.join(" · ") || f.duree_texte || null;
}

export function tarifLabel(
  f: Pick<FormationCatalogue, "tarif_ht" | "tarif_unite"> & { tarif_details?: string | null },
) {
  if (f.tarif_ht === null || f.tarif_ht === undefined) return f.tarif_details ?? null;
  const montant = Number(f.tarif_ht).toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${montant} € HT ${f.tarif_unite}`;
}

export function lienPublic(slug: string, origin?: string) {
  const base = origin ?? "https://skills4mation.com";
  return `${base}/formations/${slug}`;
}

/**
 * Applique une formation préenregistrée sur les données d'un dossier :
 * seules les informations pédagogiques et tarifaires sont reprises.
 */
export function appliquerFormation(
  formation: FormationCatalogue,
  donnees: DossierDonnees,
): DossierDonnees {
  const objectifs = (formation.objectifs ?? []).join("\n") || formation.objectif || "";
  const format = FORMAT_OPTIONS.some((o) => o.value === formation.format)
    ? (formation.format as DossierDonnees["formation"]["format"])
    : "presentiel";
  return {
    ...donnees,
    formation: {
      ...donnees.formation,
      titre: formation.titre,
      objectifs,
      niveau: formation.niveau ?? donnees.formation.niveau,
      prerequis: formation.prerequis ?? donnees.formation.prerequis,
      heuresTotal: formation.duree_heures ? String(formation.duree_heures) : donnees.formation.heuresTotal,
      nbJours: formation.duree_jours ? String(formation.duree_jours) : donnees.formation.nbJours,
      format,
      lienConnexion: formation.lien_connexion ?? donnees.formation.lienConnexion,
      visuelUrl: visuelUrl(formation.visuel_url) ?? donnees.formation.visuelUrl,
    },
    lieu: {
      ...donnees.lieu,
      intitule: formation.lieu_defaut ?? donnees.lieu.intitule,
    },
    tarifs: {
      ...donnees.tarifs,
      prixUnitaire: formation.tarif_ht ? String(formation.tarif_ht) : donnees.tarifs.prixUnitaire,
      certificationIcdl:
        donnees.tarifs.certificationIcdl ||
        (formation.certification ?? "").toLowerCase().includes("icdl"),
    },
    formateur: {
      ...donnees.formateur,
      coutHoraire: formation.cout_horaire ? String(formation.cout_horaire) : donnees.formateur.coutHoraire,
    },
    besoins: {
      ...donnees.besoins,
      modalitesEvaluation:
        formation.modalites_evaluation ?? donnees.besoins.modalitesEvaluation,
    },
    facture: {
      ...donnees.facture,
    },
  };
}

export const FORMATION_VIDE = {
  ...DONNEES_VIDES,
};
