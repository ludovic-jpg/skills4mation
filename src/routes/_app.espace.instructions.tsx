import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Banknote,
  FileSignature,
  FolderPlus,
  GraduationCap,
  UserCog,
} from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { FORMATEUR_NAV } from "@/components/app/nav";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_app/espace/instructions")({
  component: Instructions,
  head: () => ({
    meta: [
      { title: "Instructions du portage Qualiopi | Skills4mation" },
      {
        name: "description",
        content:
          "Mode d'emploi du portail Skills4mation : profil, pièces de candidature, création d'un dossier, validation, financement et paiement.",
      },
      { property: "og:title", content: "Instructions du portage Qualiopi" },
      {
        property: "og:description",
        content: "Chaque étape du portage Qualiopi Skills4mation, expliquée pas à pas.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const ETAPES = [
  {
    icon: UserCog,
    titre: "1. Complétez votre profil et vos pièces",
    texte:
      "Identité, entreprise, SIRET, numéro de déclaration d'activité et région de dépôt, CV, parcours de formation et déroulé pédagogique. Ces informations alimentent automatiquement tous vos dossiers.",
  },
  {
    icon: GraduationCap,
    titre: "2. Créez vos formations",
    texte:
      "Programme, objectifs, durée, modalités, tarifs HT et visuel. Une formation enregistrée est réutilisable en un clic dans chaque dossier et peut être publiée sur le catalogue public.",
  },
  {
    icon: FolderPlus,
    titre: "3. Ouvrez un dossier de formation",
    texte:
      "Un numéro ADF unique est attribué dès la création. Renseignez l'entreprise, la formation, les sessions, les apprenants et les tarifs : le prix total se calcule automatiquement (prix unitaire × stagiaires).",
  },
  {
    icon: FileSignature,
    titre: "4. Demandez la validation",
    texte:
      "Quand le dossier est complet, cliquez sur « Demander la validation ». Le dossier est verrouillé et transmis à l'équipe Skills4mation, qui contrôle les pièces puis appose la signature de l'organisme.",
  },
  {
    icon: Banknote,
    titre: "5. Financement et paiement",
    texte:
      "Selon le mode de financement, la demande OPCO ou le lien CPF vous est transmis par e-mail. Vous êtes payé sous 10 jours ouvrés à réception des fonds du financeur.",
  },
  {
    icon: BadgeCheck,
    titre: "6. Traçabilité pédagogique",
    texte:
      "Recueil des besoins, convocations, émargements, évaluations : chaque pièce signée est archivée automatiquement dans le dossier et sur Google Drive, prête pour un audit Qualiopi.",
  },
];

function Instructions() {
  return (
    <AppShell
      items={FORMATEUR_NAV}
      title="Instructions"
      subtitle="Le mode d'emploi complet de votre portage Qualiopi Skills4mation"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        {ETAPES.map((etape) => (
          <Card key={etape.titre} className="rounded-2xl border-border/70 shadow-soft">
            <CardContent className="flex gap-4 p-6">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                <etape.icon className="size-5" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">{etape.titre}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{etape.texte}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 rounded-2xl border-cta/40 bg-cta/10">
        <CardContent className="p-6">
          <h2 className="text-sm font-semibold">Règles de commissionnement</h2>
          <ul className="mt-3 grid gap-1.5 text-sm text-muted-foreground">
            <li>Portage Qualiopi : 25 % jusqu'à 50 000 € de CA porté, 23 % jusqu'à 100 000 €, 20 % au-delà.</li>
            <li>Portage CPF : 30 %, plus le coût de la certification répercuté au prix coûtant.</li>
            <li>Formations exonérées de TVA : tous les montants sont exprimés en HT.</li>
          </ul>
          <p className="mt-4 text-sm">
            Une question ?{" "}
            <Link to="/espace/dossiers" className="font-semibold underline">
              Consultez vos dossiers
            </Link>{" "}
            ou écrivez à contact@skills4mation.com.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
