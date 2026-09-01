import { EntrepriseNomField } from "@/components/dossier/SuggestionFields";
import { Field } from "@/components/dossier/fields";
import type { StepProps } from "@/components/dossier/steps/types";

export function EntrepriseStep({ d, set, errors }: StepProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <EntrepriseNomField
        value={d.entreprise.nom}
        onChange={(v) => set("entreprise", { nom: v })}
        onSelect={(e) =>
          set("entreprise", {
            nom: e.nom,
            nomCommercial: e.nom_commercial ?? "",
            adresse: e.adresse ?? "",
            siret: e.siret ?? "",
            prenomRepresentant: e.prenom_contact ?? "",
            nomRepresentant: e.nom_contact ?? "",
            telephone: e.telephone ?? "",
            email: e.email ?? "",
          })
        }
        error={errors["entrepriseNom"]}
      />
      <Field
        label="Nom commercial"
        value={d.entreprise.nomCommercial}
        onChange={(v) => set("entreprise", { nomCommercial: v })}
      />
      <Field
        label="SIRET"
        value={d.entreprise.siret}
        onChange={(v) => set("entreprise", { siret: v })}
        error={errors["siret"]}
      />
      <Field
        label="Téléphone"
        value={d.entreprise.telephone}
        onChange={(v) => set("entreprise", { telephone: v })}
      />
      <Field
        label="Adresse de l'entreprise"
        value={d.entreprise.adresse}
        onChange={(v) => set("entreprise", { adresse: v })}
        className="sm:col-span-2"
      />
      <Field
        label="Prénom du représentant légal"
        value={d.entreprise.prenomRepresentant}
        onChange={(v) => set("entreprise", { prenomRepresentant: v })}
      />
      <Field
        label="Nom du représentant légal"
        value={d.entreprise.nomRepresentant}
        onChange={(v) => set("entreprise", { nomRepresentant: v })}
      />
      <Field
        label="E-mail du contact"
        value={d.entreprise.email}
        onChange={(v) => set("entreprise", { email: v })}
        error={errors["entrepriseEmail"]}
      />
    </div>
  );
}
