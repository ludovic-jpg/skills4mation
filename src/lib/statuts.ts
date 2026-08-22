export type DossierStatut =
  | "brouillon"
  | "en_cours_generation"
  | "documents_generes"
  | "documents_signes"
  | "financement_depose"
  | "complet"
  | "archive";

export type BudgetStatut = "en_attente" | "en_cours_etude" | "validee" | "refusee";
export type CandidatureStatut = "en_attente" | "valide" | "refuse";

type Tone = "neutral" | "info" | "teal" | "cta" | "success" | "danger";

export const DOSSIER_STATUTS: Record<DossierStatut, { label: string; tone: Tone }> = {
  brouillon: { label: "Brouillon", tone: "neutral" },
  en_cours_generation: { label: "En cours de génération", tone: "info" },
  documents_generes: { label: "Documents générés", tone: "teal" },
  documents_signes: { label: "Documents signés déposés", tone: "teal" },
  financement_depose: { label: "Financement déposé", tone: "cta" },
  complet: { label: "Complet", tone: "success" },
  archive: { label: "Archivé", tone: "neutral" },
};

export const BUDGET_STATUTS: Record<BudgetStatut, { label: string; tone: Tone }> = {
  en_attente: { label: "En attente", tone: "neutral" },
  en_cours_etude: { label: "En cours d'étude", tone: "info" },
  validee: { label: "Validée", tone: "success" },
  refusee: { label: "Refusée", tone: "danger" },
};

export const CANDIDATURE_STATUTS: Record<CandidatureStatut, { label: string; tone: Tone }> = {
  en_attente: { label: "En attente", tone: "neutral" },
  valide: { label: "Validée", tone: "success" },
  refuse: { label: "Refusée", tone: "danger" },
};

export const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  info: "bg-accent text-accent-foreground border-accent",
  teal: "bg-secondary/10 text-secondary border-secondary/30",
  cta: "bg-cta/15 text-cta-foreground border-cta/40",
  success: "bg-success/12 text-success border-success/30",
  danger: "bg-destructive/10 text-destructive border-destructive/30",
};

export const DOCUMENT_TYPES = {
  signe: "Document signé",
  accord_financement: "Accord de financement",
  qualiopi_final: "Pack Qualiopi final",
} as const;

export type DocumentType = keyof typeof DOCUMENT_TYPES;

export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
