import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { aDuPresentiel, estCpf, type DossierDonnees } from "@/lib/dossier/types";
import { appliquerFormation, type FormationCatalogue } from "@/lib/formations";

type Props = {
  value: DossierDonnees;
  saving?: boolean;
  onSave: (donnees: DossierDonnees) => void;
  /** Formations préenregistrées par le formateur, réutilisables en un clic. */
  modeles?: FormationCatalogue[];
};

const ETAPES = [
  "Informations générales",
  "Entreprise & financeur",
  "Formateur & logistique",
  "Apprenants / stagiaires",
  "Besoins & facturation",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Retire espaces, tirets et points avant contrôle du SIRET. */
function normaliseSiret(value: string) {
  return value.replace(/[\s.-]/g, "");
}

type Errs = Record<string, string>;

/** Validation par étape : seules les erreurs de l'étape affichée sont montrées. */
function validateStep(step: number, d: DossierDonnees): Errs {
  const err: Errs = {};
  if (step === 0) {
    if (!d.formation.titre.trim()) err["titre"] = "Le titre de la formation est requis.";
    if (!d.formation.dateDebut) err["dateDebut"] = "Date de démarrage requise.";
    if (!d.formation.dateFin) err["dateFin"] = "Date de fin requise.";
    if (d.formation.dateDebut && d.formation.dateFin && d.formation.dateFin < d.formation.dateDebut)
      err["dateFin"] = "La date de fin doit suivre la date de démarrage.";
    if (!d.formation.heuresTotal || Number(d.formation.heuresTotal) <= 0)
      err["heuresTotal"] = "Durée totale en heures requise.";
    if (d.formation.format !== "presentiel" && !d.formation.lienConnexion.trim())
      err["lienConnexion"] = "Lien de connexion requis pour le distanciel.";
  }
  if (step === 1) {
    if (!d.entreprise.nom.trim()) err["entrepriseNom"] = "Raison sociale requise.";
    if (d.entreprise.siret && !/^\d{14}$/.test(normaliseSiret(d.entreprise.siret)))
      err["siret"] = "Le SIRET comporte 14 chiffres.";
    if (d.entreprise.email && !EMAIL_RE.test(d.entreprise.email))
      err["entrepriseEmail"] = "E-mail invalide.";
  }
  if (step === 2) {
    if (!d.formateur.nom.trim()) err["formateurNom"] = "Nom du formateur requis.";
    if (!d.formateur.email.trim() || !EMAIL_RE.test(d.formateur.email))
      err["formateurEmail"] = "E-mail du formateur invalide.";
  }
  if (step === 3) {
    if (d.apprenants.length === 0) err["apprenants"] = "Ajoutez au moins un apprenant.";
    d.apprenants.forEach((a, i) => {
      if (!a.nom.trim()) err[`apprenant-${i}`] = "Prénom et nom requis.";
      else if (a.email && !EMAIL_RE.test(a.email)) err[`apprenant-${i}`] = "E-mail invalide.";
      else if (estCpf(d) && !(a.numeroCpf ?? "").trim())
        err[`apprenant-${i}`] = "Numéro de dossier CPF requis pour un financement CPF.";
    });
  }
  return err;
}

export function DossierWizard({ value, saving, onSave, modeles = [] }: Props) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<DossierDonnees>(value);
  const [showBlocking, setShowBlocking] = useState(false);

  // Resynchronise l'état interne quand la valeur enregistrée change côté serveur.
  const [syncRef, setSyncRef] = useState(value);
  if (value !== syncRef) {
    setSyncRef(value);
    setD(value);
  }

  const parEtape = useMemo(
    () => ETAPES.map((_, index) => validateStep(index, d)),
    [d],
  );
  const errors = parEtape[step] ?? {};
  const totalManquants = parEtape.reduce((sum, e) => sum + Object.keys(e).length, 0);

  function set<K extends keyof DossierDonnees>(key: K, patch: Partial<DossierDonnees[K]>) {
    setD((prev) => ({ ...prev, [key]: { ...(prev[key] as object), ...patch } }) as DossierDonnees);
  }

  return (
    <Card className="rounded-2xl border-border/70 shadow-soft">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Formulaire du dossier de formation</h2>
            <p className="text-sm text-muted-foreground">
              Étape {step + 1}/{ETAPES.length} — {ETAPES[step]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="cta" disabled={saving} onClick={() => onSave(d)}>
              <Save className="mr-1.5 size-4" />
              {saving ? "Enregistrement…" : "Enregistrer le dossier"}
            </Button>
            <Button variant="outline" onClick={() => setShowBlocking(true)}>
              Vérifier avant génération
            </Button>
          </div>
        </div>
        <Progress value={((step + 1) / ETAPES.length) * 100} className="mt-4" />

        <div className="mt-3 flex flex-wrap gap-2">
          {ETAPES.map((nom, index) => {
            const nb = Object.keys(parEtape[index] ?? {}).length;
            return (
              <button
                key={nom}
                type="button"
                onClick={() => setStep(index)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  index === step ? "border-secondary bg-secondary/10" : "border-border/70"
                }`}
              >
                {nom}{" "}
                {nb === 0 ? (
                  <span className="font-semibold text-success">✓</span>
                ) : (
                  <span className="font-semibold text-cta-foreground">{nb}</span>
                )}
              </button>
            );
          })}
        </div>

        {showBlocking ? (
          totalManquants === 0 ? (
            <p className="mt-3 text-xs text-success">Dossier complet : documents prêts à générer.</p>
          ) : (
            <div className="mt-3 rounded-xl border border-cta/40 bg-cta/10 p-3 text-xs">
              <p className="font-semibold">
                {totalManquants} champ(s) obligatoire(s) à compléter avant la génération des
                documents définitifs. L'enregistrement reste possible à tout moment.
              </p>
              <ul className="mt-2 grid gap-1">
                {ETAPES.map((nom, index) =>
                  Object.keys(parEtape[index] ?? {}).length ? (
                    <li key={nom}>
                      <button
                        type="button"
                        className="underline"
                        onClick={() => {
                          setStep(index);
                          setShowBlocking(false);
                        }}
                      >
                        {nom} — {Object.values(parEtape[index] ?? {}).join(" ")}
                      </button>
                    </li>
                  ) : null,
                )}
              </ul>
            </div>
          )
        ) : null}


        <div className="mt-6 grid gap-4">
          {step === 0 ? (
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
                    Titre, objectifs, durée, modalités, tarifs et visuel sont préremplis
                    automatiquement.
                  </p>
                </div>
              ) : null}
              <Field label="Numéro ADF" value={d.adf} onChange={(v) => setD({ ...d, adf: v })} />
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
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Raison sociale"
                value={d.entreprise.nom}
                onChange={(v) => set("entreprise", { nom: v })}
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
              <div className="grid gap-2">
                <Label>Mode de financement</Label>
                <Select
                  value={d.tarifs.modeFinancement}
                  onValueChange={(v) =>
                    set("tarifs", {
                      modeFinancement: v as DossierDonnees["tarifs"]["modeFinancement"],
                    })
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
                    coutCertification: v
                      ? d.tarifs.coutCertification || TARIF_CERTIFICATION_ICDL
                      : "",
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
            </div>
          ) : null}

          {step === 2 ? (
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

              <div className="grid gap-3">
                <h3 className="text-sm font-semibold">Planning des sessions (20 maximum)</h3>
                {d.sessions.map((sess, i) => (
                  <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]">
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
                      placeholder="Module"
                      value={sess.module ?? ""}
                      onChange={(e) =>
                        setD({
                          ...d,
                          sessions: d.sessions.map((x, j) =>
                            j === i ? { ...x, module: e.target.value } : x,
                          ),
                        })
                      }
                    />
                    <Input
                      placeholder="Lieu / connexion"
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
                      sessions: [
                        ...d.sessions,
                        { date: "", heureDebut: "", heureFin: "", lieu: "", module: "" },
                      ],
                    })
                  }
                >
                  <Plus className="mr-1.5 size-4" /> Ajouter une session
                </Button>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-4">
              <p className="text-sm text-muted-foreground">
                Les apprenants alimentent la convention, le planning, les convocations, les
                émargements et les attestations.
              </p>
              {errors["apprenants"] ? (
                <p className="text-xs text-destructive">{errors["apprenants"]}</p>
              ) : null}
              {d.apprenants.map((a, i) => (
                <div key={i} className="grid gap-2 rounded-xl border border-border/70 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Apprenant {i + 1}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setD({ ...d, apprenants: d.apprenants.filter((_, j) => j !== i) })
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      placeholder="Prénom et nom"
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
                    <Input
                      placeholder="E-mail"
                      value={a.email ?? ""}
                      onChange={(e) =>
                        setD({
                          ...d,
                          apprenants: d.apprenants.map((x, j) =>
                            j === i ? { ...x, email: e.target.value } : x,
                          ),
                        })
                      }
                    />
                    <Input
                      placeholder="Téléphone"
                      value={a.telephone ?? ""}
                      onChange={(e) =>
                        setD({
                          ...d,
                          apprenants: d.apprenants.map((x, j) =>
                            j === i ? { ...x, telephone: e.target.value } : x,
                          ),
                        })
                      }
                    />
                    {estCpf(d) ? (
                      <Input
                        placeholder="Numéro de dossier CPF"
                        value={a.numeroCpf ?? ""}
                        onChange={(e) =>
                          setD({
                            ...d,
                            apprenants: d.apprenants.map((x, j) =>
                              j === i ? { ...x, numeroCpf: e.target.value } : x,
                            ),
                          })
                        }
                      />
                    ) : null}
                    <Input
                      placeholder="Certification visée (ex. ICDL)"
                      value={a.certification ?? ""}
                      onChange={(e) =>
                        setD({
                          ...d,
                          apprenants: d.apprenants.map((x, j) =>
                            j === i ? { ...x, certification: e.target.value } : x,
                          ),
                        })
                      }
                    />
                  </div>
                  {errors[`apprenant-${i}`] ? (
                    <p className="text-xs text-destructive">{errors[`apprenant-${i}`]}</p>
                  ) : null}
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

          {step === 4 ? (
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
              <h3 className="text-sm font-semibold">Facture formateur (F9)</h3>
              <div className="grid gap-4 sm:grid-cols-2">
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
                <Field
                  label="TVA (%)"
                  value={d.facture.tva}
                  onChange={(v) => set("facture", { tva: v })}
                />
                <Field
                  label="Montant TTC (€)"
                  value={d.facture.montantTtc}
                  onChange={(v) => set("facture", { montantTtc: v })}
                />
                <Field
                  label="IBAN"
                  value={d.facture.iban}
                  onChange={(v) => set("facture", { iban: v })}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((v) => v - 1)}>
            Précédent
          </Button>
          <Button
            variant="teal"
            onClick={() => setStep((v) => Math.min(v + 1, ETAPES.length - 1))}
          >
            {step === ETAPES.length - 1 ? "Dernière étape" : "Suivant"}

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
  error,
  readOnly,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
  error?: string | undefined;
  readOnly?: boolean;
}) {
  return (
    <div className={`grid gap-2 ${className ?? ""}`}>
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        readOnly={readOnly}
        disabled={readOnly}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange(e.target.value)}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
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

function Toggle({
  label,
  checked,
  onChange,
  className,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}) {
  return (
    <label className={`flex items-start gap-3 text-sm ${className ?? ""}`}>
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(v === true)} />
      <span>{label}</span>
    </label>
  );
}
