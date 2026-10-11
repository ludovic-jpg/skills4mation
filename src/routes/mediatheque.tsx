import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, PlayCircle } from "lucide-react";

import { PageHero, PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const TITRE = "Médiathèque — Skills4mation en vidéo";
const DESCRIPTION =
  "Découvrez le portage Qualiopi Skills4mation en vidéo : candidature, premiers pas dans l'espace formateur, montage d'un dossier de financement et communication avec vos apprenants.";
const URL = "https://skills4mation.com/mediatheque";

type Video = {
  slug: string;
  titre: string;
  description: string;
  duree: string;
  dureeIso: string;
  tag: string;
};

const VIDEOS: Video[] = [
  {
    slug: "01-decouvrir-skills4mation",
    titre: "Découvrez Skills4mation",
    description:
      "Le portage Qualiopi en une minute : vous concevez et animez, nous portons la conformité, les financements et l'administratif. 25 % de commission, plateforme gratuite.",
    duree: "45 s",
    dureeIso: "PT45S",
    tag: "Vue d'ensemble",
  },
  {
    slug: "02-candidater",
    titre: "Comment candidater",
    description:
      "De votre candidature en ligne à l'activation de votre espace formateur : 4 étapes, un échange humain avec l'équipe pédagogique, zéro paperasse.",
    duree: "38 s",
    dureeIso: "PT38S",
    tag: "Candidature",
  },
  {
    slug: "03-onboarding",
    titre: "Vos premiers pas",
    description:
      "Le parcours de portage guidé jalon par jalon : profil et pièces, création de vos formations, premier dossier — votre espace vous accompagne à chaque étape.",
    duree: "47 s",
    dureeIso: "PT47S",
    tag: "Onboarding",
  },
  {
    slug: "04-financement",
    titre: "Monter un dossier de financement",
    description:
      "Numéro ADF attribué dès la création, prix calculé automatiquement, validation par l'équipe, pipeline suivi de bout en bout — et paiement sous 8 jours ouvrés.",
    duree: "55 s",
    dureeIso: "PT55S",
    tag: "Financement",
  },
  {
    slug: "05-communication",
    titre: "Communiquer avec l'apprenant",
    description:
      "Recueil des besoins, test de positionnement, envoi groupé de la demande de financement, émargement signé en ligne : chaque pièce est archivée, prête pour l'audit Qualiopi.",
    duree: "48 s",
    dureeIso: "PT48S",
    tag: "Traçabilité",
  },
];

export const Route = createFileRoute("/mediatheque")({
  head: () => ({
    meta: [
      { title: TITRE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITRE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { property: "og:image", content: `${URL.replace("/mediatheque", "")}/videos/01-decouvrir-skills4mation.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: TITRE,
          url: URL,
          itemListElement: VIDEOS.map((v, i) => ({
            "@type": "VideoObject",
            position: i + 1,
            name: v.titre,
            description: v.description,
            duration: v.dureeIso,
            inLanguage: "fr-FR",
            thumbnailUrl: `https://skills4mation.com/videos/${v.slug}.jpg`,
            contentUrl: `https://skills4mation.com/videos/${v.slug}.mp4`,
            uploadDate: "2026-10-11",
            publisher: { "@type": "Organization", name: "Skills4mation", url: "https://skills4mation.com" },
          })),
        }),
      },
    ],
  }),
  component: Mediatheque,
});

function Mediatheque() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Médiathèque"
        title="Skills4mation en vidéo"
        description="Cinq films courts pour comprendre le portage Qualiopi côté formateur : candidater, prendre en main votre espace, monter un dossier de financement et communiquer avec vos apprenants."
      />

      <section className="section-shell py-16">
        <div className="grid gap-8 md:grid-cols-2">
          {VIDEOS.map((v, i) => (
            <Card
              key={v.slug}
              className={`overflow-hidden rounded-3xl border-border/70 shadow-soft ${i === 0 ? "md:col-span-2" : ""}`}
            >
              <video
                controls
                preload="metadata"
                playsInline
                poster={`/videos/${v.slug}.jpg`}
                className="aspect-video w-full bg-foreground/90 object-cover"
              >
                <source src={`/videos/${v.slug}.mp4`} type="video/mp4" />
                Votre navigateur ne prend pas en charge la lecture vidéo.
              </video>
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                    <PlayCircle className="size-3.5" />
                    {v.tag}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Clock className="size-3.5" />
                    {v.duree}
                  </span>
                </div>
                <h2 className="mt-3 text-xl font-semibold">{v.titre}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{v.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-primary px-8 py-10 text-primary-foreground sm:px-12">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-semibold">Prêt à former sans les contraintes ?</h2>
              <p className="mt-2 text-sm text-primary-foreground/80">
                Déposez votre candidature en quelques minutes : votre espace formateur est activé dès validation.
              </p>
            </div>
            <Button asChild variant="cta" size="lg">
              <Link to="/candidature">
                Rejoindre Skills4mation
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
