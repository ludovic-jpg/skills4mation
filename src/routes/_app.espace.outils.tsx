import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { FORMATEUR_NAV } from "@/components/app/nav";
import { GenerateurPowerPoint } from "@/components/outils/GenerateurPowerPoint";
import { OutilBuilder } from "@/components/outils/OutilBuilder";
import { OutilsAccueil } from "@/components/outils/OutilsAccueil";
import { OUTILS_IDS, outilParId, type OutilId } from "@/components/outils/outils-menu";
import { SupportsCoursPanel } from "@/components/outils/SupportsCoursPanel";

type RechercheOutils = { outil?: OutilId };

export const Route = createFileRoute("/_app/espace/outils")({
  // L'outil ouvert est dans l'URL (?outil=…) : lien partageable, bouton « Précédent » du navigateur.
  validateSearch: (search: Record<string, unknown>): RechercheOutils => {
    const outil = search["outil"];
    return typeof outil === "string" && (OUTILS_IDS as readonly string[]).includes(outil)
      ? { outil: outil as OutilId }
      : {};
  },
  component: OutilsPage,
  head: () => ({
    meta: [
      { title: "Mes outils pédagogiques — Espace formateur Skills4mation" },
      {
        name: "description",
        content:
          "Générez vos tests de positionnement, évaluations des acquis et supports PowerPoint alignés sur vos formations.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Mes outils pédagogiques — Skills4mation" },
      {
        property: "og:description",
        content:
          "Tests de positionnement, évaluations des acquis et supports de cours de vos formations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function OutilsPage() {
  const { outil } = Route.useSearch();
  const definition = outilParId(outil);

  return (
    <AppShell
      items={FORMATEUR_NAV}
      title="Mes outils pédagogiques"
      subtitle="Tests de positionnement, évaluations des acquis et supports de cours"
    >
      {!definition ? (
        <OutilsAccueil />
      ) : (
        <div className="grid gap-6">
          <nav aria-label="Fil d'Ariane">
            <Link
              to="/espace/outils"
              search={{}}
              className="inline-flex items-center gap-1.5 rounded-full px-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Retour aux outils
            </Link>
          </nav>
          <header className="flex items-center gap-4">
            <span
              aria-hidden
              className={`flex size-12 shrink-0 items-center justify-center rounded-full ${definition.pastille}`}
            >
              <definition.Icone className="size-6" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {definition.moment}
              </p>
              <h2 className="text-xl font-semibold leading-tight">{definition.titre}</h2>
            </div>
          </header>

          {definition.id === "positionnement" ? (
            <OutilBuilder
              key="positionnement"
              table="outils_positionnement"
              type="positionnement"
              titreDefaut="Test de positionnement"
              aide="L'IA propose des questions (QCM et questions ouvertes) alignées sur les objectifs et les modules de la formation choisie. Vous restez libre de tout modifier avant d'enregistrer."
            />
          ) : null}
          {definition.id === "acquis" ? (
            <OutilBuilder
              key="acquis"
              table="outils_evaluation_acquis"
              type="acquis"
              titreDefaut="Évaluation des acquis"
              aide="Les questions évaluent chaque objectif de la formation et, si vous associez un test de positionnement, reprennent les objectifs qu'il couvre pour comparer avant et après."
            />
          ) : null}
          {definition.id === "supports" ? (
            <div className="grid gap-6">
              <GenerateurPowerPoint />
              <SupportsCoursPanel />
            </div>
          ) : null}
        </div>
      )}
    </AppShell>
  );
}
