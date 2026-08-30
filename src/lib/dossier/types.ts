export type Apprenant = {
  nom: string;
  poste: string;
};

export type Session = {
  date: string;
  heureDebut: string;
  heureFin: string;
  lieu?: string;
};

export type DossierDonnees = {
  adf: string;
  entreprise: {
    nom: string;
    nomCommercial: string;
    adresse: string;
    siret: string;
    prenomRepresentant: string;
    nomRepresentant: string;
    telephone: string;
    email: string;
  };
  formation: {
    titre: string;
    objectifs: string;
    niveau: string;
    prerequis: string;
    dateDebut: string;
    dateFin: string;
    heuresTotal: string;
    heuresPresentiel: string;
    nbJours: string;
    format: "presentiel" | "distanciel" | "mixte";
    lienConnexion: string;
  };
  lieu: {
    intitule: string;
    adresse: string;
    siret: string;
  };
  apprenants: Apprenant[];
  sessions: Session[];
  tarifs: {
    prixUnitaire: string;
    nbStagiaires: string;
    prixTotal: string;
    prixPresentiel: string;
    opco: string;
    subrogation: "oui" | "non";
  };
  convention: {
    lieu: string;
    date: string;
  };
  formateur: {
    prenom: string;
    nom: string;
    entreprise: string;
    adresse: string;
    siret: string;
    nda: string;
    ndaRegion: string;
    email: string;
    telephone: string;
    coutHoraire: string;
    totalRecette: string;
    dateMissionOuverte: string;
  };
  besoins: {
    contexte: string;
    attentes: string;
    niveauDepart: string;
    contraintes: string;
    modalitesEvaluation: string;
  };
};

export const DONNEES_VIDES: DossierDonnees = {
  adf: "",
  entreprise: {
    nom: "",
    nomCommercial: "",
    adresse: "",
    siret: "",
    prenomRepresentant: "",
    nomRepresentant: "",
    telephone: "",
    email: "",
  },
  formation: {
    titre: "",
    objectifs: "",
    niveau: "",
    prerequis: "",
    dateDebut: "",
    dateFin: "",
    heuresTotal: "",
    heuresPresentiel: "",
    nbJours: "",
    format: "presentiel",
    lienConnexion: "",
  },
  lieu: { intitule: "", adresse: "", siret: "" },
  apprenants: [],
  sessions: [],
  tarifs: {
    prixUnitaire: "",
    nbStagiaires: "",
    prixTotal: "",
    prixPresentiel: "",
    opco: "",
    subrogation: "non",
  },
  convention: { lieu: "", date: "" },
  formateur: {
    prenom: "",
    nom: "",
    entreprise: "",
    adresse: "",
    siret: "",
    nda: "",
    ndaRegion: "",
    email: "",
    telephone: "",
    coutHoraire: "",
    totalRecette: "",
    dateMissionOuverte: "",
  },
  besoins: {
    contexte: "",
    attentes: "",
    niveauDepart: "",
    contraintes: "",
    modalitesEvaluation: "",
  },
};

/** Fusionne des données partielles (issues de la base) avec la structure complète. */
export function mergeDonnees(raw: unknown): DossierDonnees {
  const source = (raw ?? {}) as Partial<DossierDonnees>;
  return {
    ...DONNEES_VIDES,
    ...source,
    entreprise: { ...DONNEES_VIDES.entreprise, ...(source.entreprise ?? {}) },
    formation: { ...DONNEES_VIDES.formation, ...(source.formation ?? {}) },
    lieu: { ...DONNEES_VIDES.lieu, ...(source.lieu ?? {}) },
    tarifs: { ...DONNEES_VIDES.tarifs, ...(source.tarifs ?? {}) },
    convention: { ...DONNEES_VIDES.convention, ...(source.convention ?? {}) },
    formateur: { ...DONNEES_VIDES.formateur, ...(source.formateur ?? {}) },
    besoins: { ...DONNEES_VIDES.besoins, ...(source.besoins ?? {}) },
    apprenants: Array.isArray(source.apprenants) ? source.apprenants : [],
    sessions: Array.isArray(source.sessions) ? source.sessions : [],
  };
}

export function dateFr(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("fr-FR");
}

export function euros(value?: string | null) {
  if (!value) return "—";
  const number = Number(String(value).replace(",", "."));
  if (Number.isNaN(number)) return value;
  return `${number.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

export const FORMAT_LABELS: Record<DossierDonnees["formation"]["format"], string> = {
  presentiel: "Présentiel",
  distanciel: "Distanciel",
  mixte: "Mixte (présentiel et distanciel)",
};
