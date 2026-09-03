import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  CalendarClock,
  ClipboardCheck,
  Compass,
  FileLock2,
  HeartHandshake,
  Lock,
  ShieldCheck,
  Sparkles,
  Timer,
  Users,
  Video,
} from "lucide-react";

import { QualiopiBadge } from "@/components/Brand";
import { PageHero, PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroImage from "@/assets/formatrice-tablette.jpg";
import consultantsImage from "@/assets/people-equipe.jpg";

const TITLE = "Bilan de compétences 13 h — 1 600 € — Skills4mation";
const DESCRIPTION =
  "Bilan de compétences de 13 h en présentiel ou distanciel, réparti sur 2 mois, au tarif de 1 600 €. Trois phases réglementaires, confidentialité garantie et portage Qualiopi pour les consultants CBC.";

export const Route = createFileRoute("/bilan-de-competences")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://skills4mation.com/bilan-de-competences" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://skills4mation.com/bilan-de-competences" }],
  }),
  component: BilanDeCompetences,
});

const PHASES = [
  {
    titre: "Phase préliminaire",
    duree: "2 h",
    icon: Compass,
    points: [
      "Analyse de la demande et du contexte professionnel",
      "Vérification de l'engagement volontaire du bénéficiaire",
      "Définition conjointe des objectifs et du rythme des entretiens",
    ],
  },
  {
    titre: "Phase d'investigation",
    duree: "8 h",
    icon: Users,
    points: [
      "Exploration du parcours, des compétences et des motivations",
      "Tests et questionnaires d'appui (personnalité, intérêts professionnels)",
      "Étude du marché du travail et confrontation du projet au réel",
    ],
  },
  {
    titre: "Phase de conclusion",
    duree: "3 h",
    icon: ClipboardCheck,
    points: [
      "Document de synthèse remis exclusivement au bénéficiaire",
      "Plan d'action détaillé et étapes de mise en œuvre",
      "Entretien de suivi à 6 mois inclus dans la formule",
    ],
  },
];

const FORMULE = [
  { label: "Durée totale", valeur: "13 h", detail: "réparties sur 2 mois" },
  { label: "Modalité", valeur: "Présentiel ou distanciel", detail: "entretiens individuels" },
  { label: "Tarif", valeur: "1 600 €", detail: "tout inclus, suivi à 6 mois compris" },
  { label: "Financement", valeur: "OPCO · Entreprise", detail: "ou fonds propres" },
];

const PORTAGE = [
  {
    titre: "Portage Qualiopi de votre activité CBC",
    icon: ShieldCheck,
    texte:
      "Vous réalisez les bilans, nous portons la conformité : certification Qualiopi, conventions, émargements, évaluations et archivage réglementaire de chaque dossier.",
  },
  {
    titre: "Contractualisation et financement",
    icon: FileLock2,
    texte:
      "Demandes CPF, OPCO ou entreprise montées depuis le portail administratif, dossiers complets sous 48 h et suivi du financement jusqu'au règlement.",
  },
  {
    titre: "Rémunération sous 10 jours ouvrés",
    icon: CalendarClock,
    texte:
      "99 € / an + 20 % de commission, sans frais cachés. Paiement du consultant sous 10 jours ouvrés à réception des fonds du financeur.",
  },
  {
    titre: "Réseau et recommandation",
    icon: HeartHandshake,
    texte:
      "Programme ambassadeur, publication de votre offre de bilan sur le catalogue Skills4mation et mise en relation avec les bénéficiaires.",
  },
];

const CONFIDENTIALITE = [
  {
    titre: "Entretiens sur une ligne dédiée",
    icon: Video,
    texte:
      "Les entretiens à distance se tiennent en visioconférence sur une ligne dédiée au bilan, accessible par un lien nominatif à usage unique, sans enregistrement audio ou vidéo. En présentiel, ils ont lieu dans un espace privatif fermé, sans passage ni tiers présent dans la salle.",
  },
  {
    titre: "Aucune transmission sans accord écrit",
    icon: Lock,
    texte:
      "Le dossier du bénéficiaire, ses résultats de tests et son document de synthèse ne sont communiqués ni à l'employeur, ni au financeur, ni à un tiers sans son accord écrit exprès. Le financeur ne reçoit que les pièces réglementaires de réalisation (convention, attestation d'assiduité), sans contenu du bilan.",
  },
  {
    titre: "Secret professionnel du consultant CBC",
    icon: ShieldCheck,
    texte:
      "Chaque consultant CBC est tenu au secret professionnel sur l'ensemble des informations recueillies, y compris après la fin du bilan. Cet engagement figure dans la charte signée avant sa première mission et s'applique aux échanges internes : aucun élément du bilan n'est partagé au sein de l'équipe hors nécessité administrative.",
  },
  {
    titre: "Durée de conservation définie",
    icon: Timer,
    texte:
      "Les documents de travail et résultats de tests sont détruits à l'issue du bilan, sauf demande écrite de conservation du bénéficiaire (1 an maximum). Les pièces administratives obligatoires sont conservées 3 ans après la fin de l'action, conformément aux obligations de contrôle des financeurs, puis supprimées.",
  },
  {
    titre: "Conformité RGPD",
    icon: FileLock2,
    texte:
      "Les données sont hébergées dans l'Union européenne, avec accès restreint et journalisé. Le bénéficiaire peut à tout moment demander l'accès, la rectification, la portabilité ou la suppression de ses données.",
  },
];

function BilanDeCompetences() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Bilan de compétences"
        title="Faire le point, décider, avancer."
        description="Un bilan de compétences de 13 h (présentiel ou distanciel, sur 2 mois), mené par un consultant CBC, dans un cadre strictement confidentiel. Et pour les consultants : le portage Qualiopi de votre activité de bilan."
      />

      <section className="section-shell grid gap-8 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="eyebrow text-secondary">Notre formule</p>
          <h2 className="mt-2 text-3xl font-semibold">Trois phases, un projet qui tient debout</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Le bilan de compétences Skills4mation — 13 h sur 2 mois, 1 600 € — suit les trois phases prévues par le Code du
            travail (art. R. 6313-4 à R. 6313-8) : préliminaire, investigation, conclusion. Chaque
            parcours est individualisé selon votre projet professionnel et votre disponibilité, en
            soirée ou sur temps de travail.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {FORMULE.map((item) => (
              <div key={item.label} className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-lg font-semibold text-primary">{item.valeur}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="cta" size="lg">
              <Link to="/evaluer-droit-formation">Évaluer mon financement</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Parler de mon projet</Link>
            </Button>
          </div>
        </div>
        <img
          src={heroImage}
          alt="Consultante en bilan de compétences en entretien individuel"
          className="h-full w-full rounded-3xl object-cover shadow-soft"
          loading="lazy"
        />
      </section>

      <section className="bg-muted/50 py-14">
        <div className="section-shell">
          <p className="eyebrow text-secondary">Déroulé</p>
          <h2 className="mt-2 text-2xl font-semibold">Les 13 heures de votre bilan</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {PHASES.map((phase) => (
              <Card key={phase.titre} className="rounded-2xl border-border/70 shadow-soft">
                <CardContent className="p-6">
                  <span className="inline-flex rounded-xl bg-primary/10 p-2.5 text-primary">
                    <phase.icon className="size-5" aria-hidden />
                  </span>
                  <p className="mt-4 text-base font-semibold">{phase.titre}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                    {phase.duree}
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {phase.points.map((point) => (
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
      </section>

      <section id="confidentialite" className="section-shell max-w-4xl scroll-mt-24 py-14">
        <p className="eyebrow text-secondary">Cadre de confiance</p>
        <h2 className="mt-2 text-2xl font-semibold">Confidentialité et discrétion des échanges</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Un bilan de compétences n'a de valeur que si le bénéficiaire peut tout dire sans crainte.
          Voici concrètement les mesures que Skills4mation applique à chaque accompagnement.
        </p>
        <div className="mt-8 space-y-4">
          {CONFIDENTIALITE.map((item) => (
            <Card key={item.titre} className="rounded-2xl border-border/70 shadow-soft">
              <CardContent className="flex gap-4 p-6">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <item.icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-base font-semibold leading-snug">{item.titre}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.texte}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Détail des traitements, bases légales et modalités d'exercice de vos droits :{" "}
          <Link to="/politique-de-confidentialite" className="font-semibold text-primary underline">
            politique de confidentialité
          </Link>
          . Nos engagements professionnels sont décrits dans notre{" "}
          <Link to="/code-deontologique" className="font-semibold text-primary underline">
            code déontologique
          </Link>
          .
        </p>
      </section>

      <section className="bg-muted/50 py-14">
        <div className="section-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <img
            src={consultantsImage}
            alt="Consultants en bilan de compétences échangeant autour d'un projet"
            className="h-full w-full rounded-3xl object-cover shadow-soft"
            loading="lazy"
          />
          <div>
            <p className="eyebrow text-secondary">Consultants CBC</p>
            <h2 className="mt-2 text-3xl font-semibold">
              Le portage Qualiopi de votre activité de bilan
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Vous êtes consultant en bilan de compétences, indépendant ou salarié porté ? Vous
              conservez votre méthode, votre tarif et votre relation client. Skills4mation prend en
              charge la conformité Qualiopi, la contractualisation et le financement.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {PORTAGE.map((item) => (
                <div key={item.titre} className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
                  <span className="inline-flex rounded-xl bg-primary/10 p-2.5 text-primary">
                    <item.icon className="size-4" aria-hidden />
                  </span>
                  <p className="mt-3 text-sm font-semibold leading-snug">{item.titre}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.texte}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button asChild variant="cta" size="lg">
                <Link to="/pole-formateur" hash="candidature">
                  Rejoindre Skills4mation
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/portage-qualiopi">Découvrir le portage Qualiopi</Link>
              </Button>
              <QualiopiBadge />
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell max-w-4xl py-14">
        <Card className="rounded-3xl border-cta/40 bg-cta/10 shadow-soft">
          <CardContent className="p-8">
            <span className="inline-flex rounded-xl bg-cta/20 p-2.5 text-cta-foreground">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <h2 className="mt-4 text-xl font-semibold">Un doute sur votre éligibilité ?</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              En quelques minutes, nous estimons votre budget formation mobilisable et la meilleure
              voie de financement pour votre bilan de compétences.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="cta">
                <Link to="/evaluer-droit-formation">Diagnostic Express</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">Être rappelé</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </PublicLayout>
  );
}
