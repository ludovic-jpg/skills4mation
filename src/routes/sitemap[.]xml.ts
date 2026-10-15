import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { blogPosts } from "@/data/blog";
import { FORMATIONS_STATIQUES } from "@/data/formations-statiques";
import { estFichePublique } from "@/lib/seo-exclusions";

import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://skills4mation.com";

/**
 * Date de dernière modification déclarée pour les pages sans date propre (pages
 * institutionnelles, fiches de repli sans ligne en base). Date fixe et réelle de la
 * dernière mise à jour éditoriale de ces pages : à avancer quand leur contenu change.
 */
const DERNIERE_MAJ_PAGES = "2026-10-15";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        // Fiches en base (date réelle : updated_at). En cas d'échec de lecture, le sitemap reste
        // servi avec les pages statiques et FORMATIONS_STATIQUES plutôt qu'une erreur 503.
        const lignes = await lireCatalogue();
        const formations = new Map<string, string>();
        for (const f of FORMATIONS_STATIQUES) {
          if (estFichePublique({ slug: f.slug, categorie: f.cat })) {
            formations.set(f.slug, DERNIERE_MAJ_PAGES);
          }
        }
        for (const f of lignes) {
          if (estFichePublique(f)) formations.set(f.slug, jour(f.updated_at) ?? DERNIERE_MAJ_PAGES);
        }

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
            lastmod: p.date,
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
          { path: "/evaluer-droit-formation", changefreq: "monthly", priority: "0.9" },
          { path: "/mentions-legales", changefreq: "yearly", priority: "0.2" },
          { path: "/politique-de-confidentialite", changefreq: "yearly", priority: "0.2" },
          { path: "/politique-de-cookies", changefreq: "yearly", priority: "0.2" },
          { path: "/nos-resultats", changefreq: "monthly", priority: "0.5" },
          { path: "/code-deontologique", changefreq: "yearly", priority: "0.3" },
          { path: "/bilan-de-competences", changefreq: "monthly", priority: "0.9" },
          { path: "/reclamations", changefreq: "yearly", priority: "0.2" },
          ...[...formations.entries()].map(([slug, lastmod]) => ({
            path: `/formations/${slug}`,
            lastmod,
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            `    <lastmod>${e.lastmod ?? DERNIERE_MAJ_PAGES}</lastmod>`,
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

type LigneSitemap = { slug: string; categorie: string | null; updated_at: string | null };

/** AAAA-MM-JJ d'un horodatage, ou null s'il est illisible. */
function jour(horodatage: string | null): string | null {
  if (!horodatage) return null;
  const d = new Date(horodatage);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

/** Fiches publiées en base ; liste vide (et journal d'erreur) si la lecture échoue. */
async function lireCatalogue(): Promise<LigneSitemap[]> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) {
    console.error("Sitemap : variables Supabase absentes, repli sur les données statiques.");
    return [];
  }
  try {
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_")) {
            headers.delete("Authorization");
            headers.set("apikey", key);
          }
          return fetch(input, { ...init, headers });
        },
      },
    });
    const data: LigneSitemap[] = [];
    for (let offset = 0; ; offset += 1000) {
      const { data: page, error } = await client
        .from("formations_catalogue")
        .select("slug, categorie, updated_at")
        .eq("publiee", true)
        .order("slug")
        .range(offset, offset + 999);
      if (error) {
        console.error(
          "Sitemap : lecture du catalogue impossible, repli sur les données statiques.",
          error.message,
        );
        return [];
      }
      data.push(...((page ?? []) as LigneSitemap[]));
      if (!page || page.length < 1000) break;
    }
    return data;
  } catch (error) {
    console.error(
      "Sitemap : lecture du catalogue impossible, repli sur les données statiques.",
      error,
    );
    return [];
  }
}
