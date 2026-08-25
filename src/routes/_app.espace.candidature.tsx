import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, FileText, Upload } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { CANDIDAT_NAV, FORMATEUR_NAV } from "@/components/app/nav";
import { StatutBadge } from "@/components/StatutBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, type CandidatureStatut } from "@/lib/statuts";

export const Route = createFileRoute("/_app/espace/candidature")({
  component: MaCandidature,
});

const ETAPES: { statut: CandidatureStatut; label: string }[] = [
  { statut: "en_attente", label: "Candidature reçue" },
  { statut: "en_cours", label: "En cours d'étude" },
  { statut: "valide", label: "Acceptée" },
];

function MaCandidature() {
  const { user, profile, isValidatedFormateur, refresh } = useAuth();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);

  const { data: candidature, isLoading } = useQuery({
    queryKey: ["ma-candidature", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidatures")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });

  async function upload(kind: "cv" | "deroule", file: File) {
    if (!user) return;
    setBusy(kind);
    const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
    const path = `${user.id}/${kind}.${ext}`;
    const { error } = await supabase.storage
      .from("candidatures")
      .upload(path, file, { upsert: true, contentType: file.type || "application/pdf" });
    if (!error) {
      const patch =
        kind === "cv" ? { cv_url: path } : { deroule_pedagogique_url: path };
      const { error: profileError } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", user.id);
      if (profileError) {
        setBusy(null);
        toast.error("Le fichier est envoyé mais n'a pas pu être rattaché à votre profil.");
        return;
      }
    }
    setBusy(null);
    if (error) {
      toast.error("Envoi du fichier impossible.");
      return;
    }
    await refresh();
    void queryClient.invalidateQueries({ queryKey: ["ma-candidature"] });
    toast.success("Document enregistré.");
  }

  async function saveParcours(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const form = new FormData(event.currentTarget);
    setBusy("parcours");
    const { error } = await supabase
      .from("profiles")
      .update({ parcours_formation: String(form.get("parcours") ?? "").slice(0, 5000) })
      .eq("id", user.id);
    setBusy(null);
    if (error) {
      toast.error("Enregistrement impossible.");
      return;
    }
    await refresh();
    toast.success("Parcours enregistré.");
  }

  const statut: CandidatureStatut =
    (candidature?.statut as CandidatureStatut | undefined) ??
    profile?.statut_candidature ??
    "en_attente";
  const currentIndex = ETAPES.findIndex((e) => e.statut === statut);

  return (
    <AppShell
      items={isValidatedFormateur ? FORMATEUR_NAV : CANDIDAT_NAV}
      title="Ma candidature"
      subtitle="Suivi de votre demande d'adhésion au réseau Skills4mation"
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Statut courant</p>
                <p className="mt-1 text-lg font-semibold">
                  {isLoading ? "Chargement…" : null}
                </p>
              </div>
              <StatutBadge kind="candidature" statut={statut} />
            </div>

            {statut === "refuse" ? (
              <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
                <p className="font-semibold">Candidature non retenue</p>
                <p className="mt-1 text-muted-foreground">
                  {candidature?.commentaire_admin ||
                    "L'équipe Skills4mation n'a pas retenu votre candidature à ce stade. Vous pouvez nous recontacter pour en échanger."}
                </p>
              </div>
            ) : (
              <ol className="mt-6 space-y-4">
                {ETAPES.map((etape, index) => {
                  const done = currentIndex >= index;
                  return (
                    <li key={etape.statut} className="flex items-start gap-3">
                      <span
                        className={
                          done
                            ? "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                            : "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-xs text-muted-foreground"
                        }
                      >
                        {done ? <CheckCircle2 className="size-4" /> : index + 1}
                      </span>
                      <div>
                        <p className={done ? "text-sm font-semibold" : "text-sm"}>{etape.label}</p>
                        {index === 0 && candidature?.created_at ? (
                          <p className="text-xs text-muted-foreground">
                            Déposée le {formatDate(candidature.created_at)}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            {statut === "valide" ? (
              <p className="mt-6 rounded-xl bg-success/10 p-4 text-sm text-success">
                Votre espace formateur est actif : vous pouvez créer vos dossiers de formation.
              </p>
            ) : statut !== "refuse" ? (
              <p className="mt-6 text-sm text-muted-foreground">
                L'accès complet à l'espace formateur est activé dès la validation de votre
                candidature par l'équipe Skills4mation.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardContent className="p-6">
            <h2 className="text-base font-semibold">Pièces de mon dossier de candidature</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              CV et déroulé pédagogique type au format PDF (10 Mo max).
            </p>

            <div className="mt-5 grid gap-4">
              <DocField
                label="CV"
                done={!!profile?.cv_url}
                busy={busy === "cv"}
                onFile={(file) => void upload("cv", file)}
              />
              <DocField
                label="Déroulé pédagogique type"
                done={!!profile?.deroule_pedagogique_url}
                busy={busy === "deroule"}
                onFile={(file) => void upload("deroule", file)}
              />
            </div>

            <form onSubmit={saveParcours} className="mt-6 grid gap-2">
              <Label htmlFor="parcours">Parcours professionnel et pédagogique</Label>
              <Textarea
                id="parcours"
                name="parcours"
                rows={6}
                maxLength={5000}
                defaultValue={profile?.parcours_formation ?? ""}
                placeholder="Expériences, publics formés, thématiques maîtrisées…"
              />
              <Button type="submit" variant="cta" disabled={busy === "parcours"}>
                {busy === "parcours" ? "Enregistrement…" : "Enregistrer mon parcours"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function DocField({
  label,
  done,
  busy,
  onFile,
}: {
  label: string;
  done: boolean;
  busy: boolean;
  onFile: (file: File) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-4">
      <div className="flex min-w-0 items-center gap-3">
        <FileText className="size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">{done ? "Déposé" : "Non déposé"}</p>
        </div>
      </div>
      <label className="shrink-0">
        <input
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFile(file);
            event.target.value = "";
          }}
        />
        <span className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
          <Upload className="size-3.5" /> {busy ? "Envoi…" : done ? "Remplacer" : "Déposer"}
        </span>
      </label>
    </div>
  );
}
