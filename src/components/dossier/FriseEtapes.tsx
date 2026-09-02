import { CRM_STATUTS, type CrmStatut } from "@/lib/crm";
import { TONE_CLASSES } from "@/lib/statuts";
import { cn } from "@/lib/utils";

/**
 * Regroupement visuel des 11 statuts de `CRM_PIPELINE` sous 4 grandes étapes.
 * Aucun nouveau pipeline n'est défini ici : seule la présentation est regroupée.
 */
export const ETAPES_DOSSIER = [
  {
    cle: "A" as const,
    titre: "Recueil des besoins + test de positionnement",
    statuts: ["brouillon", "demande_validation"] as CrmStatut[],
  },
  {
    cle: "B" as const,
    titre: "Demande de financement",
    statuts: ["dossier_valide", "demande_financement"] as CrmStatut[],
  },
  {
    cle: "C" as const,
    titre: "Obtention du financement",
    statuts: ["accord_financement", "finalisation_administrative"] as CrmStatut[],
  },
  {
    cle: "D" as const,
    titre: "Fin de la formation",
    statuts: [
      "formation_en_cours",
      "formation_realisee",
      "demande_paiement",
      "paiement",
      "paiement_organisme",
      "paiement_formateur",
    ] as CrmStatut[],
  },
];

export type EtapeCle = (typeof ETAPES_DOSSIER)[number]["cle"];

export function etapeDeStatut(statut: CrmStatut): EtapeCle | null {
  return ETAPES_DOSSIER.find((e) => e.statuts.includes(statut))?.cle ?? null;
}

export function FriseEtapes({ statut }: { statut: CrmStatut }) {
  const active = etapeDeStatut(statut);
  const tone = CRM_STATUTS[statut]?.tone ?? "neutral";
  const indexActif = ETAPES_DOSSIER.findIndex((e) => e.cle === active);

  return (
    <ol className="grid gap-3 sm:grid-cols-4">
      {ETAPES_DOSSIER.map((etape, index) => {
        const estActive = etape.cle === active;
        const passee = indexActif > -1 && index < indexActif;
        return (
          <li
            key={etape.cle}
            className={cn(
              "rounded-2xl border p-4 transition-colors",
              estActive
                ? TONE_CLASSES[tone]
                : passee
                  ? "border-border/70 bg-muted/60 text-foreground"
                  : "border-dashed border-border/70 text-muted-foreground",
            )}
          >
            <p className="text-xs font-bold uppercase tracking-wide opacity-80">
              Étape {etape.cle}
            </p>
            <p className="mt-1 text-sm font-semibold leading-snug">{etape.titre}</p>
            {estActive ? (
              <p className="mt-2 text-xs font-medium opacity-90">
                {CRM_STATUTS[statut]?.label}
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
