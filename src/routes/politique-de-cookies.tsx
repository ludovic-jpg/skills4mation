import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHero, PublicLayout } from "@/components/site/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";

const PAGE_PATH = "/politique-de-cookies";
const PAGE_URL = `https://skills4mation.com${PAGE_PATH}`;

export const Route = createFileRoute("/politique-de-cookies")({
  head: () => ({
    meta: [
      { title: "Politique de cookies | Skills4mation" },
      {
        name: "description",
        content:
          "Quels cookies et stockages locaux sont utilisés sur le site Skills4mation, à quoi ils servent et comment gérer vos préférences.",
      },
      { property: "og:title", content: "Politique de cookies | Skills4mation" },
      {
        property: "og:description",
        content: "Information sur les cookies, le stockage local et la gestion des préférences.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: PAGE_URL },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
  component: CookiesPage,
});

const CATEGORIES = [
  {
    titre: "Fonctionnels (strictement nécessaires)",
    statut: "Actifs — exemptés de consentement",
    texte:
      "Nécessaires au fonctionnement du site et aux services que vous demandez explicitement : maintien de la session de connexion à l'espace formateur, sécurité, mémorisation de vos choix. Ils ne peuvent pas être désactivés.",
    items: [
      {
        nom: "Session d'authentification (espace formateur)",
        duree: "Session, renouvelée tant que vous êtes connecté",
        fonction: "Maintien de la connexion",
      },
      {
        nom: "s4m-candidature-brouillon-v1",
        duree: "Stockage local, jusqu'à l'envoi ou la suppression",
        fonction: "Sauvegarde du brouillon de candidature formateur",
      },
      {
        nom: "skills4mation-ressources-consent",
        duree: "Stockage local, jusqu'à la création du compte",
        fonction: "Mémorisation de votre choix de consentement marketing (livre blanc)",
      },
    ],
  },
  {
    titre: "Préférences",
    statut: "Aucun à ce jour",
    texte:
      "Mémorisent vos choix d'affichage et de navigation pour améliorer votre confort d'utilisation. Aucun cookie de préférence n'est actuellement déposé en dehors des stockages fonctionnels ci-dessus.",
    items: [],
  },
  {
    titre: "Statistiques",
    statut: "Aucun à ce jour",
    texte:
      "Mesurent l'audience de façon agrégée afin de comprendre quelles pages sont consultées. Aucun outil de mesure d'audience (Google Analytics ou équivalent) n'est actuellement installé sur ce site. Si un tel outil était ajouté, il ne serait activé qu'après votre consentement, avec un bouton « Refuser » aussi simple que le bouton « Accepter », conformément aux recommandations de la CNIL.",
    items: [],
  },
  {
    titre: "Marketing",
    statut: "Aucun à ce jour",
    texte:
      "Permettent de mesurer l'efficacité de campagnes et d'adapter les contenus proposés. Aucun cookie marketing n'est déposé sur ce site.",
    items: [],
  },
];

function CookiesPage() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Cookies"
        title="Politique de cookies"
        description="Skills4mation, nom commercial du groupe Back to Business / Formatrix, vous informe ici des cookies et stockages locaux utilisés sur skills4mation.com, de leur finalité et des moyens de les gérer."
      />

      <section className="section-shell max-w-3xl space-y-10 py-14 text-sm leading-relaxed text-muted-foreground">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Qu'est-ce qu'un cookie ?</h2>
          <p className="mt-3">
            Un cookie est un petit fichier déposé sur votre appareil lors de la visite d'un site. Il
            permet de reconnaître votre navigateur, de mémoriser vos préférences ou de mesurer la
            fréquentation du site. Par commodité, les technologies similaires (stockage local du
            navigateur, jetons de session) sont désignées ici par « cookies ».
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">Catégories utilisées</h2>
          <div className="mt-4 space-y-4">
            {CATEGORIES.map((groupe) => (
              <Card key={groupe.titre} className="rounded-2xl border-border/70 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-base font-semibold text-foreground">{groupe.titre}</h3>
                    <span className="rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                      {groupe.statut}
                    </span>
                  </div>
                  <p className="mt-3">{groupe.texte}</p>
                  {groupe.items.length > 0 ? (
                    <div className="mt-4 overflow-hidden rounded-xl border border-border/70">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted/70 text-muted-foreground">
                          <tr>
                            <th className="p-3 font-semibold">Nom</th>
                            <th className="p-3 font-semibold">Durée</th>
                            <th className="p-3 font-semibold">Fonction</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupe.items.map((item) => (
                            <tr key={item.nom} className="border-t border-border/60">
                              <td className="p-3 font-medium text-foreground">{item.nom}</td>
                              <td className="p-3">{item.duree}</td>
                              <td className="p-3">{item.fonction}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">Gérer vos préférences</h2>
          <p className="mt-3">
            Le site ne déposant que des cookies strictement nécessaires, aucun bandeau de
            consentement n'est affiché à ce jour. Vous pouvez à tout moment supprimer ou bloquer les
            cookies et le stockage local dans les réglages de votre navigateur ; certaines
            fonctionnalités (connexion à l'espace formateur, brouillon de candidature) peuvent alors
            ne plus fonctionner. Si des cookies soumis à consentement étaient ajoutés, un bandeau
            vous permettrait de les accepter ou de les refuser aussi simplement l'un que l'autre, et
            de modifier votre choix à tout moment.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">En savoir plus</h2>
          <p className="mt-3">
            Le traitement des données personnelles est détaillé dans notre{" "}
            <Link to="/politique-de-confidentialite" className="font-medium text-primary underline">
              politique de confidentialité
            </Link>
            . Pour toute question, écrivez à{" "}
            <a href="mailto:pedagogie@formatrix.fr" className="font-medium text-primary underline">
              pedagogie@formatrix.fr
            </a>
            .
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
