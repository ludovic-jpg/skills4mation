import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { FORMATEUR_NAV } from "@/components/app/nav";
import { AvisModeration } from "@/components/formations/AvisModeration";
import { FormationEditor } from "@/components/formation/FormationEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { BUDGET_STATUTS } from "@/lib/statuts";
import type { FormationCatalogue } from "@/lib/formations";

export const Route = createFileRoute("/_app/espace/formations/$id")({
  component: FormationDetail,
  head: () => ({
    meta: [
      { title: "Modifier une formation — Espace formateur Skills4mation" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function FormationDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const formation = useQuery({
    queryKey: ["formation", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formations_catalogue")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data as FormationCatalogue | null) ?? null;
    },
  });

  const inscriptions = useQuery({
    queryKey: ["formation-inscriptions", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formations_inscriptions")
        .select("*")
        .eq("formation_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async (patch: Partial<FormationCatalogue>) => {
      const { data, error } = await supabase
        .from("formations_catalogue")
        .update(patch)
        .eq("id", id)
        .select("*")
        .maybeSingle();
      if (error) throw error;

      // Parcours miroir : alimente les sélecteurs de "Mes outils pédagogiques".
      const f = (data as FormationCatalogue | null) ?? null;
      if (f?.formateur_id) {
        const objectifs =
          Array.isArray(f.objectifs) && f.objectifs.length > 0
            ? f.objectifs.join("\n")
            : (f.objectif ?? null);
        const { error: mirrorError } = await supabase.from("parcours_formation").upsert(
          {
            formation_catalogue_id: f.id,
            formateur_id: f.formateur_id,
            titre: f.titre,
            objectifs,
            prerequis: f.prerequis ?? null,
            duree_heures: f.duree_heures == null ? null : Math.round(Number(f.duree_heures)),
            modules: (f.programme ?? []) as never,
          },
          { onConflict: "formation_catalogue_id" },
        );
        if (mirrorError) console.error("[parcours-miroir]", mirrorError);
      }
    },
    onSuccess: async () => {
      toast.success("Formation enregistrée.");
      await qc.invalidateQueries({ queryKey: ["formation", id] });
      await qc.invalidateQueries({ queryKey: ["mes-formations"] });
      await qc.invalidateQueries({ queryKey: ["mes-parcours"] });
    },
    onError: () => toast.error("Enregistrement impossible."),
  });

  const majStatut = useMutation({
    mutationFn: async ({ inscriptionId, statut }: { inscriptionId: string; statut: string }) => {
      const { error } = await supabase
        .from("formations_inscriptions")
        .update({ statut: statut as never })
        .eq("id", inscriptionId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["formation-inscriptions", id] });
    },
    onError: () => toast.error("Mise à jour impossible."),
  });

  if (formation.isLoading) {
    return (
      <AppShell items={FORMATEUR_NAV} title="Formation">
        <p className="text-sm text-muted-foreground">Chargement…</p>
      </AppShell>
    );
  }

  if (!formation.data) {
    return (
      <AppShell items={FORMATEUR_NAV} title="Formation introuvable">
        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-8">
            <p className="text-sm text-muted-foreground">Cette formation n'existe pas ou plus.</p>
            <Button asChild variant="cta" className="mt-4">
              <Link to="/espace/formations">Retour à mes formations</Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const f = formation.data;

  return (
    <AppShell
      items={FORMATEUR_NAV}
      title={f.titre}
      subtitle="Ces variables alimentent vos documents Qualiopi et la page publique de la formation"
      actions={
        <Button asChild variant="outline">
          <Link to="/espace/formations">Mes formations</Link>
        </Button>
      }
    >
      <div className="grid gap-6">
        <FormationEditor value={f} saving={save.isPending} onSave={(patch) => save.mutate(patch)} />

        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardContent className="p-6">
            <h2 className="text-base font-semibold">
              Demandes d'inscription ({(inscriptions.data ?? []).length})
            </h2>
            <div className="mt-4 grid gap-3">
              {(inscriptions.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucune demande pour le moment. Partagez le lien de votre page publique aux
                  apprenants.
                </p>
              ) : null}
              {(inscriptions.data ?? []).map((i) => (
                <div
                  key={i.id}
                  className="grid gap-2 rounded-xl border border-border p-4 text-sm sm:grid-cols-[1fr_auto]"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {i.prenom} {i.nom}{" "}
                      <Badge variant="outline" className="ml-1 align-middle">
                        {BUDGET_STATUTS[i.statut].label}
                      </Badge>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {i.email}
                      {i.telephone ? ` · ${i.telephone}` : ""}
                      {i.financement ? ` · ${i.financement}` : ""}
                    </p>
                    {i.objectif ? <p className="mt-2">Objectif : {i.objectif}</p> : null}
                    {i.disponibilites ? (
                      <p className="text-xs text-muted-foreground">
                        Disponibilités : {i.disponibilites}
                      </p>
                    ) : null}
                    {i.message ? <p className="mt-1 text-muted-foreground">{i.message}</p> : null}
                  </div>
                  <div className="flex items-start gap-2">
                    <Select
                      value={i.statut}
                      onValueChange={(statut) =>
                        majStatut.mutate({ inscriptionId: i.id, statut })
                      }
                    >
                      <SelectTrigger className="w-[190px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(BUDGET_STATUTS).map(([value, meta]) => (
                          <SelectItem key={value} value={value}>
                            {meta.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button asChild variant="outline" size="sm">
                      <a href={`mailto:${i.email}`}>Répondre</a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <AvisModeration formationId={id} />
      </div>
    </AppShell>
  );
}
