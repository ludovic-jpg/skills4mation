import { GraduationCap, Presentation, Target, type LucideIcon } from "lucide-react";

/** Les outils pédagogiques proposés sur /espace/outils (tuiles et paramètre d'URL `?outil=`). */
export const OUTILS_IDS = ["positionnement", "acquis", "supports"] as const;
export type OutilId = (typeof OUTILS_IDS)[number];

export type OutilDefinition = {
  id: OutilId;
  titre: string;
  moment: string;
  description: string;
  Icone: LucideIcon;
  /** Classes du cercle d'icône (fond + couleur), aux couleurs de marque. */
  pastille: string;
  /** Liseré coloré affiché au survol. */
  lisere: string;
};

export const OUTILS: OutilDefinition[] = [
  {
    id: "positionnement",
    titre: "Test de positionnement",
    moment: "Avant la formation",
    description: "Situez le niveau de départ de chaque apprenant pour adapter votre parcours.",
    Icone: Target,
    pastille: "bg-primary/10 text-primary",
    lisere: "from-primary to-secondary",
  },
  {
    id: "acquis",
    titre: "Évaluation des acquis",
    moment: "Après la formation",
    description: "Mesurez l'atteinte de chaque objectif pédagogique, objectif par objectif.",
    Icone: GraduationCap,
    pastille: "bg-cta/25 text-cta-foreground",
    lisere: "from-cta to-warning",
  },
  {
    id: "supports",
    titre: "Supports de cours PowerPoint",
    moment: "Pendant la formation",
    description: "Générez un PowerPoint par module de votre programme, prêt à projeter.",
    Icone: Presentation,
    pastille: "bg-secondary/15 text-primary",
    lisere: "from-secondary to-cta",
  },
];

export function outilParId(id: OutilId | undefined) {
  return OUTILS.find((o) => o.id === id);
}
