import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { blogPosts } from "@/data/blog";
import { CATEGORIES, FORMATIONS } from "@/data/catalogue";

const BASE_URL = "https://train-grow-connect.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/catalogue", changefreq: "weekly", priority: "0.9" },
          { path: "/portage-qualiopi", changefreq: "weekly", priority: "0.9" },
          { path: "/pole-formateur", changefreq: "monthly", priority: "0.8" },
          { path: "/contact", changefreq: "monthly", priority: "0.7" },
          { path: "/blog", changefreq: "weekly", priority: "0.8" },
          ...blogPosts.map((p) => ({
            path: `/blog/${p.slug}`,
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
          { path: "/evaluer-droit-formation", changefreq: "monthly", priority: "0.9" },
          { path: "/mentions-legales", changefreq: "yearly", priority: "0.2" },
          { path: "/politique-de-confidentialite", changefreq: "yearly", priority: "0.2" },
          { path: "/code-deontologique", changefreq: "yearly", priority: "0.3" },
          ...CATEGORIES.map((c) => ({
            path: `/catalogue/${c.slug}`,
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
          ...FORMATIONS.map((f) => ({
            path: `/catalogue/${f.category}/${f.slug}`,
            changefreq: "monthly" as const,
            priority: "0.6",
          })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
