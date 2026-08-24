import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Calculator } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STATUTS = [
  {
    value: "salarie",
    label: "Salarié(e)",
    dispositifs: [
      "Plan de développement des compétences de votre employeur",
      "OPCO de votre branche professionnelle",
      "Projet de transition professionnelle (Transitions Pro)",
      "Reconversion ou promotion par alternance (Pro-A)",
    ],
  },
  {
    value: "independant",
    label: "Indépendant(e) / TNS",
    dispositifs: [
      "Fonds d'assurance formation : FIFPL, AGEFICE, FAFCEA, OCAPIAT",
      "Prise en charge partielle selon votre plafond annuel",
      "Solde autofinancé déductible de votre résultat",
    ],
  },
  {
    value: "dirigeant",
    label: "Dirigeant(e) / employeur",
    dispositifs: [
      "OPCO de votre entreprise (plan de développement des compétences)",
      "Budget formation de la structure",
      "Formation collective pour plusieurs collaborateurs",
    ],
  },
  {
    value: "demandeur",
    label: "En recherche d'emploi / transition",
    dispositifs: [
      "Aide Individuelle à la Formation (AIF)",
      "Dispositifs régionaux et projets de reconversion",
      "Cofinancement selon votre projet professionnel",
    ],
  },
] as const;

const euros = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function EvaluationBudget() {
  const [statut, setStatut] = useState<string>("salarie");
  const [heures, setHeures] = useState(14);
  const [tarif, setTarif] = useState(90);

  const selection = STATUTS.find((s) => s.value === statut) ?? STATUTS[0];

  const { cout, prise, reste } = useMemo(() => {
    const total = Math.max(0, heures) * Math.max(0, tarif);
    const taux = statut === "salarie" || statut === "dirigeant" ? 0.8 : 0.5;
    const priseEnCharge = Math.round(total * taux);
    return { cout: total, prise: priseEnCharge, reste: total - priseEnCharge };
  }, [heures, tarif, statut]);

  return (
    <Card id="budget" className="scroll-mt-24 rounded-3xl border-border/70 shadow-soft">
      <CardContent className="p-6 sm:p-8">
        <span className="inline-flex rounded-xl bg-accent p-3 text-accent-foreground">
          <Calculator className="size-5" aria-hidden />
        </span>
        <h3 className="mt-4 text-xl font-semibold">Évaluer mon budget formation</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Une estimation indicative de votre budget et des dispositifs mobilisables selon votre
          situation. Le chiffrage définitif est confirmé après votre entretien de cadrage.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <Label htmlFor="budget-statut">Votre situation</Label>
            <select
              id="budget-statut"
              value={statut}
              onChange={(event) => setStatut(event.target.value)}
              className="mt-2 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
            >
              {STATUTS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="budget-heures">Durée souhaitée (heures)</Label>
            <Input
              id="budget-heures"
              type="number"
              min={1}
              max={400}
              value={heures}
              onChange={(event) => setHeures(Number(event.target.value))}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="budget-tarif">Tarif horaire estimé (€ HT)</Label>
            <Input
              id="budget-tarif"
              type="number"
              min={20}
              max={500}
              value={tarif}
              onChange={(event) => setTarif(Number(event.target.value))}
              className="mt-2"
            />
          </div>
          <div className="rounded-2xl bg-muted/70 p-4">
            <p className="text-xs font-semibold text-secondary">Coût pédagogique estimé</p>
            <p className="mt-1 text-2xl font-semibold">{euros.format(cout)}</p>
            <p className="mt-1 text-xs text-muted-foreground">HT, hors frais annexes</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-cta/40 bg-cta/10 p-4">
            <p className="text-xs font-semibold">Prise en charge potentielle</p>
            <p className="mt-1 text-2xl font-semibold">{euros.format(prise)}</p>
          </div>
          <div className="rounded-2xl border border-border/70 p-4">
            <p className="text-xs font-semibold">Reste à financer estimé</p>
            <p className="mt-1 text-2xl font-semibold">{euros.format(reste)}</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold">Dispositifs à explorer pour vous</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {selection.dispositifs.map((d) => (
              <li key={d}>• {d}</li>
            ))}
          </ul>
        </div>

        <Button asChild variant="cta" className="mt-7">
          <Link to="/contact">Faire valider mon plan de financement</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
