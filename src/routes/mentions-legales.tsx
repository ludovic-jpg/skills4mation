import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHero, PublicLayout } from "@/components/site/PublicLayout";

const PAGE_PATH = "/mentions-legales";
const PAGE_URL = `https://skills4mation.com${PAGE_PATH}`;

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions légales | Skills4mation" },
      {
        name: "description",
        content:
          "Mentions légales du site Skills4mation, nom commercial du groupe Back to Business / Formatrix : éditeur, déclaration d'activité, certification Qualiopi, hébergement, réclamations et données personnelles.",
      },
      { property: "og:title", content: "Mentions légales | Skills4mation" },
      {
        property: "og:description",
        content:
          "Identité de l'éditeur, déclaration d'activité, certification qualité, hébergeur et droit applicable du site Skills4mation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: PAGE_URL },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
  component: MentionsLegales,
});

/** Éditeur du site : BACK TO BUSINESS (nom commercial Formatrix), dont Skills4mation est un nom commercial. */
const EDITEUR = [
  { label: "Dénomination sociale", value: "BACK TO BUSINESS" },
  { label: "Nom commercial", value: "Formatrix — Skills4mation" },
  {
    label: "Forme juridique",
    value: "Société par actions simplifiée unipersonnelle (SASU) au capital de 3 000 €",
  },
  { label: "Siège social", value: "91 Grand Rue Pierre Braun, 68170 Rixheim, France" },
  { label: "SIRET", value: "918 433 723 00015" },
  { label: "RCS", value: "RCS Mulhouse" },
  { label: "N° TVA intracommunautaire", value: "FR79918433723" },
  { label: "Directeur de la publication", value: "Ludovic Albisser, Président" },
  { label: "Contact", value: "pedagogie@formatrix.fr" },
];

/** Société SKILLS4MATION SAS : entité juridique distincte, informations conservées à titre d'information. */
const IDENTITE = [
  { label: "Dénomination sociale", value: "SKILLS4MATION" },
  { label: "Forme juridique", value: "SAS, société par actions simplifiée" },
  { label: "Capital social", value: "1 000,00 € (fixe)" },
  { label: "Siège social", value: "91 Grand'Rue Pierre Braun, 68170 Rixheim, France" },
  { label: "SIREN", value: "925 376 725" },
  { label: "SIRET (siège)", value: "925 376 725 00022" },
  { label: "N° TVA intracommunautaire", value: "FR81 925 376 725" },
  { label: "RCS", value: "925 376 725 R.C.S. Mulhouse" },
  { label: "Immatriculation au RNE", value: "17/04/2024 (INPI)" },
  { label: "Date de création", value: "08/04/2024" },
  {
    label: "Code NAF / APE",
    value: "70.22Z — Conseil pour les affaires et autres conseils de gestion",
  },
  { label: "Adresse e-mail", value: "contact@skills4mation.com" },
];

function Tableau({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="divide-y divide-border rounded-2xl border border-border bg-card">
      {items.map((item) => (
        <div key={item.label} className="grid gap-1 p-4 sm:grid-cols-3 sm:gap-4">
          <dt className="font-medium text-foreground">{item.label}</dt>
          <dd className="sm:col-span-2">
            {item.value.includes("@") ? (
              <a className="font-medium text-primary underline" href={`mailto:${item.value}`}>
                {item.value}
              </a>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function MentionsLegales() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Informations légales"
        title="Mentions légales"
        description="Conformément à l'article 6-III de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN), sont précisées ci-dessous les identités des différents intervenants dans la réalisation et le suivi du site Skills4mation."
      />

      <section className="section-shell max-w-3xl space-y-10 py-14 text-sm text-muted-foreground">
        <Bloc numero="1" titre="Éditeur du site">
          <p className="mb-4 leading-relaxed">
            <strong className="text-foreground">Skills4mation</strong> est un nom commercial du
            groupe <strong className="text-foreground">Back to Business / Formatrix</strong>. Le
            site skills4mation.com est édité par BACK TO BUSINESS, société par actions simplifiée
            unipersonnelle au capital de 3 000 €, exerçant sous le nom commercial Formatrix.
          </p>
          <Tableau items={EDITEUR} />
        </Bloc>

        <Bloc numero="2" titre="Société Skills4mation">
          <p className="mb-4 leading-relaxed">
            La marque Skills4mation est également portée par la société SKILLS4MATION, société par
            actions simplifiée distincte, dont les informations d'immatriculation sont les suivantes
            :
          </p>
          <Tableau items={IDENTITE} />
          <p className="mt-3 text-xs">
            Informations administratives issues des données publiques INSEE / INPI (Annuaire des
            Entreprises, data.gouv.fr).
          </p>
        </Bloc>

        <Bloc numero="3" titre="Responsable de publication">
          <p className="leading-relaxed">
            Nom : <strong className="text-foreground">Ludovic Albisser</strong>, Président
            <br />
            Adresse e-mail :{" "}
            <a className="font-medium text-primary underline" href="mailto:pedagogie@formatrix.fr">
              pedagogie@formatrix.fr
            </a>
          </p>
        </Bloc>

        <Bloc numero="4" titre="Déclaration d'activité">
          <p className="leading-relaxed">
            Déclaration d'activité enregistrée sous le numéro{" "}
            <strong className="text-foreground">44680333468</strong> auprès du préfet de la région
            Grand Est. Cet enregistrement ne vaut pas agrément de l'État.
          </p>
        </Bloc>

        <Bloc numero="5" titre="Certification qualité Qualiopi">
          <p className="leading-relaxed">
            La certification qualité a été délivrée au titre des catégories d'actions suivantes :
            actions de formation (article L.6313-1-1° du Code du travail) et bilans de compétences
            (article L.6313-1-2°). Certificat n° <strong className="text-foreground">B02267</strong>{" "}
            délivré par ICPF, valable jusqu'au 28/10/2027. Elle encadre l'activité de portage
            Qualiopi proposée aux formateurs partenaires.
          </p>
        </Bloc>

        <Bloc numero="6" titre="Hébergement">
          <p className="leading-relaxed">
            Le site est hébergé par Lovable (lovable.dev). Les données applicatives (comptes
            formateurs, dossiers de formation, documents) sont stockées sur une infrastructure cloud
            située dans l'Union européenne.
          </p>
        </Bloc>

        <Bloc numero="7" titre="Conditions générales d'utilisation du site">
          <p className="leading-relaxed">
            L'utilisation du site skills4mation.com implique l'acceptation pleine et entière des
            conditions générales d'utilisation décrites ci-après. Ces conditions peuvent être
            modifiées ou complétées à tout moment ; les utilisateurs sont donc invités à les
            consulter régulièrement.
          </p>
        </Bloc>

        <Bloc numero="8" titre="Propriété intellectuelle">
          <p className="leading-relaxed">
            Le site skills4mation.com est une œuvre protégée par les lois françaises sur la
            propriété intellectuelle. Les contenus du site (textes, programmes, supports
            pédagogiques, images, logos, identité visuelle) sont la propriété du groupe Back to
            Business / Formatrix ou de leurs auteurs. Toute reproduction, représentation,
            modification, publication ou adaptation est interdite, sauf autorisation préalable
            écrite.
          </p>
        </Bloc>

        <Bloc numero="9" titre="Limitations de responsabilité">
          <p className="leading-relaxed">
            L'éditeur ne pourra être tenu responsable des dommages directs ou indirects liés à
            l'utilisation du site. L'utilisateur s'engage à accéder au site avec un matériel récent
            et un navigateur à jour, exempt de virus.
          </p>
        </Bloc>

        <Bloc numero="10" titre="Protection des données personnelles">
          <p className="leading-relaxed">
            Les modalités de collecte et de traitement des données personnelles sont détaillées dans
            notre{" "}
            <Link className="font-medium text-primary underline" to="/politique-de-confidentialite">
              politique de confidentialité
            </Link>{" "}
            et notre{" "}
            <Link className="font-medium text-primary underline" to="/politique-de-cookies">
              politique de cookies
            </Link>
            . Toute demande d'accès, de rectification ou de suppression peut être adressée à
            pedagogie@formatrix.fr ou contact@skills4mation.com.
          </p>
        </Bloc>

        <Bloc numero="11" titre="Réclamations et médiation">
          <p className="leading-relaxed">
            Toute réclamation peut être déposée via notre{" "}
            <Link className="font-medium text-primary underline" to="/reclamations">
              formulaire de réclamation
            </Link>
            . Un accusé de réception est délivré immédiatement et une réponse est apportée sous 15
            jours ouvrés. Réexamen de second niveau : Ludovic Albisser, Président, responsable du
            traitement des réclamations (ludovic@formatrix.fr). Médiateur de la consommation : en
            cours de désignation. Nos indicateurs de résultats sont publiés sur la page{" "}
            <Link className="font-medium text-primary underline" to="/nos-resultats">
              Nos résultats
            </Link>
            .
          </p>
        </Bloc>

        <Bloc numero="12" titre="Droit applicable et juridiction compétente">
          <p className="leading-relaxed">
            Tout litige en relation avec l'utilisation du site skills4mation.com est soumis au droit
            français. Les tribunaux compétents de Mulhouse seront seuls compétents.
          </p>
        </Bloc>
      </section>
    </PublicLayout>
  );
}

function Bloc({
  numero,
  titre,
  children,
}: {
  numero: string;
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">
        {numero}. {titre}
      </h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
