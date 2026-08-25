import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CalendarHeart,
  GraduationCap,
  MessagesSquare,
  Network,
  Route as RouteIcon,
  ShieldCheck,
  Sparkles,
  Target,
  UserSearch,
  Wallet,
} from "lucide-react";

import entreeApprenant from "@/assets/entree-apprenant.jpg";
import entreeFormateur from "@/assets/entree-formateur.jpg";
import homeHero from "@/assets/home-hero.jpg";
import { QualiopiBadge } from "@/components/Brand";
import { EvaluationBudget } from "@/components/site/EvaluationBudget";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const TITRE = "Skills4mation | Se former ou former sous certification Qualiopi";
const DESCRIPTION =
  "Apprenants : trouvez la formation et le formateur qui correspondent à votre projet. Formateurs : formez sous notre certification Qualiopi avec conventions en 48h.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITRE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITRE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Accueil,
});

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

const REPERES = [
  {
    icon: ShieldCheck,
    titre: "Organisme certifié Qualiopi",
    texte: "Process audités, suivi qualité continu, documents conformes.",
  },
  {
    icon: Network,
    titre: "Réseau d'experts métier",
    texte: "Des formateurs choisis pour leur pratique réelle du terrain.",
  },
  {
    icon: Wallet,
    titre: "Financements professionnels",
    texte: "OPCO, plan de développement des compétences, AIF, Transitions Pro, FAF.",
  },
  {
    icon: Sparkles,
    titre: "Sur mesure par défaut",
    texte: "Présentiel, distanciel ou mixte, en individuel comme en collectif.",
  },
];

function Accueil() {
  return (
    <PublicLayout>
      <section className="bg-gradient-hero text-primary-foreground">
        <div className="section-shell grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="eyebrow text-cta">Formation professionnelle · Certifié Qualiopi</p>
            <h1 className="mt-4 text-4xl font-semibold text-primary-foreground sm:text-5xl lg:text-6xl">
              Deux façons d'entrer dans l'univers Skills4mation
            </h1>
            <p className="mt-5 max-w-xl text-lg text-primary-foreground/85">
              Vous voulez vous former auprès du formateur de votre choix, ou vous voulez former sous
              une certification Qualiopi sans créer votre organisme ? Choisissez votre entrée : nous
              construisons le reste avec vous.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="cta" size="lg">
                <Link to="/catalogue">Je veux me former</Link>
              </Button>
              <Button asChild variant="onDark" size="lg">
                <Link to="/portage-qualiopi">Je suis formateur</Link>
              </Button>
            </div>
            <div className="mt-9">
              <QualiopiBadge />
            </div>
          </div>

          <img
            src={homeHero}
            alt="Groupe de professionnels en atelier de formation animé par une formatrice"
            width={1600}
            height={1008}
            className="rounded-3xl object-cover shadow-elevated"
          />
        </div>
      </section>

      <section id="entrees" className="section-shell scroll-mt-24 py-16 lg:py-20">
        <p className="eyebrow">Par où commencer ?</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">
          Choisissez votre entrée : apprenant ou formateur
        </h2>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card className="group overflow-hidden rounded-3xl border-border/70 p-0 shadow-soft">
            <img
              src={entreeApprenant}
              alt="Apprenante suivant une formation professionnelle sur son ordinateur"
              width={1200}
              height={912}
              loading="lazy"
              className="h-56 w-full object-cover sm:h-64"
            />
            <CardContent className="flex flex-col p-6 sm:p-8">
              <span className="inline-flex w-fit rounded-xl bg-accent p-3 text-accent-foreground">
                <GraduationCap className="size-5" />
              </span>
              <h3 className="mt-4 text-2xl font-semibold">Je suis apprenant</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Explorez le catalogue de formations professionnelles — bien-être, bureautique &amp;
                digital, business, management, langues, sécurité — et formez-vous auprès du
                formateur qui correspond à votre projet et à vos disponibilités.
              </p>
              <div className="mt-7">
                <Button asChild variant="cta" size="lg">
                  <Link to="/catalogue">
                    Découvrir le catalogue <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="group overflow-hidden rounded-3xl border-border/70 p-0 shadow-soft">
            <img
              src={entreeFormateur}
              alt="Formatrice indépendante animant une session en entreprise"
              width={1200}
              height={912}
              loading="lazy"
              className="h-56 w-full object-cover sm:h-64"
            />
            <CardContent className="flex flex-col p-6 sm:p-8">
              <span className="inline-flex w-fit rounded-xl bg-accent p-3 text-accent-foreground">
                <ShieldCheck className="size-5" />
              </span>
              <h3 className="mt-4 text-2xl font-semibold">Je suis formateur</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Formez sous notre certification Qualiopi : conventions et documents en 48h, accès
                aux financements professionnels, autonomie pédagogique totale. 99 € HT/an + 20 % de
                commission.
              </p>
              <div className="mt-7">
                <Button asChild variant="teal" size="lg">
                  <Link to="/portage-qualiopi">
                    Espace formateur — portage Qualiopi <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="apprenants" className="scroll-mt-24 bg-muted/60 py-16 lg:py-20">
        <div className="section-shell">
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
                  <span className="inline-flex rounded-xl bg-card p-3 text-secondary">
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
                  Des dizaines de formations professionnelles, disponibles en présentiel, à distance
                  ou en format mixte, adaptables en individuel comme en collectif.
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
        </div>
      </section>

      <section id="projet" className="section-shell scroll-mt-24 py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
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

      <section className="bg-muted/60 py-16 lg:py-20">
        <div className="section-shell">
          <p className="eyebrow">Nos repères</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">
            Un cadre solide, pour les apprenants comme pour les formateurs
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {REPERES.map((item) => (
              <Card key={item.titre} className="rounded-2xl border-border/70 shadow-soft">
                <CardContent className="p-6">
                  <span className="inline-flex rounded-xl bg-card p-3 text-secondary">
                    <item.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{item.titre}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.texte}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-16 lg:py-20">
        <Card className="overflow-hidden rounded-3xl border-none bg-gradient-hero text-primary-foreground shadow-elevated">
          <div className="grid items-center gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <CardContent className="p-8 sm:p-12">
              <h2 className="max-w-2xl text-3xl font-semibold text-primary-foreground sm:text-4xl">
                Prêt à avancer ? Choisissez votre porte d'entrée.
              </h2>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="cta" size="lg">
                  <Link to="/catalogue">Voir les formations</Link>
                </Button>
                <Button asChild variant="onDark" size="lg">
                  <Link to="/portage-qualiopi">Découvrir le portage Qualiopi</Link>
                </Button>
              </div>
              <p className="mt-4 text-sm text-primary-foreground/75">
                Une question ? Écrivez-nous, nous répondons sous 48 h ouvrées.
              </p>
            </CardContent>
            <img
              src={peopleEquipe}
              alt="Apprenants et formateurs souriants travaillant ensemble autour d'un ordinateur portable"
              width={1600}
              height={1008}
              loading="lazy"
              className="h-64 w-full object-cover lg:h-full"
            />
          </div>
        </Card>
      </section>

    </PublicLayout>
  );
}
