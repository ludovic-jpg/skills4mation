import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Media } from "@/components/site/Media";
import { categoryLabel } from "@/lib/catalogue-historique";

export type CarteFormation = {
  slug: string;
  titre: string;
  categorie: string | null;
  image: string | null;
  meta?: string | null;
};

export function FormationCard({ formation }: { formation: CarteFormation }) {
  return (
    <Link
      to="/formations/$slug"
      params={{ slug: formation.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-elevated"
    >
      {formation.image ? (
        <Media
          src={formation.image}
          alt={formation.titre}
          ratio="3/2"
          imgClassName="transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="aspect-[3/2] w-full bg-accent" />
      )}
      <div className="flex flex-1 flex-col p-5">
        {formation.categorie ? (
          <span className="eyebrow text-secondary">{categoryLabel(formation.categorie)}</span>
        ) : null}
        <h3 className="mt-2 text-base font-semibold leading-snug">{formation.titre}</h3>
        {formation.meta ? (
          <p className="mt-2 text-xs text-muted-foreground">{formation.meta}</p>
        ) : null}
        <span className="mt-auto flex items-center gap-1.5 pt-4 text-sm font-semibold text-primary">
          Voir la formation
          <ArrowRight className="size-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
