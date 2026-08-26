import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { blogPosts, getPost } from "@/data/blog";

const BASE = "https://train-grow-connect.lovable.app";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Article introuvable" }, { name: "robots", content: "noindex" }] };
    }
    const { post } = loaderData;
    const url = `${BASE}/blog/${params.slug}`;
    return {
      meta: [
        { title: `${post.title} | Blog Skills4mation` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: post.cover },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: post.cover },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            image: post.cover,
            datePublished: post.date,
            mainEntityOfPage: url,
            publisher: { "@type": "Organization", name: "Skills4mation" },
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <PublicLayout>
      <div className="section-shell py-24 text-center">
        <h1 className="text-2xl font-semibold">Article introuvable</h1>
        <Button asChild className="mt-6">
          <Link to="/blog">Retour au blog</Link>
        </Button>
      </div>
    </PublicLayout>
  ),
  component: ArticlePage,
});

function ArticlePage() {
  const { post } = Route.useLoaderData();
  const autres = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <PublicLayout>
      <article className="section-shell max-w-3xl py-12">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Blog pédagogique
        </Link>

        <h1 className="mt-6 text-3xl font-semibold leading-tight sm:text-4xl">{post.title}</h1>
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4" /> 16 octobre 2025
        </p>
        <img
          src={post.cover}
          alt={post.title}
          className="mt-8 aspect-video w-full rounded-2xl object-cover shadow-soft"
        />

        <div className="prose prose-slate mt-10 max-w-none prose-headings:font-semibold prose-a:text-primary prose-img:rounded-xl dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>

        <div className="mt-12 rounded-2xl border border-border/70 bg-accent/40 p-8">
          <h2 className="text-xl font-semibold">
            Envie de former sous notre certification Qualiopi ?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Portage Qualiopi pour vos formations et vos bilans de compétences : conventions en 48h,
            accès aux financements, paiement sous 10 jours ouvrés.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild variant="cta">
              <Link to="/pole-formateur" hash="candidature">
                Rejoindre Skills4mation
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/portage-qualiopi">Découvrir le portage Qualiopi</Link>
            </Button>
          </div>
        </div>

        <section className="mt-14">
          <h2 className="text-lg font-semibold">À lire également</h2>
          <ul className="mt-4 space-y-3">
            {autres.map((p) => (
              <li key={p.slug}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </PublicLayout>
  );
}
