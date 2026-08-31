/**
 * Rendu des gabarits HTML officiels (déposés tels quels dans ./templates)
 * à partir des données d'un dossier de formation.
 */
import conventionTpl from "./templates/convention_de_formation_professionnelle_1.html?raw";
import contratTpl from "./templates/contrat_de_sous_traitance_formation.html?raw";
import convocationTpl from "./templates/convocation_de_formation.html?raw";
import emargementTpl from "./templates/feuille_d_margement.html?raw";
import planningTpl from "./templates/planning_de_formation.html?raw";
import recueilTpl from "./templates/recueil_des_besoins_pre_formation.html?raw";
import {
  FORMAT_LABELS,
  aDuPresentiel,
  dateFr,
  euros,
  type Apprenant,
  type DossierDonnees,
} from "./types";

export type Vars = Record<string, string>;

const MANQUANT = "—";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Remplace chaque {{cle}} du gabarit par la valeur correspondante (échappée).
 * Toute variable absente est rendue par « — » : aucune balise {{...}} ne subsiste.
 * Les blocs répétés (apprenants, sessions) sont numérotés dans la table de variables ;
 * un script de nettoyage retire les lignes/cartes restées vides.
 */
export function renderTemplate(templateHtml: string, vars: Vars, options?: { vide?: string }) {
  const vide = options?.vide ?? MANQUANT;
  const rendu = templateHtml.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (_match, rawKey: string) => {
    const key = String(rawKey).trim();
    const value = vars[key];
    if (value === undefined) return escapeHtml(vide);
    if (value === "") return "";
    return escapeHtml(value);
  });
  return injecterNettoyage(rendu);
}

/** Masque les barres d'outils d'écran et supprime les blocs répétés restés vides. */
function injecterNettoyage(html: string) {
  const patch = `
<style>@media screen { .no-print { display: none !important; } }</style>
<script>
(function () {
  function clean() {
    document.querySelectorAll('#learnersContainer .text-indigo-900').forEach(function (span) {
      if (!span.textContent.trim()) {
        var card = span.closest('.avoid-break') || span.closest('div');
        if (card) card.remove();
      }
    });
    document.querySelectorAll('tbody tr').forEach(function (tr) {
      var cells = tr.querySelectorAll('td');
      if (cells.length >= 3 && !cells[0].textContent.trim() && !cells[1].textContent.trim() && !cells[2].textContent.trim()) {
        tr.remove();
      }
    });
  }
  if (document.readyState === 'complete') setTimeout(clean, 0);
  else window.addEventListener('load', function () { setTimeout(clean, 0); });
})();
</script>`;
  return html.includes("</body>") ? html.replace("</body>", `${patch}\n</body>`) : html + patch;
}

/** Détecte les balises non substituées (utilisé par les tests). */
export function balisesRestantes(html: string) {
  return html.match(/\{\{[^{}]*\}\}/g) ?? [];
}

/* ------------------------------------------------------------------ */
/* Tables de correspondance DossierDonnees -> variables des gabarits   */
/* ------------------------------------------------------------------ */

function nomComplet(a?: Apprenant) {
  return a?.nom?.trim() ?? "";
}

const SESSION_KEYS = Array.from({ length: 20 }, (_, i) => {
  const n = i + 1;
  if (n === 1) return "1ere_Session";
  if (n === 2) return "2eme_Session";
  if (n === 3) return "3eme_Session";
  if (n === 4) return "4eme_Session";
  return `Session_${n}`;
});

function sessionVars(d: DossierDonnees): Vars {
  const vars: Vars = {};
  SESSION_KEYS.forEach((key, index) => {
    const s = d.sessions[index];
    const date = s ? dateFr(s.date) : "";
    vars[`Date_${key}`] = date === MANQUANT ? "" : date;
    vars[`Heure_debut_${key}`] = s?.heureDebut ?? "";
    vars[`Heure_fin_${key}`] = s?.heureFin ?? "";
    vars[`Heure_debut_${key.toLowerCase()}`] = s?.heureDebut ?? "";
    vars[`Heure_fin_${key.toLowerCase()}`] = s?.heureFin ?? "";
  });
  return vars;
}

function apprenantsListe(d: DossierDonnees) {
  return d.apprenants
    .map((a) => nomComplet(a))
    .filter(Boolean)
    .join(", ");
}

function lieuFormation(d: DossierDonnees) {
  return d.lieu.intitule || d.entreprise.nomCommercial || d.entreprise.nom || "";
}

function adresseFormation(d: DossierDonnees) {
  if (d.formation.format === "distanciel")
    return d.formation.lienConnexion || "Distanciel (lien de connexion transmis)";
  return d.lieu.adresse || d.entreprise.adresse || "";
}

/** 1A — Convention de formation professionnelle. */
export function varsConvention(d: DossierDonnees): Vars {
  const vars: Vars = {
    adf: d.adf,
    titre: d.formation.titre,
    objectifs: d.formation.objectifs,
    niveau: d.formation.niveau,
    prerecquis: d.formation.prerequis,
    entreprise: d.entreprise.nom,
    nomcom: d.entreprise.nomCommercial || d.entreprise.nom,
    adresseentreprise: d.entreprise.adresse,
    siret: d.entreprise.siret,
    prerepresentant: d.entreprise.prenomRepresentant,
    nomrepresentant: d.entreprise.nomRepresentant,
    datedeb: dateFr(d.formation.dateDebut),
    datefin: dateFr(d.formation.dateFin),
    horairetot: d.formation.heuresTotal,
    heurepres: aDuPresentiel(d) ? d.formation.heuresPresentiel : "",
    jours: d.formation.nbJours,
    lieuformation: lieuFormation(d),
    adresseformation: adresseFormation(d),
    siretformation: d.lieu.siret || d.entreprise.siret,
    nbstagaire: String(d.apprenants.length || d.tarifs.nbStagiaires || ""),
    prixunitaire: euros(d.tarifs.prixUnitaire),
    prixtotal: euros(d.tarifs.prixTotal),
    prixpresentiel: aDuPresentiel(d) ? euros(d.tarifs.prixPresentiel) : "",
    OPCO: d.tarifs.opco,
    subrogation: d.tarifs.subrogation === "oui" ? "Oui" : "Non",
    lieusignature: d.convention.lieu,
    datesignature: dateFr(d.convention.date),
    variable: "",
  };
  for (let i = 1; i <= 8; i += 1) {
    const a = d.apprenants[i - 1];
    vars[`nomapp${i}`] = nomComplet(a);
    vars[`positionapp${i}`] = a?.poste ?? "";
  }
  return vars;
}

/** Annexe listant les apprenants au-delà du 8e (la convention n'en affiche que 8). */
export function annexeApprenants(d: DossierDonnees) {
  const reste = d.apprenants.slice(8);
  if (!reste.length) return "";
  const lignes = reste
    .map(
      (a, i) =>
        `<tr><td style="border:1px solid #94a3b8;padding:6px">${i + 9}</td><td style="border:1px solid #94a3b8;padding:6px">${escapeHtml(nomComplet(a))}</td><td style="border:1px solid #94a3b8;padding:6px">${escapeHtml(a.poste ?? "")}</td></tr>`,
    )
    .join("");
  return `
<div style="page-break-before:always;max-width:210mm;margin:24px auto;padding:24px;background:#fff;font-family:ui-sans-serif,system-ui,sans-serif;color:#0f172a">
  <h2 style="font-size:15px;font-weight:700;margin-bottom:4px">Annexe — Liste complémentaire des stagiaires</h2>
  <p style="font-size:11px;color:#475569;margin-bottom:12px">Annexe à la convention de formation « ${escapeHtml(d.formation.titre || MANQUANT)} » — stagiaires n° 9 et suivants.</p>
  <table style="width:100%;border-collapse:collapse;font-size:11px">
    <thead><tr><th style="border:1px solid #94a3b8;padding:6px;background:#f1f5f9;text-align:left">N°</th><th style="border:1px solid #94a3b8;padding:6px;background:#f1f5f9;text-align:left">Prénom et nom</th><th style="border:1px solid #94a3b8;padding:6px;background:#f1f5f9;text-align:left">Fonction</th></tr></thead>
    <tbody>${lignes}</tbody>
  </table>
</div>`;
}

/** 2 — Planning de formation. */
export function varsPlanning(d: DossierDonnees): Vars {
  return {
    ...sessionVars(d),
    Titre_de_la_Formation: d.formation.titre,
    Date_de_demarrage: dateFr(d.formation.dateDebut),
    Date_de_fin: dateFr(d.formation.dateFin),
    Duree_totale_en_heures: d.formation.heuresTotal,
    Nombre_de_jour_de_Formation: d.formation.nbJours,
    Adresse_lieu_formation: adresseFormation(d),
    Lieu_de_la_Convention: d.convention.lieu,
    Date_de_la_Convention: dateFr(d.convention.date),
    Prenom_representant_entreprise: d.entreprise.prenomRepresentant,
    Nom_representant_entreprise: d.entreprise.nomRepresentant,
    listingstagiaire: apprenantsListe(d),
    variable: "",
  };
}

/** 3A — Convocation (une par apprenant). */
export function varsConvocation(d: DossierDonnees, apprenant?: Apprenant): Vars {
  const s = d.sessions[0];
  return {
    NBADF: d.adf,
    TITREFOR: d.formation.titre,
    DAT: dateFr(d.formation.dateDebut),
    Hsess1: s?.heureDebut ?? "",
    hsess1fin: s?.heureFin ?? "",
    format: FORMAT_LABELS[d.formation.format],
    lienform:
      d.formation.format === "presentiel" ? adresseFormation(d) : d.formation.lienConnexion || "",
    liste_stagiaires: nomComplet(apprenant) || apprenantsListe(d),
    nomstagaire: nomComplet(apprenant) || apprenantsListe(d),
    FOR: `${d.formateur.prenom} ${d.formateur.nom}`.trim(),
    emailFOR: d.formateur.email,
    TelFOR: d.formateur.telephone,
    adresseFOR: d.formateur.adresse,
    variable: "",
  };
}

/** F3 — Feuille d'émargement. */
export function varsEmargement(d: DossierDonnees): Vars {
  const vars: Vars = {
    ...sessionVars(d),
    Titre_de_la_Formation: d.formation.titre,
    Objectif_Pedagogique_de_la_Formation: d.formation.objectifs,
    Duree_totale_en_heures: d.formation.heuresTotal,
    Date_de_demarrage: dateFr(d.formation.dateDebut),
    Date_de_fin: dateFr(d.formation.dateFin),
    L_entreprise_dans_laquelle_a_lieu_la_formation: lieuFormation(d),
    adresse_de_l_entreprise_dans_laquelle_a_lieu_la_formation: adresseFormation(d),
    Nom_de_l_entreprise: d.entreprise.nom,
    SIRET_de_l_entreprise: d.entreprise.siret,
    Nom_Formateur: `${d.formateur.prenom} ${d.formateur.nom}`.trim(),
    Date_Formateur: dateFr(d.formation.dateFin),
  };
  for (let i = 1; i <= 8; i += 1) {
    vars[`Prenom_et_Nom_de_l_apprenant_${i}`] = nomComplet(d.apprenants[i - 1]);
  }
  return vars;
}

/** F0C — Contrat de sous-traitance / ordre de mission formateur. */
export function varsContrat(d: DossierDonnees): Vars {
  return {
    nbadf: d.adf,
    Titreformation: d.formation.titre,
    "objectifspédagogique": d.formation.objectifs,
    objectifspedagogique: d.formation.objectifs,
    datedebut: dateFr(d.formation.dateDebut),
    datefin: dateFr(d.formation.dateFin),
    heuretotal: d.formation.heuresTotal,
    heurepresentiel: aDuPresentiel(d) ? d.formation.heuresPresentiel : "",
    adresseformation: adresseFormation(d),
    Entrepriseclient: d.entreprise.nom,
    nomrepresentant: `${d.entreprise.prenomRepresentant} ${d.entreprise.nomRepresentant}`.trim(),
    nomformateur: `${d.formateur.prenom} ${d.formateur.nom}`.trim(),
    EntrepriseFormateur: d.formateur.entreprise,
    AdresseFormateur: d.formateur.adresse,
    siretFormateur: d.formateur.siret,
    NDAFormateur: d.formateur.nda,
    NDAregion: d.formateur.ndaRegion,
    TEL: d.formateur.telephone,
    couthoraire: euros(d.formateur.coutHoraire),
    totalrecette: euros(d.formateur.totalRecette),
    dateMissionouverte: dateFr(d.formateur.dateMissionOuverte),
  };
}

/** F0A — Recueil des besoins pré-formation (un par apprenant). */
export function varsRecueil(d: DossierDonnees, apprenant?: Apprenant): Vars {
  return {
    nbadf: d.adf,
    titreform: d.formation.titre,
    nbheure: d.formation.heuresTotal,
    nomformateur: `${d.formateur.prenom} ${d.formateur.nom}`.trim(),
    nomstagiaire: nomComplet(apprenant) || apprenantsListe(d),
    datepreeval: dateFr(d.formation.dateDebut),
    q_poste_anciennete: apprenant?.poste ?? "",
    q_besoins_principaux: d.besoins.contexte,
    q_attentes: d.besoins.attentes,
    q_niveau_maitrise: d.besoins.niveauDepart,
    q_handicap_precision: d.besoins.contraintes,
  };
}

/* ------------------------------------------------------------------ */
/* Constructeurs de documents                                          */
/* ------------------------------------------------------------------ */

export function conventionHtml(d: DossierDonnees) {
  return renderTemplate(conventionTpl, varsConvention(d)) + annexeApprenants(d);
}

export function planningHtml(d: DossierDonnees) {
  return renderTemplate(planningTpl, varsPlanning(d));
}

export function emargementHtml(d: DossierDonnees) {
  return renderTemplate(emargementTpl, varsEmargement(d));
}

export function contratSousTraitanceHtml(d: DossierDonnees) {
  return renderTemplate(contratTpl, varsContrat(d));
}

/** Une convocation par apprenant (documents concaténés, saut de page entre chacun). */
export function convocationHtml(d: DossierDonnees) {
  const cibles = d.apprenants.length ? d.apprenants : [undefined];
  return cibles
    .map((a) => renderTemplate(convocationTpl, varsConvocation(d, a)))
    .join('<div style="page-break-before:always"></div>');
}

/** Un recueil des besoins par apprenant. */
export function recueilBesoinsHtml(d: DossierDonnees) {
  const cibles = d.apprenants.length ? d.apprenants : [undefined];
  return cibles
    .map((a) => renderTemplate(recueilTpl, varsRecueil(d, a)))
    .join('<div style="page-break-before:always"></div>');
}

export const TEMPLATES = {
  convention: conventionTpl,
  planning: planningTpl,
  emargement: emargementTpl,
  contrat: contratTpl,
  convocation: convocationTpl,
  recueil: recueilTpl,
};
