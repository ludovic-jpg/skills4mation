import { CRM_STATUTS, type CrmStatut } from "@/lib/crm";
import { TONE_CLASSES } from "@/lib/statuts";
import { cn } from "@/lib/utils";

export function CrmBadge({ statut, className }: { statut: CrmStatut; className?: string }) {
  const entry = CRM_STATUTS[statut] ?? {
    label: statut,
    tone: "neutral" as const,
    etape: null,
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        TONE_CLASSES[entry.tone],
        className,
      )}
    >
      {entry.etape != null ? <span className="opacity-70">Étape {entry.etape}</span> : null}
      {entry.label}
    </span>
  );
}
