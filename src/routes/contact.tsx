import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { CheckCircle2, Mail, MapPin, Phone } from "lucide-react";

import { PageHero, PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Parler de mon projet de formation — Skills4mation" },
      {
        name: "description",
        content:
          "Échangeons sur votre projet de formation : objectif professionnel, choix du formateur, disponibilités et plan de financement. Réponse sous 48 h ouvrées.",
      },
      { property: "og:title", content: "Parler de mon projet de formation — Skills4mation" },
      {
        property: "og:description",
        content: "Un entretien de cadrage pour construire votre parcours sur mesure.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://train-grow-connect.lovable.app/contact" },
    ],
    links: [{ rel: "canonical", href: "https://train-grow-connect.lovable.app/contact" }],
  }),
  component: Contact,
});

const PROFILS = [
  "Salarié(e)",
  "Indépendant(e) / TNS",
  "Dirigeant(e) / employeur",
  "En recherche d'emploi / transition",
  "Entreprise de formation / conseil",
  "Autre",
];

const schema = z.object({
  prenom: z.string().trim().min(1, "Prénom requis").max(80),
  nom: z.string().trim().min(1, "Nom requis").max(80),
  email: z.string().trim().email("Email invalide").max(255),
  telephone: z.string().trim().max(30).optional(),
  profil: z.string().trim().max(80).optional(),
  formation_souhaitee: z.string().trim().max(200).optional(),
  objectif: z.string().trim().min(5, "Décrivez votre objectif professionnel").max(1000),
  disponibilites: z.string().trim().max(300).optional(),
  budget_estime: z.string().trim().max(80).optional(),
  message: z.string().trim().max(1500).optional(),
});

function Contact() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) map[String(issue.path[0])] = issue.message;
      setErrors(map);
      return;
    }
    setErrors({});
    setSending(true);
    const { error } = await supabase.from("demandes_contact").insert({
      prenom: parsed.data.prenom,
      nom: parsed.data.nom,
      email: parsed.data.email,
      telephone: parsed.data.telephone ?? null,
      profil: parsed.data.profil ?? null,
      formation_souhaitee: parsed.data.formation_souhaitee ?? null,
      objectif: parsed.data.objectif,
      disponibilites: parsed.data.disponibilites ?? null,
      budget_estime: parsed.data.budget_estime ?? null,
      message: parsed.data.message ?? null,
    });
    setSending(false);
    if (error) {
      toast.error("L'envoi a échoué. Merci de réessayer.");
      return;
    }
    setSent(true);
    toast.success("Demande envoyée : nous revenons vers vous sous 48 h ouvrées.");
  }

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Contact"
        title="Parler de mon projet de formation"
        description="Apprenant, entreprise ou formateur : présentez-nous votre objectif, vos disponibilités et votre situation de financement. Notre équipe vous répond sous 48 heures ouvrées."
      />

      <section className="section-shell grid gap-5 py-14 sm:grid-cols-3">
        {[
          { icon: Mail, titre: "Email", valeur: "contact@skills4mation.com" },
          { icon: Phone, titre: "Téléphone", valeur: "+33 (0)1 84 80 00 00" },
          {
            icon: MapPin,
            titre: "Adresse",
            valeur: "France — interventions sur tout le territoire",
          },
        ].map((item) => (
          <Card key={item.titre} className="rounded-2xl border-border/70 shadow-soft">
            <CardContent className="p-6">
              <span className="inline-flex rounded-xl bg-accent p-3 text-accent-foreground">
                <item.icon className="size-5" />
              </span>
              <h2 className="mt-4 text-base font-semibold">{item.titre}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.valeur}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section id="formulaire" className="section-shell scroll-mt-24 pb-20">
        <Card className="rounded-3xl border-border/70 shadow-soft">
          <CardContent className="p-6 sm:p-10">
            {sent ? (
              <div className="max-w-xl">
                <CheckCircle2 className="size-8 text-secondary" aria-hidden />
                <h2 className="mt-4 text-2xl font-semibold">Votre demande est enregistrée</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Un récapitulatif de votre échange vous est adressé par email au nom de
                  Skills4mation. Notre équipe revient vers vous sous 48 heures ouvrées avec une
                  proposition de formateur, de programme et de financement.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2" noValidate>
                <div className="sm:col-span-2">
                  <h2 className="text-2xl font-semibold">Votre projet en quelques champs</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Plus vous êtes précis sur votre objectif et vos disponibilités, plus notre
                    proposition sera sur mesure.
                  </p>
                </div>

                <Field
                  id="prenom"
                  label="Prénom *"
                  error={errors["prenom"]}
                  autoComplete="given-name"
                />
                <Field id="nom" label="Nom *" error={errors["nom"]} autoComplete="family-name" />
                <Field
                  id="email"
                  label="Email *"
                  type="email"
                  error={errors["email"]}
                  autoComplete="email"
                />
                <Field
                  id="telephone"
                  label="Téléphone"
                  error={errors["telephone"]}
                  autoComplete="tel"
                />

                <div>
                  <Label htmlFor="profil">Votre situation</Label>
                  <select
                    id="profil"
                    name="profil"
                    defaultValue={PROFILS[0]}
                    className="mt-2 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    {PROFILS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <Field
                  id="formation_souhaitee"
                  label="Formation ou domaine visé"
                  error={errors["formation_souhaitee"]}
                />

                <div className="sm:col-span-2">
                  <Label htmlFor="objectif">Votre objectif professionnel *</Label>
                  <Textarea
                    id="objectif"
                    name="objectif"
                    rows={4}
                    className="mt-2"
                    placeholder="Prise de poste, évolution, reconversion, développement de mon activité…"
                  />
                  {errors["objectif"] ? (
                    <p className="mt-1 text-xs text-destructive">{errors["objectif"]}</p>
                  ) : null}
                </div>

                <Field
                  id="disponibilites"
                  label="Vos disponibilités"
                  placeholder="Ex. soirées en semaine, samedis, 2 demi-journées / semaine"
                  error={errors["disponibilites"]}
                />
                <Field
                  id="budget_estime"
                  label="Budget / financement envisagé"
                  placeholder="Ex. OPCO, FIFPL, employeur, autofinancement"
                  error={errors["budget_estime"]}
                />

                <div className="sm:col-span-2">
                  <Label htmlFor="message">Précisions complémentaires</Label>
                  <Textarea id="message" name="message" rows={4} className="mt-2" />
                </div>

                <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
                  <Button type="submit" variant="cta" size="lg" disabled={sending}>
                    {sending ? "Envoi en cours…" : "Envoyer ma demande"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Vos informations servent uniquement à traiter votre demande de formation.
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </section>
    </PublicLayout>
  );
}

function Field({
  id,
  label,
  error,
  type = "text",
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  type?: string;
  placeholder?: string | undefined;
  autoComplete?: string | undefined;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="mt-2"
      />
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
