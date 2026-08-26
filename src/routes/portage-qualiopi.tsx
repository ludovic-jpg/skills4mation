import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Archive,
  Award,
  BadgeEuro,
  Building2,
  CalendarClock,
  ClipboardCheck,
  Compass,
  FileCheck2,
  FileSignature,
  FolderCheck,
  GraduationCap,
  Handshake,
  LayoutDashboard,
  LineChart,
  MonitorSmartphone,
  Network,
  PenTool,
  Quote,
  Receipt,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Timer,
  UserCheck,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";

import formateurWebapp from "@/assets/formateur-webapp.jpg";
import formatriceTablette from "@/assets/formatrice-tablette.jpg";
import peopleEquipe from "@/assets/people-equipe.jpg";
import portageHero from "@/assets/portage-hero.jpg";
import { QualiopiBadge } from "@/components/Brand";
import { PortailMockup } from "@/components/site/PortailMockup";
import { PublicLayout } from "@/components/site/PublicLayout";
import { SimulateurCommission } from "@/components/site/SimulateurCommission";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const TITRE = "Portage Qualiopi Formation et Bilan de Compétences | Skills4mation";
const DESCRIPTION =
  "Portage Qualiopi pour vos actions de formation et vos bilans de compétences : conventions en 48h, accès aux financements OPCO, autonomie pédagogique totale. 99 € HT/an + 20 % de commission.";

const FAQ = [
  {
    q: "Qu'est-ce que le portage Qualiopi ?",
    a: "Le portage Qualiopi consiste à confier la partie administrative et qualité de vos formations à un organisme déjà certifié. Vous concevez et animez vos sessions, Skills4mation produit les conventions, assure le suivi qualité Qualiopi et facture les financeurs.",
  },
  {
    q: "Le portage Qualiopi est-il légal ?",
    a: "Oui, dans le cadre où nous opérons : un contrat clair définit les responsabilités de chacun, notre équipe assure un véritable suivi qualité et pédagogique, et nous ne portons que des financements professionnels.",
  },
  {
    q: "Est-ce que je garde mon autonomie pédagogique ?",
    a: "Totalement. Vous concevez vos contenus et animez vos sessions comme vous l'entendez ; nous nous chargeons de la conformité, de l'administratif et du financement.",
  },
  {
    q: "Combien de temps pour démarrer ?",
    a: "Votre convention et vos documents sont produits en 48h chrono après validation de votre dossier.",
  },
  {
    q: "Quel est le coût du portage Qualiopi ?",
    a: "Un abonnement de 99 € HT/an et une commission de 20 % sur le chiffre d'affaires HT généré via le portage. Aucun autre frais.",
  },
  {
    q: "Qui reste responsable de la qualité pédagogique ?",
    a: "Vous, en tant qu'expert animant la formation ; nous supervisons la conformité au référentiel qualité et vous accompagnons si besoin dans la structuration de vos contenus.",
  },
  {
    q: "Puis-je cumuler le portage avec une micro-entreprise ou une autre structure ?",
    a: "Oui, le portage Qualiopi s'adresse aux indépendants (micro-entreprise, EI, société), aux organismes non certifiés et aux entreprises de formation ou de conseil.",
  },
];

export const Route = createFileRoute("/portage-qualiopi")({
  head: () => ({
    meta: [
      { title: TITRE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITRE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://train-grow-connect.lovable.app/portage-qualiopi" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://train-grow-connect.lovable.app/portage-qualiopi" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }),
      },
    ],
  }),
  component: PortageQualiopi,
});

const CONFIANCE = [
  {
    icon: ShieldCheck,
    titre: "Certification Qualiopi",
    texte: "Nos process et notre organisation sont audités et certifiés.",
  },
  {
    icon: ScrollText,
    titre: "Charte déontologique",
    texte: "Transparence, confidentialité, amélioration continue.",
  },
  {
    icon: Network,
    titre: "Réseau d'experts métier",
    texte: "Une communauté de formateurs et consultants portés.",
  },
  {
    icon: Wallet,
    titre: "Financements professionnels",
    texte: "OPCO, plan de développement des compétences, AIF, Transitions Pro/Pro-A, FAF.",
  },
];

const ETAPES = [
  {
    icon: Compass,
    titre: "Prise de contact & diagnostic",
    texte: "Vous nous présentez votre expertise, votre public et vos objectifs pédagogiques.",
  },
  {
    icon: FileSignature,
    titre: "Constitution du dossier",
    texte: "Nous produisons votre convention et vos documents obligatoires en 48h chrono.",
  },
  {
    icon: GraduationCap,
    titre: "Vous animez en toute autonomie",
    texte: "Vous concevez vos contenus et dispensez vos formations comme vous l'entendez.",
  },
  {
    icon: Receipt,
    titre: "Nous gérons l'administratif et les financements",
    texte: "Facturation, relances OPCO, suivi qualité, bilan pédagogique et financier (BPF).",
  },
  {
    icon: Handshake,
    titre: "Vous êtes payé, on vous fait grandir",
    texte: "Reversement de votre rémunération et accès à notre réseau pour monter en compétences.",
  },
];

const PRISE_EN_CHARGE = [
  { icon: FileSignature, label: "Conventions et programmes de formation" },
  { icon: ClipboardCheck, label: "Feuilles d'émargement et attestations" },
  { icon: FileCheck2, label: "Bilan pédagogique et financier (BPF)" },
  { icon: ShieldCheck, label: "Respect et suivi des critères Qualiopi" },
  { icon: Receipt, label: "Facturation clients et organismes financeurs" },
  { icon: Sparkles, label: "Accompagnement à la conception pédagogique" },
  { icon: Network, label: "Accès à notre réseau d'experts métier" },
  { icon: LayoutDashboard, label: "Extranet / espace de gestion en ligne" },
];

const PROFILS = [
  {
    icon: UserCheck,
    titre: "Formateurs indépendants & experts métier",
    texte:
      "Vous avez une expertise reconnue mais pas encore d'organisme de formation certifié ? Formez sous notre certification Qualiopi, sans démarche d'audit, et accédez immédiatement aux financements professionnels.",
  },
  {
    icon: Building2,
    titre: "Organismes de formation non certifiés",
    texte:
      "Votre structure existe mais n'est pas (encore) certifiée Qualiopi ? Continuez à développer votre activité en vous appuyant sur notre certification et notre suivi qualité.",
  },
  {
    icon: Users,
    titre: "Entreprises de formation et de conseil",
    texte:
      "Vous proposez formation et conseil et souhaitez élargir votre offre à des sessions financées, sans alourdir votre structure administrative ? Nous prenons en charge la conformité et la gestion des financements.",
  },
];

const AUTRES_SERVICES = [
  {
    icon: Compass,
    titre: "Ingénierie pédagogique sur mesure",
    texte: "Diagnostic de vos besoins et conception modulaire de parcours adaptés à votre public.",
  },
  {
    icon: Network,
    titre: "Réseau d'experts métier",
    texte:
      "Une communauté de formateurs et consultants pour échanger, monter en compétences et co-animer.",
  },
  {
    icon: Sparkles,
    titre: "Parcours personnalisés",
    texte: "Des formats adaptés à chaque public : présentiel, distanciel, blended learning.",
  },
  {
    icon: LineChart,
    titre: "Mesure d'impact",
    texte:
      "Indicateurs de satisfaction et de compétences pour objectiver la qualité de vos formations.",
  },
];

const TEMOIGNAGES = [
  { nom: "[Prénom, fonction]", texte: "[Témoignage à compléter]" },
  { nom: "[Prénom, fonction]", texte: "[Témoignage à compléter]" },
  { nom: "[Prénom, fonction]", texte: "[Témoignage à compléter]" },
];

const SERVICE_AAS = [
  {
    icon: MonitorSmartphone,
    titre: "Portail administratif dédié",
    texte:
      "Une web app pour constituer l'ensemble de vos dossiers formation en 48h, conformes et certifiés Qualiopi.",
  },
  {
    icon: LayoutDashboard,
    titre: "Publiez vos parcours de formation",
    texte:
      "Créez vos programmes, publiez-les au catalogue Skills4mation et recevez des demandes qualifiées.",
  },
  {
    icon: Award,
    titre: "Programme Ambassadeur",
    texte:
      "Un vrai réseau de recommandation : suivi de vos dossiers, KPI de recommandation et avantages associés.",
  },
];

const WEBAPP_ETAPES = [
  {
    icon: UserCog,
    titre: "Modification de votre profil formateur",
    texte: "Expertises, tarifs, CV, références : votre vitrine reste à jour en quelques clics.",
  },
  {
    icon: FolderCheck,
    titre: "Constitution de vos pièces administratives et pédagogiques",
    texte: "Conventions, programmes, émargements, évaluations : générés et contrôlés par nos soins.",
  },
  {
    icon: PenTool,
    titre: "Signature de vos documents",
    texte: "Signature électronique horodatée pour vous, vos stagiaires et vos clients.",
  },
  {
    icon: Archive,
    titre: "Archivage prêt pour l'audit",
    texte: "Chaque dossier est conservé et retrouvable instantanément en cas de contrôle Qualiopi.",
  },
];

const AMBASSADEUR = [
  "Parrainez des formateurs et des clients depuis votre espace",
  "Suivi en temps réel de vos recommandations et de leur statut",
  "Mise en avant au catalogue et priorité sur les projets du réseau",
  "Co-animations et montée en compétences avec les experts portés",
];

const KPI = [
  { valeur: "48h", label: "Dossier prêt" },
  { valeur: "10 j", label: "Paiement ouvrés" },
  { valeur: "100 %", label: "Conformité" },
  { valeur: "4,8/5", label: "Satisfaction" },
];


function PortageQualiopi() {
  return (
    <PublicLayout>
      <section className="bg-gradient-hero text-primary-foreground">
        <div className="section-shell grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="eyebrow text-cta">Espace formateur · Portage Qualiopi</p>
            <h1 className="mt-4 text-4xl font-semibold text-primary-foreground sm:text-5xl">
              Portage Qualiopi : formez sous notre certification, sans créer votre organisme
            </h1>
            <p className="mt-5 max-w-xl text-lg text-primary-foreground/85">
              Skills4mation porte votre activité de formation sous sa certification Qualiopi : vous
              concevez et animez, nous gérons la conformité, les financements et l'administratif.
              Conventions prêtes en 48h chrono, commission unique et transparente.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="cta" size="lg">
                <Link to="/pole-formateur" hash="candidature">Rejoindre Skills4mation</Link>
              </Button>
              <Button asChild variant="onDark" size="lg">
                <Link to="/portage-qualiopi" hash="tarifs">
                  Voir les tarifs
                </Link>
              </Button>
            </div>
            <ul className="mt-10 grid gap-2 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-cta" aria-hidden /> Certifié Qualiopi — 100 %
                financements professionnels
              </li>
              <li className="flex items-center gap-2">
                <GraduationCap className="size-4 text-cta" aria-hidden /> Autonomie pédagogique
                totale
              </li>
              <li className="flex items-center gap-2">
                <CalendarClock className="size-4 text-cta" aria-hidden /> Documents et conventions
                en 48h chrono
              </li>
            </ul>
          </div>

          <img
            src={portageHero}
            alt="Formatrice indépendante préparant son dossier de formation Qualiopi"
            width={1600}
            height={1104}
            className="rounded-3xl object-cover shadow-elevated"
          />
        </div>
      </section>

      <section className="section-shell py-16 lg:py-20">
        <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl">
          Une plateforme conforme, pensée pour les experts qui forment
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CONFIANCE.map((item) => (
            <Card key={item.titre} className="rounded-2xl border-border/70 shadow-soft">
              <CardContent className="p-6">
                <span className="inline-flex rounded-xl bg-accent p-3 text-accent-foreground">
                  <item.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{item.titre}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.texte}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="portage" className="scroll-mt-24 bg-muted/60 py-16 lg:py-20">
        <div className="section-shell max-w-4xl">
          <p className="eyebrow">Qu'est-ce que le portage Qualiopi ?</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Le raccourci vers les financements professionnels
          </h2>
          <p className="mt-5 text-muted-foreground">
            Le portage Qualiopi consiste à confier la partie administrative et qualité de vos
            formations à un organisme déjà certifié. Concrètement : vous définissez le contenu,
            animez vos sessions et gardez la relation pédagogique avec vos stagiaires ;
            Skills4mation prend en charge les conventions, les documents obligatoires, le suivi
            qualité Qualiopi et la facturation auprès des financeurs. Vous accédez ainsi aux
            financements professionnels (OPCO, plan de développement des compétences, AIF,
            Transitions Pro/Pro-A, FAF) sans attendre ni financer un audit de certification.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <QualiopiBadge />
          </div>
        </div>
      </section>

      <section id="etapes" className="section-shell scroll-mt-24 py-16 lg:py-20">
        <p className="eyebrow">Comment ça marche</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">
          De votre idée de formation à votre première session financée
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {ETAPES.map((item, index) => (
            <Card key={item.titre} className="rounded-2xl border-border/70 shadow-soft">
              <CardContent className="flex gap-5 p-6">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-teal text-primary-foreground">
                  <item.icon className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-secondary">
                    Étape {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">{item.titre}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.texte}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/60 py-16 lg:py-20">
        <div className="section-shell">
          <p className="eyebrow">Ce que nous prenons en charge</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">
            Un partenaire qui absorbe la charge administrative
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRISE_EN_CHARGE.map((item) => (
              <li
                key={item.label}
                className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-5 shadow-soft"
              >
                <item.icon className="mt-0.5 size-5 shrink-0 text-secondary" aria-hidden />
                <span className="text-sm font-medium">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="portail" className="section-shell scroll-mt-24 py-16 lg:py-20">
        <p className="eyebrow">Portage Qualiopi as a Service</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold sm:text-4xl">
          Un portail administratif pour monter vos dossiers formation en 48h, certifiés Qualiopi
        </h2>
        <p className="mt-5 max-w-3xl text-muted-foreground">
          Notre web app centralise tout votre portage : profil formateur, pièces administratives et
          pédagogiques, signature électronique, archivage prêt pour l'audit, publication de vos
          parcours de formation, suivi de vos dossiers et de vos KPI de recommandation. Une solution
          sur mesure pour vous faciliter le suivi de vos dossiers formation — et un paiement sous
          10 jours ouvrés à réception des fonds.
        </p>

        <div className="mt-10 grid items-center gap-6 lg:grid-cols-2">
          <img
            src={formateurWebapp}
            alt="Formateur souriant utilisant le portail administratif Skills4mation sur son ordinateur"
            width={1600}
            height={1104}
            loading="lazy"
            className="h-72 w-full rounded-3xl object-cover shadow-elevated sm:h-96"
          />
          <img
            src={formatriceTablette}
            alt="Formatrice consultant ses dossiers de formation sur tablette entre deux sessions"
            width={1408}
            height={1008}
            loading="lazy"
            className="h-72 w-full rounded-3xl object-cover shadow-elevated sm:h-96"
          />
        </div>


        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {SERVICE_AAS.map((item) => (
            <Card key={item.titre} className="rounded-2xl border-border/70 shadow-soft">
              <CardContent className="p-6">
                <span className="inline-flex rounded-xl bg-accent p-3 text-accent-foreground">
                  <item.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{item.titre}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.texte}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1.15fr_1fr]">
          <PortailMockup />
          <div>
            <p className="eyebrow">Aperçu de la web app</p>
            <h3 className="mt-3 text-2xl font-semibold">
              Tout votre dossier formation, du profil à l'archivage
            </h3>
            <ul className="mt-6 space-y-4">
              {WEBAPP_ETAPES.map((item) => (
                <li key={item.titre} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-teal text-primary-foreground">
                    <item.icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{item.titre}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.texte}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Timer className="size-5 text-secondary" aria-hidden /> Paiement sous 10 jours
                ouvrés
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Votre rémunération est reversée sous 10 jours ouvrés à réception des fonds du
                financeur — suivi du règlement visible dans votre espace.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="cta" size="lg">
                <Link to="/pole-formateur">Accéder au portail formateur</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <Card className="rounded-3xl border-none bg-gradient-hero text-primary-foreground shadow-elevated">
            <CardContent className="p-8">
              <Award className="size-8 text-cta" aria-hidden />
              <h3 className="mt-5 text-2xl font-semibold text-primary-foreground">
                Programme Ambassadeur
              </h3>
              <p className="mt-3 text-primary-foreground/85">
                Recommandez des formateurs et des clients, suivez vos recommandations dans votre
                tableau de bord et débloquez des avantages selon votre niveau : mise en avant au
                catalogue, co-animations, priorité sur les appels d'offres du réseau.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-primary-foreground/85">
                {AMBASSADEUR.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Users className="mt-0.5 size-4 shrink-0 text-cta" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/70 shadow-soft">
            <CardContent className="p-8">
              <LineChart className="size-8 text-secondary" aria-hidden />
              <h3 className="mt-5 text-2xl font-semibold">Suivi des dossiers & KPI</h3>
              <p className="mt-3 text-muted-foreground">
                Un vrai réseau de recommandation, piloté par les chiffres : avancement de chaque
                dossier, taux de conformité, satisfaction stagiaires, recommandations générées et
                reçues.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {KPI.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border/70 bg-muted/40 p-4"
                  >
                    <p className="text-xl font-semibold">{item.valeur}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-xs text-muted-foreground">
                Indicateurs illustratifs de l'interface de suivi.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="tarifs" className="section-shell scroll-mt-24 py-16 lg:py-20">

        <p className="eyebrow">Tarifs</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">
          Une tarification simple et transparente
        </h2>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <Card className="rounded-3xl border-none bg-gradient-hero text-primary-foreground shadow-elevated">
            <CardContent className="p-8">
              <BadgeEuro className="size-8 text-cta" aria-hidden />
              <p className="mt-5 text-4xl font-semibold text-primary-foreground">99 € HT / an</p>
              <p className="mt-2 text-primary-foreground/85">
                d'abonnement plateforme + <strong>20 %</strong> de commission sur le chiffre
                d'affaires HT généré via le portage.
              </p>
              <p className="mt-4 text-sm text-primary-foreground/75">
                Pas de frais cachés, pas d'engagement au-delà de l'abonnement annuel.
              </p>
              <div className="mt-7 rounded-2xl bg-primary-foreground/10 p-5 text-sm">
                <p className="font-semibold text-primary-foreground">Exemple de calcul</p>
                <p className="mt-2 text-primary-foreground/85">
                  Vous facturez une formation à 3 000 € HT.
                  <br />
                  Commission Skills4mation (20 %) : 600 €
                  <br />
                  Montant qui vous est reversé : 2 400 € HT
                </p>
              </div>
            </CardContent>
          </Card>

          <SimulateurCommission />
        </div>
      </section>

      <section id="profils" className="scroll-mt-24 bg-muted/60 py-16 lg:py-20">
        <div className="section-shell">
          <p className="eyebrow">Pour qui ?</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">
            Un portage pensé pour trois profils
          </h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {PROFILS.map((item) => (
              <Card key={item.titre} className="rounded-2xl border-border/70 shadow-soft">
                <CardContent className="p-6">
                  <span className="inline-flex rounded-xl bg-accent p-3 text-accent-foreground">
                    <item.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{item.titre}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.texte}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <img
            src={peopleEquipe}
            alt="Formateurs indépendants souriants échangeant autour du réseau Skills4mation"
            width={1600}
            height={1008}
            loading="lazy"
            className="mt-10 h-64 w-full rounded-3xl object-cover shadow-soft sm:h-80"
          />

        </div>
      </section>

      <section className="section-shell py-16 lg:py-20">
        <p className="eyebrow">Nos autres services</p>
        <h2 className="mt-3 max-w-2xl text-2xl font-semibold sm:text-3xl">
          Au-delà du portage, un accompagnement complet
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUTRES_SERVICES.map((item) => (
            <Card key={item.titre} className="rounded-2xl border-border/70">
              <CardContent className="p-5">
                <item.icon className="size-5 text-secondary" aria-hidden />
                <h3 className="mt-3 text-sm font-semibold">{item.titre}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.texte}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 bg-muted/60 py-16 lg:py-20">
        <div className="section-shell max-w-3xl">
          <p className="eyebrow">Ressources & FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Vos questions sur le portage Qualiopi
          </h2>
          <Accordion type="single" collapsible className="mt-8">
            {FAQ.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="text-left text-base font-semibold">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="section-shell py-16 lg:py-20">
        <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl">
          Ils forment sereinement grâce à Skills4mation
        </h2>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {TEMOIGNAGES.map((item, index) => (
            <Card key={index} className="rounded-2xl border-border/70 shadow-soft">
              <CardContent className="p-6">
                <Quote className="size-6 text-secondary" aria-hidden />
                <p className="mt-4 text-sm text-muted-foreground">« {item.texte} »</p>
                <p className="mt-4 text-sm font-semibold">{item.nom}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="section-shell pb-20">
        <Card className="rounded-3xl border-none bg-gradient-hero text-primary-foreground shadow-elevated">
          <CardContent className="p-8 sm:p-12">
            <h2 className="max-w-2xl text-3xl font-semibold text-primary-foreground sm:text-4xl">
              Prêt à former sans les contraintes de la certification ?
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="cta" size="lg">
                <Link to="/pole-formateur" hash="candidature">Rejoindre Skills4mation</Link>
              </Button>
              <Button asChild variant="onDark" size="lg">
                <Link to="/contact">Nous contacter</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-primary-foreground/75">
              Formateurs & organismes : rejoignez le portage. Entreprises de formation et de conseil
              : parlons de votre projet.
            </p>
          </CardContent>
        </Card>
      </section>
    </PublicLayout>
  );
}
