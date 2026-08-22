import { createFileRoute } from "@tanstack/react-router";

import { PageHero, PublicLayout } from "@/components/site/PublicLayout";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions légales — Skills4mation" },
      {
        name: "description",
        content:
          "Mentions légales de Skills4mation : éditeur du site, hébergement, propriété intellectuelle et certification Qualiopi.",
      },
      { property: "og:title", content: "Mentions légales — Skills4mation" },
      { property: "og:description", content: "Informations légales du site Skills4mation." },
    ],
  }),
  component: MentionsLegales,
});

function MentionsLegales() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Informations légales"
        title="Mentions légales"
        description="Informations relatives à l'éditeur du site, à son hébergement et aux droits applicables."
      />
      <section className="section-shell max-w-3xl space-y-8 py-14 text-sm text-muted-foreground">
        <Bloc titre="Éditeur du site">
          Skills4mation — organisme de formation professionnelle certifié Qualiopi. Contact :
          contact@skills4mation.fr.
        </Bloc>
        <Bloc titre="Hébergement">
          Le site est hébergé sur une infrastructure cloud européenne. Les données applicatives sont
          stockées dans l'Union européenne.
        </Bloc>
        <Bloc titre="Propriété intellectuelle">
          L'ensemble des contenus (textes, supports pédagogiques, identité visuelle) est protégé.
          Toute reproduction sans autorisation écrite est interdite.
        </Bloc>
        <Bloc titre="Certification Qualiopi">
          La certification Qualiopi a été délivrée au titre de la catégorie « actions de formation ».
        </Bloc>
      </section>
    </PublicLayout>
  );
}

function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">{titre}</h2>
      <p className="mt-2 leading-relaxed">{children}</p>
    </div>
  );
}
