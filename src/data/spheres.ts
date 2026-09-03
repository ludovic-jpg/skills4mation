import type { CategoryId } from "./formations-statiques";

export type Sphere = {
  slug: string;
  name: string;
  cat: CategoryId;
  intro: string;
};

export const SPHERES: Sphere[] = [
  {
    slug: "bureautique",
    name: "Bureautique",
    cat: "bureautique",
    intro:
      "Outils bureautiques, création graphique, réseaux sociaux, intelligence artificielle : nos formations digitales vous donnent les réflexes concrets attendus aujourd'hui dans tous les métiers. Des ateliers pratiques, animés par des professionnels du numérique, pour gagner en autonomie et en efficacité au quotidien.",
  },
  {
    slug: "communication",
    name: "Communication",
    cat: "communication",
    intro:
      "Prendre la parole, convaincre, produire du contenu qui capte l'attention : la communication est un levier de carrière. Nos parcours travaillent votre posture, votre voix et vos supports pour que votre message porte, en interne comme face à vos clients.",
  },
  {
    slug: "creation-dentreprise",
    name: "Business",
    cat: "creation-dentreprise",
    intro:
      "Lancer, structurer et piloter une activité demande des repères solides : modèle économique, gestion, indicateurs, développement commercial. Nos formations Business vous accompagnent de l'idée au pilotage, avec des outils directement applicables à votre projet.",
  },
  {
    slug: "langues",
    name: "Langues",
    cat: "langues",
    intro:
      "Anglais, allemand, espagnol, italien, portugais, mandarin, japonais ou français professionnel : nos parcours de langues sont orientés usage métier. Vous travaillez vos échanges réels — réunions, négociation, e-mails, présentations — avec des formateurs natifs ou bilingues.",
  },
  {
    slug: "metier-specifique",
    name: "Métiers spécifiques",
    cat: "metier-specifique",
    intro:
      "Certains savoir-faire s'apprennent auprès de praticiens. Photographie, production musicale, couture, œnologie, création d'activité en esthétique : ces formations métiers transmettent des gestes et des méthodes éprouvés, dans un cadre réellement pratique.",
  },
  {
    slug: "rh-management",
    name: "RH & Management",
    cat: "rh-management",
    intro:
      "Manager, c'est arbitrer, écouter et faire grandir. Gestion des conflits, des émotions et des priorités, intelligence collective, design thinking, coaching d'équipe : nos parcours RH & Management renforcent votre pratique managériale sur des situations vécues.",
  },
  {
    slug: "rse",
    name: "RSE",
    cat: "rse",
    intro:
      "La transition écologique et sociale devient un critère de compétitivité. Empreinte carbone, économie circulaire, mécénat, financement de projets culturels : nos formations RSE vous outillent pour passer de l'intention à des actions mesurables.",
  },
  {
    slug: "ventes",
    name: "Ventes",
    cat: "ventes",
    intro:
      "La performance commerciale s'entretient. Prospection, vente conseil, closing, plan d'action commercial : nos formations ventes sont conçues par des professionnels du terrain pour transformer votre méthode en résultats durables.",
  },
  {
    slug: "bien-etre",
    name: "Bien-être",
    cat: "bien-etre",
    intro:
      "Massages bien-être, techniques ayurvédiques, approches corporelles : nos formations bien-être s'adressent à celles et ceux qui veulent exercer un métier de la relation et du soin, avec une pratique encadrée et progressive.",
  },
];
