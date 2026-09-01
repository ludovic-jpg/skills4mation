import { ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { horodatageFr } from "@/lib/dossier/signature";

export type SignatureOrganisme = {
  signature_organisme_date?: string | null;
  signature_organisme_par?: string | null;
  signature_organisme_hash?: string | null;
  signature_organisme_certificat_url?: string | null;
  signature_organisme_certificat_drive_url?: string | null;
};

async function ouvrirCertificat(path: string) {
  const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, 300);
  if (error || !data) {
    toast.error("Certificat indisponible.");
    return;
  }
  window.open(data.signedUrl, "_blank", "noreferrer");
}

/**
 * Preuve de signature d'organisme, sur le même modèle que l'affichage
 * des documents signés par les apprenants.
 */
export function SignatureOrganismeBadge({
  dossier,
  compact,
}: {
  dossier: SignatureOrganisme;
  compact?: boolean;
}) {
  const date = dossier.signature_organisme_date;
  if (!date) return null;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/12 px-3 py-1 text-xs font-semibold text-success">
        <ShieldCheck className="size-3" /> Signé par Skills4mation le {horodatageFr(date)}
      </span>
    );
  }

  return (
    <div className="grid gap-1 rounded-xl border border-success/25 bg-success/8 p-4 text-xs text-muted-foreground">
      <span className="text-sm font-semibold text-success">
        <ShieldCheck className="mr-1 inline size-4" />
        Signé par Skills4mation le {horodatageFr(date)}
      </span>
      {dossier.signature_organisme_par ? (
        <span>Signataire : {dossier.signature_organisme_par}</span>
      ) : null}
      {dossier.signature_organisme_hash ? (
        <span className="break-all">Empreinte SHA-256 : {dossier.signature_organisme_hash}</span>
      ) : null}
      <div className="mt-1 flex flex-wrap items-center gap-3">
        {dossier.signature_organisme_certificat_url ? (
          <button
            type="button"
            onClick={() => void ouvrirCertificat(dossier.signature_organisme_certificat_url!)}
            className="text-primary underline"
          >
            Télécharger le certificat de signature
          </button>
        ) : null}
        {dossier.signature_organisme_certificat_drive_url ? (
          <a
            href={dossier.signature_organisme_certificat_drive_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary underline"
          >
            Archive Drive <ExternalLink className="size-3" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
