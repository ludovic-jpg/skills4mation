import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Download, FileText, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { DOCUMENTS_CONSULTABLES, PIECES } from "@/lib/dossier/pieces";
import { documentSocleDiffusable } from "@/lib/dossier/visibilite";
import { CRM_STATUTS, type CrmStatut } from "@/lib/crm";

type PieceRow = {
  code: string;
  statut: string;
  fichier_url: string | null;
  generated_at: string | null;
};

/** Étape à partir de laquelle chaque document du socle est diffusé au formateur. */
const ETAPE_DIFFUSION: Record<string, CrmStatut> = {
  "1A": "dossier_valide",
  "1C": "dossier_valide",
  "2": "dossier_valide",
  F0A: "dossier_valide",
  F3: "formation_en_cours",
  FSK: "formation_realisee",
  F5: "formation_realisee",
};

/**
 * Vue de consultation du socle documentaire (1A, 1C, 2, F0A, F3, F5).
 * Aucune génération, impression, envoi ni dépôt : les PDF sont produits
 * automatiquement à la soumission du dossier et diffusés selon le calendrier.
 */
export function MesDocumentsPanel({
  dossierId,
  statutCrm,
  signatureOrganismeDate,
}: {
  dossierId: string;
  statutCrm?: CrmStatut | null;
  signatureOrganismeDate?: string | null;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  const { data: rows } = useQuery({
    queryKey: ["dossier-pieces", dossierId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossier_pieces")
        .select("code, statut, fichier_url, generated_at")
        .eq("dossier_id", dossierId);
      if (error) throw error;
      return (data ?? []) as PieceRow[];
    },
  });

  const documents = DOCUMENTS_CONSULTABLES.map((code) => {
    const def = PIECES.find((p) => p.code === code);
    const row = rows?.find((r) => r.code === code);
    const diffusable = documentSocleDiffusable(code, statutCrm, signatureOrganismeDate);
    const complet = diffusable && Boolean(row?.fichier_url);
    const requis = ETAPE_DIFFUSION[code];
    return {
      code,
      label: def?.label ?? code,
      description: def?.description ?? "",
      fichier: complet ? (row?.fichier_url ?? null) : null,
      complet,
      auto: def?.mode === "signature" && def?.generable === true,
      verrou: !signatureOrganismeDate
        ? "En attente du visa Skills4mation"
        : `Disponible à l'étape : ${requis ? CRM_STATUTS[requis].label : "à venir"}`,
    };
  });


  async function telecharger(chemin: string, code: string) {
    setBusy(code);
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(chemin, 60 * 10);
    setBusy(null);
    if (error || !data?.signedUrl) {
      toast.error("Téléchargement momentanément indisponible.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  const complets = documents.filter((d) => d.complet).length;

  return (
    <Card className="rounded-2xl border-border/70 shadow-soft">
      <CardContent className="p-6">
        <h2 className="text-base font-semibold">Mes documents</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {complets}/{documents.length} documents disponibles. Ils sont produits automatiquement à
          la soumission du dossier, puis mis à disposition après validation par l'équipe
          Skills4mation.
        </p>

        <ul className="mt-5 divide-y divide-border">
          {documents.map((doc) => (
            <li key={doc.code} className="flex flex-wrap items-start justify-between gap-3 py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <span className="font-semibold">
                    {doc.code} — {doc.label}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs ${
                      doc.complet
                        ? "border-success/30 bg-success/12 text-success"
                        : "border-accent bg-accent text-accent-foreground"
                    }`}
                  >
                    {doc.complet
                      ? "Complété"
                      : doc.auto
                        ? "Généré automatiquement"
                        : "En attente de retour"}

                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{doc.description}</p>
              </div>
              {doc.complet && doc.fichier ? (
                <Button
                  size="sm"
                  variant="teal"
                  disabled={busy === doc.code}
                  onClick={() => void telecharger(doc.fichier!, doc.code)}
                >
                  <Download className="mr-1.5 size-4" />
                  {busy === doc.code ? "Ouverture…" : "Télécharger le PDF"}
                </Button>
              ) : (
                <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="size-3.5" /> Disponible après validation
                </span>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
