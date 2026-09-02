import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { FORMATEUR_NAV } from "@/components/app/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DONNEES_VIDES } from "@/lib/dossier/types";
import { genererNumeroAdf } from "@/lib/commission";

export const Route = createFileRoute("/_app/espace/dossiers/new")({
  component: NouveauDossier,
});

type Parcours = {
  id: string;
  titre: string;
  objectifs: string | null;
  prerequis: string | null;
  duree_heures: number | null;
};

function NouveauDossier() {
  const { user, profile, isValidatedFormateur, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState(false);
  // null = le formateur n'a pas encore choisi ; "" = dossier vierge ; sinon id du parcours.
  const [choix, setChoix] = useState<string | null>(null);
  const [parcoursId, setParcoursId] = useState("");

  const parcours = useQuery({
    queryKey: ["mes-parcours", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error: queryError } = await supabase
        .from("parcours_formation")
        .select("id, titre, objectifs, prerequis, duree_heures")
        .eq("formateur_id", user!.id)
        .order("created_at", { ascending: false });
      if (queryError) throw queryError;
      return (data ?? []) as Parcours[];
    },
  });

  const liste = parcours.data ?? [];
  // Sans parcours enregistré, on garde le comportement historique : création immédiate.
  const decide = choix !== null || (parcours.isSuccess && liste.length === 0);

  useEffect(() => {
    if (loading || !user || !isValidatedFormateur || !decide) return;
    let cancelled = false;
    void (async () => {
      const choisi = liste.find((p) => p.id === choix) ?? null;
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
        formation: {
          ...DONNEES_VIDES.formation,
          ...(choisi
            ? {
                titre: choisi.titre ?? "",
                objectifs: choisi.objectifs ?? "",
                prerequis: choisi.prerequis ?? "",
                heuresTotal: choisi.duree_heures ? String(choisi.duree_heures) : "",
              }
            : {}),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, isValidatedFormateur, profile, router, decide]);

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
          ) : decide ? (
            <p className="text-sm text-muted-foreground">
              Initialisation du dossier et ouverture du formulaire…
            </p>
          ) : (
            <div className="grid gap-5">
              <div>
                <h2 className="text-base font-semibold">Partir d'un parcours existant ?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Le titre, les objectifs, les prérequis et la durée du parcours choisi sont
                  préremplis dans le dossier. Vous pouvez aussi partir d'un dossier vierge.
                </p>
              </div>
              <div className="grid gap-2 sm:max-w-md">
                <Label htmlFor="parcours">Mes parcours de formation</Label>
                <Select value={parcoursId} onValueChange={setParcoursId}>
                  <SelectTrigger id="parcours">
                    <SelectValue placeholder="Choisir un parcours" />
                  </SelectTrigger>
                  <SelectContent>
                    {liste.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.titre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="cta"
                  disabled={!parcoursId}
                  onClick={() => setChoix(parcoursId)}
                >
                  Créer depuis ce parcours
                </Button>
                <Button variant="outline" onClick={() => setChoix("")}>
                  Partir d'un dossier vierge
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
