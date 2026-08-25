import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { ADMIN_NAV } from "@/components/app/nav";
import { StatutBadge } from "@/components/StatutBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, type CandidatureStatut } from "@/lib/statuts";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/admin/")({
  component: AdminCandidatures,
});

type Candidature = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  expertise: string | null;
  message: string | null;
  statut: CandidatureStatut;
  created_at: string;
  cv_url: string | null;
  parcours_formation_url: string | null;
  deroule_pedagogique_url: string | null;
};

const PIECES: { key: keyof Candidature; label: string }[] = [
  { key: "cv_url", label: "CV" },
  { key: "parcours_formation_url", label: "Parcours de formation" },
  { key: "deroule_pedagogique_url", label: "Déroulé pédagogique" },
];

function PieceLink({ label, path }: { label: string; path: string | null }) {
  async function open() {
    if (!path) return;
    const { data, error } = await supabase.storage
      .from("candidatures")
      .createSignedUrl(path, 60 * 10);
    if (error || !data) {
      toast.error("Document inaccessible.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  if (!path) {
    return (
      <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
        {label} manquant
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => void open()}
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-semibold transition-colors hover:bg-muted"
    >
      <FileText className="size-3.5" /> {label}
    </button>
  );
}


function AdminCandidatures() {
  const { isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["candidatures"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidatures")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Candidature[];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: CandidatureStatut }) => {
      const { error } = await supabase.from("candidatures").update({ statut }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Candidature mise à jour.");
      void queryClient.invalidateQueries({ queryKey: ["candidatures"] });
    },
    onError: () => toast.error("Mise à jour impossible."),
  });

  if (!loading && !isAdmin) {
    return (
      <AppShell items={ADMIN_NAV} title="Back-office">
        <Card className="rounded-2xl border-destructive/30">
          <CardContent className="p-8">
            <h2 className="text-base font-semibold">Accès réservé à l'équipe Skills4mation</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Votre compte ne dispose pas des droits d'administration.
            </p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const candidatures = data ?? [];

  return (
    <AppShell
      items={ADMIN_NAV}
      title="Candidatures formateurs"
      subtitle="Étudier, valider ou refuser les demandes d'adhésion au réseau"
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : candidatures.length === 0 ? (
        <Card className="rounded-2xl border-dashed">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            Aucune candidature reçue pour le moment.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {candidatures.map((c) => (
            <Card key={c.id} className="rounded-2xl border-border/70 shadow-soft">
              <CardContent className="grid gap-4 p-6 lg:grid-cols-[1fr_auto]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-base font-semibold">
                      {c.prenom} {c.nom}
                    </h2>
                    <StatutBadge kind="candidature" statut={c.statut} />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(c.created_at)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {c.email}
                    {c.telephone ? ` · ${c.telephone}` : ""}
                  </p>
                  {c.expertise ? (
                    <p className="mt-2 text-sm">
                      <span className="font-semibold">Expertise :</span> {c.expertise}
                    </p>
                  ) : null}
                  {c.message ? (
                    <p className="mt-2 text-sm whitespace-pre-line text-muted-foreground">
                      {c.message}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap items-start gap-2">
                  <Button
                    variant="teal"
                    disabled={update.isPending || c.statut === "valide"}
                    onClick={() => update.mutate({ id: c.id, statut: "valide" })}
                  >
                    Valider
                  </Button>
                  <Button
                    variant="outline"
                    disabled={update.isPending || c.statut === "refuse"}
                    onClick={() => update.mutate({ id: c.id, statut: "refuse" })}
                  >
                    Refuser
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
