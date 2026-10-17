import { createFileRoute, Link } from "@tanstack/react-router";

import { PublicLayout } from "@/components/site/PublicLayout";
import {
  CtaInformationPv,
  EntetePagePv,
  LiensParcoursPv,
  MentionsPv,
  StatutOuverturePv,
} from "@/components/site/PhotovoltaiqueBlocs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CANAUX_FINANCEMENT,
  CPF_RESTE_A_CHARGE,
  enTetePv,
  META_PV,
} from "@/data/formation-photovoltaique";

export const Route = createFileRoute(
  "/formations/installateur-panneaux-photovoltaiques/financement",
)({
  head: () => enTetePv(META_PV.financement),
  component: PageFinancement,
});

function PageFinancement() {
  return (
    <PublicLayout>
      <EntetePagePv
        meta={META_PV.financement}
        eyebrow="Formation installateur photovoltaïque"
        titre="Financer la formation de poseur de panneaux photovoltaïques"
        introduction="Les canaux de financement possibles selon votre situation. Aucun tarif n'est annoncé à ce jour et l'éligibilité au CPF reste à confirmer."
      />

      <section className="section-shell py-10">
        <StatutOuverturePv />
      </section>

      <section className="section-shell pb-10">
        <h2 className="text-2xl font-semibold sm:text-3xl">Les canaux de financement</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {CANAUX_FINANCEMENT.map((c) => (
            <Card key={c.titre} className="rounded-2xl border-border/70">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">{c.titre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.texte}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/60 py-14">
        <div className="section-shell max-w-3xl">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Le reste à charge CPF de {CPF_RESTE_A_CHARGE.montant}
          </h2>
          <p className="mt-4 text-sm leading-relaxed">{CPF_RESTE_A_CHARGE.texte}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Ce reste à charge ne s'applique que si la formation est éligible au CPF, ce qui reste à
            confirmer pour ce parcours. Les règles évoluant, vérifiez votre situation et le montant
            applicable sur{" "}
            <a
              href={CPF_RESTE_A_CHARGE.verification}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-4"
            >
              moncompteformation.gouv.fr
            </a>
            .
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Source :{" "}
            <a
              href={CPF_RESTE_A_CHARGE.source}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-4"
            >
              {CPF_RESTE_A_CHARGE.sourceLibelle}
            </a>
            .
          </p>
        </div>
      </section>

      <section className="section-shell py-14">
        <div className="flex flex-col gap-4 rounded-2xl border border-border p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Estimer vos droits à la formation</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Notre outil vous aide à évaluer vos droits et votre budget formation (CPF, OPCO).
            </p>
          </div>
          <Button asChild variant="cta">
            <Link to="/evaluer-droit-formation">Estimer mes droits</Link>
          </Button>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Tarif et dates : nous contacter. Un financement n'est jamais garanti à l'avance : il
          dépend de votre situation et de l'accord du financeur.
        </p>
      </section>

      <LiensParcoursPv courante="/formations/installateur-panneaux-photovoltaiques/financement" />
      <CtaInformationPv />
      <MentionsPv />
    </PublicLayout>
  );
}
