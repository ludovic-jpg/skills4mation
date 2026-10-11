/**
 * Questionnaire de candidature formateur (/candidature) — logique pure, sans React ni Supabase :
 * référentiels de choix, validation par étape, progression, sauvegarde locale, et
 * transformation des réponses en ligne `candidatures` / complément de `profiles`.
 */
import { z } from "zod";

import { nettoieNumero, siretValide } from "@/lib/entreprises";

export const QUESTIONNAIRE_VERSION = 1;

// ——— Référentiels ————————————————————————————————————————————————

export const DOMAINES = [
  { id: "management", label: "Management & leadership" },
  { id: "digital", label: "Digital & IA" },
  { id: "langues", label: "Langues" },
  { id: "compta", label: "Comptabilité & finance" },
  { id: "rh", label: "RH & droit social" },
  { id: "commercial", label: "Commercial & vente" },
  { id: "bureautique", label: "Bureautique" },
  { id: "securite", label: "Sécurité & réglementaire" },
  { id: "bien_etre", label: "Bien-être & développement personnel" },
  { id: "autre", label: "Autre domaine" },
] as const;

export const EXPERIENCES = [
  { id: "moins_2", label: "Moins de 2 ans", detail: "Vous démarrez" },
  { id: "2_5", label: "2 à 5 ans", detail: "Vous avez vos repères" },
  { id: "5_10", label: "5 à 10 ans", detail: "Formateur confirmé" },
  { id: "plus_10", label: "Plus de 10 ans", detail: "Formateur expert" },
] as const;

export const PUBLICS = [
  { id: "salaries", label: "Salariés" },
  { id: "managers", label: "Managers & dirigeants" },
  { id: "demandeurs_emploi", label: "Demandeurs d'emploi" },
  { id: "independants", label: "Indépendants & TPE" },
  { id: "particuliers_cpf", label: "Particuliers (CPF)" },
  { id: "alternants", label: "Alternants & jeunes actifs" },
] as const;

export const MODALITES = [
  { id: "presentiel", label: "Présentiel", detail: "En salle, chez le client" },
  { id: "distanciel", label: "Distanciel", detail: "Classe virtuelle" },
  { id: "mixte", label: "Mixte", detail: "Présentiel + distanciel" },
] as const;

export const STATUTS_STRUCTURE = [
  { id: "micro", label: "Micro-entreprise", detail: "Entrepreneur individuel" },
  { id: "societe", label: "Société", detail: "SASU, EURL, SARL…" },
  { id: "aucune", label: "Pas encore de structure", detail: "Nous vous orientons" },
] as const;

export type DomaineId = (typeof DOMAINES)[number]["id"];
export type ExperienceId = (typeof EXPERIENCES)[number]["id"];
export type PublicId = (typeof PUBLICS)[number]["id"];
export type ModaliteId = (typeof MODALITES)[number]["id"];
export type StatutStructureId = (typeof STATUTS_STRUCTURE)[number]["id"];

// ——— Réponses ———————————————————————————————————————————————————

export type Reponses = {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  domaines: DomaineId[];
  domaineAutre: string;
  specialite: string;
  experience: ExperienceId | "";
  publics: PublicId[];
  modalites: ModaliteId[];
  zone: string;
  linkedin: string;
  statutStructure: StatutStructureId | "";
  entreprise: string;
  siret: string;
  entrepriseAdresse: string;
  aNda: "oui" | "non" | "";
  numeroNda: string;
  ndaRegion: string;
  engagement: boolean;
  message: string;
};

export const REPONSES_VIDES: Reponses = {
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
  domaines: [],
  domaineAutre: "",
  specialite: "",
  experience: "",
  publics: [],
  modalites: [],
  zone: "",
  linkedin: "",
  statutStructure: "",
  entreprise: "",
  siret: "",
  entrepriseAdresse: "",
  aNda: "",
  numeroNda: "",
  ndaRegion: "",
  engagement: false,
  message: "",
};

// ——— Étapes ————————————————————————————————————————————————————

export const ETAPES = [
  { id: "identite", titre: "Vous" },
  { id: "expertise", titre: "Expertise" },
  { id: "experience", titre: "Expérience" },
  { id: "pratique", titre: "Façon de former" },
  { id: "structure", titre: "Structure" },
  { id: "pieces", titre: "Pièces" },
  { id: "engagements", titre: "Engagements" },
  { id: "acces", titre: "Accès" },
] as const;

export type EtapeId = (typeof ETAPES)[number]["id"];
export const NB_ETAPES = ETAPES.length;

/** Pourcentage affiché par la barre : l'étape courante compte comme « en cours ». */
export function progression(index: number): number {
  const i = Math.min(Math.max(index, 0), NB_ETAPES - 1);
  return Math.round(((i + 1) / NB_ETAPES) * 100);
}

// ——— Pièces ————————————————————————————————————————————————————

export const PIECES = [
  { name: "cv", label: "Votre CV", hint: "Parcours, missions, références." },
  {
    name: "parcours",
    label: "Votre parcours de formation",
    hint: "Les formations que vous proposez ou avez animées.",
  },
  {
    name: "deroule",
    label: "Un déroulé pédagogique",
    hint: "Un exemple de séquence : objectifs, timing, activités.",
  },
] as const;

export type PieceName = (typeof PIECES)[number]["name"];
export type FichierInfo = { name: string; size: number };

export const TAILLE_MAX = 10 * 1024 * 1024;
export const EXTENSIONS = ["pdf", "doc", "docx", "odt", "ppt", "pptx"] as const;
export const ACCEPT = EXTENSIONS.map((e) => `.${e}`).join(",");

export function verifierFichier(fichier: FichierInfo | undefined): string | null {
  if (!fichier) return "Pièce obligatoire";
  const ext = fichier.name.split(".").pop()?.toLowerCase() ?? "";
  if (!(EXTENSIONS as readonly string[]).includes(ext))
    return "Format non accepté : PDF, Word, OpenDocument ou PowerPoint.";
  if (fichier.size > TAILLE_MAX) return "Fichier trop volumineux (10 Mo maximum).";
  if (fichier.size === 0) return "Ce fichier est vide.";
  return null;
}

export function formatTaille(octets: number): string {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}

// ——— Validation ————————————————————————————————————————————————

const emailSchema = z.string().trim().email().max(255);

export function telephoneValide(value: string): boolean {
  const chiffres = value.replace(/[^\d]/g, "");
  return /^[+\d\s().-]+$/.test(value.trim()) && chiffres.length >= 9 && chiffres.length <= 15;
}

export function linkedinValide(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  try {
    const url = new URL(v.startsWith("http") ? v : `https://${v}`);
    return /(^|\.)linkedin\.com$/i.test(url.hostname);
  } catch {
    return false;
  }
}

export function normaliseLinkedin(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  return (v.startsWith("http") ? v : `https://${v}`).slice(0, 300);
}

export type Erreurs = Record<string, string>;

/** Erreurs de l'étape `index` (objet vide = étape valide). */
export function validerEtape(
  index: number,
  r: Reponses,
  fichiers: Partial<Record<PieceName, FichierInfo>> = {},
): Erreurs {
  const e: Erreurs = {};
  const id = ETAPES[index]?.id;
  switch (id) {
    case "identite":
      if (!r.prenom.trim()) e["prenom"] = "Indiquez votre prénom.";
      else if (r.prenom.trim().length > 80) e["prenom"] = "80 caractères maximum.";
      if (!r.nom.trim()) e["nom"] = "Indiquez votre nom.";
      else if (r.nom.trim().length > 80) e["nom"] = "80 caractères maximum.";
      if (!emailSchema.safeParse(r.email).success)
        e["email"] = "Indiquez une adresse e-mail valide, par exemple nom@domaine.fr.";
      if (!telephoneValide(r.telephone))
        e["telephone"] = "Indiquez un numéro de téléphone, par exemple 06 12 34 56 78.";
      break;
    case "expertise":
      if (r.domaines.length === 0) e["domaines"] = "Choisissez au moins un domaine.";
      if (r.domaines.includes("autre") && !r.domaineAutre.trim())
        e["domaineAutre"] = "Précisez votre domaine.";
      if (r.specialite.length > 200) e["specialite"] = "200 caractères maximum.";
      break;
    case "experience":
      if (!r.experience) e["experience"] = "Choisissez votre ancienneté de formateur.";
      if (r.publics.length === 0) e["publics"] = "Choisissez au moins un public.";
      break;
    case "pratique":
      if (r.modalites.length === 0) e["modalites"] = "Choisissez au moins une modalité.";
      if (r.zone.length > 150) e["zone"] = "150 caractères maximum.";
      if (!linkedinValide(r.linkedin))
        e["linkedin"] = "Collez l'adresse de votre profil, par exemple linkedin.com/in/votre-nom.";
      break;
    case "structure":
      if (!r.statutStructure) e["statutStructure"] = "Choisissez votre situation.";
      if (r.statutStructure && r.statutStructure !== "aucune") {
        const siret = nettoieNumero(r.siret);
        if (!siret) e["siret"] = "Indiquez le SIRET de votre structure.";
        else if (!siretValide(siret)) e["siret"] = "Ce SIRET ne semble pas valide (14 chiffres).";
      }
      if (!r.aNda) e["aNda"] = "Répondez par oui ou par non.";
      if (r.aNda === "oui") {
        const nda = r.numeroNda.replace(/\s/g, "");
        if (!/^\d{11}$/.test(nda))
          e["numeroNda"] = "Le numéro de déclaration d'activité comporte 11 chiffres.";
      }
      break;
    case "pieces":
      for (const p of PIECES) {
        const err = verifierFichier(fichiers[p.name]);
        if (err) e[p.name] = err;
      }
      break;
    case "engagements":
      if (!r.engagement) e["engagement"] = "Cochez la case pour confirmer vos engagements.";
      if (r.message.length > 1500) e["message"] = "1 500 caractères maximum.";
      break;
    default:
      break;
  }
  return e;
}

/** Première étape incomplète avant `jusqua` (exclu), ou -1 si tout est valide. */
export function premiereEtapeInvalide(
  r: Reponses,
  fichiers: Partial<Record<PieceName, FichierInfo>>,
  jusqua = NB_ETAPES - 1,
): number {
  for (let i = 0; i < jusqua; i++) {
    if (Object.keys(validerEtape(i, r, fichiers)).length > 0) return i;
  }
  return -1;
}

export function reglesMotDePasse(mdp: string) {
  return [
    { id: "longueur", label: "8 caractères minimum", ok: mdp.length >= 8 },
    { id: "lettre", label: "Au moins une lettre", ok: /\p{L}/u.test(mdp) },
    { id: "chiffre", label: "Au moins un chiffre", ok: /\d/.test(mdp) },
  ];
}

export function motDePasseValide(mdp: string): boolean {
  return mdp.length <= 72 && reglesMotDePasse(mdp).every((r) => r.ok);
}

// ——— Transformation ———————————————————————————————————————————————

export type Questionnaire = {
  version: number;
  domaines: DomaineId[];
  domaine_autre: string | null;
  specialite: string | null;
  experience: ExperienceId | null;
  publics: PublicId[];
  modalites: ModaliteId[];
  zone: string | null;
  statut_structure: StatutStructureId | null;
};

const vide = (v: string, max: number) => v.trim().slice(0, max) || null;

export function construireQuestionnaire(r: Reponses): Questionnaire {
  return {
    version: QUESTIONNAIRE_VERSION,
    domaines: [...r.domaines],
    domaine_autre: r.domaines.includes("autre") ? vide(r.domaineAutre, 120) : null,
    specialite: vide(r.specialite, 200),
    experience: r.experience || null,
    publics: [...r.publics],
    modalites: [...r.modalites],
    zone: vide(r.zone, 150),
    statut_structure: r.statutStructure || null,
  };
}

export function libellesDomaines(q: Pick<Questionnaire, "domaines" | "domaine_autre">): string[] {
  return q.domaines.map((id) =>
    id === "autre"
      ? (q.domaine_autre ?? "Autre domaine")
      : (DOMAINES.find((d) => d.id === id)?.label ?? id),
  );
}

/** Texte de la colonne `expertise` : la spécialité, sinon les domaines choisis. */
export function texteExpertise(q: Questionnaire): string {
  return (q.specialite ?? libellesDomaines(q).join(", ")).slice(0, 200);
}

export type UrlsPieces = {
  cv_url: string;
  parcours_formation_url: string;
  deroule_pedagogique_url: string;
};

/** Ligne à insérer dans `candidatures` (insert anonyme). */
export function versCandidature(r: Reponses, urls: UrlsPieces) {
  const q = construireQuestionnaire(r);
  const structure = r.statutStructure && r.statutStructure !== "aucune";
  return {
    prenom: r.prenom.trim().slice(0, 80),
    nom: r.nom.trim().slice(0, 80),
    email: r.email.trim().toLowerCase().slice(0, 255),
    telephone: vide(r.telephone, 30),
    expertise: texteExpertise(q),
    message: vide(r.message, 1500),
    siret: structure ? nettoieNumero(r.siret) || null : null,
    numero_nda: r.aNda === "oui" ? r.numeroNda.replace(/\s/g, "") || null : null,
    ...urls,
    questionnaire: {
      ...q,
      // Données complémentaires utiles au rattachement du profil (colonnes absentes de la table).
      entreprise: structure ? vide(r.entreprise, 150) : null,
      entreprise_adresse: structure ? vide(r.entrepriseAdresse, 300) : null,
      nda_region: r.aNda === "oui" ? vide(r.ndaRegion, 100) : null,
      linkedin_url: normaliseLinkedin(r.linkedin),
    },
  };
}

// ——— Lecture tolérante d'un questionnaire stocké (jsonb) ——————————————————

const idsDe = <T extends { id: string }>(liste: readonly T[]) =>
  new Set<string>(liste.map((x) => x.id));
const DOMAINES_IDS = idsDe(DOMAINES);
const PUBLICS_IDS = idsDe(PUBLICS);
const MODALITES_IDS = idsDe(MODALITES);
const EXPERIENCES_IDS = idsDe(EXPERIENCES);
const STRUCTURES_IDS = idsDe(STATUTS_STRUCTURE);

function tableau<T extends string>(v: unknown, ids: Set<string>): T[] {
  return Array.isArray(v) ? (v.filter((x) => typeof x === "string" && ids.has(x)) as T[]) : [];
}
function chaine(v: unknown, max = 300): string | null {
  return typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;
}

export type QuestionnaireStocke = Questionnaire & {
  entreprise: string | null;
  entreprise_adresse: string | null;
  nda_region: string | null;
  linkedin_url: string | null;
};

export function lireQuestionnaire(json: unknown): QuestionnaireStocke | null {
  if (!json || typeof json !== "object" || Array.isArray(json)) return null;
  const o = json as Record<string, unknown>;
  const experience = typeof o["experience"] === "string" ? o["experience"] : "";
  const structure = typeof o["statut_structure"] === "string" ? o["statut_structure"] : "";
  return {
    version: typeof o["version"] === "number" ? o["version"] : QUESTIONNAIRE_VERSION,
    domaines: tableau<DomaineId>(o["domaines"], DOMAINES_IDS),
    domaine_autre: chaine(o["domaine_autre"], 120),
    specialite: chaine(o["specialite"], 200),
    experience: EXPERIENCES_IDS.has(experience) ? (experience as ExperienceId) : null,
    publics: tableau<PublicId>(o["publics"], PUBLICS_IDS),
    modalites: tableau<ModaliteId>(o["modalites"], MODALITES_IDS),
    zone: chaine(o["zone"], 150),
    statut_structure: STRUCTURES_IDS.has(structure) ? (structure as StatutStructureId) : null,
    entreprise: chaine(o["entreprise"], 150),
    entreprise_adresse: chaine(o["entreprise_adresse"], 300),
    nda_region: chaine(o["nda_region"], 100),
    linkedin_url: chaine(o["linkedin_url"], 300),
  };
}

/** Résumé lisible (libellé + valeurs) pour l'affichage en badges (admin, profil). */
export function resumeQuestionnaire(json: unknown): { label: string; valeurs: string[] }[] {
  const q = lireQuestionnaire(json);
  if (!q) return [];
  const lib = <T extends { id: string; label: string }>(liste: readonly T[], ids: string[]) =>
    ids.map((id) => liste.find((x) => x.id === id)?.label ?? id);
  const lignes = [
    { label: "Domaines", valeurs: libellesDomaines(q) },
    { label: "Expérience", valeurs: q.experience ? lib(EXPERIENCES, [q.experience]) : [] },
    { label: "Publics", valeurs: lib(PUBLICS, q.publics) },
    { label: "Modalités", valeurs: lib(MODALITES, q.modalites) },
    { label: "Zone d'intervention", valeurs: q.zone ? [q.zone] : [] },
    {
      label: "Structure",
      valeurs: q.statut_structure ? lib(STATUTS_STRUCTURE, [q.statut_structure]) : [],
    },
  ];
  return lignes.filter((l) => l.valeurs.length > 0);
}

// ——— Rattachement au profil (utilisé côté serveur) ——————————————————————

type ProfilExistant = Record<string, unknown>;
type CandidatureSource = Record<string, unknown>;

/**
 * Chemin d'une pièce déposée sans compte, tel que /candidature le produit
 * (`public/<identifiant>/<pièce>-<nom>`). Tout autre chemin (dossier d'un autre utilisateur,
 * « .. », URL) est ignoré : une candidature anonyme ne doit jamais pointer vers un fichier tiers.
 */
export function cheminPiece(v: unknown): string | null {
  if (typeof v !== "string") return null;
  return /^public\/[\w-]{6,64}\/(cv|parcours|deroule)-[\w.-]{1,90}$/.test(v) && !v.includes("..")
    ? v
    : null;
}

const estVide = (v: unknown) =>
  v === null ||
  v === undefined ||
  (typeof v === "string" && v.trim() === "") ||
  (typeof v === "object" && !Array.isArray(v) && Object.keys(v as object).length === 0);

/**
 * Champs du profil à compléter depuis une candidature : seuls les champs VIDES du profil sont
 * remplis (jamais d'écrasement d'une saisie du formateur).
 */
export function complementProfil(
  profil: ProfilExistant,
  candidature: CandidatureSource,
): Record<string, unknown> {
  const q = lireQuestionnaire(candidature["questionnaire"]);
  const sources: Record<string, unknown> = {
    telephone: chaine(candidature["telephone"], 30),
    expertise: chaine(candidature["expertise"], 200),
    siret: chaine(candidature["siret"], 14),
    numero_nda: chaine(candidature["numero_nda"], 30),
    cv_url: cheminPiece(candidature["cv_url"]),
    parcours_formation_url: cheminPiece(candidature["parcours_formation_url"]),
    deroule_pedagogique_url: cheminPiece(candidature["deroule_pedagogique_url"]),
    entreprise: q?.entreprise ?? null,
    entreprise_adresse: q?.entreprise_adresse ?? null,
    nda_region: q?.nda_region ?? null,
    linkedin_url: q?.linkedin_url ?? null,
    secteur_activite: q && q.domaines.length ? libellesDomaines(q).join(", ").slice(0, 200) : null,
    questionnaire: candidature["questionnaire"] ?? null,
  };
  const patch: Record<string, unknown> = {};
  for (const [cle, valeur] of Object.entries(sources)) {
    if (estVide(valeur)) continue;
    if (cle in profil && !estVide(profil[cle])) continue;
    // Colonne `questionnaire` absente côté profil (migration non appliquée) : on ne l'ajoute pas.
    if (cle === "questionnaire" && !("questionnaire" in profil)) continue;
    patch[cle] = valeur;
  }
  return patch;
}

// ——— Sauvegarde locale ————————————————————————————————————————————————

export const CLE_BROUILLON = "s4m-candidature-brouillon-v1";

export type Brouillon = { etape: number; reponses: Reponses; enregistreLe: string };

export function serialiserBrouillon(etape: number, r: Reponses, maintenant = new Date()): string {
  return JSON.stringify({ etape, reponses: r, enregistreLe: maintenant.toISOString() });
}

/** Relit un brouillon en ne gardant que des valeurs du bon type (tolère les vieux formats). */
export function lireBrouillon(brut: string | null): Brouillon | null {
  if (!brut) return null;
  let o: unknown;
  try {
    o = JSON.parse(brut);
  } catch {
    return null;
  }
  if (!o || typeof o !== "object") return null;
  const b = o as Record<string, unknown>;
  const src = (b["reponses"] ?? {}) as Record<string, unknown>;
  if (typeof src !== "object") return null;
  const r: Reponses = { ...REPONSES_VIDES };
  const s = (k: keyof Reponses, max = 1500) => {
    const v = src[k];
    return typeof v === "string" ? v.slice(0, max) : "";
  };
  r.prenom = s("prenom", 80);
  r.nom = s("nom", 80);
  r.email = s("email", 255);
  r.telephone = s("telephone", 30);
  r.domaines = tableau<DomaineId>(src["domaines"], DOMAINES_IDS);
  r.domaineAutre = s("domaineAutre", 120);
  r.specialite = s("specialite", 200);
  r.experience = EXPERIENCES_IDS.has(s("experience")) ? (s("experience") as ExperienceId) : "";
  r.publics = tableau<PublicId>(src["publics"], PUBLICS_IDS);
  r.modalites = tableau<ModaliteId>(src["modalites"], MODALITES_IDS);
  r.zone = s("zone", 150);
  r.linkedin = s("linkedin", 300);
  r.statutStructure = STRUCTURES_IDS.has(s("statutStructure"))
    ? (s("statutStructure") as StatutStructureId)
    : "";
  r.entreprise = s("entreprise", 150);
  r.siret = s("siret", 20);
  r.entrepriseAdresse = s("entrepriseAdresse", 300);
  r.aNda = s("aNda") === "oui" || s("aNda") === "non" ? (s("aNda") as "oui" | "non") : "";
  r.numeroNda = s("numeroNda", 20);
  r.ndaRegion = s("ndaRegion", 100);
  r.engagement = src["engagement"] === true;
  r.message = s("message", 1500);
  const etape = typeof b["etape"] === "number" ? Math.floor(b["etape"]) : 0;
  return {
    etape: Math.min(Math.max(etape, 0), NB_ETAPES - 1),
    reponses: r,
    enregistreLe: typeof b["enregistreLe"] === "string" ? b["enregistreLe"] : "",
  };
}

/** Un brouillon mérite d'être proposé à la reprise s'il contient au moins une réponse. */
export function brouillonUtile(b: Brouillon | null): boolean {
  if (!b) return false;
  const r = b.reponses;
  return Boolean(r.prenom || r.nom || r.email || r.domaines.length || r.experience);
}

/** Échappe les jokers LIKE pour une comparaison d'e-mail insensible à la casse (ilike). */
export function motifEmailExact(email: string): string {
  return email
    .trim()
    .toLowerCase()
    .replace(/[\\%_]/g, (c) => `\\${c}`);
}
