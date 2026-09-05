import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CheckCircle2, ExternalLink, RefreshCw, Send, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  envoyerDocumentApprenant,
  synchroniserApprenants,
} from "@/lib/dossier-envois.functions";
import { documentsApplicables } from "@/lib/dossier/html";
import type { DossierDonnees } from "@/lib/dossier/types";

const STATUTS: Record<string, string> = {
  brouillon: "Brouillon",
  envoye: "Envoyé — en attente de signature",
  recu: "Document signé reçu",
  archive: "Signé et archivé (Drive)",
};

export function EnvoisPanel({
  dossierId,
  donnees,
}: {
  dossierId: string;
  donnees: DossierDonnees;
}) {
  const queryClient = useQueryClient();
  const docs = useMemo(() => documentsApplicables(donnees), [donnees]);
  const [code, setCode] = useState(docs[0]?.code ?? "3A");
  const [selection, setSelection] = useState<string[]>([]);
  const [html, setHtml] = useState<string | null>(null);

  const sync = useServerFn(synchroniserApprenants);
  const envoyer = useServerFn(envoyerDocumentApprenant);

  const doc = docs.find((d) => d.code === code) ?? docs[0];
  const contenu = html ?? (doc ? doc.build(donnees) : "");

  const { data: apprenants } = useQuery({
    queryKey: ["dossier-apprenants", dossierId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossier_apprenants")
        .select("id, prenom, nom, email, user_id")
        .eq("dossier_id", dossierId)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: envois } = useQuery({
    queryKey: ["dossier-envois", dossierId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_envois")
        .select("id, code, label, statut, drive_url, sent_at, received_at, apprenant_id")
        .eq("dossier_id", dossierId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => sync({ data: { dossierId } }),
    onSuccess: (result) => {
      toast.success(`${result.count} apprenant(s) synchronisé(s).`);
      void queryClient.invalidateQueries({ queryKey: ["dossier-apprenants", dossierId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const envoiMutation = useMutation({
    mutationFn: async () => {
      if (!doc) throw new Error("Aucun document sélectionné.");
      if (selection.length === 0) throw new Error("Sélectionnez au moins un apprenant.");
      for (const apprenantId of selection) {
        await envoyer({
          data: {
            dossierId,
            apprenantId,
            code: doc.code,
            label: doc.label,
            contenuHtml: contenu,
          },
        });
      }
      return selection.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} document(s) archivé(s) dans Drive et transmis à l'espace apprenant.`);
      setSelection([]);
      void queryClient.invalidateQueries({ queryKey: ["dossier-envois", dossierId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const nomApprenant = (id: string | null) => {
    const a = apprenants?.find((x) => x.id === id);
    return a ? `${a.prenom} ${a.nom}`.trim() || a.email : "—";
  };

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <h2 className="text-base font-semibold">Apprenants du dossier</h2>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={syncMutation.isPending}
              onClick={() => syncMutation.mutate()}
            >
              <RefreshCw className="mr-1.5 size-4" /> Synchroniser depuis le formulaire
            </Button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Chaque apprenant accède à son espace personnel (profil, documents, dépôt des pièces
            signées) en créant un compte avec l'adresse e-mail renseignée ici.
          </p>
          <div className="mt-4 grid gap-2">
            {(apprenants ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun apprenant enregistré : synchronisez depuis le formulaire du dossier.
              </p>
            ) : (
              (apprenants ?? []).map((a) => (
                <label
                  key={a.id}
                  className="flex items-center gap-3 rounded-xl border border-border/70 px-3 py-2 text-sm"
                >
                  <Checkbox
                    checked={selection.includes(a.id)}
                    onCheckedChange={(checked) =>
                      setSelection((prev) =>
                        checked ? [...prev, a.id] : prev.filter((x) => x !== a.id),
                      )
                    }
                  />
                  <span className="font-medium">{`${a.prenom} ${a.nom}`.trim() || a.email}</span>
                  <span className="text-muted-foreground">{a.email}</span>
                  {a.user_id ? (
                    <span className="ml-auto inline-flex items-center gap-1 text-xs text-success">
                      <CheckCircle2 className="size-3.5" /> compte actif
                    </span>
                  ) : (
                    <span className="ml-auto text-xs text-muted-foreground">compte à créer</span>
                  )}
                </label>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="p-6">
          <h2 className="text-base font-semibold">Document à faire signer</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choisissez le document puis transmettez-le à l'apprenant : il est généré et publié
            automatiquement dans son espace personnel.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-[280px_1fr] sm:items-end">
            <div className="grid gap-2">
              <Label>Document</Label>
              <Select value={code} onValueChange={(value) => setCode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {docs.map((d) => (
                    <SelectItem key={d.code} value={d.code}>
                      {d.code} — {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="cta"
                disabled={envoiMutation.isPending}
                onClick={() => envoiMutation.mutate()}
              >
                <Send className="mr-1.5 size-4" />
                {envoiMutation.isPending ? "Transmission…" : "Transmettre"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="p-6">
          <h2 className="text-base font-semibold">Suivi des signatures</h2>
          <div className="mt-3 grid gap-2">
            {(envois ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun document transmis pour l'instant.</p>
            ) : (
              (envois ?? []).map((envoi) => (
                <div
                  key={envoi.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 px-3 py-2 text-sm"
                >
                  <span className="font-medium">
                    {envoi.code} — {envoi.label}
                  </span>
                  <span className="text-muted-foreground">{nomApprenant(envoi.apprenant_id)}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {STATUTS[envoi.statut] ?? envoi.statut}
                  </span>
                  {envoi.drive_url ? (
                    <a
                      href={envoi.drive_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary underline"
                    >
                      Drive <ExternalLink className="size-3" />
                    </a>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
