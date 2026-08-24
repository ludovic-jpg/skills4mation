import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { BadgeCheck, Banknote, FolderCheck, HeartHandshake } from "lucide-react";

import { PageHero, PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/pole-formateur")({
  head: () => ({
    meta: [
      { title: "Pôle formateur — Rejoindre Skills4mation" },
      {
        name: "description",
        content:
          "Portage administratif et pédagogique pour formateurs indépendants : Qualiopi, conventions, financements professionnels. Candidatez au réseau Skills4mation.",
      },
      { property: "og:title", content: "Pôle formateur — Rejoindre Skills4mation" },
      {
        property: "og:description",
        content: "Devenez formateur partenaire : nous portons votre administratif Qualiopi.",
      },
    ],
  }),
  component: PoleFormateur,
});

const schema = z.object({
  prenom: z.string().trim().min(1, "Prénom requis").max(80),
  nom: z.string().trim().min(1, "Nom requis").max(80),
  email: z.string().trim().email("Email invalide").max(255),
  telephone: z.string().trim().max(30).optional(),
  expertise: z.string().trim().min(2, "Précisez votre expertise").max(200),
  message: z.string().trim().max(1500).optional(),
});

const ATOUTS = [
  {
    icon: FolderCheck,
    titre: "Vos pièces Qualiopi générées",
    texte: "Convention, programme, émargement, évaluations : produits automatiquement.",
  },
  {
    icon: Banknote,
    titre: "Financements pris en charge",
    texte: "Montage OPCO, AIF, Transitions Pro et suivi des accords de financement.",
  },
  {
    icon: BadgeCheck,
    titre: "Crédibilité immédiate",
    texte: "Vous intervenez sous une certification Qualiopi reconnue.",
  },
  {
    icon: HeartHandshake,
    titre: "Développement commercial",
    texte: "Demandes de budget étudiées par notre équipe pour vos prospects.",
  },
];

function PoleFormateur() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(form));
    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) map[String(issue.path[0])] = issue.message;
      setErrors(map);
      return;
    }
    setErrors({});
    setSending(true);
    const { error } = await supabase.from("candidatures").insert({
      prenom: parsed.data.prenom,
      nom: parsed.data.nom,
      email: parsed.data.email,
      telephone: parsed.data.telephone ?? null,
      expertise: parsed.data.expertise,
      message: parsed.data.message ?? null,
    });
    setSending(false);
    if (error) {
      toast.error("L'envoi a échoué. Merci de réessayer.");
      return;
    }
    setSent(true);
    toast.success("Candidature envoyée : notre équipe revient vers vous rapidement.");
  }

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Pôle formateur"
        title="Formez. Nous portons le reste."
        description="Skills4mation assure le portage administratif et pédagogique de votre activité de formation : conformité Qualiopi, contractualisation, financement, archivage."
      />

      <section className="section-shell py-14">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ATOUTS.map((item) => (
            <Card key={item.titre} className="rounded-2xl border-border/70 shadow-soft">
              <CardContent className="p-6">
                <span className="inline-flex rounded-xl bg-accent p-3 text-accent-foreground">
                  <item.icon className="size-5" />
                </span>
                <h2 className="mt-4 text-base font-semibold">{item.titre}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{item.texte}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="section-shell pb-20">
        <Card className="rounded-3xl border-border/70 shadow-soft">
          <CardContent className="grid gap-10 p-8 lg:grid-cols-[1fr_1.1fr] lg:p-10">
            <div>
              <p className="eyebrow">Candidature</p>
              <h2 className="mt-3 text-3xl font-semibold">Rejoindre le réseau</h2>
              <p className="mt-4 text-sm text-muted-foreground">
                Votre candidature est étudiée par l'équipe Skills4mation. Une fois validée, votre
                accès à l'espace formateur est activé : vous pouvez alors monter vos dossiers de
                formation et récupérer vos pièces Qualiopi.
              </p>
              <ol className="mt-6 space-y-3 text-sm">
                {[
                  "Vous déposez votre candidature",
                  "Échange avec notre équipe pédagogique",
                  "Validation et activation de votre espace",
                  "Vous montez vos premiers dossiers",
                ].map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {sent ? (
              <div className="flex flex-col justify-center rounded-2xl bg-muted/60 p-8 text-center">
                <BadgeCheck className="mx-auto size-10 text-success" />
                <h3 className="mt-4 text-xl font-semibold">Candidature reçue</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Merci ! L'équipe Skills4mation vous contacte sous 48 h ouvrées. Vous recevrez vos
                  accès à l'espace formateur dès validation.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="grid gap-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Prénom" name="prenom" error={errors["prenom"]} required />
                  <Field label="Nom" name="nom" error={errors["nom"]} required />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    error={errors["email"]}
                    required
                    autoComplete="email"
                  />
                  <Field label="Téléphone" name="telephone" error={errors["telephone"]} />
                </div>
                <Field
                  label="Votre expertise"
                  name="expertise"
                  placeholder="Ex. management, cybersécurité, soft skills…"
                  error={errors["expertise"]}
                  required
                />
                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={5}
                    maxLength={1500}
                    placeholder="Parcours, publics formés, volume d'activité souhaité…"
                  />
                </div>
                <Button type="submit" variant="cta" size="lg" disabled={sending}>
                  {sending ? "Envoi…" : "Envoyer ma candidature"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Les données transmises sont utilisées uniquement dans le cadre de l'étude de votre
                  candidature.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </section>
    </PublicLayout>
  );
}

function Field({
  label,
  name,
  error,
  ...rest
}: { label: string; name: string; error?: string | undefined } & React.ComponentProps<typeof Input>) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} aria-invalid={!!error} {...rest} />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
