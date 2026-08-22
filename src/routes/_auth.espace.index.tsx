import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FolderPlus } from "lucide-react";

import { FORMATEUR_NAV } from "@/components/app/nav";
import { AppShell } from "@/components/app/AppShell";
import { StatutBadge } from "@/components/StatutBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { DOSSIER_STATUTS, formatDate, type DossierStatut } from "@/lib/statuts";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_auth/espace/")({
  component: EspaceAccueil,
});

type Dossier = {
  id: string;
  intitule: string;
  entreprise: string | null;
  statut: DossierStatut;
  created_at: string;
};

function EspaceAccueil() {
  const { profile, isValidatedFormateur } = useAuth();

  const { data: dossiers, isLoading } = useQuery({
    queryKey: ["mes-dossiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossiers")
        .select("id, intitule, entreprise, statut, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Dossier[];
    },
  });

  const enCours = (dossiers ?? []).filter((d) => d.statut !== "complet" && d.statut !== "archive");
  const complets = (dossiers ?? []).filter((d) => d.statut === "complet");

  return (
    <AppShell
      items={FORMATEUR_NAV}
      title={`Bonjour ${profile?.prenom ?? ""}`.trim()}
      subtitle="Vue d'ensemble de vos dossiers de formation"
      actions={
        <Button asChild variant="cta">
          <Link to="/espace/dossiers/new">
            <FolderPlus className="size-4" /> Nouveau dossier
          </Link>
        </Button>
      }
    >
      {!isValidatedFormateur ? (
        <Card className="mb-6 rounded-2xl border-cta/40 bg-cta/10">
          <CardContent className="p-6">
            <h2 className="text-base font-semibold">Candidature en cours de validation</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Votre accès complet sera activé dès que l'équipe Skills4mation aura validé votre
              candidature.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-3">
        {[
          { label: "Dossiers en cours", valeur: enCours.length },
          { label: "Dossiers complets", valeur: complets.length },
          { label: "Total dossiers", valeur: (dossiers ?? []).length },
        ].map((stat) => (
          <Card key={stat.label} className="rounded-2xl border-border/70 shadow-soft">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold">{stat.valeur}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 rounded-2xl border-border/70 shadow-soft">
        <CardContent className="p-6">
          <h2 className="text-base font-semibold">Mes dossiers récents</h2>
          {isLoading ? (
            <p className="mt-4 text-sm text-muted-foreground">Chargement…</p>
          ) : (dossiers ?? []).length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Aucun dossier pour l'instant. Créez votre premier dossier de formation.
              </p>
              <Button asChild variant="cta" className="mt-4">
                <Link to="/espace/dossiers/new">Créer un dossier</Link>
              </Button>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {(dossiers ?? []).slice(0, 8).map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{d.intitule}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.entreprise || "Entreprise non renseignée"} · {formatDate(d.created_at)}
                    </p>
                  </div>
                  <StatutBadge
                    label={DOSSIER_STATUTS[d.statut].label}
                    tone={DOSSIER_STATUTS[d.statut].tone}
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
