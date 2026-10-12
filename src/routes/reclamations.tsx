import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { CheckCircle2, ShieldAlert } from "lucide-react";

import { PageHero, PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reclamations")({
  head: () => ({
    meta: [
      { title: "Réclamation, difficulté ou aléa | Skills4mation" },
      {
        name: "description",
        content:
          "Signalez une réclamation, une difficulté ou un aléa rencontré pendant une formation Skills4mation (groupe Back to Business / Formatrix). Chaque signalement est enregistré, suivi et traité sous 15 jours ouvrés.",
      },
      { property: "og:title", content: "Réclamation ou difficulté — Skills4mation" },
      {
        property: "og:description",
        content:
          "Formulaire de signalement pour les bénéficiaires, financeurs et formateurs Skills4mation.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://skills4mation.com/reclamations" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://skills4mation.com/reclamations" }],
  }),
  component: Reclamations,
});

export const TYPES_RECLAMATION = [
  { value: "reclamation", label: "Réclamation" },
  { value: "difficulte", label: "Difficulté rencontrée" },
  { value: "alea", label: "Aléa (santé, planning, technique…)" },
  { value: "appreciation", label: "Appréciation / suggestion" },
] as const;

const schema = z.object({
  nom: z.string().trim().min(1, "Nom requis").max(120),
  email: z.string().trim().email("Email invalide").max(255),
  formation_concernee: z.string().trim().max(200).optional(),
  type: z.enum(["reclamation", "difficulte", "alea", "appreciation"]),
  message: z.string().trim().min(10, "Merci de décrire la situation").max(2000),
});

function Reclamations() {
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recu, setRecu] = useState<{ numero: string; date: string } | null>(null);

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
    const id = crypto.randomUUID();
    const { error } = await supabase.from("reclamations").insert({
      id,
      nom: parsed.data.nom,
      email: parsed.data.email,
      formation_concernee: parsed.data.formation_concernee ?? null,
      type: parsed.data.type,
      message: parsed.data.message,
      statut: "nouvelle",
    });
    setSending(false);
    if (error) {
      toast.error(
        "L'enregistrement a échoué. Merci de réessayer ou d'écrire à pedagogie@formatrix.fr.",
      );
      return;
    }
    setRecu({
      numero: `REC-${id.slice(0, 8).toUpperCase()}`,
      date: new Date().toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" }),
    });
    toast.success("Réclamation enregistrée.");
  }

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Qualité"
        title="Réclamation, difficulté ou aléa"
        description="Skills4mation, nom commercial du groupe Back to Business / Formatrix, traite toute réclamation, difficulté ou aléa signalé par un bénéficiaire, un financeur ou un formateur. Chaque signalement est enregistré dans notre registre qualité, horodaté, examiné par l'équipe pédagogique et suivi jusqu'à sa résolution."
      />

      <section className="section-shell pt-14">
        <ul className="grid gap-4 text-sm text-muted-foreground md:grid-cols-2">
          <li className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <span className="leading-relaxed">
              Accusé de réception immédiat avec un numéro de suivi, puis réponse écrite de l'équipe
              pédagogique sous 15 jours ouvrés. Si la réponse ne vous satisfait pas, demandez un
              réexamen de second niveau à Ludovic Albisser, Président, responsable du traitement des
              réclamations (ludovic@formatrix.fr), qui répond sous 15 jours ouvrés. Vous pouvez
              aussi informer l'organisme financeur de votre formation. Médiateur de la consommation
              : en cours de désignation.
            </span>
          </li>
          <li className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <span className="leading-relaxed">
              Les signalements alimentent notre démarche d'amélioration continue (analyse des
              causes, action corrective, suivi). Vous pouvez aussi nous écrire directement à{" "}
              <a
                href="mailto:pedagogie@formatrix.fr"
                className="font-medium text-primary underline"
              >
                pedagogie@formatrix.fr
              </a>
              .
            </span>
          </li>
        </ul>
      </section>

      <section className="section-shell py-10 pb-14">
        <Card className="rounded-3xl border-border/70 shadow-soft">
          <CardContent className="p-6 sm:p-10">
            {recu ? (
              <div className="max-w-xl">
                <CheckCircle2 className="size-8 text-secondary" aria-hidden />
                <h2 className="mt-4 text-2xl font-semibold">Accusé de réception</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Votre signalement a été enregistré le <strong>{recu.date}</strong> sous le numéro
                  de suivi <strong>{recu.numero}</strong>. Conservez ce numéro pour tout échange
                  avec l'équipe pédagogique (pedagogie@formatrix.fr). Une réponse écrite vous sera
                  apportée sous 15 jours ouvrés.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2" noValidate>
                <div className="sm:col-span-2">
                  <h2 className="text-2xl font-semibold">Signaler une situation</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Décrivez précisément la situation : nous accusons réception immédiatement et
                    revenons vers vous par e-mail sous 15 jours ouvrés.
                  </p>
                </div>

                <div>
                  <Label htmlFor="nom">Nom *</Label>
                  <Input id="nom" name="nom" className="mt-2" autoComplete="name" />
                  {errors["nom"] ? (
                    <p className="mt-1 text-xs text-destructive">{errors["nom"]}</p>
                  ) : null}
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    className="mt-2"
                    autoComplete="email"
                  />
                  {errors["email"] ? (
                    <p className="mt-1 text-xs text-destructive">{errors["email"]}</p>
                  ) : null}
                </div>

                <div>
                  <Label htmlFor="formation_concernee">Formation concernée</Label>
                  <Input id="formation_concernee" name="formation_concernee" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="type">Type de signalement *</Label>
                  <select
                    id="type"
                    name="type"
                    defaultValue="reclamation"
                    className="mt-2 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    {TYPES_RECLAMATION.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="message">Votre message *</Label>
                  <Textarea id="message" name="message" rows={6} className="mt-2" />
                  {errors["message"] ? (
                    <p className="mt-1 text-xs text-destructive">{errors["message"]}</p>
                  ) : null}
                </div>

                <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
                  <Button type="submit" variant="cta" size="lg" disabled={sending}>
                    {sending ? "Envoi en cours…" : "Envoyer mon signalement"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Vos informations servent uniquement au traitement de votre signalement (voir
                    notre politique de confidentialité).
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
