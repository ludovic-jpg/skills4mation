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
