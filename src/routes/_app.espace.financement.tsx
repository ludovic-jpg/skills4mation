import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { CrmBadge } from "@/components/app/CrmBadge";
import { FORMATEUR_NAV } from "@/components/app/nav";
import { CertificationSelect } from "@/components/app/CertificationSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { dossierNom, type CrmStatut } from "@/lib/crm";
import { FINANCEMENT_LABELS, mergeDonnees, type DossierDonnees } from "@/lib/dossier/types";

export const Route = createFileRoute("/_app/espace/financement")({
  component: FinancementPage,
  head: () => ({
    meta: [
      { title: "Rédaction de la convention — Espace formateur Skills4mation" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const STATUTS_ELIGIBLES: CrmStatut[] = ["dossier_valide", "demande_financement"];

function FinancementPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [dossierId, setDossierId] = useState("");
  const [donnees, setDonnees] = useState<DossierDonnees | null>(null);

  const dossiers = useQuery({
    queryKey: ["dossiers-financement", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossiers")
        .select("id, dossier_nom, entreprise_nom, titre_formation, statut_crm, donnees, created_at")
        .eq("formateur_id", user!.id)
        .in("statut_crm", STATUTS_ELIGIBLES)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const dossier = (dossiers.data ?? []).find((d) => d.id === dossierId) ?? null;

  useEffect(() => {
    if (dossier) setDonnees(mergeDonnees(dossier.donnees));
  }, [dossier?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = useMutation({
    mutationFn: async () => {
      if (!dossier || !donnees) throw new Error("Choisissez un dossier.");
      const { error } = await supabase
        .from("dossiers")
        .update({ donnees })
        .eq("id", dossier.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("Éléments de financement enregistrés.");
      await qc.invalidateQueries({ queryKey: ["dossiers-financement"] });
      await qc.invalidateQueries({ queryKey: ["dossier", dossierId] });
    },
    onError: () => toast.error("Enregistrement impossible."),
  });

  function setTarifs(patch: Partial<DossierDonnees["tarifs"]>) {
    setDonnees((prev) => (prev ? { ...prev, tarifs: { ...prev.tarifs, ...patch } } : prev));
  }
  function setConvention(patch: Partial<DossierDonnees["convention"]>) {
    setDonnees((prev) => (prev ? { ...prev, convention: { ...prev.convention, ...patch } } : prev));
  }

  return (
    <AppShell
      items={FORMATEUR_NAV}
      title="Rédaction de la convention"
      subtitle="Espace simplifié : uniquement les éléments nécessaires à la demande de financement"
    >
      <div className="grid gap-6 lg:max-w-3xl">
        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardContent className="grid gap-3 p-6">
            <Label>Dossier concerné</Label>
            <Select value={dossierId} onValueChange={setDossierId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un dossier validé ou en demande de financement" />
              </SelectTrigger>
              <SelectContent>
                {(dossiers.data ?? []).map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.dossier_nom || dossierNom(d)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(dossiers.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun dossier au statut « Dossier validé » ou « Demande de financement » pour le
                moment.{" "}
                <Link className="underline" to="/espace/dossiers">
                  Voir mes dossiers
                </Link>
              </p>
            ) : null}
            {dossier ? (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <CrmBadge statut={dossier.statut_crm as CrmStatut} />
                <span className="text-xs text-muted-foreground">
                  Numéro ADF :{" "}
                  {mergeDonnees(dossier.donnees).adf || "en attente de validation"}
                </span>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {dossier && donnees ? (
          <>
            <Card className="rounded-2xl border-border/70 shadow-soft">
              <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
                <h2 className="text-base font-semibold sm:col-span-2">Financement</h2>
                <div className="grid gap-1.5">
                  <Label>Mode de financement</Label>
                  <Select
                    value={donnees.tarifs.modeFinancement}
                    onValueChange={(value) =>
                      setTarifs({ modeFinancement: value as DossierDonnees["tarifs"]["modeFinancement"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(FINANCEMENT_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="opco">OPCO / financeur</Label>
                  <Input
                    id="opco"
                    value={donnees.tarifs.opco}
                    onChange={(e) => setTarifs({ opco: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="nbStagiaires">Nombre de stagiaires</Label>
                  <Input
                    id="nbStagiaires"
                    value={donnees.tarifs.nbStagiaires}
                    onChange={(e) => setTarifs({ nbStagiaires: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="prixUnitaire">Prix unitaire (€)</Label>
                  <Input
                    id="prixUnitaire"
                    value={donnees.tarifs.prixUnitaire}
                    onChange={(e) => setTarifs({ prixUnitaire: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="prixTotal">Prix total (€)</Label>
                  <Input
                    id="prixTotal"
                    value={donnees.tarifs.prixTotal}
                    onChange={(e) => setTarifs({ prixTotal: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="montantPrisEnCharge">Montant pris en charge (€)</Label>
                  <Input
                    id="montantPrisEnCharge"
                    value={donnees.tarifs.montantPrisEnCharge}
                    onChange={(e) => setTarifs({ montantPrisEnCharge: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Subrogation de paiement</Label>
                  <Select
                    value={donnees.tarifs.subrogation}
                    onValueChange={(value) => setTarifs({ subrogation: value as "oui" | "non" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oui">Oui</SelectItem>
                      <SelectItem value="non">Non</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="coutCertification">Coût de la certification (€)</Label>
                  <Input
                    id="coutCertification"
                    value={donnees.tarifs.coutCertification}
                    onChange={(e) => setTarifs({ coutCertification: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <CertificationSelect
                    value={donnees.tarifs.certificationCode}
                    cpfUniquement={donnees.tarifs.modeFinancement === "cpf"}
                    label="Certification visée (ICDL / Lilliate)"
                    onChange={(c) =>
                      setTarifs({
                        certificationCode: c?.id ?? null,
                        coutCertification: c ? String(c.prix_formateur_ttc) : "",
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/70 shadow-soft">
              <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
                <h2 className="text-base font-semibold sm:col-span-2">Convention</h2>
                <div className="grid gap-1.5">
                  <Label htmlFor="conventionLieu">Fait à</Label>
                  <Input
                    id="conventionLieu"
                    value={donnees.convention.lieu}
                    onChange={(e) => setConvention({ lieu: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="conventionDate">Le</Label>
                  <Input
                    id="conventionDate"
                    type="date"
                    value={donnees.convention.date}
                    onChange={(e) => setConvention({ date: e.target.value })}
                  />
                </div>
                <div className="flex flex-wrap gap-3 sm:col-span-2">
                  <Button variant="cta" disabled={save.isPending} onClick={() => save.mutate()}>
                    {save.isPending ? "Enregistrement…" : "Enregistrer la convention"}
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/espace/dossiers/$id" params={{ id: dossier.id }}>
                      Ouvrir le dossier et envoyer la convention
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
