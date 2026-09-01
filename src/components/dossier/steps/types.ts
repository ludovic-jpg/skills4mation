import type { Dispatch, SetStateAction } from "react";

import type { DossierDonnees } from "@/lib/dossier/types";

export type Errs = Record<string, string>;

export type StepProps = {
  d: DossierDonnees;
  setD: Dispatch<SetStateAction<DossierDonnees>>;
  set: <K extends keyof DossierDonnees>(key: K, patch: Partial<DossierDonnees[K]>) => void;
  errors: Errs;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(value: string) {
  return EMAIL_RE.test(value);
}

/** Retire espaces, tirets et points avant contrôle du SIRET. */
export function normaliseSiret(value: string) {
  return value.replace(/[\s.-]/g, "");
}
