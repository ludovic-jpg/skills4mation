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

/** Référentiels de saisie des formations (menus déroulants côté formateur). */
export const NIVEAUX_OPTIONS: string[] = [
  "Débutant",
  "Avancé",
  "Expert",
  "Tous les niveaux",
];

export const PUBLICS_OPTIONS: string[] = [
  "Tout public",
  "Salariés",
  "Dirigeants et cadres",
  "Managers et encadrants",
  "Indépendants et créateurs d'entreprise",
  "Demandeurs d'emploi",
  "Professionnels en reconversion",
];

export const MODALITES_OPTIONS: string[] = [
  "Formation en présentiel, en groupe",
  "Formation en distanciel synchrone (classe virtuelle)",
  "Formation mixte (présentiel et distanciel)",
  "Formation individuelle sur mesure",
  "Alternance d'apports théoriques et de mises en situation",
];

export const MOYENS_OPTIONS: string[] = [
  "Support de formation remis à chaque participant, paperboard, vidéoprojecteur",
  "Plateforme de visioconférence, support numérique partagé, exercices en ligne",
  "Salle équipée, postes informatiques et logiciels dédiés",
  "Études de cas, jeux de rôles et outils d'auto-diagnostic",
];

export const EVALUATION_OPTIONS: string[] = [
  "Test de positionnement en amont, évaluation des acquis en fin de formation, questionnaire de satisfaction",
  "Quiz de validation à chaque module et évaluation finale des acquis",
  "Mises en situation évaluées et grille d'observation du formateur",
  "Passage d'une certification en fin de parcours",
];

export const CERTIFICATION_OPTIONS: string[] = [
  "ICDL — Certification des compétences numériques",
  "LILATE — Certification en langues",
  "Le Robert — Certification en français professionnel",
  "Certification AEC DISC",
  "Formation non certifiante",
];
