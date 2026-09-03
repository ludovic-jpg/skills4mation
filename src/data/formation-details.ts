/**
 * Informations réglementaires des fiches formation (périmètre ICDL / LILATE).
 *
 * Codes vérifiés auprès de France Compétences le 03/09/2026 : ce sont les codes
 * ACTIFS, à ne pas confondre avec ceux, plus anciens, encore affichés ailleurs.
 * Ne jamais fabriquer un code RS par analogie avec une autre langue.
 */

export type FormationDetail = {
  certification?: {
    libelle: string;
    code: string;
    /** Nom légal + nom commercial du certificateur. */
    certificateur: string;
    dateEnregistrement: string;
    validiteJusquau?: string;
    /** Ce que la certification valide. */
    description: string;
    /** Déroulé exact du test. */
    modalitesEvaluation: string;
  };
};

const ICDL_EVAL =
  "Test automatisé en ligne, réalisé en centre habilité ou à distance, sous surveillance humaine. Épreuve de 36 questions en 35 minutes, sous forme de mises en situation professionnelles contextualisées. Seuil de réussite : 75 % (27/36 bonnes réponses). En dessous du seuil, le candidat reçoit un rapport de diagnostic détaillant les compétences acquises et à consolider, sans obtenir la certification.";

const LILATE_EVAL =
  "Test d'une heure, au choix du candidat lors de l'inscription : face-à-face avec un évaluateur (mise en situation simulant des interactions professionnelles), ou version automatisée assistée par intelligence artificielle (IA). Quatre compétences évaluées : accueil, recueil d'informations, transmission de consignes, consultation de documents dans la langue cible. Niveaux délivrés : du CECRL B1 à C2.";

const ICDL_FRANCE = "EURO APTITUDES (nom commercial : ICDL France)";
const LILATE = "LINGUEO (nom commercial : LILATE)";

export const FORMATION_DETAILS: Record<string, FormationDetail> = {
  "formation-creation-de-site-internet": {
    certification: {
      libelle:
        "ICDL - Concevoir, structurer, et gérer un site web avec un outil d'édition de site web",
      code: "RS7525",
      certificateur: ICDL_FRANCE,
      dateEnregistrement: "27/02/2026",
      validiteJusquau: "27/02/2029",
      description:
        "Valide la capacité d'individus à créer et modifier un site web professionnel (hyperliens, tableaux, images, formulaires, HTML, feuilles de style CSS).",
      modalitesEvaluation: ICDL_EVAL,
    },
  },
  // Remplace RS6560 (affiché sur formatrix.fr), inactif depuis le 27/03/2026.
  "formation-maitriser-les-logiciels-de-presentation-pao": {
    certification: {
      libelle: "ICDL - Créer des présentations visuelles et animées avec un logiciel de PréAO",
      code: "RS7524",
      certificateur: ICDL_FRANCE,
      dateEnregistrement: "27/02/2026",
      validiteJusquau: "27/02/2029",
      description:
        "Valide la capacité d'individus à produire des présentations pouvant inclure des objets (images, tableaux), des diagrammes et des organigrammes.",
      modalitesEvaluation: ICDL_EVAL,
    },
  },
  // Remplace RS6564, inactif depuis le 27/03/2026.
  "formation-maitriser-lart-des-tableurs": {
    certification: {
      libelle:
        "ICDL - Organiser, analyser et présenter des données chiffrées avec un logiciel de tableur",
      code: "RS7528",
      certificateur: ICDL_FRANCE,
      dateEnregistrement: "27/02/2026",
      validiteJusquau: "27/02/2029",
      description:
        "Valide la capacité d'individus à manipuler des tableurs dans un cadre professionnel.",
      modalitesEvaluation: ICDL_EVAL,
    },
  },
  // Historique RS6162 → RS6563 → RS7528 : RS7528 est le code actif.
  "formation-traitement-de-texte": {
    certification: {
      libelle:
        "ICDL - Rédiger, structurer et présenter des documents professionnels avec un logiciel de traitement de texte",
      code: "RS7529",
      certificateur: ICDL_FRANCE,
      dateEnregistrement: "27/02/2026",
      validiteJusquau: "27/02/2029",
      description:
        "Valide la capacité d'individus à créer, produire et préparer des documents textuels de manière optimisée.",
      modalitesEvaluation: ICDL_EVAL,
    },
  },
  // Remplace RS6559, inactif depuis le 27/03/2026.
  "formation-en-outils-collaboratifs": {
    certification: {
      libelle: "ICDL - Travailler en équipe à l'aide d'outils collaboratifs en ligne",
      code: "RS7527",
      certificateur: ICDL_FRANCE,
      dateEnregistrement: "27/02/2026",
      validiteJusquau: "27/02/2029",
      description:
        "Valide la capacité d'individus à centraliser, collaborer, et optimiser les tâches collaboratives et les processus métiers.",
      modalitesEvaluation: ICDL_EVAL,
    },
  },
  // Remplace RS6562 (affiché « RSS6562 » par erreur sur formatrix.fr), inactif depuis le 27/03/2026.
  "formation-langlais-des-affaires": {
    certification: {
      libelle: "Test d'aptitude à travailler en anglais - LILATE",
      code: "RS7314",
      certificateur: LILATE,
      dateEnregistrement: "24/09/2025",
      validiteJusquau: "24/09/2030",
      description:
        "Le LILATE® atteste du niveau de langue d'un individu et de sa capacité à travailler dans une langue étrangère, notamment face à des interlocuteurs natifs.",
      modalitesEvaluation: LILATE_EVAL,
    },
  },
  // Remplace RS6139, inactif depuis le 24/10/2025.
  "formation-lespagnol-des-affaires": {
    certification: {
      libelle: "Test d'aptitude à travailler en espagnol - LILATE",
      code: "RS7316",
      certificateur: LILATE,
      dateEnregistrement: "24/09/2025",
      validiteJusquau: "24/09/2030",
      description:
        "Atteste du niveau de langue d'un individu et de sa capacité à travailler dans une langue étrangère.",
      modalitesEvaluation: LILATE_EVAL,
    },
  },
  // Remplace RS6145, inactif depuis le 24/10/2025.
  "formation-lallemand-des-affaires": {
    certification: {
      libelle: "Test d'aptitude à travailler en allemand - LILATE",
      code: "RS7236",
      certificateur: LILATE,
      dateEnregistrement: "18/07/2025",
      validiteJusquau: "18/07/2030",
      description:
        "Atteste du niveau de langue d'un individu et de sa capacité à travailler dans une langue étrangère.",
      modalitesEvaluation: LILATE_EVAL,
    },
  },
  // Remplace RS6140, inactif depuis le 24/10/2025.
  "formation-litalien-des-affaires": {
    certification: {
      libelle: "Test d'aptitude à travailler en italien - LILATE",
      code: "RS7315",
      certificateur: LILATE,
      dateEnregistrement: "24/09/2025",
      validiteJusquau: "24/09/2030",
      description:
        "Atteste du niveau de langue d'un individu et de sa capacité à travailler dans une langue étrangère.",
      modalitesEvaluation: LILATE_EVAL,
    },
  },
  // Remplace RS6141, inactif depuis le 24/10/2025.
  "formation-le-japonais-des-affaires": {
    certification: {
      libelle: "Test d'aptitude à travailler en japonais - LILATE",
      code: "RS7320",
      certificateur: LILATE,
      dateEnregistrement: "24/09/2025",
      validiteJusquau: "24/09/2030",
      description:
        "Atteste du niveau de langue d'un individu et de sa capacité à travailler dans une langue étrangère.",
      modalitesEvaluation: LILATE_EVAL,
    },
  },
  // Remplace RS6142, inactif depuis le 24/10/2025.
  "formation-le-mandarin-des-affaires": {
    certification: {
      libelle: "Test d'aptitude à travailler en chinois - LILATE",
      code: "RS7318",
      certificateur: LILATE,
      dateEnregistrement: "24/09/2025",
      validiteJusquau: "24/09/2030",
      description:
        "Atteste du niveau de langue d'un individu et de sa capacité à travailler dans une langue étrangère.",
      modalitesEvaluation: LILATE_EVAL,
    },
  },
  // Code LILATE portugais à demander via l'espace partenaire : champ volontairement vide.
  "formation-le-portugais-des-affaires": {},
  // Code LILATE version FLE à demander via l'espace partenaire : champ volontairement vide.
  "formation-le-francais-des-affaires": {},
};

export function formationDetail(slug: string): FormationDetail | undefined {
  return FORMATION_DETAILS[slug];
}
