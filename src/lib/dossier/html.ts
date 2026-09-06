import {
  aDuPresentiel,
  dateFr,
  estCpf,
  euros,
  FINANCEMENT_LABELS,
  FORMAT_LABELS,
  viseCertification,
  type DossierDonnees,
} from "./types";
import { CHARTE } from "../charte";
import type { CrmStatut } from "@/lib/crm";
import { pieceVisibleSelonStatut } from "./visibilite";
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
  body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: ${CHARTE.texte}; margin: 0; padding: 24px; background: ${CHARTE.fondDoux}; font-size: 12px; line-height: 1.5; }
  .sheet { background: ${CHARTE.blanc}; max-width: ${orientation === "landscape" ? "1120px" : "820px"}; margin: 0 auto; padding: 32px 36px; box-shadow: 0 8px 24px rgba(15,23,42,.08); }
  h1 { font-size: 19px; margin: 0 0 4px; letter-spacing: -.01em; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .06em; margin: 22px 0 8px; padding-bottom: 4px; border-bottom: 1px solid ${CHARTE.bordure}; color: ${CHARTE.vert}; }
  .head { border-bottom: 2px solid ${CHARTE.texte}; padding-bottom: 12px; margin-bottom: 8px; }
  .muted { color: ${CHARTE.gris}; }
  .vide { color: ${CHARTE.gris}; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; }
  .row { display: flex; gap: 8px; }
  .row .k { min-width: 190px; color: ${CHARTE.gris}; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { border: 1px solid ${CHARTE.bordure}; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: ${CHARTE.fondDoux}; text-transform: uppercase; font-size: 10px; letter-spacing: .04em; color: ${CHARTE.gris}; }
  .sign { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 28px; }
  .sign div { border: 1px solid ${CHARTE.bordure}; height: 108px; padding: 8px; }
  .badge { display: inline-block; border: 1px solid ${CHARTE.vert}; color: ${CHARTE.vert}; border-radius: 999px; padding: 2px 10px; font-size: 10px; }
  .note { background: ${CHARTE.fondDoux}; border-left: 3px solid ${CHARTE.vert}; padding: 8px 12px; margin-top: 10px; }
  tr, .avoid { page-break-inside: avoid; }
  @media print {
    body { background: ${CHARTE.blanc}; padding: 0; font-size: 10.5px; }
    .sheet { box-shadow: none; max-width: 100%; padding: 0; }
  }
</style></head><body><div class="sheet">${body}</div></body></html>`;
}

function entete(d: DossierDonnees, titre: string, sousTitre?: string) {
  const visuel = String(d.formation.visuelUrl ?? "").trim();
  return `<div class="head">
    ${visuel ? `<img src="${e(visuel)}" alt="" style="max-height:56px;float:right;margin-left:16px;border-radius:6px" />` : ""}
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
  }${estCpf(d) ? "<th>N° CPF</th>" : ""}${viseCertification(d) ? "<th>Certification</th>" : ""}</tr></thead><tbody>
  ${d.apprenants
    .map(
      (a, i) =>
        `<tr><td>${i + 1}</td><td>${v(a.nom)}</td><td>${v(a.poste)}</td>${
          avecContact ? `<td>${v(a.email)}</td><td>${v(a.telephone)}</td>` : ""
        }${estCpf(d) ? `<td>${v(a.numeroCpf)}</td>` : ""}${
          viseCertification(d) ? `<td>${v(a.certification || "ICDL")}</td>` : ""
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
      ${viseCertification(d) ? ligne("Certification visée", v(a.certification || "ICDL")) : ""}
      <div class="note">Les objectifs pédagogiques suivants ont été évalués comme atteints : ${multiline(d.formation.objectifs)}</div>
      <p style="margin-top:16px">Fait à ${v(d.convention.lieu)}, le ${v(dateFr(d.convention.date))}.</p>
      ${signatures("Le responsable de l'organisme", "Cachet")}
    </div>`,
      )
      .join(""),
  );
}






/**
 * Convocation à la session d'examen de certification, distincte de la convocation
 * de formation (pièce 3A) : la session est organisée par Skills4mation à une date
 * qui ne coïncide pas nécessairement avec la fin de la formation.
 */
function convocationExamen(d: DossierDonnees) {
  const cibles = d.apprenants.length ? d.apprenants : [undefined];
  return cibles
    .map((a) =>
      shell(
        "Convocation à l'examen de certification",
        `${entete(d, "Convocation à l'examen de certification", "Session organisée par Skills4mation")}
    <p>Madame, Monsieur ${v(a?.nom)},</p>
    <p>Vous êtes convoqué(e) à la session d'examen de la certification visée dans le cadre de votre parcours de formation. Cette session est organisée par ${v(d.organisme)} et se déroule indépendamment des dates de la formation.</p>
    ${ligne("Candidat", v(a?.nom))}
    ${ligne("Formation préparatoire", v(d.formation.titre))}
    ${ligne("Certification visée", v(a?.certification || d.tarifs.certificationCode))}
    ${ligne("Date et heure de l'examen", `<span class="vide">à confirmer par Skills4mation</span>`)}
    ${ligne("Modalité", "Examen surveillé — présentiel ou distanciel selon la convocation définitive")}
    ${ligne("Lieu / lien de connexion", v(d.lieu.intitule || d.formation.lienConnexion))}
    <div class="note">Merci de vous présenter 15 minutes avant le début de l'épreuve, muni(e) d'une pièce d'identité en cours de validité. En cas d'empêchement, prévenez Skills4mation au plus tôt afin d'être repositionné(e) sur une autre session. Les aménagements liés à une situation de handicap sont étudiés avec le référent handicap.</div>
    ${signatures("Le candidat", "Pour Skills4mation")}`,
      ),
    )
    .join('<div style="page-break-before:always"></div>');
}

/**
 * Tableau de notation 1 à 5, aligné sur les gabarits F5/F7 certifiés (matrices
 * de référence Skills4mation) : mêmes intitulés de critères, même échelle, pour
 * que le document généré par l'application ne diverge jamais de celui audité.
 */
function tableauNotes(criteres: string[]) {
  return `<table><thead><tr><th>Critère</th><th style="width:36px">1</th><th style="width:36px">2</th><th style="width:36px">3</th><th style="width:36px">4</th><th style="width:36px">5</th></tr></thead><tbody>
  ${criteres.map((c) => `<tr><td>${e(c)}</td><td></td><td></td><td></td><td></td><td></td></tr>`).join("")}
  </tbody></table>`;
}

/** F5 — Grille d'évaluation « à chaud » : critères et échelle identiques à la matrice de référence. */
function satisfactionChaud(d: DossierDonnees) {
  const criteres = [
    "Contenu de la formation",
    "Réponse à vos attentes",
    "L'adaptation du programme aux besoins réels du stagiaire",
    "Programme du stage",
    "L'application pratique possible des éléments de la formation dans votre environnement professionnel",
    "Pédagogie du formateur",
    "Compétences du formateur",
    "Qualité des supports pédagogiques",
    "Environnement de travail (salle, matériel disponible)",
  ];
  return shell(
    "Questionnaire de satisfaction à chaud",
    `${entete(d, "Satisfaction à chaud", "À compléter en fin de session")}
    <div class="grid">
      <div>${ligne("Formation", v(d.formation.titre))}${ligne("Nombre d'heures", v(d.formation.heuresTotal))}</div>
      <div>${ligne("Période", `${v(dateFr(d.formation.dateDebut))} au ${v(dateFr(d.formation.dateFin))}`)}${ligne("Formateur", v(`${d.formateur.prenom} ${d.formateur.nom}`.trim()))}</div>
    </div>
    ${ligne("Stagiaire", d.apprenants.length === 1 ? v(d.apprenants[0]!.nom) : `<span class="vide">…………………………………………</span>`)}
    <h2>Évaluation (note de 1 à 5)</h2>
    ${tableauNotes(criteres)}
    <div class="note" style="margin-top:10px"><strong>Appréciation globale :</strong> …………………………………………</div>
    <h2>Suggestions et remarques</h2>
    <table><tbody><tr><td style="height:70px"></td></tr></tbody></table>
    <p style="margin-top:14px">Date : ……………………………… Signature du stagiaire : ………………………………</p>`,
  );
}

/** F7 — Questionnaire de satisfaction « à froid » (3 mois) : trois blocs et échelle 1-5 identiques à la matrice de référence. */
function satisfactionFroid(d: DossierDonnees) {
  const legende = "1 = Pas du tout · 2 = Un peu · 3 = Moyennement · 4 = Beaucoup · 5 = Enormément";
  const acquis = [
    "Je mets en pratique régulièrement à mon poste de travail les connaissances acquises au cours de la formation",
    "Le suivi par le(s) formateur(s) dans la mise en pratique, a été facilitant",
    "La mise en œuvre de ces acquis a été aisée",
    "Je ressens le besoin d'une formation complémentaire (ex. évolution de poste / promotion, évaluation positive, meilleure intégration, reconnaissance, rétribution…)",
    "Avec le recul de la pratique, cette formation était adaptée à votre besoin",
  ];
  const surLaFormation = [
    "Avec le recul, la formation a-t-elle répondu à vos attentes initiales ?",
    "Avec le recul, pensez-vous avoir atteint les objectifs pédagogiques prévus lors de la formation ?",
    "Avec le recul, estimez-vous que la formation était en adéquation avec le métier ou les réalités du secteur ?",
    "Avec le recul, recommanderiez-vous ce stage à une personne exerçant le même métier que vous ?",
  ];
  const surLeFormateur = [
    "Pédagogie du formateur",
    "Compétences du formateur",
    "Qualité des supports pédagogiques",
    "Environnement de travail (salle, matériel disponible)",
  ];
  return shell(
    "Questionnaire de satisfaction à froid",
    `${entete(d, "Satisfaction à froid (3 mois)", "À compléter 3 mois après la formation")}
    <div class="grid">
      <div>${ligne("Formation", v(d.formation.titre))}${ligne("Date de fin de formation", v(dateFr(d.formation.dateFin)))}</div>
      <div>${ligne("Formateur", v(`${d.formateur.prenom} ${d.formateur.nom}`.trim()))}${ligne("Date d'évaluation", `<span class="vide">………………………</span>`)}</div>
    </div>
    ${ligne("Stagiaire", d.apprenants.length === 1 ? v(d.apprenants[0]!.nom) : `<span class="vide">…………………………………………</span>`)}
    <h2>Utilisation des acquis de la formation</h2>
    <p class="muted" style="font-size:10px;margin:0 0 6px">${legende}</p>
    ${tableauNotes(acquis)}
    <div class="note" style="margin-top:10px"><strong>Avec le recul, votre appréciation de qualité globale de la formation :</strong> …………… / 10</div>
    <h2>Votre satisfaction sur la formation</h2>
    <p class="muted" style="font-size:10px;margin:0 0 6px">${legende}</p>
    ${tableauNotes(surLaFormation)}
    <h2>Votre satisfaction sur le formateur</h2>
    <p class="muted" style="font-size:10px;margin:0 0 6px">${legende}</p>
    ${tableauNotes(surLeFormateur)}
    <p style="margin-top:14px">Date : ……………………………… Signature du stagiaire : ………………………………</p>`,
  );
}

function programme(d: DossierDonnees) {
  const objectifs = (d.formation.objectifs || "")
    .split(/\r?\n|;/)
    .map((o) => o.trim())
    .filter(Boolean);
  return shell(
    "Programme de formation",
    `${entete(d, "Programme de formation", v(d.formation.titre))}
    <div class="grid">
      <div>${ligne("Intitulé", v(d.formation.titre))}${ligne("Durée", `${v(d.formation.heuresTotal)} h — ${v(d.formation.nbJours)} jour(s)`)}${ligne("Format", v(FORMAT_LABELS[d.formation.format]))}</div>
      <div>${ligne("Période", `${v(dateFr(d.formation.dateDebut))} au ${v(dateFr(d.formation.dateFin))}`)}${ligne("Niveau visé", v(d.formation.niveau))}${ligne("Effectif", String(d.apprenants.length || "—"))}</div>
    </div>
    <h2>Objectifs pédagogiques</h2>
    ${objectifs.length ? `<ul>${objectifs.map((o) => `<li>${e(o)}</li>`).join("")}</ul>` : `<p>${v(d.formation.objectifs)}</p>`}
    <h2>Prérequis et public visé</h2>
    <p>${v(d.formation.prerequis)}</p>
    <h2>Contenus et déroulé</h2>
    <p>${v(d.besoins.contexte)}</p>
    <h2>Moyens et modalités pédagogiques</h2>
    <p>Formation animée par ${v(`${d.formateur.prenom} ${d.formateur.nom}`.trim())} en ${v(FORMAT_LABELS[d.formation.format])}. Alternance d'apports théoriques, de mises en situation et d'exercices pratiques. Supports remis aux participants via le portail Skills4mation.</p>
    <h2>Modalités d'évaluation</h2>
    <p>${v(d.besoins.modalitesEvaluation || "Test de positionnement en entrée, évaluation des acquis en fin de parcours et questionnaire de satisfaction.")}</p>
    <h2>Accessibilité</h2>
    <p>Les personnes en situation de handicap sont invitées à contacter le référent handicap de Skills4mation afin d'étudier les aménagements nécessaires.</p>
    ${signatures("L'apprenant", "Pour Skills4mation")}`,
  );
}

function factureSkills4mation(d: DossierDonnees) {
  const subrogation = d.tarifs.subrogation === "oui";
  const redevableNom = subrogation ? d.tarifs.opco || d.entreprise.nom : d.entreprise.nom;
  return shell(
    "Facture Skills4mation",
    `${entete(d, `Facture n° FSK-${v(d.adf)}`, `Établie le ${dateFr(new Date().toISOString())}`)}
    <div class="grid">
      <div><strong>Émetteur</strong><br />Skills4mation<br />Organisme de formation certifié Qualiopi</div>
      <div><strong>Destinataire</strong><br />${v(redevableNom)}<br />${v(d.entreprise.adresse)}<br />SIRET ${v(d.entreprise.siret)}${d.tarifs.opco ? `<br />OPCO : ${v(d.tarifs.opco)}` : ""}</div>
    </div>
    <h2>Prestation</h2>
    <table><thead><tr><th>Désignation</th><th>Effectif</th><th>Total HT</th></tr></thead><tbody>
      <tr><td>Formation « ${v(d.formation.titre)} » réalisée du ${v(dateFr(d.formation.dateDebut))} au ${v(dateFr(d.formation.dateFin))}, conformément à la convention ${d.adf ? `n° ${v(d.adf)}` : ""}. Formation intégralement dispensée et émargée.</td><td>${v(String(d.apprenants.length))}</td><td>${e(euros(d.tarifs.prixTotal))}</td></tr>
      ${d.tarifs.coutCertification ? `<tr><td>Coût de certification</td><td>—</td><td>${e(euros(d.tarifs.coutCertification))}</td></tr>` : ""}
    </tbody></table>
    <div style="margin-top:12px;max-width:320px;margin-left:auto">
      ${ligne("Total à régler (exonéré de TVA)", e(euros(d.tarifs.prixTotal)))}
    </div>
    <h2>Règlement</h2>
    ${ligne(
      "Redevable",
      subrogation
        ? `${v(d.tarifs.opco)} (subrogation de paiement accordée par ${v(d.entreprise.nom)})`
        : `${v(d.entreprise.nom)} (aucune subrogation : facture à régler par l'entreprise, qui se fait ensuite rembourser par l'OPCO sur présentation de cette facture)`,
    )}
    ${ligne("Conditions", "Paiement à réception")}
    <p class="muted" style="margin-top:12px">Exonération de TVA au titre de l'article 261-4-4°a du CGI. Cette facture atteste également de la réalisation effective de la formation par Skills4mation.</p>`,
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
  {
    code: "1C",
    label: "Programme de formation",
    build: programme,
    applicable: () => true,
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
    build: satisfactionChaud,
    applicable: () => true,
    destinataires: (d) => d.apprenants.map((a) => a.email ?? ""),
  },
  {
    code: "F7",
    label: "Satisfaction à froid",
    build: satisfactionFroid,
    applicable: () => true,
    destinataires: (d) => d.apprenants.map((a) => a.email ?? ""),
  },
  {
    code: "CERT-CONV",
    label: "Convocation à l'examen de certification",
    build: convocationExamen,
    applicable: (d) => viseCertification(d) || Boolean(d.tarifs.certificationCode),
    destinataires: (d) => d.apprenants.map((a) => a.email ?? ""),
  },
  {
    code: "FSK",
    label: "Facture Skills4mation",
    build: factureSkills4mation,
    applicable: () => true,
    destinataires: (d) => [d.entreprise.email].filter(Boolean),
  },
];

/**
 * Documents applicables au dossier. Le recueil des besoins F0A utilise toujours le
 * modèle interne unique (aucune personnalisation par formateur).
 */
export function documentsApplicables(
  d: DossierDonnees,
  options?: { statutCrm?: CrmStatut | null },
) {
  return DOCUMENTS.filter(
    (doc) =>
      doc.applicable(d) &&
      (options?.statutCrm === undefined
        ? true
        : pieceVisibleSelonStatut(doc.code, options.statutCrm)),
  );
}


export function docFileName(code: string, d: DossierDonnees) {
  const base = `${code}-${d.adf || "dossier"}-${d.entreprise.nom || "client"}`;
  return `${base.replace(/[^A-Za-z0-9-_]+/g, "_")}.html`;
}
