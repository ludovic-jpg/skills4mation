import { Link } from "@tanstack/react-router";

import { Field, Toggle } from "@/components/dossier/fields";
import type { StepProps } from "@/components/dossier/steps/types";

export function FormateurStep({ d, set, errors }: StepProps) {
  return (
    <div className="grid gap-6">
      <p className="text-xs text-muted-foreground">
        Entreprise, adresse, SIRET, NDA et région proviennent de votre profil formateur.{" "}
        <Link to="/espace/profil" className="font-semibold underline">
          Modifier dans mon profil
        </Link>
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Prénom du formateur"
          value={d.formateur.prenom}
          onChange={(v) => set("formateur", { prenom: v })}
        />
        <Field
          label="Nom du formateur"
          value={d.formateur.nom}
          onChange={(v) => set("formateur", { nom: v })}
          error={errors["formateurNom"]}
        />
        <Field
          label="E-mail"
          value={d.formateur.email}
          onChange={(v) => set("formateur", { email: v })}
          error={errors["formateurEmail"]}
        />
        <Field
          label="Téléphone"
          value={d.formateur.telephone}
          onChange={(v) => set("formateur", { telephone: v })}
        />
        <Field
          label="Entreprise du formateur"
          value={d.formateur.entreprise}
          onChange={(v) => set("formateur", { entreprise: v })}
          readOnly
        />
        <Field
          label="SIRET du formateur"
          value={d.formateur.siret}
          onChange={(v) => set("formateur", { siret: v })}
          readOnly
        />
        <Field
          label="Adresse du formateur"
          value={d.formateur.adresse}
          onChange={(v) => set("formateur", { adresse: v })}
          readOnly
          className="sm:col-span-2"
        />
        <Field
          label="Numéro de déclaration d'activité"
          value={d.formateur.nda}
          onChange={(v) => set("formateur", { nda: v })}
          readOnly
        />
        <Field
          label="Région du NDA"
          value={d.formateur.ndaRegion}
          onChange={(v) => set("formateur", { ndaRegion: v })}
          readOnly
        />
        <Field
          label="Coût horaire (€)"
          value={d.formateur.coutHoraire}
          onChange={(v) => set("formateur", { coutHoraire: v })}
        />
        <Field
          label="Total recette mission (€)"
          value={d.formateur.totalRecette}
          onChange={(v) => set("formateur", { totalRecette: v })}
        />
        <Field
          label="Date d'ouverture de mission"
          type="date"
          value={d.formateur.dateMissionOuverte}
          onChange={(v) => set("formateur", { dateMissionOuverte: v })}
        />
        <Toggle
          label="Le lien de connexion (Workspace / visio) est créé et fourni sous la responsabilité du formateur"
          checked={d.formation.lienResponsableFormateur}
          onChange={(v) => set("formation", { lienResponsableFormateur: v })}
          className="sm:col-span-2"
        />
      </div>
    </div>
  );
}
