import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { BadgeCheck, CircleDashed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { demanderPaiement } from "@/lib/dossier-communication.functions";
import { PIECES_REQUISES_PAIEMENT, pieceLabel } from "@/lib/dossier/pieces";
import type { CrmStatut } from "@/lib/crm";

/**
 * Checklist Qualiopi des pièces exigées avant paiement.
 * Le bouton « Demander le paiement » ne s'active que lorsque tout est complet/archivé.
 */
export function ChecklistPaiement({
  dossierId,
  statutCrm,
}: {
  dossierId: string;
  statutCrm: CrmStatut;
}) {
  const queryClient = useQueryClient();
  const demander = useServerFn(demanderPaiement);

  const { data: pieces } = useQuery({
    queryKey: ["checklist-paiement", dossierId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossier_pieces")
        .select("code, statut")
        .eq("dossier_id", dossierId);
      if (error) throw error;
      return data ?? [];
    },
  });

  const completes = new Set(
    (pieces ?? []).filter((p) => p.statut === "complete").map((p) => p.code),
  );
  const manquantes = PIECES_REQUISES_PAIEMENT.filter((code) => !completes.has(code));
  const dejaDemande = ["demande_paiement", "paiement_organisme", "paiement_formateur"].includes(
    statutCrm,
  );

  const mutation = useMutation({
    mutationFn: async () => demander({ data: { dossierId } }),
    onSuccess: () => {
      toast.success("Demande de paiement enregistrée et apprenant informé.");
      void queryClient.invalidateQueries();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Card className="rounded-2xl border-border/70 shadow-soft">
      <CardContent className="grid gap-4 p-6">
        <div>
          <h2 className="text-base font-semibold">Checklist de complétude — paiement</h2>
          <p className="text-sm text-muted-foreground">
            {manquantes.length === 0
              ? "Toutes les pièces exigées sont archivées."
              : `${manquantes.length} pièce(s) manquante(s) sur ${PIECES_REQUISES_PAIEMENT.length}.`}
          </p>
        </div>

        <ul className="grid gap-1.5 text-sm sm:grid-cols-2">
          {PIECES_REQUISES_PAIEMENT.map((code) => {
            const ok = completes.has(code);
            return (
              <li key={code} className="flex items-center gap-2">
                {ok ? (
                  <BadgeCheck className="size-4 text-success" />
                ) : (
                  <CircleDashed className="size-4 text-muted-foreground" />
                )}
                <span className={ok ? "" : "text-muted-foreground"}>
                  {code} — {pieceLabel(code)}
                </span>
              </li>
            );
          })}
        </ul>

        <div>
          <Button
            variant="cta"
            disabled={manquantes.length > 0 || dejaDemande || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {dejaDemande ? "Paiement déjà demandé" : "Demander le paiement"}
          </Button>
          {manquantes.length > 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              À compléter : {manquantes.join(", ")}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
