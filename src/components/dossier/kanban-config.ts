import { ETAPES_DOSSIER } from "@/components/dossier/FriseEtapes";
import type { CrmStatut } from "@/lib/crm";

/** Libellés de colonnes du Kanban (aucun nouveau statut : uniquement `dossiers.statut_crm`). */
export const COLONNE_LABELS: Partial<Record<CrmStatut, string>> = {
  brouillon: "Brouillon",
  demande_validation: "En cours de validation",
  dossier_valide: "Dossier validé",
  demande_financement: "Demande de financement",
  accord_financement: "Accord de financement",
  refuse: "Refus de financement",
  formation_en_cours: "Formation en cours",
  formation_realisee: "Formation finalisée",
  finalisation_administrative: "Finalisation administrative",
  demande_paiement: "Demande de paiement",
  paiement_organisme: "Paiement organisme",
  paiement_formateur: "Paiement formateur",
};

export type Bandeau = {
  cle: string;
  titre: string;
  statuts: CrmStatut[];
  replieParDefaut?: boolean;
};

export const BANDEAUX: Bandeau[] = [
  { cle: "A", titre: ETAPES_DOSSIER[0]!.titre, statuts: ["brouillon", "demande_validation"] },
  { cle: "B", titre: ETAPES_DOSSIER[1]!.titre, statuts: ["dossier_valide", "demande_financement"] },
  { cle: "C", titre: ETAPES_DOSSIER[2]!.titre, statuts: ["accord_financement", "refuse"] },
  { cle: "D", titre: ETAPES_DOSSIER[3]!.titre, statuts: ["formation_en_cours", "formation_realisee"] },
  {
    cle: "E",
    titre: "Suivi financier",
    statuts: [
      "finalisation_administrative",
      "demande_paiement",
      "paiement_organisme",
      "paiement_formateur",
    ],
    replieParDefaut: true,
  },
];

/** Étapes que le formateur peut déclencher lui-même sur ses propres dossiers. */
export const STATUTS_FORMATEUR: CrmStatut[] = [
  "brouillon",
  "demande_validation",
  "accord_financement",
  "refuse",
  "formation_en_cours",
  "formation_realisee",
];

/** Pièce justificative obligatoire avant d'entrer dans la colonne. */
export const DOCUMENT_REQUIS: Partial<Record<CrmStatut, "accord_financement" | "refus_financement">> =
  {
    accord_financement: "accord_financement",
    refuse: "refus_financement",
  };
