import { Link } from "@tanstack/react-router";
import { ChevronRight, Info, ShieldAlert, Sun } from "lucide-react";
import type { ReactNode } from "react";

import { QualiopiBadge } from "@/components/Brand";
import { Media } from "@/components/site/Media";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AVERTISSEMENT_LIMITES,
  DATE_MAJ_ISO,
  DATE_MAJ_LIBELLE,
  HANDICAP_MENTION,
  MENTION_CPF,
  MENTION_TARIF_DATES,
  PAGES_PV,
  STATUT_OUVERTURE,
  type PageMeta,
} from "@/data/formation-photovoltaique";
import { VISUELS_PV, type CleVisuelPv } from "@/data/photovoltaique-visuels";
import { cn } from "@/lib/utils";

/** Visuel du parcours : image si elle est livrée, sinon bloc décoratif aux couleurs de la charte. */
export function VisuelPv({
  cle,
  ratio = "4/3",
  className,
  priority = false,
}: {
  cle: CleVisuelPv;
  ratio?: "square" | "4/3" | "3/2" | "16/9" | "4/5" | "5/6";
  className?: string;
  priority?: boolean;
}) {
  const visuel = VISUELS_PV[cle];
  if (visuel.src) {
    return (
      <Media
        src={visuel.src}
        alt={visuel.alt}
        ratio={ratio}
        className={className ?? ""}
        priority={priority}
      />
    );
  }
  const ratios = {
    square: "1 / 1",
    "4/3": "4 / 3",
    "3/2": "3 / 2",
    "16/9": "16 / 9",
    "4/5": "4 / 5",
    "5/6": "5 / 6",
  } as const;
  return (
    <div
      aria-hidden="true"
      style={{ aspectRatio: ratios[ratio] }}
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden bg-gradient-teal",
        className,
      )}
    >
      <Sun className="size-1/4 text-primary-foreground/25" strokeWidth={1.25} />
    </div>
  );
}

/** Fil d'Ariane visible (les données structurées sont ajoutées par enTetePv). */
export function FilArianePv({ meta, surFond = false }: { meta: PageMeta; surFond?: boolean }) {
  const elements = [{ name: "Accueil", path: "/" }, ...meta.fil];
  return (
    <nav aria-label="Fil d'Ariane">
      <ol
        className={cn(
          "flex flex-wrap items-center gap-1 text-xs",
          surFond ? "text-primary-foreground/75" : "text-muted-foreground",
        )}
      >
        {elements.map((e, i) => {
          const dernier = i === elements.length - 1;
          return (
            <li key={e.path} className="flex items-center gap-1">
              {dernier ? (
                <span aria-current="page">{e.name}</span>
              ) : (
                <a href={e.path} className="underline-offset-2 hover:underline">
                  {e.name}
                </a>
              )}
              {dernier ? null : <ChevronRight className="size-3" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Ligne de crédibilité : auteur/organisme et date de mise à jour. */
export function MiseAJourPv({ surFond = false }: { surFond?: boolean }) {
  return (
    <p className={cn("text-xs", surFond ? "text-primary-foreground/75" : "text-muted-foreground")}>
      Par Skills4mation, organisme de formation certifié Qualiopi · Mis à jour le{" "}
      <time dateTime={DATE_MAJ_ISO}>{DATE_MAJ_LIBELLE}</time>
    </p>
  );
}

/** En-tête compact des sous-pages (un seul H1). */
export function EntetePagePv({
  meta,
  eyebrow,
  titre,
  introduction,
}: {
  meta: PageMeta;
  eyebrow: string;
  titre: string;
  introduction: string;
}) {
  return (
    <section className="bg-gradient-hero text-primary-foreground">
      <div className="section-shell max-w-4xl py-14">
        <FilArianePv meta={meta} surFond />
        <p className="eyebrow mt-6 text-cta">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold text-primary-foreground sm:text-5xl">{titre}</h1>
        <p className="mt-4 max-w-2xl text-base text-primary-foreground/85">{introduction}</p>
        <div className="mt-5">
          <MiseAJourPv surFond />
        </div>
      </div>
    </section>
  );
}

/** Statut d'ouverture, mentions tarif / dates / CPF. */
export function StatutOuverturePv({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-border bg-accent p-5 text-sm",
        className,
      )}
    >
      <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
      <div>
        <p className="font-semibold">{STATUT_OUVERTURE}</p>
        <p className="mt-1 text-muted-foreground">
          {MENTION_TARIF_DATES} {MENTION_CPF}
        </p>
      </div>
    </div>
  );
}

/** Bloc « Ce que cette formation ne permet pas ». */
export function LimitesPv({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-cta/60 bg-card p-6 shadow-soft", className)}>
      <div className="flex items-center gap-3">
        <ShieldAlert className="size-6 text-primary" aria-hidden />
        <h2 className="text-xl font-semibold sm:text-2xl">{AVERTISSEMENT_LIMITES.titre}</h2>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{AVERTISSEMENT_LIMITES.intro}</p>
      <ul className="mt-4 grid gap-3 text-sm leading-relaxed">
        {AVERTISSEMENT_LIMITES.points.map((p) => (
          <li key={p} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Navigation vers les pages du parcours, hors page courante. */
export function LiensParcoursPv({
  courante,
  titre = "Aller plus loin sur ce parcours",
}: {
  courante?: string;
  titre?: string;
}) {
  const pages = PAGES_PV.filter((p) => p.to !== courante);
  return (
    <section className="section-shell py-14">
      <h2 className="text-2xl font-semibold sm:text-3xl">{titre}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {pages.map((p) => (
          <Link key={p.to} to={p.to} className="group block">
            <Card className="h-full rounded-2xl border-border/70 transition-colors group-hover:border-primary">
              <CardContent className="p-5">
                <h3 className="text-base font-semibold">{p.titreCourt}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.resume}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
        <Link to="/formations/installateur-panneaux-photovoltaiques" className="group block">
          <Card className="h-full rounded-2xl border-border/70 transition-colors group-hover:border-primary">
            <CardContent className="p-5">
              <h3 className="text-base font-semibold">Présentation du parcours</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                L'essentiel sur la formation installateur de panneaux photovoltaïques.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </section>
  );
}

/** Appel à agir final : demande d'information (page contact), jamais d'inscription ni de tarif. */
export function CtaInformationPv({ children }: { children?: ReactNode }) {
  return (
    <section className="section-shell pb-16">
      <Card className="rounded-3xl border-none bg-gradient-hero text-primary-foreground shadow-elevated">
        <CardContent className="p-8 sm:p-12">
          <h2 className="max-w-2xl text-3xl font-semibold text-primary-foreground sm:text-4xl">
            Parcours en cours d'ouverture : demandez à être informé
          </h2>
          <p className="mt-4 max-w-2xl text-primary-foreground/85">
            {children ??
              "Laissez-nous vos coordonnées et votre projet : nous revenons vers vous dès que les modalités du parcours sont arrêtées."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="cta" size="lg">
              <Link to="/contact">Être informé de l'ouverture</Link>
            </Button>
            <Button asChild variant="onDark" size="lg">
              <Link to="/evaluer-droit-formation">Estimer mes droits à la formation</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-primary-foreground/75">{MENTION_TARIF_DATES}</p>
        </CardContent>
      </Card>
    </section>
  );
}

/** Mentions : certification Qualiopi de Skills4mation et accessibilité. */
export function MentionsPv() {
  return (
    <section className="section-shell pb-20">
      <div className="grid items-center gap-6 border-t border-border pt-8 sm:grid-cols-[auto_1fr]">
        <QualiopiBadge />
        <div className="text-sm leading-relaxed text-muted-foreground">
          <p>
            Skills4mation est certifié Qualiopi au titre des actions de formation. Cette
            certification porte sur la qualité de nos processus ; elle ne vaut pas habilitation pour
            présenter à une certification déterminée.
          </p>
          <p className="mt-2">{HANDICAP_MENTION}</p>
        </div>
      </div>
    </section>
  );
}
