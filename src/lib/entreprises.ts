/**
 * Recherche d'entreprises (API publique « Recherche d'entreprises » de l'État) :
 * contrôles SIREN/SIRET, schéma de la réponse et normalisation.
 *
 * Module pur (aucun accès réseau, aucune dépendance serveur) : il est partagé entre
 * la server function (`entreprises.functions.ts`) et le composant `SiretAutocomplete`.
 *
 * Documentation : https://recherche-entreprises.api.gouv.fr/docs/
 * - 7 requêtes/s max par IP (HTTP 429 + `Retry-After` au-delà), `per_page` ≤ 25 ;
 * - si `q` contient exactement 9 ou 14 chiffres, recherche directe SIREN/SIRET ;
 * - les entreprises non diffusibles ne sont pas exposées.
 */
import { z } from "zod";

/** Entreprise ou établissement trouvé, normalisé pour remplir nos formulaires. */
export type EntrepriseTrouvee = {
  siret: string;
  siren: string;
  raisonSociale: string;
  /** Nom commercial / enseigne / sigle de l'établissement s'il existe. */
  nomCommercial: string | null;
  /** Voie (numéro + rue + complément), sans code postal ni ville. */
  adresse: string;
  codePostal: string;
  ville: string;
  /** Adresse postale complète sur une ligne (voie + code postal + ville). */
  adresseComplete: string;
  codeNaf: string | null;
  libelleNaf?: string | null;
  effectif?: string | null;
  formeJuridique?: string | null;
  /** « A » : actif, « C » : cessé/fermé (établissement, à défaut unité légale). */
  etatAdministratif: "A" | "C";
  estSiege: boolean;
  /** Premier dirigeant personne physique (représentant légal probable). */
  dirigeant: { prenom: string; nom: string; qualite: string | null } | null;
};

/** SIREN de La Poste : ses SIRET ne respectent pas la clé de Luhn (règle « somme des chiffres multiple de 5 »). */
export const SIREN_LA_POSTE = "356000000";

/** Retire espaces, points et tirets. */
export function nettoieNumero(value: string) {
  return value.replace(/[\s.-]/g, "");
}

/** Formate un SIRET « 418 166 096 00069 » (ou un SIREN « 418 166 096 »). */
export function formateSiret(value: string) {
  const v = nettoieNumero(value);
  if (/^\d{14}$/.test(v)) return `${v.slice(0, 3)} ${v.slice(3, 6)} ${v.slice(6, 9)} ${v.slice(9)}`;
  if (/^\d{9}$/.test(v)) return `${v.slice(0, 3)} ${v.slice(3, 6)} ${v.slice(6)}`;
  return value;
}

function luhn(digits: string) {
  let somme = 0;
  for (let i = 0; i < digits.length; i++) {
    let n = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    somme += n;
  }
  return somme % 10 === 0;
}

export function sirenValide(value: string) {
  const v = nettoieNumero(value);
  return /^\d{9}$/.test(v) && (v === SIREN_LA_POSTE || luhn(v));
}

export function siretValide(value: string) {
  const v = nettoieNumero(value);
  if (!/^\d{14}$/.test(v)) return false;
  if (v.startsWith(SIREN_LA_POSTE)) {
    // Exception La Poste : le siège respecte Luhn, les autres établissements une somme multiple de 5.
    const somme = [...v].reduce((acc, c) => acc + Number(c), 0);
    return luhn(v) || somme % 5 === 0;
  }
  return luhn(v);
}

export type TypeRecherche =
  | { type: "siret"; q: string }
  | { type: "siren"; q: string }
  | { type: "nom"; q: string }
  | { type: "invalide"; message: string }
  | { type: "incomplet" };

/**
 * Détermine le type de recherche à partir de la saisie : SIRET (14 chiffres, espaces tolérés),
 * SIREN (9 chiffres) ou nom (au moins 3 caractères dont une lettre).
 */
export function analyseSaisie(value: string): TypeRecherche {
  const brut = value.trim();
  const chiffres = nettoieNumero(brut);
  if (/^\d+$/.test(chiffres)) {
    if (chiffres.length === 14) {
      return siretValide(chiffres)
        ? { type: "siret", q: chiffres }
        : { type: "invalide", message: "SIRET invalide (clé de contrôle incorrecte)." };
    }
    if (chiffres.length === 9) {
      return sirenValide(chiffres)
        ? { type: "siren", q: chiffres }
        : { type: "invalide", message: "SIREN invalide (clé de contrôle incorrecte)." };
    }
    if (chiffres.length > 14)
      return { type: "invalide", message: "Un SIRET comporte 14 chiffres." };
    return { type: "incomplet" };
  }
  if (brut.length >= 3 && /\p{L}/u.test(brut)) return { type: "nom", q: brut.slice(0, 120) };
  return { type: "incomplet" };
}

// ---------------------------------------------------------------------------
// Schéma (partiel et tolérant) de la réponse de /search
// ---------------------------------------------------------------------------

const texte = z.string().nullish();

const etablissementSchema = z.object({
  siret: z.string(),
  adresse: texte,
  code_postal: texte,
  libelle_commune: texte,
  activite_principale: texte,
  tranche_effectif_salarie: texte,
  etat_administratif: texte,
  est_siege: z.boolean().nullish(),
  nom_commercial: texte,
  liste_enseignes: z.array(z.string()).nullish(),
});

const dirigeantSchema = z.object({
  type_dirigeant: texte,
  nom: texte,
  prenoms: texte,
  qualite: texte,
});

const uniteLegaleSchema = z.object({
  siren: z.string(),
  nom_complet: texte,
  nom_raison_sociale: texte,
  sigle: texte,
  activite_principale: texte,
  nature_juridique: texte,
  tranche_effectif_salarie: texte,
  etat_administratif: texte,
  siege: etablissementSchema.nullish(),
  matching_etablissements: z.array(etablissementSchema).nullish(),
  dirigeants: z.array(dirigeantSchema).nullish(),
});

export const reponseRechercheSchema = z.object({
  results: z.array(uniteLegaleSchema),
  total_results: z.number().nullish(),
});

export type ReponseRecherche = z.infer<typeof reponseRechercheSchema>;
type UniteLegale = z.infer<typeof uniteLegaleSchema>;
type Etablissement = z.infer<typeof etablissementSchema>;

// ---------------------------------------------------------------------------
// Référentiels (libellés usuels)
// ---------------------------------------------------------------------------

/** Tranches d'effectif salarié INSEE. */
export const TRANCHES_EFFECTIF: Record<string, string> = {
  NN: "Non employeur",
  "00": "0 salarié",
  "01": "1 à 2 salariés",
  "02": "3 à 5 salariés",
  "03": "6 à 9 salariés",
  "11": "10 à 19 salariés",
  "12": "20 à 49 salariés",
  "21": "50 à 99 salariés",
  "22": "100 à 199 salariés",
  "31": "200 à 249 salariés",
  "32": "250 à 499 salariés",
  "41": "500 à 999 salariés",
  "42": "1 000 à 1 999 salariés",
  "51": "2 000 à 4 999 salariés",
  "52": "5 000 à 9 999 salariés",
  "53": "10 000 salariés et plus",
};

/** Catégories juridiques les plus fréquentes (nomenclature INSEE niveau III). */
const FORMES_JURIDIQUES: Record<string, string> = {
  "1000": "Entrepreneur individuel",
  "5410": "SARL nationale",
  "5422": "SARL immobilière de gestion",
  "5498": "EURL",
  "5499": "SARL",
  "5505": "SA à participation ouvrière à conseil d'administration",
  "5510": "SA nationale à conseil d'administration",
  "5599": "SA à conseil d'administration",
  "5699": "SA à directoire",
  "5710": "SAS",
  "5720": "SASU",
  "5785": "Société d'exercice libéral par actions simplifiée",
  "6540": "SCI",
  "6585": "Société civile",
  "7210": "Commune",
  "7389": "Établissement public national à caractère administratif",
  "9220": "Association déclarée",
  "9221": "Association déclarée d'insertion par l'économique",
  "9230": "Association déclarée reconnue d'utilité publique",
};

function propre(value: string | null | undefined) {
  const v = (value ?? "").replace(/\s+/g, " ").trim();
  if (!v || /NON[- ]DIFFUSIBLE/i.test(v)) return "";
  return v;
}

/** « JEAN-PIERRE MARIE » → « Jean-Pierre » (premier prénom, casse soignée). */
function premierPrenom(prenoms: string) {
  const premier = prenoms.trim().split(/\s+/)[0] ?? "";
  return premier.toLowerCase().replace(/(^|[-'’])\p{L}/gu, (m) => m.toUpperCase());
}

/** Retire « CP VILLE » en fin d'adresse pour ne garder que la voie. */
function extraitVoie(adresse: string, codePostal: string, ville: string) {
  let voie = adresse;
  if (codePostal) {
    const i = voie.lastIndexOf(codePostal);
    if (i > 0) voie = voie.slice(0, i);
  } else if (ville && voie.toUpperCase().endsWith(ville.toUpperCase())) {
    voie = voie.slice(0, -ville.length);
  }
  return voie.replace(/[\s,]+$/, "").trim();
}

function normaliseEtablissement(ul: UniteLegale, etab: Etablissement): EntrepriseTrouvee {
  const codePostal = propre(etab.code_postal);
  const ville = propre(etab.libelle_commune);
  const adresseComplete = propre(etab.adresse);
  const raisonSociale = propre(ul.nom_raison_sociale) || propre(ul.nom_complet) || ul.siren;
  const enseigne =
    propre(etab.nom_commercial) || propre(etab.liste_enseignes?.[0]) || propre(ul.sigle);
  const dirigeant = (ul.dirigeants ?? []).find(
    (d) => d.type_dirigeant === "personne physique" && propre(d.nom),
  );
  const etat = propre(etab.etat_administratif) || propre(ul.etat_administratif);
  const tranche = propre(etab.tranche_effectif_salarie) || propre(ul.tranche_effectif_salarie);
  const nature = propre(ul.nature_juridique);
  return {
    siret: etab.siret,
    siren: ul.siren,
    raisonSociale,
    nomCommercial:
      enseigne && enseigne.toUpperCase() !== raisonSociale.toUpperCase() ? enseigne : null,
    adresse: extraitVoie(adresseComplete, codePostal, ville),
    codePostal,
    ville,
    adresseComplete,
    codeNaf: propre(etab.activite_principale) || propre(ul.activite_principale) || null,
    libelleNaf: null,
    effectif: tranche ? (TRANCHES_EFFECTIF[tranche] ?? null) : null,
    formeJuridique: nature ? (FORMES_JURIDIQUES[nature] ?? `Catégorie juridique ${nature}`) : null,
    etatAdministratif: etat === "C" || etat === "F" ? "C" : "A",
    estSiege: Boolean(etab.est_siege),
    dirigeant: dirigeant
      ? {
          prenom: premierPrenom(propre(dirigeant.prenoms)),
          nom: propre(dirigeant.nom),
          qualite: propre(dirigeant.qualite) || null,
        }
      : null,
  };
}

/** Ordre d'affichage : établissements actifs d'abord, puis le siège. */
function ordre(a: EntrepriseTrouvee, b: EntrepriseTrouvee) {
  if (a.etatAdministratif !== b.etatAdministratif) return a.etatAdministratif === "A" ? -1 : 1;
  if (a.estSiege !== b.estSiege) return a.estSiege ? -1 : 1;
  return 0;
}

/**
 * Convertit la réponse de l'API en suggestions :
 * - SIRET : uniquement l'établissement exact (via `matching_etablissements`, à défaut le siège) ;
 * - SIREN : les établissements de l'entreprise (actifs d'abord) ;
 * - nom : le siège de chaque entreprise trouvée.
 */
export function normaliseReponse(
  reponse: ReponseRecherche,
  recherche: { type: "siret" | "siren" | "nom"; q: string },
  limite = 8,
): EntrepriseTrouvee[] {
  const sortie: EntrepriseTrouvee[] = [];
  for (const ul of reponse.results) {
    const etabs = [...(ul.matching_etablissements ?? [])];
    if (ul.siege && !etabs.some((e) => e.siret === ul.siege?.siret)) etabs.push(ul.siege);

    if (recherche.type === "siret") {
      const exact = etabs.find((e) => e.siret === recherche.q);
      if (exact) sortie.push(normaliseEtablissement(ul, exact));
    } else if (recherche.type === "siren") {
      if (ul.siren !== recherche.q) continue;
      sortie.push(...etabs.map((e) => normaliseEtablissement(ul, e)).sort(ordre));
    } else if (ul.siege) {
      sortie.push(normaliseEtablissement(ul, ul.siege));
    }
  }
  const vus = new Set<string>();
  return sortie.filter((e) => !vus.has(e.siret) && vus.add(e.siret)).slice(0, limite);
}
