import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { adminNav } from "@/components/app/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/admin/bpf")({
  component: AdminBpf,
  head: () => ({
    meta: [
      { title: "Bilan Pédagogique et Financier — Back-office Skills4mation" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

/**
 * Vue de préparation du BPF (Cerfa n°10443, dû entre le 1er avril et le 31 mai
 * pour l'exercice N-1) : agrège le RÉALISÉ (dossier_financement, rempli à la
 * clôture pédagogique de chaque dossier) par année de formation, jamais le
 * prévisionnel. L'année retenue est celle de la date de fin de la formation
 * (donnees.formation.dateFin côté dossier), pas la date de clôture du
 * formulaire, pour rester alignée sur l'exercice réellement concerné.
 */
function anneeFormation(dossier: { donnees: unknown } | null | undefined): number | null {
  if (!dossier || typeof dossier.donnees !== "object" || dossier.donnees === null) return null;
  const formation = (dossier.donnees as Record<string, unknown>).formation;
  if (typeof formation !== "object" || formation === null) return null;
  const fin = (formation as Record<string, unknown>).dateFin;
  const debut = (formation as Record<string, unknown>).dateDebut;
  const date = typeof fin === "string" && fin ? fin : typeof debut === "string" ? debut : null;
  if (!date) return null;
  const annee = Number(date.slice(0, 4));
  return Number.isFinite(annee) ? annee : null;
}

const euros = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function AdminBpf() {
  const { isConseiller } = useAuth();
  const equipe = isConseiller;
  const anneeCourante = new Date().getFullYear();
  const [annee, setAnnee] = useState(anneeCourante);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-bpf"],
    enabled: equipe,
    queryFn: async () => {
      const [financement, dossiers, profils] = await Promise.all([
        supabase.from("dossier_financement").select("*"),
        supabase
          .from("dossiers")
          .select("id, dossier_nom, entreprise_nom, titre_formation, formateur_id, donnees"),
        supabase.from("profiles").select("id, prenom, nom, email"),
      ]);
      if (financement.error) throw financement.error;
      if (dossiers.error) throw dossiers.error;
      if (profils.error) throw profils.error;
      return {
        financement: financement.data ?? [],
        dossiers: dossiers.data ?? [],
        profils: profils.data ?? [],
      };
    },
  });

  const dossierParId = useMemo(
    () => new Map((data?.dossiers ?? []).map((d) => [d.id, d])),
    [data],
  );
  const profilParId = useMemo(
    () => new Map((data?.profils ?? []).map((p) => [p.id, p])),
    [data],
  );

  const annees = useMemo(() => {
    const set = new Set<number>([anneeCourante]);
    for (const f of data?.financement ?? []) {
      const a = anneeFormation(dossierParId.get(f.dossier_id));
      if (a) set.add(a);
    }
    return Array.from(set).sort((a, b) => b - a);
  }, [data, dossierParId, anneeCourante]);

  const lignes = useMemo(() => {
    return (data?.financement ?? [])
      .map((f) => {
        const dossier = dossierParId.get(f.dossier_id);
        const p = profilParId.get(f.formateur_id);
        return {
          ...f,
          annee: anneeFormation(dossier),
          dossierLabel:
            dossier?.dossier_nom ||
            [dossier?.entreprise_nom, dossier?.titre_formation].filter(Boolean).join(" — ") ||
            `Dossier ${f.dossier_id.slice(0, 8)}`,
          formateur: `${p?.prenom ?? ""} ${p?.nom ?? ""}`.trim() || p?.email || "Formateur",
        };
      })
      .filter((f) => f.annee === annee)
      .sort((a, b) => a.dossierLabel.localeCompare(b.dossierLabel));
  }, [data, dossierParId, profilParId, annee]);

  const nonClotures = useMemo(() => {
    const idsAvecRealise = new Set((data?.financement ?? []).map((f) => f.dossier_id));
    return (data?.dossiers ?? []).filter(
      (d) => anneeFormation(d) === annee && !idsAvecRealise.has(d.id),
    );
  }, [data, annee]);

  const totaux = useMemo(() => {
    const parType = new Map<string, number>();
    let heures = 0;
    let stagiaires = 0;
    let montant = 0;
    for (const l of lignes) {
      heures += Number(l.heures_realisees ?? 0);
      stagiaires += Number(l.stagiaires_presents ?? 0);
      montant += Number(l.montant_encaisse ?? 0);
      const type = l.type_stagiaires?.trim() || "Non renseigné";
      parType.set(type, (parType.get(type) ?? 0) + Number(l.stagiaires_presents ?? 0));
    }
    return { heures, stagiaires, montant, parType };
  }, [lignes]);

  function exporterCsv() {
    const header = [
      "Dossier",
      "Formateur",
      "Heures dispensées",
      "Stagiaires présents",
      "Type de stagiaires",
      "Objectif BPF",
      "Montant encaissé",
      "Clôturé le",
    ];
    const rows = lignes.map((l) =>
      [
        l.dossierLabel,
        l.formateur,
        l.heures_realisees ?? "",
        l.stagiaires_presents ?? "",
        l.type_stagiaires ?? "",
        l.objectif_bpf ?? "",
        l.montant_encaisse ?? "",
        l.cloture_le ? new Date(l.cloture_le).toLocaleDateString("fr-FR") : "",
      ]
        .map(csvCell)
        .join(";"),
    );
    const csv = [header.map(csvCell).join(";"), ...rows].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bpf_${annee}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!equipe) {
    return (
      <AppShell items={adminNav()} title="Bilan Pédagogique et Financier">
        <Card className="rounded-2xl border-destructive/30">
          <CardContent className="p-8 text-sm text-muted-foreground">
            Accès réservé à l'équipe Skills4mation.
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      items={adminNav()}
      title="Bilan Pédagogique et Financier"
      subtitle="Agrégation du réalisé (heures dispensées, présence, montants) par année de formation, pour préparer le Cerfa BPF dû entre le 1er avril et le 31 mai."
    >
      <div className="flex flex-wrap items-center gap-2">
        {annees.map((a) => (
          <Button
            key={a}
            size="sm"
            variant={a === annee ? "teal" : "outline"}
            onClick={() => setAnnee(a)}
          >
            {a}
          </Button>
        ))}
        <div className="grow" />
        <Button size="sm" variant="outline" onClick={exporterCsv} disabled={lignes.length === 0}>
          <Download className="mr-2 size-4" /> Export CSV
        </Button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Dossiers clôturés
            </p>
            <p className="mt-1 text-2xl font-bold">{lignes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Heures dispensées
            </p>
            <p className="mt-1 text-2xl font-bold">{totaux.heures.toLocaleString("fr-FR")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Stagiaires présents
            </p>
            <p className="mt-1 text-2xl font-bold">{totaux.stagiaires}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Montant encaissé
            </p>
            <p className="mt-1 text-2xl font-bold">{euros(totaux.montant)}</p>
          </CardContent>
        </Card>
      </div>

      {totaux.parType.size > 0 ? (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <p className="text-sm font-semibold">Répartition par type de stagiaires</p>
            <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-3">
              {Array.from(totaux.parType.entries()).map(([type, n]) => (
                <div key={type} className="flex justify-between rounded-lg border px-3 py-1.5">
                  <dt className="text-muted-foreground">{type}</dt>
                  <dd className="font-semibold">{n}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      ) : null}

      {nonClotures.length > 0 ? (
        <Card className="mt-4 border-amber-500/40">
          <CardContent className="pt-6">
            <p className="text-sm font-semibold text-amber-600">
              {nonClotures.length} dossier{nonClotures.length > 1 ? "s" : ""} {annee} sans clôture
              pédagogique
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ces dossiers ont eu lieu en {annee} mais n'ont pas de réalisé enregistré : ils
              manquent au calcul ci-dessus tant que le formateur ne remplit pas la clôture
              pédagogique du dossier.
            </p>
            <ul className="mt-2 space-y-1 text-xs">
              {nonClotures.map((d) => (
                <li key={d.id} className="text-muted-foreground">
                  {d.dossier_nom || [d.entreprise_nom, d.titre_formation].filter(Boolean).join(" — ")}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <Card className="mt-4">
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : lignes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun réalisé enregistré pour {annee}.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dossier</TableHead>
                    <TableHead>Formateur</TableHead>
                    <TableHead className="text-right">Heures</TableHead>
                    <TableHead className="text-right">Stagiaires</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Objectif BPF</TableHead>
                    <TableHead className="text-right">Encaissé</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lignes.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="max-w-[220px] truncate font-medium">
                        {l.dossierLabel}
                      </TableCell>
                      <TableCell>{l.formateur}</TableCell>
                      <TableCell className="text-right">{l.heures_realisees ?? "—"}</TableCell>
                      <TableCell className="text-right">{l.stagiaires_presents ?? "—"}</TableCell>
                      <TableCell>{l.type_stagiaires ?? "—"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {l.objectif_bpf ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {l.montant_encaisse === null ? "—" : euros(Number(l.montant_encaisse))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
