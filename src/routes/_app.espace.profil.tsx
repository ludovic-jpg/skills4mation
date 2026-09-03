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
import { useAuth } from "@/hooks/useAuth";
import { REGIONS_FR } from "@/lib/referentiels";
import { supabase } from "@/integrations/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_app/espace/profil")({
  component: Profil,
});

type ProfilPatch = TablesUpdate<"profiles">;

type Piece = "photo" | "nda" | "cv" | "deroule";

const PIECES: Record<
  Piece,
  { bucket: "candidatures" | "profils"; colonne: keyof ProfilPatch; accept: string }
> = {
  photo: { bucket: "profils", colonne: "photo_url", accept: "image/*" },
  nda: { bucket: "profils", colonne: "nda_document_url", accept: "application/pdf" },
  cv: { bucket: "candidatures", colonne: "cv_url", accept: "application/pdf" },
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
      toast.error("Enregistrement impossible.", { id: "profil-save" });
      return;
    }
    await refresh();
    toast.success("Profil mis à jour.", { id: "profil-save" });
  }

  /** Déclenche l'enregistrement de toutes les sections du profil d'un seul geste. */
  function enregistrerTout() {
    document
      .querySelectorAll<HTMLFormElement>("form[data-profil]")
      .forEach((form) => form.requestSubmit());
  }

  const manquant: string[] = [];
  if (!profile?.prenom || !profile?.nom) manquant.push("votre identité");
  if (!profile?.telephone) manquant.push("votre téléphone");
  if (!profile?.entreprise || !profile?.siret) manquant.push("votre entreprise (raison sociale et SIRET)");
  if (!profile?.cv_url) manquant.push("votre CV");
  if (!profile?.deroule_pedagogique_url) manquant.push("votre déroulé pédagogique");

  const statut = profile?.statut_candidature ?? "en_attente";
  const soumise = statut === "en_cours" || statut === "valide";

  async function soumettre() {
    if (!user) return;
    if (manquant.length) {
      toast.error(`Complétez d'abord : ${manquant.join(", ")}.`);
      return;
    }
    setSaving("candidature");
    const { error } = await supabase
      .from("profiles")
      .update({ statut_candidature: "en_cours" })
      .eq("id", user.id);
    setSaving(null);
    if (error) {
      toast.error("La candidature n'a pas pu être soumise.");
      return;
    }
    await refresh();
    toast.success("Candidature soumise à l'équipe Skills4mation.");
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
              <StatutBadge kind="candidature" statut={statut} />
            </div>

            <div className="mt-4">
              <LinkedinConnect />
            </div>

            <form
              data-profil
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
            <h2 className="text-base font-semibold">Mon entreprise</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ces informations alimentent les conventions et contrats de sous-traitance.
            </p>
            <form
              data-profil
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
              data-profil
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
              CV et déroulé(s) pédagogique(s) — téléchargeables à tout moment.
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
                label="Déroulé(s) pédagogique(s)"
                bucket="candidatures"
                path={profile?.deroule_pedagogique_url ?? null}
                busy={saving === "deroule"}
                onFile={(file) => void upload("deroule", file)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-secondary/40 bg-secondary/5 shadow-soft">
          <CardContent className="grid gap-4 p-6">
            <div>
              <h2 className="text-base font-semibold">Enregistrer et soumettre</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Enregistrez vos informations autant de fois que nécessaire, puis soumettez votre
                candidature à l'équipe Skills4mation pour validation.
              </p>
            </div>
            {manquant.length ? (
              <p className="text-sm text-muted-foreground">
                À compléter avant de soumettre : {manquant.join(", ")}.
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={enregistrerTout}>
                Enregistrer
              </Button>
              <Button
                variant="cta"
                disabled={saving === "candidature" || soumise || manquant.length > 0}
                onClick={() => void soumettre()}
              >
                {statut === "valide"
                  ? "Candidature validée"
                  : soumise
                    ? "Candidature soumise"
                    : saving === "candidature"
                      ? "Envoi…"
                      : "Soumettre la candidature"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
