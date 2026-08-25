import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CATEGORIES, FORMATIONS, categoryLabel } from "@/data/catalogue";

export const Route = createFileRoute("/catalogue/")({
  head: () => ({
    meta: [
      { title: "Catalogue de formations professionnelles — Skills4mation" },
      {
        name: "description",
        content:
          "Découvrez notre catalogue complet de formations professionnelles : bureautique & digital, RH & management, langues, bien-être, RSE, ventes, métiers spécifiques.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Catalogue de formations — Skills4mation" },
      {
        property: "og:description",
        content: "Plus de 65 parcours de formation professionnelle animés par nos formateurs experts.",
      },
    ],
  }),
  component: CatalogueIndex,
});

function CatalogueIndex() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return FORMATIONS.filter(
      (f) =>
        (!cat || f.category === cat) &&
        (!term || `${f.title} ${f.intro} ${categoryLabel(f.category)}`.toLowerCase().includes(term)),
    );
  }, [q, cat]);

  return (
    <PublicLayout>
      <section className="bg-gradient-hero py-16 text-primary-foreground">
        <div className="section-shell grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-3xl">
            <p className="eyebrow text-cta">Catalogue</p>
            <h1 className="mt-3 text-4xl font-semibold text-primary-foreground sm:text-5xl">
              Notre catalogue de formations
            </h1>
            <p className="mt-4 text-base text-primary-foreground/80">
              Découvrez notre catalogue complet de formations professionnelles : digital, RH, langues,
              bien-être, RSE… Trouvez la formation qui propulsera votre carrière avec Skills4mation.
            </p>
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
            onClick={() => setCat(null)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              cat === null
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary"
            }`}
          >
            Tout ({FORMATIONS.length})
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCat(c.slug)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                cat === c.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          {results.length} formation{results.length > 1 ? "s" : ""} disponible
          {results.length > 1 ? "s" : ""}
          {cat ? (
            <>
              {" · "}
              <Link
                to="/catalogue/$category"
                params={{ category: cat }}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Voir la page {categoryLabel(cat)}
              </Link>
            </>
          ) : null}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((f) => (
            <Card key={f.slug} className="overflow-hidden rounded-2xl border-border/70 shadow-soft">
              {f.image ? (
                <img
                  src={f.image}
                  alt={f.title}
                  loading="lazy"
                  className="h-44 w-full object-cover"
                />
              ) : null}
              <CardContent className="flex h-full flex-col p-6">
                <Link
                  to="/catalogue/$category"
                  params={{ category: f.category }}
                  className="eyebrow text-secondary"
                >
                  {categoryLabel(f.category)}
                </Link>
                <h2 className="mt-2 text-base font-semibold">{f.title}</h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">
                  {f.intro.slice(0, 160)}
                  {f.intro.length > 160 ? "…" : ""}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {f.duree ? <span className="rounded-full bg-accent px-3 py-1">{f.duree}</span> : null}
                  {f.certification ? (
                    <span className="rounded-full bg-accent px-3 py-1">{f.certification}</span>
                  ) : null}
                </div>
                <Button asChild variant="outline" className="mt-5 w-full">
                  <Link
                    to="/catalogue/$category/$slug"
                    params={{ category: f.category, slug: f.slug }}
                  >
                    Voir la formation
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
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
