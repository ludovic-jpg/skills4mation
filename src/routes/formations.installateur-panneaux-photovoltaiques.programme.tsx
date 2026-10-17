import { createFileRoute } from "@tanstack/react-router";

import { PublicLayout } from "@/components/site/PublicLayout";
import {
  CtaInformationPv,
  EntetePagePv,
  LiensParcoursPv,
  LimitesPv,
  MentionsPv,
  StatutOuverturePv,
  VisuelPv,
} from "@/components/site/PhotovoltaiqueBlocs";
import { Card, CardContent } from "@/components/ui/card";
import {
  CERTIFICATION,
  COMPETENCES,
  enTetePv,
  EVALUATION,
  META_PV,
  MODULES,
  TOTAL_HEURES,
} from "@/data/formation-photovoltaique";

export const Route = createFileRoute("/formations/installateur-panneaux-photovoltaiques/programme")(
  {
    head: () => enTetePv(META_PV.programme),
    component: PageProgramme,
  },
);

function PageProgramme() {
  return (
    <PublicLayout>
      <EntetePagePv
        meta={META_PV.programme}
        eyebrow="Formation installateur photovoltaïque"
        titre="Programme de la formation installateur de panneaux photovoltaïques"
        introduction={`${MODULES.length} modules, ${TOTAL_HEURES} heures indicatives, organisés autour des sept compétences du référentiel ${CERTIFICATION.code}.`}
      />

      <section className="section-shell py-10">
        <StatutOuverturePv />
      </section>

      <section className="section-shell pb-12">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="grid gap-4">
            {MODULES.map((m) => (
              <Card key={m.code} className="rounded-2xl border-border/70">
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-xl font-semibold">
                      <span className="text-primary">{m.code}</span> · {m.titre}
                    </h2>
                    <span className="rounded-full bg-accent px-3 py-1 text-sm font-medium">
                      {m.heures} h (indicatif)
                    </span>
                  </div>
                  {m.competence ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Compétence travaillée : {m.competence}
                    </p>
                  ) : null}
                  <ul className="mt-3 grid list-disc gap-1.5 pl-5 text-sm text-muted-foreground">
                    {m.objectifs.map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
            <p className="rounded-xl bg-muted/60 p-4 text-sm font-medium">
              Total indicatif : {TOTAL_HEURES} heures. Durées à confirmer à l'ouverture du parcours.
            </p>
          </div>
          <aside className="grid content-start gap-6">
            <VisuelPv cle="pv-cablage" ratio="4/5" className="rounded-2xl shadow-soft" />
            <VisuelPv cle="pv-pose-hauteur" ratio="4/3" className="rounded-2xl shadow-soft" />
          </aside>
        </div>
      </section>

      <section className="bg-muted/60 py-14">
        <div className="section-shell max-w-4xl">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Les sept compétences du référentiel
          </h2>
          <ol className="mt-6 grid list-decimal gap-2 pl-6 text-sm leading-relaxed">
            {COMPETENCES.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ol>
          <h2 className="mt-10 text-2xl font-semibold sm:text-3xl">Évaluation</h2>
          <p className="mt-3 text-sm text-muted-foreground">{EVALUATION.intro}</p>
          <ul className="mt-3 grid list-disc gap-1.5 pl-5 text-sm">
            {EVALUATION.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Source : France Compétences,{" "}
            <a
              href={CERTIFICATION.source}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-4"
            >
              fiche {CERTIFICATION.code}
            </a>
            . Enregistrée au Répertoire spécifique jusqu'au {CERTIFICATION.finEnregistrement}{" "}
            (dernière délivrance possible le {CERTIFICATION.derniereDelivrance}), voie d'accès :{" "}
            {CERTIFICATION.voieAcces.toLowerCase()}. Certificateur : {CERTIFICATION.certificateur}.
          </p>
        </div>
      </section>

      <section className="section-shell py-14">
        <LimitesPv />
      </section>

      <LiensParcoursPv courante="/formations/installateur-panneaux-photovoltaiques/programme" />
      <CtaInformationPv />
      <MentionsPv />
    </PublicLayout>
  );
}
