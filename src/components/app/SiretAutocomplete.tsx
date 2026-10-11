import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, BadgeCheck, Building2, Loader2, MapPin, SearchX } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  analyseSaisie,
  formateSiret,
  nettoieNumero,
  type EntrepriseTrouvee,
} from "@/lib/entreprises";
import {
  rechercherEntreprise,
  rechercherEntreprisePublique,
  type ResultatRechercheEntreprise,
} from "@/lib/entreprises.functions";

const DELAI_MS = 400;

/** Cache mémoire (session navigateur) des recherches déjà effectuées. */
const cache = new Map<string, EntrepriseTrouvee[]>();

type Etat =
  | { type: "repos" }
  | { type: "chargement" }
  | { type: "resultats" }
  | { type: "vide" }
  | { type: "invalide"; message: string }
  | { type: "erreur"; message: string };

/** Affiche le toast récapitulatif après un remplissage automatique. */
export function toastChampsRemplis(entreprise: EntrepriseTrouvee, champs: string[]) {
  if (entreprise.etatAdministratif === "C") {
    toast.warning("Établissement fermé selon l'INSEE", {
      description: "Vérifiez qu'il s'agit bien de l'établissement concerné.",
    });
  }
  toast.success(`${entreprise.raisonSociale} — informations INSEE reprises`, {
    description: champs.length ? `Champs remplis : ${champs.join(", ")}.` : undefined,
  });
}

/**
 * Champ SIRET à saisie assistée : reconnaît un SIRET (14 chiffres, espaces tolérés), un SIREN
 * ou un nom d'entreprise, interroge l'annuaire officiel (API Recherche d'entreprises) et propose
 * les établissements trouvés. La sélection appelle `onSelect` pour remplir le formulaire parent.
 * La saisie manuelle reste toujours possible, même en cas d'erreur réseau.
 */
export function SiretAutocomplete({
  value,
  onChange,
  onSelect,
  label = "SIRET",
  id,
  name,
  error,
  hint = "Saisissez un SIRET, un SIREN ou le nom de l'entreprise pour remplir la fiche automatiquement.",
  placeholder = "SIRET ou nom de l'entreprise",
  publique = false,
  readOnly,
  className,
  inputClassName,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect: (entreprise: EntrepriseTrouvee) => void;
  label?: string;
  id?: string;
  /** Attribut `name` de l'input (formulaires non contrôlés lus via FormData). */
  name?: string;
  error?: string | undefined;
  hint?: string | null;
  placeholder?: string;
  /** Formulaire public (sans compte) : utilise la variante sans authentification. */
  publique?: boolean;
  readOnly?: boolean;
  className?: string;
  inputClassName?: string;
}) {
  const autoId = useId();
  const inputId = id ?? `siret-${autoId}`;
  const listId = `${inputId}-suggestions`;

  const [terme, setTerme] = useState<string | null>(null);
  const [etat, setEtat] = useState<Etat>({ type: "repos" });
  const [resultats, setResultats] = useState<EntrepriseTrouvee[]>([]);
  const [ouvert, setOuvert] = useState(false);
  const [actif, setActif] = useState(-1);
  const [siretVerifie, setSiretVerifie] = useState<string | null>(null);
  const requete = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const verifie = siretVerifie !== null && nettoieNumero(value) === siretVerifie;

  useEffect(() => {
    if (terme === null) return;
    const analyse = analyseSaisie(terme);
    const numero = ++requete.current;
    if (analyse.type === "incomplet") {
      setEtat({ type: "repos" });
      setResultats([]);
      return;
    }
    if (analyse.type === "invalide") {
      setEtat({ type: "invalide", message: analyse.message });
      setResultats([]);
      return;
    }
    const cle = `${analyse.type}:${analyse.q.toLowerCase()}`;
    const enCache = cache.get(cle);
    if (enCache) {
      setResultats(enCache);
      setEtat({ type: enCache.length ? "resultats" : "vide" });
      setActif(enCache.length ? 0 : -1);
      return;
    }
    setEtat({ type: "chargement" });
    setResultats([]);
    setActif(-1);
    const chercher = publique ? rechercherEntreprisePublique : rechercherEntreprise;
    const timer = setTimeout(() => {
      chercher({ data: { q: analyse.q } })
        .then((res: ResultatRechercheEntreprise) => {
          if (numero !== requete.current) return;
          if (!res.ok) {
            setResultats([]);
            setEtat({ type: "erreur", message: res.message });
            return;
          }
          cache.set(cle, res.resultats);
          setResultats(res.resultats);
          setActif(res.resultats.length ? 0 : -1);
          setEtat({ type: res.resultats.length ? "resultats" : "vide" });
        })
        .catch(() => {
          if (numero !== requete.current) return;
          setResultats([]);
          setEtat({
            type: "erreur",
            message:
              "Recherche d'entreprise indisponible. Vous pouvez saisir les informations manuellement.",
          });
        });
    }, DELAI_MS);
    return () => clearTimeout(timer);
  }, [terme, publique]);

  function choisir(entreprise: EntrepriseTrouvee) {
    requete.current++;
    setSiretVerifie(entreprise.siret);
    setTerme(null);
    setResultats([]);
    setEtat({ type: "repos" });
    setOuvert(false);
    setActif(-1);
    onChange(entreprise.siret);
    onSelect(entreprise);
  }

  const listeVisible =
    ouvert && (etat.type === "resultats" || etat.type === "vide" || etat.type === "chargement");
  const optionActive =
    listeVisible && actif >= 0 && resultats[actif] ? `${listId}-${actif}` : undefined;

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      if (ouvert) {
        event.preventDefault();
        setOuvert(false);
      }
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!resultats.length) return;
      event.preventDefault();
      setOuvert(true);
      const pas = event.key === "ArrowDown" ? 1 : -1;
      setActif((i) => (i + pas + resultats.length) % resultats.length);
      return;
    }
    if (event.key === "Enter" && listeVisible && actif >= 0 && resultats[actif]) {
      event.preventDefault();
      choisir(resultats[actif]);
    }
  }

  const message =
    etat.type === "invalide" ? (
      <p className="flex items-center gap-1.5 text-xs text-destructive" role="alert">
        <AlertCircle className="size-3.5 shrink-0" aria-hidden />
        {etat.message}
      </p>
    ) : etat.type === "erreur" ? (
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground" role="status">
        <AlertCircle className="size-3.5 shrink-0 text-amber-600" aria-hidden />
        {etat.message}
      </p>
    ) : null;

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex min-h-5 items-center justify-between gap-2">
        <Label htmlFor={inputId}>{label}</Label>
        {verifie ? (
          <span
            className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success"
            title="Identifiant retrouvé dans l'annuaire officiel des entreprises (INSEE)"
          >
            <BadgeCheck className="size-3.5" aria-hidden />
            Vérifié INSEE
          </span>
        ) : null}
      </div>
      <Popover open={listeVisible} onOpenChange={setOuvert}>
        <PopoverAnchor asChild>
          <div className="relative">
            <Input
              ref={inputRef}
              id={inputId}
              name={name}
              value={value}
              readOnly={readOnly}
              disabled={readOnly}
              placeholder={placeholder}
              autoComplete="off"
              inputMode="text"
              spellCheck={false}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={listeVisible}
              aria-controls={listId}
              aria-activedescendant={optionActive}
              aria-invalid={Boolean(error) || etat.type === "invalide"}
              className={cn("pr-9", inputClassName)}
              onChange={(e) => {
                onChange(e.target.value);
                setTerme(e.target.value);
                setOuvert(true);
              }}
              onFocus={() => {
                if (resultats.length) setOuvert(true);
              }}
              onKeyDown={onKeyDown}
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
              {etat.type === "chargement" ? (
                <Loader2 className="size-4 animate-spin" aria-label="Recherche en cours" />
              ) : verifie ? (
                <BadgeCheck className="size-4 text-success" aria-hidden />
              ) : (
                <Building2 className="size-4 opacity-50" aria-hidden />
              )}
            </span>
          </div>
        </PopoverAnchor>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] min-w-[18rem] overflow-hidden rounded-xl p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if (e.target instanceof Node && inputRef.current?.contains(e.target))
              e.preventDefault();
          }}
        >
          <div className="border-b bg-muted/40 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Annuaire officiel des entreprises
          </div>
          {etat.type === "chargement" && !resultats.length ? (
            <p className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Recherche en cours…
            </p>
          ) : etat.type === "vide" ? (
            <p className="flex items-start gap-2 px-3 py-4 text-sm text-muted-foreground">
              <SearchX className="mt-0.5 size-4 shrink-0" aria-hidden />
              Aucune entreprise trouvée — vous pouvez saisir les informations manuellement.
            </p>
          ) : null}
          <ul
            id={listId}
            role="listbox"
            aria-label="Entreprises trouvées"
            className={cn("max-h-80 overflow-y-auto p-1", !resultats.length && "hidden")}
          >
            {resultats.map((r, i) => (
              <li
                key={r.siret}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === actif}
                className={cn(
                  "cursor-pointer rounded-lg px-3 py-2.5 transition-colors",
                  i === actif ? "bg-accent text-accent-foreground" : "hover:bg-muted/60",
                )}
                onMouseEnter={() => setActif(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choisir(r)}
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sm font-semibold leading-tight">{r.raisonSociale}</span>
                  {r.estSiege ? (
                    <span className="rounded-full bg-secondary/15 px-1.5 py-px text-[10px] font-semibold text-secondary-foreground">
                      Siège
                    </span>
                  ) : null}
                  {r.etatAdministratif === "C" ? (
                    <span className="rounded-full bg-destructive/10 px-1.5 py-px text-[10px] font-semibold text-destructive">
                      Fermé
                    </span>
                  ) : null}
                </div>
                {r.nomCommercial ? (
                  <p className="text-xs text-muted-foreground">{r.nomCommercial}</p>
                ) : null}
                <p className="mt-0.5 font-mono text-xs tabular-nums text-foreground/80">
                  {formateSiret(r.siret)}
                </p>
                {r.adresseComplete ? (
                  <p className="mt-0.5 flex items-start gap-1 text-xs text-muted-foreground">
                    <MapPin className="mt-px size-3 shrink-0" aria-hidden />
                    <span>{r.adresseComplete}</span>
                  </p>
                ) : null}
                {r.codeNaf || r.effectif ? (
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80">
                    {[r.codeNaf ? `NAF ${r.codeNaf}` : null, r.formeJuridique, r.effectif]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {message}
      {!message && !error && hint && !verifie ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
