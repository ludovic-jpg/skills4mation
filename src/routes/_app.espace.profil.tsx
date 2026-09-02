import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { DocField } from "@/components/app/DocField";
import { FORMATEUR_NAV } from "@/components/app/nav";
import { LinkedinConnect } from "@/components/app/LinkedinConnect";
import { StatutBadge } from "@/components/StatutBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Combobox } from "@/components/dossier/fields";
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
import { CATEGORIES } from "@/data/catalogue";
import { useAuth } from "@/hooks/useAuth";
import { REGIONS_FR } from "@/lib/referentiels";
import { supabase } from "@/integrations/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_app/espace/profil")({
  component: Profil,
});

type ProfilPatch = TablesUpdate<"profiles">;

type Piece = "photo" | "nda" | "cv" | "parcours" | "deroule";

const PIECES: Record<
  Piece,
  { bucket: "candidatures" | "profils"; colonne: keyof ProfilPatch; accept: string }
> = {
  photo: { bucket: "profils", colonne: "photo_url", accept: "image/*" },
  nda: { bucket: "profils", colonne: "nda_document_url", accept: "application/pdf" },
  cv: { bucket: "candidatures", colonne: "cv_url", accept: "application/pdf" },
  parcours: {
    bucket: "candidatures",
    colonne: "parcours_formation_url",
    accept: "application/pdf",
  },
  deroule: {
    bucket: "candidatures",
    colonne: "deroule_pedagogique_url",
    accept: "application/pdf",
  },
};

function Profil() {
  const { profile, user, refresh } = useAuth();
  const [saving, setSaving] = useState<string | null>(null);
  const [region, setRegion] = useState(profile?.nda_region ?? "");
  const [regionSync, setRegionSync] = useState(profile?.nda_region ?? "");
  if ((profile?.nda_region ?? "") !== regionSync) {
    setRegionSync(profile?.nda_region ?? "");
    setRegion(profile?.nda_region ?? "");
  }
  const [secteur, setSecteur] = useState(profile?.secteur_activite ?? "");
  const [secteurSync, setSecteurSync] = useState(profile?.secteur_activite ?? "");
  if ((profile?.secteur_activite ?? "") !== secteurSync) {
    setSecteurSync(profile?.secteur_activite ?? "");
    setSecteur(profile?.secteur_activite ?? "");
  }


  async function upload(kind: Piece, file: File) {
    if (!user) return;
    const { bucket, colonne } = PIECES[kind];
    setSaving(kind);
    const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
    const path = `${user.id}/${kind}.${ext}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true, contentType: file.type || "application/pdf" });
    if (error) {
      setSaving(null);
      toast.error("Envoi du fichier impossible.");
      return;
    }
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ [colonne]: path } as ProfilPatch)
      .eq("id", user.id);
    setSaving(null);
    if (profileError) {
      toast.error("Le fichier est envoyé mais n'a pas pu être rattaché à votre profil.");
      return;
    }
    await refresh();
    toast.success("Document enregistré.");
  }

  async function save(section: string, patch: ProfilPatch) {
    if (!user) return;
    setSaving(section);
    const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
    setSaving(null);
    if (error) {
      toast.error("Enregistrement impossible.");
      return;
    }
    await refresh();
    toast.success("Profil mis à jour.");
  }

  function text(form: FormData, key: string, max = 200) {
    const value = String(form.get(key) ?? "").trim().slice(0, max);
    return value || null;
  }

  return (
    <AppShell
      items={FORMATEUR_NAV}
      title="Mon profil formateur"
      subtitle="Renseignez une fois vos informations : chaque nouveau dossier de formation les reprend automatiquement"
    >
      <div className="grid gap-6">
        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Identité</h2>
              <StatutBadge
                kind="candidature"
                statut={profile?.statut_candidature ?? "en_attente"}
              />
            </div>

            <div className="mt-4">
              <LinkedinConnect />
            </div>



            <form
              className="mt-5 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void save("identite", {
                  prenom: text(form, "prenom", 80) ?? "",
                  nom: text(form, "nom", 80) ?? "",
                  telephone: text(form, "telephone", 30),
                  adresse: text(form, "adresse", 300),
                  date_naissance: String(form.get("date_naissance") ?? "") || null,
                });
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input id="prenom" name="prenom" defaultValue={profile?.prenom ?? ""} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input id="nom" name="nom" defaultValue={profile?.nom ?? ""} required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" value={profile?.email ?? ""} disabled />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input id="telephone" name="telephone" defaultValue={profile?.telephone ?? ""} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date_naissance">Date de naissance</Label>
                  <Input
                    id="date_naissance"
                    name="date_naissance"
                    type="date"
                    defaultValue={profile?.date_naissance ?? ""}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="adresse">Adresse personnelle</Label>
                <Input id="adresse" name="adresse" defaultValue={profile?.adresse ?? ""} />
              </div>
              <DocField
                label="Photo de profil"
                hint="JPG ou PNG"
                bucket="profils"
                accept="image/*"
                path={profile?.photo_url ?? null}
                busy={saving === "photo"}
                onFile={(file) => void upload("photo", file)}
              />
              <Button type="submit" variant="cta" disabled={saving === "identite"}>
                {saving === "identite" ? "Enregistrement…" : "Enregistrer mon identité"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardContent className="p-6">
            <h2 className="text-base font-semibold">Mon expertise</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Votre secteur principal et un résumé court de votre expertise (le parcours
              professionnel détaillé reste plus bas).
            </p>
            <form
              className="mt-4 grid gap-4 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void save("expertise", {
                  secteur_activite: secteur || null,
                  expertise: String(form.get("expertise") ?? "").trim().slice(0, 500) || null,
                });
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="secteur_activite">Secteur d'activité</Label>
                <Select value={secteur} onValueChange={setSecteur}>
                  <SelectTrigger id="secteur_activite">
                    <SelectValue placeholder="Choisir un secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="expertise">Résumé de mon expertise (500 caractères max)</Label>
                <Textarea
                  id="expertise"
                  name="expertise"
                  rows={4}
                  maxLength={500}
                  defaultValue={profile?.expertise ?? ""}
                  placeholder="En quelques lignes : vos domaines de spécialité, publics et formats de prédilection…"
                />
              </div>
              <Button
                type="submit"
                variant="cta"
                className="justify-self-start sm:col-span-2"
                disabled={saving === "expertise"}
              >
                {saving === "expertise" ? "Enregistrement…" : "Enregistrer mon expertise"}
              </Button>
            </form>
          </CardContent>
        </Card>



        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardContent className="p-6">
            <h2 className="text-base font-semibold">Entreprise</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ces informations alimentent les conventions et contrats de sous-traitance.
            </p>
            <form
              className="mt-5 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void save("entreprise", {
                  entreprise: text(form, "entreprise", 150),
                  entreprise_adresse: text(form, "entreprise_adresse", 300),
                  siret: text(form, "siret", 20),
                });
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="entreprise">Raison sociale</Label>
                  <Input
                    id="entreprise"
                    name="entreprise"
                    defaultValue={profile?.entreprise ?? ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="siret">SIRET</Label>
                  <Input
                    id="siret"
                    name="siret"
                    maxLength={20}
                    defaultValue={profile?.siret ?? ""}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="entreprise_adresse">Adresse de l'entreprise</Label>
                <Input
                  id="entreprise_adresse"
                  name="entreprise_adresse"
                  defaultValue={profile?.entreprise_adresse ?? ""}
                />
              </div>
              <Button type="submit" variant="cta" disabled={saving === "entreprise"}>
                {saving === "entreprise" ? "Enregistrement…" : "Enregistrer mon entreprise"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardContent className="p-6">
            <h2 className="text-base font-semibold">Déclaration d'activité (NDA)</h2>
            <form
              className="mt-5 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void save("nda", {
                  numero_nda: text(form, "numero_nda", 30),
                  nda_region: region.trim().slice(0, 100) || null,
                });
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="numero_nda">Numéro de déclaration d'activité</Label>
                  <Input
                    id="numero_nda"
                    name="numero_nda"
                    defaultValue={profile?.numero_nda ?? ""}
                  />
                </div>
                <Combobox
                  label="Région de dépôt"
                  value={region}
                  onChange={setRegion}
                  options={REGIONS_FR}
                  placeholder="Rechercher une région…"
                />
              </div>
              <DocField
                label="Justificatif de déclaration d'activité"
                hint="PDF"
                bucket="profils"
                path={profile?.nda_document_url ?? null}
                busy={saving === "nda"}
                onFile={(file) => void upload("nda", file)}
              />
              <Button type="submit" variant="cta" disabled={saving === "nda"}>
                {saving === "nda" ? "Enregistrement…" : "Enregistrer ma déclaration"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardContent className="p-6">
            <h2 className="text-base font-semibold">Pièces pédagogiques</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              CV, parcours de formation et déroulé(s) pédagogique(s) — téléchargeables à tout
              moment.
            </p>
            <div className="mt-5 grid gap-4">
              <DocField
                label="CV"
                bucket="candidatures"
                path={profile?.cv_url ?? null}
                busy={saving === "cv"}
                onFile={(file) => void upload("cv", file)}
              />
              <DocField
                label="Parcours de formation (document)"
                bucket="candidatures"
                path={profile?.parcours_formation_url ?? null}
                busy={saving === "parcours"}
                onFile={(file) => void upload("parcours", file)}
              />
              <DocField
                label="Déroulé(s) pédagogique(s)"
                bucket="candidatures"
                path={profile?.deroule_pedagogique_url ?? null}
                busy={saving === "deroule"}
                onFile={(file) => void upload("deroule", file)}
              />
            </div>

            <form
              className="mt-6 grid gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void save("parcours-texte", {
                  parcours_formation: String(form.get("parcours_formation") ?? "").slice(0, 5000),
                });
              }}
            >
              <Label htmlFor="parcours_formation">Parcours professionnel et pédagogique</Label>
              <Textarea
                id="parcours_formation"
                name="parcours_formation"
                rows={6}
                maxLength={5000}
                defaultValue={profile?.parcours_formation ?? ""}
                placeholder="Expériences, publics formés, thématiques maîtrisées…"
              />
              <Button
                type="submit"
                variant="cta"
                className="justify-self-start"
                disabled={saving === "parcours-texte"}
              >
                {saving === "parcours-texte" ? "Enregistrement…" : "Enregistrer mon parcours"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
