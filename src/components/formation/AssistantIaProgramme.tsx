import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Circle, FileUp, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/catalogue-historique";
import {
  genererProgrammeFormation,
  importerProgrammeFormation,
  type ResultatProgrammeIa,
} from "@/lib/formations-ia.functions";
import type { FormationCatalogue } from "@/lib/formations";

const TAILLE_MAX = 10 * 1024 * 1024;

type Critere = { cle: string; label: string; ok: boolean; poids: number; obligatoire: boolean };

const rempli = (v: string | null | undefined) => Boolean(v && v.trim());

/** Complétude des champs saisis à la main : 80 % pour les obligatoires, 20 % de bonus. */
function completude(f: FormationCatalogue) {
  const criteres: Critere[] = [
    { cle: "titre", label: "Titre", ok: rempli(f.titre), poids: 16, obligatoire: true },
    {
      cle: "duree",
      label: "Nombre d'heures",
      ok: typeof f.duree_heures === "number" && f.duree_heures > 0,
      poids: 16,
      obligatoire: true,
    },
    { cle: "niveau", label: "Niveau", ok: rempli(f.niveau), poids: 16, obligatoire: true },
    {
      cle: "public",
      label: "Public visé",
      ok: rempli(f.public_cible),
      poids: 16,
      obligatoire: true,
    },
    {
      cle: "objectif",
      label: "Objectif général",
      ok: rempli(f.objectif),
      poids: 16,
      obligatoire: true,
    },
    { cle: "categorie", label: "Catégorie", ok: rempli(f.categorie), poids: 7, obligatoire: false },
    {
      cle: "objectifs",
      label: "Objectifs pédagogiques",
      ok: (f.objectifs ?? []).some((o) => o.trim()),
      poids: 7,
      obligatoire: false,
    },
    { cle: "prerequis", label: "Prérequis", ok: rempli(f.prerequis), poids: 6, obligatoire: false },
  ];
  const pourcentage = criteres.reduce((t, c) => t + (c.ok ? c.poids : 0), 0);
  const manquantsObligatoires = criteres.filter((c) => c.obligatoire && !c.ok);
  const manquantsBonus = criteres.filter((c) => !c.obligatoire && !c.ok);
  return { criteres, pourcentage, manquantsObligatoires, manquantsBonus };
}

export type ModeIa = "generation" | "import";

type Props = {
  formation: FormationCatalogue;
  disabled?: boolean | undefined;
  onResultat: (resultat: ResultatProgrammeIa, mode: ModeIa) => void;
};

const CATEGORIES_IA = CATEGORIES.map((c) => ({ slug: c.slug, label: c.label }));

function message(error: unknown, defaut: string) {
  return error instanceof Error && error.message ? error.message : defaut;
}

export function AssistantIaProgramme({ formation: f, disabled, onResultat }: Props) {
  const generer = useServerFn(genererProgrammeFormation);
  const importer = useServerFn(importerProgrammeFormation);
  const [enCours, setEnCours] = useState<null | ModeIa>(null);
  const fichierRef = useRef<HTMLInputElement>(null);

  const { criteres, pourcentage, manquantsObligatoires, manquantsBonus } = completude(f);
  const pret = manquantsObligatoires.length === 0;
  const occupe = enCours !== null || Boolean(disabled);

  const couleurJauge =
    pourcentage >= 100
      ? "[&>div]:bg-primary"
      : pret
        ? "[&>div]:bg-primary-light"
        : "[&>div]:bg-cta";

  async function lancerGeneration() {
    if (!pret || occupe) return;
    setEnCours("generation");
    try {
      const resultat = await generer({
        data: {
          formationId: f.id,
          categories: CATEGORIES_IA,
          saisie: {
            titre: f.titre,
            duree_heures: Number(f.duree_heures),
            niveau: f.niveau ?? "",
            public_cible: f.public_cible ?? "",
            objectif: f.objectif ?? "",
            categorie: f.categorie ?? "",
            objectifs: (f.objectifs ?? []).filter((o) => o.trim()),
            prerequis: f.prerequis ?? "",
          },
        },
      });
      onResultat(resultat, "generation");
    } catch (error) {
      console.error("[assistant-ia] génération", error);
      toast.error(message(error, "La génération du programme a échoué. Réessayez."));
    } finally {
      setEnCours(null);
    }
  }

  async function lancerImport(file: File) {
    const nom = file.name.toLowerCase();
    if (!nom.endsWith(".pdf") && !nom.endsWith(".docx")) {
      toast.error("Format non pris en charge : déposez un PDF ou un document Word (.docx).");
      return;
    }
    if (file.size > TAILLE_MAX) {
      toast.error("Document trop volumineux : 10 Mo maximum.");
      return;
    }
    if (file.size === 0) {
      toast.error("Le document déposé est vide.");
      return;
    }
    if (!f.formateur_id) {
      toast.error("Formation non rattachée à votre compte.");
      return;
    }
    setEnCours("import");
    try {
      const nomPropre = file.name.replace(/[^\w.-]+/g, "_").slice(-120);
      const path = `${f.formateur_id}/programmes/${f.id}-${Date.now()}-${nomPropre}`;
      const { error } = await supabase.storage.from("candidatures").upload(path, file, {
        upsert: true,
        contentType:
          file.type ||
          (nom.endsWith(".pdf")
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
      });
      if (error) throw new Error("Envoi du document impossible.");
      const resultat = await importer({
        data: {
          formationId: f.id,
          path,
          nomFichier: file.name,
          dureeHeures:
            typeof f.duree_heures === "number" && f.duree_heures > 0 ? f.duree_heures : null,
          categories: CATEGORIES_IA,
        },
      });
      onResultat(resultat, "import");
    } catch (error) {
      console.error("[assistant-ia] import", error);
      toast.error(message(error, "L'import du programme a échoué. Réessayez."));
    } finally {
      setEnCours(null);
    }
  }

  const aideGeneration = pret
    ? "L'IA rédige toutes les sections à partir de vos informations, sans modifier votre titre, votre durée, votre niveau, votre public ni votre objectif général."
    : `Renseignez d'abord : ${manquantsObligatoires.map((c) => c.label.toLowerCase()).join(", ")}.`;

  return (
    <section
      aria-labelledby="assistant-ia-titre"
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-accent via-background to-cta/15 p-6 shadow-soft"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary-light/15 blur-3xl"
      />
      <div className="relative grid gap-5">
        <div className="flex flex-wrap items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
            <Sparkles className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="assistant-ia-titre" className="text-base font-semibold">
              Assistant IA
            </h2>
            <p className="text-sm text-muted-foreground">
              Remplissez les informations clés, puis laissez l'IA rédiger un programme conforme
              Qualiopi — ou importez le vôtre. Vous relisez tout avant d'enregistrer.
            </p>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-medium">Complétude de vos informations</span>
            <span className="font-semibold tabular-nums text-primary">{pourcentage} %</span>
          </div>
          <Progress
            value={pourcentage}
            aria-label={`Complétude : ${pourcentage} %`}
            className={`h-2.5 bg-primary/10 ${couleurJauge}`}
          />
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
            {criteres.map((c) => (
              <li
                key={c.cle}
                className={`inline-flex items-center gap-1.5 ${c.ok ? "text-foreground" : "text-muted-foreground"}`}
              >
                {c.ok ? (
                  <CheckCircle2 className="size-3.5 text-primary" aria-hidden />
                ) : (
                  <Circle className="size-3.5" aria-hidden />
                )}
                {c.label}
                {c.obligatoire ? null : <span className="text-muted-foreground">(bonus)</span>}
                <span className="sr-only">{c.ok ? " : renseigné" : " : à compléter"}</span>
              </li>
            ))}
          </ul>
          {!pret ? (
            <p className="text-xs font-medium text-foreground">
              Pour lancer la génération, renseignez :{" "}
              {manquantsObligatoires.map((c) => c.label.toLowerCase()).join(", ")}.
            </p>
          ) : manquantsBonus.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              Facultatif, pour un résultat plus précis :{" "}
              {manquantsBonus.map((c) => c.label.toLowerCase()).join(", ")}.
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={pret ? -1 : 0} className="inline-flex rounded-md">
                  <Button
                    variant="cta"
                    disabled={!pret || occupe}
                    onClick={() => void lancerGeneration()}
                    aria-describedby="assistant-ia-aide"
                  >
                    {enCours === "generation" ? (
                      <Loader2 className="mr-1.5 size-4 animate-spin" aria-hidden />
                    ) : (
                      <Sparkles className="mr-1.5 size-4" aria-hidden />
                    )}
                    Générer le programme avec l'IA
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-center">{aideGeneration}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span id="assistant-ia-aide" className="sr-only">
            {aideGeneration}
          </span>

          <span className="text-xs text-muted-foreground">ou</span>

          <input
            ref={fichierRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void lancerImport(file);
            }}
          />
          <Button
            variant="outline"
            disabled={occupe}
            onClick={() => fichierRef.current?.click()}
            className="bg-background/70"
          >
            {enCours === "import" ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" aria-hidden />
            ) : (
              <FileUp className="mr-1.5 size-4" aria-hidden />
            )}
            Importer mon programme
          </Button>
          <span className="text-xs text-muted-foreground">PDF ou Word (.docx), 10 Mo maximum</span>
        </div>

        {enCours ? (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-3 rounded-xl border border-primary/20 bg-background/80 px-4 py-3 text-sm"
          >
            <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
            <span>
              {enCours === "import"
                ? "Lecture de votre programme et rédaction en cours…"
                : "Rédaction en cours…"}{" "}
              <span className="text-muted-foreground">20 à 40 s</span>
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
