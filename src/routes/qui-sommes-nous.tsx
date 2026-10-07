import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, GraduationCap, Lightbulb, Sparkles, Telescope, Users } from "lucide-react";

import peopleEquipe from "@/assets/people-equipe.jpg";
import { PageHero, PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const TITRE = "Qui sommes-nous — Skills4mation, organisme de formation";
const DESCRIPTION =
  "Skills4mation, organisme de formation aux métiers et compétences de demain : nos valeurs, notre pédagogie centrée sur l'apprenant et notre observatoire des métiers de demain.";
const URL = "https://skills4mation.com/qui-sommes-nous";

export const Route = createFileRoute("/qui-sommes-nous")({
  head: () => ({
    meta: [
      { title: TITRE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITRE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: TITRE,
          url: URL,
          about: { "@type": "EducationalOrganization", name: "Skills4mation", url: "https://skills4mation.com" },
        }),
      },
    ],
  }),
  component: QuiSommesNous,
});

const VALEURS = [
  {
    icon: Sparkles,
    titre: "Excellence et professionnalisme",
    texte:
      "Skills4mation s'engage à maintenir les normes les plus élevées dans tous ses services, en assurant un niveau de professionnalisme et de compétence exceptionnel.",
  },
  {
    icon: Compass,
    titre: "Autonomie et liberté",
    texte:
      "Nous sommes convaincus que l'apprentissage est plus efficace et significatif lorsqu'il est entrepris de manière volontaire, favorisant ainsi l'autonomie et la liberté dans l'ensemble de nos parcours.",
  },
  {
    icon: Lightbulb,
    titre: "Innovation et évolution",
    texte:
      "Skills4mation se veut à la pointe dans ses contenus de formation, mais également dans sa manière d'enseigner ces compétences.",
  },
  {
    icon: Telescope,
    titre: "Cohérence cognitive : façonner un avenir désirable",
    texte:
      "Skills4mation se concentre sur la création de parcours de formation et de développement de compétences en cohérence avec notre souhait d'un avenir désirable.",
  },
];

function QuiSommesNous() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Qui sommes-nous"
        title="Un organisme de formation tourné vers les métiers de demain"
        description="Skills4mation se consacre à l'enseignement et au développement des compétences professionnelles, à travers des formations innovantes et adaptées aux besoins actuels et futurs des professionnels qui veulent développer leur activité."
      />

      <section className="section-shell py-16">
        <div className="max-w-3xl">
          <p className="eyebrow">Nos valeurs</p>
          <h2 className="mt-3 text-3xl font-semibold">Une chaîne de valeurs au cœur de chaque parcours</h2>
          <p className="mt-4 text-muted-foreground">
            Nous sommes tous reliés par une chaîne de valeurs qui est au cœur de chaque parcours de
            formation que nous proposons.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALEURS.map((v) => (
            <Card key={v.titre} className="rounded-2xl border-border/70 shadow-soft">
              <CardContent className="p-6">
                <span className="inline-flex rounded-xl bg-accent p-3 text-accent-foreground">
                  <v.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{v.titre}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.texte}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8">
          <Button asChild variant="outline">
            <Link to="/code-deontologique">Lire notre code déontologique</Link>
          </Button>
        </div>
      </section>

      <section className="section-shell grid gap-10 pb-16 lg:grid-cols-2 lg:items-center">
        <img
          src={peopleEquipe}
          alt="L'équipe Skills4mation en séance de travail"
          loading="lazy"
          className="h-72 w-full rounded-3xl object-cover shadow-soft sm:h-96"
        />
        <div>
          <p className="eyebrow">Notre pédagogie</p>
          <h2 className="mt-3 text-3xl font-semibold">Centrée sur l'apprenant et son projet</h2>
          <p className="mt-4 text-muted-foreground">
            Notre méthodologie pédagogique est centrée sur l'apprenant et son projet professionnel.
            Nous adoptons une approche personnalisée, en ajustant nos formations aux besoins
            spécifiques de chaque participant. Nos formations sont interactives, engageantes et
            conçues pour maximiser l'apprentissage et l'application pratique des connaissances.
          </p>
          <p className="mt-4 text-muted-foreground">
            Dans un monde professionnel en perpétuelle mutation, Skills4mation se positionne comme
            un observatoire des métiers de demain : nous explorons les tendances émergentes et les
            compétences clés pour permettre à chacun de devenir l'architecte de son avenir
            professionnel.
          </p>
        </div>
      </section>

      <section className="section-shell grid gap-6 pb-20 md:grid-cols-2">
        <Card className="rounded-3xl border-border/70 shadow-soft">
          <CardContent className="p-8">
            <GraduationCap className="size-8 text-primary" />
            <h2 className="mt-4 text-2xl font-semibold">Pourquoi se former avec Skills4mation ?</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Vous bénéficiez d'une expérience d'apprentissage encadrée par des professionnels
              expérimentés. Nos formations vous apportent des compétences pratiques, adaptées à
              votre réalité professionnelle, et notre flexibilité garantit que chaque parcours
              répond à vos objectifs de carrière ou de développement de votre activité.
            </p>
            <Button asChild className="mt-6">
              <Link to="/formations">Voir notre catalogue de formations</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-border/70 shadow-soft">
          <CardContent className="p-8">
            <Users className="size-8 text-primary" />
            <h2 className="mt-4 text-2xl font-semibold">Pourquoi devenir formateur Skills4mation ?</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Rejoindre Skills4mation, c'est faire partie d'une équipe dynamique et innovante. Nous
              valorisons l'expertise de nos formateurs et offrons un environnement propice à
              l'échange de connaissances et à la croissance professionnelle, tout en vous libérant
              des contraintes administratives.
            </p>
            <Button asChild variant="cta" className="mt-6">
              <Link to="/pole-formateur">Rejoindre Skills4mation</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </PublicLayout>
  );
}
