import { createFileRoute, Link } from "@tanstack/react-router";

import { PublicLayout, PageHero } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { categoryLabel } from "@/data/catalogue";
import { supabase } from "@/integrations/supabase/client";
import { dureeLabel, tarifLabel, visuelUrl, type FormationCatalogue } from "@/lib/formations";

const BASE = "https://train-grow-connect.lovable.app";
const DESC =
  "Les formations proposées par les formateurs indépendants du réseau Skills4mation : tarifs, programme et inscription directe auprès du formateur de votre choix.";

export const Route = createFileRoute("/formations/")({
  loader: async () => {
    const { data } = await supabase
      .from("formations_catalogue")
      .select(
        "id, slug, titre, categorie, intro, duree_heures, duree_jours, tarif_ht, tarif_unite, visuel_url, photo_formateur_url, formateur_nom",
      )
      .eq("publiee", true)
      .order("created_at", { ascending: false });
    return { formations: (data ?? []) as Partial<FormationCatalogue>[] };
  },
  head: () => ({
    meta: [
      { title: "Formations des formateurs du réseau — Skills4mation" },
      { name: "description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Formations des formateurs du réseau — Skills4mation" },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${BASE}/formations` },
    ],
    links: [{ rel: "canonical", href: `${BASE}/formations` }],
  }),
  component: ListeFormations,
  errorComponent: ({ error }) => (
    <PublicLayout>
      <section className="section-shell py-20">
        <h1 className="text-2xl font-semibold">Page indisponible</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      </section>
    </PublicLayout>
  ),
  notFoundComponent: () => (
    <PublicLayout>
      <section className="section-shell py-20">
        <h1 className="text-2xl font-semibold">Aucune formation publiée</h1>
      </section>
    </PublicLayout>
  ),
});

function ListeFormations() {
  const { formations } = Route.useLoaderData();

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Formations du réseau"
        title="Formez-vous auprès du formateur de votre choix"
        description={DESC}
      />
      <section className="section-shell py-14">
        {formations.length === 0 ? (
          <Card className="rounded-2xl border-border/70">
            <CardContent className="p-8">
              <p className="text-sm text-muted-foreground">
                Aucune formation publiée pour le moment. Découvrez le catalogue Skills4mation.
              </p>
              <Button asChild variant="cta" className="mt-4">
                <Link to="/catalogue">Voir les formations</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {formations.map((f) => {
              const image = visuelUrl(f.visuel_url);
              return (
                <Card key={f.id} className="overflow-hidden rounded-2xl border-border/70">
                  {image ? (
                    <img
                      src={image}
                      alt={f.titre ?? ""}
                      className="h-40 w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                  <CardContent className="p-5">
                    {f.categorie ? (
                      <p className="eyebrow text-secondary">{categoryLabel(f.categorie)}</p>
                    ) : null}
                    <h2 className="mt-2 text-base font-semibold">{f.titre}</h2>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{f.intro}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {[
                        dureeLabel({
                          duree_heures: f.duree_heures ?? null,
                          duree_jours: f.duree_jours ?? null,
                        }),
                        tarifLabel({
                          tarif_ht: f.tarif_ht ?? null,
                          tarif_unite: f.tarif_unite ?? "par participant",
                        }),
                        f.formateur_nom,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <Button asChild variant="cta" size="sm" className="mt-4">
                      <Link to="/formations/$slug" params={{ slug: f.slug! }}>
                        Voir et s'inscrire
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
