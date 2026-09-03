export type FormationStatique = {
  title: string;
  slug: string;
  cat: CategoryId;
  img: string;
};

const CATEGORIES_ZIP = [
  { id: "bien-etre", label: "Bien-être" },
  { id: "bureautique", label: "Bureautique" },
  { id: "creation-dentreprise", label: "Business" },
  { id: "communication", label: "Communication" },
  { id: "langues", label: "Langues" },
  { id: "metier-specifique", label: "Métier spécifique" },
  { id: "rh-management", label: "RH & Management" },
  { id: "rse", label: "RSE" },
  { id: "ventes", label: "Ventes" },
] as const;

export type CategoryId = (typeof CATEGORIES_ZIP)[number]["id"];

export const FORMATIONS_STATIQUES: FormationStatique[] = [
  { title: "Élaborer une stratégie de community management", slug: "elaborer-une-strategie-de-community-management", cat: "bureautique", img: "/images/formations/elaborer-une-strategie-de-community-management.png" },
  { title: "Mettre l’IA au service de sa stratégie de développement", slug: "mettre-lia-au-service-de-sa-strategie-de-developpement", cat: "bureautique", img: "/images/formations/mettre-lia-au-service-de-sa-strategie-de-developpement.png" },
  { title: "Maîtriser les Réseaux Sociaux", slug: "formation-maitriser-les-reseaux-sociaux", cat: "bureautique", img: "/images/formations/formation-maitriser-les-reseaux-sociaux.webp" },
  { title: "Maîtriser les logiciels de présentation PAO (Powerpoint)", slug: "formation-maitriser-les-logiciels-de-presentation-pao", cat: "bureautique", img: "/images/formations/formation-maitriser-les-logiciels-de-presentation-pao.webp" },
  { title: "Maîtriser l’art des tableurs", slug: "formation-maitriser-lart-des-tableurs", cat: "bureautique", img: "/images/formations/formation-maitriser-lart-des-tableurs.webp" },
  { title: "Traitement de texte – de l’initiation au perfectionnement", slug: "formation-traitement-de-texte", cat: "bureautique", img: "/images/formations/formation-traitement-de-texte.webp" },
  { title: "Prise en main d’un PC/MAC", slug: "formation-prise-en-main-dun-pc-mac", cat: "bureautique", img: "/images/formations/formation-prise-en-main-dun-pc-mac.webp" },
  { title: "Maîtriser Canva pour sublimer votre communication", slug: "formation-maitriser-canva", cat: "bureautique", img: "/images/formations/formation-maitriser-canva.webp" },
  { title: "outils collaboratifs", slug: "formation-en-outils-collaboratifs", cat: "bureautique", img: "/images/formations/formation-en-outils-collaboratifs.webp" },
  { title: "SEA – Référencement Payant", slug: "formation-en-sea-referencement-payant", cat: "bureautique", img: "/images/formations/formation-en-sea-referencement-payant.webp" },
  { title: "Prendre la parole en public avec aisance", slug: "formation-prendre-la-parole-en-public-avec-aisance", cat: "communication", img: "/images/formations/formation-prendre-la-parole-en-public-avec-aisance.webp" },
  { title: "Produire du contenu vidéo avec votre smartphone", slug: "formation-produire-du-contenu-video-avec-votre-smartphone", cat: "communication", img: "/images/formations/formation-produire-du-contenu-video-avec-votre-smartphone.webp" },
  { title: "Piloter la performance d’équipe et adopter un management adapté aux collaborateurs", slug: "management-operationnel-performance-equipe", cat: "creation-dentreprise", img: "/images/formations/management-operationnel-performance-equipe.png" },
  { title: "Vente B2B – Développer ses compétences commerciales", slug: "vente-b2b-developper-ses-competences-commerciales", cat: "creation-dentreprise", img: "/images/formations/vente-b2b-developper-ses-competences-commerciales.png" },
  { title: "Analyse Financière", slug: "formation-analyse-financiere", cat: "creation-dentreprise", img: "/images/formations/formation-analyse-financiere.webp" },
  { title: "Gestion et pilotage d’entreprise TPE", slug: "formation-gestion-et-pilotage-dentreprise-tpe", cat: "creation-dentreprise", img: "/images/formations/formation-gestion-et-pilotage-dentreprise-tpe.webp" },
  { title: "Réussir le lancement de sa start Up!", slug: "formation-reussir-le-lancement-de-sa-start-up", cat: "creation-dentreprise", img: "/images/formations/formation-reussir-le-lancement-de-sa-start-up.webp" },
  { title: "Maîtriser le français professionnel – Préparation à la Certification en langue française Le Robert", slug: "formation-maitriser-le-francais-professionnel-preparation-a-la-certification-le-robert", cat: "langues", img: "/images/formations/formation-maitriser-le-francais-professionnel-preparation-a-la-certification-le-robert.webp" },
  { title: "L’italien des affaires", slug: "formation-litalien-des-affaires", cat: "langues", img: "/images/formations/formation-litalien-des-affaires.png" },
  { title: "Le portugais des affaires", slug: "formation-le-portugais-des-affaires", cat: "langues", img: "/images/formations/formation-le-portugais-des-affaires.png" },
  { title: "Le japonais des affaires", slug: "formation-le-japonais-des-affaires", cat: "langues", img: "/images/formations/formation-le-japonais-des-affaires.png" },
  { title: "Le Mandarin des affaires", slug: "formation-le-mandarin-des-affaires", cat: "langues", img: "/images/formations/formation-le-mandarin-des-affaires.png" },
  { title: "L’espagnol des affaires", slug: "formation-lespagnol-des-affaires", cat: "langues", img: "/images/formations/formation-lespagnol-des-affaires.png" },
  { title: "L’anglais des affaires", slug: "formation-langlais-des-affaires", cat: "langues", img: "/images/formations/formation-langlais-des-affaires.png" },
  { title: "L’allemand des affaires", slug: "formation-lallemand-des-affaires", cat: "langues", img: "/images/formations/formation-lallemand-des-affaires.png" },
  { title: "Le Français des affaires", slug: "formation-le-francais-des-affaires", cat: "langues", img: "/images/formations/formation-le-francais-des-affaires.png" },
  { title: "Créer son cabinet de prothésiste ongulaire", slug: "formation-prothesiste-ongulaire", cat: "metier-specifique", img: "/images/formations/formation-prothesiste-ongulaire.webp" },
  { title: "De Formation", slug: "formation-de-formateur", cat: "metier-specifique", img: "/images/formations/formation-de-formateur.webp" },
  { title: "couture créative", slug: "formation-couture-creative", cat: "metier-specifique", img: "/images/formations/formation-couture-creative.webp" },
  { title: "MAO – Production musicale avec Cubase", slug: "formation-mao-production-musicale-avec-cubase", cat: "metier-specifique", img: "/images/formations/formation-mao-production-musicale-avec-cubase.webp" },
  { title: "Photographie – Maîtrisez l’art de la photographie", slug: "formation-photographie", cat: "metier-specifique", img: "/images/formations/formation-photographie.webp" },
  { title: "Œnologie", slug: "formation-oenologie", cat: "metier-specifique", img: "/images/formations/formation-oenologie.webp" },
  { title: "Gestion des conflits en situation professionnelle", slug: "formation-gestion-des-conflits", cat: "rh-management", img: "/images/formations/formation-gestion-des-conflits.webp" },
  { title: "Gestion des émotions", slug: "formation-gestion-des-emotions", cat: "rh-management", img: "/images/formations/formation-gestion-des-emotions.webp" },
  { title: "Maîtriser la méthode AEC DISC", slug: "formation-maitriser-la-methode-aec-disc", cat: "rh-management", img: "/images/formations/formation-maitriser-la-methode-aec-disc.webp" },
  { title: "réinventer les réunions d’équipe", slug: "formation-reinventer-les-reunions-dequipe", cat: "rh-management", img: "/images/formations/formation-reinventer-les-reunions-dequipe.webp" },
  { title: "Résoudre les problèmes grâce à l’intelligence collective", slug: "formation-intelligence-collective", cat: "rh-management", img: "/images/formations/formation-intelligence-collective.webp" },
  { title: "Innover grâce au Design Thinking", slug: "formation-innover-grace-au-design-thinking", cat: "rh-management", img: "/images/formations/formation-innover-grace-au-design-thinking.webp" },
  { title: "Coaching Systémique d’Equipe", slug: "formation-coaching-systemique-dequipe", cat: "rh-management", img: "/images/formations/formation-coaching-systemique-dequipe.webp" },
  { title: "Gestion des priorités", slug: "formation-gestion-des-priorites", cat: "rh-management", img: "/images/formations/formation-gestion-des-priorites.webp" },
  { title: "Ingénierie de projet", slug: "formation-ingenierie-de-projet", cat: "rh-management", img: "/images/formations/formation-ingenierie-de-projet.webp" },
  { title: "Financer un projet culturel", slug: "formation-financer-un-projet-culturel", cat: "rse", img: "/images/formations/formation-financer-un-projet-culturel.png" },
  { title: "Le mécénat d’entreprise", slug: "formation-le-mecenat-dentreprise", cat: "rse", img: "/images/formations/formation-le-mecenat-dentreprise.webp" },
  { title: "Réduire l’empreinte carbone dans son entreprise", slug: "formation-reduire-lempreinte-carbone-dans-son-entreprise", cat: "rse", img: "/images/formations/formation-reduire-lempreinte-carbone-dans-son-entreprise.png" },
  { title: "l’économie circulaire dans son processus de production", slug: "formation-leconomie-circulaire-dans-son-processus-de-production", cat: "rse", img: "/images/formations/formation-leconomie-circulaire-dans-son-processus-de-production.png" },
  { title: "Vente Conseil", slug: "formation-vente-conseil", cat: "ventes", img: "/images/formations/formation-vente-conseil.webp" },
  { title: "Bâtir et Piloter votre Plan d’Action Commercial", slug: "formation-batir-et-piloter-votre-plan-daction-commercial", cat: "ventes", img: "/images/formations/formation-batir-et-piloter-votre-plan-daction-commercial.webp" },
  { title: "L’art du Closing", slug: "formation-lart-du-closing", cat: "ventes", img: "/images/formations/formation-lart-du-closing.webp" },
  { title: "Réussir sa prospection téléphonique", slug: "formation-reussir-sa-prospection-telephonique", cat: "ventes", img: "/images/formations/formation-reussir-sa-prospection-telephonique.webp" },
  { title: "Massage Lomi", slug: "formation-massage-lomi", cat: "bien-etre", img: "/images/formations/formation-massage-lomi.webp" },
  { title: "Massage Assis", slug: "formation-massage-assis", cat: "bien-etre", img: "/images/formations/formation-massage-assis.webp" },
  { title: "Massage Dos et Crânien", slug: "formation-massage-dos-et-cranien", cat: "bien-etre", img: "/images/formations/formation-massage-dos-et-cranien.webp" },
  { title: "Massage Kobi", slug: "formation-massage-kobi", cat: "bien-etre", img: "/images/formations/formation-massage-kobi.webp" },
  { title: "Massage Bien-être", slug: "formation-massage-bien-etre", cat: "bien-etre", img: "/images/formations/formation-massage-bien-etre.webp" },
  { title: "Massage Ayurvédique", slug: "formation-massage-ayurvedique", cat: "bien-etre", img: "/images/formations/formation-massage-ayurvedique.webp" },
  { title: "Massage Chi Nei Tsang", slug: "formation-massage-chi-nei-tsang", cat: "bien-etre", img: "/images/formations/formation-massage-chi-nei-tsang.webp" },
  { title: "Création de site Internet", slug: "formation-creation-de-site-internet", cat: "bureautique", img: "/images/formations/formation-creation-de-site-internet.jpg" },
];


export function formationStatique(slug: string) {
  return FORMATIONS_STATIQUES.find((f) => f.slug === slug);
}
