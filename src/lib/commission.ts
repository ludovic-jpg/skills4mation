/**
 * Moteur de calcul du commissionnement Skills4mation.
 *
 * Portage Qualiopi (OPCO / entreprise / fonds propres) : barème dégressif selon
 * le chiffre d'affaires porté annuel du formateur.
 * Portage CPF : commission fixe de 30 %. Le coût de la certification est
 * répercuté au prix coûtant (ajout neutre, hors base de commission).
 *
 * Toutes les formations sont exonérées de TVA : tous les montants sont en HT.
 */

export type PortageMode = "qualiopi" | "cpf";

export const BAREME_QUALIOPI = [
  { plafond: 50_000, taux: 0.25, libelle: "CA ≤ 50 000 €" },
  { plafond: 100_000, taux: 0.23, libelle: "CA de 50 001 € à 100 000 €" },
  { plafond: Infinity, taux: 0.2, libelle: "CA > 100 000 €" },
] as const;

export const TAUX_CPF = 0.3;

/** Mode de portage déduit du mode de financement du dossier. */
export function portageDepuisFinancement(mode: string | null | undefined): PortageMode {
  return mode === "cpf" ? "cpf" : "qualiopi";
}

/** Taux applicable selon le CA porté annuel et le type de portage. */
export function tauxCommission(caAnnuel: number, portage: PortageMode = "qualiopi") {
  if (portage === "cpf") return TAUX_CPF;
  const palier = BAREME_QUALIOPI.find((p) => caAnnuel <= p.plafond);
  return palier?.taux ?? 0.2;
}

export type CalculCommission = {
  taux: number;
  /** Base commissionnable (hors coût de certification). */
  base: number;
  commission: number;
  /** Coût de certification répercuté au prix coûtant. */
  coutCertification: number;
  /** Reversé au formateur : base − commission. */
  netFormateur: number;
  /** Montant total facturé au financeur. */
  totalFacture: number;
};

export function calculerCommission({
  montant,
  caAnnuel = 0,
  portage = "qualiopi",
  coutCertification = 0,
}: {
  montant: number;
  caAnnuel?: number;
  portage?: PortageMode;
  coutCertification?: number;
}): CalculCommission {
  const base = Number.isFinite(montant) && montant > 0 ? montant : 0;
  const certification =
    portage === "cpf" && Number.isFinite(coutCertification) && coutCertification > 0
      ? coutCertification
      : 0;
  const taux = tauxCommission(caAnnuel || base, portage);
  const commission = Math.round(base * taux * 100) / 100;
  return {
    taux,
    base,
    commission,
    coutCertification: certification,
    netFormateur: Math.round((base - commission) * 100) / 100,
    totalFacture: Math.round((base + certification) * 100) / 100,
  };
}

export function tauxLabel(taux: number) {
  return `${Math.round(taux * 100)} %`;
}

/** Numéro ADF unique : ADF-AAAA-XXXXXX (attribué à la création du dossier). */
export function genererNumeroAdf(date = new Date()) {
  const alphabet = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let suffixe = "";
  for (let i = 0; i < 6; i += 1) {
    suffixe += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `ADF-${date.getFullYear()}-${suffixe}`;
}
