export type Apprenant = {
  /** Prénom et nom (affiché tel quel dans les documents). */
  nom: string;
  poste: string;
  email?: string;
  telephone?: string;
  /** Numéro de dossier CPF le cas échéant. */
  numeroCpf?: string;
  /** Certification visée (ex. ICDL). */
  certification?: string;
};

export type Session = {
  date: string;
  heureDebut: string;
  heureFin: string;
  lieu?: string;
  module?: string;
};

export type ModeFinancement = "opco" | "cpf" | "fonds_propres";

export type DossierDonnees = {
  /** Numéro de dossier attribué par Skills4mation à la validation (séquence `adf_numero_seq`). */
  adf: string;
  /** Date d'attribution du numéro ADF (ISO), renseignée par le back-office. */
  adfAttribueLe?: string;
  organisme: string;
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
    /** Le formateur assume la création et la fourniture du lien de connexion. */
    lienResponsableFormateur: boolean;
    /** Visuel de la formation (adresse publique) repris sur le site et les documents. */
    visuelUrl: string;
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
    modeFinancement: ModeFinancement;
    montantPrisEnCharge: string;
    /** Identifiant de la certification visée (table `certifications`). */
    certificationCode: string | null;
    /**
     * Coût de la certification (ICDL), strictement distinct du montant pris en charge :
     * il apparaît toujours comme une ligne séparée sur les documents.
     */
    coutCertification: string;
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
    /** Test de positionnement enregistré associé au dossier (table `outils_positionnement`). */
    testPositionnementId?: string;
  };
  facture: {
    numero: string;
    date: string;
    montantHt: string;
    montantTtc: string;
    iban: string;
  };
};

export const DONNEES_VIDES: DossierDonnees = {
  adf: "",
  organisme: "Skills4mation",
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
    lienResponsableFormateur: true,
    visuelUrl: "",
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
    modeFinancement: "opco",
    montantPrisEnCharge: "",
    certificationCode: null,
    coutCertification: "",
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
  facture: { numero: "", date: "", montantHt: "", montantTtc: "", iban: "" },
};

/** Fusionne des données partielles (issues de la base) avec la structure complète. */
export function mergeDonnees(raw: unknown): DossierDonnees {
  const source = (raw ?? {}) as Partial<DossierDonnees>;
  return {
    ...DONNEES_VIDES,
    ...source,
    organisme: source.organisme || DONNEES_VIDES.organisme,
    entreprise: { ...DONNEES_VIDES.entreprise, ...(source.entreprise ?? {}) },
    formation: { ...DONNEES_VIDES.formation, ...(source.formation ?? {}) },
    lieu: { ...DONNEES_VIDES.lieu, ...(source.lieu ?? {}) },
    tarifs: { ...DONNEES_VIDES.tarifs, ...(source.tarifs ?? {}) },
    convention: { ...DONNEES_VIDES.convention, ...(source.convention ?? {}) },
    formateur: { ...DONNEES_VIDES.formateur, ...(source.formateur ?? {}) },
    besoins: { ...DONNEES_VIDES.besoins, ...(source.besoins ?? {}) },
    facture: { ...DONNEES_VIDES.facture, ...(source.facture ?? {}) },
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

export const FINANCEMENT_LABELS: Record<ModeFinancement, string> = {
  opco: "OPCO / financement entreprise",
  cpf: "CPF (Compte Personnel de Formation)",
  fonds_propres: "Fonds propres",
};

/** Le prix / les heures en présentiel ne sont affichés que si la formation en comporte. */
export function aDuPresentiel(d: DossierDonnees) {
  const heures = Number(String(d.formation.heuresPresentiel).replace(",", "."));
  return (
    d.formation.format !== "distanciel" &&
    ((!Number.isNaN(heures) && heures > 0) || Boolean(d.tarifs.prixPresentiel))
  );
}

export function estCpf(d: DossierDonnees) {
  return d.tarifs.modeFinancement === "cpf";
}

/** Vrai dès qu'une certification du catalogue est rattachée au dossier. */
export function viseCertification(d: DossierDonnees) {
  return (
    Boolean(d.tarifs.certificationCode) ||
    d.apprenants.some((a) => (a.certification ?? "").trim().length > 0)
  );
}

/** Nom de rangement normalisé : [Nom_Apprenant]_[Nom_Formation]_[Date]. */
export function nomRangement(apprenant: string, formation: string, date: string) {
  const clean = (v: string) =>
    v
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  return `${clean(apprenant) || "Apprenant"}_${clean(formation) || "Formation"}_${clean(date) || "sans_date"}`;
}
