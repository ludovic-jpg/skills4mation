import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Calculator,
  Check,
  CornerDownLeft,
  Eye,
  EyeOff,
  HeartPulse,
  Languages,
  Laptop,
  Loader2,
  MailCheck,
  MessagesSquare,
  MonitorSmartphone,
  PencilLine,
  Scale,
  ShieldCheck,
  Sparkles,
  Store,
  UserRound,
  Users,
  X,
} from "lucide-react";

import entreeApprenant from "@/assets/entree-apprenant.jpg";
import entreeFormateur from "@/assets/entree-formateur.jpg";
import formateurWebapp from "@/assets/formateur-webapp.jpg";
import formatriceTablette from "@/assets/formatrice-tablette.jpg";
import heroFormation from "@/assets/hero-formation.jpg";
import homeHero from "@/assets/home-hero.jpg";
import peopleEquipe from "@/assets/people-equipe.jpg";
import portageHero from "@/assets/portage-hero.jpg";
import { Logo } from "@/components/Brand";
import { ChampTexte, ChoixCartes, MessageErreur, ZoneDepot } from "@/components/candidature/Champs";
import { SiretAutocomplete, toastChampsRemplis } from "@/components/app/SiretAutocomplete";
import { Combobox } from "@/components/dossier/fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import {
  CLE_BROUILLON,
  CLE_JETON,
  PARAM_JETON,
  hacherJeton,
  DOMAINES,
  ETAPES,
  EXPERIENCES,
  MODALITES,
  NB_ETAPES,
  PIECES,
  PUBLICS,
  REPONSES_VIDES,
  STATUTS_STRUCTURE,
  brouillonUtile,
  lireBrouillon,
  libellesDomaines,
  construireQuestionnaire,
  motDePasseValide,
  premiereEtapeInvalide,
  progression,
  reglesMotDePasse,
  serialiserBrouillon,
  validerEtape,
  versCandidature,
  type Brouillon,
  type Erreurs,
  type PieceName,
  type Reponses,
} from "@/lib/candidature-questionnaire";
import type { EntrepriseTrouvee } from "@/lib/entreprises";
import { REGIONS_FR } from "@/lib/referentiels";
import { rattacherCandidature } from "@/lib/candidature.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/candidature")({
  head: () => ({
    meta: [
      { title: "Devenir formateur partenaire — Candidature Skills4mation" },
      {
        name: "description",
        content:
          "Candidatez au réseau de formateurs Skills4mation en 5 minutes : présentez votre expertise, déposez vos pièces et créez votre accès à l'espace formateur (portage Qualiopi).",
      },
      { property: "og:title", content: "Devenir formateur partenaire Skills4mation" },
      {
        property: "og:description",
        content: "Rejoignez le réseau : nous portons votre administratif Qualiopi.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://skills4mation.com/candidature" },
    ],
    links: [{ rel: "canonical", href: "https://skills4mation.com/candidature" }],
  }),
  component: CandidaturePage,
});

// ——— Mise en scène de chaque étape ————————————————————————————————————————

const SCENES: { image: string; alt: string; message: string; question: string; aide: string }[] = [
  {
    image: formatriceTablette,
    alt: "Formatrice souriante, tablette en main, au milieu de ses stagiaires",
    message: "Cinq minutes pour vous présenter, et nous portons le reste.",
    question: "Faisons connaissance",
    aide: "Ces coordonnées permettent à notre équipe de vous recontacter.",
  },
  {
    image: entreeFormateur,
    alt: "Formateur animant une séance devant un tableau, face à un groupe attentif",
    message: "Votre expertise est le point de départ de chaque formation que nous porterons.",
    question: "Dans quels domaines formez-vous ?",
    aide: "Sélectionnez tous ceux qui vous correspondent.",
  },
  {
    image: homeHero,
    alt: "Groupe de stagiaires en salle de formation lumineuse",
    message: "Débutant ou chevronné : le portage s'adapte à votre rythme.",
    question: "Votre expérience de formateur",
    aide: "Pour orienter les bons projets vers vous.",
  },
  {
    image: heroFormation,
    alt: "Formatrice échangeant avec des participants autour d'une table de réunion",
    message: "En salle, à distance ou les deux : vous gardez votre façon de transmettre.",
    question: "Comment aimez-vous former ?",
    aide: "Vos modalités et votre zone d'intervention.",
  },
  {
    image: formateurWebapp,
    alt: "Formateur indépendant souriant devant son ordinateur portable",
    message: "Pas encore de structure ? Nous vous aidons à choisir la bonne.",
    question: "Votre structure",
    aide: "Le SIRET remplit automatiquement votre fiche depuis l'annuaire officiel.",
  },
  {
    image: portageHero,
    alt: "Formatrice relisant ses documents pédagogiques à son bureau",
    message: "Trois documents suffisent pour que notre équipe pédagogique étudie votre profil.",
    question: "Vos trois pièces",
    aide: "PDF, Word ou PowerPoint, 10 Mo maximum chacune. Transmises de façon confidentielle.",
  },
  {
    image: peopleEquipe,
    alt: "Équipe de formateurs souriants réunis autour d'un ordinateur",
    message: "Un réseau exigeant, au service d'apprenants qui comptent sur nous.",
    question: "Nos engagements communs",
    aide: "La qualité Qualiopi repose sur chacun des formateurs du réseau.",
  },
  {
    image: entreeApprenant,
    alt: "Formatrice se connectant à son espace en ligne depuis son ordinateur",
    message: "Votre espace formateur vous attend : dossiers, pièces et signatures en ligne.",
    question: "Créez votre accès",
    aide: "Vérifiez vos réponses, puis choisissez comment vous connecter.",
  },
];

const ICONES_DOMAINES = {
  management: Users,
  digital: Sparkles,
  langues: Languages,
  compta: Calculator,
  rh: Scale,
  commercial: Briefcase,
  bureautique: Laptop,
  securite: ShieldCheck,
  bien_etre: HeartPulse,
  autre: PencilLine,
} as const;

const ICONES_MODALITES = {
  presentiel: Users,
  distanciel: MonitorSmartphone,
  mixte: MessagesSquare,
} as const;

const ICONES_STRUCTURE = { micro: UserRound, societe: Building2, aucune: Store } as const;

const OPTIONS_DOMAINES = DOMAINES.map((d) => ({ ...d, icone: ICONES_DOMAINES[d.id] }));
const OPTIONS_MODALITES = MODALITES.map((m) => ({ ...m, icone: ICONES_MODALITES[m.id] }));
const OPTIONS_STRUCTURE = STATUTS_STRUCTURE.map((s) => ({ ...s, icone: ICONES_STRUCTURE[s.id] }));

type Phase =
  | { type: "saisie" }
  | { type: "envoi"; libelle: string }
  | { type: "verifier"; email: string }
  | { type: "existant"; email: string };

function nouvelId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  // Repli (navigateurs anciens) : format UUID v4 à partir de getRandomValues.
  const o = crypto.getRandomValues(new Uint8Array(16));
  o[6] = (o[6]! & 0x0f) | 0x40;
  o[8] = (o[8]! & 0x3f) | 0x80;
  const h = [...o].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function lireStockage(): Brouillon | null {
  try {
    return lireBrouillon(window.localStorage.getItem(CLE_BROUILLON));
  } catch {
    return null;
  }
}
function ecrireStockage(valeur: string | null) {
  try {
    if (valeur === null) window.localStorage.removeItem(CLE_BROUILLON);
    else window.localStorage.setItem(CLE_BROUILLON, valeur);
  } catch {
    /* stockage indisponible (navigation privée) : la saisie continue sans sauvegarde */
  }
}

function CandidaturePage() {
  const router = useRouter();
  const { session, refresh } = useAuth();
  const [etape, setEtape] = useState(0);
  const [r, setR] = useState<Reponses>(REPONSES_VIDES);
  const [fichiers, setFichiers] = useState<Partial<Record<PieceName, File>>>({});
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [phase, setPhase] = useState<Phase>({ type: "saisie" });
  const [depuisRecap, setDepuisRecap] = useState(false);
  const [brouillon, setBrouillon] = useState<Brouillon | null>(null);
  const [pret, setPret] = useState(false);
  const [mdp, setMdp] = useState("");
  const [voirMdp, setVoirMdp] = useState(false);
  const [annonce, setAnnonce] = useState("");
  const titreRef = useRef<HTMLHeadingElement>(null);
  const premierRendu = useRef(true);
  /** E-mail pour lequel la candidature a déjà été enregistrée (évite les doublons en cas de nouvel essai). */
  const envoyeePour = useRef<{ email: string; jeton: string } | null>(null);
  /** Pièces déjà déposées (même dossier et mêmes chemins si l'on renvoie après un échec partiel). */
  const depots = useRef<{
    prefix: string;
    pieces: Partial<Record<PieceName, { file: File; chemin: string }>>;
  }>({ prefix: nouvelId(), pieces: {} });
  const verrou = useRef(false);

  // Reprise d'un questionnaire interrompu.
  useEffect(() => {
    const b = lireStockage();
    if (brouillonUtile(b)) setBrouillon(b);
    else setPret(true);
  }, []);

  // Sauvegarde locale (sans fichiers ni mot de passe), une fois la reprise tranchée.
  useEffect(() => {
    if (!pret || phase.type !== "saisie") return;
    ecrireStockage(serialiserBrouillon(etape, r));
  }, [r, etape, pret, phase.type]);

  // Changement d'étape : focus sur la question + annonce pour les lecteurs d'écran.
  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    titreRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
    setAnnonce(`Étape ${etape + 1} sur ${NB_ETAPES} : ${SCENES[etape]?.question ?? ""}`);
  }, [etape]);

  function maj<K extends keyof Reponses>(cle: K, valeur: Reponses[K]) {
    setR((prev) => ({ ...prev, [cle]: valeur }));
    if (erreurs[cle]) setErreurs(({ [cle]: _retire, ...reste }) => reste);
  }

  function focusPremiereErreur(e: Erreurs) {
    const cle = Object.keys(e)[0];
    if (!cle) return;
    requestAnimationFrame(() => {
      const el =
        document.getElementById(`q-${cle}`) ??
        document.querySelector<HTMLElement>(`[data-champ="${cle}"] input`);
      el?.focus();
    });
  }

  function allerA(i: number) {
    setErreurs({});
    setEtape(Math.min(Math.max(i, 0), NB_ETAPES - 1));
  }

  function continuer() {
    const e = validerEtape(etape, r, fichiers);
    setErreurs(e);
    if (Object.keys(e).length > 0) {
      setAnnonce(`${Object.keys(e).length} point(s) à corriger avant de continuer.`);
      focusPremiereErreur(e);
      return;
    }
    if (depuisRecap) {
      setDepuisRecap(false);
      allerA(NB_ETAPES - 1);
      return;
    }
    allerA(etape + 1);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Enter" || event.defaultPrevented || event.shiftKey) return;
    const cible = event.target as HTMLElement;
    if (cible.tagName === "TEXTAREA" || cible.tagName === "BUTTON" || cible.tagName === "A") return;
    if (cible.getAttribute("role") === "combobox") return;
    if (etape === NB_ETAPES - 1) return; // dernière étape : le formulaire soumet nativement
    event.preventDefault();
    continuer();
  }

  function remplirEntreprise(e: EntrepriseTrouvee) {
    setR((prev) => ({
      ...prev,
      siret: e.siret,
      entreprise: e.raisonSociale.slice(0, 150),
      entrepriseAdresse: (e.adresseComplete || prev.entrepriseAdresse).slice(0, 300),
    }));
    setErreurs(({ siret: _s, ...reste }) => reste);
    toastChampsRemplis(e, [
      "raison sociale",
      "SIRET",
      ...(e.adresseComplete ? ["adresse de l'entreprise"] : []),
    ]);
  }

  // ——— Envoi —————————————————————————————————————————————————————

  /** E-mail effectivement utilisé : celui du compte si l'on est déjà connecté. */
  const emailCompte = session?.user?.email?.trim().toLowerCase() ?? null;
  const emailEnvoi = () => emailCompte ?? r.email.trim().toLowerCase();

  /** Retourne le chemin d'une pièce, en réutilisant un envoi déjà réussi du même fichier. */
  async function envoyerPiece(nom: PieceName, f: File) {
    const deja = depots.current.pieces[nom];
    if (deja && deja.file === f) return deja.chemin;
    const sur = f.name.replace(/[^\w.-]+/g, "_").slice(-80);
    const chemin = `public/${depots.current.prefix}/${nom}-${sur}`;
    const { error } = await supabase.storage
      .from("candidatures")
      .upload(chemin, f, { contentType: f.type || "application/octet-stream", upsert: false });
    // 409 : déjà déposé lors d'un essai précédent interrompu → on garde le chemin.
    if (error && !/exist|duplicate/i.test(error.message)) throw error;
    depots.current.pieces[nom] = { file: f, chemin };
    return chemin;
  }

  /**
   * Enregistre la candidature (pièces + ligne) une seule fois par adresse e-mail, avec
   * l'empreinte du jeton de réclamation. Le secret reste dans ce navigateur et dans les URL
   * de retour : c'est lui qui autorise la recopie des données dans le profil.
   */
  async function enregistrerCandidature(): Promise<string | null> {
    const email = emailEnvoi();
    if (envoyeePour.current?.email === email) return envoyeePour.current.jeton;
    setPhase({ type: "envoi", libelle: "Envoi de vos pièces…" });
    let urls;
    try {
      urls = {
        cv_url: await envoyerPiece("cv", fichiers.cv!),
        parcours_formation_url: await envoyerPiece("parcours", fichiers.parcours!),
        deroule_pedagogique_url: await envoyerPiece("deroule", fichiers.deroule!),
      };
    } catch {
      setPhase({ type: "saisie" });
      toast.error("L'envoi de vos pièces a échoué. Vérifiez votre connexion et réessayez.");
      return null;
    }
    setPhase({ type: "envoi", libelle: "Enregistrement de votre candidature…" });
    const jeton = nouvelId();
    const ligne: Record<string, unknown> = {
      ...versCandidature({ ...r, email }, urls),
      jeton_hash: await hacherJeton(jeton),
    };
    let { error } = await supabase.from("candidatures").insert(ligne as never);
    // Colonnes pas encore déployées (42703) : on retire la colonne manquante et on réessaie.
    // Sans `jeton_hash`, le rattachement sera « simple » (aucune recopie dans le profil).
    for (let essai = 0; essai < 2 && error?.code === "42703"; essai++) {
      const manquante = ["questionnaire", "jeton_hash"].find((c) => error?.message.includes(c));
      if (manquante) delete ligne[manquante];
      else {
        delete ligne["questionnaire"];
        delete ligne["jeton_hash"];
      }
      ({ error } = await supabase.from("candidatures").insert(ligne as never));
    }
    if (error) {
      setPhase({ type: "saisie" });
      toast.error("Votre candidature n'a pas pu être enregistrée. Merci de réessayer.");
      return null;
    }
    envoyeePour.current = { email, jeton };
    ecrireStockage(null);
    try {
      window.localStorage.setItem(CLE_JETON, jeton);
    } catch {
      /* le jeton voyage aussi dans l'URL de retour */
    }
    return jeton;
  }

  function verifierAvantEnvoi(): boolean {
    const i = premiereEtapeInvalide(r, fichiers);
    if (i === -1) return true;
    const e = validerEtape(i, r, fichiers);
    setDepuisRecap(true);
    setEtape(i);
    setErreurs(e);
    toast.error("Il manque une réponse : complétez cette étape pour finaliser.");
    return false;
  }

  const retourEspace = (jeton: string) =>
    `${window.location.origin}/espace?${PARAM_JETON}=${encodeURIComponent(jeton)}`;

  /** Verrou synchrone contre la double soumission (double clic, Entrée + clic). */
  async function avecVerrou(action: () => Promise<void>) {
    if (verrou.current) return;
    verrou.current = true;
    try {
      await action();
    } finally {
      verrou.current = false;
    }
  }

  async function creerAvecMotDePasse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await avecVerrou(async () => {
      if (!verifierAvantEnvoi()) return;
      if (emailCompte) {
        await envoyerConnecte();
        return;
      }
      if (!motDePasseValide(mdp)) {
        setErreurs({ mdp: "Choisissez un mot de passe qui respecte les trois règles." });
        document.getElementById("q-mdp")?.focus();
        return;
      }
      const jeton = await enregistrerCandidature();
      if (!jeton) return;

      setPhase({ type: "envoi", libelle: "Création de votre accès…" });
      const email = emailEnvoi();
      const { data, error } = await supabase.auth.signUp({
        email,
        password: mdp,
        options: {
          data: { prenom: r.prenom.trim(), nom: r.nom.trim() },
          emailRedirectTo: retourEspace(jeton),
        },
      });
      const dejaInscrit =
        (error &&
          (error.code === "user_already_exists" ||
            /already (registered|exists)/i.test(error.message))) ||
        (!error && data.user && (data.user.identities?.length ?? 0) === 0);
      if (dejaInscrit) {
        setPhase({ type: "existant", email });
        return;
      }
      if (error) {
        setPhase({ type: "saisie" });
        const faible = error.code === "weak_password" || /password/i.test(error.message);
        if (faible) {
          setErreurs({
            mdp: "Ce mot de passe est trop facile à deviner : choisissez-en un autre.",
          });
        }
        toast.error(
          faible
            ? "Mot de passe refusé. Votre candidature est bien enregistrée : choisissez-en un autre."
            : "La création de votre accès a échoué. Votre candidature est bien enregistrée : réessayez.",
        );
        return;
      }
      if (data.session) {
        toast.success("Bienvenue ! Votre candidature est entre les mains de notre équipe.");
        void router.navigate({ to: "/espace" });
        return;
      }
      setPhase({ type: "verifier", email });
    });
  }

  /** Déjà connecté : enregistrement, rattachement immédiat, puis l'espace formateur. */
  async function envoyerConnecte() {
    const jeton = await enregistrerCandidature();
    if (!jeton) return;
    setPhase({ type: "envoi", libelle: "Mise à jour de votre profil…" });
    try {
      const res = await rattacherCandidature({ data: { jeton } });
      if (res.statut === "complet" || res.statut === "simple") {
        try {
          window.localStorage.removeItem(CLE_JETON);
        } catch {
          /* sans effet */
        }
      }
      await refresh();
    } catch {
      /* le rattachement sera retenté à l'arrivée dans l'espace */
    }
    toast.success("Candidature envoyée : notre équipe revient vers vous rapidement.");
    void router.navigate({ to: "/espace" });
  }

  async function creerAvecGoogle() {
    await avecVerrou(async () => {
      if (!verifierAvantEnvoi()) return;
      const jeton = await enregistrerCandidature();
      if (!jeton) return;
      setPhase({ type: "envoi", libelle: "Redirection vers Google…" });
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: retourEspace(jeton),
      });
      if (result.error) {
        setPhase({ type: "saisie" });
        toast.error(
          "Connexion Google indisponible. Votre candidature est enregistrée : créez un mot de passe.",
        );
      }
    });
  }

  // ——— Rendu ————————————————————————————————————————————————————

  const scene = SCENES[etape] ?? SCENES[0]!;
  const fin = phase.type === "verifier" || phase.type === "existant";
  const imageIndex = fin ? 6 : etape;
  const occupe = phase.type === "envoi";
  const derniere = etape === NB_ETAPES - 1;

  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Visuel d'étape : bandeau compact sur mobile, demi-écran fixe sur grand écran. */}
      <aside className="relative h-40 overflow-hidden bg-primary sm:h-52 lg:sticky lg:top-0 lg:h-dvh">
        {SCENES.map((s, i) => (
          <img
            key={s.image}
            src={s.image}
            alt={i === imageIndex ? s.alt : ""}
            aria-hidden={i === imageIndex ? undefined : true}
            width={1600}
            height={1104}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            className={cn(
              "absolute inset-0 size-full object-cover transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none",
              i === imageIndex ? "scale-100 opacity-100" : "scale-[1.03] opacity-0",
            )}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.25_0.06_158)]/90 via-[oklch(0.3_0.07_158)]/35 to-transparent lg:via-[oklch(0.3_0.07_158)]/25" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6 lg:p-12">
          <p
            key={fin ? "fin" : etape}
            className="max-w-md font-display text-base leading-snug font-semibold text-balance motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700 sm:text-xl lg:text-[2rem] lg:leading-[1.15]"
          >
            {fin ? "Bienvenue dans le réseau Skills4mation." : scene.message}
          </p>
          <ol
            className="mt-8 hidden gap-2 text-sm lg:grid"
            aria-label="Les étapes de la candidature"
          >
            {ETAPES.map((e, i) => {
              const etat = fin || i < etape ? "fait" : i === etape ? "actif" : "avenir";
              return (
                <li
                  key={e.id}
                  className={cn(
                    "flex items-center gap-3 transition-opacity",
                    etat === "avenir" ? "opacity-55" : "opacity-100",
                  )}
                  aria-current={etat === "actif" ? "step" : undefined}
                >
                  <span
                    className={cn(
                      "inline-flex size-6 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums",
                      etat === "fait" && "bg-white/90 text-primary",
                      etat === "actif" && "bg-cta text-cta-foreground",
                      etat === "avenir" && "border border-white/50",
                    )}
                  >
                    {etat === "fait" ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={etat === "actif" ? "font-semibold" : undefined}>{e.titre}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </aside>

      <main className="flex min-h-[calc(100dvh-10rem)] flex-col sm:min-h-[calc(100dvh-13rem)] lg:min-h-dvh">
        <header className="flex items-center justify-between gap-4 px-4 pt-5 sm:px-8 lg:px-14 lg:pt-8">
          <div className="w-36 sm:w-44">
            <Logo />
          </div>
          {session ? (
            <Link
              to="/espace"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Mon espace
            </Link>
          ) : (
            <Link
              to="/auth"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Déjà inscrit&nbsp;? <span className="font-medium text-primary">Se connecter</span>
            </Link>
          )}
        </header>

        {!fin ? (
          <div className="px-4 pt-6 sm:px-8 lg:px-14 lg:pt-10">
            <div className="mx-auto max-w-xl">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-semibold text-primary tabular-nums">
                  Étape {etape + 1}/{NB_ETAPES}
                </span>
                <span className="text-muted-foreground">{ETAPES[etape]?.titre}</span>
              </div>
              <div
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label="Progression de la candidature"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progression(etape)}
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out motion-reduce:transition-none"
                  style={{ width: `${progression(etape)}%` }}
                />
              </div>
            </div>
          </div>
        ) : null}

        <p className="sr-only" aria-live="polite" role="status">
          {annonce}
        </p>

        <div className="flex flex-1 items-start px-4 py-8 sm:px-8 lg:items-center lg:px-14 lg:py-10">
          <div className="mx-auto w-full max-w-xl">
            {phase.type === "verifier" ? (
              <EcranFinal
                icone={<MailCheck className="size-7" aria-hidden />}
                titre="Vérifiez votre boîte mail"
                texte={
                  <>
                    Nous venons d'envoyer un lien de confirmation à{" "}
                    <strong className="text-foreground">{phase.email}</strong>. Cliquez dessus pour
                    activer votre accès : vous arriverez directement dans votre espace formateur.
                  </>
                }
                etapes={[
                  "Votre candidature et vos pièces sont bien enregistrées.",
                  "Confirmez votre adresse e-mail depuis le lien reçu (pensez aux indésirables).",
                  "Notre équipe étudie votre profil et revient vers vous sous 48 h ouvrées.",
                ]}
              />
            ) : phase.type === "existant" ? (
              <EcranFinal
                icone={<UserRound className="size-7" aria-hidden />}
                titre="Vous avez déjà un compte"
                texte={
                  <>
                    Un accès existe déjà pour{" "}
                    <strong className="text-foreground">{phase.email}</strong>. Votre candidature
                    est bien enregistrée : connectez-vous pour la retrouver dans votre espace.
                  </>
                }
                action={
                  <Button asChild variant="cta" size="lg">
                    <Link to="/auth">
                      Se connecter <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </Button>
                }
              />
            ) : (
              <>
                {brouillon && !pret ? (
                  <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-primary/25 bg-accent/60 p-4 sm:flex-row sm:items-center">
                    <p className="flex-1 text-sm">
                      <span className="font-semibold">Vous aviez commencé votre candidature.</span>{" "}
                      Reprendre là où vous vous étiez arrêté ?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          setR(brouillon.reponses);
                          setEtape(Math.min(brouillon.etape, 5));
                          setBrouillon(null);
                          setPret(true);
                        }}
                      >
                        Reprendre
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          ecrireStockage(null);
                          setBrouillon(null);
                          setPret(true);
                        }}
                      >
                        Recommencer
                      </Button>
                    </div>
                  </div>
                ) : null}

                <form
                  noValidate
                  onKeyDown={onKeyDown}
                  onSubmit={(e) => {
                    if (derniere) void creerAvecMotDePasse(e);
                    else {
                      e.preventDefault();
                      continuer();
                    }
                  }}
                >
                  <div
                    key={etape}
                    className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500"
                  >
                    <h1
                      ref={titreRef}
                      tabIndex={-1}
                      className="font-display text-[1.7rem] leading-tight font-semibold tracking-tight text-foreground outline-none sm:text-[2.1rem]"
                    >
                      {scene.question}
                    </h1>
                    <p className="mt-2 text-[0.95rem] text-muted-foreground">{scene.aide}</p>

                    <div className="mt-8 grid gap-6 [&>*]:min-w-0">
                      <Etape
                        etape={etape}
                        r={r}
                        maj={maj}
                        erreurs={erreurs}
                        fichiers={fichiers}
                        setFichier={(nom, f) => {
                          setFichiers((prev) => ({ ...prev, [nom]: f }));
                          if (erreurs[nom]) setErreurs(({ [nom]: _x, ...reste }) => reste);
                        }}
                        remplirEntreprise={remplirEntreprise}
                        allerA={(i) => {
                          setDepuisRecap(true);
                          allerA(i);
                        }}
                        mdp={mdp}
                        setMdp={(v) => {
                          setMdp(v);
                          if (erreurs["mdp"]) setErreurs(({ mdp: _m, ...reste }) => reste);
                        }}
                        voirMdp={voirMdp}
                        setVoirMdp={setVoirMdp}
                        emailCompte={emailCompte}
                      />
                    </div>
                  </div>

                  {derniere ? (
                    <div className="mt-6 grid gap-3 [&>*]:min-w-0">
                      <Button
                        type="submit"
                        variant="cta"
                        size="lg"
                        className="h-auto min-h-12 w-full py-3 text-base whitespace-normal"
                        disabled={occupe}
                      >
                        {occupe ? (
                          <>
                            <Loader2 className="size-4 animate-spin" aria-hidden />
                            {phase.libelle}
                          </>
                        ) : emailCompte ? (
                          "Envoyer ma candidature"
                        ) : (
                          "Créer mon accès et envoyer ma candidature"
                        )}
                      </Button>
                      {emailCompte ? null : (
                        <>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="h-px flex-1 bg-border" /> ou
                            <span className="h-px flex-1 bg-border" />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="h-auto min-h-12 w-full py-3 text-base whitespace-normal"
                            disabled={occupe}
                            onClick={() => void creerAvecGoogle()}
                          >
                            <GoogleG /> Continuer avec Google
                          </Button>
                          <p className="-mt-1 text-center text-xs text-muted-foreground">
                            Utilisez le compte Google associé à{" "}
                            <span className="font-medium text-foreground">{r.email.trim()}</span>
                          </p>
                        </>
                      )}
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        Vos données servent uniquement à l'étude de votre candidature et à votre
                        espace formateur.{" "}
                        <Link
                          to="/politique-de-confidentialite"
                          className="underline underline-offset-2"
                        >
                          Politique de confidentialité
                        </Link>
                        .
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-10 flex items-center gap-3">
                    {etape > 0 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setDepuisRecap(false);
                          allerA(etape - 1);
                        }}
                        disabled={occupe}
                        className="px-3"
                      >
                        <ArrowLeft className="size-4" aria-hidden /> Retour
                      </Button>
                    ) : null}
                    {!derniere ? (
                      <>
                        <Button
                          type="submit"
                          variant="cta"
                          size="lg"
                          className="ml-auto h-12 px-7 text-base"
                        >
                          {depuisRecap ? "Revenir au récapitulatif" : "Continuer"}
                          <ArrowRight className="size-4" aria-hidden />
                        </Button>
                        <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                          ou{" "}
                          <kbd className="inline-flex items-center gap-1 rounded-md border bg-muted px-1.5 py-0.5 font-sans text-[11px]">
                            Entrée <CornerDownLeft className="size-3" aria-hidden />
                          </kbd>
                        </span>
                      </>
                    ) : null}
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ——— Contenu de chaque étape ————————————————————————————————————————————

function Etape({
  etape,
  r,
  maj,
  erreurs,
  fichiers,
  setFichier,
  remplirEntreprise,
  allerA,
  mdp,
  setMdp,
  voirMdp,
  setVoirMdp,
  emailCompte,
}: {
  etape: number;
  r: Reponses;
  maj: <K extends keyof Reponses>(cle: K, valeur: Reponses[K]) => void;
  erreurs: Erreurs;
  fichiers: Partial<Record<PieceName, File>>;
  setFichier: (nom: PieceName, f: File | undefined) => void;
  remplirEntreprise: (e: EntrepriseTrouvee) => void;
  allerA: (i: number) => void;
  mdp: string;
  setMdp: (v: string) => void;
  voirMdp: boolean;
  setVoirMdp: (v: boolean) => void;
  emailCompte: string | null;
}) {
  switch (ETAPES[etape]?.id) {
    case "identite":
      return (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <ChampTexte
              id="q-prenom"
              label="Prénom"
              value={r.prenom}
              onChange={(e) => maj("prenom", e.target.value)}
              error={erreurs["prenom"]}
              autoComplete="given-name"
              maxLength={80}
              autoFocus
            />
            <ChampTexte
              id="q-nom"
              label="Nom"
              value={r.nom}
              onChange={(e) => maj("nom", e.target.value)}
              error={erreurs["nom"]}
              autoComplete="family-name"
              maxLength={80}
            />
          </div>
          <ChampTexte
            id="q-email"
            label="Adresse e-mail"
            type="email"
            inputMode="email"
            value={r.email}
            onChange={(e) => maj("email", e.target.value)}
            error={erreurs["email"]}
            autoComplete="email"
            aide="Elle deviendra votre identifiant de connexion."
            maxLength={255}
          />
          <ChampTexte
            id="q-telephone"
            label="Téléphone"
            type="tel"
            inputMode="tel"
            value={r.telephone}
            onChange={(e) => maj("telephone", e.target.value)}
            error={erreurs["telephone"]}
            autoComplete="tel"
            maxLength={30}
          />
        </>
      );
    case "expertise":
      return (
        <>
          <ChoixCartes
            name="domaines"
            legende="Vos domaines"
            options={OPTIONS_DOMAINES}
            valeurs={r.domaines}
            multiple
            onChange={(v) => maj("domaines", v as Reponses["domaines"])}
            error={erreurs["domaines"]}
          />
          {r.domaines.includes("autre") ? (
            <ChampTexte
              id="q-domaineAutre"
              label="Quel autre domaine ?"
              value={r.domaineAutre}
              onChange={(e) => maj("domaineAutre", e.target.value)}
              error={erreurs["domaineAutre"]}
              maxLength={120}
              placeholder="Ex. œnologie, logistique, santé…"
            />
          ) : null}
          <ChampTexte
            id="q-specialite"
            label="Votre spécialité en une phrase"
            facultatif
            value={r.specialite}
            onChange={(e) => maj("specialite", e.target.value)}
            error={erreurs["specialite"]}
            maxLength={200}
            placeholder="Ex. J'aide les managers de proximité à conduire le changement."
          />
        </>
      );
    case "experience":
      return (
        <>
          <ChoixCartes
            name="experience"
            legende="Depuis combien de temps formez-vous ?"
            options={EXPERIENCES}
            valeurs={r.experience ? [r.experience] : []}
            onChange={(v) => maj("experience", (v[0] ?? "") as Reponses["experience"])}
            error={erreurs["experience"]}
          />
          <ChoixCartes
            name="publics"
            legende="Quels publics formez-vous ?"
            options={PUBLICS}
            valeurs={r.publics}
            multiple
            onChange={(v) => maj("publics", v as Reponses["publics"])}
            error={erreurs["publics"]}
          />
        </>
      );
    case "pratique":
      return (
        <>
          <ChoixCartes
            name="modalites"
            legende="Vos modalités"
            options={OPTIONS_MODALITES}
            valeurs={r.modalites}
            multiple
            colonnes={1}
            onChange={(v) => maj("modalites", v as Reponses["modalites"])}
            error={erreurs["modalites"]}
          />
          <ChampTexte
            id="q-zone"
            label="Votre zone d'intervention"
            facultatif
            value={r.zone}
            onChange={(e) => maj("zone", e.target.value)}
            error={erreurs["zone"]}
            maxLength={150}
            placeholder="Ex. Grand Est, Lyon et alentours, toute la France…"
          />
          <ChampTexte
            id="q-linkedin"
            label="Votre profil LinkedIn"
            facultatif
            type="url"
            inputMode="url"
            value={r.linkedin}
            onChange={(e) => maj("linkedin", e.target.value)}
            error={erreurs["linkedin"]}
            maxLength={300}
            placeholder="linkedin.com/in/votre-nom"
          />
        </>
      );
    case "structure": {
      const structure = r.statutStructure && r.statutStructure !== "aucune";
      return (
        <>
          <ChoixCartes
            name="statutStructure"
            legende="Votre situation"
            legendeVisible={false}
            options={OPTIONS_STRUCTURE}
            valeurs={r.statutStructure ? [r.statutStructure] : []}
            colonnes={1}
            onChange={(v) => maj("statutStructure", (v[0] ?? "") as Reponses["statutStructure"])}
            error={erreurs["statutStructure"]}
          />
          {structure ? (
            <div className="grid gap-4 rounded-2xl bg-muted/50 p-4 motion-safe:animate-in motion-safe:fade-in">
              <SiretAutocomplete
                id="q-siret"
                publique
                value={r.siret}
                onChange={(v) => maj("siret", v)}
                onSelect={remplirEntreprise}
                error={erreurs["siret"]}
                inputClassName="h-12 rounded-xl bg-background text-base"
                hint="Saisissez votre SIRET ou le nom de votre entreprise : la fiche se remplit toute seule."
              />
              {r.entreprise ? (
                <p className="rounded-xl bg-background px-3 py-2.5 text-sm">
                  <span className="font-semibold">{r.entreprise}</span>
                  {r.entrepriseAdresse ? (
                    <span className="block text-xs text-muted-foreground">
                      {r.entrepriseAdresse}
                    </span>
                  ) : null}
                </p>
              ) : null}
            </div>
          ) : r.statutStructure === "aucune" ? (
            <p className="rounded-2xl bg-accent/60 p-4 text-sm">
              Aucun souci : notre équipe vous conseillera sur le statut le plus adapté lors de votre
              premier échange.
            </p>
          ) : null}
          <ChoixCartes
            name="aNda"
            legende="Avez-vous un numéro de déclaration d'activité (NDA) ?"
            options={[
              { id: "oui", label: "Oui, j'en ai un" },
              { id: "non", label: "Non, pas encore" },
            ]}
            valeurs={r.aNda ? [r.aNda] : []}
            onChange={(v) => maj("aNda", (v[0] ?? "") as Reponses["aNda"])}
            error={erreurs["aNda"]}
          />
          {r.aNda === "oui" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <ChampTexte
                id="q-numeroNda"
                label="Numéro de déclaration"
                inputMode="numeric"
                value={r.numeroNda}
                onChange={(e) => maj("numeroNda", e.target.value)}
                error={erreurs["numeroNda"]}
                maxLength={20}
                placeholder="11 chiffres"
              />
              <Combobox
                label="Région de dépôt"
                value={r.ndaRegion}
                onChange={(v) => maj("ndaRegion", v)}
                options={REGIONS_FR}
                placeholder="Choisir une région…"
              />
            </div>
          ) : r.aNda === "non" ? (
            <p className="text-sm text-muted-foreground">
              Ce n'est pas bloquant : avec le portage, vous formez sous la déclaration de
              Skills4mation.
            </p>
          ) : null}
        </>
      );
    }
    case "pieces":
      return (
        <div className="grid min-w-0 gap-3">
          {PIECES.map((p) => (
            <ZoneDepot
              key={p.name}
              name={p.name}
              label={p.label}
              hint={p.hint}
              fichier={fichiers[p.name]}
              onFichier={(f) => setFichier(p.name, f)}
              error={erreurs[p.name]}
            />
          ))}
        </div>
      );
    case "engagements":
      return (
        <>
          <div className="grid gap-1.5" data-champ="engagement">
            <label
              htmlFor="q-engagement"
              className={cn(
                "flex cursor-pointer gap-4 rounded-2xl border p-5 text-sm leading-relaxed transition-colors",
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
                r.engagement
                  ? "border-primary bg-primary/[0.05]"
                  : erreurs["engagement"]
                    ? "border-destructive/60"
                    : "border-border",
              )}
            >
              <input
                id="q-engagement"
                type="checkbox"
                checked={r.engagement}
                onChange={(e) => maj("engagement", e.target.checked)}
                aria-invalid={Boolean(erreurs["engagement"])}
                aria-describedby={erreurs["engagement"] ? "engagement-erreur" : undefined}
                className="mt-0.5 size-5 shrink-0 accent-[var(--color-primary)]"
              />
              <span>
                Je m'engage à respecter le référentiel national qualité <strong>Qualiopi</strong> et
                le code de déontologie de Skills4mation, à m'exprimer de manière sincère et à
                répondre aux demandes de l'organisme en cas de contrôle.
              </span>
            </label>
            <MessageErreur id="engagement-erreur">{erreurs["engagement"]}</MessageErreur>
            <Link
              to="/code-deontologique"
              target="_blank"
              className="w-fit text-sm font-medium text-primary underline underline-offset-4"
            >
              Lire le code de déontologie (nouvel onglet)
            </Link>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="q-message" className="text-sm font-medium">
              Un mot pour notre équipe
              <span className="ml-1.5 font-normal text-muted-foreground">(facultatif)</span>
            </Label>
            <Textarea
              id="q-message"
              rows={4}
              maxLength={1500}
              value={r.message}
              onChange={(e) => maj("message", e.target.value)}
              aria-invalid={Boolean(erreurs["message"])}
              className="rounded-xl text-base"
              placeholder="Vos projets, le volume d'activité envisagé, vos questions…"
            />
            <MessageErreur id="message-erreur">{erreurs["message"]}</MessageErreur>
          </div>
        </>
      );
    case "acces":
      return (
        <>
          <Recapitulatif r={r} fichiers={fichiers} allerA={allerA} />
          {emailCompte ? (
            <p className="rounded-2xl bg-accent/60 p-4 text-sm">
              Vous êtes connecté avec <strong>{emailCompte}</strong> : votre candidature sera reliée
              directement à ce compte.
            </p>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="q-mdp" className="text-sm font-medium">
                Choisissez un mot de passe
              </Label>
              <input type="email" autoComplete="username" value={r.email.trim()} readOnly hidden />
              <div className="relative">
                <Input
                  id="q-mdp"
                  type={voirMdp ? "text" : "password"}
                  autoComplete="new-password"
                  value={mdp}
                  onChange={(e) => setMdp(e.target.value)}
                  maxLength={72}
                  aria-invalid={Boolean(erreurs["mdp"])}
                  aria-describedby="mdp-regles"
                  className="h-12 rounded-xl bg-background pr-12 text-base"
                />
                <button
                  type="button"
                  onClick={() => setVoirMdp(!voirMdp)}
                  className="absolute inset-y-0 right-1 my-auto inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label={voirMdp ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  aria-pressed={voirMdp}
                >
                  {voirMdp ? (
                    <EyeOff className="size-4" aria-hidden />
                  ) : (
                    <Eye className="size-4" aria-hidden />
                  )}
                </button>
              </div>
              <ul id="mdp-regles" className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {reglesMotDePasse(mdp).map((regle) => (
                  <li
                    key={regle.id}
                    className={cn(
                      "inline-flex items-center gap-1.5 transition-colors",
                      regle.ok ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {regle.ok ? (
                      <Check className="size-3.5" strokeWidth={3} aria-hidden />
                    ) : (
                      <X className="size-3.5" aria-hidden />
                    )}
                    {regle.label}
                    <span className="sr-only">{regle.ok ? " : respecté" : " : à respecter"}</span>
                  </li>
                ))}
              </ul>
              <MessageErreur id="mdp-erreur">{erreurs["mdp"]}</MessageErreur>
            </div>
          )}
        </>
      );
    default:
      return null;
  }
}

function Recapitulatif({
  r,
  fichiers,
  allerA,
}: {
  r: Reponses;
  fichiers: Partial<Record<PieceName, File>>;
  allerA: (i: number) => void;
}) {
  const q = construireQuestionnaire(r);
  const lib = <T extends { id: string; label: string }>(liste: readonly T[], ids: string[]) =>
    ids.map((id) => liste.find((x) => x.id === id)?.label ?? id).join(", ");
  const nbPieces = PIECES.filter((p) => fichiers[p.name]).length;
  const lignes: { etape: number; titre: string; valeur: string }[] = [
    {
      etape: 0,
      titre: "Vous",
      valeur: `${r.prenom} ${r.nom}, ${r.email.trim()}`,
    },
    { etape: 1, titre: "Domaines", valeur: libellesDomaines(q).join(", ") },
    {
      etape: 2,
      titre: "Expérience",
      valeur: [lib(EXPERIENCES, r.experience ? [r.experience] : []), lib(PUBLICS, r.publics)]
        .filter(Boolean)
        .join(" ; "),
    },
    {
      etape: 3,
      titre: "Pratique",
      valeur: [lib(MODALITES, r.modalites), r.zone.trim()].filter(Boolean).join(" ; "),
    },
    {
      etape: 4,
      titre: "Structure",
      valeur:
        r.statutStructure === "aucune"
          ? "Pas encore de structure"
          : r.entreprise ||
            r.siret ||
            lib(STATUTS_STRUCTURE, r.statutStructure ? [r.statutStructure] : []),
    },
    {
      etape: 5,
      titre: "Pièces",
      valeur: nbPieces === 3 ? "3 documents prêts" : `${nbPieces}/3 documents`,
    },
  ];
  return (
    <section
      aria-label="Récapitulatif de vos réponses"
      className="rounded-2xl border border-border/80 bg-muted/30"
    >
      <ul className="divide-y divide-border/70">
        {lignes.map((l) => (
          <li key={l.titre}>
            <button
              type="button"
              onClick={() => allerA(l.etape)}
              className="group flex w-full items-center gap-4 px-4 py-3 text-left first:rounded-t-2xl last:rounded-b-2xl hover:bg-background focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">
                {l.titre}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">{l.valeur || "—"}</span>
              <span className="shrink-0 text-xs font-semibold text-primary opacity-70 group-hover:opacity-100">
                Modifier<span className="sr-only"> : {l.titre}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EcranFinal({
  icone,
  titre,
  texte,
  etapes,
  action,
}: {
  icone: React.ReactNode;
  titre: string;
  texte: React.ReactNode;
  etapes?: string[];
  action?: React.ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500">
      <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        {icone}
      </span>
      <h1
        ref={ref}
        tabIndex={-1}
        className="mt-6 font-display text-[1.9rem] leading-tight font-semibold tracking-tight outline-none sm:text-[2.3rem]"
      >
        {titre}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">{texte}</p>
      {etapes ? (
        <ol className="mt-8 grid gap-4">
          {etapes.map((e, i) => (
            <li key={e} className="flex gap-3 text-sm">
              <span
                className={cn(
                  "inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                  i === 0
                    ? "bg-primary text-primary-foreground"
                    : "border border-primary/40 text-primary",
                )}
              >
                {i === 0 ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : i + 1}
              </span>
              <span className="pt-0.5">{e}</span>
            </li>
          ))}
        </ol>
      ) : null}
      {action ? <div className="mt-8">{action}</div> : null}
      <p className="mt-10 text-sm text-muted-foreground">
        Une question&nbsp;?{" "}
        <Link to="/contact" className="font-medium text-primary underline underline-offset-4">
          Écrivez-nous
        </Link>
      </p>
    </div>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.6 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.3-4.7 3.3-8z"
      />
      <path
        fill="#34A853"
        d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z"
      />
      <path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.1a11 11 0 0 0 0 9.9l3.7-2.8z" />
      <path
        fill="#EA4335"
        d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z"
      />
    </svg>
  );
}
