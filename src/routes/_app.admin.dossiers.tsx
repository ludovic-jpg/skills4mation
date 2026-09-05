import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { KanbanDossiers } from "@/components/dossier/KanbanDossiers";
import { adminNav } from "@/components/app/nav";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_app/admin/dossiers")({
  component: AdminDossiers,
});

function AdminDossiers() {
  const { isAdmin, isConseillere, isSuperAdmin, loading } = useAuth();

  if (!loading && !isAdmin) {
    return (
      <AppShell items={adminNav({ isSuperAdmin, isConseillere })} title="CRM dossiers">
        <Card className="rounded-2xl border-destructive/30">
          <CardContent className="p-8 text-sm text-muted-foreground">
            Accès réservé à l'équipe Skills4mation.
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      items={adminNav({ isSuperAdmin, isConseillere })}
      title="CRM suivi de dossier"
      subtitle="Pipeline en 7 étapes, de la demande de validation au paiement du formateur"
    >
      <KanbanDossiers mode="admin" />
    </AppShell>
  );
}
