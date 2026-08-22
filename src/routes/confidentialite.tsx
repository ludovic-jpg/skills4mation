import { createFileRoute } from "@tanstack/react-router";

import { PageHero, PublicLayout } from "@/components/site/PublicLayout";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — Skills4mation" },
      {
        name: "description",
        content:
          "Comment Skills4mation collecte, utilise et protège les données personnelles des formateurs, stagiaires et entreprises clientes.",
      },
      { property: "og:title", content: "Politique de confidentialité — Skills4mation" },
      { property: "og:description", content: "Traitement et protection de vos données." },
    ],
  }),
  component: Confidentialite,
});

function Confidentialite() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="RGPD"
        title="Politique de confidentialité"
        description="Nous traitons uniquement les données nécessaires à la gestion des candidatures, des dossiers de formation et des obligations Qualiopi."
      />
      <section className="section-shell max-w-3xl space-y-8 py-14 text-sm text-muted-foreground">
        <Bloc titre="Données collectées">
          Identité et coordonnées des formateurs, informations professionnelles (SIRET), données de
          dossiers de formation et pièces justificatives déposées.
        </Bloc>
        <Bloc titre="Finalités">
          Étude des candidatures, production des documents Qualiopi, montage des financements et
          archivage légal des actions de formation.
        </Bloc>
        <Bloc titre="Durée de conservation">
          Les dossiers de formation et pièces associées sont conservés pendant la durée requise par
          les obligations légales et Qualiopi.
        </Bloc>
        <Bloc titre="Vos droits">
          Vous disposez d'un droit d'accès, de rectification, d'effacement et d'opposition. Écrivez à
          contact@skills4mation.fr pour exercer ces droits.
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
