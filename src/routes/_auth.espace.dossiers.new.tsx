import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app/AppShell";
import { FORMATEUR_NAV } from "@/components/app/nav";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_auth/espace/dossiers/new")({
  component: NouveauDossier,
});

const TALLY_FORM_ID = "w0000";

function NouveauDossier() {
  const { user, profile } = useAuth();
  const params = new URLSearchParams({
    formateur_id: user?.id ?? "",
    email: profile?.email ?? "",
    nom: `${profile?.prenom ?? ""} ${profile?.nom ?? ""}`.trim(),
    hideTitle: "1",
  });

  return (
    <AppShell
      items={FORMATEUR_NAV}
      title="Nouveau dossier de formation"
      subtitle="Renseignez le formulaire : vos documents Qualiopi sont générés automatiquement"
    >
      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="p-2 sm:p-4">
          <iframe
            title="Formulaire de création de dossier"
            src={`https://tally.so/embed/${TALLY_FORM_ID}?${params.toString()}`}
            className="h-[1200px] w-full rounded-xl border-0"
            loading="lazy"
          />
        </CardContent>
      </Card>
      <p className="mt-4 text-xs text-muted-foreground">
        Après validation du formulaire, votre dossier apparaît dans votre tableau de bord avec le
        statut « En cours de génération ». Les documents Qualiopi vous sont ensuite mis à
        disposition.
      </p>
    </AppShell>
  );
}
