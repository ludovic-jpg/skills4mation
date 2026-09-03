import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { adminNav } from "@/components/app/nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/statuts";

export const Route = createFileRoute("/_app/admin/formations")({
  component: AdminFormations,
  head: () => ({
    meta: [
      { title: "Parutions formations — Administration Skills4mation" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type Row = {
  id: string;
  titre: string;
  slug: string;
  categorie: string | null;
  intro: string | null;
  tarif_ht: number | null;
  duree_heures: number | null;
  formateur_nom: string | null;
  publication_statut: string | null;
  publication_demandee_le: string | null;
  publication_decidee_le: string | null;
  publication_motif: string | null;
};

const ETATS = [
  { value: "en_attente", label: "À valider" },
  { value: "publiee", label: "Publiées" },
  { value: "refusee", label: "Refusées" },
] as const;

function AdminFormations() {
  const { isAdmin, isConseillere, isSuperAdmin, loading } = useAuth();
  const autorise = isAdmin || isConseillere || isSuperAdmin;
  const queryClient = useQueryClient();
  const [onglet, setOnglet] = useState<string>("en_attente");
  const [motifs, setMotifs] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin-formations", onglet],
    enabled: autorise,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formations_catalogue")
        .select(
          "id, titre, slug, categorie, intro, tarif_ht, duree_heures, formateur_nom, publication_statut, publication_demandee_le, publication_decidee_le, publication_motif",
        )
        .eq("publication_statut", onglet)
        .order("publication_demandee_le", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const decider = useMutation({
    mutationFn: async ({
      id,
      statut,
      motif,
    }: {
      id: string;
      statut: "publiee" | "refusee" | "brouillon";
      motif?: string;
    }) => {
      const { error } = await supabase
        .from("formations_catalogue")
        .update({
          publication_statut: statut,
          publiee: statut === "publiee",
          publication_decidee_le: new Date().toISOString(),
          publication_motif: motif ?? null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_r, vars) => {
      toast.success(
        vars.statut === "publiee" ? "Formation publiée sur le site." : "Décision enregistrée.",
      );
      void queryClient.invalidateQueries({ queryKey: ["admin-formations"] });
    },
    onError: () => toast.error("La décision n'a pas pu être enregistrée."),
  });

  const items = adminNav({ isSuperAdmin, isConseillere });

  if (!loading && !autorise) {
    return (
      <AppShell items={items} title="Parutions formations">
        <Card className="rounded-2xl">
          <CardContent className="p-8 text-sm text-muted-foreground">
            Cet espace est réservé à l'équipe Skills4mation.
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const liste = data ?? [];

  return (
    <AppShell
      items={items}
      title="Parutions formations"
      subtitle="Aucune formation formateur ne paraît sur le site sans validation de l'équipe"
    >
      <div className="grid gap-5">
        <div className="flex flex-wrap gap-2">
          {ETATS.map((e) => (
            <Button
              key={e.value}
              variant={onglet === e.value ? "cta" : "outline"}
              size="sm"
              onClick={() => setOnglet(e.value)}
            >
              {e.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <Card className="rounded-2xl">
            <CardContent className="p-8 text-sm text-muted-foreground">Chargement…</CardContent>
          </Card>
        ) : liste.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="p-8 text-sm text-muted-foreground">
              Aucune formation dans cette catégorie.
            </CardContent>
          </Card>
        ) : (
          liste.map((row) => (
            <Card key={row.id} className="rounded-2xl border-border/70 shadow-soft">
              <CardContent className="grid gap-4 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold">{row.titre}</h2>
                    <p className="text-sm text-muted-foreground">
                      {row.formateur_nom ?? "Formateur"} · {row.categorie ?? "Sans catégorie"} ·{" "}
                      {row.duree_heures ? `${row.duree_heures} h` : "durée non renseignée"} ·{" "}
                      {row.tarif_ht !== null ? `${row.tarif_ht} € HT` : "tarif non renseigné"}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {row.publication_demandee_le
                      ? `Demandée le ${formatDate(row.publication_demandee_le)}`
                      : "Sans date de demande"}
                  </Badge>
                </div>

                {row.intro ? (
                  <p className="text-sm text-muted-foreground">{row.intro}</p>
                ) : (
                  <p className="text-sm text-destructive">Présentation manquante.</p>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <Button asChild variant="outline" size="sm">
                    <a href={`/formations/${row.slug}`} target="_blank" rel="noopener">
                      Prévisualiser la page
                    </a>
                  </Button>
                  {onglet === "en_attente" ? (
                    <>
                      <Button
                        variant="cta"
                        size="sm"
                        disabled={decider.isPending}
                        onClick={() => decider.mutate({ id: row.id, statut: "publiee" })}
                      >
                        Valider la parution
                      </Button>
                      <Input
                        placeholder="Motif de refus"
                        value={motifs[row.id] ?? ""}
                        onChange={(e) =>
                          setMotifs((prev) => ({ ...prev, [row.id]: e.target.value }))
                        }
                        className="max-w-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={decider.isPending}
                        onClick={() => {
                          const motif = (motifs[row.id] ?? "").trim();
                          if (!motif) {
                            toast.error("Indiquez le motif du refus.");
                            return;
                          }
                          decider.mutate({ id: row.id, statut: "refusee", motif });
                        }}
                      >
                        Refuser
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={decider.isPending}
                      onClick={() => decider.mutate({ id: row.id, statut: "brouillon" })}
                    >
                      {onglet === "publiee" ? "Dépublier" : "Remettre en brouillon"}
                    </Button>
                  )}
                </div>

                {row.publication_motif ? (
                  <p className="text-xs text-muted-foreground">
                    Motif enregistré : {row.publication_motif}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}
