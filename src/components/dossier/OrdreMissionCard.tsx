import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, PenLine, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { signerOrdreMission } from "@/lib/dossier-automatisations.functions";

/**
 * Signature en ligne de l'ordre de mission (F0C) par le formateur :
 * consentement explicite, empreinte SHA-256 et certificat de preuve archivé
 * — même mécanisme que la signature de la convention.
 */
export function OrdreMissionCard({ dossierId }: { dossierId: string }) {
  const queryClient = useQueryClient();
  const [consentement, setConsentement] = useState(false);

  const { data: envoi } = useQuery({
    queryKey: ["ordre-mission", dossierId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_envois")
        .select("id, signature_date, signature_hash, fichier_url, certificat_url")
        .eq("dossier_id", dossierId)
        .eq("code", "F0C")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const signer = useMutation({
    mutationFn: async () => signerOrdreMission({ data: { dossierId, consentement: true } }),
    onSuccess: () => {
      toast.success("Ordre de mission signé — certificat de preuve archivé au dossier.");
      void queryClient.invalidateQueries({ queryKey: ["ordre-mission", dossierId] });
      void queryClient.invalidateQueries({ queryKey: ["dossier-pieces", dossierId] });
    },
    onError: (error: Error) => toast.error(error.message || "Signature impossible."),
  });

  async function ouvrir(chemin: string) {
    const { data } = await supabase.storage.from("documents").createSignedUrl(chemin, 600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    else toast.error("Document momentanément indisponible.");
  }

  if (!envoi) return null;

  return (
    <Card className="rounded-2xl border-border/70 shadow-soft">
      <CardContent className="p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <ShieldCheck className="size-4 text-primary" /> Ordre de mission (F0C)
        </h2>
        {envoi.signature_date ? (
          <>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-success">
              <CheckCircle2 className="size-4" /> Signé le{" "}
              {new Date(envoi.signature_date).toLocaleDateString("fr-FR")}
              {envoi.signature_hash ? ` — empreinte ${envoi.signature_hash.slice(0, 16)}…` : ""}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {envoi.fichier_url ? (
                <Button size="sm" variant="outline" onClick={() => void ouvrir(envoi.fichier_url!)}>
                  Ordre de mission signé
                </Button>
              ) : null}
              {envoi.certificat_url ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void ouvrir(envoi.certificat_url!)}
                >
                  Certificat de signature
                </Button>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              Le financement est accordé : signez votre ordre de mission avant le démarrage de la
              formation. La signature est horodatée et accompagnée d'un certificat de preuve.
            </p>
            <label className="mt-4 flex items-start gap-2 text-sm">
              <Checkbox
                checked={consentement}
                onCheckedChange={(v) => setConsentement(v === true)}
                className="mt-0.5"
              />
              <span>
                Je reconnais avoir lu l'ordre de mission et j'accepte de le signer
                électroniquement.
              </span>
            </label>
            <Button
              size="sm"
              variant="teal"
              className="mt-4"
              disabled={!consentement || signer.isPending}
              onClick={() => signer.mutate()}
            >
              <PenLine className="mr-1.5 size-4" />
              {signer.isPending ? "Signature…" : "Signer mon ordre de mission"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
