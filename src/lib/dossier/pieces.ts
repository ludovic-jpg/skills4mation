export type PieceStatut = "a_generer" | "en_attente_tally" | "rapport_a_classer" | "complete";

/** Source de la pièce : générée par l'app, collectée auprès des apprenants, produite hors app, ou tableur. */
export type PieceSource = "pdf" | "tally" | "externe" | "tableur";

/**
 * Mode de traitement de la réponse de l'apprenant :
 * - `signature` : PDF généré, imprimé/signé puis redéposé (flux historique, inchangé) ;
 * - `formulaire` : questionnaire rempli en ligne dans l'espace apprenant, PDF récapitulatif
 *   généré automatiquement à la soumission.
 */
export type PieceMode = "signature" | "formulaire";

export type PieceDef = {
  code: string;
  label: string;
  source: PieceSource;
  /** Génération PDF disponible dans cette phase. */
  generable: boolean;
  description: string;
  matrice?: string;
  statutInitial: PieceStatut;
  mode: PieceMode;
};

export const PIECE_STATUTS: Record<PieceStatut, { label: string; tone: string }> = {
  a_generer: { label: "À générer", tone: "bg-muted text-muted-foreground border-border" },
  en_attente_tally: {
    label: "En attente de retour",
    tone: "bg-accent text-accent-foreground border-accent",
  },
  rapport_a_classer: {
    label: "Rapport à classer",
    tone: "bg-cta/15 text-cta-foreground border-cta/40",
  },
  complete: { label: "Complété", tone: "bg-success/12 text-success border-success/30" },
};

export const PIECE_SOURCES: Record<PieceSource, string> = {
  pdf: "Généré par le portail",
  tally: "Questionnaire à collecter",
  externe: "Pièce externe à déposer",
  tableur: "Tableur (Excel)",
};

export const PIECES: PieceDef[] = [
  {
    code: "1A",
    label: "Convention de formation",
    source: "pdf",
    generable: true,
    mode: "signature",
    description:
      "Convention entre l'organisme et l'entreprise cliente : formation, effectif, tarifs, OPCO et subrogation.",
    matrice:
      "https://docs.google.com/document/d/1u0DEfScK9DgclShA5qJdRBUJ7kZ-hBpp3SQv9JhkqVQ/edit?usp=sharing",
    statutInitial: "a_generer",
  },
  {
    code: "1B",
    label: "Attestation de fin de formation",
    source: "pdf",
    generable: false,
    mode: "signature",
    description:
      "Attestation d'assiduité et de fin de formation remise à l'apprenant en fin de parcours.",
    statutInitial: "a_generer",
  },
  {
    code: "1C",
    label: "Programme de formation",
    source: "pdf",
    generable: true,
    mode: "signature",
    description:
      "Programme détaillé de l'action : objectifs, prérequis, contenus, durée, modalités pédagogiques et d'évaluation.",
    statutInitial: "a_generer",
  },
  {
    code: "2",
    label: "Planning de formation",
    source: "pdf",
    generable: true,
    mode: "signature",
    description:
      "Planning des sessions (jusqu'à 20 créneaux) avec l'effectif complet des stagiaires. Créneaux saisis dans le formulaire du dossier.",
    matrice:
      "https://docs.google.com/document/d/1Iw-MICtpmw1owUUtp09sYaqmMud9iv0DWwIc-Es-f1s/edit?usp=sharing",
    statutInitial: "a_generer",
  },
  {
    code: "3A",
    label: "Convocation des stagiaires",
    source: "pdf",
    generable: true,
    mode: "signature",
    description:
      "Convocation nominative par stagiaire, avec lieu ou lien de connexion (à la charge du formateur) et coordonnées du formateur.",
    matrice:
      "https://docs.google.com/document/d/1eVg53BML2rbZKXqPPRys97nOhN1vmzoYvQwDs6Uvtnc/edit?usp=sharing",
    statutInitial: "a_generer",
  },
  {
    code: "3B",
    label: "Certification ICDL",
    source: "pdf",
    generable: false,
    mode: "signature",
    description:
      "Fiche d'information et inscription à la certification ICDL du ou des candidats du dossier.",
    statutInitial: "a_generer",
  },
  {
    code: "F0A",
    label: "Recueil des besoins",
    source: "pdf",
    generable: true,
    mode: "formulaire",
    description:
      "Analyse du besoin avant formation, remplie en ligne par l'apprenant : contexte, attentes, niveau de départ, contraintes.",
    matrice:
      "https://docs.google.com/document/d/1l3JgVux3vUfDufcbIegrjvhr7PBMJCwcBkHEe_gkaC0/edit?usp=sharing",
    statutInitial: "a_generer",
  },
  {
    code: "F0C",
    label: "Ordre de mission / sous-traitance formateur",
    source: "pdf",
    generable: true,
    mode: "signature",
    description:
      "Contrat de sous-traitance du formateur : NDA, coût horaire, recette totale, effectif et objectifs pédagogiques.",
    matrice:
      "https://docs.google.com/document/d/1kjwPyK1dNTPNnS0BGNOf828rOqPGmDErV0Ol9dOFw78/edit?usp=sharing",
    statutInitial: "a_generer",
  },
  {
    code: "F3",
    label: "Relevé de fréquentation / émargement",
    source: "pdf",
    generable: true,
    mode: "signature",
    description:
      "Feuille d'émargement par session, avec une ligne de signature par apprenant et par créneau.",
    matrice:
      "https://docs.google.com/document/d/1GmQ_lxTWecKOmbG8p2yHr9h9ooKMaTbTahtjmIIkKGU/edit?usp=sharing",
    statutInitial: "a_generer",
  },
  {
    code: "F0B",
    label: "Évaluation / rapport de compétences",
    source: "externe",
    generable: false,
    mode: "signature",
    description:
      "Rapport d'évaluation à déposer dans le dossier de l'apprenant (classement automatique dans le Drive à venir).",
    statutInitial: "rapport_a_classer",
  },
  {
    code: "F5",
    label: "Satisfaction à chaud",
    source: "tally",
    generable: false,
    mode: "formulaire",
    description:
      "Questionnaire de satisfaction en fin de session, rempli en ligne par l'apprenant dans son espace.",
    matrice:
      "https://docs.google.com/document/d/1xIHyLHT4WHcXJGG7qHlHAhA55yubwS1bqNOFMWPmid8/edit?usp=sharing",
    statutInitial: "en_attente_tally",
  },
  {
    code: "F6",
    label: "Rapport de compétences ICDL",
    source: "externe",
    generable: false,
    mode: "signature",
    description:
      "Rapport de compétences remis à l'issue de l'examen ICDL, à déposer dans le dossier de l'apprenant.",
    statutInitial: "rapport_a_classer",
  },
  {
    code: "F7",
    label: "Satisfaction à froid",
    source: "tally",
    generable: false,
    mode: "formulaire",
    description: "Questionnaire de satisfaction à 3 mois, généré par le portail et collecté auprès des apprenants.",
    matrice:
      "https://docs.google.com/document/d/1cEocCoc_CAdOTZGNQMaGVyTdwngVUaVoWXc3xfD4Z3g/edit?usp=sharing",
    statutInitial: "en_attente_tally",
  },
  {
    code: "F9",
    label: "Facture formateur",
    source: "externe",
    generable: false,
    mode: "signature",
    description: "Facture émise par le formateur, à déposer au dossier avant mise en paiement.",
    statutInitial: "a_generer",
  },
  {
    code: "CERT-CONV",
    label: "Convocation à l'examen de certification",
    source: "pdf",
    generable: true,
    mode: "signature",
    description:
      "Convocation à la session d'examen de certification, organisée par Skills4mation à une date distincte de la formation. Envoi strictement manuel, jamais déclenché par un changement de statut.",
    statutInitial: "a_generer",
  },
  {
    code: "TP",
    label: "Test de positionnement",
    source: "tableur",
    generable: false,
    mode: "signature",
    description: "Test de positionnement au format tableur, à déposer complété.",
    statutInitial: "a_generer",
  },
  {
    code: "EA",
    label: "Évaluation des acquis",
    source: "tableur",
    generable: false,
    mode: "signature",
    description: "Évaluation des acquis au format tableur, à déposer complétée.",
    statutInitial: "a_generer",
  },
];

export const PIECES_GENERABLES = PIECES.filter((p) => p.generable);

/**
 * Pièces exigées avant de pouvoir demander le paiement du dossier :
 * checklist de complétude Qualiopi affichée sur la fiche dossier et le Kanban.
 */
export const PIECES_REQUISES_PAIEMENT = [
  "1A",
  "1B",
  "2",
  "3A",
  "3B",
  "F0B",
  "F0C",
  "F3",
  "F5",
  "F6",
  "F7",
  "F9",
];

export function pieceLabel(code: string) {
  return PIECES.find((p) => p.code === code)?.label ?? code;
}

/** Mode de traitement de la pièce (signature manuscrite scannée ou formulaire en ligne). */
export function pieceMode(code: string): PieceMode {
  return PIECES.find((p) => p.code === code)?.mode ?? "signature";
}
