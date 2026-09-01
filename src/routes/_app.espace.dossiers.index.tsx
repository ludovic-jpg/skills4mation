import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FolderPlus } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { CrmBadge } from "@/components/app/CrmBadge";
import { FORMATEUR_NAV } from "@/components/app/nav";
import { SupprimerDossierBouton } from "@/components/dossier/SupprimerDossierBouton";
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
import { supabase } from "@/integrations/supabase/client";
import { CRM_PIPELINE, CRM_STATUTS, dossierNom, type CrmStatut } from "@/lib/crm";
import { formatDate } from "@/lib/statuts";

export const Route = createFileRoute("/_app/espace/dossiers/")({
  component: MesDossiers,
});

type Row = {
  id: string;
  dossier_nom: string | null;
  entreprise_nom: string | null;
  titre_formation: string | null;
  date_debut: string | null;
  statut_crm: CrmStatut;
  created_at: string;
  archived_at: string | null;
};

function MesDossiers() {
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState<string>("tous");

  const { data, isLoading } = useQuery({
    queryKey: ["mes-dossiers-liste"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossiers")
        .select(
          "id, dossier_nom, entreprise_nom, titre_formation, date_debut, statut_crm, created_at, archived_at",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const dossiers = (data ?? []).filter((d) => {
    if (filtre === "archives" ? !d.archived_at : d.archived_at) return false;
    if (filtre !== "tous" && filtre !== "archives" && d.statut_crm !== filtre) return false;
    const label = (d.dossier_nom || dossierNom(d)).toLowerCase();
    return label.includes(search.toLowerCase());
  });

  return (
    <AppShell
      items={FORMATEUR_NAV}
      title="Mes dossiers de formation"
      subtitle="Suivi en temps réel de chaque étape, de la validation au paiement"
      actions={
        <Button asChild variant="cta">
          <Link to="/espace/dossiers/new">
            <FolderPlus className="size-4" /> Nouveau dossier
          </Link>
        </Button>
      }
    >
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Rechercher une entreprise, une formation…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />
        <Select value={filtre} onValueChange={setFiltre}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les dossiers actifs</SelectItem>
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

      <Card className="mt-6 rounded-2xl border-border/70 shadow-soft">
        <CardContent className="p-2 sm:p-4">
          {isLoading ? (
            <p className="p-6 text-sm text-muted-foreground">Chargement…</p>
          ) : dossiers.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              Aucun dossier à afficher pour ce filtre.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {dossiers.map((d) => (
                <li key={d.id} className="flex items-center gap-1 pr-2">
                  <Link
                    to="/espace/dossiers/$id"
                    params={{ id: d.id }}
                    className="flex flex-1 flex-wrap items-center justify-between gap-3 rounded-xl p-4 transition-colors hover:bg-muted/60"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {d.dossier_nom || dossierNom(d)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Créé le {formatDate(d.created_at)}
                        {d.archived_at ? " · archivé" : ""}
                      </p>
                    </div>
                    <CrmBadge statut={d.statut_crm} />
                  </Link>
                  {d.statut_crm === "brouillon" ? (
                    <SupprimerDossierBouton
                      dossierId={d.id}
                      label={d.dossier_nom || dossierNom(d)}
                      invalidateKeys={["mes-dossiers-liste"]}
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
