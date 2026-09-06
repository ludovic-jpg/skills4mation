import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CertificationSelect } from "@/components/app/CertificationSelect";
import { Combobox, Field } from "@/components/dossier/fields";
import type { StepProps } from "@/components/dossier/steps/types";
import { calculerCommission, portageDepuisFinancement, tauxLabel } from "@/lib/commission";
import { OPCOS } from "@/lib/referentiels";
import { aDuPresentiel, euros, type DossierDonnees } from "@/lib/dossier/types";

const nombre = (v: string) => {
  const n = Number(String(v ?? "").replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

export function TarifsStep({ d, set, errors }: StepProps) {
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
      {d.tarifs.modeFinancement === "opco" &&
      d.formation.dateDebut &&
      d.formation.dateDebut >= "2026-10-01" ? (
        <p className="text-xs text-amber-600 sm:col-span-2">
          Formation démarrant à partir du 1er octobre 2026 : la subrogation de paiement (facture
          adressée directement à l'OPCO) est très restreinte à compter de cette date (réforme TVA).
          La facture ira très probablement à l'entreprise cliente, qui se fera ensuite rembourser
          par l'OPCO — prévenez le client dès maintenant pour éviter toute mauvaise surprise.
        </p>
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
        {d.tarifs.subrogation === "non" ? (
          <p className="text-xs text-amber-600">
            Sans subrogation, c'est l'entreprise cliente qui devra demander elle-même le
            remboursement à l'OPCO, sur la base des pièces transmises à la clôture du dossier.
          </p>
        ) : null}
      </div>
      <CertificationSelect
        value={d.tarifs.certificationCode}
        cpfUniquement={d.tarifs.modeFinancement === "cpf"}
        label="Certification visée (ICDL / Lilliate)"
        onChange={(c) =>
          set("tarifs", {
            certificationCode: c?.id ?? null,
            // Prix coûtant de la certification, toujours distinct du montant de formation.
            coutCertification: c ? String(c.prix_formateur_ttc) : "",
          })
        }
      />
      <Field
        label="Coût de la certification (€, ligne distincte, prix coûtant)"
        value={d.tarifs.coutCertification}
        onChange={() => undefined}
        readOnly
        hint="Renseigné automatiquement depuis la certification sélectionnée."
      />
      {errors["certification"] ? (
        <p className="text-xs text-destructive sm:col-span-2">{errors["certification"]}</p>
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
