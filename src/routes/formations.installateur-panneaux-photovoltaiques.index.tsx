import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ClipboardCheck, FileText, Users } from "lucide-react";

import { PublicLayout } from "@/components/site/PublicLayout";
import {
  CtaInformationPv,
  FilArianePv,
  LimitesPv,
  LiensParcoursPv,
  MentionsPv,
  MiseAJourPv,
  StatutOuverturePv,
  VisuelPv,
} from "@/components/site/PhotovoltaiqueBlocs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AUDIENCE,
  CANAUX_FINANCEMENT,
  CERTIFICATION,
  COMPETENCES,
  CPF_RESTE_A_CHARGE,
  EN_BREF,
  enTetePv,
  EVALUATION,
  FAQ_PILIER,
  INTRO_HERO,
  META_PV,
  MODULES,
  NOM_PARCOURS,
  PREREQUIS_CERTIFICATION,
  PREREQUIS_REGLEMENTAIRES,
  TOTAL_HEURES,
} from "@/data/formation-photovoltaique";

export const Route = createFileRoute("/formations/installateur-panneaux-photovoltaiques/")({
  head: () => enTetePv(META_PV.pilier, ["cours"]),
  component: PagePilierPhotovoltaique,
});

function PagePilierPhotovoltaique() {
  return (
    <PublicLayout>
      <section className="bg-gradient-hero text-primary-foreground">
        <div className="section-shell grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <FilArianePv meta={META_PV.pilier} surFond />
            <p className="eyebrow mt-6 text-cta">Formation · Transition énergétique</p>
            <h1 className="mt-4 text-4xl font-semibold text-primary-foreground sm:text-5xl">
              Formation installateur de panneaux photovoltaïques
            </h1>
            <p className="mt-5 max-w-xl text-lg text-primary-foreground/85">{INTRO_HERO}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="cta" size="lg">
                <Link to="/contact">Être informé de l'ouverture</Link>
              </Button>
              <Button asChild variant="onDark" size="lg">
                <Link to="/formations/installateur-panneaux-photovoltaiques/programme">
                  Voir le programme
                </Link>
              </Button>
            </div>
            <div className="mt-8">
              <MiseAJourPv surFond />
            </div>
          </div>
          <VisuelPv cle="pv-hero" ratio="4/3" className="rounded-3xl shadow-elevated" priority />
        </div>
      </section>

      <section className="section-shell py-12">
        <StatutOuverturePv />
      </section>

      <section className="section-shell pb-4">
        <div className="max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-2xl font-semibold">En bref</h2>
          <p className="mt-3 leading-relaxed text-foreground/90">{EN_BREF}</p>
        </div>
      </section>

      <section className="section-shell py-14">
        <p className="eyebrow">Compétences visées</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">
          Ce que vous saurez faire
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Le référentiel {CERTIFICATION.code} « {CERTIFICATION.intitule} » décrit sept compétences.
          Le parcours est organisé pour les travailler une à une.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {COMPETENCES.map((c) => (
            <li key={c} className="flex items-start gap-3 rounded-xl border border-border/70 p-4">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <span className="text-sm leading-relaxed">{c}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-muted/60 py-14">
        <div className="section-shell grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Public</p>
            <h2 className="mt-3 text-3xl font-semibold">À qui s'adresse ce parcours</h2>
            <ul className="mt-6 grid gap-3 text-sm leading-relaxed">
              {AUDIENCE.map((a) => (
                <li key={a} className="flex gap-3">
                  <Users className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
          <VisuelPv cle="pv-salle" ratio="4/3" className="rounded-2xl shadow-soft" />
        </div>
      </section>

      <section className="section-shell py-14">
        <p className="eyebrow">Prérequis</p>
        <h2 className="mt-3 text-3xl font-semibold">Les prérequis en résumé</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card className="rounded-2xl border-border/70">
            <CardContent className="p-6">
              <h3 className="text-base font-semibold">Prérequis de la certification</h3>
              <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                {PREREQUIS_CERTIFICATION.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/70">
            <CardContent className="p-6">
              <h3 className="text-base font-semibold">
                Prérequis réglementaires, à obtenir hors parcours
              </h3>
              <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                {PREREQUIS_REGLEMENTAIRES.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-muted-foreground">
                L'habilitation relève de l'employeur et d'organismes spécialisés.
              </p>
            </CardContent>
          </Card>
        </div>
        <p className="mt-4 text-sm">
          <Link
            to="/formations/installateur-panneaux-photovoltaiques/prerequis-habilitations"
            className="font-medium text-primary underline underline-offset-4"
          >
            Détail des prérequis et des habilitations
          </Link>
        </p>
      </section>

      <section className="bg-muted/60 py-14">
        <div className="section-shell">
          <p className="eyebrow">Programme</p>
          <h2 className="mt-3 text-3xl font-semibold">
            Programme résumé : {MODULES.length} modules, {TOTAL_HEURES} h indicatives
          </h2>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <ol className="grid gap-2">
              {MODULES.map((m) => (
                <li
                  key={m.code}
                  className="flex items-baseline justify-between gap-4 rounded-xl border border-border/70 bg-card px-4 py-3 text-sm"
                >
                  <span>
                    <span className="font-semibold text-primary">{m.code}</span> · {m.titre}
                  </span>
                  <span className="shrink-0 text-muted-foreground">{m.heures} h</span>
                </li>
              ))}
            </ol>
            <VisuelPv cle="pv-pose-hauteur" ratio="4/5" className="rounded-2xl shadow-soft" />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Durées indicatives, à confirmer à l'ouverture du parcours.{" "}
            <Link
              to="/formations/installateur-panneaux-photovoltaiques/programme"
              className="font-medium text-primary underline underline-offset-4"
            >
              Voir le programme détaillé
            </Link>
          </p>
        </div>
      </section>

      <section className="section-shell py-14">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <VisuelPv cle="pv-plateau" ratio="4/3" className="rounded-2xl shadow-soft" />
          <div>
            <p className="eyebrow">Évaluation</p>
            <h2 className="mt-3 text-3xl font-semibold">Comment la certification est évaluée</h2>
            <p className="mt-3 text-sm text-muted-foreground">{EVALUATION.intro}</p>
            <ul className="mt-4 grid gap-2 text-sm">
              {EVALUATION.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <ClipboardCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">{EVALUATION.precision}</p>
          </div>
        </div>
      </section>

      <section className="bg-muted/60 py-14">
        <div className="section-shell">
          <p className="eyebrow">Financement</p>
          <h2 className="mt-3 text-3xl font-semibold">Financement : les pistes possibles</h2>
          <ul className="mt-6 grid gap-3 text-sm leading-relaxed sm:grid-cols-2">
            {CANAUX_FINANCEMENT.map((c) => (
              <li key={c.titre} className="rounded-xl border border-border/70 bg-card p-4">
                <span className="font-semibold">{c.titre}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Reste à charge CPF de {CPF_RESTE_A_CHARGE.montant} pour les dossiers déposés à partir du{" "}
            {CPF_RESTE_A_CHARGE.depuis}, pour les formations éligibles. Éligibilité de ce parcours à
            confirmer.{" "}
            <Link
              to="/formations/installateur-panneaux-photovoltaiques/financement"
              className="font-medium text-primary underline underline-offset-4"
            >
              Tout savoir sur le financement
            </Link>
          </p>
        </div>
      </section>

      <section className="section-shell py-14">
        <LimitesPv />
      </section>

      <section className="section-shell pb-6">
        <p className="eyebrow">Questions fréquentes</p>
        <h2 className="mt-3 text-3xl font-semibold">FAQ résumée</h2>
        <Accordion type="single" collapsible className="mt-6 max-w-3xl">
          {FAQ_PILIER.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-left text-base font-semibold">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="mt-4 flex items-center gap-2 text-sm">
          <FileText className="size-4 text-primary" aria-hidden />
          <Link
            to="/formations/installateur-panneaux-photovoltaiques/faq"
            className="font-medium text-primary underline underline-offset-4"
          >
            Toutes les questions fréquentes
          </Link>
        </p>
      </section>

      <LiensParcoursPv />
      <CtaInformationPv />
      <MentionsPv />
    </PublicLayout>
  );
}
