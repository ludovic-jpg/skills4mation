import { createFileRoute } from "@tanstack/react-router";

import { PageHero, PublicLayout } from "@/components/site/PublicLayout";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions légales — Skills4mation" },
      {
        name: "description",
        content:
          "Mentions légales de Skills4mation (SAS, SIRET 925 376 725 00022, Rixheim) : éditeur du site, responsable de publication, hébergement, propriété intellectuelle et droit applicable.",
      },
      { property: "og:title", content: "Mentions légales — Skills4mation" },
      {
        property: "og:description",
        content:
          "Identité de l'éditeur, responsable de publication, hébergeur, conditions d'utilisation et droit applicable du site Skills4mation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://skills4mation.com/mentions-legales" },
    ],
    links: [{ rel: "canonical", href: "https://skills4mation.com/mentions-legales" }],
  }),
  component: MentionsLegales,
});

const IDENTITE = [
  { label: "Dénomination sociale", value: "SKILLS4MATION" },
  { label: "Forme juridique", value: "SAS, société par actions simplifiée" },
  { label: "Capital social", value: "1 000,00 € (fixe)" },
  { label: "Siège social", value: "13 C rue des Romains, 68170 Rixheim, France" },
  { label: "SIREN", value: "925 376 725" },
  { label: "SIRET (siège)", value: "925 376 725 00022" },
  { label: "N° TVA intracommunautaire", value: "FR81 925 376 725" },
  { label: "RCS", value: "925 376 725 R.C.S. Mulhouse" },
  { label: "Immatriculation au RNE", value: "17/04/2024 (INPI)" },
  { label: "Date de création", value: "08/04/2024" },
  { label: "Code NAF / APE", value: "70.22Z — Conseil pour les affaires et autres conseils de gestion" },
  { label: "Adresse e-mail", value: "contact@skills4mation.com" },
];

function MentionsLegales() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Informations légales"
        title="Mentions légales"
        description="Conformément à l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique, sont précisées ci-dessous les identités des différents intervenants dans la réalisation et le suivi du site Skills4mation."
      />

      <section className="section-shell max-w-3xl space-y-10 py-14 text-sm text-muted-foreground">
        <Bloc numero="1" titre="Propriétaire et éditeur du site">
          <dl className="divide-y divide-border rounded-2xl border border-border bg-card">
            {IDENTITE.map((item) => (
              <div key={item.label} className="grid gap-1 p-4 sm:grid-cols-3 sm:gap-4">
                <dt className="font-medium text-foreground">{item.label}</dt>
                <dd className="sm:col-span-2">{item.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs">
            Informations administratives issues des données publiques INSEE / INPI (Annuaire des
            Entreprises, data.gouv.fr).
          </p>
        </Bloc>

        <Bloc numero="2" titre="Responsable de publication">
          <p className="leading-relaxed">
            Nom : <strong className="text-foreground">Ludovic Albisser</strong>
            <br />
            Adresse e-mail : <strong className="text-foreground">contact@skills4mation.com</strong>
          </p>
        </Bloc>

        <Bloc numero="3" titre="Hébergeur du site">
          <p className="leading-relaxed">
            Le site est hébergé sur une infrastructure cloud européenne. Les données applicatives
            (comptes formateurs, dossiers de formation, documents) sont stockées dans l'Union
            européenne.
          </p>
        </Bloc>

        <Bloc numero="4" titre="Conditions générales d'utilisation du site">
          <p className="leading-relaxed">
            L'utilisation du site skills4mation.com implique l'acceptation pleine et entière des
            conditions générales d'utilisation décrites ci-après. Ces conditions peuvent être
            modifiées ou complétées à tout moment ; les utilisateurs sont donc invités à les
            consulter régulièrement.
          </p>
        </Bloc>

        <Bloc numero="5" titre="Propriété intellectuelle">
          <p className="leading-relaxed">
            Le site skills4mation.com est une œuvre protégée par les lois françaises sur la propriété
            intellectuelle. Toute reproduction, représentation, modification, publication ou
            adaptation des éléments du site (textes, supports pédagogiques, images, logos, identité
            visuelle) est interdite, sauf autorisation préalable écrite de la société SKILLS4MATION.
          </p>
        </Bloc>

        <Bloc numero="6" titre="Limitations de responsabilité">
          <p className="leading-relaxed">
            SKILLS4MATION ne pourra être tenue responsable des dommages directs ou indirects liés à
            l'utilisation du site. L'utilisateur s'engage à accéder au site avec un matériel récent et
            un navigateur à jour, exempt de virus.
          </p>
        </Bloc>

        <Bloc numero="7" titre="Certification Qualiopi">
          <p className="leading-relaxed">
            La certification qualité a été délivrée au titre de la catégorie d'action suivante :
            actions de formation. Elle encadre l'activité de portage Qualiopi proposée aux formateurs
            partenaires.
          </p>
        </Bloc>

        <Bloc numero="8" titre="Protection des données personnelles">
          <p className="leading-relaxed">
            Les modalités de collecte et de traitement des données personnelles sont détaillées dans
            notre{" "}
            <a className="font-medium text-primary underline" href="/politique-de-confidentialite">
              politique de confidentialité
            </a>
            . Toute demande d'accès, de rectification ou de suppression peut être adressée à
            contact@skills4mation.com.
          </p>
        </Bloc>

        <Bloc numero="9" titre="Droit applicable et juridiction compétente">
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
