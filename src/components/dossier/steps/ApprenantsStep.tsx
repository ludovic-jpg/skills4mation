import { Plus, Trash2 } from "lucide-react";

import { ApprenantEmailField } from "@/components/dossier/SuggestionFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { StepProps } from "@/components/dossier/steps/types";
import { estCpf } from "@/lib/dossier/types";

export function ApprenantsStep({
  d,
  setD,
  errors,
  formateurId,
}: StepProps & { formateurId?: string | undefined }) {
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        Les apprenants alimentent la convention, le planning, les convocations, les émargements et
        les attestations.
      </p>
      {errors["apprenants"] ? (
        <p className="text-xs text-destructive">{errors["apprenants"]}</p>
      ) : null}
      {d.apprenants.map((a, i) => (
        <div key={i} className="grid gap-2 rounded-xl border border-border/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Apprenant {i + 1}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setD({ ...d, apprenants: d.apprenants.filter((_, j) => j !== i) })}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="Prénom et nom"
              value={a.nom}
              onChange={(e) =>
                setD({
                  ...d,
                  apprenants: d.apprenants.map((x, j) =>
                    j === i ? { ...x, nom: e.target.value } : x,
                  ),
                })
              }
            />
            <Input
              placeholder="Poste / fonction"
              value={a.poste}
              onChange={(e) =>
                setD({
                  ...d,
                  apprenants: d.apprenants.map((x, j) =>
                    j === i ? { ...x, poste: e.target.value } : x,
                  ),
                })
              }
            />
            <ApprenantEmailField
              value={a.email ?? ""}
              formateurId={formateurId}
              onChange={(v) =>
                setD({
                  ...d,
                  apprenants: d.apprenants.map((x, j) => (j === i ? { ...x, email: v } : x)),
                })
              }
              onReprendre={(s) =>
                setD({
                  ...d,
                  apprenants: d.apprenants.map((x, j) =>
                    j === i
                      ? {
                          ...x,
                          nom: x.nom.trim() || `${s.prenom} ${s.nom}`.trim(),
                          telephone: x.telephone || s.telephone || "",
                        }
                      : x,
                  ),
                })
              }
            />
            <Input
              placeholder="Téléphone"
              value={a.telephone ?? ""}
              onChange={(e) =>
                setD({
                  ...d,
                  apprenants: d.apprenants.map((x, j) =>
                    j === i ? { ...x, telephone: e.target.value } : x,
                  ),
                })
              }
            />
            {estCpf(d) ? (
              <Input
                placeholder="Numéro de dossier CPF"
                value={a.numeroCpf ?? ""}
                onChange={(e) =>
                  setD({
                    ...d,
                    apprenants: d.apprenants.map((x, j) =>
                      j === i ? { ...x, numeroCpf: e.target.value } : x,
                    ),
                  })
                }
              />
            ) : null}
            <Input
              placeholder="Certification visée (ex. ICDL)"
              value={a.certification ?? ""}
              onChange={(e) =>
                setD({
                  ...d,
                  apprenants: d.apprenants.map((x, j) =>
                    j === i ? { ...x, certification: e.target.value } : x,
                  ),
                })
              }
            />
          </div>
          {errors[`apprenant-${i}`] ? (
            <p className="text-xs text-destructive">{errors[`apprenant-${i}`]}</p>
          ) : null}
        </div>
      ))}
      <Button
        variant="outline"
        className="justify-self-start"
        onClick={() => setD({ ...d, apprenants: [...d.apprenants, { nom: "", poste: "" }] })}
      >
        <Plus className="mr-1.5 size-4" /> Ajouter un apprenant
      </Button>
    </div>
  );
}
