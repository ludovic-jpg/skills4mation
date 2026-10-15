/**
 * Fiches formation retirées du site public de Skills4mation (catalogue, listes,
 * sitemap) et redirigées en 301. Décision du dirigeant, 15/10/2026.
 *
 * Module sans dépendance : il est lu par src/server.ts (redirections avant le
 * rendu), par le sitemap et par les routes publiques du catalogue.
 */

/**
 * Fiches de test ou sans valeur publique, présentes dans la table
 * formations_catalogue mais à ne jamais exposer : retirées des listes et du
 * sitemap, redirigées en 301 vers /formations. Pour en ajouter une, ajouter son
 * slug ici (la dépublier dans la base reste la solution de fond).
 */
export const EXCLUDED_SLUGS = new Set<string>([
  // Fiche de test créée depuis l'espace formateur (127 mots, slug nominatif).
  "formation-albisser-mtiviu4q",
]);

/** Le bien-être est désormais porté par le site dédié formabientre.fr. */
export const CATEGORIE_EXTERNALISEE = "bien-etre";

export const FORMABIENETRE_CATALOGUE = "https://formabientre.fr/formations";

/**
 * Correspondance fiche bien-être Skills4mation → page équivalente sur
 * formabientre.fr (identifiants lus dans src/data/formations.ts et le sitemap
 * en ligne de formabientre.fr le 15/10/2026). Sans équivalent exact : catalogue.
 */
export const BIEN_ETRE_REDIRECTS: Record<string, string> = {
  "formation-massage-lomi": "https://formabientre.fr/formation/massage-lomi",
  "formation-massage-assis": "https://formabientre.fr/formation/massage-assis",
  "formation-massage-dos-et-cranien": "https://formabientre.fr/formation/massage-dos-cranien",
  "formation-massage-kobi": "https://formabientre.fr/formation/massage-kobi",
  "formation-massage-bien-etre": "https://formabientre.fr/formation/massage-bien-etre",
  "formation-massage-ayurvedique": "https://formabientre.fr/formation/massage-ayurvedique",
  "formation-massage-chi-nei-tsang": "https://formabientre.fr/formation/massage-chi-nei-tsang",
  "formation-yoga-et-ayurveda": "https://formabientre.fr/formation/yoga-ayurveda",
  "formation-enseigner-le-yoga": "https://formabientre.fr/formation/enseigner-yoga",
  "formation-massage-5-continents": "https://formabientre.fr/formation/massage-5-continents",
  "formation-massage-aux-pierres-chaudes":
    "https://formabientre.fr/formation/massage-pierres-chaudes",
  "formation-massage-shinzu-face": "https://formabientre.fr/formation/massage-shinzu-face",
  "formation-massage-shinzu-body": FORMABIENETRE_CATALOGUE,
  "formation-devenez-formateur-massage-quintessence": FORMABIENETRE_CATALOGUE,
  "formation-devenez-praticien-en-massage-quintessence": FORMABIENETRE_CATALOGUE,
};

/** Destination 301 d'une fiche retirée du site, ou null si elle reste servie. */
export function redirectionFicheRetiree(slug: string, categorie?: string | null): string | null {
  if (EXCLUDED_SLUGS.has(slug)) return "/formations";
  const bienEtre = BIEN_ETRE_REDIRECTS[slug];
  if (bienEtre) return bienEtre;
  if (categorie === CATEGORIE_EXTERNALISEE) return FORMABIENETRE_CATALOGUE;
  return null;
}

/** Vrai si la fiche doit apparaître dans les listes publiques et le sitemap. */
export function estFichePublique(f: { slug: string; categorie?: string | null }): boolean {
  return redirectionFicheRetiree(f.slug, f.categorie) === null;
}
