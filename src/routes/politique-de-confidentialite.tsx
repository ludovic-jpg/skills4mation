import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Cookie, Database, FileLock2, Globe2, ShieldCheck, UserCheck } from "lucide-react";

import { PageHero, PublicLayout } from "@/components/site/PublicLayout";

const PAGE_PATH = "/politique-de-confidentialite";
const PAGE_URL = `https://skills4mation.com${PAGE_PATH}`;

export const Route = createFileRoute("/politique-de-confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité | Skills4mation" },
      {
        name: "description",
        content:
          "RGPD : responsable du traitement, données collectées, finalités et bases légales, durées de conservation, destinataires, droits des utilisateurs et sécurité sur le site Skills4mation (groupe Back to Business / Formatrix).",
      },
      { property: "og:title", content: "Politique de confidentialité | Skills4mation" },
      {
        property: "og:description",
        content:
          "Comment Skills4mation, nom commercial du groupe Back to Business / Formatrix, collecte, utilise et protège vos données personnelles.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: PAGE_URL },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
  component: PolitiqueConfidentialite,
});

const SOMMAIRE = [
  { id: "responsable", label: "Responsable du traitement", icon: ShieldCheck },
  { id: "donnees", label: "Données collectées", icon: Database },
  { id: "finalites", label: "Finalités et bases légales", icon: FileLock2 },
  { id: "conservation", label: "Durées de conservation", icon: Clock },
  { id: "droits", label: "Vos droits", icon: UserCheck },
  { id: "transferts", label: "Sécurité & transferts", icon: Globe2 },
  { id: "cookies", label: "Cookies", icon: Cookie },
];

const FINALITES = [
  {
    finalite: "Traiter vos demandes (contact, projet de formation, évaluation des droits)",
    base: "Mesures précontractuelles / intérêt légitime",
  },
  {
    finalite:
      "Gérer le dossier d'inscription, la convention et le suivi pédagogique et administratif de la formation",
    base: "Exécution du contrat et obligations légales de l'organisme de formation",
  },
  {
    finalite:
      "Instruire les candidatures de formateurs et gérer l'espace formateur (portage Qualiopi)",
    base: "Exécution du contrat / mesures précontractuelles",
  },
  {
    finalite: "Enregistrer et traiter les réclamations, difficultés et aléas",
    base: "Obligation légale (référentiel national qualité) et intérêt légitime",
  },
  {
    finalite: "Envoyer des communications relatives à votre projet de formation (e-mail, SMS)",
    base: "Exécution du contrat / intérêt légitime",
  },
  {
    finalite:
      "Vous adresser des contenus (livre blanc, ressources) et des informations commerciales",
    base: "Consentement, révocable à tout moment",
  },
];

const DUREES = [
  {
    donnees: "Demandes d'information et de contact",
    duree: "Le temps nécessaire au traitement, puis 3 ans à compter du dernier contact",
  },
  {
    donnees: "Dossiers de formation (convention, émargements, évaluations, attestations)",
    duree:
      "Durée de la relation puis archivage selon les délais légaux applicables aux organismes de formation (prescription et contrôles des financeurs)",
  },
  {
    donnees: "Comptes de l'espace formateur et pièces de candidature",
    duree: "Durée du compte, puis archivage limité aux obligations légales",
  },
  {
    donnees: "Registre des réclamations",
    duree: "Durée nécessaire au suivi de la démarche qualité et aux audits Qualiopi",
  },
  {
    donnees: "Consentement aux communications commerciales",
    duree: "Jusqu'au retrait du consentement, puis preuve conservée 3 ans",
  },
];

function Bloc({
  id,
  numero,
  titre,
  children,
}: {
  id?: string;
  numero?: string;
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="scroll-mt-24">
      <div className="flex items-baseline gap-3">
        {numero ? <span className="eyebrow text-secondary">{numero}</span> : null}
        <h2 className="text-xl font-semibold text-foreground">{titre}</h2>
      </div>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

function PolitiqueConfidentialite() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="RGPD"
        title="Politique de confidentialité"
        description="En conformité avec le Règlement Général sur la Protection des Données (RGPD) et la loi Informatique et Libertés, cette politique détaille la manière dont Skills4mation, nom commercial du groupe Back to Business / Formatrix, collecte, utilise et protège les données personnelles des visiteurs, apprenants et formateurs."
      />

      <section className="section-shell py-12">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SOMMAIRE.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-soft transition-colors hover:border-primary/40"
            >
              <span className="inline-flex rounded-xl bg-accent p-2.5 text-accent-foreground">
                <item.icon className="size-4" aria-hidden />
              </span>
              <span className="text-sm font-semibold group-hover:text-primary">{item.label}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="section-shell max-w-3xl space-y-10 pb-14">
        <Bloc
          id="responsable"
          numero="1."
          titre="Responsable du traitement des données personnelles"
        >
          <p>
            Skills4mation est un nom commercial du groupe Back to Business / Formatrix. Le
            responsable du traitement des données collectées via ce site est la société BACK TO
            BUSINESS (nom commercial Formatrix).
          </p>
          <div className="rounded-2xl border border-border/70 bg-card p-5 text-foreground shadow-soft">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Société</dt>
                <dd className="font-semibold">
                  BACK TO BUSINESS — SASU (Formatrix / Skills4mation)
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  SIRET / RCS
                </dt>
                <dd className="font-semibold">918 433 723 00015 — RCS Mulhouse</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Adresse</dt>
                <dd className="font-semibold">91 Grand Rue Pierre Braun, 68170 Rixheim</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Numéro de TVA
                </dt>
                <dd className="font-semibold">FR79918433723</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">E-mail</dt>
                <dd className="font-semibold">pedagogie@formatrix.fr</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Référent protection des données
                </dt>
                <dd className="font-semibold">Ludovic Albisser, Président</dd>
              </div>
            </dl>
          </div>
          <p className="text-xs">
            La société SKILLS4MATION SAS (RCS Mulhouse 925 376 725, 91 Grand'Rue Pierre Braun, 68170
            Rixheim, contact@skills4mation.com) est une entité distincte qui porte également la
            marque ; les demandes adressées à contact@skills4mation.com sont traitées dans les mêmes
            conditions.
          </p>
        </Bloc>

        <Bloc id="donnees" numero="2." titre="Données collectées">
          <p>
            Nous collectons uniquement les données nécessaires aux finalités décrites ci-dessous :
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">
                Données fournies directement par l'utilisateur
              </strong>{" "}
              via nos formulaires : nom, prénom, adresse e-mail, numéro de téléphone, adresse
              postale, société, situation professionnelle, description de votre projet.
            </li>
            <li>
              <strong className="text-foreground">Données de dossier de formation</strong> :
              informations professionnelles (SIRET, numéro de déclaration d'activité), pièces
              pédagogiques et administratives déposées par les formateurs portés, documents générés
              (convention, émargements, évaluations, attestations).
            </li>
            <li>
              <strong className="text-foreground">Données de réclamation</strong> : nom, e-mail,
              formation concernée et contenu du signalement déposé via le formulaire de réclamation.
            </li>
            <li>
              <strong className="text-foreground">Données techniques</strong> : adresse IP et
              journaux techniques nécessaires au fonctionnement, à la sécurité du site et de
              l'espace formateur.
            </li>
          </ul>
        </Bloc>

        <Bloc id="finalites" numero="3." titre="Finalités du traitement et bases légales">
          <div className="overflow-hidden rounded-xl border border-border/70">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/70 text-muted-foreground">
                <tr>
                  <th className="p-3 font-semibold">Finalité</th>
                  <th className="p-3 font-semibold">Base légale (art. 6 RGPD)</th>
                </tr>
              </thead>
              <tbody>
                {FINALITES.map((f) => (
                  <tr key={f.finalite} className="border-t border-border/60">
                    <td className="p-3 font-medium text-foreground">{f.finalite}</td>
                    <td className="p-3 text-muted-foreground">{f.base}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Les données sont utilisées pour permettre l'accès et l'utilisation du site, traiter
            votre demande, vous proposer des parcours de formation adaptés, gérer votre dossier
            d'inscription et assurer le suivi pédagogique et administratif de votre formation.
          </p>
        </Bloc>

        <Bloc id="conservation" numero="4." titre="Durées de conservation">
          <div className="overflow-hidden rounded-xl border border-border/70">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/70 text-muted-foreground">
                <tr>
                  <th className="p-3 font-semibold">Catégorie de données</th>
                  <th className="p-3 font-semibold">Durée</th>
                </tr>
              </thead>
              <tbody>
                {DUREES.map((d) => (
                  <tr key={d.donnees} className="border-t border-border/60">
                    <td className="p-3 font-medium text-foreground">{d.donnees}</td>
                    <td className="p-3 text-muted-foreground">{d.duree}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Les données liées à une demande d'information sont conservées le temps nécessaire à son
            traitement, puis archivées dans le respect des délais légaux applicables aux organismes
            de formation.
          </p>
        </Bloc>

        <Bloc id="droits" numero="5." titre="Destinataires et vos droits">
          <p>
            <strong className="text-foreground">Destinataires.</strong> Vos données sont accessibles
            aux équipes pédagogiques et administratives du groupe Back to Business / Formatrix
            (Skills4mation), ainsi qu'aux prestataires techniques strictement nécessaires au
            fonctionnement du site (hébergement, base de données, envoi d'e-mails). Elles ne sont
            jamais revendues. Elles peuvent être communiquées aux financeurs de votre formation
            (OPCO, CPF, France Travail…) dans la mesure requise par le financement.
          </p>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">Accès, rectification et effacement</strong> de vos
              données personnelles.
            </li>
            <li>
              <strong className="text-foreground">Opposition</strong> au traitement et{" "}
              <strong className="text-foreground">retrait du consentement</strong> à tout moment.
            </li>
            <li>
              <strong className="text-foreground">Portabilité</strong> des données que vous avez
              fournies.
            </li>
            <li>
              <strong className="text-foreground">Limitation</strong> du traitement dans certains
              cas.
            </li>
          </ul>
          <p>
            Pour exercer vos droits, adressez votre demande à{" "}
            <a className="font-medium text-primary underline" href="mailto:pedagogie@formatrix.fr">
              pedagogie@formatrix.fr
            </a>{" "}
            en précisant l'objet de votre requête, ou par courrier à BACK TO BUSINESS — Formatrix,
            91 Grand Rue Pierre Braun, 68170 Rixheim. Une copie d'une pièce d'identité pourra vous
            être demandée en cas de doute sur votre identité. Vous disposez également du droit
            d'introduire une réclamation auprès de la CNIL (www.cnil.fr).
          </p>
        </Bloc>

        <Bloc id="transferts" numero="6." titre="Sécurité et transfert des données">
          <p>
            <strong className="text-foreground">Sécurité.</strong> Nous mettons en œuvre des mesures
            techniques et organisationnelles adaptées (chiffrement des échanges, contrôle d'accès
            par rôle, journalisation) pour protéger vos données contre tout accès, altération ou
            divulgation non autorisés.
          </p>
          <p>
            <strong className="text-foreground">Transfert.</strong> Les données applicatives sont
            hébergées dans l'Union européenne. En cas de recours à des sous-traitants, nous nous
            assurons qu'ils respectent les exigences du RGPD.
          </p>
          <p>
            <strong className="text-foreground">Violation de données.</strong> En cas de violation
            de données, les utilisateurs concernés seront informés conformément à la réglementation
            en vigueur.
          </p>
        </Bloc>

        <Bloc id="cookies" numero="7." titre="Cookies et stockage local">
          <p>
            Le site n'utilise que des cookies et stockages strictement nécessaires à son
            fonctionnement (session de connexion à l'espace formateur, brouillons de formulaire,
            mémorisation de votre choix). Aucun cookie de mesure d'audience ni de publicité n'est
            déposé. Le détail est présenté dans notre{" "}
            <Link className="font-medium text-primary underline" to="/politique-de-cookies">
              politique de cookies
            </Link>
            .
          </p>
          <p>
            Pour toute question relative à cette politique, écrivez à{" "}
            <strong className="text-foreground">pedagogie@formatrix.fr</strong>.
          </p>
        </Bloc>
      </section>
    </PublicLayout>
  );
}
