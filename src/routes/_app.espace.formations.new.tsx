import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { FORMATEUR_NAV } from "@/components/app/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/formations";

export const Route = createFileRoute("/_app/espace/formations/new")({
  component: NouvelleFormation,
  head: () => ({
    meta: [
      { title: "Nouvelle formation — Espace formateur Skills4mation" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function NouvelleFormation() {
  const { user, profile, isValidatedFormateur, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (loading || !user || !isValidatedFormateur) return;
    let cancelled = false;
    void (async () => {
      const base = slugify(`formation-${profile?.nom ?? "formateur"}`);
      const { data, error: insertError } = await supabase
        .from("formations_catalogue")
        .insert({
          formateur_id: user.id,
          titre: "Nouvelle formation",
          slug: `${base}-${Date.now().toString(36)}`,
          formateur_nom: `${profile?.prenom ?? ""} ${profile?.nom ?? ""}`.trim() || null,
          formateur_bio: profile?.parcours_formation ?? null,
        })
        .select("id")
        .single();
      if (cancelled) return;
      if (insertError || !data) {
        setError(true);
        toast.error("Création de la formation impossible.");
        return;
      }
      void router.navigate({ to: "/espace/formations/$id", params: { id: data.id } });
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, user, isValidatedFormateur, profile, router]);

  if (!loading && !isValidatedFormateur) {
    return (
      <AppShell items={FORMATEUR_NAV} title="Nouvelle formation">
        <Card className="rounded-2xl border-cta/40 bg-cta/10">
          <CardContent className="p-8">
            <h2 className="text-base font-semibold">Candidature en cours de validation</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              La création de formations est activée dès que votre candidature est acceptée.
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
    <AppShell items={FORMATEUR_NAV} title="Nouvelle formation">
      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="p-8">
          <p className="text-sm text-muted-foreground">
            {error
              ? "La formation n'a pas pu être initialisée. Rechargez la page."
              : "Initialisation de la formation…"}
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
