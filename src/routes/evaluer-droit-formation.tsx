import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { CheckCircle2, Compass, FolderCheck, GraduationCap, Wallet } from "lucide-react";

import apprenantsDuo from "@/assets/apprenants-duo.jpg";
import entreeApprenant from "@/assets/entree-apprenant.jpg";
import { PageHero, PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/evaluer-droit-formation")({
  head: () => ({
    meta: [
      { title: "Évaluer mes droits formation — Skills4mation" },
      {
        name: "description",
        content:
          "Évaluez vos droits à la formation avec SKILLS4MATION : accompagnement personnalisé, accès simplifié aux financements (OPCO, Transitions Pro, AIF), catalogue de formations éligibles et gestion administrative optimisée.",
      },
      { property: "og:title", content: "Évaluer mes droits formation — Skills4mation" },
      {
        property: "og:description",
        content:
          "Votre parcours, nos solutions : nos experts analysent vos droits et vous guident vers les meilleures opportunités de formation prises en charge.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:url",
        content: "https://train-grow-connect.lovable.app/evaluer-droit-formation",
      },
    ],
    links: [
      { rel: "canonical", href: "https://train-grow-connect.lovable.app/evaluer-droit-formation" },
    ],
  }),
  component: EvaluerDroitFormation,
});

const ATOUTS = [
  {
    icon: Compass,
    titre: "Un accompagnement personnalisé",
    texte:
      "Nos experts analysent vos droits et vous guident vers les meilleures opportunités de formation prises en charge.",
  },
  {
    icon: Wallet,
    titre: "Un accès simplifié aux financements",
    texte:
      "OPCO, Transitions Pro, fonds d'assurance formation, aides régionales : nous vous aidons à trouver les solutions adaptées à votre situation.",
  },
  {
    icon: GraduationCap,
    titre: "Un catalogue de formations éligibles",
    texte:
      "Développez vos compétences avec des formations reconnues et adaptées à votre projet professionnel.",
  },
  {
    icon: FolderCheck,
    titre: "Une gestion administrative optimisée",
    texte:
      "Nous nous occupons des démarches pour vous permettre de vous concentrer sur votre montée en compétences.",
  },
];

const ETAPES = [
  "Vous complétez le formulaire d'évaluation de vos droits en moins de 3 minutes.",
  "Un expert Skills4mation analyse votre situation et vos dispositifs mobilisables.",
  "Nous vous proposons un parcours et un plan de financement chiffré.",
  "Nous montons le dossier administratif et vous suivons jusqu'à la fin de la formation.",
];

const STATUTS = [
  "Salarié(e)",
  "Indépendant(e) / TNS",
  "Dirigeant(e) / employeur",
  "En recherche d'emploi",
  "Fonctionnaire / agent public",
  "Étudiant(e) / autre",
];

const DISPOSITIFS = [
  "OPCO / plan de développement des compétences",
  "Projet de transition professionnelle (Transitions Pro)",
  "Fonds d'assurance formation (FIFPL, AGEFICE, FAFCEA…)",
  "Aide Individuelle à la Formation / dispositif régional",
  "Financement personnel",
  "Je ne sais pas encore",
];

const schema = z.object({
  prenom: z.string().trim().min(1, "Prénom requis").max(80),
  nom: z.string().trim().min(1, "Nom requis").max(80),
  email: z.string().trim().email("Email invalide").max(255),
  telephone: z.string().trim().max(30).optional(),
  statut_pro: z.string().trim().max(80).optional(),
  situation: z.string().trim().max(300).optional(),
  formation_visee: z.string().trim().max(200).optional(),
  objectif_professionnel: z
    .string()
    .trim()
    .min(5, "Décrivez votre objectif professionnel")
    .max(1000),
  disponibilites: z.string().trim().max(300).optional(),
  budget_estime: z.string().trim().max(80).optional(),
  message: z.string().trim().max(1500).optional(),
});

function EvaluerDroitFormation() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dispositifs, setDispositifs] = useState<string[]>([]);

  function toggleDispositif(value: string, checked: boolean) {
    setDispositifs((prev) => (checked ? [...prev, value] : prev.filter((d) => d !== value)));
  }

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
    const { error } = await supabase.from("demandes_droits_formation").insert({
      prenom: parsed.data.prenom,
      nom: parsed.data.nom,
      email: parsed.data.email,
      telephone: parsed.data.telephone || null,
      statut_pro: parsed.data.statut_pro || null,
      situation: parsed.data.situation || null,
      formation_visee: parsed.data.formation_visee || null,
      objectif_professionnel: parsed.data.objectif_professionnel,
      disponibilites: parsed.data.disponibilites || null,
      budget_estime: parsed.data.budget_estime || null,
      message: parsed.data.message || null,
      dispositifs: dispositifs.length > 0 ? dispositifs : null,
    });
    setSending(false);
    if (error) {
      toast.error("L'envoi a échoué. Merci de réessayer.");
      return;
    }
    setSent(true);
    toast.success("Demande enregistrée : un expert vous répond sous 48 h ouvrées.");
  }

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Apprenants"
        title="Évaluer mes droits formation — votre parcours, nos solutions !"
        description="Chez SKILLS4MATION, nous mettons un point d'honneur à défendre vos intérêts et à vous accompagner dans l'accès aux formations financées. Vous disposez de droits à la formation, encore faut-il savoir comment les mobiliser !"
      />

      <section className="section-shell grid items-center gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Pourquoi évaluer vos droits avec SKILLS4MATION ?
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {ATOUTS.map((atout) => (
              <Card key={atout.titre} className="rounded-2xl border-border/70 shadow-soft">
                <CardContent className="p-6">
                  <span className="inline-flex rounded-xl bg-accent p-3 text-accent-foreground">
                    <atout.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{atout.titre}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {atout.texte}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <img
          src={entreeApprenant}
          alt="Apprenante souriante échangeant avec un conseiller Skills4mation sur ses droits à la formation"
          loading="lazy"
          className="h-full w-full rounded-3xl object-cover shadow-soft"
        />
      </section>

      <section className="bg-muted/50 py-14">
        <div className="section-shell grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <img
            src={apprenantsDuo}
            alt="Deux apprenants travaillant ensemble sur leur projet de formation"
            loading="lazy"
            className="h-full w-full rounded-3xl object-cover shadow-soft"
          />
          <div>
            <p className="eyebrow text-secondary">Comment ça marche ?</p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
              Quatre étapes, zéro paperasse pour vous
            </h2>
            <ol className="mt-8 space-y-4">
              {ETAPES.map((etape, index) => (
                <li key={etape} className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <p className="pt-1.5 text-sm leading-relaxed text-muted-foreground">{etape}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="formulaire" className="section-shell scroll-mt-24 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow text-secondary">Formulaire</p>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
            Demander l'évaluation de mes droits
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Vos réponses sont transmises directement à notre équipe pédagogique et financement.
            Réponse sous 48 heures ouvrées.
          </p>

          {sent ? (
            <Card className="mt-8 rounded-3xl border-success/40 bg-success/10 shadow-soft">
              <CardContent className="p-8">
                <CheckCircle2 className="size-8 text-success" aria-hidden />
                <h3 className="mt-4 text-lg font-semibold">Demande enregistrée</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Merci ! Un expert Skills4mation analyse vos droits et revient vers vous sous 48
                  heures ouvrées avec les dispositifs mobilisables et un plan de financement.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="mt-8 rounded-3xl border-border/70 shadow-soft">
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
                  <Champ label="Prénom *" name="prenom" error={errors.prenom} />
                  <Champ label="Nom *" name="nom" error={errors.nom} />
                  <Champ label="Email *" name="email" type="email" error={errors.email} />
                  <Champ label="Téléphone" name="telephone" error={errors.telephone} />

                  <div>
                    <Label htmlFor="statut_pro">Votre statut professionnel</Label>
                    <select
                      id="statut_pro"
                      name="statut_pro"
                      defaultValue=""
                      className="mt-2 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Sélectionner…</option>
                      {STATUTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Champ
                    label="Formation ou domaine visé"
                    name="formation_visee"
                    error={errors.formation_visee}
                  />

                  <div className="sm:col-span-2">
                    <Label htmlFor="objectif_professionnel">Votre objectif professionnel *</Label>
                    <Textarea
                      id="objectif_professionnel"
                      name="objectif_professionnel"
                      rows={4}
                      className="mt-2"
                      placeholder="Reconversion, montée en compétences, évolution interne, création d'activité…"
                    />
                    {errors.objectif_professionnel ? (
                      <p className="mt-1 text-xs text-destructive">
                        {errors.objectif_professionnel}
                      </p>
                    ) : null}
                  </div>

                  <Champ
                    label="Votre situation actuelle (employeur, secteur…)"
                    name="situation"
                    error={errors.situation}
                  />
                  <Champ
                    label="Vos disponibilités"
                    name="disponibilites"
                    error={errors.disponibilites}
                    placeholder="Soirs, semaine, 100 % distanciel…"
                  />

                  <div className="sm:col-span-2">
                    <p className="text-sm font-medium">Dispositifs de financement envisagés</p>
                    <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                      {DISPOSITIFS.map((d) => (
                        <label key={d} className="flex items-start gap-2.5 text-sm">
                          <Checkbox
                            checked={dispositifs.includes(d)}
                            onCheckedChange={(checked) => toggleDispositif(d, checked === true)}
                          />
                          <span className="leading-snug text-muted-foreground">{d}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Champ
                    label="Budget estimé"
                    name="budget_estime"
                    error={errors.budget_estime}
                    placeholder="Ex. 1 500 – 3 000 €"
                  />
                  <div className="sm:col-span-2">
                    <Label htmlFor="message">Précisions complémentaires</Label>
                    <Textarea id="message" name="message" rows={3} className="mt-2" />
                  </div>

                  <div className="sm:col-span-2">
                    <Button type="submit" variant="cta" size="lg" disabled={sending}>
                      {sending ? "Envoi…" : "Évaluer mes droits formation"}
                    </Button>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Les données transmises sont traitées uniquement pour l'étude de votre projet de
                      formation, conformément à notre politique de confidentialité.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </PublicLayout>
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
  type?: string;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} placeholder={placeholder} className="mt-2" />
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
