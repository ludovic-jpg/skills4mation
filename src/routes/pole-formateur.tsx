import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Banknote, FolderCheck, HeartHandshake } from "lucide-react";

import { PageHero, PublicLayout } from "@/components/site/PublicLayout";
import formateurWebapp from "@/assets/formateur-webapp.jpg";
import formatriceTablette from "@/assets/formatrice-tablette.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/pole-formateur")({
  head: () => ({
    meta: [
      { title: "Pôle formateur — Rejoindre Skills4mation" },
      {
        name: "description",
        content:
          "Portage administratif et pédagogique pour formateurs indépendants : Qualiopi, conventions, financements professionnels. Candidatez au réseau Skills4mation.",
      },
      { property: "og:title", content: "Pôle formateur — Rejoindre Skills4mation" },
      {
        property: "og:description",
        content: "Devenez formateur partenaire : nous portons votre administratif Qualiopi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://skills4mation.com/pole-formateur" },
    ],
    links: [{ rel: "canonical", href: "https://skills4mation.com/pole-formateur" }],
  }),
  component: PoleFormateur,
});

const ATOUTS = [
  {
    icon: FolderCheck,
    titre: "Vos pièces Qualiopi générées",
    texte: "Convention, programme, émargement, évaluations : produits automatiquement.",
  },
  {
    icon: Banknote,
    titre: "Financements pris en charge",
    texte: "Montage OPCO, AIF, Transitions Pro et suivi des accords de financement.",
  },
  {
    icon: BadgeCheck,
    titre: "Crédibilité immédiate",
    texte: "Vous intervenez sous une certification Qualiopi reconnue.",
  },
  {
    icon: HeartHandshake,
    titre: "Développement commercial",
    texte: "Demandes de budget étudiées par notre équipe pour vos prospects.",
  },
];

function PoleFormateur() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Pôle formateur"
        title="Formez. Nous portons le reste."
        description="Skills4mation assure le portage administratif et pédagogique de votre activité de formation : conformité Qualiopi, contractualisation, financement, archivage."
      />

      <section className="section-shell py-14">
        <img
          src={formateurWebapp}
          alt="Formateur indépendant souriant préparant ses dossiers sur le portail Skills4mation"
          width={1600}
          height={1104}
          loading="lazy"
          className="mb-10 h-64 w-full rounded-3xl object-cover shadow-soft sm:h-80"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ATOUTS.map((item) => (
            <Card key={item.titre} className="rounded-2xl border-border/70 shadow-soft">
              <CardContent className="p-6">
                <span className="inline-flex rounded-xl bg-accent p-3 text-accent-foreground">
                  <item.icon className="size-5" />
                </span>
                <h2 className="mt-4 text-base font-semibold">{item.titre}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{item.texte}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="candidature" className="section-shell pb-20 scroll-mt-24">
        <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-elevated">
          <div className="grid lg:grid-cols-[1.05fr_1fr]">
            <div className="relative z-10 flex flex-col justify-center gap-6 p-8 sm:p-10 lg:p-14">
              <h2 className="text-3xl leading-tight font-semibold text-primary-foreground sm:text-4xl">
                Rejoindre le réseau en quelques minutes
              </h2>
              <p className="max-w-lg text-base text-primary-foreground/85">
                Huit questions courtes, vos trois pièces, et votre accès à l'espace formateur est
                créé dans la foulée. Notre équipe pédagogique étudie ensuite votre profil sous 48 h
                ouvrées.
              </p>
              <ol className="grid gap-3 text-sm sm:grid-cols-2">
                {[
                  "Vous présentez votre expertise",
                  "Vous déposez CV, parcours et déroulé",
                  "Vous créez votre accès",
                  "Nous validons et vous formez",
                ].map((etape, i) => (
                  <li key={etape} className="flex items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-cta text-xs font-semibold text-cta-foreground">
                      {i + 1}
                    </span>
                    {etape}
                  </li>
                ))}
              </ol>
              <div className="flex flex-wrap items-center gap-4">
                <Button asChild variant="cta" size="lg" className="h-12 px-7 text-base">
                  <Link to="/candidature">
                    Commencer ma candidature <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
                <Link
                  to="/auth"
                  className="text-sm text-primary-foreground/80 underline-offset-4 hover:text-primary-foreground hover:underline"
                >
                  Déjà inscrit&nbsp;? Se connecter
                </Link>
              </div>
            </div>
            <img
              src={formatriceTablette}
              alt="Formatrice indépendante souriante, membre du réseau Skills4mation"
              width={1408}
              height={1008}
              loading="lazy"
              className="h-64 w-full object-cover sm:h-80 lg:h-full"
            />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
