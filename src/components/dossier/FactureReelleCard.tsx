import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Receipt, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

/**
 * Dépôt de la facture réelle du formateur (F9R). La facture Skills4mation (FSK)
 * est celle émise par l'organisme à l'entreprise cliente (ou à l'OPCO en cas de
 * subrogation) : elle ne remplace pas ce dépôt, exigé avant la mise en paiement.
 */
export function FactureReelleCard({
  dossierId,
  formateurId,
}: {
  dossierId: string;
  formateurId: string;
}) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const { data: piece } = useQuery({
    queryKey: ["piece-f9r", dossierId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossier_pieces")
        .select("statut, fichier_url, updated_at")
        .eq("dossier_id", dossierId)
        .eq("code", "F9R")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const deposer = useMutation({
    mutationFn: async (file: File) => {
      const chemin = `${formateurId}/${dossierId}/facture/${Date.now()}_${file.name.replace(/[^\w.\-]+/g, "_")}`;
      const { error } = await supabase.storage.from("documents").upload(chemin, file, {
        contentType: file.type || "application/pdf",
        upsert: true,
      });
      if (error) throw error;
      const { error: pieceError } = await supabase.from("dossier_pieces").upsert(
        {
          dossier_id: dossierId,
          formateur_id: formateurId,
          code: "F9R",
          statut: "complete",
          fichier_url: chemin,
        },
        { onConflict: "dossier_id,code" },
      );
      if (pieceError) throw pieceError;
    },
    onSuccess: () => {
      toast.success("Facture déposée au dossier.");
      void queryClient.invalidateQueries({ queryKey: ["piece-f9r", dossierId] });
      void queryClient.invalidateQueries({ queryKey: ["dossier-pieces", dossierId] });
    },
    onError: () => toast.error("Dépôt impossible."),
  });

  async function ouvrir(chemin: string) {
    setBusy(true);
    const { data } = await supabase.storage.from("documents").createSignedUrl(chemin, 600);
    setBusy(false);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    else toast.error("Fichier momentanément indisponible.");
  }

  return (
    <Card className="rounded-2xl border-border/70 shadow-soft">
      <CardContent className="p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Receipt className="size-4 text-primary" /> Ma facture (F9R)
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          La facture Skills4mation (FSK) du dossier est celle adressée à l'entreprise cliente (ou à
          l'OPCO en cas de subrogation). Déposez ici votre propre facture de formateur, exigée avant
          la mise en paiement.
        </p>

        {piece?.fichier_url ? (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-success">
            <CheckCircle2 className="size-4" /> Facture déposée
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) deposer.mutate(file);
              e.target.value = "";
            }}
          />
          <Button
            size="sm"
            variant="teal"
            disabled={deposer.isPending}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="mr-1.5 size-4" />
            {deposer.isPending
              ? "Envoi…"
              : piece?.fichier_url
                ? "Remplacer ma facture"
                : "Déposer ma facture"}
          </Button>
          {piece?.fichier_url ? (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => void ouvrir(piece.fichier_url!)}
            >
              Voir le fichier déposé
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
