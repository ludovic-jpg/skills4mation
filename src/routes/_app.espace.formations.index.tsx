import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, FilePlus2, Users } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { FORMATEUR_NAV } from "@/components/app/nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { dureeLabel, tarifLabel, visuelUrl } from "@/lib/formations";

export const Route = createFileRoute("/_app/espace/formations/")({
  component: MesFormations,
  head: () => ({
    meta: [
      { title: "Mes formations — Espace formateur Skills4mation" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function MesFormations() {
  const { user } = useAuth();

  const formations = useQuery({
    queryKey: ["mes-formations", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formations_catalogue")
        .select(
          "id, slug, titre, categorie, intro, duree_heures, duree_jours, tarif_ht, tarif_unite, visuel_url, publiee, inscriptions_ouvertes",
        )
        .eq("formateur_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const inscriptions = useQuery({
    queryKey: ["mes-inscriptions", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formations_inscriptions")
        .select("id, formation_id")
        .eq("formateur_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const compte = (id: string) =>
    (inscriptions.data ?? []).filter((i) => i.formation_id === id).length;

  return (
    <AppShell
      items={FORMATEUR_NAV}
      title="Mes formations"
      subtitle="Préenregistrez vos formations une fois : elles alimentent vos dossiers Qualiopi et vos pages publiques d'inscription"
      actions={
        <Button asChild variant="cta">
          <Link to="/espace/formations/new">
            <FilePlus2 className="mr-1.5 size-4" /> Nouvelle formation
          </Link>
        </Button>
      }
    >
      {formations.isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : (formations.data ?? []).length === 0 ? (
        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardContent className="p-8">
            <h2 className="text-base font-semibold">Aucune formation enregistrée</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Créez votre première formation : toutes les variables Qualiopi sont réutilisées dans
              vos dossiers, et vous pouvez publier une page d'inscription pour vos apprenants.
            </p>
            <Button asChild variant="cta" className="mt-4">
              <Link to="/espace/formations/new">Créer une formation</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {(formations.data ?? []).map((f) => {
            const image = visuelUrl(f.visuel_url);
            return (
              <Card key={f.id} className="rounded-2xl border-border/70 shadow-soft">
                <CardContent className="flex flex-wrap items-center gap-4 p-5">
                  <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {image ? (
                      <img src={image} alt="" className="size-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold">{f.titre}</p>
                      <Badge variant={f.publiee ? "default" : "secondary"}>
                        {f.publiee ? "Publiée" : "Enregistrée"}
                      </Badge>
                      {f.publiee && !f.inscriptions_ouvertes ? (
                        <Badge variant="outline">Inscriptions fermées</Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[dureeLabel(f), tarifLabel(f)].filter(Boolean).join(" · ") ||
                        "Durée et tarif à compléter"}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="size-3.5" /> {compte(f.id)} demande(s) d'inscription
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {f.publiee ? (
                      <Button asChild variant="outline" size="sm">
                        <a href={`/formations/${f.slug}`} target="_blank" rel="noopener">
                          <ExternalLink className="mr-1.5 size-3.5" /> Page publique
                        </a>
                      </Button>
                    ) : null}
                    <Button asChild variant="cta" size="sm">
                      <Link to="/espace/formations/$id" params={{ id: f.id }}>
                        Modifier
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
