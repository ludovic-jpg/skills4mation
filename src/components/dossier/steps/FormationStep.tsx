import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Area, Field } from "@/components/dossier/fields";
import type { StepProps } from "@/components/dossier/steps/types";
import { appliquerFormation, type FormationCatalogue } from "@/lib/formations";
import type { DossierDonnees } from "@/lib/dossier/types";

/**
 * Le numéro ADF est attribué par Skills4mation à la validation du dossier :
 * il n'est jamais saisi ni modifié par le formateur.
 */
function AdfField({ d }: { d: DossierDonnees }) {
  const attribueLe = d.adfAttribueLe
    ? new Date(d.adfAttribueLe).toLocaleDateString("fr-FR")
    : null;
  return (
    <div className="grid gap-1.5">
      <Label>Numéro ADF</Label>
      {d.adf ? (
        <>
          <p className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-semibold">
            {d.adf}
          </p>
          <p className="text-xs text-muted-foreground">
            Numéro attribué par Skills4mation{attribueLe ? ` le ${attribueLe}` : ""}.
          </p>
        </>
      ) : (
        <p className="rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
          Numéro ADF en attente de validation
        </p>
      )}
    </div>
  );
}

export function FormationStep({
  d,
  setD,
  set,
  errors,
  modeles = [],
}: StepProps & { modeles?: FormationCatalogue[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {modeles.length ? (
        <div className="grid gap-2 rounded-xl border border-secondary/40 bg-secondary/5 p-4 sm:col-span-2">
          <Label>Reprendre une de mes formations préenregistrées</Label>
          <Select
            value=""
            onValueChange={(id) => {
              const modele = modeles.find((m) => m.id === id);
              if (modele) setD((prev) => appliquerFormation(modele, prev));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir une formation…" />
            </SelectTrigger>
            <SelectContent>
              {modeles.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.titre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Titre, objectifs, durée, modalités, tarifs et visuel sont préremplis automatiquement.
          </p>
        </div>
      ) : null}
      <AdfField d={d} />
      <Field
        label="Organisme de formation"
        value={d.organisme}
        onChange={(v) => setD({ ...d, organisme: v })}
      />
      <Field
        label="Titre de la formation"
        value={d.formation.titre}
        onChange={(v) => set("formation", { titre: v })}
        error={errors["titre"]}
        className="sm:col-span-2"
      />
      <Area
        label="Objectifs pédagogiques"
        value={d.formation.objectifs}
        onChange={(v) => set("formation", { objectifs: v })}
        className="sm:col-span-2"
      />
      <Field
        label="Niveau"
        value={d.formation.niveau}
        onChange={(v) => set("formation", { niveau: v })}
      />
      <Field
        label="Prérequis"
        value={d.formation.prerequis}
        onChange={(v) => set("formation", { prerequis: v })}
      />
      <Field
        label="Date de démarrage"
        type="date"
        value={d.formation.dateDebut}
        onChange={(v) => set("formation", { dateDebut: v })}
        error={errors["dateDebut"]}
      />
      <Field
        label="Date de fin"
        type="date"
        value={d.formation.dateFin}
        onChange={(v) => set("formation", { dateFin: v })}
        error={errors["dateFin"]}
      />
      <Field
        label="Durée totale (heures)"
        value={d.formation.heuresTotal}
        onChange={(v) => set("formation", { heuresTotal: v })}
        error={errors["heuresTotal"]}
      />
      <Field
        label="Nombre de jours"
        value={d.formation.nbJours}
        onChange={(v) => set("formation", { nbJours: v })}
      />
      <div className="grid gap-2">
        <Label>Modalité</Label>
        <Select
          value={d.formation.format}
          onValueChange={(v) =>
            set("formation", { format: v as DossierDonnees["formation"]["format"] })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="presentiel">Présentiel</SelectItem>
            <SelectItem value="distanciel">Distanciel</SelectItem>
            <SelectItem value="mixte">Mixte</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {d.formation.format !== "distanciel" ? (
        <Field
          label="Dont heures en présentiel"
          value={d.formation.heuresPresentiel}
          onChange={(v) => set("formation", { heuresPresentiel: v })}
        />
      ) : null}
      {d.formation.format !== "presentiel" ? (
        <Field
          label="Lien de connexion (visio / Workspace)"
          value={d.formation.lienConnexion}
          onChange={(v) => set("formation", { lienConnexion: v })}
          error={errors["lienConnexion"]}
          className="sm:col-span-2"
        />
      ) : null}
      <Field
        label="Lieu de la formation"
        value={d.lieu.intitule}
        onChange={(v) => set("lieu", { intitule: v })}
      />
      <Field
        label="SIRET du lieu"
        value={d.lieu.siret}
        onChange={(v) => set("lieu", { siret: v })}
      />
      <Field
        label="Adresse du lieu"
        value={d.lieu.adresse}
        onChange={(v) => set("lieu", { adresse: v })}
        className="sm:col-span-2"
      />
      <div className="grid gap-4 sm:col-span-2">
        <h3 className="text-sm font-semibold">Recueil des besoins</h3>
        <Area
          label="Contexte et enjeux"
          value={d.besoins.contexte}
          onChange={(v) => set("besoins", { contexte: v })}
        />
        <Area
          label="Attentes et objectifs opérationnels"
          value={d.besoins.attentes}
          onChange={(v) => set("besoins", { attentes: v })}
        />
        <Area
          label="Niveau de départ des participants"
          value={d.besoins.niveauDepart}
          onChange={(v) => set("besoins", { niveauDepart: v })}
        />
        <Area
          label="Contraintes (organisation, matériel, accessibilité)"
          value={d.besoins.contraintes}
          onChange={(v) => set("besoins", { contraintes: v })}
        />
        <Area
          label="Modalités d'évaluation retenues"
          value={d.besoins.modalitesEvaluation}
          onChange={(v) => set("besoins", { modalitesEvaluation: v })}
        />
      </div>
    </div>
  );
}
