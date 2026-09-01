import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { adminNav } from "@/components/app/nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { apposerSignatureOrganisme } from "@/lib/dossier-signature-organisme.functions";
import { supabase } from "@/integrations/supabase/client";
import { dossierNom, type CrmStatut } from "@/lib/crm";
import { mergeDonnees } from "@/lib/dossier/types";
import { formatDate } from "@/lib/statuts";

export const Route = createFileRoute("/_app/admin/validation")({
  component: AdminValidation,
});

/** Pièces obligatoires avant validation du dossier par la conseillère. */
const PIECES_OBLIGATOIRES = ["1A", "2", "3A", "F0A", "F0C"] as const;

type Row = {
  id: string;
  formateur_id: string;
  dossier_nom: string | null;
  entreprise_nom: string | null;
  entreprise_siret: string | null;
  titre_formation: string | null;
  date_debut: string | null;
  statut_crm: CrmStatut;
  created_at: string;
  validation_due_at: string | null;
  donnees: unknown;
};

type PieceRow = { dossier_id: string; code: string; statut: string; generated_at: string | null };

/** Badge de délai : vert > 12 h, orange 0–12 h, rouge dépassé. */
function delai(dueAt: string | null, createdAt: string) {
  const echeance = dueAt
    ? new Date(dueAt).getTime()
    : new Date(createdAt).getTime() + 24 * 3600 * 1000;
  const restant = echeance - Date.now();
  const heures = Math.round(restant / 3600000);
  if (restant <= 0)
    return { label: `Dépassé de ${Math.abs(heures)} h`, variant: "destructive" as const };
  if (heures <= 12) return { label: `${heures} h restantes`, variant: "cta" as const };
  return { label: `${heures} h restantes`, variant: "success" as const };
}

function nombreOk(valeur: string | undefined) {
  if (!valeur) return false;
  const n = Number(valeur.replace(/[^\d.,-]/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0;
}

function AdminValidation() {
  const { isAdmin, isConseillere, isSuperAdmin, loading } = useAuth();
  const autorise = isConseillere || isSuperAdmin || isAdmin;
  const queryClient = useQueryClient();
  const [coches, setCoches] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin-validation"],
    enabled: autorise,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossiers")
        .select(
          "id, formateur_id, dossier_nom, entreprise_nom, entreprise_siret, titre_formation, date_debut, statut_crm, created_at, validation_due_at, donnees",
        )
        .eq("statut_crm", "demande_validation")
        .order("validation_due_at", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const rows = data ?? [];
  const ids = rows.map((r) => r.id);

  const { data: pieces } = useQuery({
    queryKey: ["admin-validation-pieces", ids.join(",")],
    enabled: autorise && ids.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossier_pieces")
        .select("dossier_id, code, statut, generated_at")
        .in("dossier_id", ids);
      if (error) throw error;
      return (data ?? []) as PieceRow[];
    },
  });

  const { data: profils } = useQuery({
    queryKey: ["admin-validation-profils"],
    enabled: autorise,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, prenom, nom, email, numero_nda");
      if (error) throw error;
      return data ?? [];
    },
  });

  const signer = useServerFn(apposerSignatureOrganisme);

  const valider = useMutation({
    mutationFn: async (row: Row) => signer({ data: { dossierId: row.id } }),
    onSuccess: (result) => {
      toast.success("Signature Skills4mation apposée : certificat archivé, dossier validé.");
      const financement = result?.financement;
      if (financement?.message) {
        if (financement.envoye) toast.success(financement.message);
        else toast.warning(financement.message);
      }
      void queryClient.invalidateQueries({ queryKey: ["admin-validation"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-dossiers"] });
    },
    onError: (error: unknown) =>
      toast.error(
        error instanceof Error ? error.message : "Signature impossible pour le moment.",
      ),
  });

  const conformite = useMemo(() => {
    const map: Record<string, { key: string; label: string; auto: boolean }[]> = {};
    for (const row of rows) {
      const d = mergeDonnees(row.donnees);
      const profil = (profils ?? []).find((p) => p.id === row.formateur_id);
      const piecesDossier = (pieces ?? []).filter((p) => p.dossier_id === row.id);
      const piecesOk = PIECES_OBLIGATOIRES.every((code) => {
        const p = piecesDossier.find((x) => x.code === code);
        return !!p && (p.statut !== "a_generer" || !!p.generated_at);
      });
      map[row.id] = [
        {
          key: "siret",
          label: "SIRET entreprise renseigné",
          auto: !!(row.entreprise_siret || d.entreprise.siret),
        },
        {
          key: "nda",
          label: "Numéro NDA du formateur renseigné",
          auto: !!(profil?.numero_nda || d.formateur.nda),
        },
        {
          key: "pieces",
          label: "Pièces 1A / 2 / 3A / F0A / F0C générées",
          auto: piecesOk,
        },
        {
          key: "montant",
          label: "Montant du dossier renseigné et cohérent",
          auto: nombreOk(d.tarifs.prixTotal) || nombreOk(d.tarifs.montantPrisEnCharge),
        },
      ];
    }
    return map;
  }, [rows, pieces, profils]);

  const estCoche = (dossierId: string, key: string, auto: boolean) =>
    coches[`${dossierId}:${key}`] ?? auto;

  if (!loading && !autorise) {
    return (
      <AppShell items={adminNav(isSuperAdmin)} title="File de validation">
        <Card className="rounded-2xl border-destructive/30">
          <CardContent className="p-8 text-sm text-muted-foreground">
            Accès réservé aux conseillères formation et super admins.
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      items={adminNav(isSuperAdmin)}
      title="File de validation"
      subtitle="Dossiers en attente de validation, du plus ancien au plus récent (objectif 24 h)"
    >
      <div className="grid gap-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : rows.length === 0 ? (
          <Card className="rounded-2xl border-dashed">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              Aucun dossier en attente de validation.
            </CardContent>
          </Card>
        ) : (
          rows.map((row) => {
            const d = delai(row.validation_due_at, row.created_at);
            const items = conformite[row.id] ?? [];
            const complet = items.every((item) => estCoche(row.id, item.key, item.auto));
            const profil = (profils ?? []).find((p) => p.id === row.formateur_id);
            return (
              <Card key={row.id} className="rounded-2xl border-border/70 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold">
                        {row.dossier_nom || dossierNom(row)}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {profil
                          ? `${profil.prenom} ${profil.nom}`.trim() || profil.email
                          : "Formateur"}{" "}
                        · demande reçue le {formatDate(row.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={d.variant}>{d.label}</Badge>
                      <Button asChild size="sm" variant="outline">
                        <Link to="/admin/dossiers">Voir dans le CRM</Link>
                      </Button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2 rounded-xl border border-border/70 bg-muted/30 p-4 sm:grid-cols-2">
                    {items.map((item) => (
                      <label
                        key={item.key}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <Checkbox
                          checked={estCoche(row.id, item.key, item.auto)}
                          onCheckedChange={(value) =>
                            setCoches((prev) => ({
                              ...prev,
                              [`${row.id}:${item.key}`]: value === true,
                            }))
                          }
                        />
                        <span>
                          {item.label}
                          {!item.auto && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              (à vérifier manuellement)
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button
                      size="sm"
                      variant="cta"
                      disabled={!complet || valider.isPending}
                      onClick={() => valider.mutate(row)}
                    >
                      {valider.isPending
                        ? "Signature en cours…"
                        : "Valider et apposer la signature Skills4mation"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
