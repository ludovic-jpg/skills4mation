import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { FORMATEUR_NAV } from "@/components/app/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/espace/dossiers/new")({
  component: NouveauDossier,
});

const TALLY_FORM_ID = "Zj9ABV";

function NouveauDossier() {
  const { user, profile, isValidatedFormateur, loading } = useAuth();
  const router = useRouter();
  const [dossierId, setDossierId] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (loading || !user || !isValidatedFormateur || dossierId) return;
    let cancelled = false;
    void (async () => {
      const { data, error: insertError } = await supabase
        .from("dossiers")
        .insert({ formateur_id: user.id, statut: "brouillon", statut_crm: "brouillon" })
        .select("id")
        .single();
      if (cancelled) return;
      if (insertError || !data) {
        setError(true);
        toast.error("Création du dossier impossible.");
        return;
      }
      setDossierId(data.id);
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, user, isValidatedFormateur, dossierId]);

  if (!loading && !isValidatedFormateur) {
    return (
      <AppShell items={FORMATEUR_NAV} title="Nouveau dossier de formation">
        <Card className="rounded-2xl border-cta/40 bg-cta/10">
          <CardContent className="p-8">
            <h2 className="text-base font-semibold">Candidature en cours de validation</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              La création de dossiers est activée dès que votre candidature est acceptée.
            </p>
            <Button asChild variant="cta" className="mt-4">
              <Link to="/espace/candidature">Voir ma candidature</Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const params = new URLSearchParams({
    dossier_id: dossierId ?? "",
    formateur_id: user?.id ?? "",
    email: profile?.email ?? "",
    nom: `${profile?.prenom ?? ""} ${profile?.nom ?? ""}`.trim(),
    hideTitle: "1",
  });

  return (
    <AppShell
      items={FORMATEUR_NAV}
      title="Nouveau dossier de formation"
      subtitle="Convention, programme, émargement et évaluations générés sous 48 h"
      actions={
        <Button variant="outline" onClick={() => void router.navigate({ to: "/espace/dossiers" })}>
          Mes dossiers
        </Button>
      }
    >
      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="p-2 sm:p-4">
          {error ? (
            <p className="p-6 text-sm text-destructive">
              Le dossier n'a pas pu être initialisé. Rechargez la page ou contactez l'équipe
              Skills4mation.
            </p>
          ) : !dossierId ? (
            <p className="p-6 text-sm text-muted-foreground">Initialisation du dossier…</p>
          ) : (
            <iframe
              title="Formulaire de création de convention"
              src={`https://tally.so/embed/${TALLY_FORM_ID}?${params.toString()}`}
              className="h-[1400px] w-full rounded-xl border-0"
              loading="lazy"
            />
          )}
        </CardContent>
      </Card>
      <p className="mt-4 text-xs text-muted-foreground">
        Référence interne du dossier : {dossierId ?? "…"}. Après validation du formulaire, votre
        dossier passe à l'étape « Demande de validation » : l'équipe contrôle les pièces Qualiopi
        puis fait avancer le dossier jusqu'au paiement de votre rémunération, sous 10 jours ouvrés à
        réception des fonds.
      </p>
    </AppShell>
  );
}
