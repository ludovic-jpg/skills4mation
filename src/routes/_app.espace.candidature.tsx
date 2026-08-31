import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { CANDIDAT_NAV, FORMATEUR_NAV } from "@/components/app/nav";
import { StatutBadge } from "@/components/StatutBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, type CandidatureStatut } from "@/lib/statuts";

export const Route = createFileRoute("/_app/espace/candidature")({
  component: MaCandidature,
});

const ETAPES: { statut: CandidatureStatut; label: string }[] = [
  { statut: "en_attente", label: "Candidature reçue" },
  { statut: "en_cours", label: "En cours d'étude" },
  { statut: "valide", label: "Acceptée" },
];

function MaCandidature() {
  const { user, profile, isValidatedFormateur } = useAuth();

  const { data: candidature, isLoading } = useQuery({
    queryKey: ["ma-candidature", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidatures")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });

  const statut: CandidatureStatut =
    (candidature?.statut as CandidatureStatut | undefined) ??
    profile?.statut_candidature ??
    "en_attente";
  const currentIndex = ETAPES.findIndex((e) => e.statut === statut);

  return (
    <AppShell
      items={isValidatedFormateur ? FORMATEUR_NAV : CANDIDAT_NAV}
      title="Ma candidature"
      subtitle="Suivi de votre demande d'adhésion au réseau Skills4mation"
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Statut courant</p>
                <p className="mt-1 text-lg font-semibold">{isLoading ? "Chargement…" : null}</p>
              </div>
              <StatutBadge kind="candidature" statut={statut} />
            </div>

            {statut === "refuse" ? (
              <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
                <p className="font-semibold">Candidature non retenue</p>
                <p className="mt-1 text-muted-foreground">
                  {candidature?.commentaire_admin ||
                    "L'équipe Skills4mation n'a pas retenu votre candidature à ce stade. Vous pouvez nous recontacter pour en échanger."}
                </p>
              </div>
            ) : (
              <ol className="mt-6 space-y-4">
                {ETAPES.map((etape, index) => {
                  const done = currentIndex >= index;
                  return (
                    <li key={etape.statut} className="flex items-start gap-3">
                      <span
                        className={
                          done
                            ? "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                            : "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-xs text-muted-foreground"
                        }
                      >
                        {done ? <CheckCircle2 className="size-4" /> : index + 1}
                      </span>
                      <div>
                        <p className={done ? "text-sm font-semibold" : "text-sm"}>{etape.label}</p>
                        {index === 0 && candidature?.created_at ? (
                          <p className="text-xs text-muted-foreground">
                            Déposée le {formatDate(candidature.created_at)}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            {statut === "valide" ? (
              <p className="mt-6 rounded-xl bg-success/10 p-4 text-sm text-success">
                Votre espace formateur est actif : vous pouvez créer vos dossiers de formation.
              </p>
            ) : statut !== "refuse" ? (
              <p className="mt-6 text-sm text-muted-foreground">
                L'accès complet à l'espace formateur est activé dès la validation de votre
                candidature par l'équipe Skills4mation.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardContent className="p-6">
            <h2 className="text-base font-semibold">Mes pièces justificatives</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              CV, parcours de formation, déroulé(s) pédagogique(s), justificatif de déclaration
              d'activité et photo sont désormais centralisés sur votre profil formateur. Vous pouvez
              les déposer, les remplacer et les télécharger à tout moment.
            </p>
            <ul className="mt-4 grid gap-1 text-sm">
              <li>CV : {profile?.cv_url ? "déposé" : "à déposer"}</li>
              <li>
                Parcours de formation : {profile?.parcours_formation_url ? "déposé" : "à déposer"}
              </li>
              <li>
                Déroulé pédagogique : {profile?.deroule_pedagogique_url ? "déposé" : "à déposer"}
              </li>
            </ul>
            <Button asChild variant="cta" className="mt-5">
              <Link to="/espace/profil">Gérer mes pièces dans mon profil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
