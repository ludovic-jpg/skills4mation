import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, FileText, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

/**
 * Espace de mise à disposition simple : supports de cours, grilles d'évaluation
 * complétées, comptes-rendus. Aucun circuit de signature (voir EnvoisPanel).
 */
export function SupportsPanel({
  dossierId,
  formateurId,
}: {
  dossierId: string;
  formateurId: string;
}) {
  const queryClient = useQueryClient();
  const [titre, setTitre] = useState("");
  const [busy, setBusy] = useState(false);
  const key = ["dossier-supports", dossierId];

  const { data: supports } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supports_pedagogiques")
        .select("id, titre, type, fichier_url, visible_apprenants, created_at")
        .eq("dossier_id", dossierId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
      const path = `supports/${dossierId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("documents")
        .upload(path, file, { upsert: true, contentType: file.type || "application/pdf" });
      if (upErr) throw new Error("Dépôt du fichier impossible.");
      const { error } = await supabase.from("supports_pedagogiques").insert({
        dossier_id: dossierId,
        formateur_id: formateurId,
        titre: titre.trim() || file.name,
        type: ext === "pdf" ? "pdf" : "autre",
        fichier_url: path,
      });
      if (error) throw new Error("Enregistrement impossible.");
    },
    onSuccess: () => {
      toast.success("Support déposé.");
      setTitre("");
      void queryClient.invalidateQueries({ queryKey: key });
    },
    onError: (error: Error) => toast.error(error.message),
    onSettled: () => setBusy(false),
  });

  const basculer = useMutation({
    mutationFn: async ({ id, visible }: { id: string; visible: boolean }) => {
      const { error } = await supabase
        .from("supports_pedagogiques")
        .update({ visible_apprenants: visible })
        .eq("id", id);
      if (error) throw new Error("Mise à jour impossible.");
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: key }),
    onError: (error: Error) => toast.error(error.message),
  });

  const supprimer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("supports_pedagogiques").delete().eq("id", id);
      if (error) throw new Error("Suppression impossible.");
    },
    onSuccess: () => {
      toast.success("Support supprimé.");
      void queryClient.invalidateQueries({ queryKey: key });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  async function ouvrir(path: string) {
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, 300);
    if (error || !data) {
      toast.error("Document indisponible.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noreferrer");
  }

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="grid gap-4 p-6 sm:max-w-xl">
          <div>
            <h2 className="text-base font-semibold">Déposer un support</h2>
            <p className="text-sm text-muted-foreground">
              Supports de cours, grilles d'évaluation complétées, comptes-rendus. Aucune signature
              n'est demandée aux apprenants.
            </p>
          </div>
          <div className="grid gap-2">
            <Label>Titre du support</Label>
            <Input
              value={titre}
              placeholder="Ex. Grille d'évaluation complétée — session 1"
              onChange={(e) => setTitre(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Fichier</Label>
            <Input
              type="file"
              disabled={busy || upload.isPending}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                setBusy(true);
                upload.mutate(file);
              }}
            />
            <p className="text-xs text-muted-foreground">
              <Upload className="mr-1 inline size-3" />
              Si aucun titre n'est saisi, le nom du fichier est utilisé.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="grid gap-3 p-6">
          <h2 className="text-base font-semibold">Supports du dossier</h2>
          {(supports ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun support déposé pour ce dossier.</p>
          ) : (
            (supports ?? []).map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 p-4 text-sm"
              >
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate font-medium">{s.titre}</span>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch
                    checked={s.visible_apprenants}
                    onCheckedChange={(checked) =>
                      basculer.mutate({ id: s.id, visible: checked === true })
                    }
                  />
                  Visible par les apprenants
                </label>
                <Button size="sm" variant="outline" onClick={() => void ouvrir(s.fichier_url)}>
                  <Download className="size-3.5" /> Télécharger
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => supprimer.mutate(s.id)}
                  aria-label="Supprimer le support"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
