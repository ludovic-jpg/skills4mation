import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ClipboardCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { cloturerFinancement } from "@/lib/dossier-financement.functions";

/**
 * Formulaire de clôture pédagogique : les données du réalisé (heures dispensées,
 * présence, montants) qu'aucun autre écran ne collecte aujourd'hui. C'est la
 * source du Bilan Pédagogique et Financier (BPF) et de l'indicateur Qualiopi 11 —
 * sans ce formulaire rempli en fin de formation, ces données du réalisé sont
 * perdues et doivent être reconstituées manuellement au moment du BPF.
 */
export function ClotureFinancementCard({ dossierId }: { dossierId: string }) {
  const queryClient = useQueryClient();
  const cloturer = useServerFn(cloturerFinancement);

  const { data } = useQuery({
    queryKey: ["dossier-financement", dossierId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossier_financement")
        .select(
          "heures_realisees, stagiaires_presents, objectif_bpf, type_stagiaires, montant_encaisse, date_reversement_formateur, montant_reversement_formateur, cloture_le",
        )
        .eq("dossier_id", dossierId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({
    heuresRealisees: "",
    stagiairesPresents: "",
    objectifBpf: "",
    typeStagiaires: "",
    montantEncaisse: "",
    dateReversementFormateur: "",
    montantReversementFormateur: "",
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      heuresRealisees: data.heures_realisees?.toString() ?? "",
      stagiairesPresents: data.stagiaires_presents?.toString() ?? "",
      objectifBpf: data.objectif_bpf ?? "",
      typeStagiaires: data.type_stagiaires ?? "",
      montantEncaisse: data.montant_encaisse?.toString() ?? "",
      dateReversementFormateur: data.date_reversement_formateur ?? "",
      montantReversementFormateur: data.montant_reversement_formateur?.toString() ?? "",
    });
  }, [data]);

  const enregistrer = useMutation({
    mutationFn: async () =>
      cloturer({
        data: {
          dossierId,
          heuresRealisees: form.heuresRealisees ? Number(form.heuresRealisees) : undefined,
          stagiairesPresents: form.stagiairesPresents ? Number(form.stagiairesPresents) : undefined,
          objectifBpf: form.objectifBpf || undefined,
          typeStagiaires: form.typeStagiaires || undefined,
          montantEncaisse: form.montantEncaisse ? Number(form.montantEncaisse) : undefined,
          dateReversementFormateur: form.dateReversementFormateur || undefined,
          montantReversementFormateur: form.montantReversementFormateur
            ? Number(form.montantReversementFormateur)
            : undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Réalisé enregistré : ces données alimenteront le BPF de l'exercice.");
      void queryClient.invalidateQueries({ queryKey: ["dossier-financement", dossierId] });
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : "Enregistrement impossible."),
  });

  function champ<K extends keyof typeof form>(key: K) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  return (
    <Card className="rounded-2xl border-border/70 shadow-soft">
      <CardContent className="grid gap-4 p-6">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <ClipboardCheck className="size-4 text-primary" /> Clôture pédagogique — réalisé
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            À remplir en fin de formation : ces données (et non les chiffres prévisionnels du
            dossier) servent au Bilan Pédagogique et Financier annuel.
          </p>
          {data?.cloture_le ? (
            <p className="mt-1 text-xs text-success">
              Dernière clôture enregistrée le{" "}
              {new Date(data.cloture_le).toLocaleDateString("fr-FR")}.
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="heures-realisees">Heures réellement dispensées</Label>
            <Input id="heures-realisees" type="number" min="0" step="0.5" {...champ("heuresRealisees")} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="stagiaires-presents">Stagiaires réellement présents</Label>
            <Input id="stagiaires-presents" type="number" min="0" step="1" {...champ("stagiairesPresents")} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="objectif-bpf">Objectif de la formation (catégorie BPF)</Label>
            <Input
              id="objectif-bpf"
              placeholder="Ex. adaptation au poste, perfectionnement, reconversion…"
              {...champ("objectifBpf")}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="type-stagiaires">Type de stagiaires</Label>
            <Input
              id="type-stagiaires"
              placeholder="Ex. salariés, demandeurs d'emploi, indépendants…"
              {...champ("typeStagiaires")}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="montant-encaisse">Montant réellement encaissé (€)</Label>
            <Input id="montant-encaisse" type="number" min="0" step="0.01" {...champ("montantEncaisse")} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="date-reversement">Date de reversement au formateur</Label>
            <Input id="date-reversement" type="date" {...champ("dateReversementFormateur")} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="montant-reversement">Montant reversé au formateur (€)</Label>
            <Input
              id="montant-reversement"
              type="number"
              min="0"
              step="0.01"
              {...champ("montantReversementFormateur")}
            />
          </div>
        </div>

        <div>
          <Button
            variant="cta"
            size="sm"
            disabled={enregistrer.isPending}
            onClick={() => enregistrer.mutate()}
          >
            {enregistrer.isPending ? "Enregistrement…" : "Enregistrer le réalisé"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
