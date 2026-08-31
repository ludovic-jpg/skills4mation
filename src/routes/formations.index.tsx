import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { categoryLabel } from "@/data/catalogue";
import { supabase } from "@/integrations/supabase/client";
import { dureeLabel, tarifLabel, visuelUrl } from "@/lib/formations";
import apprenantsDuo from "@/assets/apprenants-duo.jpg";

const BASE = "https://skills4mation.com";
const DESC =
  "Le catalogue Skills4mation : formations professionnelles du réseau et parcours proposés par nos formateurs indépendants. Programme, durée, tarifs et inscription directe.";

type Ligne = {
  id: string;
  slug: string;
  titre: string;
  categorie: string | null;
  intro: string | null;
  duree_heures: number | null;
  duree_jours: number | null;
  duree_texte: string | null;
  tarif_ht: number | null;
  tarif_unite: string;
  tarif_details: string | null;
  certification: string | null;
  visuel_url: string | null;
  formateur_nom: string | null;
  source: string;
};

export const Route = createFileRoute("/formations/")({
  validateSearch: (search: Record<string, unknown>): { categorie?: string } =>
    typeof search['categorie'] === "string" && search['categorie']
      ? { categorie: search['categorie'] as string }
      : {},
  loader: async () => {
    const { data } = await supabase
      .from("formations_catalogue")
      .select(
        "id, slug, titre, categorie, intro, duree_heures, duree_jours, duree_texte, tarif_ht, tarif_unite, tarif_details, certification, visuel_url, formateur_nom, source",
      )
      .eq("publiee", true)
      .order("titre", { ascending: true });
    return { formations: (data ?? []) as Ligne[] };
  },
  head: () => ({
    meta: [
      { title: "Catalogue de formations professionnelles — Skills4mation" },
      { name: "description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Catalogue de formations — Skills4mation" },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${BASE}/formations` },
    ],
    links: [{ rel: "canonical", href: `${BASE}/formations` }],
  }),
  component: CataloguePublic,
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

function CataloguePublic() {
  const { formations } = Route.useLoaderData();
  const { categorie } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState("");

  const categories = useMemo(() => {
    const compte = new Map<string, number>();
    for (const f of formations) {
      if (!f.categorie) continue;
      compte.set(f.categorie, (compte.get(f.categorie) ?? 0) + 1);
    }
    return [...compte.entries()].sort((a, b) => categoryLabel(a[0]).localeCompare(categoryLabel(b[0])));
  }, [formations]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return formations.filter(
      (f) =>
        (!categorie || f.categorie === categorie) &&
        (!term ||
          `${f.titre} ${f.intro ?? ""} ${categoryLabel(f.categorie ?? "")}`
            .toLowerCase()
            .includes(term)),
    );
  }, [formations, categorie, q]);

  const setCat = (value: string | undefined) =>
    navigate({ search: value ? { categorie: value } : ({} as { categorie?: string }), resetScroll: false });

  return (
    <PublicLayout>
      <section className="bg-gradient-hero py-16 text-primary-foreground">
        <div className="section-shell grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-3xl">
            <p className="eyebrow text-cta">Catalogue</p>
            <h1 className="mt-3 text-4xl font-semibold text-primary-foreground sm:text-5xl">
              Formez-vous auprès du formateur de votre choix
            </h1>
            <p className="mt-4 text-base text-primary-foreground/80">{DESC}</p>
          </div>
          <img
            src={apprenantsDuo}
            alt="Deux apprenants souriants explorant le catalogue de formations Skills4mation"
            width={1408}
            height={1008}
            className="h-64 w-full rounded-3xl object-cover shadow-elevated sm:h-72"
          />
        </div>
      </section>

      <section className="section-shell py-12">
        <div className="relative max-w-md">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher une formation…"
            aria-label="Rechercher une formation"
            className="rounded-full pl-9"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCat(undefined)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              !categorie
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary"
            }`}
          >
            Tout ({formations.length})
          </button>
          {categories.map(([slug, n]) => (
            <button
              key={slug}
              type="button"
              onClick={() => setCat(slug)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                categorie === slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary"
              }`}
            >
              {categoryLabel(slug)} ({n})
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          {results.length} formation{results.length > 1 ? "s" : ""} disponible
          {results.length > 1 ? "s" : ""}
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((f) => {
            const image = visuelUrl(f.visuel_url);
            return (
              <Card key={f.id} className="overflow-hidden rounded-2xl border-border/70 shadow-soft">
                {image ? (
                  <img src={image} alt={f.titre} loading="lazy" className="h-44 w-full object-cover" />
                ) : null}
                <CardContent className="flex h-full flex-col p-6">
                  {f.categorie ? (
                    <p className="eyebrow text-secondary">{categoryLabel(f.categorie)}</p>
                  ) : null}
                  <h2 className="mt-2 text-base font-semibold">{f.titre}</h2>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {(f.intro ?? "").slice(0, 160)}
                    {(f.intro ?? "").length > 160 ? "…" : ""}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {dureeLabel(f) ? (
                      <span className="rounded-full bg-accent px-3 py-1">{dureeLabel(f)}</span>
                    ) : null}
                    {f.certification ? (
                      <span className="rounded-full bg-accent px-3 py-1">{f.certification}</span>
                    ) : null}
                    {tarifLabel(f) ? (
                      <span className="rounded-full bg-accent px-3 py-1">{tarifLabel(f)}</span>
                    ) : null}
                  </div>
                  {f.source === "formateur" && f.formateur_nom ? (
                    <p className="mt-3 text-xs text-muted-foreground">Animée par {f.formateur_nom}</p>
                  ) : null}
                  <Button asChild variant="outline" className="mt-5 w-full">
                    <Link to="/formations/$slug" params={{ slug: f.slug }}>
                      Voir la formation
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {results.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">
            Aucune formation ne correspond à votre recherche.
          </p>
        ) : null}
      </section>
    </PublicLayout>
  );
}
