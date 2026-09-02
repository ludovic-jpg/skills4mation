import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Etoiles } from "@/components/formations/Etoiles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

type Avis = {
  id: string;
  note: number;
  commentaire: string | null;
  created_at: string;
  apprenant_id: string;
};

/** Avis des apprenants sur une formation publiée : moyenne, liste et dépôt d'avis. */
export function AvisSection({ formationId }: { formationId: string }) {
  const qc = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [prenom, setPrenom] = useState<string>("");
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState("");

  useEffect(() => {
    let actif = true;
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (!actif) return;
      setUserId(data.user?.id ?? null);
      setPrenom(String(data.user?.user_metadata?.["prenom"] ?? "").trim());
    })();
    return () => {
      actif = false;
    };
  }, []);

  const avis = useQuery({
    queryKey: ["formation-avis", formationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formation_avis")
        .select("id, note, commentaire, created_at, apprenant_id")
        .eq("formation_id", formationId)
        .eq("statut", "publie")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Avis[];
    },
  });

  const liste = avis.data ?? [];
  const moyenne = liste.length
    ? liste.reduce((somme, a) => somme + a.note, 0) / liste.length
    : 0;
  const monAvis = liste.find((a) => a.apprenant_id === userId);

  const envoyer = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Connectez-vous pour laisser un avis.");
      if (note < 1) throw new Error("Choisissez une note de 1 à 5 étoiles.");
      const { error } = await supabase.from("formation_avis").upsert(
        {
          formation_id: formationId,
          apprenant_id: userId,
          note,
          commentaire: commentaire.trim().slice(0, 2000) || null,
        },
        { onConflict: "formation_id,apprenant_id" },
      );
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("Merci ! Votre avis est publié.");
      setCommentaire("");
      await qc.invalidateQueries({ queryKey: ["formation-avis", formationId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card className="rounded-2xl border-border/70">
      <CardContent className="grid gap-5 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold">Avis des apprenants</h2>
          {liste.length ? (
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Etoiles note={moyenne} />
              {moyenne.toFixed(1)} / 5 · {liste.length} avis
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Aucun avis pour le moment.</span>
          )}
        </div>

        {liste.length ? (
          <ul className="grid gap-3">
            {liste.map((a) => (
              <li key={a.id} className="rounded-xl border border-border p-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Etoiles note={a.note} />
                  <span className="text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString("fr-FR")}
                  </span>
                  {a.apprenant_id === userId ? (
                    <span className="text-xs font-medium text-secondary">Votre avis</span>
                  ) : null}
                </div>
                {a.commentaire ? <p className="mt-2 whitespace-pre-line">{a.commentaire}</p> : null}
              </li>
            ))}
          </ul>
        ) : null}

        {userId ? (
          <div className="grid gap-3 rounded-xl bg-muted/40 p-4">
            <p className="text-sm font-semibold">
              {monAvis ? "Modifier mon avis" : "Donner mon avis"}
              {prenom ? ` — ${prenom}` : ""}
            </p>
            <Etoiles note={note || monAvis?.note || 0} taille="size-6" onSelect={setNote} />
            <div className="grid gap-1.5">
              <Label htmlFor="avis-commentaire">Votre commentaire</Label>
              <Textarea
                id="avis-commentaire"
                rows={3}
                value={commentaire}
                placeholder="Ce que la formation et le formateur vous ont apporté"
                onChange={(e) => setCommentaire(e.target.value)}
              />
            </div>
            <Button
              variant="cta"
              className="justify-self-start"
              disabled={envoyer.isPending}
              onClick={() => envoyer.mutate()}
            >
              {envoyer.isPending ? "Envoi…" : monAvis ? "Mettre à jour mon avis" : "Publier mon avis"}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Connectez-vous à votre espace apprenant pour noter cette formation et son formateur.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
