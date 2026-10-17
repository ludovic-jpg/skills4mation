/**
 * Visuels du parcours « Installateur / poseur de panneaux photovoltaïques ».
 * Les images arriveront plus tard : tant que `src` vaut null, les pages affichent un bloc
 * décoratif aux couleurs de la charte (dégradé vert), sans image cassée.
 * Pour activer un visuel : déposer le fichier WebP dans
 * public/images/formations/photovoltaique/ puis renseigner `src` (ex. "/images/formations/photovoltaique/pv-hero.webp").
 */
export type VisuelPv = {
  /** Chemin public du fichier .webp, ou null tant que l'image n'est pas livrée. */
  src: string | null;
  /** Texte alternatif, utilisé dès que l'image existe. */
  alt: string;
};

export type CleVisuelPv =
  "pv-hero" | "pv-pose-hauteur" | "pv-cablage" | "pv-plateau" | "pv-salle" | "pv-social";

export const VISUELS_PV: Record<CleVisuelPv, VisuelPv> = {
  "pv-hero": {
    src: null,
    alt: "Installateur posant des panneaux photovoltaïques sur une toiture, équipé d'un harnais",
  },
  "pv-pose-hauteur": {
    src: null,
    alt: "Apprenant en situation de travail en hauteur, protections collectives et individuelles en place",
  },
  "pv-cablage": {
    src: null,
    alt: "Câblage d'une chaîne de panneaux photovoltaïques et raccordement des connecteurs",
  },
  "pv-plateau": {
    src: null,
    alt: "Plateau technique de formation avec panneaux, onduleur et coffret de protection",
  },
  "pv-salle": {
    src: null,
    alt: "Salle de formation : groupe d'apprenants autour d'un schéma d'installation photovoltaïque",
  },
  "pv-social": {
    src: null,
    alt: "Formation installateur de panneaux photovoltaïques, parcours Skills4mation",
  },
};
