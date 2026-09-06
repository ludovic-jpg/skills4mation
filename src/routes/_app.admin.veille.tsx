import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Radar } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { adminNav } from "@/components/app/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/admin/veille")({
  component: AdminVeille,
  head: () => ({
    meta: [
      { title: "Veille réglementaire — Back-office Skills4mation" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const dateFr = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("fr-FR") : "—");

function AdminVeille() {
  const { isConseiller } = useAuth();
  const equipe = isConseiller;
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState("");
  const [source, setSource] = useState("");
  const [resume, setResume] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-veille"],
    enabled: equipe,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("veille_reglementaire")
        .select("*")
        .order("date_veille", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const ajouter = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("veille_reglementaire").insert({
        theme: theme.trim(),
        source: source.trim() || null,
        resume: resume.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Entrée de veille enregistrée.");
      setTheme("");
      setSource("");
      setResume("");
      void queryClient.invalidateQueries({ queryKey: ["admin-veille"] });
    },
    onError: () => toast.error("Enregistrement impossible."),
  });

  const diffuser = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("veille_reglementaire")
        .update({ diffuse: true, diffuse_le: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Diffusée aux formateurs.");
      void queryClient.invalidateQueries({ queryKey: ["admin-veille"] });
    },
    onError: () => toast.error("Mise à jour impossible."),
  });

  if (!equipe) {
    return (
      <AppShell items={adminNav()} title="Veille réglementaire">
        <Card className="rounded-2xl border-destructive/30">
          <CardContent className="p-8 text-sm text-muted-foreground">
            Accès réservé à l'équipe Skills4mation.
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const entrees = data ?? [];

  return (
    <AppShell
      items={adminNav()}
      title="Veille réglementaire"
      subtitle="Registre de veille légale, réglementaire, métier et handicap, et preuve de sa diffusion aux formateurs (indicateur Qualiopi 23)."
    >
      <Card>
        <CardContent className="grid gap-3 p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="veille-theme">Thème</Label>
              <Input
                id="veille-theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ex. Référentiel Qualiopi 33 indicateurs"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="veille-source">Source</Label>
              <Input
                id="veille-source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Ex. France Compétences, Légifrance…"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="veille-resume">Résumé et impact pour les formateurs</Label>
            <Textarea
              id="veille-resume"
              rows={3}
              value={resume}
              onChange={(e) => setResume(e.target.value)}
            />
          </div>
          <div>
            <Button
              size="sm"
              variant="cta"
              disabled={!theme.trim() || !resume.trim() || ajouter.isPending}
              onClick={() => ajouter.mutate()}
            >
              Enregistrer
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Radar className="size-4 text-primary" /> Historique ({entrees.length})
          </h2>
          {isLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">Chargement…</p>
          ) : entrees.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Aucune entrée pour l'instant.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {entrees.map((v) => (
                <div key={v.id} className="rounded-xl border border-border/60 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{v.theme}</span>
                    <span className="text-xs text-muted-foreground">{dateFr(v.date_veille)}</span>
                    {v.source ? (
                      <span className="text-xs text-muted-foreground">· {v.source}</span>
                    ) : null}
                    {v.diffuse ? (
                      <span className="rounded-full border border-primary/40 px-2 py-0.5 text-[11px] text-primary">
                        Diffusée le {dateFr(v.diffuse_le)}
                      </span>
                    ) : (
                      <span className="rounded-full border border-amber-500/40 px-2 py-0.5 text-[11px] text-amber-600">
                        Non diffusée
                      </span>
                    )}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                    {v.resume}
                  </p>
                  {!v.diffuse ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      disabled={diffuser.isPending}
                      onClick={() => diffuser.mutate(v.id)}
                    >
                      Diffuser aux formateurs
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
