import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const COMMISSION = 0.2;
const ABONNEMENT = 99;

const euro = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);

export function SimulateurCommission() {
  const [montant, setMontant] = useState(3000);
  const base = Number.isFinite(montant) && montant > 0 ? montant : 0;
  const commission = base * COMMISSION;
  const net = base - commission;

  return (
    <Card id="simulateur" className="rounded-3xl border-border/70 shadow-soft">
      <CardContent className="p-6 sm:p-8">
        <h3 className="text-xl font-semibold">Simuler ma rémunération</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Indiquez le montant HT que vous facturez pour votre formation.
        </p>

        <div className="mt-6 max-w-xs">
          <Label htmlFor="montant-formation">Montant de la formation (€ HT)</Label>
          <Input
            id="montant-formation"
            type="number"
            min={0}
            step={100}
            inputMode="numeric"
            value={Number.isNaN(montant) ? "" : montant}
            onChange={(event) => setMontant(event.target.valueAsNumber)}
            className="mt-2"
          />
        </div>

        <dl className="mt-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-muted/70 p-4">
            <dt className="text-xs text-muted-foreground">Chiffre d'affaires HT</dt>
            <dd className="mt-1 text-2xl font-semibold">{euro(base)}</dd>
          </div>
          <div className="rounded-2xl bg-muted/70 p-4">
            <dt className="text-xs text-muted-foreground">Commission Skills4mation (20 %)</dt>
            <dd className="mt-1 text-2xl font-semibold">{euro(commission)}</dd>
          </div>
          <div className="rounded-2xl bg-gradient-teal p-4 text-primary-foreground">
            <dt className="text-xs text-primary-foreground/85">Reversé au formateur</dt>
            <dd className="mt-1 text-2xl font-semibold text-primary-foreground">{euro(net)}</dd>
          </div>
        </dl>

        <p className="mt-4 text-xs text-muted-foreground">
          Abonnement plateforme de {euro(ABONNEMENT)} HT/an facturé séparément. Aucun frais caché.
        </p>
      </CardContent>
    </Card>
  );
}
