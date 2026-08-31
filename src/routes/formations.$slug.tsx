import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Clock, MapPin, Target, Users, Wallet } from "lucide-react";
import { toast } from "sonner";

import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { categoryLabel } from "@/data/catalogue";
import { supabase } from "@/integrations/supabase/client";
import {
  FINANCEMENTS_APPRENANT,
  FORMAT_OPTIONS,
  dureeLabel,
  parseProgramme,
  tarifLabel,
  visuelUrl,
  type FormationCatalogue,
} from "@/lib/formations";

const BASE = "https://skills4mation.com";

export const Route = createFileRoute("/formations/$slug")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("formations_catalogue")
      .select("*")
      .eq("slug", params.slug)
      .eq("publiee", true)
      .maybeSingle();
    if (error || !data) throw notFound();
    return { formation: data as FormationCatalogue };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Formation introuvable — Skills4mation" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const f = loaderData.formation;
    const description = (f.intro ?? `Formation ${f.titre} avec Skills4mation.`).slice(0, 155);
    const url = `${BASE}/formations/${params.slug}`;
    const image = f.visuel_url ? `${BASE}${visuelUrl(f.visuel_url)}` : null;
    return {
      meta: [
        { title: `${f.titre} — Formation Skills4mation` },
        { name: "description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { property: "og:title", content: `${f.titre} — Formation Skills4mation` },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: f.titre,
            description,
            url,
            provider: { "@type": "Organization", name: "Skills4mation", url: BASE },
            ...(f.certification ? { educationalCredentialAwarded: f.certification } : {}),
          }),
        },
      ],
    };
  },
  component: PageFormation,
  notFoundComponent: () => (
    <PublicLayout>
      <section className="section-shell py-20">
        <h1 className="text-3xl font-semibold">Formation introuvable</h1>
        <p className="mt-3 text-muted-foreground">
          Cette page de formation n'est plus publiée.
        </p>
        <Button asChild variant="cta" className="mt-6">
          <Link to="/catalogue">Voir le catalogue</Link>
        </Button>
      </section>
    </PublicLayout>
  ),
  errorComponent: ({ error }) => (
    <PublicLayout>
      <section className="section-shell py-20">
        <h1 className="text-2xl font-semibold">Page indisponible</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      </section>
    </PublicLayout>
  ),
});

function PageFormation() {
  const { formation: f } = Route.useLoaderData();
  const programme = parseProgramme(f.programme);
  const visuel = visuelUrl(f.visuel_url);
  const photo = visuelUrl(f.photo_formateur_url);
  const format = FORMAT_OPTIONS.find((o) => o.value === f.format)?.label ?? f.format;

  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [financement, setFinancement] = useState(FINANCEMENTS_APPRENANT[0]!);

  async function inscrire(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const get = (key: string, max = 500) => String(form.get(key) ?? "").trim().slice(0, max);
    setSending(true);
    const { error } = await supabase.from("formations_inscriptions").insert({
      formation_id: f.id,
      formateur_id: f.formateur_id,
      prenom: get("prenom", 80),
      nom: get("nom", 80),
      email: get("email", 160),
      telephone: get("telephone", 30) || null,
      objectif: get("objectif", 800) || null,
      disponibilites: get("disponibilites", 400) || null,
      financement,
      message: get("message", 2000) || null,
    });
    setSending(false);
    if (error) {
      toast.error("Envoi impossible. Vérifiez vos informations et réessayez.");
      return;
    }
    setDone(true);
    toast.success("Demande envoyée : le formateur vous recontacte rapidement.");
  }

  return (
    <PublicLayout>
      <section className="bg-gradient-hero py-14 text-primary-foreground">
        <div className="section-shell grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            {f.categorie ? (
              <p className="eyebrow text-cta">{categoryLabel(f.categorie)}</p>
            ) : null}
            <h1 className="mt-3 text-3xl font-semibold text-primary-foreground sm:text-4xl">
              {f.titre}
            </h1>
            {f.intro ? (
              <p className="mt-4 text-base text-primary-foreground/80">{f.intro}</p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              {dureeLabel(f) ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-3 py-1.5">
                  <Clock className="size-4" /> {dureeLabel(f)}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-3 py-1.5">
                <MapPin className="size-4" /> {format}
              </span>
              {tarifLabel(f) ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cta px-3 py-1.5 font-semibold text-cta-foreground">
                  <Wallet className="size-4" /> {tarifLabel(f)}
                </span>
              ) : null}
            </div>
            <Button asChild variant="cta" className="mt-7">
              <a href="#inscription">Je m'inscris à cette formation</a>
            </Button>
          </div>
          {visuel ? (
            <img
              src={visuel}
              alt={f.titre}
              className="h-64 w-full rounded-2xl object-cover shadow-soft"
              loading="lazy"
            />
          ) : null}
        </div>
      </section>

      <section className="section-shell grid gap-8 py-14 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-6">
          {(f.objectifs ?? []).length || f.objectif ? (
            <Card className="rounded-2xl border-border/70">
              <CardContent className="p-6">
                <h2 className="inline-flex items-center gap-2 text-lg font-semibold">
                  <Target className="size-5 text-secondary" /> Objectifs pédagogiques
                </h2>
                {f.objectif ? <p className="mt-3 text-sm">{f.objectif}</p> : null}
                <ul className="mt-3 grid gap-2 text-sm">
                  {(f.objectifs ?? []).map((o, i) => (
                    <li key={i} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" /> {o}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          {programme.length ? (
            <Card className="rounded-2xl border-border/70">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold">Programme</h2>
                <div className="mt-4 grid gap-4">
                  {programme.map((m, i) => (
                    <div key={i}>
                      <p className="font-semibold">
                        {i + 1}. {m.titre}
                      </p>
                      <ul className="mt-1 grid gap-1 pl-5 text-sm text-muted-foreground">
                        {m.points.map((p, j) => (
                          <li key={j} className="list-disc">
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card className="rounded-2xl border-border/70">
            <CardContent className="grid gap-4 p-6 text-sm sm:grid-cols-2">
              <h2 className="text-lg font-semibold sm:col-span-2">Informations pratiques</h2>
              {[
                ["Public visé", f.public_cible],
                ["Niveau", f.niveau],
                ["Prérequis", f.prerequis],
                ["Lieu", f.lieu_defaut],
                ["Modalités pédagogiques", (f.modalites ?? []).join(", ")],
                ["Moyens pédagogiques", f.moyens_pedagogiques],
                ["Modalités d'évaluation", f.modalites_evaluation],
                ["Accessibilité et handicap", f.accessibilite],
                ["Certification", f.certification],
                ["Tarifs", f.tarif_details],
              ]
                .filter(([, value]) => Boolean(value))
                .map(([label, value]) => (
                  <div key={label as string}>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                    <p className="mt-1 whitespace-pre-line">{value}</p>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card className="rounded-2xl border-border/70">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">Votre formateur</h2>
              <div className="mt-4 flex items-center gap-4">
                <div className="size-16 shrink-0 overflow-hidden rounded-full bg-muted">
                  {photo ? (
                    <img
                      src={photo}
                      alt={f.formateur_nom ?? "Formateur"}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Users className="m-5 size-6 text-muted-foreground" />
                  )}
                </div>
                <p className="font-semibold">{f.formateur_nom ?? "Formateur Skills4mation"}</p>
              </div>
              {f.formateur_bio ? (
                <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">
                  {f.formateur_bio}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card id="inscription" className="rounded-2xl border-secondary/40 bg-secondary/5">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">S'inscrire à cette formation</h2>
              {!f.inscriptions_ouvertes ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Les inscriptions sont momentanément fermées pour cette session.
                </p>
              ) : done ? (
                <p className="mt-3 text-sm">
                  Merci ! Votre demande est transmise au formateur, qui revient vers vous avec les
                  modalités et le financement adapté à votre projet.
                </p>
              ) : (
                <form className="mt-4 grid gap-3" onSubmit={(e) => void inscrire(e)}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="prenom">Prénom</Label>
                      <Input id="prenom" name="prenom" required />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="nom">Nom</Label>
                      <Input id="nom" name="nom" required />
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input id="telephone" name="telephone" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Financement envisagé</Label>
                    <Select value={financement} onValueChange={setFinancement}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FINANCEMENTS_APPRENANT.map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="objectif">Votre objectif professionnel</Label>
                    <Textarea id="objectif" name="objectif" rows={3} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="disponibilites">Vos disponibilités</Label>
                    <Input id="disponibilites" name="disponibilites" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="message">Message (facultatif)</Label>
                    <Textarea id="message" name="message" rows={3} />
                  </div>
                  <Button type="submit" variant="cta" disabled={sending}>
                    {sending ? "Envoi…" : "Envoyer ma demande d'inscription"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}
