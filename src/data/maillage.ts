/**
 * Maillage interne du site public (SEO, 15/10/2026) : liens éditoriaux entre l'accueil,
 * les pages commerciales, les articles du blog et les fiches formation.
 * Règles : pages importantes à 1-2 clics de l'accueil, liens réciproques page commerciale
 * ↔ articles, ancres descriptives. Tous les slugs ci-dessous existent (vérifiés au sitemap).
 */
import { blogPosts, type BlogPost } from "@/data/blog";

export type LienFormation = { slug: string; label: string };
export type LienPage = {
  to:
    | "/bilan-de-competences"
    | "/pole-formateur"
    | "/portage-qualiopi"
    | "/formations"
    | "/evaluer-droit-formation";
  /** Filtre du catalogue (uniquement avec to = "/formations"). */
  categorie?: string;
  label: string;
};

/** Fiches mises en avant depuis l'accueil (cœur de métier, hors bien-être). */
export const FORMATIONS_PHARES: LienFormation[] = [
  { slug: "formation-de-formateur", label: "Formation de formateur" },
  { slug: "formation-langlais-des-affaires", label: "L'anglais des affaires" },
  {
    slug: "formation-maitriser-le-francais-professionnel-preparation-a-la-certification-le-robert",
    label: "Français professionnel, certification Le Robert",
  },
  {
    slug: "vente-b2b-developper-ses-competences-commerciales",
    label: "Vente B2B : développer ses compétences commerciales",
  },
  { slug: "formation-lart-du-closing", label: "L'art du closing" },
  {
    slug: "management-operationnel-performance-equipe",
    label: "Piloter la performance d'une équipe",
  },
  {
    slug: "formation-gestion-des-conflits",
    label: "Gestion des conflits en situation professionnelle",
  },
  {
    slug: "mettre-lia-au-service-de-sa-strategie-de-developpement",
    label: "Mettre l'IA au service de sa stratégie",
  },
];

/** Les articles les plus récents (date de publication décroissante). */
export function derniersArticles(n = 3): BlogPost[] {
  return [...blogPosts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, n);
}

/** Articles liés depuis chaque page commerciale. */
export const ARTICLES_PAR_PAGE: Record<"portage" | "pole" | "bilan", string[]> = {
  portage: [
    "comprendre-les-enjeux-du-portage-qualiopi-cpf",
    "audit-qualiopi-deroulement-preparation-decret-2026",
    "documents-obligatoires-organisme-de-formation",
    "former-sans-qualiopi-guide-complet-2024-pour-les-formateurs-independants",
  ],
  pole: [
    "comment-devenir-formateur-independant",
    "facilitez-la-transmission-de-vos-competences-avec-le-portage-qualiopi-cpf-chez-formatrix",
    "former-sans-qualiopi-guide-complet-2024-pour-les-formateurs-independants",
  ],
  bilan: [
    "portage-qualiopi-pour-bilan-de-competences-le-guide-complet-pour-securiser-votre-activite",
    "pourquoi-formatrix-est-le-partenaire-ideal-pour-votre-portage-qualiopi-en-bilan-de-competences",
    "le-marche-du-bilan-de-competences-en-2025-une-opportunite-en-or-face-au-defi-qualiopi",
  ],
};

export function articlesParSlugs(slugs: string[]): BlogPost[] {
  return slugs
    .map((slug) => blogPosts.find((p) => p.slug === slug))
    .filter((p): p is BlogPost => Boolean(p));
}

type Theme = { page: LienPage; formations: LienFormation[] };

const FORMATEUR: LienFormation = {
  slug: "formation-de-formateur",
  label: "Formation de formateur",
};

const THEMES: Record<string, Theme> = {
  bilan: {
    page: { to: "/bilan-de-competences", label: "Le portage Qualiopi pour bilans de compétences" },
    formations: [
      FORMATEUR,
      { slug: "formation-maitriser-la-methode-aec-disc", label: "Maîtriser la méthode AEC DISC" },
      { slug: "formation-gestion-des-emotions", label: "Gestion des émotions" },
    ],
  },
  formateur: {
    page: { to: "/pole-formateur", label: "Le pôle formateur : former sous notre Qualiopi" },
    formations: [
      FORMATEUR,
      {
        slug: "formation-prendre-la-parole-en-public-avec-aisance",
        label: "Prendre la parole en public avec aisance",
      },
      {
        slug: "formation-maitriser-les-logiciels-de-presentation-pao",
        label: "Concevoir ses supports de présentation",
      },
    ],
  },
  portage: {
    page: { to: "/portage-qualiopi", label: "Le portage Qualiopi pour formateurs indépendants" },
    formations: [
      FORMATEUR,
      {
        slug: "mettre-lia-au-service-de-sa-strategie-de-developpement",
        label: "Mettre l'IA au service de sa stratégie",
      },
      {
        slug: "formation-maitriser-les-logiciels-de-presentation-pao",
        label: "Concevoir ses supports de présentation",
      },
    ],
  },
  langues: {
    page: { to: "/formations", categorie: "langues", label: "Toutes nos formations en langues" },
    formations: [
      { slug: "formation-langlais-des-affaires", label: "L'anglais des affaires" },
      { slug: "formation-lespagnol-des-affaires", label: "L'espagnol des affaires" },
      {
        slug: "formation-maitriser-le-francais-professionnel-preparation-a-la-certification-le-robert",
        label: "Français professionnel, certification Le Robert",
      },
    ],
  },
  ventes: {
    page: { to: "/formations", categorie: "ventes", label: "Toutes nos formations commerciales" },
    formations: [
      {
        slug: "vente-b2b-developper-ses-competences-commerciales",
        label: "Vente B2B : développer ses compétences commerciales",
      },
      { slug: "formation-lart-du-closing", label: "L'art du closing" },
      {
        slug: "formation-reussir-sa-prospection-telephonique",
        label: "Réussir sa prospection téléphonique",
      },
    ],
  },
  digital: {
    page: {
      to: "/formations",
      categorie: "bureautique",
      label: "Toutes nos formations digital et bureautique",
    },
    formations: [
      {
        slug: "mettre-lia-au-service-de-sa-strategie-de-developpement",
        label: "Mettre l'IA au service de sa stratégie",
      },
      { slug: "formation-maitriser-les-reseaux-sociaux", label: "Maîtriser les réseaux sociaux" },
      { slug: "formation-maitriser-canva", label: "Maîtriser Canva pour sa communication" },
    ],
  },
  financement: {
    page: { to: "/evaluer-droit-formation", label: "Évaluer vos droits à la formation" },
    formations: [
      {
        slug: "formation-gestion-et-pilotage-dentreprise-tpe",
        label: "Gestion et pilotage d'entreprise TPE",
      },
      {
        slug: "management-operationnel-performance-equipe",
        label: "Piloter la performance d'une équipe",
      },
      {
        slug: "formation-gestion-des-conflits",
        label: "Gestion des conflits en situation professionnelle",
      },
    ],
  },
  catalogue: {
    page: { to: "/formations", label: "Le catalogue des formations Skills4mation" },
    formations: [
      {
        slug: "management-operationnel-performance-equipe",
        label: "Piloter la performance d'une équipe",
      },
      {
        slug: "vente-b2b-developper-ses-competences-commerciales",
        label: "Vente B2B : développer ses compétences commerciales",
      },
      { slug: "formation-langlais-des-affaires", label: "L'anglais des affaires" },
    ],
  },
};

/**
 * Thème d'un article déduit de son slug (première règle qui correspond), pour le bloc
 * « Pour aller plus loin ». Un nouvel article est rangé automatiquement.
 */
const REGLES: [RegExp, keyof typeof THEMES][] = [
  [/bilan-de-competences/, "bilan"],
  [/formateur-independant|devenir-formateur|transmission-de-vos-competences/, "formateur"],
  [/credit-dimpot|guide-tpe|guide-de-la-formation/, "financement"],
  [/portage|qualiopi|organisme-de-formation/, "portage"],
  [/langue/, "langues"],
  [/vente/, "ventes"],
  [/digital|numerique|-ia-|lia-|prompt/, "digital"],
];

export function themeArticle(slug: string): Theme {
  const regle = REGLES.find(([motif]) => motif.test(slug));
  return THEMES[regle ? regle[1] : "catalogue"] ?? THEMES["catalogue"]!;
}
