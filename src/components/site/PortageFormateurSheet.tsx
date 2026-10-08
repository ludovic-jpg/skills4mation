import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { envoyerCandidatureFormateur } from "@/lib/formateur-lead.functions";
import { cn } from "@/lib/utils";

const STATUTS = [
  "Indépendant(e) / micro-entreprise",
  "Dirigeant(e) d'un organisme de formation",
  "Salarié(e) en complément d'activité",
  "En création d'activité",
];

const QUALIOPI = [
  "Je ne suis pas certifié(e) Qualiopi",
  "Certification en cours",
  "Certifié(e), je cherche une alternative",
];

type Donnees = {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  statut: string;
  expertise: string;
  experience: string;
  volume: string;
  qualiopi: string;
  message: string;
};

const VIDE: Donnees = {
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
  statut: STATUTS[0] ?? "",
  expertise: "",
  experience: "",
  volume: "",
  qualiopi: QUALIOPI[0] ?? "",
  message: "",
};

const ETAPES = [
  { titre: "Votre activité", sous: "Où en êtes-vous aujourd'hui ?" },
  { titre: "Vos coordonnées", sous: "Pour vous répondre sous 48 h ouvrées." },
];

const schemaContact = z.object({
  prenom: z.string().trim().min(1, "Prénom requis").max(80),
  nom: z.string().trim().min(1, "Nom requis").max(80),
  email: z.string().trim().email("Email invalide").max(255),
  telephone: z.string().trim().max(30),
});

export function PortageFormateurSheet({
  children,
  titre = "Rejoindre Skills4mation",
}: {
  children: React.ReactNode;
  titre?: string;
}) {
  const [open, setOpen] = useState(false);
  const [etape, setEtape] = useState(0);
  const [data, setData] = useState<Donnees>(VIDE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState(false);

  const set = (champ: keyof Donnees) => (valeur: string) =>
    setData((prev) => ({ ...prev, [champ]: valeur }));

  async function envoyer() {
    const parsed = schemaContact.safeParse(data);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) map[String(issue.path[0])] = issue.message;
      setErrors(map);
      return;
    }
    setErrors({});
    setEnvoi(true);

    const message = [
      `Statut : ${data.statut}`,
      `Situation Qualiopi : ${data.qualiopi}`,
      data.message,
    ]
      .filter(Boolean)
      .join("\n");

    const { error } = await supabase.from("demandes_contact").insert({
      prenom: data.prenom,
      nom: data.nom,
      email: data.email,
      telephone: data.telephone || null,
      profil: "Formateur — portage Qualiopi",
      formation_souhaitee: data.expertise || null,
      objectif: "Rejoindre le portage Qualiopi Skills4mation",
      budget_estime: data.volume || null,
      message,
    });

    if (error) {
      setEnvoi(false);
      toast.error("L'envoi a échoué. Merci de réessayer.");
      return;
    }

    await envoyerCandidatureFormateur({ data }).catch((err) =>
      console.error("[candidature-formateur]", err),
    );

    setEnvoi(false);
    setEnvoye(true);
    toast.success("Demande transmise : nous revenons vers vous sous 48 h ouvrées.");
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v && envoye) {
          setEnvoye(false);
          setEtape(0);
          setData(VIDE);
        }
      }}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-[50vw]">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>{titre}</SheetTitle>
          <SheetDescription>
            {envoye ? "Votre demande est enregistrée." : ETAPES[etape]?.sous}
          </SheetDescription>
        </SheetHeader>

        <div className="p-6">
          {envoye ? (
            <div className="rounded-2xl border border-success/40 bg-success/10 p-6">
              <CheckCircle2 className="size-7 text-success" aria-hidden />
              <p className="mt-3 font-semibold">Demande transmise</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Un conseiller formation Skills4mation étudie votre profil et revient vers vous sous
                48 heures ouvrées avec les prochaines étapes du portage Qualiopi.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2" aria-hidden>
                {ETAPES.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 flex-1 rounded-full",
                      i <= etape ? "bg-cta" : "bg-muted",
                    )}
                  />
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Étape {etape + 1} sur {ETAPES.length}
              </p>
              <h3 className="mt-2 text-xl font-semibold">{ETAPES[etape]?.titre}</h3>

              <div className="mt-6 grid gap-5">
                {etape === 0 ? (
                  <>
                    <Choix
                      label="Votre statut aujourd'hui"
                      options={STATUTS}
                      value={data.statut}
                      onChange={set("statut")}
                    />
                    <Choix
                      label="Votre situation Qualiopi"
                      options={QUALIOPI}
                      value={data.qualiopi}
                      onChange={set("qualiopi")}
                    />
                  </>
                ) : null}

                {etape === 1 ? (
                  <>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Champ
                        label="Prénom *"
                        value={data.prenom}
                        onChange={set("prenom")}
                        error={errors["prenom"]}
                      />
                      <Champ
                        label="Nom *"
                        value={data.nom}
                        onChange={set("nom")}
                        error={errors["nom"]}
                      />
                      <Champ
                        label="Email *"
                        type="email"
                        value={data.email}
                        onChange={set("email")}
                        error={errors["email"]}
                      />
                      <Champ
                        label="Téléphone"
                        value={data.telephone}
                        onChange={set("telephone")}
                        error={errors["telephone"]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="precisions">Précisions (optionnel)</Label>
                      <Textarea
                        id="precisions"
                        rows={3}
                        className="mt-2"
                        value={data.message}
                        onChange={(e) => set("message")(e.target.value)}
                      />
                    </div>
                  </>
                ) : null}
              </div>

              <div className="mt-8 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEtape((e) => Math.max(0, e - 1))}
                  disabled={etape === 0}
                >
                  <ArrowLeft className="size-4" aria-hidden /> Retour
                </Button>
                {etape < ETAPES.length - 1 ? (
                  <Button type="button" variant="cta" onClick={() => setEtape((e) => e + 1)}>
                    Continuer <ArrowRight className="size-4" aria-hidden />
                  </Button>
                ) : (
                  <Button type="button" variant="cta" onClick={envoyer} disabled={envoi}>
                    {envoi ? "Envoi…" : "Envoyer ma demande"}
                  </Button>
                )}
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Vos réponses sont transmises à l'équipe Skills4mation pour l'étude de votre projet de
                portage, conformément à notre politique de confidentialité.
              </p>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Choix({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold">{label}</p>
      <div className="mt-3 grid gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "rounded-2xl border px-4 py-3 text-left text-sm transition",
              value === option
                ? "border-cta bg-cta/10 font-semibold"
                : "border-border/70 hover:bg-muted/60",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function Champ({
  label,
  value,
  onChange,
  type = "text",
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string | undefined;
}) {
  const id = label.replace(/[^a-zA-Z]/g, "").toLowerCase();
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2"
      />
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
