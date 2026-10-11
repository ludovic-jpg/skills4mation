import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { blogPosts } from "@/data/blog";
import { FORMATIONS_STATIQUES } from "@/data/formations-statiques";

import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://skills4mation.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const url = process.env['SUPABASE_URL'];
        const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
        if (!url || !key) return new Response('Sitemap temporairement indisponible.', { status: 503 });
        const client = createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { fetch: (input, init) => {
            const headers = new Headers(init?.headers);
            if (key.startsWith('sb_')) { headers.delete('Authorization'); headers.set('apikey', key); }
            return fetch(input, { ...init, headers });
          } },
        });
        const data: { slug: string }[] = [];
        for (let offset = 0; ; offset += 1000) {
          const { data: page, error } = await client.from('formations_catalogue').select('slug').eq('publiee', true).order('slug').range(offset, offset + 999);
          if (error) { console.error('Sitemap : lecture du catalogue impossible.', error.message); return new Response('Sitemap temporairement indisponible.', { status: 503 }); }
          data.push(...(page ?? []));
          if (!page || page.length < 1000) break;
        }
        const slugs = new Set<string>([
          ...FORMATIONS_STATIQUES.map((f) => f.slug),
          ...(data ?? []).map((f) => f.slug),
        ]);
        const formations = [...slugs].map((slug) => ({ slug }));


        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/formations", changefreq: "weekly", priority: "0.9" },
          { path: "/livre-blanc", changefreq: "monthly", priority: "0.8" },
          { path: "/portage-qualiopi", changefreq: "weekly", priority: "0.9" },
          { path: "/pole-formateur", changefreq: "monthly", priority: "0.8" },
          { path: "/contact", changefreq: "monthly", priority: "0.7" },
          { path: "/qui-sommes-nous", changefreq: "yearly", priority: "0.5" },
          { path: "/mediatheque", changefreq: "monthly", priority: "0.6" },
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
          { path: "/bilan-de-competences", changefreq: "monthly", priority: "0.9" },
          { path: "/reclamations", changefreq: "yearly", priority: "0.2" },
          ...formations.map((f) => ({
            path: `/formations/${f.slug}`,
            changefreq: "monthly" as const,
            priority: "0.7",
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
