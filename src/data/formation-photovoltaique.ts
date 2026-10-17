/**
 * Données du parcours « Formation installateur / poseur de panneaux photovoltaïques ».
 * Source unique pour les cinq pages (pilier, programme, financement, prérequis, FAQ),
 * y compris les données structurées schema.org.
 *
 * Garde-fous éditoriaux (décision 17/10/2026) : le parcours est « en cours d'ouverture ».
 * Ne jamais écrire que Skills4mation est habilité, partenaire ou organisme préparateur de RS7340,
 * ni que la formation est éligible au CPF, ni afficher un tarif ou des dates de session.
 * Durées en heures : indicatives, à confirmer.
 */
import { VISUELS_PV } from "@/data/photovoltaique-visuels";

export const BASE_URL = "https://skills4mation.com";
export const DATE_MAJ_ISO = "2026-10-17";
export const DATE_MAJ_LIBELLE = "17 octobre 2026";
export const RACINE_PV = "/formations/installateur-panneaux-photovoltaiques";

export type CheminPv =
  | "/formations/installateur-panneaux-photovoltaiques"
  | "/formations/installateur-panneaux-photovoltaiques/programme"
  | "/formations/installateur-panneaux-photovoltaiques/financement"
  | "/formations/installateur-panneaux-photovoltaiques/prerequis-habilitations"
  | "/formations/installateur-panneaux-photovoltaiques/faq";

export const NOM_PARCOURS = "Installateur / poseur de panneaux photovoltaïques";

export const STATUT_OUVERTURE = "Parcours en cours d'ouverture : demandez à être informé";
export const MENTION_TARIF_DATES = "Tarif et dates : nous contacter.";
export const MENTION_CPF = "Éligibilité au CPF à confirmer.";

/** Pages du parcours (navigation interne et maillage). */
export const PAGES_PV: {
  to: CheminPv;
  titreCourt: string;
  resume: string;
}[] = [
  {
    to: "/formations/installateur-panneaux-photovoltaiques/programme",
    titreCourt: "Programme",
    resume: "Les 9 modules, leurs objectifs et la durée indicative de 157 heures.",
  },
  {
    to: "/formations/installateur-panneaux-photovoltaiques/prerequis-habilitations",
    titreCourt: "Prérequis et habilitations",
    resume: "Ce qu'il faut avoir avant de s'inscrire, et ce qui relève de l'employeur.",
  },
  {
    to: "/formations/installateur-panneaux-photovoltaiques/financement",
    titreCourt: "Financement",
    resume: "OPCO, France Travail, CPF sous réserve et financement employeur.",
  },
  {
    to: "/formations/installateur-panneaux-photovoltaiques/faq",
    titreCourt: "Questions fréquentes",
    resume: "Durée, prérequis, évaluation, différences RS, QualiPV et CQP.",
  },
];

/* ------------------------------------------------------------------ */
/* Certification visée                                                 */
/* ------------------------------------------------------------------ */

export const CERTIFICATION = {
  code: "RS7340",
  intitule: "Poser et installer des panneaux photovoltaïques",
  certificateur: "INITIA FORMATION",
  registre: "Répertoire spécifique de France Compétences",
  finEnregistrement: "27/10/2027",
  derniereDelivrance: "26/04/2028",
  voieAcces: "Formation continue",
  source: "https://www.francecompetences.fr/recherche/rs/7340",
  evaluation: {
    qcm: 30,
    pratique: 70,
    noteMinimale: "12/20 à l'épreuve et au global",
    notesFormation: 30,
  },
} as const;

export const COMPETENCES = [
  "Identifier les composants d'un système photovoltaïque",
  "Appliquer la réglementation et les normes",
  "Travailler en sécurité en hauteur",
  "Calculer l'inclinaison et l'orientation des panneaux",
  "Installer les panneaux",
  "Câbler et mettre en service l'installation",
  "Dépanner avec des outils de diagnostic",
] as const;

/* ------------------------------------------------------------------ */
/* Textes réutilisables                                                */
/* ------------------------------------------------------------------ */

/** « En bref » : 40 à 60 mots. */
export const EN_BREF =
  "Ce parcours, en cours d'ouverture, est construit autour des sept compétences de la certification RS7340 « Poser et installer des panneaux photovoltaïques », délivrée par INITIA FORMATION : composants, normes, sécurité en hauteur, dimensionnement, pose, câblage, mise en service et dépannage. Durée indicative : 157 heures. Tarif et dates : nous contacter.";

export const INTRO_HERO =
  "Un parcours pour apprendre à poser, câbler et mettre en service des panneaux photovoltaïques, structuré autour d'un référentiel enregistré au Répertoire spécifique de France Compétences.";

export const AVERTISSEMENT_LIMITES = {
  titre: "Ce que cette formation ne permet pas",
  intro:
    "Pour éviter toute confusion, voici ce que ce parcours, et la certification RS7340, ne remplacent pas :",
  points: [
    "La qualification QualiPV / RGE : elle concerne l'entreprise (et non la personne), qui doit disposer d'un référent technique formé, et fait l'objet d'une démarche distincte.",
    "L'assurance décennale : c'est une obligation de l'entreprise qui réalise les travaux, indépendante de toute formation.",
    "L'habilitation électrique : elle est obligatoire pour intervenir sur une installation, elle est délivrée sous la responsabilité de l'employeur après une formation dédiée, hors de ce parcours.",
  ],
} as const;

export const HANDICAP_MENTION =
  "Toutes nos formations sont accessibles, sous réserve d'étude préalable des besoins d'aménagement. Pour échanger avec notre référent handicap avant toute inscription, utilisez la page contact : nous vous répondrons personnellement.";

export const AUDIENCE = [
  "Électriciens et professionnels du bâtiment qui veulent se positionner sur la pose de panneaux photovoltaïques.",
  "Salariés dont l'entreprise développe une activité solaire et souhaite structurer les compétences de ses équipes.",
  "Personnes en reconversion disposant déjà d'une expérience en électricité ou dans le bâtiment, ou d'un CAP électricité ou équivalent.",
  "Demandeurs d'emploi qui construisent un projet dans la transition énergétique, après étude de leur situation avec un conseiller.",
] as const;

export const PREREQUIS_CERTIFICATION = [
  "Au moins 2 ans d'expérience en électricité ou dans le bâtiment, ou un CAP électricité ou équivalent.",
  "Aisance au travail en hauteur.",
  "Bases en électricité.",
  "Maîtrise du français écrit.",
] as const;

export const PREREQUIS_REGLEMENTAIRES = [
  "CACES 1B-3B et/ou R408 (selon le matériel de levage ou d'accès utilisé).",
  "Autorisation de travail en hauteur.",
  "Habilitation électrique BP ou BR P.",
] as const;

export const NOTE_HABILITATION =
  "L'habilitation électrique relève de l'employeur, qui la délivre après une formation assurée par des organismes spécialisés. Ces prérequis sont à obtenir avant le parcours ou en parallèle, mais ne font pas partie du programme décrit ici.";

/* ------------------------------------------------------------------ */
/* Programme                                                           */
/* ------------------------------------------------------------------ */

export type ModulePv = {
  code: string;
  titre: string;
  heures: number;
  competence: string | null;
  objectifs: string[];
};

export const MODULES: ModulePv[] = [
  {
    code: "M0",
    titre: "Positionnement et projet",
    heures: 3,
    competence: null,
    objectifs: [
      "Situer son niveau et vérifier les prérequis de la certification.",
      "Formuler son projet professionnel et ses besoins d'aménagement éventuels.",
    ],
  },
  {
    code: "M1",
    titre: "Composants d'un système photovoltaïque",
    heures: 14,
    competence: COMPETENCES[0],
    objectifs: [
      "Reconnaître modules, onduleurs, protections, câbles et fixations.",
      "Expliquer le rôle de chaque composant dans la chaîne de production.",
    ],
  },
  {
    code: "M2",
    titre: "Réglementation et normes",
    heures: 14,
    competence: COMPETENCES[1],
    objectifs: [
      "Repérer les textes et normes applicables à une installation.",
      "Distinguer les obligations de la personne, de l'entreprise et du chantier.",
    ],
  },
  {
    code: "M3",
    titre: "Sécurité et travail en hauteur",
    heures: 21,
    competence: COMPETENCES[2],
    objectifs: [
      "Évaluer les risques d'un chantier en toiture.",
      "Mettre en place protections collectives et individuelles et les contrôler.",
    ],
  },
  {
    code: "M4",
    titre: "Dimensionnement : inclinaison et orientation",
    heures: 14,
    competence: COMPETENCES[3],
    objectifs: [
      "Déterminer l'inclinaison et l'orientation adaptées à un site.",
      "Prendre en compte ombrages, contraintes de toiture et implantation.",
    ],
  },
  {
    code: "M5",
    titre: "Pose des panneaux",
    heures: 35,
    competence: COMPETENCES[4],
    objectifs: [
      "Préparer le chantier et poser le système de fixation.",
      "Installer et aligner les panneaux en respectant les consignes du fabricant.",
    ],
  },
  {
    code: "M6",
    titre: "Câblage et mise en service",
    heures: 35,
    competence: COMPETENCES[5],
    objectifs: [
      "Câbler les chaînes de panneaux et raccorder l'onduleur et les protections.",
      "Contrôler l'installation et la mettre en service selon une procédure rigoureuse.",
    ],
  },
  {
    code: "M7",
    titre: "Diagnostic et dépannage",
    heures: 14,
    competence: COMPETENCES[6],
    objectifs: [
      "Utiliser des outils de mesure et de diagnostic.",
      "Identifier une panne courante et proposer une action corrective.",
    ],
  },
  {
    code: "M8",
    titre: "Préparation à l'évaluation finale",
    heures: 7,
    competence: null,
    objectifs: [
      "S'entraîner au QCM et à la mise en situation pratique.",
      "Faire le point sur les acquis et les axes de progression.",
    ],
  },
];

export const TOTAL_HEURES = MODULES.reduce((somme, m) => somme + m.heures, 0);

export const EVALUATION = {
  titre: "Évaluation",
  intro:
    "Le référentiel RS7340 prévoit deux épreuves, complétées par les notes obtenues en formation :",
  points: [
    "QCM : 30 % de la note de l'épreuve.",
    "Mise en situation pratique sur plateau technique : 70 %.",
    "Notes de formation : 30 % de la note finale.",
    "Note minimale requise : 12/20 à l'épreuve et au global.",
  ],
  precision:
    "Les modalités exactes de présentation à la certification seront précisées à l'ouverture du parcours. L'organisme certificateur reste INITIA FORMATION.",
} as const;

/* ------------------------------------------------------------------ */
/* Financement                                                         */
/* ------------------------------------------------------------------ */

export const CANAUX_FINANCEMENT = [
  {
    titre: "OPCO (salariés)",
    texte:
      "L'entreprise peut solliciter son opérateur de compétences pour une prise en charge, dans le cadre de son plan de développement des compétences. La décision revient à l'OPCO, sur dossier.",
  },
  {
    titre: "France Travail (demandeurs d'emploi)",
    texte:
      "Un projet de formation peut être étudié avec votre conseiller, selon votre situation et les dispositifs en vigueur dans votre région. L'accord de financement est propre à chaque dossier.",
  },
  {
    titre: "CPF, sous réserve d'éligibilité",
    texte:
      "L'éligibilité de ce parcours au CPF reste à confirmer : nous ne pouvons pas, à ce jour, affirmer qu'il peut être financé par ce dispositif. Vérifiez toujours sur moncompteformation.gouv.fr.",
  },
  {
    titre: "Financement employeur",
    texte:
      "L'employeur peut financer directement la formation d'un salarié, avec ou sans cofinancement d'un OPCO.",
  },
] as const;

export const CPF_RESTE_A_CHARGE = {
  montant: "150 €",
  depuis: "2 avril 2026",
  texte:
    "Pour les formations éligibles au CPF, un reste à charge de 150 € s'applique aux dossiers déposés à partir du 2 avril 2026. Les demandeurs d'emploi et les salariés dont l'employeur effectue un abondement en sont exonérés.",
  source: "https://www.capeb.fr/actualites/cpf-augmentation-du-reste-a-charge-des-le-02-avril-2026",
  sourceLibelle: "CAPEB, reste à charge CPF au 2 avril 2026",
  verification: "https://www.moncompteformation.gouv.fr",
} as const;

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export type QuestionPv = { q: string; a: string };

export const FAQ_PV: QuestionPv[] = [
  {
    q: "Quelle est la durée de la formation ?",
    a: "La durée indicative du parcours est de 157 heures, réparties en 9 modules. Cette durée reste à confirmer à l'ouverture du parcours et pourra être ajustée selon votre positionnement.",
  },
  {
    q: "Quels sont les prérequis pour suivre ce parcours ?",
    a: "La certification RS7340 suppose au moins 2 ans d'expérience en électricité ou dans le bâtiment, ou un CAP électricité ou équivalent, de l'aisance au travail en hauteur, des bases en électricité et une bonne maîtrise du français écrit.",
  },
  {
    q: "Comment la certification RS7340 est-elle évaluée ?",
    a: "Elle repose sur un QCM (30 %) et une mise en situation pratique sur plateau technique (70 %). Les notes de formation comptent pour 30 % de la note finale, et la note minimale est de 12/20 à l'épreuve et au global.",
  },
  {
    q: "Quelle différence entre RS7340, QualiPV et un CQP ?",
    a: "RS7340 est une certification de compétences enregistrée au Répertoire spécifique de France Compétences, détenue par une personne. QualiPV (dans le cadre RGE) est une qualification délivrée à une entreprise, qui doit disposer d'un référent technique formé. Un CQP est une certification de branche professionnelle, avec son propre référentiel et ses propres modalités d'accès.",
  },
  {
    q: "Cette formation peut-elle être financée par le CPF ?",
    a: "L'éligibilité au CPF est à confirmer. Selon votre situation, d'autres financements peuvent être étudiés : OPCO pour les salariés, France Travail pour les demandeurs d'emploi, financement par l'employeur. Reportez-vous à la page Financement.",
  },
  {
    q: "L'habilitation électrique est-elle comprise dans la formation ?",
    a: "Non. L'habilitation électrique (BP ou BR P) relève de l'employeur et d'organismes spécialisés. Elle est à obtenir avant le parcours ou en parallèle, tout comme le CACES 1B-3B et/ou R408 et l'autorisation de travail en hauteur.",
  },
  {
    q: "À qui s'adresse ce parcours ?",
    a: "Aux électriciens et professionnels du bâtiment, aux salariés dont l'entreprise développe une activité solaire, aux personnes en reconversion ayant déjà une expérience du métier et aux demandeurs d'emploi dont le projet a été étudié avec un conseiller.",
  },
  {
    q: "Le parcours est-il déjà ouvert ? Quels sont les tarifs et les dates ?",
    a: "Le parcours est en cours d'ouverture. Aucun tarif ni aucune date de session n'est annoncé à ce jour : demandez à être informé via la page contact et nous reviendrons vers vous dès que les modalités seront arrêtées.",
  },
  {
    q: "Cette formation remplace-t-elle la qualification QualiPV/RGE ou l'assurance décennale ?",
    a: "Non. La qualification QualiPV/RGE et l'assurance décennale concernent l'entreprise qui réalise les travaux. La formation développe les compétences de la personne, elle ne remplace aucune de ces obligations.",
  },
  {
    q: "Comment obtenir des informations ou un aménagement en situation de handicap ?",
    a: "Écrivez-nous depuis la page contact en indiquant votre projet. Notre référent handicap étudie avec vous les aménagements possibles avant toute inscription.",
  },
];

/** Extrait de la FAQ pour la page pilier. */
export const FAQ_PILIER: QuestionPv[] = FAQ_PV.filter((_, i) => [0, 1, 4, 7].includes(i));

/* ------------------------------------------------------------------ */
/* Métadonnées et données structurées                                  */
/* ------------------------------------------------------------------ */

export type PageMeta = {
  path: CheminPv;
  titre: string; // <= 60 caractères
  description: string; // <= 155 caractères
  fil: { name: string; path: string }[]; // fil d'Ariane, hors accueil
};

const FIL_BASE = [
  { name: "Formations", path: "/formations" },
  { name: "Installateur de panneaux photovoltaïques", path: RACINE_PV },
];

export const META_PV: Record<
  "pilier" | "programme" | "financement" | "prerequis" | "faq",
  PageMeta
> = {
  pilier: {
    path: RACINE_PV,
    titre: "Formation installateur de panneaux photovoltaïques",
    description:
      "Parcours de 157 h (indicatif) pour poser, câbler et mettre en service des panneaux photovoltaïques, autour de RS7340. Parcours en cours d'ouverture.",
    fil: FIL_BASE,
  },
  programme: {
    path: `${RACINE_PV}/programme`,
    titre: "Programme : formation panneaux photovoltaïques, 157 h",
    description:
      "Les 9 modules du parcours installateur photovoltaïque : composants, normes, sécurité en hauteur, pose, câblage, diagnostic. Durées indicatives.",
    fil: [...FIL_BASE, { name: "Programme", path: `${RACINE_PV}/programme` }],
  },
  financement: {
    path: `${RACINE_PV}/financement`,
    titre: "Financer une formation de poseur photovoltaïque",
    description:
      "OPCO, France Travail, CPF sous réserve d'éligibilité, financement employeur : les pistes pour financer le parcours photovoltaïque et le reste à charge CPF.",
    fil: [...FIL_BASE, { name: "Financement", path: `${RACINE_PV}/financement` }],
  },
  prerequis: {
    path: `${RACINE_PV}/prerequis-habilitations`,
    titre: "Prérequis et habilitations : poseur photovoltaïque",
    description:
      "Expérience, CAP, travail en hauteur, CACES, habilitation électrique BP ou BR P : ce qu'il faut réunir avant ou pendant la formation.",
    fil: [
      ...FIL_BASE,
      { name: "Prérequis et habilitations", path: `${RACINE_PV}/prerequis-habilitations` },
    ],
  },
  faq: {
    path: `${RACINE_PV}/faq`,
    titre: "FAQ formation installateur panneaux photovoltaïques",
    description:
      "Durée, prérequis, évaluation RS7340, différences avec QualiPV et CQP, financement, habilitation : les réponses sur le parcours photovoltaïque.",
    fil: [...FIL_BASE, { name: "Questions fréquentes", path: `${RACINE_PV}/faq` }],
  },
};

const ORGANISATION = {
  "@type": "EducationalOrganization",
  "@id": `${BASE_URL}/#organisation`,
  name: "Skills4mation",
  url: BASE_URL,
  logo: `${BASE_URL}/favicon.png`,
  email: "contact@skills4mation.com",
  address: { "@type": "PostalAddress", addressLocality: "Rixheim", addressCountry: "FR" },
} as const;

/** Image de partage : le visuel social s'il existe, sinon une image existante du site. */
export function imagePartage(): string {
  const src = VISUELS_PV["pv-social"].src ?? "/images/catalogue.webp";
  return `${BASE_URL}${src}`;
}

function fil(meta: PageMeta) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${BASE_URL}${meta.path}#fil`,
    itemListElement: [{ name: "Accueil", path: "/" }, ...meta.fil].map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.name,
      item: `${BASE_URL}${e.path === "/" ? "" : e.path}`,
    })),
  };
}

function pageWeb(meta: PageMeta) {
  return {
    "@type": "WebPage",
    "@id": `${BASE_URL}${meta.path}#page`,
    url: `${BASE_URL}${meta.path}`,
    name: meta.titre,
    description: meta.description,
    inLanguage: "fr-FR",
    dateModified: DATE_MAJ_ISO,
    author: { "@id": ORGANISATION["@id"] },
    publisher: { "@id": ORGANISATION["@id"] },
    breadcrumb: { "@id": `${BASE_URL}${meta.path}#fil` },
  };
}

const CREDENTIAL = {
  "@type": "EducationalOccupationalCredential",
  "@id": `${BASE_URL}${RACINE_PV}#certification-rs7340`,
  name: `${CERTIFICATION.code} : ${CERTIFICATION.intitule}`,
  identifier: CERTIFICATION.code,
  url: CERTIFICATION.source,
  description: `Certification du ${CERTIFICATION.registre}, enregistrée jusqu'au ${CERTIFICATION.finEnregistrement} (dernière délivrance possible le ${CERTIFICATION.derniereDelivrance}). Certificateur : ${CERTIFICATION.certificateur}.`,
  creator: { "@type": "Organization", name: CERTIFICATION.certificateur },
  recognizedBy: { "@type": "Organization", name: "France Compétences" },
};

function cours() {
  return {
    "@type": "Course",
    "@id": `${BASE_URL}${RACINE_PV}#cours`,
    name: `Formation ${NOM_PARCOURS.toLowerCase()}`,
    description:
      "Parcours de formation en cours d'ouverture, construit autour des sept compétences du référentiel RS7340 : composants, réglementation, sécurité en hauteur, dimensionnement, pose, câblage et mise en service, dépannage. Durée indicative de 157 heures.",
    url: `${BASE_URL}${RACINE_PV}`,
    inLanguage: "fr",
    provider: { "@id": ORGANISATION["@id"] },
    teaches: [...COMPETENCES],
    coursePrerequisites: [...PREREQUIS_CERTIFICATION],
    timeRequired: `PT${TOTAL_HEURES}H`,
    about: { "@id": CREDENTIAL["@id"] },
    hasCourseInstance: {
      "@type": "CourseInstance",
      name: "Session en cours d'ouverture",
      description: "Dates et modalités à communiquer : nous contacter.",
      courseWorkload: `PT${TOTAL_HEURES}H`,
      inLanguage: "fr",
    },
  };
}

type Complement = "cours" | "faq";

/** Construit l'objet head() d'une page du parcours (meta, canonical, Open Graph, JSON-LD). */
export function enTetePv(meta: PageMeta, complements: Complement[] = []) {
  const url = `${BASE_URL}${meta.path}`;
  const image = imagePartage();
  const graphe: Record<string, unknown>[] = [{ ...ORGANISATION }, pageWeb(meta), fil(meta)];
  if (complements.includes("cours")) graphe.push(cours(), CREDENTIAL);
  if (complements.includes("faq")) {
    graphe.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: FAQ_PV.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
  }
  return {
    meta: [
      { title: meta.titre },
      { name: "description", content: meta.description },
      { property: "og:title", content: meta.titre },
      { property: "og:description", content: meta.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:locale", content: "fr_FR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({ "@context": "https://schema.org", "@graph": graphe }),
      },
    ],
  };
}
