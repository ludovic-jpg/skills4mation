import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { CrmBadge } from "@/components/app/CrmBadge";
import { ADMIN_NAV } from "@/components/app/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CRM_PIPELINE, CRM_STATUTS, dossierNom, type CrmStatut } from "@/lib/crm";
import { formatDate } from "@/lib/statuts";

export const Route = createFileRoute("/_app/admin/dossiers")({
  component: AdminDossiers,
});

type Row = {
  id: string;
  formateur_id: string;
  dossier_nom: string | null;
  entreprise_nom: string | null;
  titre_formation: string | null;
  date_debut: string | null;
  statut_crm: CrmStatut;
  created_at: string;
  archived_at: string | null;
  drive_folder_url: string | null;
};

function AdminDossiers() {
  const { isAdmin, loading, user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState("actifs");
  const [openId, setOpenId] = useState<string | null>(null);
  const [cible, setCible] = useState<CrmStatut>("dossier_valide");
  const [commentaire, setCommentaire] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-dossiers"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossiers")
        .select(
          "id, formateur_id, dossier_nom, entreprise_nom, titre_formation, date_debut, statut_crm, created_at, archived_at, drive_folder_url",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const { data: formateurs } = useQuery({
    queryKey: ["admin-formateurs"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, prenom, nom, email");
      if (error) throw error;
      return data ?? [];
    },
  });

  const nomFormateur = (id: string) => {
    const p = (formateurs ?? []).find((f) => f.id === id);
    return p ? `${p.prenom} ${p.nom}`.trim() || p.email : "Formateur";
  };

  const changerEtape = useMutation({
    mutationFn: async ({ row }: { row: Row }) => {
      if (!user) return;
      if (cible === "refuse" && !commentaire.trim()) {
        throw new Error("commentaire");
      }
      const patch = {
        statut_crm: cible,
        commentaire_admin: commentaire.trim() || null,
        ...(cible === "paiement_formateur" ? { archived_at: null } : {}),
      };
      const { error } = await supabase.from("dossiers").update(patch).eq("id", row.id);
      if (error) throw error;
      const { error: histError } = await supabase.from("dossier_historique").insert({
        dossier_id: row.id,
        ancien_statut: row.statut_crm,
        nouveau_statut: cible,
        auteur_id: user.id,
        commentaire: commentaire.trim() || null,
      });
      if (histError) throw histError;
    },
    onSuccess: () => {
      toast.success("Étape mise à jour.");
      setOpenId(null);
      setCommentaire("");
      void queryClient.invalidateQueries({ queryKey: ["admin-dossiers"] });
    },
    onError: (error: Error) =>
      toast.error(
        error.message === "commentaire"
          ? "Un commentaire est obligatoire pour refuser un dossier."
          : "Mise à jour impossible.",
      ),
  });

  const archiver = useMutation({
    mutationFn: async (row: Row) => {
      const { error } = await supabase
        .from("dossiers")
        .update({ archived_at: row.archived_at ? null : new Date().toISOString() })
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-dossiers"] });
      toast.success("Archivage mis à jour.");
    },
    onError: () => toast.error("Action impossible."),
  });

  if (!loading && !isAdmin) {
    return (
      <AppShell items={ADMIN_NAV} title="CRM dossiers">
        <Card className="rounded-2xl border-destructive/30">
          <CardContent className="p-8 text-sm text-muted-foreground">
            Accès réservé à l'équipe Skills4mation.
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const rows = (data ?? []).filter((row) => {
    if (filtre === "archives" ? !row.archived_at : row.archived_at) return false;
    if (filtre !== "actifs" && filtre !== "archives" && row.statut_crm !== filtre) return false;
    const label = `${row.dossier_nom || dossierNom(row)} ${nomFormateur(row.formateur_id)}`;
    return label.toLowerCase().includes(search.toLowerCase());
  });

  const compteurs = CRM_PIPELINE.map((statut) => ({
    statut,
    total: (data ?? []).filter((r) => r.statut_crm === statut && !r.archived_at).length,
  }));

  return (
    <AppShell
      items={ADMIN_NAV}
      title="CRM suivi de dossier"
      subtitle="Pipeline en 7 étapes, de la demande de validation au paiement du formateur"
    >
      <div className="grid gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {compteurs.map((c) => (
          <Card key={c.statut} className="rounded-xl border-border/70">
            <CardContent className="p-4">
              <p className="text-2xl font-semibold">{c.total}</p>
              <p className="mt-1 text-xs text-muted-foreground">{CRM_STATUTS[c.statut].label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Input
          placeholder="Rechercher un dossier, un formateur…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />
        <Select value={filtre} onValueChange={setFiltre}>
          <SelectTrigger className="w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="actifs">Tous les dossiers actifs</SelectItem>
            {CRM_PIPELINE.map((statut) => (
              <SelectItem key={statut} value={statut}>
                {CRM_STATUTS[statut].label}
              </SelectItem>
            ))}
            <SelectItem value="refuse">Refusé / Annulé</SelectItem>
            <SelectItem value="archives">Archives</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 grid gap-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : rows.length === 0 ? (
          <Card className="rounded-2xl border-dashed">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              Aucun dossier pour ce filtre.
            </CardContent>
          </Card>
        ) : (
          rows.map((row) => (
            <Card key={row.id} className="rounded-2xl border-border/70 shadow-soft">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold">
                      {row.dossier_nom || dossierNom(row)}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {nomFormateur(row.formateur_id)} · créé le {formatDate(row.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CrmBadge statut={row.statut_crm} />
                    {row.drive_folder_url ? (
                      <Button asChild variant="outline" size="sm">
                        <a href={row.drive_folder_url} target="_blank" rel="noreferrer">
                          Documents
                        </a>
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="teal"
                      onClick={() => {
                        setOpenId(openId === row.id ? null : row.id);
                        setCible(row.statut_crm);
                        setCommentaire("");
                      }}
                    >
                      Changer l'étape
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => archiver.mutate(row)}>
                      {row.archived_at ? "Désarchiver" : "Archiver"}
                    </Button>
                  </div>
                </div>

                {openId === row.id ? (
                  <div className="mt-5 grid gap-3 rounded-xl bg-muted/50 p-4">
                    <Select value={cible} onValueChange={(value) => setCible(value as CrmStatut)}>
                      <SelectTrigger className="max-w-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CRM_PIPELINE.map((statut) => (
                          <SelectItem key={statut} value={statut}>
                            {CRM_STATUTS[statut].etape}. {CRM_STATUTS[statut].label}
                          </SelectItem>
                        ))}
                        <SelectItem value="refuse">Refusé / Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea
                      rows={3}
                      maxLength={1000}
                      placeholder="Commentaire visible du formateur (obligatoire en cas de refus)"
                      value={commentaire}
                      onChange={(event) => setCommentaire(event.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="cta"
                        disabled={changerEtape.isPending}
                        onClick={() => changerEtape.mutate({ row })}
                      >
                        Enregistrer l'étape
                      </Button>
                      <Button variant="ghost" onClick={() => setOpenId(null)}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}
