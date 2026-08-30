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
  body { font-family: "Helvetica Neue", Arial, sans-serif; color: #0f172a; margin: 0; padding: 24px; background: #f1f5f9; font-size: 12px; line-height: 1.5; }
  .sheet { background: #fff; max-width: ${orientation === "landscape" ? "1120px" : "820px"}; margin: 0 auto; padding: 32px 36px; box-shadow: 0 8px 24px rgba(15,23,42,.08); }
  h1 { font-size: 19px; margin: 0 0 4px; letter-spacing: -.01em; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .06em; margin: 22px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #cbd5e1; color: #14532d; }
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
  .badge { display: inline-block; border: 1px solid #14532d; color: #14532d; border-radius: 999px; padding: 2px 10px; font-size: 10px; }
  .note { background: #f8fafc; border-left: 3px solid #14532d; padding: 8px 12px; margin-top: 10px; }
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

function convention(d: DossierDonnees) {
  return shell(
    "Convention de formation professionnelle",
    `${entete(d, "Convention de formation professionnelle", "Articles L.6353-1 et suivants du Code du travail")}
    <h2>Entre les parties</h2>
    <div class="grid">
      <div>
        <strong>L'organisme de formation</strong><br />${v(d.organisme)}<br />
        ${v(d.formateur.entreprise)}<br />${v(d.formateur.adresse)}<br />
        SIRET ${v(d.formateur.siret)} · NDA ${v(d.formateur.nda)} ${d.formateur.ndaRegion ? `(${e(d.formateur.ndaRegion)})` : ""}
      </div>
      <div>
        <strong>Le client</strong><br />${v(d.entreprise.nom)}${d.entreprise.nomCommercial ? ` (${e(d.entreprise.nomCommercial)})` : ""}<br />
        ${v(d.entreprise.adresse)}<br />SIRET ${v(d.entreprise.siret)}<br />
        Représenté par ${v(`${d.entreprise.prenomRepresentant} ${d.entreprise.nomRepresentant}`.trim())}<br />
        ${v(d.entreprise.telephone)} · ${v(d.entreprise.email)}
      </div>
    </div>
    <h2>Article 1 — Objet et nature de l'action</h2>
    ${ligne("Intitulé", v(d.formation.titre))}
    ${ligne("Objectifs pédagogiques", multiline(d.formation.objectifs))}
    ${ligne("Niveau", v(d.formation.niveau))}
    ${ligne("Prérequis", v(d.formation.prerequis))}
    ${ligne("Modalité", e(FORMAT_LABELS[d.formation.format]))}
    <h2>Article 2 — Durée et lieu</h2>
    ${ligne("Dates", `${v(dateFr(d.formation.dateDebut))} au ${v(dateFr(d.formation.dateFin))}`)}
    ${ligne("Durée totale", `${v(d.formation.heuresTotal)} heures sur ${v(d.formation.nbJours)} jour(s)`)}
    ${aDuPresentiel(d) ? ligne("Dont heures en présentiel", v(d.formation.heuresPresentiel)) : ""}
    ${ligne("Lieu de formation", `${v(d.lieu.intitule)} — ${v(d.lieu.adresse)}`)}
    ${d.formation.format !== "presentiel" ? ligne("Lien de connexion", v(d.formation.lienConnexion)) : ""}
    <h2>Article 3 — Effectif concerné</h2>
    ${tableApprenants(d)}
    <h2>Article 4 — Dispositions financières</h2>
    ${ligne("Prix unitaire par stagiaire", e(euros(d.tarifs.prixUnitaire)))}
    ${ligne("Nombre de stagiaires", v(d.tarifs.nbStagiaires || String(d.apprenants.length)))}
    ${ligne("Prix total de l'action", e(euros(d.tarifs.prixTotal)))}
    ${aDuPresentiel(d) && d.tarifs.prixPresentiel ? ligne("Dont prix en présentiel", e(euros(d.tarifs.prixPresentiel))) : ""}
    ${ligne("Financement", e(FINANCEMENT_LABELS[d.tarifs.modeFinancement]))}
    ${d.tarifs.modeFinancement === "opco" ? ligne("OPCO / financeur", v(d.tarifs.opco)) : ""}
    ${d.tarifs.montantPrisEnCharge ? ligne("Montant pris en charge", e(euros(d.tarifs.montantPrisEnCharge))) : ""}
    ${ligne("Subrogation de paiement", d.tarifs.subrogation === "oui" ? "Oui" : "Non")}
    <h2>Article 5 — Moyens et évaluation</h2>
    <p>Les moyens pédagogiques, techniques et d'encadrement sont mis en œuvre par l'organisme. L'atteinte des objectifs est évaluée selon les modalités suivantes : ${multiline(d.besoins.modalitesEvaluation)}. Une attestation de fin de formation est remise à chaque participant.</p>
    <h2>Article 6 — Interruption, litiges</h2>
    <p>En cas d'abandon ou d'interruption, seules les heures réellement réalisées sont facturées. Tout litige relève de la compétence des tribunaux du siège de l'organisme, après tentative de résolution amiable.</p>
    <p style="margin-top:16px">Fait à ${v(d.convention.lieu)}, le ${v(dateFr(d.convention.date))}, en deux exemplaires.</p>
    ${signatures("Pour l'organisme de formation (cachet et signature)", "Pour le client (cachet et signature)")}`,
  );
}

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

function planning(d: DossierDonnees) {
  return shell(
    "Planning de formation",
    `${entete(d, "Planning de formation", v(d.formation.titre).replace(/<[^>]+>/g, ""))}
    <h2>Informations générales</h2>
    <div class="grid">
      <div>${ligne("Formation", v(d.formation.titre))}${ligne("Démarrage", v(dateFr(d.formation.dateDebut)))}${ligne("Fin", v(dateFr(d.formation.dateFin)))}</div>
      <div>${ligne("Durée totale", `${v(d.formation.heuresTotal)} h`)}${ligne("Nombre de jours", v(d.formation.nbJours))}${ligne("Lieu", `${v(d.lieu.intitule)} — ${v(d.lieu.adresse)}`)}</div>
    </div>
    <h2>Sessions programmées</h2>
    ${tableSessions(d)}
    <h2>Effectif de la session</h2>
    ${tableApprenants(d)}
    <p style="margin-top:14px">Fait à ${v(d.convention.lieu)}, le ${v(dateFr(d.convention.date))} — ${v(`${d.entreprise.prenomRepresentant} ${d.entreprise.nomRepresentant}`.trim())}</p>
    ${signatures("L'organisme de formation", "Le client")}`,
  );
}

function convocation(d: DossierDonnees) {
  const s = d.sessions[0];
  const body = d.apprenants.length ? d.apprenants : [{ nom: "", poste: "" }];
  return shell(
    "Convocation de formation",
    body
      .map(
        (a, i) => `<div class="avoid" ${i > 0 ? 'style="page-break-before:always"' : ""}>
      ${entete(d, "Convocation de formation", `Dossier ${d.adf || "—"}`)}
      <p style="margin-top:18px">Madame, Monsieur ${v(a.nom)},</p>
      <p>Vous êtes convoqué(e) à l'action de formation <strong>${v(d.formation.titre)}</strong> organisée par ${v(d.organisme)}.</p>
      <h2>Modalités pratiques</h2>
      ${ligne("Dates", `${v(dateFr(d.formation.dateDebut))} au ${v(dateFr(d.formation.dateFin))}`)}
      ${ligne("Première session", `${v(dateFr(s?.date))} de ${v(s?.heureDebut)} à ${v(s?.heureFin)}`)}
      ${ligne("Durée totale", `${v(d.formation.heuresTotal)} heures`)}
      ${ligne("Modalité", e(FORMAT_LABELS[d.formation.format]))}
      ${d.formation.format !== "distanciel" ? ligne("Lieu", `${v(d.lieu.intitule)} — ${v(d.lieu.adresse)}`) : ""}
      ${d.formation.format !== "presentiel" ? ligne("Lien de connexion", v(d.formation.lienConnexion)) : ""}
      ${viseIcdl(d) ? ligne("Certification visée", v(a.certification || "ICDL")) : ""}
      <h2>Votre formateur</h2>
      ${ligne("Formateur", v(`${d.formateur.prenom} ${d.formateur.nom}`.trim()))}
      ${ligne("Contact", `${v(d.formateur.email)} · ${v(d.formateur.telephone)}`)}
      <div class="note">${
        d.formation.lienResponsableFormateur
          ? "La création, la fourniture et le bon fonctionnement du lien de connexion (Workspace / visioconférence) relèvent de la responsabilité du formateur."
          : "Le lien de connexion est fourni par l'entreprise cliente."
      }</div>
      <h2>Planning détaillé</h2>
      ${tableSessions(d)}
      <p style="margin-top:14px">Fait à ${v(d.convention.lieu)}, le ${v(dateFr(d.convention.date))}.</p>
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

function recueilBesoins(d: DossierDonnees) {
  return shell(
    "Recueil des besoins pré-formation",
    `${entete(d, "Recueil des besoins — pré-formation", "Analyse du besoin et personnalisation du parcours")}
    <h2>Demandeur</h2>
    <div class="grid">
      <div>${ligne("Entreprise", v(d.entreprise.nom))}${ligne("Représentant", v(`${d.entreprise.prenomRepresentant} ${d.entreprise.nomRepresentant}`.trim()))}</div>
      <div>${ligne("Contact", `${v(d.entreprise.email)} · ${v(d.entreprise.telephone)}`)}${ligne("Formation envisagée", v(d.formation.titre))}</div>
    </div>
    <h2>Contexte et enjeux</h2><p>${multiline(d.besoins.contexte)}</p>
    <h2>Attentes et objectifs opérationnels</h2><p>${multiline(d.besoins.attentes)}</p>
    <h2>Niveau de départ des participants</h2><p>${multiline(d.besoins.niveauDepart)}</p>
    <h2>Prérequis et contraintes</h2>
    ${ligne("Prérequis", v(d.formation.prerequis))}
    ${ligne("Niveau visé", v(d.formation.niveau))}
    <p>${multiline(d.besoins.contraintes)}</p>
    <h2>Modalités d'évaluation retenues</h2><p>${multiline(d.besoins.modalitesEvaluation)}</p>
    <h2>Participants concernés</h2>
    ${tableApprenants(d, true)}
    ${signatures("Le formateur", "Le client")}`,
  );
}

function emargement(d: DossierDonnees) {
  const sessions = d.sessions.length ? d.sessions : [{ date: "", heureDebut: "", heureFin: "" }];
  return shell(
    "Relevé de fréquentation / émargement",
    sessions
      .map(
        (s, i) => `<div class="avoid" ${i > 0 ? 'style="page-break-before:always"' : ""}>
      ${entete(d, "Relevé de fréquentation — feuille d'émargement", `Session ${i + 1} du ${dateFr(s.date)}`)}
      <div class="grid">
        <div>${ligne("Formation", v(d.formation.titre))}${ligne("Objectif", multiline(d.formation.objectifs))}${ligne("Durée totale", `${v(d.formation.heuresTotal)} h`)}</div>
        <div>${ligne("Horaires", `${v(s.heureDebut)} - ${v(s.heureFin)}`)}${ligne("Lieu", `${v(s.lieu || d.lieu.intitule)} — ${v(d.lieu.adresse)}`)}${ligne("Entreprise", `${v(d.entreprise.nom)} · SIRET ${v(d.entreprise.siret)}`)}</div>
      </div>
      <table><thead><tr><th style="width:32px">#</th><th>Prénom et nom de l'apprenant</th><th style="width:34%">Signature matin</th><th style="width:34%">Signature après-midi</th></tr></thead><tbody>
      ${(d.apprenants.length ? d.apprenants : Array.from({ length: 5 }, () => ({ nom: "" })))
        .map((a, j) => `<tr><td>${j + 1}</td><td>${v(a.nom)}</td><td style="height:34px"></td><td></td></tr>`)
        .join("")}
      </tbody></table>
      ${signatures("Signature du formateur", "Cachet de l'organisme")}
    </div>`,
      )
      .join(""),
    "landscape",
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

function ordreMission(d: DossierDonnees) {
  return shell(
    "Contrat de sous-traitance / ordre de mission",
    `${entete(d, "Contrat de sous-traitance de formation (ordre de mission)", `Dossier ${d.adf || "—"}`)}
    <h2>Les parties</h2>
    <div class="grid">
      <div><strong>Le donneur d'ordre</strong><br />${v(d.organisme)}</div>
      <div><strong>Le sous-traitant (formateur)</strong><br />${v(d.formateur.entreprise)}<br />${v(`${d.formateur.prenom} ${d.formateur.nom}`.trim())}<br />${v(d.formateur.adresse)}<br />SIRET ${v(d.formateur.siret)} · NDA ${v(d.formateur.nda)} ${d.formateur.ndaRegion ? `(${e(d.formateur.ndaRegion)})` : ""}</div>
    </div>
    <h2>Mission confiée</h2>
    ${ligne("Formation", v(d.formation.titre))}
    ${ligne("Client final", `${v(d.entreprise.nom)} — ${v(`${d.entreprise.prenomRepresentant} ${d.entreprise.nomRepresentant}`.trim())} · ${v(d.entreprise.telephone)}`)}
    ${ligne("Dates", `${v(dateFr(d.formation.dateDebut))} au ${v(dateFr(d.formation.dateFin))}`)}
    ${ligne("Volume", `${v(d.formation.heuresTotal)} heures${aDuPresentiel(d) ? ` dont ${v(d.formation.heuresPresentiel)} h en présentiel` : ""}`)}
    ${ligne("Lieu", `${v(d.lieu.intitule)} — ${v(d.lieu.adresse)}`)}
    ${ligne("Objectifs pédagogiques", multiline(d.formation.objectifs))}
    ${ligne("Ouverture de mission", v(dateFr(d.formateur.dateMissionOuverte)))}
    <h2>Effectif à former</h2>
    ${tableApprenants(d)}
    <h2>Conditions financières</h2>
    ${ligne("Coût horaire", e(euros(d.formateur.coutHoraire)))}
    ${ligne("Total recette mission", e(euros(d.formateur.totalRecette)))}
    ${ligne("Règlement", "Sous 10 jours ouvrés à réception des fonds, sur facture conforme")}
    <h2>Engagements</h2>
    <p>Le sous-traitant s'engage à respecter le référentiel Qualiopi, à produire les pièces du dossier (émargements, évaluations, satisfaction) et à garantir la confidentialité des données. ${
      d.formation.lienResponsableFormateur
        ? "La fourniture du lien de connexion (Workspace / visio) est à sa charge et sous sa responsabilité."
        : "Le lien de connexion est fourni par le client."
    }</p>
    ${signatures("Le donneur d'ordre", "Le sous-traitant")}`,
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
    build: convention,
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
  { code: "2", label: "Planning", build: planning, applicable: () => true, destinataires: (d) => [d.entreprise.email] },
  {
    code: "3A",
    label: "Convocation des stagiaires",
    build: convocation,
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
    build: recueilBesoins,
    applicable: () => true,
    destinataires: (d) => [d.entreprise.email],
  },
  {
    code: "F0C",
    label: "Ordre de mission / sous-traitance",
    build: ordreMission,
    applicable: () => true,
    destinataires: (d) => [d.formateur.email],
  },
  {
    code: "F3",
    label: "Relevé de fréquentation / émargement",
    build: emargement,
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
