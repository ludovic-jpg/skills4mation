import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { ClipboardList, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formulaireDe } from "@/lib/dossier/formulaires";
import { repondreFormulaire } from "@/lib/dossier-formulaires.functions";

/**
 * Formulaire générique rempli en ligne par l'apprenant (Recueil des besoins, Satisfaction).
 * Aucun fichier n'est manipulé : le PDF récapitulatif est généré et archivé côté serveur.
 */
export function FormulaireEnvoi({
  envoi,
  onDone,
}: {
  envoi: { id: string; code: string; label: string };
  onDone?: () => void;
}) {
  const def = formulaireDe(envoi.code);
  const queryClient = useQueryClient();
  const repondre = useServerFn(repondreFormulaire);
  const [reponses, setReponses] = useState<Record<string, string>>({});

  const soumettre = useMutation({
    mutationFn: async () => repondre({ data: { envoiId: envoi.id, reponses } }),
    onSuccess: () => {
      toast.success("Réponses transmises : votre formateur est notifié.");
      void queryClient.invalidateQueries({ queryKey: ["apprenant-documents"] });
      onDone?.();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!def) return null;

  const set = (id: string, valeur: string) => setReponses((prev) => ({ ...prev, [id]: valeur }));

  return (
    <Card className="rounded-2xl border-border/70 shadow-soft">
      <CardContent className="grid gap-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <ClipboardList className="size-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">
            {envoi.code} — {def.titre}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">{def.intro}</p>

        <div className="grid gap-4 sm:max-w-2xl">
          {def.champs.map((champ) => (
            <div key={champ.id} className="grid gap-2">
              <Label>
                {champ.label}
                {champ.requis ? <span className="text-destructive"> *</span> : null}
              </Label>
              {champ.type === "long" ? (
                <Textarea
                  rows={3}
                  value={reponses[champ.id] ?? ""}
                  onChange={(e) => set(champ.id, e.target.value)}
                />
              ) : champ.type === "choix" || champ.type === "note" ? (
                <Select
                  value={reponses[champ.id] ?? ""}
                  onValueChange={(valeur) => set(champ.id, valeur)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {(champ.options ?? []).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={reponses[champ.id] ?? ""}
                  onChange={(e) => set(champ.id, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <div>
          <Button
            variant="cta"
            disabled={soumettre.isPending}
            onClick={() => soumettre.mutate()}
          >
            <Send className="size-4" /> Envoyer mes réponses
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            À la validation, un récapitulatif PDF est généré et archivé automatiquement dans votre
            dossier de formation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
