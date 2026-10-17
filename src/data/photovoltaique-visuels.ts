/**
 * Visuels du parcours « Installateur / poseur de panneaux photovoltaïques ».
 * Tant que `src` vaut null, les pages affichent un bloc
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
    src: "/images/formations/photovoltaique/pv-hero.webp",
    alt: "Deux installateurs en casque et harnais, reliés à une ligne de vie, posent des panneaux solaires sur un toit en tuiles devant un village alsacien.",
  },
  "pv-pose-hauteur": {
    src: null,
    alt: "Apprenant en situation de travail en hauteur, protections collectives et individuelles en place",
  },
  "pv-cablage": {
    src: "/images/formations/photovoltaique/pv-cablage.webp",
    alt: "Un technicien en casque, lunettes et gants isolants contrôle au multimètre un coffret électrique à côté d'un onduleur solaire mural.",
  },
  "pv-plateau": {
    src: null,
    alt: "Plateau technique de formation avec panneaux, onduleur et coffret de protection",
  },
  "pv-salle": {
    src: "/images/formations/photovoltaique/pv-salle.webp",
    alt: "Des stagiaires suivent un cours théorique sur l'installation solaire dans une salle de formation lumineuse.",
  },
  "pv-social": {
    src: "/images/formations/photovoltaique/pv-social.webp",
    alt: "Un installateur en casque blanc et harnais fixe un panneau solaire sur une toiture en tuiles sous un ciel dégagé.",
  },
};
