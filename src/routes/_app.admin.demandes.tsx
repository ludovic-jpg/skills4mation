import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Archive, ArchiveRestore, UserPlus } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { adminNav } from "@/components/app/nav";
import { StatutBadge } from "@/components/StatutBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BUDGET_STATUTS, formatDate, type BudgetStatut } from "@/lib/statuts";
import { useCandidatures, useCandidatureMutation, DEMANDES_KEYS } from "@/lib/candidatures";

export const Route = createFileRoute("/_app/admin/demandes")({
  component: AdminDemandes,
});

type Source = "candidatures" | "demandes_budget" | "demandes_contact" | "demandes_droits_formation";

const ONGLETS: { key: Source; label: string }[] = [
  { key: "demandes_droits_formation", label: "Droits formation" },
  { key: "demandes_contact", label: "Demandes de formation" },
  { key: "demandes_budget", label: "Demandes de budget" },
  { key: "candidatures", label: "Candidatures" },
];

type Ligne = {
  id: string;
  created_at: string;
  titre: string;
  sousTitre: string;
  details: { label: string; valeur: string }[];
  statut: string;
  assigne_nom: string | null;
  archived_at: string | null;
};

function texte(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

function normalise(source: Source, row: Record<string, unknown>): Ligne {
  if (source === "candidatures") {
    return {
      id: String(row["id"]),
      created_at: String(row["created_at"]),
      titre: `${texte(row["prenom"])} ${texte(row["nom"])}`,
      sousTitre: `${texte(row["email"])} · ${texte(row["telephone"])}`,
      details: [
        { label: "Expertise", valeur: texte(row["expertise"]) },
        { label: "Message", valeur: texte(row["message"]) },
      ],
      statut: String(row["statut"]),
      assigne_nom: (row["assigne_nom"] as string | null) ?? null,
      archived_at: (row["archived_at"] as string | null) ?? null,
    };
  }
  if (source === "demandes_budget") {
    return {
      id: String(row["id"]),
      created_at: String(row["created_at"]),
      titre: texte(row["entreprise_prospect"]),
      sousTitre: `${texte(row["contact"])} · ${texte(row["nb_participants"])} participant(s)`,
      details: [
        { label: "Besoin", valeur: texte(row["besoin"]) },
        { label: "Budget estimé", valeur: texte(row["budget_estime"]) },
        { label: "Commentaire", valeur: texte(row["commentaire"]) },
      ],
      statut: String(row["statut"]),
      assigne_nom: (row["assigne_nom"] as string | null) ?? null,
      archived_at: (row["archived_at"] as string | null) ?? null,
    };
  }
  if (source === "demandes_contact") {
    return {
      id: String(row["id"]),
      created_at: String(row["created_at"]),
      titre: `${texte(row["prenom"])} ${texte(row["nom"])}`,
      sousTitre: `${texte(row["email"])} · ${texte(row["telephone"])} · ${texte(row["profil"])}`,
      details: [
        { label: "Formation souhaitée", valeur: texte(row["formation_souhaitee"]) },
        { label: "Objectif", valeur: texte(row["objectif"]) },
        { label: "Disponibilités", valeur: texte(row["disponibilites"]) },
        { label: "Budget estimé", valeur: texte(row["budget_estime"]) },
        { label: "Message", valeur: texte(row["message"]) },
      ],
      statut: String(row["statut"]),
      assigne_nom: (row["assigne_nom"] as string | null) ?? null,
      archived_at: (row["archived_at"] as string | null) ?? null,
    };
  }
  return {
    id: String(row["id"]),
    created_at: String(row["created_at"]),
    titre: `${texte(row["prenom"])} ${texte(row["nom"])}`,
    sousTitre: `${texte(row["email"])} · ${texte(row["telephone"])} · ${texte(row["statut_pro"])}`,
    details: [
      { label: "Formation visée", valeur: texte(row["formation_visee"]) },
      { label: "Objectif professionnel", valeur: texte(row["objectif_professionnel"]) },
      { label: "Situation", valeur: texte(row["situation"]) },
      { label: "Dispositifs", valeur: texte(row["dispositifs"]) },
      { label: "Disponibilités", valeur: texte(row["disponibilites"]) },
      { label: "Budget estimé", valeur: texte(row["budget_estime"]) },
      { label: "Message", valeur: texte(row["message"]) },
    ],
    statut: String(row["statut"]),
    assigne_nom: (row["assigne_nom"] as string | null) ?? null,
    archived_at: (row["archived_at"] as string | null) ?? null,
  };
}

const CANDIDATURE_OPTIONS = ["en_attente", "en_cours", "valide", "refuse"] as const;
const BUDGET_OPTIONS: BudgetStatut[] = ["en_attente", "en_cours_etude", "validee", "refusee"];

function AdminDemandes() {
  const { isConseiller, loading } = useAuth();
  const queryClient = useQueryClient();
  const [source, setSource] = useState<Source>("demandes_droits_formation");
  const [openId, setOpenId] = useState<string | null>(null);
  const [collaborateur, setCollaborateur] = useState("");
  const [note, setNote] = useState("");
  const [filtreArchive, setFiltreArchive] = useState<"actifs" | "archives">("actifs");

  const { data, isLoading: chargementAutres } = useQuery({
    queryKey: ["admin-demandes", source],
    enabled: isConseiller && source !== "candidatures",
    queryFn: async () => {
      const { data, error } = await supabase
        .from(source)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as Record<string, unknown>[]).map((row) => normalise(source, row));
    },
  });

  const candidatures = useCandidatures(isConseiller && source === "candidatures");
  const majCandidature = useCandidatureMutation();

  const { data: collaborateurs } = useQuery({
    queryKey: ["collaborateurs"],
    enabled: isConseiller,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, prenom, nom, email")
        .order("nom", { ascending: true })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await supabase
        .from(source)
        .update(patch as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Demande mise à jour.");
      for (const key of DEMANDES_KEYS) void queryClient.invalidateQueries({ queryKey: key });
      setOpenId(null);
      setCollaborateur("");
      setNote("");
    },
    onError: () => toast.error("Mise à jour impossible."),
  });

  if (!loading && !isConseiller) {
    return (
      <AppShell items={adminNav()} title="Demandes">
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

  const lignes =
    source === "candidatures"
      ? (candidatures.data ?? [])
          .filter((c) => (filtreArchive === "archives" ? Boolean(c.archived_at) : !c.archived_at))
          .map((c) => normalise("candidatures", c as unknown as Record<string, unknown>))
      : (data ?? []);
  const statutOptions: readonly string[] =
    source === "candidatures" ? CANDIDATURE_OPTIONS : BUDGET_OPTIONS;

  return (
    <AppShell
      items={adminNav()}
      title="Toutes les demandes"
      subtitle="Candidatures, demandes de budget, demandes de formation et évaluations de droits — avec affectation à un collaborateur"
    >
      <div className="flex flex-wrap gap-2">
        {ONGLETS.map((onglet) => (
          <button
            key={onglet.key}
            type="button"
            onClick={() => setSource(onglet.key)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              source === onglet.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-muted"
            }`}
          >
            {onglet.label}
          </button>
        ))}
      </div>

      {source === "candidatures" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {(["actifs", "archives"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filtreArchive === f ? "teal" : "outline"}
              onClick={() => setFiltreArchive(f)}
            >
              {f === "actifs" ? "Actives" : "Archivées"}
            </Button>
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4">
        {(source === "candidatures" ? candidatures.isLoading : chargementAutres) ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : lignes.length === 0 ? (
          <Card className="rounded-2xl border-dashed">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              Aucune demande pour le moment.
            </CardContent>
          </Card>
        ) : (
          lignes.map((ligne) => (
            <Card key={ligne.id} className="rounded-2xl border-border/70 shadow-soft">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-base font-semibold">{ligne.titre}</h2>
                  {source === "candidatures" ? (
                    <StatutBadge kind="candidature" statut={ligne.statut as never} />
                  ) : (
                    <StatutBadge kind="budget" statut={ligne.statut as never} />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDate(ligne.created_at)}
                  </span>
                  {ligne.assigne_nom ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                      <UserPlus className="size-3.5" aria-hidden /> {ligne.assigne_nom}
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      Non assignée
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{ligne.sousTitre}</p>

                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  {ligne.details
                    .filter((d) => d.valeur !== "—")
                    .map((d) => (
                      <div key={d.label}>
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                          {d.label}
                        </dt>
                        <dd className="mt-0.5 text-sm whitespace-pre-line">{d.valeur}</dd>
                      </div>
                    ))}
                </dl>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {statutOptions.map((option) => (
                    <Button
                      key={option}
                      size="sm"
                      variant={ligne.statut === option ? "teal" : "outline"}
                      disabled={update.isPending || ligne.statut === option}
                      onClick={() =>
                        source === "candidatures"
                          ? majCandidature.mutate({ id: ligne.id, patch: { statut: option } })
                          : update.mutate({ id: ligne.id, patch: { statut: option } })
                      }
                    >
                      {source === "candidatures"
                        ? option === "en_attente"
                          ? "Reçue"
                          : option === "en_cours"
                            ? "En cours"
                            : option === "valide"
                              ? "Accepter"
                              : "Refuser"
                        : (BUDGET_STATUTS[option as BudgetStatut]?.label ?? option)}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setOpenId(openId === ligne.id ? null : ligne.id);
                      setCollaborateur(ligne.assigne_nom ?? "");
                      setNote("");
                    }}
                  >
                    <UserPlus className="mr-1.5 size-4" /> Nommer un collaborateur
                  </Button>
                  {source === "candidatures" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={majCandidature.isPending}
                      onClick={() =>
                        majCandidature.mutate({
                          id: ligne.id,
                          patch: {
                            archived_at: ligne.archived_at ? null : new Date().toISOString(),
                          },
                        })
                      }
                    >
                      {ligne.archived_at ? (
                        <>
                          <ArchiveRestore className="mr-1.5 size-4" /> Désarchiver
                        </>
                      ) : (
                        <>
                          <Archive className="mr-1.5 size-4" /> Archiver
                        </>
                      )}
                    </Button>
                  ) : null}
                </div>

                {openId === ligne.id ? (
                  <div className="mt-4 grid gap-4 rounded-2xl border border-border/70 bg-muted/40 p-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor={`collab-${ligne.id}`}>Collaborateur en charge</Label>
                      <Input
                        id={`collab-${ligne.id}`}
                        list="liste-collaborateurs"
                        value={collaborateur}
                        onChange={(event) => setCollaborateur(event.target.value)}
                        placeholder="Nom du collaborateur"
                        className="mt-2"
                      />
                      <datalist id="liste-collaborateurs">
                        {(collaborateurs ?? []).map((c) => (
                          <option
                            key={c.id}
                            value={`${c.prenom ?? ""} ${c.nom ?? ""}`.trim() || (c.email ?? "")}
                          />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <Label htmlFor={`note-${ligne.id}`}>Note interne (optionnelle)</Label>
                      <Textarea
                        id={`note-${ligne.id}`}
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        rows={2}
                        className="mt-2"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Button
                        size="sm"
                        variant="cta"
                        disabled={update.isPending || collaborateur.trim().length === 0}
                        onClick={() =>
                          (source === "candidatures" ? majCandidature : update).mutate({
                            id: ligne.id,
                            patch:
                              source === "candidatures"
                                ? { assigne_nom: collaborateur.trim() }
                                : source === "demandes_budget"
                                  ? {
                                      assigne_nom: collaborateur.trim(),
                                      ...(note.trim() ? { commentaire_admin: note.trim() } : {}),
                                    }
                                  : {
                                      assigne_nom: collaborateur.trim(),
                                      ...(note.trim() ? { note_admin: note.trim() } : {}),
                                    },
                          })
                        }
                      >
                        Affecter la tâche
                      </Button>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}
