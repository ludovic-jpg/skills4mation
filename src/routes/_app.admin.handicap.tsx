import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { adminNav } from "@/components/app/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { definirReferentHandicap, marquerAmenagementTraite } from "@/lib/handicap.functions";

export const Route = createFileRoute("/_app/admin/handicap")({
  component: AdminHandicap,
  head: () => ({
    meta: [
      { title: "Référent handicap — Back-office Skills4mation" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const dateFr = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

function AdminHandicap() {
  const { isConseiller } = useAuth();
  const equipe = isConseiller;
  const queryClient = useQueryClient();
  const definirReferent = useServerFn(definirReferentHandicap);
  const marquerTraite = useServerFn(marquerAmenagementTraite);
  const [nom, setNom] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data } = useQuery({
    queryKey: ["admin-handicap"],
    enabled: equipe,
    queryFn: async () => {
      const [parametres, demandes, dossiers] = await Promise.all([
        supabase.from("parametres_organisme").select("cle, valeur").in("cle", [
          "referent_handicap_nom",
          "referent_handicap_contact",
        ]),
        supabase
          .from("demandes_amenagement_handicap")
          .select("*")
          .order("demande_le", { ascending: false }),
        supabase.from("dossiers").select("id, dossier_nom, entreprise_nom, titre_formation"),
      ]);
      if (parametres.error) throw parametres.error;
      if (demandes.error) throw demandes.error;
      if (dossiers.error) throw dossiers.error;
      return {
        parametres: parametres.data ?? [],
        demandes: demandes.data ?? [],
        dossiers: dossiers.data ?? [],
      };
    },
  });

  useEffect(() => {
    if (!data) return;
    const parNom = new Map(data.parametres.map((p) => [p.cle, p.valeur ?? ""]));
    setNom(parNom.get("referent_handicap_nom") ?? "");
    setContact(parNom.get("referent_handicap_contact") ?? "");
  }, [data]);

  const enregistrerReferent = useMutation({
    mutationFn: () => definirReferent({ data: { nom, contact } }),
    onSuccess: () => {
      toast.success("Référent handicap enregistré.");
      void queryClient.invalidateQueries({ queryKey: ["admin-handicap"] });
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : "Enregistrement impossible."),
  });

  const traiter = useMutation({
    mutationFn: (id: string) => marquerTraite({ data: { id, notes: notes[id] ?? "" } }),
    onSuccess: () => {
      toast.success("Demande marquée comme traitée.");
      void queryClient.invalidateQueries({ queryKey: ["admin-handicap"] });
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : "Mise à jour impossible."),
  });

  if (!equipe) {
    return (
      <AppShell items={adminNav()} title="Référent handicap">
        <Card className="rounded-2xl border-destructive/30">
          <CardContent className="p-8 text-sm text-muted-foreground">
            Accès réservé à l'équipe Skills4mation.
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const dossierParId = new Map((data?.dossiers ?? []).map((d) => [d.id, d]));
  const demandes = data?.demandes ?? [];
  const aTraiter = demandes.filter((d) => d.statut === "a_traiter");
  const traitees = demandes.filter((d) => d.statut === "traite");

  return (
    <AppShell
      items={adminNav()}
      title="Référent handicap"
      subtitle="Identité du référent handicap et registre des demandes d'aménagement reçues via le recueil des besoins — indicateur Qualiopi 26."
    >
      <Card>
        <CardContent className="grid gap-3 p-6 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="referent-nom">Référent handicap (nom)</Label>
            <Input
              id="referent-nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Prénom Nom"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="referent-contact">Contact (e-mail ou téléphone)</Label>
            <Input
              id="referent-contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="email@skills4mation.com"
            />
          </div>
          <div className="sm:col-span-2">
            <Button
              size="sm"
              variant="cta"
              disabled={!nom.trim() || enregistrerReferent.isPending}
              onClick={() => enregistrerReferent.mutate()}
            >
              {enregistrerReferent.isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="size-4 text-primary" /> Demandes à traiter ({aTraiter.length})
          </h2>
          {aTraiter.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Aucune demande en attente.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {aTraiter.map((d) => {
                const dossier = dossierParId.get(d.dossier_id);
                const label =
                  dossier?.dossier_nom ||
                  [dossier?.entreprise_nom, dossier?.titre_formation].filter(Boolean).join(" — ") ||
                  `Dossier ${d.dossier_id.slice(0, 8)}`;
                return (
                  <div key={d.id} className="rounded-xl border border-amber-500/40 p-4">
                    <p className="text-sm font-medium">
                      {d.apprenant_label} — {label}
                    </p>
                    <p className="text-xs text-muted-foreground">Reçue le {dateFr(d.demande_le)}</p>
                    <Textarea
                      className="mt-2"
                      placeholder="Notes sur l'aménagement mis en place…"
                      value={notes[d.id] ?? ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [d.id]: e.target.value }))}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      disabled={traiter.isPending}
                      onClick={() => traiter.mutate(d.id)}
                    >
                      Marquer comme traitée
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {traitees.length > 0 ? (
        <Card className="mt-4">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold">Demandes traitées ({traitees.length})</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {traitees.map((d) => (
                <li key={d.id} className="border-b border-border/50 pb-2 last:border-0">
                  <span className="font-medium">{d.apprenant_label}</span> — traitée le{" "}
                  {dateFr(d.traite_le)}
                  {d.notes ? (
                    <span className="mt-1 block text-xs text-muted-foreground">{d.notes}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </AppShell>
  );
}
