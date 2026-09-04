import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { FormationCard, type CarteFormation } from "@/components/formations/FormationCard";
import { Media } from "@/components/site/Media";
import { PublicLayout } from "@/components/site/PublicLayout";
import {
  categoryLabel,
  chargerCatalogueHistorique,
  type CarteHistorique,
} from "@/lib/catalogue-historique";

import { SPHERES } from "@/data/spheres";
import { supabase } from "@/integrations/supabase/client";
import { dureeLabel, tarifLabel, visuelUrl } from "@/lib/formations";

const BASE = "https://skills4mation.com";
const DESC =
  "Le catalogue Skills4mation : bureautique & digital, langues, RH & management, ventes, RSE, business, bien-être et métiers spécifiques. Programme complet, durée, tarifs et inscription directe.";

type LigneFormateur = {
  id: string;
  slug: string;
  titre: string;
  categorie: string | null;
  duree_heures: number | null;
  duree_jours: number | null;
  duree_texte: string | null;
  tarif_ht: number | null;
  tarif_unite: string;
  tarif_details: string | null;
  visuel_url: string | null;
  formateur_nom: string | null;
};

export const Route = createFileRoute("/formations/")({
  validateSearch: (search: Record<string, unknown>): { categorie?: string } =>
    typeof search["categorie"] === "string" && search["categorie"]
      ? { categorie: search["categorie"] as string }
      : {},
  loader: async () => {
    const [historique, formateursRes] = await Promise.all([
      chargerCatalogueHistorique(),
      supabase
        .from("formations_catalogue")
        .select(
          "id, slug, titre, categorie, duree_heures, duree_jours, duree_texte, tarif_ht, tarif_unite, tarif_details, visuel_url, formateur_nom",
        )
        .eq("publiee", true)
        .eq("source", "formateur")
        .order("titre", { ascending: true }),
    ]);
    return {
      historique,
      formateurs: (formateursRes.data ?? []) as LigneFormateur[],
    };
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
});

function CataloguePublic() {
  const { formateurs } = Route.useLoaderData();
  const { categorie } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState("");

  const toutes = useMemo<CarteFormation[]>(
    () => [
      ...FORMATIONS_STATIQUES.map((f) => ({
        slug: f.slug,
        titre: f.title,
        categorie: f.cat as string,
        image: f.img,
      })),
      ...formateurs.map((f) => ({
        slug: f.slug,
        titre: f.titre,
        categorie: f.categorie,
        image: visuelUrl(f.visuel_url),
        meta:
          [dureeLabel(f), tarifLabel(f), f.formateur_nom ? `Animée par ${f.formateur_nom}` : null]
            .filter(Boolean)
            .join(" · ") || null,
      })),
    ],
    [formateurs],
  );

  const categories = useMemo(() => {
    const compte = new Map<string, number>();
    for (const f of toutes) {
      if (!f.categorie) continue;
      compte.set(f.categorie, (compte.get(f.categorie) ?? 0) + 1);
    }
    return [...compte.entries()].sort((a, b) =>
      categoryLabel(a[0]).localeCompare(categoryLabel(b[0])),
    );
  }, [toutes]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return toutes.filter(
      (f) =>
        (!categorie || f.categorie === categorie) &&
        (!term ||
          `${f.titre} ${categoryLabel(f.categorie ?? "")}`.toLowerCase().includes(term)),
    );
  }, [toutes, categorie, q]);

  const sphere = SPHERES.find((s) => s.cat === categorie);

  const setCat = (value: string | undefined) =>
    navigate({
      search: value ? { categorie: value } : ({} as { categorie?: string }),
      resetScroll: false,
    });

  return (
    <PublicLayout>
      <section className="bg-gradient-hero py-16 text-primary-foreground">
        <div className="section-shell grid items-center gap-10 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="eyebrow text-cta">Nos formations</p>
            <h1 className="mt-3 text-4xl font-semibold text-primary-foreground sm:text-5xl">
              Notre catalogue de formations
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/80">
              Digital, langues, management, commerce, RSE, bien-être : parcourez l'ensemble de nos
              parcours et trouvez la formation qui fera avancer votre carrière. Chaque programme est
              animé par un expert de son domaine et adapté à votre niveau.
            </p>
            <div className="mt-7 flex max-w-md items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2.5">
              <Search className="size-4 text-primary-foreground/70" aria-hidden />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher une formation…"
                aria-label="Rechercher une formation"
                className="w-full bg-transparent text-sm text-primary-foreground outline-none placeholder:text-primary-foreground/60"
              />
            </div>
          </div>
          <Media
            src="/images/catalogue.webp"
            alt="Apprenants en formation professionnelle avec Skills4mation"
            ratio="4/3"
            mdRatio="4/5"
            position="top"
            className="rounded-2xl shadow-elevated"
            priority
          />
        </div>
      </section>

      <section className="section-shell py-14">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCat(undefined)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              !categorie
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary"
            }`}
          >
            Tout ({toutes.length})
          </button>
          {categories.map(([slug, n]) => (
            <button
              key={slug}
              type="button"
              onClick={() => setCat(slug)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                categorie === slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary"
              }`}
            >
              {categoryLabel(slug)} ({n})
            </button>
          ))}
        </div>

        {sphere ? (
          <div className="mt-8 rounded-2xl bg-accent p-6">
            <h2 className="text-lg font-semibold">{sphere.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{sphere.intro}</p>
          </div>
        ) : null}

        <p className="mt-6 text-sm text-muted-foreground">
          {results.length} formation{results.length > 1 ? "s" : ""} disponible
          {results.length > 1 ? "s" : ""}
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((f) => (
            <FormationCard key={f.slug} formation={f} />
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
