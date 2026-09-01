import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Lock, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { estCpf, type DossierDonnees } from "@/lib/dossier/types";
import type { FormationCatalogue } from "@/lib/formations";
import { useAuth } from "@/hooks/useAuth";
import { memoriserEntreprise } from "@/lib/suggestions";
import { ApprenantsStep } from "@/components/dossier/steps/ApprenantsStep";
import { EntrepriseStep } from "@/components/dossier/steps/EntrepriseStep";
import { FormateurStep } from "@/components/dossier/steps/FormateurStep";
import { FormationStep } from "@/components/dossier/steps/FormationStep";
import { RecapStep } from "@/components/dossier/steps/RecapStep";
import { SessionsStep } from "@/components/dossier/steps/SessionsStep";
import { TarifsStep } from "@/components/dossier/steps/TarifsStep";
import { isEmail, normaliseSiret, type Errs } from "@/components/dossier/steps/types";

type Props = {
  value: DossierDonnees;
  saving?: boolean;
  onSave: (donnees: DossierDonnees) => void;
  /** Formations préenregistrées par le formateur, réutilisables en un clic. */
  modeles?: FormationCatalogue[];
  /** Dossier entré dans le circuit de validation : lecture seule stricte. */
  verrouille?: boolean;
  /** Soumission du dossier complet à l'équipe Skills4mation. */
  onDemanderValidation?: () => void;
  demandeEnCours?: boolean;
};

const ETAPES = [
  "Entreprise",
  "Formation",
  "Sessions",
  "Apprenants",
  "Tarifs",
  "Formateur",
  "Récapitulatif",
] as const;

/** Validation par étape : seules les erreurs de l'étape affichée sont montrées. */
function validateStep(step: number, d: DossierDonnees): Errs {
  const err: Errs = {};
  if (step === 0) {
    if (!d.entreprise.nom.trim()) err["entrepriseNom"] = "Raison sociale requise.";
    if (d.entreprise.siret && !/^\d{14}$/.test(normaliseSiret(d.entreprise.siret)))
      err["siret"] = "Le SIRET comporte 14 chiffres.";
    if (d.entreprise.email && !isEmail(d.entreprise.email))
      err["entrepriseEmail"] = "E-mail invalide.";
  }
  if (step === 1) {
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
  if (step === 3) {
    if (d.apprenants.length === 0) err["apprenants"] = "Ajoutez au moins un apprenant.";
    d.apprenants.forEach((a, i) => {
      if (!a.nom.trim()) err[`apprenant-${i}`] = "Prénom et nom requis.";
      else if (a.email && !isEmail(a.email)) err[`apprenant-${i}`] = "E-mail invalide.";
      else if (estCpf(d) && !(a.numeroCpf ?? "").trim())
        err[`apprenant-${i}`] = "Numéro de dossier CPF requis pour un financement CPF.";
    });
  }
  if (step === 5) {
    if (!d.formateur.nom.trim()) err["formateurNom"] = "Nom du formateur requis.";
    if (!d.formateur.email.trim() || !isEmail(d.formateur.email))
      err["formateurEmail"] = "E-mail du formateur invalide.";
  }
  return err;
}

export function DossierWizard({
  value,
  saving,
  onSave,
  modeles = [],
  verrouille = false,
  onDemanderValidation,
  demandeEnCours = false,
}: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [d, setD] = useState<DossierDonnees>(value);
  const [showBlocking, setShowBlocking] = useState(false);
  const [encouragement, setEncouragement] = useState<string | null>(null);

  /** Alimente l'annuaire partagé en arrière-plan, sans bloquer la saisie. */
  function memoriser(donnees: DossierDonnees) {
    if (!user?.id) return;
    void memoriserEntreprise(donnees.entreprise, user.id).catch(() => undefined);
  }

  // Resynchronise l'état interne quand la valeur enregistrée change côté serveur.
  const [syncRef, setSyncRef] = useState(value);
  if (value !== syncRef) {
    setSyncRef(value);
    setD(value);
  }

  const parEtape = useMemo(() => ETAPES.map((_, index) => validateStep(index, d)), [d]);
  const errors = parEtape[step] ?? {};
  const totalManquants = parEtape.reduce((sum, e) => sum + Object.keys(e).length, 0);

  // Enregistrement automatique : 1 s après la dernière frappe, via le même update Supabase.
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  useEffect(() => {
    if (verrouille) return;
    if (d === value) return;
    if (JSON.stringify(d) === JSON.stringify(value)) return;
    const t = setTimeout(() => onSaveRef.current(d), 1000);
    return () => clearTimeout(t);
  }, [d, value, verrouille]);

  // Coche verte + message d'encouragement au moment où une section devient complète.
  const completes = parEtape.map((e) => Object.keys(e).length === 0);
  const precedent = useRef<boolean[]>(completes);
  useEffect(() => {
    const index = completes.findIndex((c, i) => c && !precedent.current[i]);
    precedent.current = completes;
    if (index === -1 || index === ETAPES.length - 1) return;
    setEncouragement(`Section ${ETAPES[index]} complète !`);
    const t = setTimeout(() => setEncouragement(null), 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completes.join("|")]);

  function set<K extends keyof DossierDonnees>(key: K, patch: Partial<DossierDonnees[K]>) {
    setD((prev) => ({ ...prev, [key]: { ...(prev[key] as object), ...patch } }) as DossierDonnees);
  }

  const stepProps = { d, setD, set, errors };

  return (
    <Card className="rounded-2xl border-border/70 shadow-soft">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Formulaire du dossier de formation</h2>
            <p className="text-sm text-muted-foreground">
              Étape {step + 1} sur {ETAPES.length} — {ETAPES[step]}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {verrouille ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold">
                <Lock className="size-3.5" /> Dossier verrouillé
              </span>
            ) : (
              <>
                <span className="text-xs text-muted-foreground">
                  {saving ? "Enregistrement automatique…" : "Enregistré automatiquement"}
                </span>
                <Button
                  variant="cta"
                  disabled={saving}
                  onClick={() => {
                    memoriser(d);
                    onSave(d);
                  }}
                >
                  <Save className="mr-1.5 size-4" />
                  Enregistrer maintenant
                </Button>
                <Button variant="outline" onClick={() => setShowBlocking(true)}>
                  Vérifier avant génération
                </Button>
              </>
            )}
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
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
                  index === step ? "border-secondary bg-secondary/10" : "border-border/70"
                }`}
              >
                {nom}
                {nb === 0 ? (
                  <Check className="size-3.5 animate-in zoom-in-50 duration-300 text-success" />
                ) : (
                  <span className="font-semibold text-cta-foreground">{nb}</span>
                )}
              </button>
            );
          })}
        </div>

        {encouragement ? (
          <p className="mt-3 animate-in fade-in text-xs font-semibold text-success">
            {encouragement}
          </p>
        ) : null}

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

        {verrouille ? (
          <p className="mt-4 rounded-xl border border-secondary/40 bg-secondary/10 p-3 text-xs">
            Ce dossier a été transmis à l'équipe Skills4mation : les variables ne sont plus
            modifiables. Vous pouvez toujours consulter le dossier et ses documents.
          </p>
        ) : null}

        <fieldset disabled={verrouille} className="mt-6 grid gap-4 disabled:opacity-95">
          {step === 0 ? <EntrepriseStep {...stepProps} /> : null}
          {step === 1 ? <FormationStep {...stepProps} modeles={modeles} /> : null}
          {step === 2 ? <SessionsStep {...stepProps} /> : null}
          {step === 3 ? <ApprenantsStep {...stepProps} formateurId={user?.id} /> : null}
          {step === 4 ? <TarifsStep {...stepProps} /> : null}
          {step === 5 ? <FormateurStep {...stepProps} /> : null}
          {step === 6 ? <RecapStep d={d} /> : null}
        </fieldset>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((v) => v - 1)}>
            Précédent
          </Button>
          {step === ETAPES.length - 1 ? (
            <Button
              variant="cta"
              disabled={saving}
              onClick={() => {
                memoriser(d);
                onSave(d);
              }}
            >
              Enregistrer le dossier
            </Button>
          ) : (
            <Button
              variant="teal"
              onClick={() => {
                if (step === 0) memoriser(d);
                setStep((v) => Math.min(v + 1, ETAPES.length - 1));
              }}
            >
              Suivant
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
