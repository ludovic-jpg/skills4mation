import { Link } from "@tanstack/react-router";

import { Card, CardContent } from "@/components/ui/card";
import { articlesParSlugs } from "@/data/maillage";

/** Bloc d'articles du blog liés à une page commerciale (maillage interne). */
export function ArticlesLies({
  slugs,
  eyebrow = "À lire sur le blog",
  titre,
  className = "section-shell py-16 lg:py-20",
}: {
  slugs: string[];
  eyebrow?: string;
  titre: string;
  className?: string;
}) {
  const articles = articlesParSlugs(slugs);
  if (articles.length === 0) return null;
  return (
    <section className={className}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 max-w-2xl text-2xl font-semibold sm:text-3xl">{titre}</h2>
      <div
        className={`mt-8 grid gap-4 sm:grid-cols-2 ${articles.length > 3 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
      >
        {articles.map((post) => (
          <Card key={post.slug} className="rounded-2xl border-border/70">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold">
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="hover:text-primary hover:underline"
                >
                  {post.title}
                </Link>
              </h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
