import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { FORMATEUR_NAV } from "@/components/app/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DONNEES_VIDES } from "@/lib/dossier/types";
import { genererNumeroAdf } from "@/lib/commission";

export const Route = createFileRoute("/_app/espace/dossiers/new")({
  component: NouveauDossier,
});

function NouveauDossier() {
  const { user, profile, isValidatedFormateur, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (loading || !user || !isValidatedFormateur) return;
    let cancelled = false;
    void (async () => {
      const donnees = {
        ...DONNEES_VIDES,
        // Numéro d'ADF unique attribué automatiquement dès la création du dossier.
        adf: genererNumeroAdf(),
        formateur: {
          ...DONNEES_VIDES.formateur,
          prenom: profile?.prenom ?? "",
          nom: profile?.nom ?? "",
          email: profile?.email ?? "",
          telephone: profile?.telephone ?? "",
          entreprise: profile?.entreprise ?? "",
          siret: profile?.siret ?? "",
          adresse: profile?.entreprise_adresse ?? profile?.adresse ?? "",
          nda: profile?.numero_nda ?? "",
          ndaRegion: profile?.nda_region ?? "",
        },

      };
      const { data, error: insertError } = await supabase
        .from("dossiers")
        .insert({
          formateur_id: user.id,
          statut: "brouillon",
          statut_crm: "brouillon",
          donnees,
        })
        .select("id")
        .single();
      if (cancelled) return;
      if (insertError || !data) {
        setError(true);
        toast.error("Création du dossier impossible.");
        return;
      }
      void router.navigate({ to: "/espace/dossiers/$id", params: { id: data.id } });
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, user, isValidatedFormateur, profile, router]);

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

  return (
    <AppShell
      items={FORMATEUR_NAV}
      title="Nouveau dossier de formation"
      subtitle="Formulaire intégré : convention, planning, convocations et évaluations générés depuis le portail"
    >
      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="p-8">
          {error ? (
            <p className="text-sm text-destructive">
              Le dossier n'a pas pu être initialisé. Rechargez la page ou contactez l'équipe
              Skills4mation.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Initialisation du dossier et ouverture du formulaire…
            </p>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
