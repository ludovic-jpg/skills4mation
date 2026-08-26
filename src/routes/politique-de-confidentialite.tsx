import { createFileRoute } from "@tanstack/react-router";
import { Cookie, Database, FileLock2, Globe2, ShieldCheck, UserCheck } from "lucide-react";

import { PageHero, PublicLayout } from "@/components/site/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/politique-de-confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité et cookies — Skills4mation" },
      {
        name: "description",
        content:
          "RGPD : responsable du traitement, données collectées, finalités, droits des utilisateurs, conservation, sécurité, transferts et politique de cookies de SKILLS4MATION (SAS, RCS Mulhouse 925 376 725).",
      },
      { property: "og:title", content: "Politique de confidentialité et cookies — Skills4mation" },
      {
        property: "og:description",
        content:
          "Comment SKILLS4MATION collecte, utilise et protège vos données personnelles, et quels cookies sont déposés sur le site.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:url",
        content: "https://train-grow-connect.lovable.app/politique-de-confidentialite",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://train-grow-connect.lovable.app/politique-de-confidentialite",
      },
    ],
  }),
  component: PolitiqueConfidentialite,
});

const SOMMAIRE = [
  { id: "responsable", label: "Responsable du traitement", icon: ShieldCheck },
  { id: "donnees", label: "Données collectées", icon: Database },
  { id: "finalites", label: "Finalités du traitement", icon: FileLock2 },
  { id: "droits", label: "Droits des utilisateurs", icon: UserCheck },
  { id: "transferts", label: "Conservation & transferts", icon: Globe2 },
  { id: "cookies", label: "Politique de cookies (UE)", icon: Cookie },
];

const COOKIES = [
  {
    service: "Plateforme applicative",
    categorie: "Fonctionnel",
    usage:
      "Cookies strictement nécessaires au fonctionnement du site, à la session de connexion à l'espace formateur et à la mémorisation de vos préférences. Ces cookies sont déposés sans consentement.",
    items: [
      { nom: "session / auth-token", duree: "Session à 1 an", fonction: "Maintien de la connexion" },
      { nom: "preferences", duree: "Persistant", fonction: "Mémoriser les préférences utilisateur" },
      { nom: "consent-status", duree: "365 jours", fonction: "Mémoriser votre choix de consentement" },
    ],
  },
  {
    service: "Mesure d'audience",
    categorie: "Statistiques",
    usage:
      "Nous utilisons des cookies de statistiques pour optimiser l'expérience du site et comprendre son usage. Votre autorisation est demandée avant leur dépôt.",
    items: [
      { nom: "_ga", duree: "2 ans", fonction: "Enregistrer et compter les pages vues" },
      { nom: "_ga_*", duree: "1 an", fonction: "Enregistrer et compter les pages vues" },
    ],
  },
  {
    service: "Formulaires & anti-spam",
    categorie: "Finalité en cours d'analyse",
    usage:
      "Des services tiers sont utilisés pour la prévention du spam sur les formulaires et l'affichage des polices de caractères (Google reCAPTCHA, Google Fonts). Consultez leurs déclarations de confidentialité respectives.",
    items: [
      { nom: "rc::a / rc::b / rc::c", duree: "—", fonction: "Prévention du spam (reCAPTCHA)" },
      { nom: "Google Fonts API", duree: "—", fonction: "Affichage des polices web" },
    ],
  },
  {
    service: "Marketing / suivi",
    categorie: "Marketing",
    usage:
      "Les cookies marketing ou toute autre forme de stockage local servent à créer des profils d'internautes afin d'afficher des publicités ou de suivre l'utilisateur sur ce site ou sur plusieurs sites. Ils ne sont déposés qu'après votre consentement explicite.",
    items: [{ nom: "—", duree: "—", fonction: "Aucun cookie marketing actif à ce jour" }],
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
        eyebrow="RGPD & cookies"
        title="Politique de confidentialité"
        description="En conformité avec le Règlement Général sur la Protection des Données (RGPD) et la loi Informatique et Libertés, cette politique détaille la manière dont la société SKILLS4MATION collecte, utilise et protège les données personnelles des utilisateurs."
      />

      <section className="section-shell py-12">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
        <Bloc id="responsable" numero="1." titre="Responsable du traitement des données personnelles">
          <div className="rounded-2xl border border-border/70 bg-card p-5 text-foreground shadow-soft">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Société</dt>
                <dd className="font-semibold">SKILLS4MATION — SAS</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  SIREN / RCS
                </dt>
                <dd className="font-semibold">925 376 725 R.C.S. Mulhouse</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Adresse</dt>
                <dd className="font-semibold">13 C rue des Romains, 68170 Rixheim</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Numéro de TVA
                </dt>
                <dd className="font-semibold">FR81925376725</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">E-mail</dt>
                <dd className="font-semibold">contact@skills4mation.com</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Délégué à la Protection des Données (DPO)
                </dt>
                <dd className="font-semibold">Ludovic Albisser</dd>
              </div>
            </dl>
          </div>
        </Bloc>

        <Bloc id="donnees" numero="2." titre="Données collectées">
          <p>SKILLS4MATION collecte les données personnelles suivantes :</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">
                Données fournies directement par l'utilisateur
              </strong>{" "}
              : nom, prénom, adresse e-mail, numéro de téléphone, adresse postale.
            </li>
            <li>
              <strong className="text-foreground">Données techniques</strong> : adresse IP, cookies,
              historique de navigation.
            </li>
            <li>
              <strong className="text-foreground">Données de dossier de formation</strong> :
              informations professionnelles (SIRET, NDA), pièces pédagogiques et administratives
              déposées par les formateurs portés.
            </li>
          </ul>
        </Bloc>

        <Bloc id="finalites" numero="3." titre="Finalités du traitement">
          <p>Les données collectées sont utilisées pour :</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Permettre l'accès et l'utilisation du site.</li>
            <li>Améliorer l'expérience utilisateur et le contenu du site.</li>
            <li>Gérer les commandes et le suivi client.</li>
            <li>Réaliser des analyses statistiques.</li>
            <li>Envoyer des campagnes de communication (newsletter, SMS, etc.).</li>
            <li>
              Instruire les candidatures de formateurs, les demandes de budget et les demandes
              d'évaluation des droits à la formation.
            </li>
          </ul>
        </Bloc>

        <Bloc id="droits" numero="4." titre="Droits des utilisateurs">
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">Accès, rectification et suppression</strong> des
              données personnelles.
            </li>
            <li>
              <strong className="text-foreground">Opposition au traitement</strong> de vos données
              personnelles.
            </li>
            <li>
              <strong className="text-foreground">Portabilité des données</strong> que vous avez
              fournies.
            </li>
            <li>
              <strong className="text-foreground">Limitation du traitement</strong> dans certains
              cas.
            </li>
          </ul>
          <p>
            Pour exercer vos droits, contactez-nous par courrier à l'adresse suivante :{" "}
            <strong className="text-foreground">
              SKILLS4MATION, 13 C rue des Romains, 68170 Rixheim
            </strong>
            . Joignez une copie de votre pièce d'identité.
          </p>
        </Bloc>

        <Bloc id="transferts" numero="5." titre="Conservation, sécurité et transfert des données">
          <p>
            <strong className="text-foreground">Conservation.</strong> Les données personnelles sont
            conservées pendant la durée nécessaire à la réalisation des finalités mentionnées.
            Certaines données peuvent être conservées plus longtemps si la loi l'exige.
          </p>
          <p>
            <strong className="text-foreground">Sécurité.</strong> SKILLS4MATION met en œuvre des
            mesures techniques et organisationnelles pour protéger vos données personnelles contre
            tout accès non autorisé, altération ou destruction.
          </p>
          <p>
            <strong className="text-foreground">Transfert.</strong> Aucune donnée personnelle n'est
            transférée hors de l'Union européenne. En cas de recours à des sous-traitants,
            SKILLS4MATION s'assure qu'ils respectent les exigences du RGPD.
          </p>
          <p>
            <strong className="text-foreground">Violation de données.</strong> En cas de violation de
            données, les utilisateurs concernés seront informés conformément à la réglementation en
            vigueur.
          </p>
          <p>
            <strong className="text-foreground">Contact.</strong> Pour toute question relative à
            cette politique de confidentialité, contactez-nous à : contact@skills4mation.com
          </p>
        </Bloc>
      </section>

      <section id="cookies" className="scroll-mt-24 bg-muted/50 py-14">
        <div className="section-shell max-w-3xl">
          <p className="eyebrow text-secondary">Politique de cookies (UE)</p>
          <h2 className="mt-2 text-2xl font-semibold">Cookies et technologies similaires</h2>
          <p className="mt-3 text-sm italic text-muted-foreground">
            Cette politique de cookies s'applique aux citoyens et résidents permanents légaux de
            l'Espace économique européen et de la Suisse.
          </p>

          <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h3 className="text-base font-semibold text-foreground">1. Introduction</h3>
              <p className="mt-2">
                Notre site web utilise des cookies et d'autres technologies associées (par
                commodité, toutes ces technologies sont désignées par « cookies »). Des cookies sont
                également déposés par les tiers auxquels nous faisons appel. Le document ci-dessous
                vous informe de l'utilisation des cookies sur notre site.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                2. Qu'est-ce qu'un cookie ?
              </h3>
              <p className="mt-2">
                Un cookie est un petit fichier simple envoyé avec les pages de ce site et stocké par
                votre navigateur sur le disque dur de votre ordinateur ou d'un autre appareil. Les
                informations qui y sont enregistrées peuvent être renvoyées à nos serveurs ou à ceux
                des tiers concernés lors d'une visite ultérieure.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                3. Qu'est-ce qu'un script ?
              </h3>
              <p className="mt-2">
                Un script est un fragment de code de programme utilisé pour permettre à notre site
                de fonctionner correctement et de manière interactive. Ce code est exécuté sur notre
                serveur ou sur votre appareil.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                4. Qu'est-ce qu'un web beacon ?
              </h3>
              <p className="mt-2">
                Un web beacon (ou pixel invisible) est un petit texte ou une image invisible sur un
                site web, utilisé pour suivre le trafic. Diverses données vous concernant sont
                stockées à l'aide de web beacons.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                5. Consentement et gestion des préférences
              </h3>
              <p className="mt-2">
                Pour offrir les meilleures expériences, nous utilisons des technologies telles que
                les cookies pour stocker et/ou accéder aux informations des appareils. Le fait de
                consentir à ces technologies nous permettra de traiter des données telles que le
                comportement de navigation ou les identifiants uniques sur ce site. Le fait de ne pas
                consentir ou de retirer son consentement peut avoir un effet négatif sur certaines
                caractéristiques et fonctions. Vous pouvez configurer votre navigateur pour refuser
                les cookies ; cela peut toutefois limiter certaines fonctionnalités du site.
              </p>
            </div>
          </div>

          <h3 className="mt-10 text-base font-semibold">6. Cookies déposés</h3>
          <div className="mt-4 space-y-4">
            {COOKIES.map((groupe) => (
              <Card key={groupe.service} className="rounded-2xl border-border/70 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-base font-semibold">{groupe.service}</h4>
                    <span className="rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                      {groupe.categorie}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {groupe.usage}
                  </p>
                  <div className="mt-4 overflow-hidden rounded-xl border border-border/70">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/70 text-muted-foreground">
                        <tr>
                          <th className="p-3 font-semibold">Nom</th>
                          <th className="p-3 font-semibold">Expiration</th>
                          <th className="p-3 font-semibold">Fonction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupe.items.map((item) => (
                          <tr key={item.nom} className="border-t border-border/60">
                            <td className="p-3 font-medium">{item.nom}</td>
                            <td className="p-3 text-muted-foreground">{item.duree}</td>
                            <td className="p-3 text-muted-foreground">{item.fonction}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Pour toute question sur les cookies déposés ou pour retirer votre consentement, écrivez à{" "}
            <strong className="text-foreground">contact@skills4mation.com</strong>.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
