export type CrmStatut =
  | "brouillon"
  | "demande_validation"
  | "dossier_valide"
  | "demande_financement"
  | "accord_financement"
  | "finalisation_administrative"
  | "formation_en_cours"
  | "formation_realisee"
  | "demande_paiement"
  | "paiement_organisme"
  | "paiement_formateur"
  /** Conservé pour compatibilité descendante, remplacé par « paiement_organisme ». */
  | "paiement"
  | "refuse";

type Tone = "neutral" | "info" | "teal" | "cta" | "success" | "danger";

export const CRM_STATUTS: Record<
  CrmStatut,
  { etape: number | null; label: string; tone: Tone; description: string }
> = {
  brouillon: {
    etape: 0,
    label: "Brouillon",
    tone: "neutral",
    description: "Dossier créé, formulaire de convention non encore soumis.",
  },
  demande_validation: {
    etape: 1,
    label: "Demande de validation",
    tone: "info",
    description: "Documents générés, en attente de contrôle par l'équipe Skills4mation.",
  },
  dossier_valide: {
    etape: 2,
    label: "Dossier validé",
    tone: "teal",
    description: "Pièces Qualiopi visées et contrôlées par l'équipe.",
  },
  demande_financement: {
    etape: 3,
    label: "Demande de financement",
    tone: "info",
    description: "Dossier transmis à l'OPCO ou au financeur.",
  },
  accord_financement: {
    etape: 4,
    label: "Accord de financement",
    tone: "teal",
    description: "Accord de financement reçu et déposé au dossier.",
  },
  finalisation_administrative: {
    etape: 5,
    label: "Finalisation administrative",
    tone: "cta",
    description: "Signatures et dernières pièces réunies avant le démarrage.",
  },
  formation_en_cours: {
    etape: 6,
    label: "Formation en cours",
    tone: "info",
    description: "La session a démarré : émargements et suivi pédagogique en cours.",
  },
  formation_realisee: {
    etape: 7,
    label: "Formation réalisée",
    tone: "teal",
    description: "Session terminée, pièces de fin de formation à réunir.",
  },
  demande_paiement: {
    etape: 8,
    label: "Demande de paiement",
    tone: "cta",
    description: "Facturation transmise au client ou au financeur.",
  },
  paiement_organisme: {
    etape: 9,
    label: "Paiement organisme",
    tone: "cta",
    description: "Règlement reçu par Skills4mation du client ou de l'OPCO.",
  },
  paiement_formateur: {
    etape: 9,
    label: "Paiement formateur",
    tone: "success",
    description: "Rémunération versée au formateur sous 8 jours ouvrés.",
  },
  paiement: {
    etape: 9,
    label: "Paiement reçu (historique)",
    tone: "cta",
    description: "Ancien statut conservé pour les dossiers antérieurs.",
  },
  refuse: {
    etape: null,
    label: "Refusé / Annulé",
    tone: "danger",
    description: "Dossier refusé ou annulé, commentaire obligatoire.",
  },
};

export const CRM_PIPELINE: CrmStatut[] = [
  "brouillon",
  "demande_validation",
  "dossier_valide",
  "demande_financement",
  "accord_financement",
  "finalisation_administrative",
  "formation_en_cours",
  "formation_realisee",
  "demande_paiement",
  "paiement_organisme",
  "paiement_formateur",
];

/** Nombre d'étapes du pipeline (0 → 9, le paiement formateur clôturant l'étape 9). */
const ETAPE_MAX = 9;

export function crmLabel(statut: CrmStatut) {
  return CRM_STATUTS[statut]?.label ?? statut;
}

export function crmProgress(statut: CrmStatut) {
  const etape = CRM_STATUTS[statut]?.etape;
  if (etape == null) return 0;
  if (statut === "paiement_formateur") return 100;
  return Math.round((etape / ETAPE_MAX) * 100);
}


export function dossierNom(input: {
  entreprise_nom?: string | null;
  titre_formation?: string | null;
  date_debut?: string | null;
}) {
  const parts = [
    input.entreprise_nom?.trim() || "Entreprise à renseigner",
    input.titre_formation?.trim() || "Formation à renseigner",
    input.date_debut ? new Date(input.date_debut).toLocaleDateString("fr-FR") : "date à définir",
  ];
  return parts.join(" – ");
}
