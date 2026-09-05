import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { FORMATEUR_NAV } from "@/components/app/nav";
import { DossierWizard } from "@/components/dossier/DossierWizard";
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
import { DONNEES_VIDES, type DossierDonnees } from "@/lib/dossier/types";
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
  const [saving, setSaving] = useState(false);
  // null = le formateur n'a pas encore choisi ; "" = dossier vierge ; sinon id du parcours.
  const [choix, setChoix] = useState<string | null>(null);
  const [parcoursId, setParcoursId] = useState("");
  const creation = useRef(false);

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
  // Sans parcours enregistré, on ouvre directement le formulaire vierge.
  const decide = choix !== null || (parcours.isSuccess && liste.length === 0);

  const donneesInitiales = useMemo<DossierDonnees>(() => {
    const choisi = liste.find((p) => p.id === choix) ?? null;
    return {
      ...DONNEES_VIDES,
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
    } as DossierDonnees;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choix, profile, parcours.data]);

  async function creer(donnees: DossierDonnees) {
    if (!user || creation.current) return;
    creation.current = true;
    setSaving(true);
    const { data, error: insertError } = await supabase
      .from("dossiers")
      .insert({
        formateur_id: user.id,
        statut: "brouillon",
        statut_crm: "brouillon",
        // Numéro d'ADF attribué à la première sauvegarde, jamais avant.
        donnees: { ...donnees, adf: genererNumeroAdf() },
      })
      .select("id")
      .single();
    setSaving(false);
    if (insertError || !data) {
      creation.current = false;
      toast.error("Création du dossier impossible.");
      return;
    }
    void router.navigate({ to: "/espace/dossiers/$id", params: { id: data.id } });
  }

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
              <Link to="/espace/profil">Voir ma candidature</Link>
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
      {decide ? (
        <DossierWizard
          value={donneesInitiales}
          saving={saving}
          onSave={(donnees) => {
            void creer(donnees);
          }}
        />
      ) : (
        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardContent className="p-8">
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
                <Button variant="cta" disabled={!parcoursId} onClick={() => setChoix(parcoursId)}>
                  Créer depuis ce parcours
                </Button>
                <Button variant="outline" onClick={() => setChoix("")}>
                  Partir d'un dossier vierge
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}

