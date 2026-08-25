export type CrmStatut =
  | "brouillon"
  | "demande_validation"
  | "dossier_valide"
  | "demande_financement"
  | "accord_financement"
  | "finalisation_administrative"
  | "paiement"
  | "paiement_formateur"
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
    description: "Signatures et dernières pièces réunies.",
  },
  paiement: {
    etape: 6,
    label: "Paiement reçu",
    tone: "cta",
    description: "Règlement reçu du client ou de l'OPCO.",
  },
  paiement_formateur: {
    etape: 7,
    label: "Paiement formateur",
    tone: "success",
    description: "Rémunération versée au formateur sous 10 jours ouvrés.",
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
  "paiement",
  "paiement_formateur",
];

export function crmLabel(statut: CrmStatut) {
  return CRM_STATUTS[statut]?.label ?? statut;
}

export function crmProgress(statut: CrmStatut) {
  const etape = CRM_STATUTS[statut]?.etape;
  if (etape == null) return 0;
  return Math.round((etape / 7) * 100);
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
