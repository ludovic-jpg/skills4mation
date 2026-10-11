import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { OUTILS } from "@/components/outils/outils-menu";

/** Écran d'accueil : grandes tuiles cliquables, une par outil pédagogique. */
export function OutilsAccueil() {
  return (
    <section aria-labelledby="titre-outils">
      <div className="mb-6 max-w-2xl">
        <h2 id="titre-outils" className="text-lg font-semibold">
          Que souhaitez-vous préparer ?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tous les outils s'appuient sur les objectifs et le programme de vos formations. L'IA
          propose, vous relisez et ajustez avant d'utiliser.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {OUTILS.map((o) => (
          <li key={o.id} className="flex">
            <Link
              to="/espace/outils"
              search={{ outil: o.id }}
              className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-soft transition duration-200 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <span
                aria-hidden
                className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${o.lisere} transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100`}
              />
              <span
                aria-hidden
                className={`flex size-16 items-center justify-center rounded-full ${o.pastille} transition-transform duration-300 group-hover:scale-110 motion-reduce:group-hover:scale-100`}
              >
                <o.Icone className="size-8" strokeWidth={1.75} />
              </span>
              <span className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {o.moment}
              </span>
              <span className="mt-1 text-lg font-semibold leading-snug">{o.titre}</span>
              <span className="mt-2 flex-1 text-sm text-muted-foreground">{o.description}</span>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                Ouvrir
                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
