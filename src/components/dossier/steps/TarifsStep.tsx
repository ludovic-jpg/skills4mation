import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox, Field, Toggle } from "@/components/dossier/fields";
import type { StepProps } from "@/components/dossier/steps/types";
import { calculerCommission, portageDepuisFinancement, tauxLabel } from "@/lib/commission";
import { OPCOS } from "@/lib/referentiels";
import {
  TARIF_CERTIFICATION_ICDL,
  aDuPresentiel,
  euros,
  type DossierDonnees,
} from "@/lib/dossier/types";

const nombre = (v: string) => {
  const n = Number(String(v ?? "").replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

export function TarifsStep({ d, set }: StepProps) {
  /** Prix total = prix unitaire × nombre de stagiaires (calcul automatique, HT). */
  function setTarif(patch: Partial<DossierDonnees["tarifs"]>) {
    const suivant = { ...d.tarifs, ...patch };
    const total = nombre(suivant.prixUnitaire) * nombre(suivant.nbStagiaires);
    set("tarifs", { ...patch, prixTotal: total > 0 ? String(total) : "" });
  }

  const portage = portageDepuisFinancement(d.tarifs.modeFinancement);
  const calcul = calculerCommission({
    montant: nombre(d.tarifs.prixTotal),
    portage,
    coutCertification: nombre(d.tarifs.coutCertification),
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <p className="text-xs text-muted-foreground sm:col-span-2">
        Les actions de formation sont exonérées de TVA : tous les montants saisis sont en euros HT.
      </p>
      <div className="grid gap-2">
        <Label>Mode de financement</Label>
        <Select
          value={d.tarifs.modeFinancement}
          onValueChange={(v) =>
            set("tarifs", { modeFinancement: v as DossierDonnees["tarifs"]["modeFinancement"] })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="opco">OPCO / entreprise</SelectItem>
            <SelectItem value="cpf">CPF</SelectItem>
            <SelectItem value="fonds_propres">Fonds propres</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {d.tarifs.modeFinancement === "opco" ? (
        <Combobox
          label="OPCO / financeur"
          value={d.tarifs.opco}
          onChange={(v) => set("tarifs", { opco: v })}
          options={OPCOS}
          placeholder="Rechercher un OPCO…"
        />
      ) : null}
      <Field
        label="Montant pris en charge (€ HT)"
        value={d.tarifs.montantPrisEnCharge}
        onChange={(v) => set("tarifs", { montantPrisEnCharge: v })}
      />
      <Field
        label="Prix unitaire par stagiaire (€ HT)"
        value={d.tarifs.prixUnitaire}
        onChange={(v) => setTarif({ prixUnitaire: v })}
      />
      <Field
        label="Nombre de stagiaires"
        value={d.tarifs.nbStagiaires}
        onChange={(v) => setTarif({ nbStagiaires: v })}
      />
      <Field
        label="Prix total (€ HT)"
        value={d.tarifs.prixTotal}
        onChange={() => undefined}
        readOnly
        hint="Calculé automatiquement : prix unitaire × nombre de stagiaires."
      />
      {d.formation.format !== "distanciel" ? (
        <Field
          label="Dont prix en présentiel (€ HT, facultatif)"
          value={d.tarifs.prixPresentiel}
          onChange={(v) => set("tarifs", { prixPresentiel: v })}
        />
      ) : null}
      <div className="grid gap-2">
        <Label>Subrogation de paiement</Label>
        <Select
          value={d.tarifs.subrogation}
          onValueChange={(v) =>
            set("tarifs", { subrogation: v as DossierDonnees["tarifs"]["subrogation"] })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="non">Non</SelectItem>
            <SelectItem value="oui">Oui</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Toggle
        label="Certification ICDL visée pour la session"
        checked={d.tarifs.certificationIcdl}
        onChange={(v) =>
          set("tarifs", {
            certificationIcdl: v,
            // Pré-remplissage au tarif de référence, jamais fusionné avec le montant pris en charge.
            coutCertification: v ? d.tarifs.coutCertification || TARIF_CERTIFICATION_ICDL : "",
          })
        }
        className="sm:col-span-2"
      />
      {d.tarifs.certificationIcdl ? (
        <Field
          label="Coût de la certification (€, ligne distincte, prix coûtant)"
          value={d.tarifs.coutCertification}
          onChange={(v) => set("tarifs", { coutCertification: v })}
        />
      ) : null}

      <div className="rounded-xl border border-border/70 bg-muted/40 p-4 text-sm sm:col-span-2">
        <p className="font-semibold">
          Portage {portage === "cpf" ? "CPF" : "Qualiopi"} — commission {tauxLabel(calcul.taux)}
        </p>
        <dl className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-3">
          <div>
            <dt>Base commissionnable</dt>
            <dd className="font-semibold text-foreground">{euros(String(calcul.base))}</dd>
          </div>
          <div>
            <dt>Commission Skills4mation</dt>
            <dd className="font-semibold text-foreground">{euros(String(calcul.commission))}</dd>
          </div>
          <div>
            <dt>Net formateur estimé</dt>
            <dd className="font-semibold text-foreground">{euros(String(calcul.netFormateur))}</dd>
          </div>
        </dl>
        {calcul.coutCertification > 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            + certification {euros(String(calcul.coutCertification))} répercutée au prix coûtant
            (hors commission).
          </p>
        ) : null}
      </div>

      <Field
        label="Lieu de signature de la convention"
        value={d.convention.lieu}
        onChange={(v) => set("convention", { lieu: v })}
      />
      <Field
        label="Date de la convention"
        type="date"
        value={d.convention.date}
        onChange={(v) => set("convention", { date: v })}
      />
      {!aDuPresentiel(d) ? (
        <p className="text-xs text-muted-foreground sm:col-span-2">
          Sans heures en présentiel, la mention « Dont prix en présentiel » est retirée de la
          convention.
        </p>
      ) : null}
    </div>
  );
}
