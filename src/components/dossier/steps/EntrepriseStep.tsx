import { SiretAutocomplete, toastChampsRemplis } from "@/components/app/SiretAutocomplete";
import { EntrepriseNomField } from "@/components/dossier/SuggestionFields";
import { Field } from "@/components/dossier/fields";
import type { StepProps } from "@/components/dossier/steps/types";
import type { DossierDonnees } from "@/lib/dossier/types";
import type { EntrepriseTrouvee } from "@/lib/entreprises";

export function EntrepriseStep({ d, set, errors }: StepProps) {
  /** Reprend les informations INSEE de l'établissement choisi dans les champs existants. */
  function remplirDepuisInsee(e: EntrepriseTrouvee) {
    const patch: Partial<DossierDonnees["entreprise"]> = { siret: e.siret };
    const champs = ["SIRET"];
    if (e.raisonSociale) {
      patch.nom = e.raisonSociale;
      champs.push("raison sociale");
    }
    if (e.nomCommercial) {
      patch.nomCommercial = e.nomCommercial;
      champs.push("nom commercial");
    }
    if (e.adresseComplete) {
      patch.adresse = e.adresseComplete;
      champs.push("adresse");
    }
    // Le représentant légal n'est proposé que si rien n'a encore été saisi.
    const representantVide =
      !d.entreprise.prenomRepresentant.trim() && !d.entreprise.nomRepresentant.trim();
    if (e.dirigeant && representantVide) {
      patch.prenomRepresentant = e.dirigeant.prenom;
      patch.nomRepresentant = e.dirigeant.nom;
      champs.push(`représentant légal (${e.dirigeant.qualite ?? "dirigeant"})`);
    }
    set("entreprise", patch);
    toastChampsRemplis(e, champs);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <SiretAutocomplete
        value={d.entreprise.siret}
        onChange={(v) => set("entreprise", { siret: v })}
        onSelect={remplirDepuisInsee}
        error={errors["siret"]}
        hint="Saisissez le SIRET (ou le nom) de l'entreprise cliente : la fiche se remplit depuis l'annuaire officiel."
        className="sm:col-span-2"
      />
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
