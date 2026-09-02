import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Etoiles } from "@/components/formations/Etoiles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type Avis = {
  id: string;
  note: number;
  commentaire: string | null;
  statut: string;
  created_at: string;
};

/** Modération des avis par le formateur propriétaire de la formation. */
export function AvisModeration({ formationId }: { formationId: string }) {
  const qc = useQueryClient();

  const avis = useQuery({
    queryKey: ["formation-avis-moderation", formationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formation_avis")
        .select("id, note, commentaire, statut, created_at")
        .eq("formation_id", formationId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Avis[];
    },
  });

  const basculer = useMutation({
    mutationFn: async (a: Avis) => {
      const { error } = await supabase
        .from("formation_avis")
        .update({ statut: a.statut === "publie" ? "masque" : "publie" })
        .eq("id", a.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("Avis mis à jour.");
      await qc.invalidateQueries({ queryKey: ["formation-avis-moderation", formationId] });
    },
    onError: () => toast.error("Modification impossible."),
  });

  const liste = avis.data ?? [];

  return (
    <Card className="rounded-2xl border-border/70 shadow-soft">
      <CardContent className="grid gap-4 p-6">
        <h2 className="text-base font-semibold">Avis des apprenants ({liste.length})</h2>
        {liste.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun avis déposé sur cette formation.</p>
        ) : null}
        {liste.map((a) => (
          <div
            key={a.id}
            className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border p-4 text-sm"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Etoiles note={a.note} />
                <span className="text-xs text-muted-foreground">
                  {new Date(a.created_at).toLocaleDateString("fr-FR")}
                </span>
                <Badge variant={a.statut === "publie" ? "outline" : "secondary"}>
                  {a.statut === "publie" ? "Publié" : "Masqué"}
                </Badge>
              </div>
              {a.commentaire ? <p className="mt-2 whitespace-pre-line">{a.commentaire}</p> : null}
            </div>
            <Button variant="outline" size="sm" onClick={() => basculer.mutate(a)}>
              {a.statut === "publie" ? (
                <>
                  <EyeOff className="mr-2 size-4" /> Masquer
                </>
              ) : (
                <>
                  <Eye className="mr-2 size-4" /> Publier
                </>
              )}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
