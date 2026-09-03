import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Calculator, CheckCircle2, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const STATUTS = [
  {
    value: "Salarié(e)",
    taux: 0.8,
    dispositifs: [
      "Plan de développement des compétences de votre employeur",
      "OPCO de votre branche professionnelle",
      "Projet de transition professionnelle (Transitions Pro)",
      "Reconversion ou promotion par alternance (Pro-A)",
    ],
  },
  {
    value: "Indépendant(e) / TNS",
    taux: 0.5,
    dispositifs: [
      "Fonds d'assurance formation : FIFPL, AGEFICE, FAFCEA, OCAPIAT",
      "Prise en charge partielle selon votre plafond annuel",
      "Solde autofinancé déductible de votre résultat",
    ],
  },
  {
    value: "Dirigeant(e) / employeur",
    taux: 0.8,
    dispositifs: [
      "OPCO de votre entreprise (plan de développement des compétences)",
      "Budget formation de la structure",
      "Formation collective pour plusieurs collaborateurs",
    ],
  },
  {
    value: "En recherche d'emploi / transition",
    taux: 0.5,
    dispositifs: [
      "Aide Individuelle à la Formation (AIF)",
      "Dispositifs régionaux et projets de reconversion",
      "Cofinancement selon votre projet professionnel",
    ],
  },
] as const;

const SITUATIONS = [
  "Salarié(e) en CDI",
  "Salarié(e) en CDD",
  "Dirigeant(e) d'entreprise",
  "Indépendant(e) / profession libérale",
  "En recherche d'emploi",
  "En reconversion professionnelle",
  "Autre situation",
];

const TARIF_HORAIRE = 90;

const euros = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const schema = z.object({
  prenom: z.string().trim().min(1, "Prénom requis").max(80),
  nom: z.string().trim().min(1, "Nom requis").max(80),
  email: z.string().trim().email("Email invalide").max(255),
  telephone: z.string().trim().max(30).optional(),
  entreprise_nom: z.string().trim().min(1, "Nom de l'entreprise requis").max(160),
  entreprise_siret: z
    .string()
    .trim()
    .regex(/^\d{14}$/, "SIRET à 14 chiffres"),
  theme_formation: z.string().trim().min(2, "Thème de formation requis").max(200),
  objectif_professionnel: z
    .string()
    .trim()
    .min(5, "Décrivez votre objectif professionnel")
    .max(1000),
  message: z.string().trim().max(1500).optional(),
});

/** Compteur animé pour les montants du diagnostic instantané. */
function useAnimatedNumber(value: number) {
  const [display, setDisplay] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const start = performance.now();
    const origin = from.current;
    const delta = value - origin;
    let frame = 0;

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 450);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(origin + delta * eased));
      if (p < 1) frame = requestAnimationFrame(tick);
      else from.current = value;
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return display;
}

function Montant({ value, className }: { value: number; className?: string }) {
  const animated = useAnimatedNumber(value);
  return <p className={className}>{euros.format(animated)}</p>;
}

export function DiagnosticExpress({ variant = "compact" }: { variant?: "compact" | "full" }) {
  const full = variant === "full";
  const [statut, setStatut] = useState<string>(STATUTS[0].value);
  const [formation, setFormation] = useState("");
  const [heures, setHeures] = useState(14);
  const [open, setOpen] = useState(full);
  const [situation, setSituation] = useState<string>(SITUATIONS[0] ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const selection = STATUTS.find((s) => s.value === statut) ?? STATUTS[0];

  const { cout, prise, reste } = useMemo(() => {
    const total = Math.max(0, heures) * TARIF_HORAIRE;
    const priseEnCharge = Math.round(total * selection.taux);
    return { cout: total, prise: priseEnCharge, reste: total - priseEnCharge };
  }, [heures, selection]);


  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) map[String(issue.path[0])] = issue.message;
      setErrors(map);
      toast.error("Merci de vérifier les champs signalés.");
      return;
    }
    setErrors({});
    setSending(true);
    const recap = `Diagnostic Express — durée souhaitée : ${heures} h · coût pédagogique estimé : ${euros.format(cout)} · prise en charge estimée : ${euros.format(prise)} · reste à financer estimé : ${euros.format(reste)}.`;
    const { error } = await supabase.from("demandes_droits_formation").insert({
      prenom: parsed.data.prenom,
      nom: parsed.data.nom,
      email: parsed.data.email,
      telephone: parsed.data.telephone || null,
      statut_pro: statut,
      formation_visee: formation || null,
      situation: parsed.data.situation || null,
      objectif_professionnel: parsed.data.objectif_professionnel,
      disponibilites: parsed.data.disponibilites || null,
      budget_estime: `${euros.format(reste)} de reste estimé (sur ${euros.format(cout)})`,
      message: parsed.data.message ? `${parsed.data.message}\n\n${recap}` : recap,
      dispositifs: dispositifs.length > 0 ? dispositifs : null,
    });
    setSending(false);
    if (error) {
      toast.error("L'envoi a échoué. Merci de réessayer.");
      return;
    }
    setSent(true);
    toast.success("Diagnostic transmis : un conseiller vous répond sous 48 h ouvrées.");
  }

  return (
    <Card
      id="budget"
      className={cn("scroll-mt-24 rounded-3xl border-border/70 shadow-soft", full && "border-2")}
    >
      <CardContent className={cn("p-6", full ? "sm:p-10" : "sm:p-8")}>
        <span className="inline-flex rounded-xl bg-accent p-3 text-accent-foreground">
          <Calculator className="size-5" aria-hidden />
        </span>
        <h3 className={cn("mt-4 font-semibold", full ? "text-2xl sm:text-3xl" : "text-xl")}>
          Le Diagnostic Express — votre budget formation en 30 secondes
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Trois informations suffisent pour obtenir une estimation indicative de votre budget et des
          dispositifs mobilisables. Le chiffrage définitif est confirmé après votre entretien de
          cadrage.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="diag-statut">Votre statut professionnel</Label>
            <select
              id="diag-statut"
              value={statut}
              onChange={(event) => setStatut(event.target.value)}
              className="mt-2 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
            >
              {STATUTS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="diag-formation">Formation ou domaine visé</Label>
            <Input
              id="diag-formation"
              value={formation}
              onChange={(event) => setFormation(event.target.value)}
              placeholder="Ex. anglais professionnel, management"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="diag-heures">Durée souhaitée (heures)</Label>
            <Input
              id="diag-heures"
              type="number"
              min={1}
              max={400}
              value={heures}
              onChange={(event) => setHeures(Number(event.target.value))}
              className="mt-2"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-muted/70 p-4">
            <p className="text-xs font-semibold text-secondary">Coût pédagogique estimé</p>
            <Montant value={cout} className="mt-1 text-2xl font-semibold" />
            <p className="mt-1 text-xs text-muted-foreground">HT, hors frais annexes</p>
          </div>
          <div className="rounded-2xl border border-cta/40 bg-cta/10 p-4">
            <p className="text-xs font-semibold">Prise en charge estimée</p>
            <Montant value={prise} className="mt-1 text-2xl font-semibold" />
          </div>
          <div className="rounded-2xl border border-border/70 p-4">
            <p className="text-xs font-semibold">Reste à financer estimé</p>
            <Montant value={reste} className="mt-1 text-2xl font-semibold" />
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold">Dispositifs à explorer pour vous</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {selection.dispositifs.map((d) => (
              <li key={d}>• {d}</li>
            ))}
          </ul>
        </div>

        {sent ? (
          <div className="mt-7 rounded-2xl border border-success/40 bg-success/10 p-6">
            <CheckCircle2 className="size-7 text-success" aria-hidden />
            <p className="mt-3 font-semibold">Diagnostic enregistré</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Un conseiller Skills4mation analyse vos droits et revient vers vous sous 48 heures
              ouvrées avec les dispositifs mobilisables et un plan de financement.
            </p>
          </div>
        ) : (
          <>
            {open ? null : (
              <Button variant="cta" className="mt-7" onClick={() => setOpen(true)}>
                Affiner mon financement avec un conseiller
                <ChevronDown className="size-4" aria-hidden />
              </Button>
            )}

            {open ? (
              <form onSubmit={onSubmit} className="mt-8 grid gap-5 border-t border-border/70 pt-8 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <p className="eyebrow text-secondary">Aller plus loin</p>
                  <h4 className="mt-2 text-lg font-semibold">
                    Affiner mon financement avec un conseiller
                  </h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Vos réponses du diagnostic sont conservées : {statut.toLowerCase()}
                    {formation ? ` · ${formation}` : ""} · {heures} h. Complétez seulement ce qui
                    manque.
                  </p>
                </div>

                <Champ label="Prénom *" name="prenom" error={errors["prenom"]} />
                <Champ label="Nom *" name="nom" error={errors["nom"]} />
                <Champ label="Email *" name="email" type="email" error={errors["email"]} />
                <Champ label="Téléphone" name="telephone" error={errors["telephone"]} />

                <div className="sm:col-span-2">
                  <Label htmlFor="objectif_professionnel">Votre objectif professionnel *</Label>
                  <Textarea
                    id="objectif_professionnel"
                    name="objectif_professionnel"
                    rows={4}
                    className="mt-2"
                    placeholder="Reconversion, montée en compétences, évolution interne, création d'activité…"
                  />
                  {errors["objectif_professionnel"] ? (
                    <p className="mt-1 text-xs text-destructive">
                      {errors["objectif_professionnel"]}
                    </p>
                  ) : null}
                </div>

                <Champ
                  label="Nom de l'entreprise employeuse *"
                  name="entreprise_nom"
                  error={errors["entreprise_nom"]}
                />
                <Champ
                  label="SIRET de l'entreprise *"
                  name="entreprise_siret"
                  placeholder="14 chiffres"
                  error={errors["entreprise_siret"]}
                />

                <Champ
                  label="Thème de la formation souhaité *"
                  name="theme_formation"
                  placeholder="Ex. management, bureautique, langues, bilan de compétences…"
                  error={errors["theme_formation"]}
                />

                <div>
                  <Label htmlFor="situation">Votre situation actuelle</Label>
                  <select
                    id="situation"
                    value={situation}
                    onChange={(event) => setSituation(event.target.value)}
                    className="mt-2 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    {SITUATIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>


                <div className="sm:col-span-2">
                  <Label htmlFor="message">Précisions complémentaires</Label>
                  <Textarea id="message" name="message" rows={3} className="mt-2" />
                </div>

                <div className="sm:col-span-2">
                  <Button type="submit" variant="cta" size="lg" disabled={sending}>
                    {sending ? "Envoi…" : "Affiner mon financement avec un conseiller"}
                  </Button>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Les données transmises sont traitées uniquement pour l'étude de votre projet de
                    formation, conformément à notre politique de confidentialité.
                  </p>
                </div>
              </form>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Champ({
  label,
  name,
  type = "text",
  error,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string | undefined;
  error?: string | undefined;
  placeholder?: string | undefined;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} placeholder={placeholder} className="mt-2" />
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
