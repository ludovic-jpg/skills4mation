import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, FileText, Trash2, Upload, Users } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

const AUCUNE = "__aucune__";

/**
 * Supports de cours "génériques" du formateur : indépendants d'un dossier
 * (dossier_id = null). Le partage se fait soit par formation du catalogue,
 * soit par sélection d'apprenants précis.
 */
export function SupportsCoursPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [titre, setTitre] = useState("");
  const [formationId, setFormationId] = useState<string>(AUCUNE);
  const [apprenantIds, setApprenantIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const key = ["supports-generiques", user?.id];

  const { data: formations } = useQuery({
    queryKey: ["supports-formations", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formations_catalogue")
        .select("id, titre")
        .eq("formateur_id", user!.id)
        .order("titre");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: apprenants } = useQuery({
    queryKey: ["supports-apprenants-liste", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossier_apprenants")
        .select("id, prenom, nom, email, dossiers(titre_formation)")
        .eq("formateur_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: supports } = useQuery({
    queryKey: key,
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supports_pedagogiques")
        .select(
          "id, titre, type, fichier_url, visible_apprenants, created_at, formation_id, formations_catalogue(titre), supports_apprenants(apprenant_id, dossier_apprenants(prenom, nom))",
        )
        .eq("formateur_id", user!.id)
        .is("dossier_id", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
      const path = `supports/generiques/${user!.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("documents")
        .upload(path, file, { upsert: true, contentType: file.type || "application/pdf" });
      if (upErr) throw new Error("Dépôt du fichier impossible.");
      const { data: inserted, error } = await supabase
        .from("supports_pedagogiques")
        .insert({
          dossier_id: null,
          formateur_id: user!.id,
          formation_id: formationId === AUCUNE ? null : formationId,
          titre: titre.trim() || file.name,
          type: ext === "pdf" ? "pdf" : "autre",
          fichier_url: path,
        })
        .select("id")
        .single();
      if (error || !inserted) throw new Error("Enregistrement impossible.");
      if (apprenantIds.length > 0) {
        const { error: linkErr } = await supabase.from("supports_apprenants").insert(
          apprenantIds.map((apprenant_id) => ({
            support_id: inserted.id,
            apprenant_id,
          })),
        );
        if (linkErr) throw new Error("Partage avec les apprenants impossible.");
      }
    },
    onSuccess: () => {
      toast.success("Support déposé.");
      setTitre("");
      setFormationId(AUCUNE);
      setApprenantIds([]);
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
        <CardContent className="grid gap-4 p-6">
          <div>
            <h2 className="text-base font-semibold">Déposer un support de cours</h2>
            <p className="text-sm text-muted-foreground">
              PDF, présentation ou tout autre document. Choisissez une formation pour le partager
              avec tous ses apprenants, ou sélectionnez des apprenants précis.
            </p>
          </div>

          <div className="grid gap-2 sm:max-w-xl">
            <Label>Titre du support</Label>
            <Input
              value={titre}
              placeholder="Ex. Support de cours — module 1"
              onChange={(e) => setTitre(e.target.value)}
            />
          </div>

          <div className="grid gap-2 sm:max-w-xl">
            <Label>Formation associée (optionnel)</Label>
            <Select value={formationId} onValueChange={setFormationId}>
              <SelectTrigger>
                <SelectValue placeholder="Aucune formation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AUCUNE}>Aucune formation</SelectItem>
                {(formations ?? []).map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.titre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Tous les apprenants suivant cette formation y auront accès.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>
              <Users className="mr-1 inline size-3.5" />
              Apprenants destinataires (optionnel)
            </Label>
            {(apprenants ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun apprenant enregistré.</p>
            ) : (
              <div className="grid max-h-56 gap-2 overflow-y-auto rounded-xl border border-border/70 p-3">
                {(apprenants ?? []).map((a) => (
                  <label key={a.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={apprenantIds.includes(a.id)}
                      onCheckedChange={(checked) =>
                        setApprenantIds((prev) =>
                          checked === true ? [...prev, a.id] : prev.filter((id) => id !== a.id),
                        )
                      }
                    />
                    <span className="font-medium">
                      {a.prenom} {a.nom}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {a.dossiers?.titre_formation ?? a.email}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-2 sm:max-w-xl">
            <Label>Fichier</Label>
            <Input
              type="file"
              disabled={busy || upload.isPending || !user}
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
          <h2 className="text-base font-semibold">Mes supports de cours</h2>
          {(supports ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun support déposé pour le moment.</p>
          ) : (
            (supports ?? []).map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 p-4 text-sm"
              >
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{s.titre}</p>
                  <p className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                    {s.formations_catalogue?.titre ? (
                      <Badge variant="secondary">{s.formations_catalogue.titre}</Badge>
                    ) : null}
                    {(s.supports_apprenants ?? []).length > 0 ? (
                      <span>
                        {(s.supports_apprenants ?? [])
                          .map(
                            (sa) =>
                              `${sa.dossier_apprenants?.prenom ?? ""} ${sa.dossier_apprenants?.nom ?? ""}`.trim(),
                          )
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    ) : null}
                    {!s.formation_id && (s.supports_apprenants ?? []).length === 0
                      ? "Aucun destinataire — non partagé"
                      : null}
                  </p>
                </div>
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
