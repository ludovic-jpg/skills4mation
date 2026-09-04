import { CRM_PIPELINE, type CrmStatut } from "@/lib/crm";

/**
 * Pièces révélées uniquement à partir de l'accord de financement :
 * 3A (convocation des stagiaires) et F0C (ordre de mission / sous-traitance formateur).
 */
export const PIECES_APRES_ACCORD = ["3A", "F0C"];

const RANG_ACCORD = CRM_PIPELINE.indexOf("accord_financement");

/**
 * `true` dès que le dossier a atteint l'accord de financement dans le pipeline CRM existant.
 * Les statuts hors pipeline (refus / annulation) restent à `false`.
 */
export function accordFinancementAtteint(statut?: CrmStatut | null) {
  if (!statut) return false;
  const rang = CRM_PIPELINE.indexOf(statut);
  return rang > -1 && rang >= RANG_ACCORD;
}

/**
 * Visibilité d'une pièce/document selon le statut CRM.
 * - Avant l'accord de financement : 3A et F0C restent masquées.
 * - Dossier refusé : branche terminale, aucune de ces pièces n'est proposée.
 */
export function pieceVisibleSelonStatut(code: string, statut?: CrmStatut | null) {
  if (!PIECES_APRES_ACCORD.includes(code)) return true;
  if (!statut) return false;
  if (statut === "refuse") return false;
  return accordFinancementAtteint(statut);
}

/**
 * Calendrier de diffusion du socle documentaire au formateur :
 * 1A / 1C / 2 / F0A dès le dossier validé, F3 au démarrage de la formation,
 * F5 une fois la formation réalisée.
 */
const CALENDRIER_SOCLE: Record<string, CrmStatut> = {
  "1A": "dossier_valide",
  "1C": "dossier_valide",
  "2": "dossier_valide",
  F0A: "dossier_valide",
  F3: "formation_en_cours",
  F5: "formation_realisee",
};

/**
 * `true` quand le document du socle peut être téléchargé par le formateur :
 * la signature Skills4mation doit être apposée (verrou global) et l'étape du
 * calendrier de diffusion atteinte.
 */
export function documentSocleDiffusable(
  code: string,
  statut?: CrmStatut | null,
  signatureOrganismeDate?: string | null,
) {
  if (!signatureOrganismeDate) return false;
  if (!statut || statut === "refuse") return false;
  const requis = CALENDRIER_SOCLE[code];
  if (!requis) return false;
  const rang = CRM_PIPELINE.indexOf(statut);
  return rang > -1 && rang >= CRM_PIPELINE.indexOf(requis);
}
