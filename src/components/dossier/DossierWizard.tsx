import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { DossierDonnees } from "@/lib/dossier/types";

type Props = {
  value: DossierDonnees;
  saving?: boolean;
  onSave: (donnees: DossierDonnees) => void;
};

const ETAPES = [
  "Dossier & entreprise",
  "Formation & lieu",
  "Apprenants",
  "Sessions",
  "Tarifs & financement",
  "Formateur",
  "Recueil des besoins",
];

export function DossierWizard({ value, saving, onSave }: Props) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<DossierDonnees>(value);

  function set<K extends keyof DossierDonnees>(key: K, patch: Partial<DossierDonnees[K]>) {
    setD((prev) => ({ ...prev, [key]: { ...(prev[key] as object), ...patch } }) as DossierDonnees);
  }

  return (
    <Card className="rounded-2xl border-border/70 shadow-soft">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Formulaire unique du dossier</h2>
            <p className="text-sm text-muted-foreground">
              Étape {step + 1}/{ETAPES.length} — {ETAPES[step]}
            </p>
          </div>
          <Button variant="cta" disabled={saving} onClick={() => onSave(d)}>
            <Save className="mr-1.5 size-4" />
            {saving ? "Enregistrement…" : "Enregistrer les variables"}
          </Button>
        </div>
        <Progress value={((step + 1) / ETAPES.length) * 100} className="mt-4" />

        <div className="mt-6 grid gap-4">
          {step === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Numéro ADF" value={d.adf} onChange={(v) => setD({ ...d, adf: v })} />
              <Field
                label="Raison sociale"
                value={d.entreprise.nom}
                onChange={(v) => set("entreprise", { nom: v })}
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
              />
              <Field
                label="Adresse de l'entreprise"
                value={d.entreprise.adresse}
                onChange={(v) => set("entreprise", { adresse: v })}
                className="sm:col-span-2"
              />
              <Field
                label="Prénom du représentant"
                value={d.entreprise.prenomRepresentant}
                onChange={(v) => set("entreprise", { prenomRepresentant: v })}
              />
              <Field
                label="Nom du représentant"
                value={d.entreprise.nomRepresentant}
                onChange={(v) => set("entreprise", { nomRepresentant: v })}
              />
              <Field
                label="Téléphone"
                value={d.entreprise.telephone}
                onChange={(v) => set("entreprise", { telephone: v })}
              />
              <Field
                label="E-mail"
                value={d.entreprise.email}
                onChange={(v) => set("entreprise", { email: v })}
              />
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
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Titre de la formation"
                value={d.formation.titre}
                onChange={(v) => set("formation", { titre: v })}
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
              />
              <Field
                label="Date de fin"
                type="date"
                value={d.formation.dateFin}
                onChange={(v) => set("formation", { dateFin: v })}
              />
              <Field
                label="Durée totale (heures)"
                value={d.formation.heuresTotal}
                onChange={(v) => set("formation", { heuresTotal: v })}
              />
              <Field
                label="Dont présentiel (heures, optionnel)"
                value={d.formation.heuresPresentiel}
                onChange={(v) => set("formation", { heuresPresentiel: v })}
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
              <Field
                label="Lien de connexion (distanciel)"
                value={d.formation.lienConnexion}
                onChange={(v) => set("formation", { lienConnexion: v })}
              />
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
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-3">
              <p className="text-sm text-muted-foreground">
                Jusqu'à 8 apprenants sont injectés dans la convention et l'ordre de mission, 5 par
                feuille d'émargement.
              </p>
              {d.apprenants.map((a, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <Input
                    placeholder={`Prénom et nom (apprenant ${i + 1})`}
                    value={a.nom}
                    onChange={(e) =>
                      setD({
                        ...d,
                        apprenants: d.apprenants.map((x, j) =>
                          j === i ? { ...x, nom: e.target.value } : x,
                        ),
                      })
                    }
                  />
                  <Input
                    placeholder="Poste / fonction"
                    value={a.poste}
                    onChange={(e) =>
                      setD({
                        ...d,
                        apprenants: d.apprenants.map((x, j) =>
                          j === i ? { ...x, poste: e.target.value } : x,
                        ),
                      })
                    }
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      setD({ ...d, apprenants: d.apprenants.filter((_, j) => j !== i) })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                className="justify-self-start"
                onClick={() =>
                  setD({ ...d, apprenants: [...d.apprenants, { nom: "", poste: "" }] })
                }
              >
                <Plus className="mr-1.5 size-4" /> Ajouter un apprenant
              </Button>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-3">
              <p className="text-sm text-muted-foreground">
                Jusqu'à 20 sessions : elles alimentent le planning, les convocations et les feuilles
                d'émargement.
              </p>
              {d.sessions.map((sess, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                  <Input
                    type="date"
                    value={sess.date}
                    onChange={(e) =>
                      setD({
                        ...d,
                        sessions: d.sessions.map((x, j) =>
                          j === i ? { ...x, date: e.target.value } : x,
                        ),
                      })
                    }
                  />
                  <Input
                    type="time"
                    value={sess.heureDebut}
                    onChange={(e) =>
                      setD({
                        ...d,
                        sessions: d.sessions.map((x, j) =>
                          j === i ? { ...x, heureDebut: e.target.value } : x,
                        ),
                      })
                    }
                  />
                  <Input
                    type="time"
                    value={sess.heureFin}
                    onChange={(e) =>
                      setD({
                        ...d,
                        sessions: d.sessions.map((x, j) =>
                          j === i ? { ...x, heureFin: e.target.value } : x,
                        ),
                      })
                    }
                  />
                  <Input
                    placeholder="Lieu (optionnel)"
                    value={sess.lieu ?? ""}
                    onChange={(e) =>
                      setD({
                        ...d,
                        sessions: d.sessions.map((x, j) =>
                          j === i ? { ...x, lieu: e.target.value } : x,
                        ),
                      })
                    }
                  />
                  <Button
                    variant="outline"
                    onClick={() => setD({ ...d, sessions: d.sessions.filter((_, j) => j !== i) })}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                className="justify-self-start"
                disabled={d.sessions.length >= 20}
                onClick={() =>
                  setD({
                    ...d,
                    sessions: [...d.sessions, { date: "", heureDebut: "", heureFin: "", lieu: "" }],
                  })
                }
              >
                <Plus className="mr-1.5 size-4" /> Ajouter une session
              </Button>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="grid gap-4 sm:grid-cols-2">
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
              <Field
                label="Dont part présentiel (€, optionnel)"
                value={d.tarifs.prixPresentiel}
                onChange={(v) => set("tarifs", { prixPresentiel: v })}
              />
              <Field
                label="OPCO / financeur"
                value={d.tarifs.opco}
                onChange={(v) => set("tarifs", { opco: v })}
              />
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
            </div>
          ) : null}

          {step === 5 ? (
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
              />
              <Field
                label="Entreprise du formateur"
                value={d.formateur.entreprise}
                onChange={(v) => set("formateur", { entreprise: v })}
              />
              <Field
                label="SIRET du formateur"
                value={d.formateur.siret}
                onChange={(v) => set("formateur", { siret: v })}
              />
              <Field
                label="Adresse du formateur"
                value={d.formateur.adresse}
                onChange={(v) => set("formateur", { adresse: v })}
                className="sm:col-span-2"
              />
              <Field
                label="Numéro de déclaration d'activité"
                value={d.formateur.nda}
                onChange={(v) => set("formateur", { nda: v })}
              />
              <Field
                label="Région du NDA"
                value={d.formateur.ndaRegion}
                onChange={(v) => set("formateur", { ndaRegion: v })}
              />
              <Field
                label="E-mail"
                value={d.formateur.email}
                onChange={(v) => set("formateur", { email: v })}
              />
              <Field
                label="Téléphone"
                value={d.formateur.telephone}
                onChange={(v) => set("formateur", { telephone: v })}
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
            </div>
          ) : null}

          {step === 6 ? (
            <div className="grid gap-4">
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
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((v) => v - 1)}>
            Précédent
          </Button>
          <Button
            variant="teal"
            disabled={step === ETAPES.length - 1}
            onClick={() => setStep((v) => v + 1)}
          >
            Suivant
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <div className={`grid gap-2 ${className ?? ""}`}>
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Area({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={`grid gap-2 ${className ?? ""}`}>
      <Label>{label}</Label>
      <Textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
