import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Compass,
  FileCheck2,
  GraduationCap,
  LineChart,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import heroImage from "@/assets/hero-formation.jpg";
import { QualiopiBadge } from "@/components/Brand";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Skills4mation — L'ingénierie des compétences en mouvement" },
      {
        name: "description",
        content:
          "Organisme certifié Qualiopi : portage administratif et pédagogique des formateurs indépendants, formations sur mesure et mesure d'impact.",
      },
      {
        property: "og:title",
        content: "Skills4mation — L'ingénierie des compétences en mouvement",
      },
      {
        property: "og:description",
        content:
          "Portage Qualiopi, ingénierie pédagogique et parcours personnalisés pour les entreprises et les formateurs indépendants.",
      },
    ],
  }),
  component: Accueil,
});

const AVANTAGES = [
  {
    icon: ShieldCheck,
    titre: "Portage Qualiopi complet",
    texte: "Vos conventions, programmes et pièces Qualiopi générés et conservés sans effort.",
  },
  {
    icon: Users,
    titre: "Réseau d'experts métier",
    texte: "Des formateurs indépendants sélectionnés pour leur expertise terrain.",
  },
  {
    icon: Sparkles,
    titre: "Parcours personnalisés",
    texte: "Chaque dispositif est conçu à partir de vos enjeux réels de compétences.",
  },
  {
    icon: FileCheck2,
    titre: "Administratif délégué",
    texte: "Financements, OPCO, CPF : nous portons la charge, vous formez.",
  },
];

const SERVICES = [
  {
    icon: Compass,
    titre: "Diagnostic",
    texte: "Analyse des besoins, cartographie des compétences et cadrage des priorités.",
  },
  {
    icon: GraduationCap,
    titre: "Ingénierie pédagogique",
    texte: "Conception de parcours modulaires, supports et évaluations alignés Qualiopi.",
  },
  {
    icon: Rocket,
    titre: "Déploiement",
    texte: "Animation présentiel ou distanciel, logistique et suivi administratif complet.",
  },
  {
    icon: LineChart,
    titre: "Mesure d'impact",
    texte: "Indicateurs de satisfaction, montée en compétences et transfert en poste.",
  },
];

function Accueil() {
  return (
    <PublicLayout>
      <section className="bg-gradient-hero text-primary-foreground">
        <div className="section-shell grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="eyebrow text-cta">Organisme de formation certifié Qualiopi</p>
            <h1 className="mt-4 text-4xl font-semibold text-primary-foreground sm:text-5xl lg:text-6xl">
              L'ingénierie des compétences en mouvement
            </h1>
            <p className="mt-5 max-w-xl text-lg text-primary-foreground/85">
              Skills4mation conçoit des parcours de formation sur mesure et porte l'intégralité du
              cadre administratif et pédagogique des formateurs indépendants.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="cta" size="lg">
                <Link to="/pole-formateur">Devenir formateur</Link>
              </Button>
              <Button asChild variant="onDark" size="lg">
                <Link to="/contact">Nous contacter</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-4 text-sm text-primary-foreground/75">
              <span className="rounded-full border border-primary-foreground/25 px-3 py-1">
                Qualiopi
              </span>
              <span className="rounded-full border border-primary-foreground/25 px-3 py-1">
                Éligible CPF
              </span>
              <span className="rounded-full border border-primary-foreground/25 px-3 py-1">
                Charte déontologique
              </span>
            </div>
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
        <p className="eyebrow">Avantages clés</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">
          Un cadre solide pour former en toute sérénité
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {AVANTAGES.map((item) => (
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

      <section className="bg-muted/60 py-16 lg:py-20">
        <div className="section-shell">
          <p className="eyebrow">Nos services</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">
            De l'analyse du besoin à la mesure d'impact
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {SERVICES.map((item, index) => (
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
        </div>
      </section>

      <section className="section-shell py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Certifications & engagements</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              La qualité, une exigence vérifiable
            </h2>
            <p className="mt-4 text-muted-foreground">
              Skills4mation est certifié Qualiopi pour ses actions de formation. Nos parcours sont
              mobilisables via le CPF et nos formateurs adhèrent à une charte déontologique
              exigeante : transparence, confidentialité, amélioration continue.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <QualiopiBadge />
              <div className="inline-flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-soft">
                <FileCheck2 className="size-6 text-cta" />
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-primary">Charte déontologique</p>
                  <p className="text-[11px] text-muted-foreground">Signée par chaque formateur</p>
                </div>
              </div>
            </div>
          </div>

          <Card className="rounded-3xl border-none bg-gradient-hero text-primary-foreground shadow-elevated">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold text-primary-foreground">
                Vous êtes formateur indépendant ?
              </h3>
              <p className="mt-3 text-primary-foreground/85">
                Rejoignez le réseau Skills4mation : nous portons votre administratif, vos pièces
                Qualiopi et vos financements. Vous gardez la main sur la pédagogie.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild variant="cta" size="lg">
                  <Link to="/pole-formateur">Je m'inscris</Link>
                </Button>
                <Button asChild variant="onDark" size="lg">
                  <Link to="/catalogue">Voir le catalogue</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}
