import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app/AppShell";
import { FORMATEUR_NAV } from "@/components/app/nav";
import { OutilBuilder } from "@/components/outils/OutilBuilder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app/espace/outils")({
  component: OutilsPage,
  head: () => ({
    meta: [
      { title: "Mes outils pédagogiques — Espace formateur Skills4mation" },
      {
        name: "description",
        content:
          "Générez et retrouvez vos tests de positionnement et évaluations des acquis alignés sur vos parcours de formation.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Mes outils pédagogiques — Skills4mation" },
      {
        property: "og:description",
        content: "Tests de positionnement et évaluations des acquis de vos parcours de formation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function OutilsPage() {
  return (
    <AppShell
      items={FORMATEUR_NAV}
      title="Mes outils pédagogiques"
      subtitle="Tests de positionnement et évaluations des acquis"
    >
      <Tabs defaultValue="positionnement">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="positionnement">Test de positionnement</TabsTrigger>
          <TabsTrigger value="acquis">Évaluation des acquis</TabsTrigger>
        </TabsList>

        <TabsContent value="positionnement" className="mt-6">
          <OutilBuilder
            table="outils_positionnement"
            type="positionnement"
            titreDefaut="Test de positionnement"
            aide="L'IA propose des questions (QCM ou ouvertes) alignées sur les modules et objectifs du parcours choisi. Vous restez libre de tout modifier avant d'enregistrer."
          />
        </TabsContent>
        <TabsContent value="acquis" className="mt-6">
          <OutilBuilder
            table="outils_evaluation_acquis"
            type="acquis"
            titreDefaut="Évaluation des acquis"
            aide="Les acquis évalués reprennent les objectifs du parcours et, si vous en associez un, ceux déjà couverts par votre test de positionnement."
          />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
