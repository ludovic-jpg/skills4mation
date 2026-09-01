import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/app/AppShell";
import { ADMIN_NAV, SUPER_ADMIN_NAV } from "@/components/app/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { dossierNom, type CrmStatut } from "@/lib/crm";
import { formatDate } from "@/lib/statuts";

export const Route = createFileRoute("/_app/admin/validation")({
  component: AdminValidation,
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
};

/** Délai cible : 24 h après l'entrée en demande de validation. */
function delai(createdAt: string) {
  const restant = new Date(createdAt).getTime() + 24 * 3600 * 1000 - Date.now();
  const heures = Math.round(restant / 3600000);
  if (restant <= 0)
    return { label: `Dépassé de ${Math.abs(heures)} h`, tone: "bg-destructive text-white" };
  if (heures <= 12)
    return { label: `${heures} h restantes`, tone: "bg-secondary text-secondary-foreground" };
  return { label: `${heures} h restantes`, tone: "bg-primary/10 text-primary" };
}

function AdminValidation() {
  const { isAdmin, isSuperAdmin, loading } = useAuth();
  const nav = isSuperAdmin ? SUPER_ADMIN_NAV : ADMIN_NAV;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-validation"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossiers")
        .select(
          "id, formateur_id, dossier_nom, entreprise_nom, titre_formation, date_debut, statut_crm, created_at",
        )
        .eq("statut_crm", "demande_validation")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  if (!loading && !isAdmin) {
    return (
      <AppShell items={nav} title="File de validation">
        <Card className="rounded-2xl border-destructive/30">
          <CardContent className="p-8 text-sm text-muted-foreground">
            Accès réservé aux conseillères formation et super admins.
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const rows = data ?? [];

  return (
    <AppShell
      items={nav}
      title="File de validation"
      subtitle="Dossiers en attente de validation, du plus ancien au plus récent (objectif 24 h)"
    >
      <div className="grid gap-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : rows.length === 0 ? (
          <Card className="rounded-2xl border-dashed">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              Aucun dossier en attente de validation.
            </CardContent>
          </Card>
        ) : (
          rows.map((row) => {
            const d = delai(row.created_at);
            return (
              <Card key={row.id} className="rounded-2xl border-border/70 shadow-soft">
                <CardContent className="flex flex-wrap items-start justify-between gap-3 p-6">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold">
                      {row.dossier_nom || dossierNom(row)}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Demande reçue le {formatDate(row.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${d.tone}`}
                    >
                      {d.label}
                    </span>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/admin/dossiers">Traiter dans le CRM</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
