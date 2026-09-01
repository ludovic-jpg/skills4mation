/**
 * Barème CPF Skills4mation — une ligne par intitulé × durée.
 *
 * Les prix et les URL moncompteformation.gouv.fr sont propres à chaque durée :
 * complète `prix` et `url` ci-dessous (ou passe les lignes directement à
 * `importerTarifsCpf`) puis relance l'import depuis l'espace super admin.
 */
export type LigneTarifCpf = {
  categorie: string;
  intitule: string;
  dureeHeures: number;
  prixEuros: number;
  urlMonCompteFormation: string;
};

const DUREES_BUREAUTIQUE = [8, 18, 28, 38, 48, 58];

const BUREAUTIQUE = [
  "Tableur (Excel)",
  "Traitement de texte (Word)",
  "Outils collaboratifs",
  "PowerPoint",
  "Photoshop (Édition d'images)",
  "Site web",
  "Anglais",
];

/**
 * Catalogue de référence. Les valeurs à 0 / vides sont des emplacements à
 * compléter avec le détail exact du tableau du barème.
 */
export const TARIFS_CPF: LigneTarifCpf[] = [
  ...BUREAUTIQUE.flatMap((intitule) =>
    DUREES_BUREAUTIQUE.map((dureeHeures) => ({
      categorie: intitule === "Anglais" ? "Langues" : "Bureautique & numérique",
      intitule,
      dureeHeures,
      prixEuros: 0,
      urlMonCompteFormation: "",
    })),
  ),
  ...[18, 20, 24].map((dureeHeures) => ({
    categorie: "Bilan de compétences",
    intitule: "Bilan de compétences",
    dureeHeures,
    prixEuros: 0,
    urlMonCompteFormation: "",
  })),
  {
    categorie: "Gestion de projet",
    intitule: "Piloter un projet évènementiel",
    dureeHeures: 20,
    prixEuros: 0,
    urlMonCompteFormation: "",
  },
];
