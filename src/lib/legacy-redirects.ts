/**
 * Redirections 301 de l'ancien site WordPress (skills4mation.com, oct. 2026)
 * vers les routes du site Lovable. Objectif : conserver le référencement acquis.
 *
 * Inventaire source : sitemap WordPress + crawl complet (109 URL) du 07/10/2026.
 * Toute ancienne URL doit aboutir en UNE seule redirection sur une page en 200.
 */

import { LEGACY_ASSETS } from "./legacy-assets";

/** Articles WordPress publiés à la racine (/<slug>/) → /blog/<slug>. */
export const LEGACY_POST_SLUGS = new Set<string>([
  "pourquoi-formatrix-est-le-partenaire-ideal-pour-votre-portage-qualiopi-en-bilan-de-competences",
  "portage-qualiopi-pour-bilan-de-competences-le-guide-complet-pour-securiser-votre-activite",
  "le-marche-du-bilan-de-competences-en-2025-une-opportunite-en-or-face-au-defi-qualiopi",
  "apprendre-une-langue-pour-booster-sa-carriere-lexpertise-formalangue",
  "les-competences-de-vente-b2b-les-plus-recherchees-aujourdhui",
  "formadigital-comment-maitriser-les-competences-numeriques-cles-en-2025",
  "lapproche-par-sphere-de-formatrix-votre-guide-complet-vers-lexcellence-professionnelle",
  "guide-de-la-formation-professionnelle",
  "centre-de-formation-pour-vous-aider-a-aller-au-dela-de-vos-objectifs-professionnels",
  "la-revolution-schumpeterienne-de-lia-repenser-le-marche-de-lemploi-avec-formatrix",
  "former-sans-qualiopi-guide-complet-2024-pour-les-formateurs-independants",
  "comment-devenir-formateur-independant",
  "guide-ia-et-prompt-chat-gpt-dans-le-domaine-de-la-formation",
  "glossaire-de-la-formation",
  "comprendre-les-enjeux-du-portage-qualiopi-cpf",
  "facilitez-la-transmission-de-vos-competences-avec-le-portage-qualiopi-cpf-chez-formatrix",
  "le-credit-dimpot-formation-des-dirigeants-un-dispositif-avantageux-pour-developper-vos-competences",
  "guide-tpe-comment-bien-choisir-sa-formation-et-son-organisme-de-formation",
]);

/** Catégories (« sphères ») WordPress des fiches formation, identiques aux filtres du catalogue. */
const SPHERES = new Set([
  "bien-etre",
  "bureautique",
  "creation-dentreprise",
  "communication",
  "langues",
  "metier-specifique",
  "rh-management",
  "rse",
  "ventes",
]);

/** Correspondances page à page (chemins sans slash final). */
export const LEGACY_PAGE_MAP: Record<string, string> = {
  "/catalogue-de-formation": "/formations",
  "/formation": "/formations",
  "/offre-de-formation": "/formations",
  "/portage-qualiopi-cpf-pour-formateur": "/pole-formateur",
  "/portage-qualiopi-bilan-de-competences": "/bilan-de-competences",
  "/blog-pedagogique": "/blog",
  "/categorie": "/blog",
  "/category": "/blog",
  "/feed": "/blog",
  "/comments/feed": "/blog",
  "/politique-de-cookies-ue": "/politique-de-cookies",
  "/confirmation-de-rdv": "/contact",
  "/accompagnement-pedagogique-chez-formatrix": "/qui-sommes-nous",
  "/sitemaps.xml": "/sitemap.xml",
  "/sitemap_index.xml": "/sitemap.xml",
  "/wp-sitemap.xml": "/sitemap.xml",
  "/post-sitemap1.xml": "/sitemap.xml",
  "/page-sitemap1.xml": "/sitemap.xml",
  "/formation-sitemap1.xml": "/sitemap.xml",
  "/category-sitemap1.xml": "/sitemap.xml",
  "/post_tag-sitemap1.xml": "/sitemap.xml",
};

const IMAGE_VARIANT = /^(\/wp-content\/uploads\/.+?)-\d+x\d+(\.(?:png|jpe?g|webp|gif))$/i;

/**
 * Retourne la destination de la redirection 301 pour un ancien chemin WordPress,
 * ou null si le chemin doit être servi normalement.
 */
export function legacyRedirectTarget(pathname: string): string | null {
  let path: string;
  try {
    path = decodeURI(pathname);
  } catch {
    path = pathname;
  }

  // Miniatures WordPress (image-1024x576.png) : seules les originales sont reprises.
  if (path.startsWith("/wp-content/") || path.startsWith("/wp-includes/")) {
    if (LEGACY_ASSETS.has(path)) return null;
    const variant = path.match(IMAGE_VARIANT);
    const original = variant ? `${variant[1] ?? ""}${variant[2] ?? ""}` : "";
    if (original && LEGACY_ASSETS.has(original)) return encodeURI(original);
    return null;
  }

  const hadSlash = path.length > 1 && path.endsWith("/");
  const clean = hadSlash ? path.replace(/\/+$/, "") : path;
  const segs = clean.split("/").filter(Boolean);
  const [first = "", second = "", third = ""] = segs;

  const direct = LEGACY_PAGE_MAP[clean];
  if (direct) return direct;

  // /formation/<sphère>/<slug>/ → /formations/<slug>
  if (first === "formation" && third) return `/formations/${third}`;
  // /formation/<sphère>/ → catalogue filtré
  if (first === "formation" && second) {
    return SPHERES.has(second) ? `/formations?categorie=${second}` : "/formations";
  }
  // /catalogue-de-formation/<n>/ (pagination) → catalogue
  if (first === "catalogue-de-formation") return "/formations";
  // /categorie/<x>/(page/<n>/) et /page/<n>/ → blog
  if (first === "categorie" || first === "category" || first === "tag" || first === "page") {
    return "/blog";
  }
  // Articles à la racine, y compris leurs sous-chemins parasites (/<slug>/feed, liens cassés…)
  if (first && LEGACY_POST_SLUGS.has(first)) return `/blog/${first}`;
  // /author/... → qui sommes-nous
  if (first === "author") return "/qui-sommes-nous";

  // Slash final WordPress sur une page qui existe telle quelle → version sans slash, en un saut.
  if (hadSlash) return clean || "/";

  return null;
}
