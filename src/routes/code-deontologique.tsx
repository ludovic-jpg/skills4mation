import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, HeartHandshake, Scale, ShieldCheck, Sparkles, Users } from "lucide-react";

import { CharteDeontologieBadge, QualiopiBadge } from "@/components/Brand";
import { PageHero, PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/code-deontologique")({
  head: () => ({
    meta: [
      { title: "Code déontologique — Skills4mation" },
      {
        name: "description",
        content:
          "Le code déontologique Skills4mation : 13 articles d'engagement sur l'analyse des besoins, la réalisation des actions de formation, la confidentialité des données et le respect de l'apprenant.",
      },
      { property: "og:title", content: "Code déontologique — Skills4mation" },
      {
        property: "og:description",
        content:
          "Nos 13 articles d'engagement déontologique : transparence, indépendance, confidentialité et respect de l'apprenant.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://skills4mation.com/code-deontologique" },
    ],
    links: [
      { rel: "canonical", href: "https://skills4mation.com/code-deontologique" },
    ],
  }),
  component: CodeDeontologique,
});

type Chapitre = {
  id: string;
  titre: string;
  icon: typeof Scale;
  intro?: string;
  articles: { num: string; chapeau: string; points: string[] }[];
};

const CHAPITRES: Chapitre[] = [
  {
    id: "engagements",
    titre: "Nos engagements fondateurs",
    icon: Scale,
    articles: [
      {
        num: "Article 1",
        chapeau:
          "Comprendre et refléter sa compréhension de la demande du client dans les cadres suivants :",
        points: [
          "la réglementation en vigueur concernant la formation professionnelle ;",
          "les engagements contractuels lors des différentes étapes de l'action de formation ;",
          "les intérêts des différents acteurs (stagiaires, donneur d'ordre en entreprise, entreprise, formateurs) et de leurs valeurs ;",
          "un accord financier excluant toute rémunération illicite.",
        ],
      },
      {
        num: "Article 2",
        chapeau: "Mettre tout en œuvre pour établir une relation « gagnant gagnant » :",
        points: [
          "en étant transparent sur le choix des offres de formation ;",
          "en reconnaissant les contraintes commerciales ;",
          "en assurant un dialogue continu avec les stagiaires.",
        ],
      },
    ],
  },
  {
    id: "analyse",
    titre: "L'analyse des besoins et l'offre de formation",
    icon: Users,
    intro:
      "Lors de l'analyse des besoins du client et de l'offre de formation, l'Institution SKILLS4MATION s'engage à :",
    articles: [
      {
        num: "Article 3",
        chapeau: "Aider le client à formaliser sa demande et ses objectifs, en :",
        points: [
          "proposant un dispositif de formation qui réponde aux stricts besoins et objectifs du client ;",
          "fournissant une information précise et exhaustive des différentes formations ;",
          "informant le client des possibilités de financement de l'action de formation ;",
          "établissant une offre (devis) qui transcrit les exigences, conditions de réussite de l'action de formation et formalise les aspects techniques et financiers de l'intervention ;",
          "désignant la ou les personnes intervenant dans la réalisation du dispositif de formation (formateur, certificateur… etc.) ;",
          "informant le client de tout changement d'intervenant et en validant son accord.",
        ],
      },
      {
        num: "Article 4",
        chapeau:
          "Établir un contrat ou une convention liant les parties et préalablement à toute action de formation, en :",
        points: [
          "décrivant les exigences, conditions et modalités de l'action de formation, ainsi que les clauses relatives à la résiliation, l'annulation et le report des prestations ;",
          "notifiant les modalités de l'action de formation : les objectifs et le programme de l'action, les moyens pédagogiques, techniques et d'encadrement mis en œuvre, les prérequis et le nombre de personnes à former, les moyens permettant de suivre l'exécution de l'action et d'en apprécier les résultats (les évaluations) ;",
          "précisant les clauses relatives à la résiliation, l'annulation et le report des prestations (réf. : Conditions Générales de Vente) ;",
          "informant le client du règlement intérieur qui s'applique à l'action de formation de l'Institution SKILLS4MATION ;",
          "établissant le juste rapport qualité prix de sa prestation ;",
          "fournissant au client les documents permettant un financement de la formation professionnelle continue.",
        ],
      },
    ],
  },
  {
    id: "realisation",
    titre: "La réalisation de l'action de formation",
    icon: Sparkles,
    intro:
      "Lors de la mise en œuvre de l'action de formation, l'Institution SKILLS4MATION et les formateurs mandatés s'engagent à :",
    articles: [
      {
        num: "Article 5",
        chapeau: "Exercer leur mission pédagogique dans un cadre professionnel, en :",
        points: [
          "informant le stagiaire du déroulement de la formation (règles du groupe, objectifs, étapes, exercices, rôles attendus, modalités d'évaluation, intervenants, e-learning, suivi de l'action… etc.) ;",
          "centrant la formation sur la sphère professionnelle, en se positionnant à l'articulation des champs sociaux, économiques, psychologiques ;",
          "exerçant son action dans l'intérêt commun du client et des bénéficiaires des actions, en mettant en œuvre les moyens nécessaires pour atteindre les objectifs contractualisés ;",
          "mettant en œuvre toutes ses compétences quels que soient l'action, le client, les bénéficiaires et le prix ;",
          "donnant un feedback au client sur sa progression dans l'évaluation des compétences (exercices en salle, en ligne ou e-learning) ;",
          "informant rapidement les stagiaires et commanditaires de tout élément risquant de nuire à l'atteinte des objectifs ou au bon déroulement des actions.",
        ],
      },
      {
        num: "Article 6",
        chapeau: "Maintenir et développer ses compétences professionnelles, en :",
        points: [
          "entretenant sa veille professionnelle par un perfectionnement continu et une auto-formation ;",
          "mettant à jour ses méthodes, ses outils, et sa connaissance de l'environnement socio-économique ;",
          "s'engageant si besoin en supervision, en échanges de pratiques…",
        ],
      },
      {
        num: "Article 7",
        chapeau: "Intervenir dans un cadre respectant leur indépendance, en :",
        points: [
          "se donnant la possibilité de refuser des missions qui porteraient atteinte à son indépendance professionnelle, que ce soit pour des raisons de compétence ou d'éthique ;",
          "ayant conscience des limites de son champ d'intervention ;",
          "n'acceptant aucune rémunération illicite ;",
          "refusant un accompagnement individuel rémunéré (p. ex. action de coaching) s'il est amené à certifier le stagiaire.",
        ],
      },
      {
        num: "Article 8",
        chapeau:
          "Respecter les parties prenantes (commanditaire, autres formateurs, stagiaires, concurrents), en :",
        points: [
          "prenant en compte les enjeux des organisations concernées par la formation ;",
          "se gardant de tout propos désobligeant envers un confrère auprès des stagiaires ;",
          "étant neutre par rapport aux jeux d'influence chez le commanditaire et en n'exprimant aucun jugement ou critique sur le commanditaire auprès des stagiaires aux sessions de formation ;",
          "observant les règles d'une concurrence loyale à l'égard de l'Institution SKILLS4MATION, de ses confrères et concurrents.",
        ],
      },
    ],
  },
  {
    id: "securite",
    titre: "La sécurité physique des personnes et la sécurité des données",
    icon: ShieldCheck,
    intro:
      "Lors de toutes relations avec les clients, stagiaires et formateurs, l'Institution SKILLS4MATION et les formateurs mandatés s'engagent à :",
    articles: [
      {
        num: "Article 9",
        chapeau: "Respecter la confidentialité des données, en :",
        points: [
          "s'assurant de la confidentialité de toute information ou donnée à caractère privé ou professionnel relative au client, aux employés ou fournisseurs du client ainsi qu'au savoir-faire, auxquels il aurait eu accès expressément ou accidentellement dans le cadre de sa mission de formation ;",
          "n'exploitant pas à titre personnel les informations confidentielles, en ne divulguant aucune information sans l'autorisation préalable du client, du stagiaire ou de l'Institution SKILLS4MATION. De ce fait, les résultats des évaluations individuelles des stagiaires ne peuvent être transmis à l'employeur sans l'accord de la personne concernée. Seuls les résultats reflétant les moyennes des évaluations peuvent être transmis à l'employeur.",
        ],
      },
      {
        num: "Article 10",
        chapeau: "Respecter la propriété intellectuelle, en :",
        points: [
          "ne faisant pas un usage personnel ou professionnel des informations auxquelles il aurait recours dans l'exercice de la mission ;",
          "citant les sources des documents remis, de façon à assurer une transparence absolue tant vis-à-vis de leurs auteurs que des clients et stagiaires.",
        ],
      },
      {
        num: "Article 11",
        chapeau: "Respecter la sécurité physique des personnes, en :",
        points: [
          "respectant les consignes en matière de sécurité physique ou informatique mises en place sur le site du stagiaire / client, afin de garantir sa propre sécurité ainsi que celle des employés, du matériel, des installations et de tous les supports physiques ou électroniques ;",
          "informant immédiatement la direction de l'Institution SKILLS4MATION de tout incident pouvant avoir un impact sur la sécurité des stagiaires.",
        ],
      },
    ],
  },
  {
    id: "apprenant",
    titre: "Le respect de l'apprenant en tant que personne",
    icon: HeartHandshake,
    intro:
      "Du fait de sa position de pouvoir et d'influence, le formateur a la responsabilité de la qualité de l'environnement dans lequel se déroulent les actions de formation qu'il conduit. Il se doit donc d'établir avec les stagiaires, d'une part un contrat moral reposant sur un rapport de confiance, d'équité et de justice, d'autre part des règles implicites et explicites de la dynamique de groupe qui aient l'adhésion de tous. Le formateur se doit surtout d'être à l'image de ses enseignements et des règles qu'il fixe. Les formateurs s'engagent donc sur le respect des points suivants.",
    articles: [
      {
        num: "Article 12",
        chapeau: "Promouvoir l'égalité des chances, en :",
        points: [
          "reconnaissant chaque stagiaire dans sa singularité, son histoire, ses représentations, ses valeurs, ses stratégies d'apprentissage, ses acquis et ses projets ;",
          "reconnaissant chacun dans sa capacité à explorer, découvrir, s'engager dans d'autres possibles et dépasser une identité perçue comme limitante ;",
          "pariant sur l'éducabilité de tous sans assigner quiconque à l'échec ;",
          "rendant possible, identifiant et valorisant les apprentissages de chacun ; aidant chacun, à travers les tâches réalisées, à repérer les objectifs atteints et les progrès effectués ;",
          "facilitant l'expression de chacun et en évitant toute forme d'humiliation, d'agression ou d'exclusion ; en garantissant à chacun le droit à l'erreur.",
        ],
      },
      {
        num: "Article 13",
        chapeau:
          "Défendre la dignité personnelle et le respect des sphères professionnelle et privée, en :",
        points: [
          "permettant au stagiaire d'échapper aux relations d'emprise et de séduction ;",
          "organisant une réflexion sur les situations d'apprentissage ;",
          "veillant à ne pas outrepasser son rôle et en se gardant de toute dérive à prétention thérapeutique ;",
          "liant en permanence, à travers tous ses comportements, bienveillance et exigence à l'égard de tous ;",
          "respectant et faisant respecter l'intégrité morale et physique de toute personne à chaque instant ;",
          "assurant une prestation exempte de toute discrimination de genre, d'origine ou de croyance ;",
          "assurant sa prestation sans finalité commerciale, politique, philosophique ou religieuse ;",
          "s'interdisant tout prosélytisme, approche sectaire et manipulation mentale.",
        ],
      },
    ],
  },
];

const INDICATEURS = [
  { valeur: "100 %", label: "Taux de satisfaction 2024" },
  { valeur: "100 %", label: "Taux de réussite 2024" },
  { valeur: "100 %", label: "Objectifs atteints" },
  { valeur: "0 %", label: "Taux d'abandon" },
];

const SOMMAIRE_REFERENTIEL = [
  { id: "referentiel", label: "A. Le référentiel national qualité", icon: ShieldCheck },
  { id: "indicateurs", label: "B. Les indicateurs associés", icon: BadgeCheck },
  { id: "charte-professionnelle", label: "C. Charte professionnelle", icon: Scale },
  { id: "sous-traitance", label: "Sous-traitance & portage", icon: HeartHandshake },
];

const CRITERES = [
  {
    num: "Critère 1",
    titre: "Information du public",
    texte:
      "Conditions d'information du public sur les prestations proposées, les délais d'accès et les résultats obtenus.",
    indicateurs: "Indicateurs 1 à 3",
  },
  {
    num: "Critère 2",
    titre: "Objectifs et adaptation",
    texte:
      "Identification précise des objectifs des prestations et adaptation de celles-ci aux publics bénéficiaires.",
    indicateurs: "Indicateurs 4 à 8",
  },
  {
    num: "Critère 3",
    titre: "Accueil, accompagnement, suivi et évaluation",
    texte:
      "Adaptation aux publics bénéficiaires des prestations et des modalités d'accueil, d'accompagnement, de suivi et d'évaluation.",
    indicateurs: "Indicateurs 9 à 16",
  },
  {
    num: "Critère 4",
    titre: "Moyens pédagogiques et techniques",
    texte:
      "Adéquation des moyens pédagogiques, techniques et d'encadrement aux prestations mises en œuvre.",
    indicateurs: "Indicateurs 17 à 21",
  },
  {
    num: "Critère 5",
    titre: "Qualification et développement des compétences",
    texte:
      "Qualification et développement des connaissances et compétences des personnels chargés de mettre en œuvre les prestations.",
    indicateurs: "Indicateurs 22 et 23",
  },
  {
    num: "Critère 6",
    titre: "Investissement dans son environnement",
    texte:
      "Inscription et investissement du prestataire dans son environnement professionnel : veille légale, veille métier, réseau de partenaires, handicap.",
    indicateurs: "Indicateurs 24 à 29",
  },
  {
    num: "Critère 7",
    titre: "Recueil et amélioration continue",
    texte:
      "Recueil et prise en compte des appréciations et réclamations formulées par les parties prenantes, et mise en œuvre d'actions d'amélioration.",
    indicateurs: "Indicateurs 30 à 32",
  },
];

const INDICATEURS_CLES = [
  {
    titre: "Traçabilité de l'information (ind. 1 à 3)",
    points: [
      "Programmes publiés avec objectifs, prérequis, durée, modalités, tarifs et délais d'accès.",
      "Indicateurs de résultats publiés annuellement (satisfaction, réussite, abandon).",
    ],
  },
  {
    titre: "Analyse du besoin et positionnement (ind. 4 à 8)",
    points: [
      "Recueil des besoins formalisé avant chaque action (formulaire F0A).",
      "Test de positionnement systématique pour adapter le déroulé pédagogique.",
    ],
  },
  {
    titre: "Accueil, suivi et évaluation (ind. 9 à 16)",
    points: [
      "Convocation, convention, émargements et attestations générés depuis le portail.",
      "Évaluations des acquis en début, en cours et en fin de parcours, archivées au dossier.",
      "Prise en compte des situations de handicap et désignation d'un référent.",
    ],
  },
  {
    titre: "Moyens et compétences (ind. 17 à 23)",
    points: [
      "Vérification des CV, diplômes et références de chaque intervenant avant mission.",
      "Suivi du développement des compétences des formateurs (veille, perfectionnement).",
    ],
  },
  {
    titre: "Environnement et amélioration continue (ind. 24 à 32)",
    points: [
      "Veille légale, réglementaire, métier et handicap diffusée aux intervenants.",
      "Recueil des appréciations (F5) et traitement des réclamations et aléas.",
      "Plan d'amélioration continue revu au moins une fois par an.",
    ],
  },
];

const CHARTE_PRO = [
  "J'exerce mon activité dans le strict respect du référentiel national qualité (Qualiopi) et de la réglementation de la formation professionnelle.",
  "Je respecte la charte professionnelle de ma profession, ainsi que le présent code déontologique dans l'ensemble de mes missions.",
  "Je m'exprime de manière sincère et loyale auprès des bénéficiaires, des financeurs et de Skills4mation.",
  "Je n'interviens que dans mes domaines de compétence et refuse toute mission qui porterait atteinte à mon indépendance professionnelle.",
  "Je garantis la confidentialité des informations recueillies et le secret professionnel, y compris après la fin de la mission.",
  "Je réponds aux attentes de Skills4mation en cas de contrôle (financeur, organisme certificateur, administration) en fournissant sans délai les pièces demandées.",
  "Je signale sans délai tout aléa, difficulté ou réclamation susceptible d'affecter la qualité de la prestation.",
];

const SOUS_TRAITANCE = [
  {
    titre: "Une charte d'engagement signée avant la première mission",
    texte:
      "Tout intervenant externe, sous-traitant ou salarié porté signe, avant sa première mission, une charte d'engagement au référentiel national qualité et au présent code déontologique. Aucune action de formation n'est confiée avant réception de cette charte signée.",
  },
  {
    titre: "Vérification des compétences en amont",
    texte:
      "Le dossier de l'intervenant (CV, diplômes, références, parcours de formation, déroulé pédagogique) est instruit et validé par l'équipe Skills4mation avant l'ouverture de son accès au portail administratif.",
  },
  {
    titre: "Une conformité vérifiée périodiquement",
    texte:
      "La conformité de chaque intervenant est réexaminée au moins une fois par an et à chaque renouvellement de mission : mise à jour des pièces, preuve de veille et de perfectionnement, résultats des évaluations à chaud et des appréciations recueillies.",
  },
  {
    titre: "Des écarts traités et documentés",
    texte:
      "Tout écart constaté (pièce manquante, engagement non respecté, réclamation fondée) fait l'objet d'un plan d'action tracé. Le maintien de l'accès au portage est conditionné à la levée de l'écart.",
  },
];


function CodeDeontologique() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Notre mission : propulser votre carrière vers les sommets"
        title="Code déontologique"
        description="Les 13 articles qui engagent SKILLS4MATION et l'ensemble des formateurs mandatés, de l'analyse du besoin à l'archivage du dossier de formation."
      />

      <section className="section-shell py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CHAPITRES.map((chapitre, index) => (
            <a
              key={chapitre.id}
              href={`#${chapitre.id}`}
              className="group rounded-2xl border border-border/70 bg-card p-5 shadow-soft transition-colors hover:border-primary/40"
            >
              <span className="inline-flex rounded-xl bg-accent p-2.5 text-accent-foreground">
                <chapitre.icon className="size-4" aria-hidden />
              </span>
              <p className="eyebrow mt-4 text-muted-foreground">Chapitre {index + 1}</p>
              <p className="mt-1 text-sm font-semibold leading-snug group-hover:text-primary">
                {chapitre.titre}
              </p>
            </a>
          ))}
        </div>
      </section>

      <section className="section-shell max-w-4xl space-y-14 pb-6">
        {CHAPITRES.map((chapitre) => (
          <div key={chapitre.id} id={chapitre.id} className="scroll-mt-24">
            <div className="flex items-center gap-3">
              <span className="inline-flex rounded-xl bg-primary/10 p-2.5 text-primary">
                <chapitre.icon className="size-5" aria-hidden />
              </span>
              <h2 className="text-2xl font-semibold">{chapitre.titre}</h2>
            </div>
            {chapitre.intro ? (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{chapitre.intro}</p>
            ) : null}
            <div className="mt-6 space-y-4">
              {chapitre.articles.map((article) => (
                <Card key={article.num} className="rounded-2xl border-border/70 shadow-soft">
                  <CardContent className="p-6">
                    <p className="eyebrow text-secondary">{article.num}</p>
                    <p className="mt-2 text-base font-semibold leading-snug">{article.chapeau}</p>
                    <ul className="mt-4 space-y-2.5">
                      {article.points.map((point) => (
                        <li key={point} className="flex gap-3 text-sm text-muted-foreground">
                          <BadgeCheck className="mt-0.5 size-4 shrink-0 text-secondary" aria-hidden />
                          <span className="leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="section-shell max-w-4xl py-12">
        <Card className="rounded-3xl border-cta/40 bg-cta/10 shadow-soft">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold">En cas de non-respect du code de déontologie</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              En cas de différend ou de non-respect du code de déontologie, les parties s'efforceront
              de trouver une solution à l'amiable avant de faire appel aux tribunaux compétents.
              Elles demanderont si besoin l'intervention d'un médiateur.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="bg-muted/50 py-14">
        <div className="section-shell max-w-4xl">
          <p className="eyebrow text-secondary">Nos certificats</p>
          <h2 className="mt-2 text-2xl font-semibold">Des engagements mesurés et certifiés</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Résultats des actions de formation dispensées : indicateurs qualité suivis chaque année
            dans le cadre de notre certification Qualiopi.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            {INDICATEURS.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-border/70 bg-card p-5 text-center shadow-soft"
              >
                <p className="text-3xl font-semibold text-primary">{item.valeur}</p>
                <p className="mt-2 text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <QualiopiBadge />
            <CharteDeontologieBadge />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="cta">
              <Link to="/evaluer-droit-formation">Évaluer mes droits formation</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/contact">Parler de mon projet</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
