import { createFileRoute, Link } from "@tanstack/react-router";
import { Info } from "lucide-react";

import { PageHero, PublicLayout } from "@/components/site/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
  INDICATEURS,
  INDICATEURS_EN_CONSTITUTION,
  INDICATEURS_MAJ,
  PERIODE,
} from "@/data/indicateurs";

const PAGE_PATH = "/nos-resultats";
const PAGE_URL = `https://skills4mation.com${PAGE_PATH}`;

export const Route = createFileRoute("/nos-resultats")({
  head: () => ({
    meta: [
      { title: "Nos résultats et leur méthode de calcul | Skills4mation" },
      {
        name: "description",
        content:
          "Indicateurs de résultats du groupe Formatrix (Back to Business), dont Skills4mation est un nom commercial : satisfaction en fin de formation et taux de réponse, avec période, effectif et méthode de calcul.",
      },
      { property: "og:title", content: "Nos résultats | Skills4mation" },
      {
        property: "og:description",
        content: "Indicateurs de résultats publiés avec leur méthode de calcul.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: PAGE_URL },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Accueil",
              item: "https://skills4mation.com/",
            },
            { "@type": "ListItem", position: 2, name: "Nos résultats", item: PAGE_URL },
          ],
        }),
      },
    ],
  }),
  component: NosResultatsPage,
});

function NosResultatsPage() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Transparence"
        title="Nos résultats"
        description={`Chaque indicateur est calculé à partir des dossiers de formation clos du ${PERIODE.debut} au ${PERIODE.fin} (${PERIODE.libelle} ; dernier dossier clos le ${PERIODE.dernierDossierClos}). Nous publions la formule, le nombre de réponses et la date de mise à jour, pour que chacun puisse vérifier le chiffre.`}
      />

      <section className="section-shell max-w-5xl py-14">
        <Card className="rounded-2xl border-primary/30 bg-primary/5 shadow-soft">
          <CardContent className="flex gap-4 p-6">
            <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <p className="text-sm leading-relaxed text-foreground">
              <strong>Skills4mation fait partie du groupe Formatrix.</strong> Les indicateurs
              ci-dessous sont ceux de l'organisme de formation Back to Business – Formatrix, sur son
              activité de formation.
            </p>
          </CardContent>
        </Card>

        <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Mis à jour le {INDICATEURS_MAJ}
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {INDICATEURS.map((ind) => (
            <article
              key={ind.id}
              id={ind.id}
              className="scroll-mt-24 rounded-2xl border border-border/70 bg-card p-6 shadow-soft"
            >
              <p className="font-display text-4xl font-semibold text-primary">{ind.valeur}</p>
              <h2 className="mt-2 text-base font-semibold text-foreground">{ind.libelle}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">Méthode : </span>
                {ind.methode}
              </p>
            </article>
          ))}
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Règles de calcul</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>
              Source : grilles d'évaluation remplies par les stagiaires en fin de formation,
              archivées dans chaque dossier de formation.
            </li>
            <li>
              L'unité de compte est le dossier de formation ; un dossier peut concerner plusieurs
              stagiaires d'une même entreprise.
            </li>
            <li>
              Les valeurs sont recalculées à chaque mise à jour à partir des dossiers, sur la
              période glissante indiquée.
            </li>
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Indicateurs en cours de constitution</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Ces indicateurs ne sont pas encore publiés, car la donnée n'est pas collectée de façon
            assez fiable pour être vérifiable.
          </p>
          <ul className="mt-5 grid gap-4">
            {INDICATEURS_EN_CONSTITUTION.map((i) => (
              <li key={i.libelle} className="rounded-2xl bg-muted/50 p-5">
                <p className="text-sm font-semibold text-foreground">{i.libelle}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{i.raison}</p>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-14 text-sm text-muted-foreground">
          Une remarque sur une formation ?{" "}
          <Link to="/reclamations" className="font-medium text-primary underline">
            Signalez une réclamation ou une suggestion
          </Link>
          .
        </p>
      </section>
    </PublicLayout>
  );
}
