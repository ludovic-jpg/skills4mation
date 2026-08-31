import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORIES, categoryLabel, formationsByCategory } from "@/data/catalogue";

export const Route = createFileRoute("/catalogue/$category/")({
  loader: ({ params }) => {
    const exists = CATEGORIES.some((c) => c.slug === params.category);
    if (!exists) throw notFound();
    return { category: params.category };
  },
  head: ({ params }) => {
    const label = categoryLabel(params.category);
    const title = `Formations ${label} — Skills4mation`;
    const description = `Toutes nos formations professionnelles ${label} : objectifs pédagogiques, programme, durée et modalités de financement.`;
    const url = `https://skills4mation.com/catalogue/${params.category}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useParams();
  const formations = formationsByCategory(category);
  const label = categoryLabel(category);

  return (
    <PublicLayout>
      <section className="bg-gradient-hero py-14 text-primary-foreground">
        <div className="section-shell">
          <nav className="text-xs text-primary-foreground/70">
            <Link to="/catalogue" className="hover:underline">
              Catalogue
            </Link>
            <span> / {label}</span>
          </nav>
          <h1 className="mt-3 text-3xl font-semibold text-primary-foreground sm:text-4xl">
            Formations {label}
          </h1>
          <p className="mt-3 text-sm text-primary-foreground/80">
            {formations.length} parcours disponibles, animés par les formateurs experts du réseau
            Skills4mation.
          </p>
        </div>
      </section>

      <section className="section-shell py-12">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/catalogue/$category"
              params={{ category: c.slug }}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                c.slug === category
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary"
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {formations.map((f) => (
            <Card key={f.slug} className="overflow-hidden rounded-2xl border-border/70 shadow-soft">
              {f.image ? (
                <img src={f.image} alt={f.title} loading="lazy" className="h-44 w-full object-cover" />
              ) : null}
              <CardContent className="flex h-full flex-col p-6">
                <h2 className="text-base font-semibold">{f.title}</h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">
                  {f.intro.slice(0, 160)}
                  {f.intro.length > 160 ? "…" : ""}
                </p>
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
      </section>
    </PublicLayout>
  );
}
