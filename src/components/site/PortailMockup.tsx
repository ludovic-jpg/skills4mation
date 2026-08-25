import { useState } from "react";
import {
  Archive,
  CheckCircle2,
  Clock,
  FileSignature,
  FolderCheck,
  PenTool,
  Star,
  UserCog,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Ecran = {
  id: string;
  label: string;
  icon: typeof UserCog;
  titre: string;
  sousTitre: string;
  render: () => React.ReactNode;
};

function Champ({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-sm font-medium">{valeur}</p>
    </div>
  );
}

function LigneDoc({
  nom,
  etat,
  ton,
}: {
  nom: string;
  etat: string;
  ton: "ok" | "attente" | "signe";
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background px-3 py-2">
      <span className="truncate text-sm">{nom}</span>
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
          ton === "ok" && "bg-secondary/15 text-secondary",
          ton === "signe" && "bg-cta/20 text-cta-foreground",
          ton === "attente" && "bg-muted text-muted-foreground",
        )}
      >
        {etat}
      </span>
    </div>
  );
}

const ECRANS: Ecran[] = [
  {
    id: "profil",
    label: "Profil formateur",
    icon: UserCog,
    titre: "Mon profil formateur",
    sousTitre: "Expertises, CV, références : votre vitrine et vos preuves de compétence.",
    render: () => (
      <div className="grid gap-2 sm:grid-cols-2">
        <Champ label="Formateur" valeur="Camille Rousseau" />
        <Champ label="SIRET" valeur="912 345 678 00019" />
        <Champ label="Domaines" valeur="Management · Soft skills" />
        <Champ label="Tarif jour" valeur="900 € HT" />
        <div className="sm:col-span-2">
          <LigneDoc nom="CV à jour (PDF)" etat="Validé" ton="ok" />
        </div>
        <div className="sm:col-span-2">
          <LigneDoc nom="Attestation de compétences" etat="Validé" ton="ok" />
        </div>
      </div>
    ),
  },
  {
    id: "pieces",
    label: "Pièces & dossier 48h",
    icon: FolderCheck,
    titre: "Dossier formation — conforme Qualiopi",
    sousTitre: "Pièces administratives et pédagogiques générées et contrôlées en 48h.",
    render: () => (
      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded-lg bg-secondary/10 px-3 py-2 text-xs font-semibold text-secondary">
          <Clock className="size-4" aria-hidden /> Dossier n°2418 · complété en 41h
        </div>
        <LigneDoc nom="Convention de formation" etat="Généré" ton="ok" />
        <LigneDoc nom="Programme & objectifs" etat="Généré" ton="ok" />
        <LigneDoc nom="Devis / facture financeur" etat="Généré" ton="ok" />
        <LigneDoc nom="Feuilles d'émargement" etat="À signer" ton="attente" />
        <LigneDoc nom="Questionnaire de satisfaction" etat="Planifié" ton="attente" />
      </div>
    ),
  },
  {
    id: "signature",
    label: "Signature",
    icon: PenTool,
    titre: "Signature électronique",
    sousTitre: "Formateur, stagiaire et financeur signent en ligne, horodaté.",
    render: () => (
      <div className="space-y-3">
        <LigneDoc nom="Convention — Skills4mation" etat="Signé" ton="signe" />
        <LigneDoc nom="Convention — Client" etat="Signé" ton="signe" />
        <LigneDoc nom="Contrat de sous-traitance" etat="En attente" ton="attente" />
        <div className="rounded-lg border border-dashed border-border p-4 text-center">
          <FileSignature className="mx-auto size-6 text-secondary" aria-hidden />
          <p className="mt-2 text-xs text-muted-foreground">
            Signature en 2 clics — aucun scan, aucun envoi papier.
          </p>
          <Button size="sm" variant="cta" className="mt-3" type="button" disabled>
            Signer maintenant
          </Button>
        </div>
      </div>
    ),
  },
  {
    id: "archivage",
    label: "Archivage & KPI",
    icon: Archive,
    titre: "Archivage et suivi",
    sousTitre: "Historique complet, prêt pour l'audit, et vos indicateurs en temps réel.",
    render: () => (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { k: "Dossiers", v: "24" },
            { k: "Satisfaction", v: "4,8/5" },
            { k: "Recommandations", v: "11" },
          ].map((s) => (
            <div key={s.k} className="rounded-lg border border-border/70 bg-background p-3">
              <p className="text-lg font-semibold">{s.v}</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.k}</p>
            </div>
          ))}
        </div>
        <LigneDoc nom="Archive 2026 — 12 dossiers" etat="Sécurisé" ton="ok" />
        <LigneDoc nom="Archive 2025 — 12 dossiers" etat="Sécurisé" ton="ok" />
        <div className="flex items-center gap-2 rounded-lg bg-cta/15 px-3 py-2 text-xs font-semibold text-cta-foreground">
          <Star className="size-4" aria-hidden /> Statut Ambassadeur — niveau 2
        </div>
      </div>
    ),
  },
];

export function PortailMockup() {
  const [actif, setActif] = useState(ECRANS[0]!.id);
  const ecran = ECRANS.find((e) => e.id === actif) ?? ECRANS[0]!;

  return (
    <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-elevated">
      <div className="flex items-center gap-2 border-b border-border/70 bg-muted/60 px-4 py-3">
        <span className="size-2.5 rounded-full bg-destructive/60" />
        <span className="size-2.5 rounded-full bg-cta/70" />
        <span className="size-2.5 rounded-full bg-secondary/70" />
        <p className="ml-3 truncate text-xs text-muted-foreground">
          portail.skills4mation.com / mes-dossiers
        </p>
      </div>

      <div className="grid gap-0 md:grid-cols-[210px_1fr]">
        <nav className="flex gap-1 overflow-x-auto border-b border-border/70 p-3 md:flex-col md:overflow-visible md:border-b-0 md:border-r">
          {ECRANS.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setActif(e.id)}
              aria-current={e.id === actif}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors",
                e.id === actif
                  ? "bg-gradient-teal text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <e.icon className="size-4 shrink-0" aria-hidden />
              {e.label}
            </button>
          ))}
        </nav>

        <div className="p-5">
          <h3 className="text-base font-semibold">{ecran.titre}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{ecran.sousTitre}</p>
          <div className="mt-4">{ecran.render()}</div>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="size-4 text-secondary" aria-hidden /> Aperçu de l'interface —
            visuel de démonstration.
          </p>
        </div>
      </div>
    </div>
  );
}
