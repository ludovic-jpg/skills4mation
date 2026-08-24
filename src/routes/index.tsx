import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeEuro,
  Building2,
  CalendarClock,
  ClipboardCheck,
  Compass,
  FileCheck2,
  FileSignature,
  GraduationCap,
  Handshake,
  LayoutDashboard,
  LineChart,
  Network,
  Quote,
  Receipt,
  ScrollText,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  Wallet,
  BookOpen,
  CalendarHeart,
  MessagesSquare,
  Route as RouteIcon,
  Target,
  UserSearch,
} from "lucide-react";

import heroImage from "@/assets/hero-formation.jpg";
import { QualiopiBadge } from "@/components/Brand";
import { EvaluationBudget } from "@/components/site/EvaluationBudget";
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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portage Qualiopi | Formez sous notre certification — Skills4mation" },
      {
        name: "description",
        content:
          "Skills4mation porte votre activité de formation sous sa certification Qualiopi. Autonomie pédagogique, conventions en 48h, commission unique de 20 %.",
      },
      {
        property: "og:title",
        content: "Portage Qualiopi | Formez sous notre certification — Skills4mation",
      },
      {
        property: "og:description",
        content:
          "Portage Qualiopi pour formateurs indépendants, organismes non certifiés et entreprises de formation. 99 € HT/an + 20 % de commission.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Accueil,
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
    texte:
      "Reversement de votre rémunération et accès à notre réseau pour monter en compétences.",
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

const APPRENANTS = [
  {
    icon: UserSearch,
    titre: "Le formateur que vous choisissez",
    texte:
      "Vous consultez le profil, l'expertise et l'approche pédagogique du formateur avant de vous engager. Le courant doit passer : c'est la première condition d'une formation utile.",
  },
  {
    icon: Target,
    titre: "Un parcours calé sur votre projet pro",
    texte:
      "Évolution, prise de poste, reconversion ou développement de votre activité : le contenu est construit à partir de votre objectif, pas d'un programme standard.",
  },
  {
    icon: CalendarHeart,
    titre: "Compatible avec votre vie réelle",
    texte:
      "Sessions en soirée, sur une demi-journée, en distanciel ou fractionnées sur plusieurs semaines : le rythme s'adapte à vos disponibilités personnelles.",
  },
];

const PROJET_ETAPES = [
  "Un entretien de cadrage pour poser votre objectif professionnel et votre niveau de départ",
  "Une proposition de formateur et de programme sur mesure, ajustée à vos contraintes",
  "Un calendrier construit avec vous, selon vos disponibilités personnelles",
  "Le montage de votre financement et le suivi administratif de A à Z",
  "Un point de suivi post-formation pour ancrer et mesurer vos acquis",
];

const FAQ = [
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
    q: "Quel est le coût du portage ?",
    a: "Un abonnement de 99 € HT/an et une commission de 20 % sur le chiffre d'affaires HT généré via le portage. Aucun autre frais.",
  },
  {
    q: "Qui reste responsable de la qualité pédagogique ?",
    a: "Vous, en tant qu'expert animant la formation ; nous supervisons la conformité au référentiel qualité et vous accompagnons si besoin dans la structuration de vos contenus.",
  },
  {
    q: "Puis-je cumuler avec un statut de micro-entrepreneur ou une autre structure ?",
    a: "Oui, le portage Qualiopi s'adresse aux indépendants (micro-entreprise, EIRL…), aux organismes non certifiés et aux entreprises de formation ou de conseil.",
  },
];

const TEMOIGNAGES = [
  { nom: "[Prénom, fonction]", texte: "[Témoignage à compléter]" },
  { nom: "[Prénom, fonction]", texte: "[Témoignage à compléter]" },
  { nom: "[Prénom, fonction]", texte: "[Témoignage à compléter]" },
];

function Accueil() {
  return (
    <PublicLayout>
      <section className="bg-gradient-hero text-primary-foreground">
        <div className="section-shell grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="eyebrow text-cta">Portage Qualiopi & formations sur mesure</p>
            <h1 className="mt-4 text-4xl font-semibold text-primary-foreground sm:text-5xl lg:text-6xl">
              Le portage Qualiopi qui vous laisse 100 % libre de former.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-primary-foreground/85">
              Skills4mation porte votre activité de formation sous sa certification Qualiopi : vous
              concevez et animez, nous gérons la conformité, les financements et l'administratif.
              Conventions prêtes en 48h chrono, commission unique et transparente.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="cta" size="lg">
                <Link to="/pole-formateur">Devenir partenaire porté</Link>
              </Button>
              <Button asChild variant="onDark" size="lg">
                <Link to="/" hash="etapes">
                  Découvrir comment ça marche
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

          <div className="relative">
            <img
              src={heroImage}
              alt="Formatrice animant un atelier professionnel en entreprise"
              width={1600}
              height={1104}
              className="rounded-3xl object-cover shadow-elevated"
            />
          </div>
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
          <div>
            <p className="eyebrow">Qu'est-ce que le portage Qualiopi ?</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Formez sous notre certification, sans créer votre organisme de formation
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
        </div>
      </section>


      <section id="apprenants" className="section-shell scroll-mt-24 py-16 lg:py-20">
        <p className="eyebrow">Vous êtes apprenant</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold sm:text-4xl">
          Formez-vous auprès du formateur de votre choix
        </h2>
        <p className="mt-5 max-w-3xl text-muted-foreground">
          Chez Skills4mation, vous ne choisissez pas seulement un programme : vous choisissez la
          personne qui va vous accompagner. Nos formateurs experts sont sélectionnés pour leur
          pratique du métier, et chaque parcours est ajusté à votre projet professionnel, à votre
          niveau réel et à vos disponibilités personnelles.
        </p>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {APPRENANTS.map((item) => (
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

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <Card className="rounded-3xl border-none bg-gradient-hero text-primary-foreground shadow-elevated">
            <CardContent className="flex h-full flex-col p-6 sm:p-8">
              <span className="inline-flex w-fit rounded-xl bg-primary-foreground/10 p-3">
                <BookOpen className="size-5 text-cta" aria-hidden />
              </span>
              <h3 className="mt-4 text-xl font-semibold text-primary-foreground">
                Découvrez le catalogue de formation
              </h3>
              <p className="mt-3 text-sm text-primary-foreground/85">
                Bien-être, bureautique &amp; digital, business, management, langues, sécurité… Des
                dizaines de formations professionnelles, disponibles en présentiel, à distance ou en
                format mixte, adaptables en individuel comme en collectif.
              </p>
              <div className="mt-auto pt-7">
                <Button asChild variant="cta" size="lg">
                  <Link to="/catalogue">Explorer le catalogue</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <EvaluationBudget />
        </div>
      </section>

      <section id="projet" className="scroll-mt-24 bg-muted/60 py-16 lg:py-20">
        <div className="section-shell grid gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="eyebrow">Votre projet, votre rythme</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Parler de mon projet de formation
            </h2>
            <p className="mt-5 text-muted-foreground">
              Un échange de 20 minutes suffit pour clarifier votre objectif professionnel,
              identifier la formation et le formateur adaptés, caler un calendrier compatible avec
              votre emploi du temps et sécuriser votre financement. Nous revenons vers vous sous 48
              heures ouvrées avec une proposition personnalisée.
            </p>
            <ul className="mt-6 grid gap-3 text-sm">
              {PROJET_ETAPES.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <RouteIcon className="mt-0.5 size-4 shrink-0 text-secondary" aria-hidden />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="cta" size="lg">
                <Link to="/contact">Parler de mon projet de formation</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/catalogue">Voir les formations</Link>
              </Button>
            </div>
          </div>

          <Card className="h-fit rounded-3xl border-border/70 shadow-soft">
            <CardContent className="p-6 sm:p-8">
              <MessagesSquare className="size-6 text-secondary" aria-hidden />
              <h3 className="mt-4 text-lg font-semibold">Un accompagnement très proactif</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Un interlocuteur unique vous suit du premier échange jusqu'à l'attestation :
                relances des financeurs, coordination avec le formateur, ajustement du planning si
                votre activité évolue, et point de suivi après la formation pour mesurer vos acquis.
              </p>
              <p className="mt-4 text-sm font-semibold">
                Réponse sous 48 h ouvrées · Sessions du lundi au samedi · Horaires aménageables
              </p>
            </CardContent>
          </Card>
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
                <Link to="/pole-formateur">Devenir partenaire porté</Link>
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
