import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { AppShell } from "@/components/app/AppShell";
import { adminNav } from "@/components/app/nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export const Route = createFileRoute("/_app/admin/financements")({
  component: AdminFinancements,
  head: () => ({
    meta: [
      { title: "Demandes de financement — Back-office Skills4mation" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const MODES: Record<string, string> = {
  opco: "OPCO",
  cpf: "CPF / CNF",
  fonds_propres: "Fonds propres",
};

const STATUTS: Record<string, { label: string; tone: "ok" | "warn" | "bad" }> = {
  envoyee: { label: "Envoyée", tone: "ok" },
  fonds_propres: { label: "Non requise (fonds propres)", tone: "warn" },
  mode_absent: { label: "Mode de financement manquant", tone: "bad" },
  email_absent: { label: "E-mail formateur manquant", tone: "bad" },
  erreur_envoi: { label: "Échec d'envoi", tone: "bad" },
  non_envoyee: { label: "Non envoyée", tone: "warn" },
};

const euros = (n: number | null) =>
  n === null
    ? "—"
    : n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

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

function StatutBadge({ statut }: { statut: string }) {
  const info = STATUTS[statut] ?? { label: statut, tone: "warn" as const };
  const cls =
    info.tone === "ok"
      ? "border-primary/40 text-primary"
      : info.tone === "bad"
        ? "border-destructive/40 text-destructive"
        : "border-secondary/50 text-foreground";
  return (
    <Badge variant="outline" className={cls}>
      {info.label}
    </Badge>
  );
}

function AdminFinancements() {
  const { isSuperAdmin, isConseillere, isAdmin } = useAuth();
  const equipe = isSuperAdmin || isConseillere || isAdmin;
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"tous" | "opco" | "cpf" | "fonds_propres">("tous");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-financements"],
    enabled: equipe,
    queryFn: async () => {
      const [demandes, profils, dossiers] = await Promise.all([
        supabase
          .from("demandes_financement")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, prenom, nom, email"),
        supabase.from("dossiers").select("id, dossier_nom, entreprise_nom, titre_formation"),
      ]);
      if (demandes.error) throw demandes.error;
      if (profils.error) throw profils.error;
      if (dossiers.error) throw dossiers.error;
      return {
        demandes: demandes.data ?? [],
        profils: profils.data ?? [],
        dossiers: dossiers.data ?? [],
      };
    },
  });

  if (!equipe) {
    return (
      <AppShell items={adminNav({ isSuperAdmin, isConseillere })} title="Demandes de financement">
        <Card className="rounded-2xl border-destructive/30">
          <CardContent className="p-8 text-sm text-muted-foreground">
            Accès réservé à l'équipe Skills4mation.
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const profilParId = new Map((data?.profils ?? []).map((p) => [p.id, p]));
  const dossierParId = new Map((data?.dossiers ?? []).map((d) => [d.id, d]));

  const lignes = (data?.demandes ?? [])
    .filter((d) => (mode === "tous" ? true : d.mode === mode))
    .map((d) => {
      const p = profilParId.get(d.formateur_id);
      const dos = dossierParId.get(d.dossier_id);
      return {
        ...d,
        formateur: `${p?.prenom ?? ""} ${p?.nom ?? ""}`.trim() || p?.email || "Formateur",
        dossierLabel:
          dos?.dossier_nom ||
          [dos?.entreprise_nom, dos?.titre_formation].filter(Boolean).join(" — ") ||
          `Dossier ${d.dossier_id.slice(0, 8)}`,
      };
    })
    .filter((d) =>
      `${d.formateur} ${d.dossierLabel} ${d.destinataire_email ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );

  const envoyees = lignes.filter((d) => d.statut === "envoyee");
  const enEchec = lignes.filter((d) => STATUTS[d.statut]?.tone === "bad");
  const total = envoyees.reduce((s, d) => s + Number(d.montant ?? 0), 0);

  return (
    <AppShell
      items={adminNav({ isSuperAdmin, isConseillere })}
      title="Demandes de financement"
      subtitle="Suivi par formateur des demandes OPCO et CPF/CNF transmises après validation du dossier : statut et date d'envoi"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Demandes envoyées
            </p>
            <p className="mt-1 text-2xl font-bold">{envoyees.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Montant demandé
            </p>
            <p className="mt-1 text-2xl font-bold">{euros(total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              À relancer
            </p>
            <p className="mt-1 text-2xl font-bold">{enEchec.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Envois échoués ou informations manquantes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Input
          placeholder="Rechercher un formateur, un dossier…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />
        {(["tous", "opco", "cpf", "fonds_propres"] as const).map((m) => (
          <Button
            key={m}
            size="sm"
            variant={mode === m ? "teal" : "outline"}
            onClick={() => setMode(m)}
          >
            {m === "tous" ? "Tous" : MODES[m]}
          </Button>
        ))}
      </div>

      <Card className="mt-4">
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : lignes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune demande de financement enregistrée pour ce filtre. Les demandes sont créées
              automatiquement lorsque la signature Skills4mation est apposée sur un dossier.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Formateur</TableHead>
                    <TableHead>Dossier</TableHead>
                    <TableHead>Financeur</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Certification</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date d'envoi</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lignes.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.formateur}</TableCell>
                      <TableCell className="max-w-[240px] truncate">{d.dossierLabel}</TableCell>
                      <TableCell>{d.mode ? (MODES[d.mode] ?? d.mode) : "—"}</TableCell>
                      <TableCell className="text-right">
                        {d.montant === null ? "—" : euros(Number(d.montant))}
                      </TableCell>
                      <TableCell className="text-right">
                        {d.cout_certification === null ? "—" : euros(Number(d.cout_certification))}
                      </TableCell>
                      <TableCell>
                        <StatutBadge statut={d.statut} />
                        {d.message ? (
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {d.message}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {dateFr(d.envoye_le)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="ghost">
                          <Link to="/admin/dossiers" search={{ dossier: d.dossier_id }}>
                            Voir
                          </Link>
                        </Button>
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
