import { createFileRoute } from "@tanstack/react-router";
import { Compass, FolderCheck, GraduationCap, Wallet } from "lucide-react";

import apprenantsDuo from "@/assets/apprenants-duo.jpg";
import entreeApprenant from "@/assets/entree-apprenant.jpg";
import { PageHero, PublicLayout } from "@/components/site/PublicLayout";
import { DiagnosticExpress } from "@/components/site/DiagnosticExpress";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/evaluer-droit-formation")({
  head: () => ({
    meta: [
      { title: "Évaluer mes droits formation — Skills4mation" },
      {
        name: "description",
        content:
          "Évaluez vos droits à la formation avec SKILLS4MATION : accompagnement personnalisé, accès simplifié aux financements (OPCO, Transitions Pro, AIF), catalogue de formations éligibles et gestion administrative optimisée.",
      },
      { property: "og:title", content: "Évaluer mes droits formation — Skills4mation" },
      {
        property: "og:description",
        content:
          "Votre parcours, nos solutions : nos experts analysent vos droits et vous guident vers les meilleures opportunités de formation prises en charge.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:url",
        content: "https://skills4mation.com/evaluer-droit-formation",
      },
    ],
    links: [
      { rel: "canonical", href: "https://skills4mation.com/evaluer-droit-formation" },
    ],
  }),
  component: EvaluerDroitFormation,
});

const ATOUTS = [
  {
    icon: Compass,
    titre: "Un accompagnement personnalisé",
    texte:
      "Nos experts analysent vos droits et vous guident vers les meilleures opportunités de formation prises en charge.",
  },
  {
    icon: Wallet,
    titre: "Un accès simplifié aux financements",
    texte:
      "OPCO, Transitions Pro, fonds d'assurance formation, aides régionales : nous vous aidons à trouver les solutions adaptées à votre situation.",
  },
  {
    icon: GraduationCap,
    titre: "Un catalogue de formations éligibles",
    texte:
      "Développez vos compétences avec des formations reconnues et adaptées à votre projet professionnel.",
  },
  {
    icon: FolderCheck,
    titre: "Une gestion administrative optimisée",
    texte:
      "Nous nous occupons des démarches pour vous permettre de vous concentrer sur votre montée en compétences.",
  },
];

const ETAPES = [
  "Vous complétez le formulaire d'évaluation de vos droits en moins de 3 minutes.",
  "Un expert Skills4mation analyse votre situation et vos dispositifs mobilisables.",
  "Nous vous proposons un parcours et un plan de financement chiffré.",
  "Nous montons le dossier administratif et vous suivons jusqu'à la fin de la formation.",
];

function EvaluerDroitFormation() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Apprenants"
        title="Évaluer mes droits formation — votre parcours, nos solutions !"
        description="Chez SKILLS4MATION, nous mettons un point d'honneur à défendre vos intérêts et à vous accompagner dans l'accès aux formations financées. Vous disposez de droits à la formation, encore faut-il savoir comment les mobiliser !"
      />

      <section className="section-shell grid items-center gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Pourquoi évaluer vos droits avec SKILLS4MATION ?
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {ATOUTS.map((atout) => (
              <Card key={atout.titre} className="rounded-2xl border-border/70 shadow-soft">
                <CardContent className="p-6">
                  <span className="inline-flex rounded-xl bg-accent p-3 text-accent-foreground">
                    <atout.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{atout.titre}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {atout.texte}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <img
          src={entreeApprenant}
          alt="Apprenante souriante échangeant avec un conseiller Skills4mation sur ses droits à la formation"
          loading="lazy"
          className="h-full w-full rounded-3xl object-cover shadow-soft"
        />
      </section>

      <section className="bg-muted/50 py-14">
        <div className="section-shell grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <img
            src={apprenantsDuo}
            alt="Deux apprenants travaillant ensemble sur leur projet de formation"
            loading="lazy"
            className="h-full w-full rounded-3xl object-cover shadow-soft"
          />
          <div>
            <p className="eyebrow text-secondary">Comment ça marche ?</p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
              Quatre étapes, zéro paperasse pour vous
            </h2>
            <ol className="mt-8 space-y-4">
              {ETAPES.map((etape, index) => (
                <li key={etape} className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <p className="pt-1.5 text-sm leading-relaxed text-muted-foreground">{etape}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="formulaire" className="section-shell scroll-mt-24 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="eyebrow text-secondary">Diagnostic Express</p>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
            Demander l'évaluation de mes droits
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Obtenez une estimation immédiate, puis complétez votre demande pour qu'un conseiller
            affine votre plan de financement. Réponse sous 48 heures ouvrées.
          </p>
          <div className="mt-8">
            <DiagnosticExpress variant="full" />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
