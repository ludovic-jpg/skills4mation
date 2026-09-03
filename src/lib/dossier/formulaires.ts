/**
 * Formulaires génériques remplis en ligne par l'apprenant (mode `formulaire` des pièces).
 * Les questions sont fixes et identiques pour tous les formateurs : aucune personnalisation.
 */

export type ChampFormulaire = {
  id: string;
  label: string;
  type: "texte" | "long" | "note" | "choix";
  options?: string[];
  requis?: boolean;
};

export type FormulaireDef = {
  code: string;
  titre: string;
  intro: string;
  champs: ChampFormulaire[];
};

const NOTES = ["1 — insatisfait", "2 — peu satisfait", "3 — satisfait", "4 — très satisfait"];

export const FORMULAIRES: Record<string, FormulaireDef> = {
  F0A: {
    code: "F0A",
    titre: "Recueil des besoins avant formation",
    intro:
      "Ces informations permettent d'adapter la formation à votre contexte et à votre niveau de départ.",
    champs: [
      { id: "fonction", label: "Votre fonction actuelle", type: "texte", requis: true },
      {
        id: "contexte",
        label: "Contexte et enjeux : pourquoi suivez-vous cette formation ?",
        type: "long",
        requis: true,
      },
      {
        id: "attentes",
        label: "Vos attentes et objectifs opérationnels",
        type: "long",
        requis: true,
      },
      {
        id: "niveauDepart",
        label: "Votre niveau de départ sur le sujet",
        type: "choix",
        options: ["Débutant", "Notions de base", "Intermédiaire", "Avancé"],
        requis: true,
      },
      {
        id: "experience",
        label: "Expériences ou pratiques déjà acquises sur le sujet",
        type: "long",
      },
      {
        id: "contraintes",
        label: "Contraintes à prendre en compte (organisation, matériel, accessibilité)",
        type: "long",
      },
      {
        id: "amenagement",
        label: "Souhaitez-vous un aménagement lié à une situation de handicap ?",
        type: "choix",
        options: ["Non", "Oui — je souhaite être contacté(e)"],
        requis: true,
      },
    ],
  },
  F5: {
    code: "F5",
    titre: "Questionnaire de satisfaction à chaud",
    intro: "Votre retour immédiat après la session nourrit notre démarche qualité Qualiopi.",
    champs: [
      { id: "objectifs", label: "Les objectifs ont été clairement présentés", type: "note", options: NOTES, requis: true },
      { id: "contenu", label: "Le contenu correspond à mes attentes et à mon niveau", type: "note", options: NOTES, requis: true },
      { id: "animation", label: "L'animation et la pédagogie du formateur", type: "note", options: NOTES, requis: true },
      { id: "supports", label: "Les supports et moyens mis à disposition", type: "note", options: NOTES, requis: true },
      { id: "organisation", label: "L'organisation matérielle (horaires, lieu, connexion)", type: "note", options: NOTES, requis: true },
      { id: "application", label: "Je pourrai appliquer ces acquis dans mon activité", type: "note", options: NOTES, requis: true },
      { id: "pointsForts", label: "Points forts de la formation", type: "long" },
      { id: "amelioration", label: "Axes d'amélioration", type: "long" },
    ],
  },
  F7: {
    code: "F7",
    titre: "Questionnaire de satisfaction à froid (3 mois)",
    intro: "Trois mois après la formation, mesurons ensemble les effets sur votre activité.",
    champs: [
      { id: "pratique", label: "J'ai mis en pratique les acquis de la formation", type: "note", options: NOTES, requis: true },
      { id: "effets", label: "La formation a produit des effets mesurables sur mon activité", type: "note", options: NOTES, requis: true },
      { id: "mobilisation", label: "Les compétences acquises sont toujours mobilisées", type: "note", options: NOTES, requis: true },
      { id: "accompagnement", label: "L'accompagnement post-formation a été suffisant", type: "note", options: NOTES, requis: true },
      { id: "recommandation", label: "Je recommanderais cette formation", type: "note", options: NOTES, requis: true },
      { id: "commentaire", label: "Commentaire libre", type: "long" },
    ],
  },
};

export function formulaireDe(code: string): FormulaireDef | null {
  return FORMULAIRES[code] ?? null;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** PDF récapitulatif (HTML source) des réponses saisies en ligne par l'apprenant. */
export function recapFormulaireHtml(input: {
  code: string;
  label: string;
  signataire: string;
  email: string | null;
  dossierLabel: string;
  soumisLe: string;
  reponses: Record<string, string>;
}) {
  const def = formulaireDe(input.code);
  const lignes = (def?.champs ?? []).map((champ) => {
    const valeur = input.reponses[champ.id] ?? "";
    return `<tr><th>${escapeHtml(champ.label)}</th><td>${escapeHtml(valeur || "—")}</td></tr>`;
  });
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8" />
<style>
  body { font-family: Helvetica, Arial, sans-serif; color: #12181f; font-size: 12px; padding: 28px; }
  h1 { color: #0d2a4a; font-size: 17px; margin: 0 0 4px; }
  .sub { color: #5b6472; font-size: 11px; margin-bottom: 18px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th, td { border: 1px solid #dbe1e8; padding: 7px 9px; text-align: left; vertical-align: top; }
  th { width: 45%; background: #eef2f6; color: #0d2a4a; font-weight: 700; }
  .foot { margin-top: 22px; color: #7b8494; font-size: 10px; }
</style></head><body>
  <h1>${escapeHtml(def?.titre ?? input.label)}</h1>
  <div class="sub">Pièce ${escapeHtml(input.code)} — ${escapeHtml(input.dossierLabel)}</div>
  <table>
    <tr><th>Répondant</th><td>${escapeHtml(input.signataire)}${input.email ? ` (${escapeHtml(input.email)})` : ""}</td></tr>
    <tr><th>Date de soumission</th><td>${escapeHtml(input.soumisLe)}</td></tr>
  </table>
  <table>${lignes.join("")}</table>
  <p class="foot">Réponses collectées en ligne via le portail Skills4mation — Portage Qualiopi. Document généré automatiquement, sans signature manuscrite.</p>
</body></html>`;
}
