import { useId, useRef, useState, type ComponentType, type ReactNode } from "react";
import { Check, FileText, RefreshCw, UploadCloud, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ACCEPT, formatTaille } from "@/lib/candidature-questionnaire";

type Icone = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

/** Message d'erreur relié au champ par aria-describedby. */
export function MessageErreur({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} className="text-sm font-medium text-destructive">
      {children}
    </p>
  );
}

/** Champ texte libellé, avec erreur accessible. */
export function ChampTexte({
  label,
  id,
  error,
  aide,
  facultatif,
  className,
  ...rest
}: {
  label: string;
  id: string;
  error?: string | undefined;
  aide?: string;
  facultatif?: boolean;
  className?: string;
} & Omit<React.ComponentProps<typeof Input>, "id">) {
  const idErreur = `${id}-erreur`;
  const idAide = `${id}-aide`;
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {facultatif ? (
          <span className="ml-1.5 font-normal text-muted-foreground">(facultatif)</span>
        ) : null}
      </Label>
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={
          [error ? idErreur : null, aide ? idAide : null].filter(Boolean).join(" ") || undefined
        }
        className="h-12 rounded-xl bg-background text-base"
        {...rest}
      />
      {aide && !error ? (
        <p id={idAide} className="text-xs text-muted-foreground">
          {aide}
        </p>
      ) : null}
      <MessageErreur id={idErreur}>{error}</MessageErreur>
    </div>
  );
}

export type OptionCarte = { id: string; label: string; detail?: string; icone?: Icone };

/**
 * Groupe de cartes à choix (cases à cocher ou boutons radio natifs, donc navigables au
 * clavier et annoncés correctement par les lecteurs d'écran).
 */
export function ChoixCartes({
  legende,
  aide,
  options,
  valeurs,
  multiple,
  onChange,
  error,
  colonnes = 2,
  name,
  legendeVisible = true,
}: {
  legende: string;
  aide?: string;
  options: readonly OptionCarte[];
  valeurs: string[];
  multiple?: boolean;
  onChange: (valeurs: string[]) => void;
  error?: string | undefined;
  colonnes?: 1 | 2 | 3;
  name: string;
  legendeVisible?: boolean;
}) {
  const idErreur = `${name}-erreur`;
  return (
    <fieldset
      className="grid gap-3"
      aria-describedby={error ? idErreur : undefined}
      aria-invalid={Boolean(error) || undefined}
      data-champ={name}
    >
      <legend className={legendeVisible ? "mb-3 text-sm font-medium" : "sr-only"}>
        {legende}
        {multiple ? (
          <span className="ml-1.5 font-normal text-muted-foreground">
            {aide ?? "plusieurs choix possibles"}
          </span>
        ) : null}
      </legend>
      <div
        className={cn(
          "grid gap-2.5",
          colonnes === 2 && "sm:grid-cols-2",
          colonnes === 3 && "sm:grid-cols-3",
        )}
      >
        {options.map((o) => {
          const coche = valeurs.includes(o.id);
          const Icon = o.icone;
          return (
            <label
              key={o.id}
              className={cn(
                "group relative flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border bg-background px-4 py-3 text-left transition-[border-color,background-color,box-shadow] duration-150",
                "border-border hover:border-primary/40 hover:bg-primary/[0.03]",
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
                coche &&
                  "border-primary bg-primary/[0.06] shadow-[inset_0_0_0_1px_var(--color-primary)]",
              )}
            >
              <input
                type={multiple ? "checkbox" : "radio"}
                name={name}
                value={o.id}
                checked={coche}
                onChange={(e) => {
                  if (multiple) {
                    onChange(
                      e.target.checked ? [...valeurs, o.id] : valeurs.filter((v) => v !== o.id),
                    );
                  } else onChange([o.id]);
                }}
                className="sr-only"
              />
              {Icon ? (
                <span
                  className={cn(
                    "inline-flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                    coche ? "bg-primary text-primary-foreground" : "bg-accent text-primary",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
              ) : null}
              <span className="grid min-w-0 flex-1 gap-0.5">
                <span className="text-[0.95rem] leading-snug font-medium text-foreground">
                  {o.label}
                </span>
                {o.detail ? (
                  <span className="text-xs text-muted-foreground">{o.detail}</span>
                ) : null}
              </span>
              <span
                aria-hidden
                className={cn(
                  "inline-flex size-5 shrink-0 items-center justify-center border transition-colors",
                  multiple ? "rounded-md" : "rounded-full",
                  coche
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-transparent",
                )}
              >
                <Check className="size-3.5" strokeWidth={3} />
              </span>
            </label>
          );
        })}
      </div>
      <MessageErreur id={idErreur}>{error}</MessageErreur>
    </fieldset>
  );
}

/** Zone de dépôt d'une pièce : glisser-déposer ou clic, aperçu nom/taille, remplacement. */
export function ZoneDepot({
  label,
  hint,
  fichier,
  onFichier,
  error,
  name,
}: {
  label: string;
  hint: string;
  fichier: File | undefined;
  onFichier: (f: File | undefined) => void;
  error?: string | undefined;
  name: string;
}) {
  const id = `${name}-${useId()}`;
  const ref = useRef<HTMLInputElement>(null);
  const [survol, setSurvol] = useState(false);
  const idErreur = `${name}-erreur`;

  return (
    <div className="grid min-w-0 gap-1.5" data-champ={name}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setSurvol(true);
        }}
        onDragLeave={() => setSurvol(false)}
        onDrop={(e) => {
          e.preventDefault();
          setSurvol(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFichier(f);
        }}
        className={cn(
          "relative flex min-w-0 items-center gap-4 rounded-2xl border border-dashed px-4 py-3.5 transition-colors",
          "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
          fichier
            ? "border-solid border-primary/50 bg-primary/[0.05]"
            : survol
              ? "border-primary bg-primary/[0.06]"
              : error
                ? "border-destructive/60 bg-destructive/[0.03]"
                : "border-border bg-background hover:border-primary/40",
        )}
      >
        <span
          className={cn(
            "inline-flex size-11 shrink-0 items-center justify-center rounded-xl",
            fichier ? "bg-primary text-primary-foreground" : "bg-accent text-primary",
          )}
        >
          {fichier ? (
            <FileText className="size-5" aria-hidden />
          ) : (
            <UploadCloud className="size-5" aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <label htmlFor={id} className="block cursor-pointer text-sm font-semibold">
            {label}
            <span className="absolute inset-0" aria-hidden />
          </label>
          <p className="truncate text-xs text-muted-foreground">
            {fichier ? (
              <>
                <span className="font-medium text-foreground">{fichier.name}</span>
                {" — "}
                {formatTaille(fichier.size)}
              </>
            ) : (
              <>
                {hint} <span className="hidden sm:inline">Glissez le fichier ici ou cliquez.</span>
              </>
            )}
          </p>
        </div>
        {fichier ? (
          <span className="relative z-10 flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => ref.current?.click()}
              className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              aria-label={`Remplacer : ${label}`}
            >
              <RefreshCw className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => {
                onFichier(undefined);
                if (ref.current) ref.current.value = "";
              }}
              className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-background hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              aria-label={`Retirer : ${label}`}
            >
              <X className="size-4" aria-hidden />
            </button>
          </span>
        ) : (
          <span className="shrink-0 text-xs font-semibold text-primary">Parcourir</span>
        )}
        <input
          ref={ref}
          id={id}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? idErreur : undefined}
          onChange={(e) => onFichier(e.target.files?.[0])}
        />
      </div>
      <MessageErreur id={idErreur}>{error}</MessageErreur>
    </div>
  );
}
