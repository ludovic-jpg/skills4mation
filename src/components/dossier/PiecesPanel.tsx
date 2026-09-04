import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { declencherAutomatisations } from "@/lib/dossier-automatisations.functions";
import { toast } from "sonner";
import { Archive, FileDown, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { PIECES, PIECE_SOURCES, PIECE_STATUTS, type PieceStatut } from "@/lib/dossier/pieces";
import { downloadBlob, exportDossierZip, pieceFileName, renderPieceBlob } from "@/lib/dossier/pdf";
import type { DossierDonnees } from "@/lib/dossier/types";
import {
  PIECES_ENVOI_TIERS,
  pieceVisibleSelonStatut,
  prerequisEnvoiTiersManquants,
} from "@/lib/dossier/visibilite";
import type { CrmStatut } from "@/lib/crm";

type PieceRow = {
  id: string;
  code: string;
  statut: PieceStatut;
  remarque: string | null;
};

export function PiecesPanel({
  dossierId,
  formateurId,
  donnees,
  statutCrm,
}: {
  dossierId: string;
  formateurId: string;
  donnees: DossierDonnees;
  /** Masque les pièces non encore révélées à ce stade du pipeline (3A, F0C). */
  statutCrm?: CrmStatut | null;
}) {
  const pieces = PIECES.filter((p) => pieceVisibleSelonStatut(p.code, statutCrm ?? undefined));
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);

  const { data: rows } = useQuery({
    queryKey: ["dossier-pieces", dossierId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossier_pieces")
        .select("id, code, statut, remarque")
        .eq("dossier_id", dossierId);
      if (error) throw error;
      return (data ?? []) as PieceRow[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (input: { code: string; statut?: PieceStatut; remarque?: string }) => {
      const { error } = await supabase.from("dossier_pieces").upsert(
        {
          dossier_id: dossierId,
          formateur_id: formateurId,
          code: input.code,
          ...(input.statut ? { statut: input.statut } : {}),
          ...(input.remarque !== undefined ? { remarque: input.remarque } : {}),
        },
        { onConflict: "dossier_id,code" },
      );
      if (error) throw error;
      // L'attestation de réalisation (1B) part automatiquement dès que
      // l'émargement (F3) est complété.
      if (input.code === "F3" && input.statut === "complete") {
        await declencherAutomatisations({ data: { dossierId } }).catch((err) =>
          console.error("[automatisations]", err),
        );
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dossier-pieces", dossierId] }),
    onError: () => toast.error("Mise à jour de la pièce impossible."),
  });

  function statutOf(code: string): PieceStatut {
    const row = rows?.find((r) => r.code === code);
    if (row) return row.statut;
    return PIECES.find((p) => p.code === code)?.statutInitial ?? "a_generer";
  }

  // Signal (non bloquant) : 1A / 1C / 2 ne devraient partir chez un tiers qu'après
  // retour du recueil des besoins (F0A) et du test de positionnement (TP).
  const prerequisManquants = prerequisEnvoiTiersManquants({
    F0A: statutOf("F0A"),
    TP: statutOf("TP"),
  });

  async function generer(code: string) {
    setBusy(code);
    try {
      const blob = await renderPieceBlob(code, donnees);
      downloadBlob(blob, pieceFileName(code, donnees));
      await upsert.mutateAsync({ code, statut: "complete" });
      toast.success("Document généré.");
    } catch {
      toast.error("Génération impossible : vérifiez les variables du dossier.");
    } finally {
      setBusy(null);
    }
  }

  async function exportZip() {
    setZipping(true);
    try {
      const recap = pieces.map(
        (p) =>
          `${p.code};${p.label};${PIECE_SOURCES[p.source]};${PIECE_STATUTS[statutOf(p.code)].label}`,
      );
      const blob = await exportDossierZip(
        pieces.filter((p) => p.generable).map((p) => p.code),
        donnees,
        [
          {
            name: "etat-du-dossier.csv",
            content: ["Code;Pièce;Source;État", ...recap].join("\n"),
          },
        ],
      );
      downloadBlob(blob, `dossier-${donnees.adf || dossierId.slice(0, 8)}.zip`);
      toast.success("Dossier exporté.");
    } catch {
      toast.error("Export ZIP impossible.");
    } finally {
      setZipping(false);
    }
  }

  const complets = pieces.filter((p) => statutOf(p.code) === "complete").length;

  return (
    <Card className="rounded-2xl border-border/70 shadow-soft">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Pièces du dossier formation</h2>
            <p className="text-sm text-muted-foreground">
              {complets}/{pieces.length} pièces complétées
            </p>
          </div>
          <Button variant="cta" disabled={zipping} onClick={() => void exportZip()}>
            <Archive className="mr-1.5 size-4" />
            {zipping ? "Préparation…" : "Export ZIP du dossier"}
          </Button>
        </div>

        <ul className="mt-5 divide-y divide-border">
          {pieces.map((piece) => {
            const statut = statutOf(piece.code);
            const row = rows?.find((r) => r.code === piece.code);
            return (
              <li key={piece.code} className="grid gap-3 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <span className="font-semibold">
                        {piece.code} — {piece.label}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs ${PIECE_STATUTS[statut].tone}`}
                      >
                        {PIECE_STATUTS[statut].label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {PIECE_SOURCES[piece.source]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{piece.description}</p>
                    {PIECES_ENVOI_TIERS.includes(piece.code) && prerequisManquants.length > 0 ? (
                      <p className="mt-1 text-xs text-amber-600">
                        À envoyer de préférence après retour de{" "}
                        {prerequisManquants
                          .map((c) => (c === "F0A" ? "Recueil des besoins (F0A)" : "Test de positionnement (TP)"))
                          .join(" et ")}{" "}
                        : sans cela, la convention et le programme partent sans connaître le niveau
                        réel de l'apprenant.
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {/* Le lien vers la matrice interne n'est jamais exposé au formateur. */}

                    {piece.generable ? (
                      <Button
                        variant="teal"
                        size="sm"
                        disabled={busy === piece.code}
                        onClick={() => void generer(piece.code)}
                      >
                        <FileDown className="mr-1.5 size-4" />
                        {busy === piece.code ? "Génération…" : "Générer le PDF"}
                      </Button>
                    ) : null}
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-[220px_1fr]">
                  <Select
                    value={statut}
                    onValueChange={(v) =>
                      upsert.mutate({ code: piece.code, statut: v as PieceStatut })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PIECE_STATUTS).map(([value, meta]) => (
                        <SelectItem key={value} value={value}>
                          {meta.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Remarque / état"
                    defaultValue={row?.remarque ?? ""}
                    onBlur={(e) => {
                      if (e.target.value !== (row?.remarque ?? "")) {
                        upsert.mutate({ code: piece.code, remarque: e.target.value });
                      }
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
