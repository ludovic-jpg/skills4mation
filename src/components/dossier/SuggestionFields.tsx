import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import {
  chercherApprenantConnu,
  chercherEntreprises,
  type ApprenantSuggestion,
  type EntrepriseSuggestion,
} from "@/lib/suggestions";

/** Champ « Raison sociale » à saisie assistée sur l'annuaire partagé des entreprises clientes. */
export function EntrepriseNomField({
  value,
  onChange,
  onSelect,
  error,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect: (entreprise: EntrepriseSuggestion) => void;
  error?: string | undefined;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [terme, setTerme] = useState("");
  const [resultats, setResultats] = useState<EntrepriseSuggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terme.trim().length < 2) {
      setResultats([]);
      return;
    }
    let annule = false;
    const timer = setTimeout(() => {
      void chercherEntreprises(terme).then((rows) => {
        if (!annule) setResultats(rows);
      });
    }, 250);
    return () => {
      annule = true;
      clearTimeout(timer);
    };
  }, [terme]);

  return (
    <div className={`grid gap-2 ${className ?? ""}`}>
      <Label>Raison sociale</Label>
      <Popover open={open && resultats.length > 0} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <Input
            ref={inputRef}
            value={value}
            aria-invalid={Boolean(error)}
            placeholder="Rechercher ou saisir une entreprise"
            onChange={(e) => {
              onChange(e.target.value);
              setTerme(e.target.value);
              setOpen(true);
            }}
          />
        </PopoverAnchor>
        <PopoverContent
          align="start"
          className="w-[--radix-popover-trigger-width] p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandList>
              <CommandEmpty>Aucune entreprise enregistrée.</CommandEmpty>
              <CommandGroup heading="Entreprises déjà enregistrées">
                {resultats.map((r) => (
                  <CommandItem
                    key={r.id}
                    value={r.id}
                    onSelect={() => {
                      onSelect(r);
                      setOpen(false);
                      setResultats([]);
                    }}
                  >
                    <span className="flex flex-col">
                      <span className="text-sm font-medium">{r.nom}</span>
                      <span className="text-xs text-muted-foreground">
                        {[r.siret, r.adresse].filter(Boolean).join(" — ") || "Sans SIRET"}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <p className="text-xs text-muted-foreground">
        Les entreprises déjà saisies sont proposées automatiquement.
      </p>
    </div>
  );
}

/** Champ e-mail apprenant : propose de reprendre un apprenant déjà connu du formateur. */
export function ApprenantEmailField({
  value,
  formateurId,
  onChange,
  onReprendre,
}: {
  value: string;
  formateurId: string | undefined;
  onChange: (value: string) => void;
  onReprendre: (suggestion: ApprenantSuggestion) => void;
}) {
  const [connu, setConnu] = useState<ApprenantSuggestion | null>(null);

  useEffect(() => {
    if (!formateurId || !value.includes("@")) {
      setConnu(null);
      return;
    }
    let annule = false;
    const timer = setTimeout(() => {
      void chercherApprenantConnu(value, formateurId).then((row) => {
        if (!annule) setConnu(row);
      });
    }, 350);
    return () => {
      annule = true;
      clearTimeout(timer);
    };
  }, [value, formateurId]);

  return (
    <div className="grid gap-1">
      <Input placeholder="E-mail" value={value} onChange={(e) => onChange(e.target.value)} />
      {connu ? (
        <button
          type="button"
          className="justify-self-start text-xs text-secondary underline"
          onClick={() => onReprendre(connu)}
        >
          Reprendre « {connu.prenom} {connu.nom}
          {connu.telephone ? ` — ${connu.telephone}` : ""} »
        </button>
      ) : null}
    </div>
  );
}
