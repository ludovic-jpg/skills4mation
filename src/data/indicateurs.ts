/**
 * Indicateurs de résultats Qualiopi (indicateur 2) — source unique pour tout le site.
 *
 * Calculés le 12/10/2026 à partir des dossiers de formation ADF (Drive Formatrix) de l'organisme Back to Business – Formatrix (groupe Formatrix, dont Skills4mation est un nom commercial),
 * grilles d'évaluation à chaud (F5) relues. Ne jamais afficher de chiffre de résultat
 * ailleurs que depuis ce fichier, et mettre à jour la date à chaque recalcul.
 */

export const INDICATEURS_MAJ = "12 octobre 2026";

export const PERIODE = {
  libelle: "12 mois glissants",
  debut: "12/10/2025",
  fin: "11/10/2026",
  dernierDossierClos: "05/07/2026",
} as const;

export type Indicateur = {
  id: string;
  valeur: string;
  libelle: string;
  methode: string;
  numerateur: number;
  denominateur: number;
};

export const INDICATEURS: Indicateur[] = [
  {
    id: "note-moyenne",
    valeur: "9,6/10",
    libelle: "Note moyenne de satisfaction à chaud",
    methode:
      "Somme des notes globales sur 10 attribuées en fin de formation, divisée par le nombre de notes exprimées (98) : 944,5 ÷ 98 = 9,64. Équivaut à 4,8/5. Sur les 120 grilles remplies, 22 ne comportent pas de note globale et ne sont pas comptées.",
    numerateur: 944.5,
    denominateur: 98,
  },
  {
    id: "taux-satisfaction",
    valeur: "99 %",
    libelle: "Répondants satisfaits (note de 8/10 ou plus)",
    methode:
      "Nombre de répondants ayant attribué une note globale de 8/10 ou plus (97), divisé par le nombre de répondants ayant exprimé une note (98).",
    numerateur: 97,
    denominateur: 98,
  },
  {
    id: "taux-reponse",
    valeur: "95 %",
    libelle: "Taux de réponse au questionnaire de fin de formation",
    methode:
      "Nombre de dossiers dont la grille d'évaluation à chaud est remplie (120), divisé par le nombre de dossiers de formation clos sur la période (126).",
    numerateur: 120,
    denominateur: 126,
  },
];

/** Indicateurs non publiés : la donnée n'est pas encore collectée de façon fiable. */
export const INDICATEURS_EN_CONSTITUTION = [
  {
    libelle: "Taux d'atteinte des objectifs pédagogiques",
    raison:
      "Le seuil de réussite des évaluations des acquis est en cours d'harmonisation ; l'indicateur sera publié à partir des sessions démarrant après le 1er novembre 2026.",
  },
  {
    libelle: "Taux d'obtention des certifications (formations certifiantes)",
    raison:
      "Les résultats des sessions d'examen sont en cours de consolidation auprès des certificateurs.",
  },
  {
    libelle: "Taux d'abandon",
    raison:
      "L'enregistrement systématique du statut de sortie de chaque stagiaire démarre au 1er novembre 2026 ; l'indicateur sera publié sur une période complète.",
  },
  {
    libelle: "Satisfaction à froid (3 mois après la formation)",
    raison: "Le recueil à froid est en cours de généralisation.",
  },
];
