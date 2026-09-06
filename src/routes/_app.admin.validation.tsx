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
import { Textarea } from "@/components/ui/textarea";
import { refuserDossier } from "@/lib/dossier-refus.functions";
import { useAuth } from "@/hooks/useAuth";
import { apposerSignatureOrganisme } from "@/lib/dossier-signature-organisme.functions";
import { validerEtGenererAdf } from "@/lib/dossier-adf.functions";
import { synchroniserApprenants } from "@/lib/dossier-envois.functions";

import { supabase } from "@/integrations/supabase/client";
import { dossierNom, type CrmStatut } from "@/lib/crm";
import { mergeDonnees } from "@/lib/dossier/types";
import { formatDate } from "@/lib/statuts";

export const Route = createFileRoute("/_app/admin/validation")({
  component: AdminValidation,
});

/** Pièces obligatoires avant validation du dossier par la conseillère. */
const PIECES_OBLIGATOIRES = ["1A", "1C", "2", "F0A"] as const;

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
  const { isConseiller, loading } = useAuth();
  const autorise = isConseiller;
  const queryClient = useQueryClient();
  const [coches, setCoches] = useState<Record<string, boolean>>({});
  /** Motif de refus en cours de saisie, par dossier (undefined = zone fermée). */
  const [refus, setRefus] = useState<Record<string, string | undefined>>({});

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
  const genererAdf = useServerFn(validerEtGenererAdf);
  const sync = useServerFn(synchroniserApprenants);
  const refuserFn = useServerFn(refuserDossier);

  const refuser = useMutation({
    mutationFn: async ({ row, motif }: { row: Row; motif: string }) =>
      refuserFn({ data: { dossierId: row.id, motif } }),
    onSuccess: (result) => {
      toast.success(
        result?.emailEnvoye
          ? "Dossier refusé : le motif a été envoyé au formateur par e-mail."
          : "Dossier refusé : le motif est enregistré dans l'historique du dossier.",
      );
      setRefus({});
      void queryClient.invalidateQueries({ queryKey: ["admin-validation"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-dossiers"] });
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : "Refus impossible pour le moment."),
  });


  const valider = useMutation({
    mutationFn: async (row: Row) => {
      // Le numéro ADF est attribué par le back-office avant l'apposition de la signature.
      const adf = await genererAdf({ data: { dossierId: row.id } });
      // apposerSignatureOrganisme est la seule source de vérité pour statut_crm et pour
      // les champs signature_organisme_* : elle calcule l'empreinte SHA-256, génère le
      // certificat archivé et enregistre exactement l'horodatage et le signataire qui ont
      // servi à ce certificat. Une écriture séparée ici recalculerait sa propre date/nom
      // et les désynchroniserait du certificat déjà posé — ne pas la reproduire.
      const result = await signer({ data: { dossierId: row.id } });
      await sync({ data: { dossierId: row.id } }).catch((err) =>
        console.error("[sync-apprenants]", err),
      );

      return { ...result, adf: adf?.adf };
    },

    onSuccess: (result) => {
      toast.success(
        result?.adf
          ? `Dossier validé — numéro ADF ${result.adf} attribué et signature Skills4mation apposée.`
          : "Signature Skills4mation apposée : certificat archivé, dossier validé.",
      );
      const financement = result?.financement;
      if (financement?.message) {
        if (financement.envoye) toast.success(financement.message);
        else toast.warning(financement.message);
      }
      if (result?.renduDegrade) {
        toast.warning(
          "Le connecteur Google Drive était indisponible : la convention signée et son certificat ont été générés en rendu dégradé (texte brut, sans mise en forme). Vérifiez le document archivé et régénérez-le dès que Drive est rétabli.",
        );
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
      <AppShell items={adminNav()} title="File de validation">
        <Card className="rounded-2xl border-destructive/30">
          <CardContent className="p-8 text-sm text-muted-foreground">
            Accès réservé aux conseillers formation.
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      items={adminNav()}
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
            const manquants = items
              .filter((item) => !estCoche(row.id, item.key, item.auto))
              .map((item) => item.label);
            const complet = manquants.length === 0;
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

                  <div className="mt-4 flex flex-col items-end gap-2">
                    {!complet ? (
                      <p className="text-xs text-amber-600 sm:text-right">
                        Points à vérifier avant validation : {manquants.join(", ")}.
                      </p>
                    ) : null}
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setRefus((prev) => ({
                            ...prev,
                            [row.id]: prev[row.id] === undefined ? "" : undefined,
                          }))
                        }
                      >
                        Refuser
                      </Button>
                      <Button
                        size="sm"
                        variant="cta"
                        disabled={valider.isPending}
                        onClick={() => valider.mutate(row)}
                      >
                        {valider.isPending
                          ? "Signature en cours…"
                          : "Valider et apposer la signature Skills4mation"}
                      </Button>
                    </div>

                    {refus[row.id] !== undefined ? (
                      <div className="mt-2 w-full rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                        <label
                          className="text-sm font-semibold text-foreground"
                          htmlFor={`motif-${row.id}`}
                        >
                          Motif du refus (obligatoire)
                        </label>
                        <Textarea
                          id={`motif-${row.id}`}
                          rows={3}
                          className="mt-2 bg-background"
                          placeholder="Expliquez au formateur ce qui bloque la validation de son dossier…"
                          value={refus[row.id] ?? ""}
                          onChange={(event) =>
                            setRefus((prev) => ({ ...prev, [row.id]: event.target.value }))
                          }
                        />
                        <p className="mt-2 text-xs text-muted-foreground">
                          Le motif est enregistré dans l&apos;historique du dossier et envoyé par
                          e-mail au formateur.
                        </p>
                        <div className="mt-3 flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setRefus((prev) => ({ ...prev, [row.id]: undefined }))
                            }
                          >
                            Annuler
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={
                              (refus[row.id] ?? "").trim().length < 10 || refuser.isPending
                            }
                            onClick={() =>
                              refuser.mutate({ row, motif: (refus[row.id] ?? "").trim() })
                            }
                          >
                            {refuser.isPending ? "Refus en cours…" : "Confirmer le refus"}
                          </Button>
                        </div>
                      </div>
                    ) : null}
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
