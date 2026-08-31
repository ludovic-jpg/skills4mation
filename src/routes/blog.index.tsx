import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";

import { PageHero, PublicLayout } from "@/components/site/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { blogPosts } from "@/data/blog";

const TITRE = "Blog pédagogique — Portage Qualiopi, formation et bilan de compétences";
const DESCRIPTION =
  "Analyses et guides Skills4mation : portage Qualiopi, marché du bilan de compétences, compétences numériques, vente B2B et langues étrangères.";
const URL = "https://skills4mation.com/blog";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: TITRE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITRE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Blog pédagogique Skills4mation",
          url: URL,
          blogPost: blogPosts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            datePublished: p.date,
            url: `${URL}/${p.slug}`,
          })),
        }),
      },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Blog pédagogique"
        title="Comprendre le portage Qualiopi, la formation et le bilan de compétences"
        description="Nos articles de fond pour les formateurs indépendants, consultants en bilan de compétences et apprenants qui construisent leur projet professionnel."
      />

      <section className="section-shell py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Card
              key={post.slug}
              className="overflow-hidden rounded-2xl border-border/70 shadow-soft transition-shadow hover:shadow-lg"
            >
              <Link to="/blog/$slug" params={{ slug: post.slug }} className="block">
                <img
                  src={post.cover}
                  alt={post.title}
                  loading="lazy"
                  className="aspect-video w-full object-cover"
                />
                <CardContent className="p-6">
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    16 octobre 2025
                  </p>
                  <h2 className="mt-3 text-lg font-semibold leading-snug">{post.title}</h2>
                  <p className="mt-3 text-sm text-muted-foreground">{post.excerpt}</p>
                  <span className="mt-4 inline-block text-sm font-medium text-primary">
                    Lire la suite →
                  </span>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
