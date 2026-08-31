import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, Clock, GraduationCap, Target, Wallet } from "lucide-react";

import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FORMATIONS, categoryLabel, formationsByCategory } from "@/data/catalogue";

export const Route = createFileRoute("/catalogue/$category/$slug")({
  loader: ({ params }) => {
    const formation = FORMATIONS.find(
      (f) => f.slug === params.slug && f.category === params.category,
    );
    if (!formation) throw notFound();
    return { formation };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Formation introuvable — Skills4mation" }, { name: "robots", content: "noindex" }],
      };
    }
    const f = loaderData.formation;
    const description = f.intro.slice(0, 155) || `Programme de la formation ${f.title}.`;
    const base = "https://skills4mation.com";
    const url = `${base}/catalogue/${f.category}/${f.slug}`;
    return {
      meta: [
        { title: `${f.title} — Skills4mation` },
        { name: "description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { property: "og:title", content: `${f.title} — Skills4mation` },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        ...(f.image
          ? [
              { property: "og:image", content: f.image },
              { name: "twitter:image", content: f.image },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Course",
                name: f.title,
                description,
                url,
                provider: {
                  "@type": "Organization",
                  name: "Skills4mation",
                  url: base,
                },
                ...(f.duree ? { timeRequired: f.duree } : {}),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Catalogue", item: `${base}/catalogue` },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: categoryLabel(f.category),
                    item: `${base}/catalogue/${f.category}`,
                  },
                  { "@type": "ListItem", position: 3, name: f.title, item: url },
                ],
              },
            ],
          }),
        },
      ],
    };
  },
  notFoundComponent: FormationNotFound,
  component: FormationDetail,
});

function FormationNotFound() {
  return (
    <PublicLayout>
      <section className="section-shell py-24 text-center">
        <h1 className="text-2xl font-semibold">Formation introuvable</h1>
        <Button asChild variant="cta" className="mt-6">
          <Link to="/catalogue">Retour au catalogue</Link>
        </Button>
      </section>
    </PublicLayout>
  );
}

function FormationDetail() {
  const { formation: f } = Route.useLoaderData();
  const related = formationsByCategory(f.category)
    .filter((x) => x.slug !== f.slug)
    .slice(0, 4);

  const infos = [
    { icon: GraduationCap, label: "Niveau", value: f.niveau },
    { icon: Wallet, label: "Tarif", value: f.tarif },
    { icon: Target, label: "Objectif", value: f.objectif },
    { icon: Clock, label: "Durée", value: f.duree },
    { icon: Check, label: "Pré-requis", value: f.prerequis },
  ].filter((i) => i.value);

  return (
    <PublicLayout>
      <section className="bg-gradient-hero py-14 text-primary-foreground">
        <div className="section-shell grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <nav className="text-xs text-primary-foreground/70">
              <Link to="/catalogue" className="hover:underline">
                Catalogue
              </Link>
              <span> / </span>
              <Link
                to="/catalogue/$category"
                params={{ category: f.category }}
                className="hover:underline"
              >
                {categoryLabel(f.category)}
              </Link>
            </nav>
            <h1 className="mt-3 text-3xl font-semibold text-primary-foreground sm:text-4xl">
              {f.title}
            </h1>
            {f.intro ? (
              <p className="mt-4 text-sm text-primary-foreground/85">{f.intro}</p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="cta">
                <Link to="/contact">Aidez-moi à financer cette formation</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">S’inscrire à cette formation</Link>
              </Button>
            </div>
          </div>
          {f.image ? (
            <img
              src={f.image}
              alt={f.title}
              className="w-full rounded-2xl object-cover shadow-soft"
              loading="lazy"
            />
          ) : null}
        </div>
      </section>

      {infos.length ? (
        <section className="section-shell py-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {infos.map((i) => (
              <Card key={i.label} className="rounded-2xl border-border/70">
                <CardContent className="flex gap-3 p-5">
                  <i.icon className="mt-0.5 size-5 shrink-0 text-secondary" />
                  <div>
                    <p className="text-xs font-semibold tracking-wide uppercase">{i.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{i.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section-shell grid gap-10 pb-14 lg:grid-cols-[1fr_1fr]">
        {f.objectifs.length ? (
          <div>
            <h2 className="text-xl font-semibold">Objectif pédagogique</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {f.objectifs.map((o) => (
                <li key={o} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-secondary" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {f.modalites.length ? (
          <div>
            <h2 className="text-xl font-semibold">Modalité pédagogique</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {f.modalites.map((m) => (
                <li key={m} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-secondary" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {f.modules.length ? (
        <section className="bg-accent/40 py-14">
          <div className="section-shell">
            <h2 className="text-2xl font-semibold">Programme pédagogique</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {f.modules.map((m) => (
                <Card key={m.titre} className="rounded-2xl border-border/70 bg-background">
                  <CardContent className="p-6">
                    <h3 className="text-base font-semibold">{m.titre}</h3>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {m.points.map((p) => (
                        <li key={p} className="flex gap-2">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-secondary" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section-shell py-14">
        <div className="rounded-2xl border border-border/70 p-8 shadow-soft">
          <h2 className="text-xl font-semibold">
            Une expérience d’apprentissage optimale pour favoriser votre montée en compétence
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Une formation adaptée à votre niveau après une évaluation</li>
            <li>Financement possible via votre OPCO, AGEFICE ou FIFPL</li>
            {f.certification ? <li>Certification associée : {f.certification}</li> : null}
          </ul>
          <Button asChild variant="cta" className="mt-6">
            <Link to="/contact">Demander une inscription</Link>
          </Button>
        </div>
      </section>

      {related.length ? (
        <section className="section-shell pb-16">
          <h2 className="text-xl font-semibold">
            Les formations qui pourraient également vous intéresser
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <Card key={r.slug} className="overflow-hidden rounded-2xl border-border/70">
                {r.image ? (
                  <img src={r.image} alt={r.title} loading="lazy" className="h-32 w-full object-cover" />
                ) : null}
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold">{r.title}</h3>
                  <Link
                    to="/catalogue/$category/$slug"
                    params={{ category: r.category, slug: r.slug }}
                    className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                  >
                    Voir la formation
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </PublicLayout>
  );
}
