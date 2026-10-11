/** Outils pédagogiques du formateur : tests de positionnement et évaluations des acquis. */

export type TypeQuestion = "qcm" | "ouverte";

export type QuestionOutil = {
  enonce: string;
  type: TypeQuestion;
  /** Propositions de réponse (QCM uniquement). */
  options: string[];
  /**
   * Texte de la bonne réponse (QCM uniquement, facultatif). Stocké dans le JSON
   * `questions` : les outils enregistrés avant son ajout restent valides.
   */
  bonneReponse?: string | undefined;
};

export const TYPES_QUESTION: { value: TypeQuestion; label: string }[] = [
  { value: "qcm", label: "Choix multiple (QCM)" },
  { value: "ouverte", label: "Question ouverte" },
];

export const QUESTION_VIDE: QuestionOutil = { enonce: "", type: "ouverte", options: [] };

/** Normalise le contenu `questions jsonb` venu de la base. */
export function parseQuestions(raw: unknown): QuestionOutil[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const q = (item ?? {}) as Partial<QuestionOutil>;
      const type: TypeQuestion = q.type === "qcm" ? "qcm" : "ouverte";
      const options = Array.isArray(q.options)
        ? q.options.map((o) => String(o ?? "").trim()).filter(Boolean)
        : [];
      const bonne = typeof q.bonneReponse === "string" ? q.bonneReponse.trim() : "";
      const question: QuestionOutil = { enonce: String(q.enonce ?? "").trim(), type, options };
      if (type === "qcm" && bonne && options.includes(bonne)) question.bonneReponse = bonne;
      return question;
    })
    .filter((q) => q.enonce.length > 0);
}

/** Déplace une question dans la liste (réordonnancement manuel). */
export function deplacer<T>(list: T[], index: number, delta: number): T[] {
  const cible = index + delta;
  if (cible < 0 || cible >= list.length) return list;
  const copie = [...list];
  const [item] = copie.splice(index, 1);
  copie.splice(cible, 0, item!);
  return copie;
}
