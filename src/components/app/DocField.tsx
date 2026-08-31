import { Download, FileText, Upload } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

type Props = {
  label: string;
  hint?: string;
  /** Chemin du fichier dans le bucket, ou null si aucun document. */
  path?: string | null;
  bucket: "candidatures" | "profils";
  busy?: boolean;
  accept?: string;
  onFile: (file: File) => void;
};

/** Bloc réutilisable : état du document, dépôt / remplacement et téléchargement. */
export function DocField({
  label,
  hint,
  path,
  bucket,
  busy,
  accept = "application/pdf",
  onFile,
}: Props) {
  const done = Boolean(path);

  async function download() {
    if (!path) return;
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 120);
    if (error || !data?.signedUrl) {
      toast.error("Téléchargement impossible.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
      <div className="flex min-w-0 items-center gap-3">
        <FileText className="size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">
            {done ? "Déposé" : "Non déposé"}
            {hint ? ` — ${hint}` : ""}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {done ? (
          <button
            type="button"
            onClick={() => void download()}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"
          >
            <Download className="size-3.5" /> Télécharger
          </button>
        ) : null}
        <label>
          <input
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onFile(file);
              event.target.value = "";
            }}
          />
          <span className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
            <Upload className="size-3.5" /> {busy ? "Envoi…" : done ? "Remplacer" : "Déposer"}
          </span>
        </label>
      </div>
    </div>
  );
}
