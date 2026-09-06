import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { adminNav } from "@/components/app/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/statuts";
import { TYPES_RECLAMATION } from "@/routes/reclamations";

export const Route = createFileRoute("/_app/admin/reclamations")({
  component: AdminReclamations,
});

type Statut = "nouvelle" | "en_cours" | "traitee";

const STATUTS: { value: Statut; label: string }[] = [
  { value: "nouvelle", label: "Nouvelle" },
  { value: "en_cours", label: "En cours" },
  { value: "traitee", label: "Traitée" },
];

type Reclamation = {
  id: string;
  created_at: string;
  nom: string;
  email: string;
  formation_concernee: string | null;
  type: string;
  message: string;
  statut: Statut;
  reponse: string | null;
  repondu_le: string | null;
  repondu_par: string | null;
};

function libelleType(value: string) {
  return TYPES_RECLAMATION.find((t) => t.value === value)?.label ?? value;
}

function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function AdminReclamations() {
  const { isConseiller, profile, user } = useAuth();
  const queryClient = useQueryClient();
  const [du, setDu] = useState("");
  const [au, setAu] = useState("");
  const [brouillons, setBrouillons] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reclamations"],
    enabled: isConseiller,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reclamations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Reclamation[];
    },
  });

  const lignes = useMemo(() => {
    const list = data ?? [];
    return list.filter((r) => {
      const d = r.created_at.slice(0, 10);
      if (du && d < du) return false;
      if (au && d > au) return false;
      return true;
    });
  }, [data, du, au]);

  const auteur =
    [profile?.prenom, profile?.nom].filter(Boolean).join(" ").trim() || user?.email || "Équipe";

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await supabase
        .from("reclamations")
        .update(patch as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-reclamations"] });
      toast.success("Réclamation mise à jour.");
    },
    onError: () => toast.error("La mise à jour a échoué."),
  });

  function exporterCsv() {
    const entetes = [
      "Numéro",
      "Date",
      "Nom",
      "Email",
      "Formation",
      "Type",
      "Statut",
      "Message",
      "Réponse",
      "Répondu le",
      "Répondu par",
    ];
    const rows = lignes.map((r) =>
      [
        `REC-${r.id.slice(0, 8).toUpperCase()}`,
        r.created_at,
        r.nom,
        r.email,
        r.formation_concernee,
        libelleType(r.type),
        r.statut,
        r.message,
        r.reponse,
        r.repondu_le,
        r.repondu_par,
      ]
        .map(csvCell)
        .join(";"),
    );
    const csv = `\uFEFF${entetes.map(csvCell).join(";")}\n${rows.join("\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `reclamations-${du || "debut"}-${au || "aujourdhui"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!isConseiller) {
    return (
      <AppShell items={[]} title="Réclamations" subtitle="Accès réservé">
        <p className="text-sm text-muted-foreground">
          Cet espace est réservé aux comptes habilités de l'équipe qualité.
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell
      items={adminNav()}
      title="Réclamations & aléas"
      subtitle="Suivi des réclamations, difficultés, aléas et appréciations signalés"
    >
      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="flex flex-wrap items-end gap-4 p-6">
          <div>
            <Label htmlFor="du">Du</Label>
            <Input
              id="du"
              type="date"
              value={du}
              onChange={(e) => setDu(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="au">Au</Label>
            <Input
              id="au"
              type="date"
              value={au}
              onChange={(e) => setAu(e.target.value)}
              className="mt-2"
            />
          </div>
          <Button type="button" variant="outline" onClick={exporterCsv}>
            <Download className="mr-2 size-4" /> Export CSV ({lignes.length})
          </Button>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : lignes.length === 0 ? (
          <Card className="rounded-2xl border-dashed">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              Aucune réclamation sur cette période.
            </CardContent>
          </Card>
        ) : (
          lignes.map((r) => (
            <Card key={r.id} className="rounded-2xl border-border/70 shadow-soft">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-base font-semibold">{r.nom}</h2>
                  <span className="rounded-full border px-3 py-1 text-xs font-semibold">
                    {libelleType(r.type)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    REC-{r.id.slice(0, 8).toUpperCase()} · {formatDate(r.created_at)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {r.email}
                  {r.formation_concernee ? ` · ${r.formation_concernee}` : ""}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm">{r.message}</p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Label htmlFor={`statut-${r.id}`} className="text-xs">
                    Statut
                  </Label>
                  <select
                    id={`statut-${r.id}`}
                    value={r.statut}
                    onChange={(e) =>
                      update.mutate({ id: r.id, patch: { statut: e.target.value } })
                    }
                    className="h-9 rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    {STATUTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {r.reponse ? (
                  <div className="mt-4 rounded-xl bg-muted p-4 text-sm">
                    <p className="text-xs text-muted-foreground">
                      Réponse de {r.repondu_par ?? "—"} le{" "}
                      {r.repondu_le ? formatDate(r.repondu_le) : "—"}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap">{r.reponse}</p>
                  </div>
                ) : null}

                <div className="mt-4">
                  <Label htmlFor={`reponse-${r.id}`} className="text-xs">
                    {r.reponse ? "Modifier la réponse" : "Écrire une réponse"}
                  </Label>
                  <Textarea
                    id={`reponse-${r.id}`}
                    rows={3}
                    className="mt-2"
                    value={brouillons[r.id] ?? r.reponse ?? ""}
                    onChange={(e) =>
                      setBrouillons((prev) => ({ ...prev, [r.id]: e.target.value }))
                    }
                  />
                  <Button
                    type="button"
                    variant="cta"
                    className="mt-3"
                    disabled={update.isPending || !(brouillons[r.id] ?? r.reponse ?? "").trim()}
                    onClick={() =>
                      update.mutate({
                        id: r.id,
                        patch: {
                          reponse: (brouillons[r.id] ?? r.reponse ?? "").trim(),
                          repondu_le: new Date().toISOString(),
                          repondu_par: auteur,
                          statut: "traitee",
                        },
                      })
                    }
                  >
                    Enregistrer la réponse
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}
