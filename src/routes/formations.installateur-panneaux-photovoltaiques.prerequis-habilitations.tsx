import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import { PublicLayout } from "@/components/site/PublicLayout";
import {
  CtaInformationPv,
  EntetePagePv,
  LiensParcoursPv,
  LimitesPv,
  MentionsPv,
  StatutOuverturePv,
} from "@/components/site/PhotovoltaiqueBlocs";
import { Card, CardContent } from "@/components/ui/card";
import {
  enTetePv,
  META_PV,
  NOTE_HABILITATION,
  PREREQUIS_CERTIFICATION,
  PREREQUIS_REGLEMENTAIRES,
} from "@/data/formation-photovoltaique";

export const Route = createFileRoute(
  "/formations/installateur-panneaux-photovoltaiques/prerequis-habilitations",
)({
  head: () => enTetePv(META_PV.prerequis),
  component: PagePrerequis,
});

function PagePrerequis() {
  return (
    <PublicLayout>
      <EntetePagePv
        meta={META_PV.prerequis}
        eyebrow="Formation installateur photovoltaïque"
        titre="Prérequis et habilitations pour devenir poseur de panneaux photovoltaïques"
        introduction="Deux séries de conditions : celles de la certification RS7340, et celles qui relèvent de la réglementation et de l'employeur."
      />

      <section className="section-shell py-10">
        <StatutOuverturePv />
      </section>

      <section className="section-shell pb-10">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-2xl border-border/70">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold">Prérequis de la certification</h2>
              <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                {PREREQUIS_CERTIFICATION.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                Un module de positionnement (M0, 3 h indicatives) permet de faire le point avant
                d'entrer dans le parcours.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/70">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold">Prérequis réglementaires</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                À obtenir avant le parcours ou en parallèle. Ils ne font pas partie du programme.
              </p>
              <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                {PREREQUIS_REGLEMENTAIRES.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-accent p-5 text-sm leading-relaxed">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <p>{NOTE_HABILITATION}</p>
        </div>
      </section>

      <section className="section-shell py-10">
        <LimitesPv />
      </section>

      <LiensParcoursPv courante="/formations/installateur-panneaux-photovoltaiques/prerequis-habilitations" />
      <CtaInformationPv />
      <MentionsPv />
    </PublicLayout>
  );
}
