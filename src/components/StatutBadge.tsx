import { cn } from "@/lib/utils";
import {
  BUDGET_STATUTS,
  CANDIDATURE_STATUTS,
  DOSSIER_STATUTS,
  TONE_CLASSES,
  type BudgetStatut,
  type CandidatureStatut,
  type DossierStatut,
} from "@/lib/statuts";

type Props =
  | { kind: "dossier"; statut: DossierStatut; className?: string }
  | { kind: "budget"; statut: BudgetStatut; className?: string }
  | { kind: "candidature"; statut: CandidatureStatut; className?: string };

export function StatutBadge(props: Props) {
  const map =
    props.kind === "dossier"
      ? DOSSIER_STATUTS
      : props.kind === "budget"
        ? BUDGET_STATUTS
        : CANDIDATURE_STATUTS;
  const entry = (map as Record<string, { label: string; tone: keyof typeof TONE_CLASSES }>)[
    props.statut
  ] ?? { label: props.statut, tone: "neutral" as const };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        TONE_CLASSES[entry.tone],
        props.className,
      )}
    >
      {entry.label}
    </span>
  );
}
