import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, Toggle } from "@/components/dossier/fields";
import type { StepProps } from "@/components/dossier/steps/types";
import { TARIF_CERTIFICATION_ICDL, aDuPresentiel, type DossierDonnees } from "@/lib/dossier/types";

export function TarifsStep({ d, set }: StepProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
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
        <Field
          label="OPCO / financeur"
          value={d.tarifs.opco}
          onChange={(v) => set("tarifs", { opco: v })}
        />
      ) : null}
      <Field
        label="Montant pris en charge (€)"
        value={d.tarifs.montantPrisEnCharge}
        onChange={(v) => set("tarifs", { montantPrisEnCharge: v })}
      />
      <Field
        label="Prix unitaire par stagiaire (€)"
        value={d.tarifs.prixUnitaire}
        onChange={(v) => set("tarifs", { prixUnitaire: v })}
      />
      <Field
        label="Nombre de stagiaires"
        value={d.tarifs.nbStagiaires}
        onChange={(v) => set("tarifs", { nbStagiaires: v })}
      />
      <Field
        label="Prix total (€)"
        value={d.tarifs.prixTotal}
        onChange={(v) => set("tarifs", { prixTotal: v })}
      />
      {d.formation.format !== "distanciel" ? (
        <Field
          label="Dont prix en présentiel (€, facultatif)"
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
          label="Coût de la certification (€, ligne distincte)"
          value={d.tarifs.coutCertification}
          onChange={(v) => set("tarifs", { coutCertification: v })}
        />
      ) : null}
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

      <h3 className="text-sm font-semibold sm:col-span-2">Facture formateur (F9)</h3>
      <Field
        label="Numéro de facture"
        value={d.facture.numero}
        onChange={(v) => set("facture", { numero: v })}
      />
      <Field
        label="Date de facture"
        type="date"
        value={d.facture.date}
        onChange={(v) => set("facture", { date: v })}
      />
      <Field
        label="Montant HT (€)"
        value={d.facture.montantHt}
        onChange={(v) => set("facture", { montantHt: v })}
      />
      <Field label="TVA (%)" value={d.facture.tva} onChange={(v) => set("facture", { tva: v })} />
      <Field
        label="Montant TTC (€)"
        value={d.facture.montantTtc}
        onChange={(v) => set("facture", { montantTtc: v })}
      />
      <Field label="IBAN" value={d.facture.iban} onChange={(v) => set("facture", { iban: v })} />
    </div>
  );
}
