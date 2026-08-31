import {
  aDuPresentiel,
  dateFr,
  estCpf,
  euros,
  FINANCEMENT_LABELS,
  FORMAT_LABELS,
  viseIcdl,
  type DossierDonnees,
} from "./types";
import {
  contratSousTraitanceHtml,
  conventionHtml,
  convocationHtml,
  emargementHtml,
  planningHtml,
  recueilBesoinsHtml,
} from "./render";

/** Échappe une valeur pour insertion HTML. */
function e(value?: string | null) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function v(value?: string | null) {
  const raw = String(value ?? "").trim();
  return raw ? e(raw) : `<span class="vide">—</span>`;
}

function multiline(value?: string | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return `<span class="vide">—</span>`;
  return e(raw).replace(/\n/g, "<br />");
}

function shell(title: string, body: string, orientation: "portrait" | "landscape" = "portrait") {
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${e(title)}</title>
<style>
  @page { size: A4 ${orientation}; margin: 12mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #0f172a; margin: 0; padding: 24px; background: #f1f5f9; font-size: 12px; line-height: 1.5; }
  .sheet { background: #fff; max-width: ${orientation === "landscape" ? "1120px" : "820px"}; margin: 0 auto; padding: 32px 36px; box-shadow: 0 8px 24px rgba(15,23,42,.08); }
  h1 { font-size: 19px; margin: 0 0 4px; letter-spacing: -.01em; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .06em; margin: 22px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #cbd5e1; color: #1e3a8a; }
  .head { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 8px; }
  .muted { color: #64748b; }
  .vide { color: #94a3b8; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; }
  .row { display: flex; gap: 8px; }
  .row .k { min-width: 190px; color: #475569; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #f8fafc; text-transform: uppercase; font-size: 10px; letter-spacing: .04em; color: #334155; }
  .sign { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 28px; }
  .sign div { border: 1px solid #cbd5e1; height: 108px; padding: 8px; }
  .badge { display: inline-block; border: 1px solid #1e3a8a; color: #1e3a8a; border-radius: 999px; padding: 2px 10px; font-size: 10px; }
  .note { background: #f8fafc; border-left: 3px solid #1e3a8a; padding: 8px 12px; margin-top: 10px; }
  tr, .avoid { page-break-inside: avoid; }
  @media print {
    body { background: #fff; padding: 0; font-size: 10.5px; }
    .sheet { box-shadow: none; max-width: 100%; padding: 0; }
  }
</style></head><body><div class="sheet">${body}</div></body></html>`;
}

function entete(d: DossierDonnees, titre: string, sousTitre?: string) {
  return `<div class="head">
    <div class="muted" style="font-size:11px">${v(d.organisme)} — Organisme de formation certifié Qualiopi${d.formateur.nda ? ` · NDA ${e(d.formateur.nda)}` : ""}</div>
    <h1>${e(titre)}</h1>
    <div class="muted">${sousTitre ? e(sousTitre) : ""}${d.adf ? ` · Dossier ADF ${e(d.adf)}` : ""}</div>
  </div>`;
}

function ligne(k: string, value: string) {
  return `<div class="row"><span class="k">${e(k)}</span><strong>${value}</strong></div>`;
}

function tableApprenants(d: DossierDonnees, avecContact = false) {
  if (d.apprenants.length === 0)
    return `<p class="vide">Aucun apprenant renseigné dans le dossier.</p>`;
  return `<table><thead><tr><th>#</th><th>Apprenant</th><th>Poste / fonction</th>${
    avecContact ? "<th>E-mail</th><th>Téléphone</th>" : ""
  }${estCpf(d) ? "<th>N° CPF</th>" : ""}${viseIcdl(d) ? "<th>Certification</th>" : ""}</tr></thead><tbody>
  ${d.apprenants
    .map(
      (a, i) =>
        `<tr><td>${i + 1}</td><td>${v(a.nom)}</td><td>${v(a.poste)}</td>${
          avecContact ? `<td>${v(a.email)}</td><td>${v(a.telephone)}</td>` : ""
        }${estCpf(d) ? `<td>${v(a.numeroCpf)}</td>` : ""}${
          viseIcdl(d) ? `<td>${v(a.certification || "ICDL")}</td>` : ""
        }</tr>`,
    )
    .join("")}
  </tbody></table>`;
}

function tableSessions(d: DossierDonnees) {
  if (d.sessions.length === 0) return `<p class="vide">Aucune session planifiée.</p>`;
  return `<table><thead><tr><th>Session</th><th>Date</th><th>Début</th><th>Fin</th><th>Module</th><th>Lieu / connexion</th></tr></thead><tbody>
  ${d.sessions
    .map(
      (s, i) =>
        `<tr><td>${i + 1}</td><td>${v(dateFr(s.date))}</td><td>${v(s.heureDebut)}</td><td>${v(
          s.heureFin,
        )}</td><td>${v(s.module)}</td><td>${v(s.lieu || d.lieu.intitule || d.formation.lienConnexion)}</td></tr>`,
    )
    .join("")}
  </tbody></table>`;
}

function signatures(a: string, b: string) {
  return `<div class="sign avoid"><div><div class="muted">${e(a)}</div></div><div><div class="muted">${e(b)}</div></div></div>`;
}

/* ------------------------------- Documents ------------------------------- */


function attestation(d: DossierDonnees) {
  const body = d.apprenants.length ? d.apprenants : [{ nom: "", poste: "" }];
  return shell(
    "Attestation de fin de formation",
    body
      .map(
        (a, i) => `<div class="avoid" ${i > 0 ? 'style="page-break-before:always"' : ""}>
      ${entete(d, "Attestation d'assiduité et de fin de formation", "Article L.6353-1 du Code du travail")}
      <p style="margin-top:18px">Je soussigné(e) ${v(`${d.formateur.prenom} ${d.formateur.nom}`.trim())}, représentant ${v(d.organisme)}, atteste que :</p>
      <h2>Le bénéficiaire</h2>
      ${ligne("Apprenant", v(a.nom))}
      ${ligne("Entreprise", v(d.entreprise.nom))}
      ${estCpf(d) ? ligne("Dossier CPF", v(a.numeroCpf)) : ""}
      <h2>A suivi l'action de formation</h2>
      ${ligne("Intitulé", v(d.formation.titre))}
      ${ligne("Nature", "Action de formation (adaptation et développement des compétences)")}
      ${ligne("Période", `${v(dateFr(d.formation.dateDebut))} au ${v(dateFr(d.formation.dateFin))}`)}
      ${ligne("Durée réalisée", `${v(d.formation.heuresTotal)} heures`)}
      ${ligne("Modalité", e(FORMAT_LABELS[d.formation.format]))}
      ${viseIcdl(d) ? ligne("Certification visée", v(a.certification || "ICDL")) : ""}
      <div class="note">Les objectifs pédagogiques suivants ont été évalués comme atteints : ${multiline(d.formation.objectifs)}</div>
      <p style="margin-top:16px">Fait à ${v(d.convention.lieu)}, le ${v(dateFr(d.convention.date))}.</p>
      ${signatures("Le responsable de l'organisme", "Cachet")}
    </div>`,
      )
      .join(""),
  );
}



function icdl(d: DossierDonnees) {
  return shell(
    "Fiche d'information certification ICDL",
    `${entete(d, "Certification ICDL — fiche d'information", "Information préalable au passage de la certification")}
    <h2>La certification</h2>
    <p>La certification <strong>ICDL</strong> (International Certification of Digital Literacy) atteste des compétences numériques du candidat. Elle est enregistrée au Répertoire Spécifique et éligible aux financements CPF.</p>
    ${ligne("Formation préparatoire", v(d.formation.titre))}
    ${ligne("Durée de préparation", `${v(d.formation.heuresTotal)} heures`)}
    ${ligne("Modalité d'examen", "Test en ligne surveillé, questions à choix multiples et mises en situation")}
    ${ligne("Seuil de réussite", "75 % de bonnes réponses par module")}
    ${ligne("Délai de passage", "À l'issue du parcours, dans un délai maximum de 3 mois")}
    ${ligne("Résultat", "Rapport de compétences et certificat remis au candidat, classés au dossier de l'apprenant")}
    <h2>Candidats inscrits</h2>
    ${tableApprenants(d, true)}
    <div class="note">En cas d'échec, une session de rattrapage peut être organisée. Les aménagements pour situation de handicap sont étudiés avec le référent handicap de l'organisme.</div>`,
  );
}



function satisfaction(d: DossierDonnees, chaud: boolean) {
  const questions = chaud
    ? [
        "Les objectifs de la formation ont été clairement présentés",
        "Le contenu correspond à mes attentes et à mon niveau",
        "L'animation et la pédagogie du formateur",
        "Les supports et les moyens mis à disposition",
        "L'organisation matérielle (horaires, lieu, connexion)",
        "Je pourrai appliquer ces acquis dans mon activité",
      ]
    : [
        "J'ai mis en pratique les acquis de la formation",
        "La formation a produit des effets mesurables sur mon activité",
        "Les compétences acquises sont toujours mobilisées",
        "L'accompagnement post-formation a été suffisant",
        "Je recommanderais cette formation",
      ];
  return shell(
    chaud ? "Questionnaire de satisfaction à chaud" : "Questionnaire de satisfaction à froid",
    `${entete(
      d,
      chaud ? "Satisfaction à chaud" : "Satisfaction à froid (3 mois)",
      chaud ? "À compléter en fin de session" : "À compléter 3 mois après la formation",
    )}
    <div class="grid">
      <div>${ligne("Formation", v(d.formation.titre))}${ligne("Formateur", v(`${d.formateur.prenom} ${d.formateur.nom}`.trim()))}</div>
      <div>${ligne("Période", `${v(dateFr(d.formation.dateDebut))} au ${v(dateFr(d.formation.dateFin))}`)}${ligne("Entreprise", v(d.entreprise.nom))}</div>
    </div>
    ${ligne("Apprenant", d.apprenants.length === 1 ? v(d.apprenants[0]!.nom) : `<span class="vide">…………………………………………</span>`)}
    <h2>Évaluation (1 = insatisfait, 4 = très satisfait)</h2>
    <table><thead><tr><th>Critère</th><th style="width:44px">1</th><th style="width:44px">2</th><th style="width:44px">3</th><th style="width:44px">4</th></tr></thead><tbody>
    ${questions.map((q) => `<tr><td>${e(q)}</td><td></td><td></td><td></td><td></td></tr>`).join("")}
    </tbody></table>
    <h2>Commentaires libres</h2>
    <table><tbody><tr><td style="height:70px">Points forts :</td></tr><tr><td style="height:70px">Axes d'amélioration :</td></tr></tbody></table>
    <p style="margin-top:14px">Date : ……………………………… Signature de l'apprenant : ………………………………</p>`,
  );
}

function facture(d: DossierDonnees) {
  const f = d.facture;
  return shell(
    "Facture formateur",
    `${entete(d, `Facture ${f.numero ? `n° ${f.numero}` : ""}`, `Émise le ${dateFr(f.date)}`)}
    <div class="grid">
      <div><strong>Émetteur</strong><br />${v(d.formateur.entreprise)}<br />${v(`${d.formateur.prenom} ${d.formateur.nom}`.trim())}<br />${v(d.formateur.adresse)}<br />SIRET ${v(d.formateur.siret)}<br />NDA ${v(d.formateur.nda)}</div>
      <div><strong>Destinataire</strong><br />${v(d.organisme)}<br />Dossier ADF ${v(d.adf)}<br />${v(d.entreprise.nom)}</div>
    </div>
    <h2>Prestation</h2>
    <table><thead><tr><th>Désignation</th><th>Quantité</th><th>Prix unitaire</th><th>Total HT</th></tr></thead><tbody>
      <tr><td>Animation de la formation « ${v(d.formation.titre)} » du ${v(dateFr(d.formation.dateDebut))} au ${v(dateFr(d.formation.dateFin))}</td><td>${v(d.formation.heuresTotal)} h</td><td>${e(euros(d.formateur.coutHoraire))}</td><td>${e(euros(f.montantHt || d.formateur.totalRecette))}</td></tr>
    </tbody></table>
    <div style="margin-top:12px;max-width:320px;margin-left:auto">
      ${ligne("Total HT", e(euros(f.montantHt || d.formateur.totalRecette)))}
      ${ligne("TVA", `${v(f.tva)} %`)}
      ${ligne("Total TTC", e(euros(f.montantTtc)))}
    </div>
    <h2>Règlement</h2>
    ${ligne("Conditions", "Paiement sous 10 jours ouvrés à réception des fonds du financeur")}
    ${ligne("IBAN", v(f.iban))}
    <p class="muted" style="margin-top:12px">Exonération de TVA au titre de l'article 261-4-4°a du CGI le cas échéant. Pas d'escompte pour paiement anticipé. Pénalités de retard : taux légal en vigueur.</p>`,
  );
}


/* ------------------------------- Catalogue ------------------------------- */

export type DocDef = {
  code: string;
  label: string;
  build: (d: DossierDonnees) => string;
  applicable: (d: DossierDonnees) => boolean;
  /** Destinataires suggérés pour l'envoi par e-mail. */
  destinataires: (d: DossierDonnees) => string[];
};

export const DOCUMENTS: DocDef[] = [
  {
    code: "1A",
    label: "Convention de formation",
    build: conventionHtml,
    applicable: () => true,
    destinataires: (d) => [d.entreprise.email],
  },
  {
    code: "1B",
    label: "Attestation de fin de formation (CPF)",
    build: attestation,
    applicable: estCpf,
    destinataires: (d) => d.apprenants.map((a) => a.email ?? ""),
  },
  { code: "2", label: "Planning", build: planningHtml, applicable: () => true, destinataires: (d) => [d.entreprise.email] },
  {
    code: "3A",
    label: "Convocation des stagiaires",
    build: convocationHtml,
    applicable: () => true,
    destinataires: (d) => d.apprenants.map((a) => a.email ?? ""),
  },
  {
    code: "3B",
    label: "Certification ICDL",
    build: icdl,
    applicable: viseIcdl,
    destinataires: (d) => d.apprenants.map((a) => a.email ?? ""),
  },
  {
    code: "F0A",
    label: "Recueil des besoins",
    build: recueilBesoinsHtml,
    applicable: () => true,
    destinataires: (d) => [d.entreprise.email],
  },
  {
    code: "F0C",
    label: "Ordre de mission / sous-traitance",
    build: contratSousTraitanceHtml,
    applicable: () => true,
    destinataires: (d) => [d.formateur.email],
  },
  {
    code: "F3",
    label: "Relevé de fréquentation / émargement",
    build: emargementHtml,
    applicable: () => true,
    destinataires: (d) => [d.formateur.email],
  },
  {
    code: "F5",
    label: "Satisfaction à chaud",
    build: (d) => satisfaction(d, true),
    applicable: () => true,
    destinataires: (d) => d.apprenants.map((a) => a.email ?? ""),
  },
  {
    code: "F7",
    label: "Satisfaction à froid",
    build: (d) => satisfaction(d, false),
    applicable: () => true,
    destinataires: (d) => d.apprenants.map((a) => a.email ?? ""),
  },
  {
    code: "F9",
    label: "Facture formateur",
    build: facture,
    applicable: () => true,
    destinataires: () => ["contact@skills4mation.com"],
  },
];

export function documentsApplicables(d: DossierDonnees) {
  return DOCUMENTS.filter((doc) => doc.applicable(d));
}

export function docFileName(code: string, d: DossierDonnees) {
  const base = `${code}-${d.adf || "dossier"}-${d.entreprise.nom || "client"}`;
  return `${base.replace(/[^A-Za-z0-9-_]+/g, "_")}.html`;
}
