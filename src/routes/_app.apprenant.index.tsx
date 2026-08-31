import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, ExternalLink, FileSignature, GraduationCap, Send } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { APPRENANT_NAV } from "@/components/app/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { archiverReponseApprenant } from "@/lib/dossier-envois.functions";
import { horodatageFr, sha256Hex } from "@/lib/dossier/signature";

export const Route = createFileRoute("/_app/apprenant/")({
  head: () => ({
    meta: [
      { title: "Espace apprenant — Skills4mation" },
      {
        name: "description",
        content:
          "Consultez vos formations, vos documents et déposez vos pièces signées dans votre espace apprenant Skills4mation.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EspaceApprenant,
});

function EspaceApprenant() {
  const { user, profile, refresh } = useAuth();
  const queryClient = useQueryClient();
  const archiver = useServerFn(archiverReponseApprenant);
  const [identite, setIdentite] = useState({ prenom: "", nom: "", telephone: "" });
  const [busy, setBusy] = useState<string | null>(null);
  const [consentements, setConsentements] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (profile) {
      setIdentite({
        prenom: profile.prenom ?? "",
        nom: profile.nom ?? "",
        telephone: profile.telephone ?? "",
      });
    }
  }, [profile]);

  const { data: fiches } = useQuery({
    queryKey: ["apprenant-fiches", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossier_apprenants")
        .select(
          "id, dossier_id, prenom, nom, email, dossiers(titre_formation, entreprise_nom, date_debut, date_fin, statut_crm)",
        );
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: documents } = useQuery({
    queryKey: ["apprenant-documents", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_envois")
        .select(
          "id, code, label, statut, drive_url, fichier_url, reponse_nom, sent_at, received_at, dossier_id",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function enregistrerProfil() {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ prenom: identite.prenom, nom: identite.nom, telephone: identite.telephone })
      .eq("id", user.id);
    if (error) {
      toast.error("Enregistrement impossible.");
      return;
    }
    toast.success("Profil mis à jour.");
    await refresh();
  }

  async function ouvrir(path: string) {
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, 300);
    if (error || !data) {
      toast.error("Document indisponible.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noreferrer");
  }

  const depot = useMutation({
    mutationFn: async ({ envoiId, file }: { envoiId: string; file: File }) => {
      if (!user) throw new Error("Session expirée.");
      const ext = file.name.split(".").pop() ?? "pdf";
      const path = `apprenants/${user.id}/${envoiId}.${ext}`;
      const hash = await sha256Hex(await file.arrayBuffer());
      const signatureDate = new Date().toISOString();
      const { error: upErr } = await supabase.storage
        .from("documents")
        .upload(path, file, { upsert: true, contentType: file.type || "application/pdf" });
      if (upErr) throw new Error("Dépôt du fichier impossible.");
      const { error: updErr } = await supabase
        .from("document_envois")
        .update({ reponse_url: path, reponse_nom: file.name, statut: "recu" })
        .eq("id", envoiId);
      if (updErr) throw new Error("Enregistrement impossible.");
      return archiver({ data: { envoiId, consentement: true, hash, signatureDate } });
    },
    onSuccess: () => {
      toast.success("Signature enregistrée : document et certificat archivés, formateur notifié.");
      void queryClient.invalidateQueries({ queryKey: ["apprenant-documents", user?.id] });
    },
    onError: (error: Error) => toast.error(error.message),
    onSettled: () => setBusy(null),
  });

  const aSigner = (documents ?? []).filter((d) => d.statut === "envoye");
  const reponses = (documents ?? []).filter((d) => d.statut !== "envoye");

  return (
    <AppShell
      items={APPRENANT_NAV}
      title="Espace apprenant"
      subtitle="Vos formations, vos documents et vos pièces signées."
    >
      <Tabs defaultValue="documents" className="gap-6">
        <TabsList>
          <TabsTrigger value="documents">Mes documents</TabsTrigger>
          <TabsTrigger value="formations">Mes formations</TabsTrigger>
          <TabsTrigger value="reponses">Mes réponses</TabsTrigger>
          <TabsTrigger value="profil">Mon profil</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="grid gap-4">
          {aSigner.length === 0 ? (
            <Card className="rounded-2xl">
              <CardContent className="p-6 text-sm text-muted-foreground">
                Aucun document à signer pour le moment.
              </CardContent>
            </Card>
          ) : (
            aSigner.map((doc) => (
              <Card key={doc.id} className="rounded-2xl border-border/70 shadow-soft">
                <CardContent className="grid gap-3 p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <FileSignature className="size-4 text-muted-foreground" />
                    <h2 className="text-base font-semibold">
                      {doc.code} — {doc.label}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {doc.fichier_url ? (
                      <Button size="sm" variant="outline" onClick={() => void ouvrir(doc.fichier_url!)}>
                        Télécharger le PDF à signer
                      </Button>
                    ) : null}
                  </div>
                  <div className="grid gap-2 sm:max-w-md">
                    <Label>Déposer votre document rempli et signé</Label>
                    <Input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      disabled={busy === doc.id || depot.isPending}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        setBusy(doc.id);
                        depot.mutate({ envoiId: doc.id, file });
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      <Send className="mr-1 inline size-3" />
                      Le dépôt vaut transmission : votre formateur est notifié automatiquement.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="formations" className="grid gap-3">
          {(fiches ?? []).length === 0 ? (
            <Card className="rounded-2xl">
              <CardContent className="p-6 text-sm text-muted-foreground">
                Aucune formation rattachée à votre adresse e-mail pour l'instant.
              </CardContent>
            </Card>
          ) : (
            (fiches ?? []).map((fiche) => (
              <Card key={fiche.id} className="rounded-2xl border-border/70 shadow-soft">
                <CardContent className="flex flex-wrap items-center gap-3 p-5 text-sm">
                  <GraduationCap className="size-4 text-muted-foreground" />
                  <span className="font-medium">
                    {fiche.dossiers?.titre_formation ?? "Formation à préciser"}
                  </span>
                  <span className="text-muted-foreground">{fiche.dossiers?.entreprise_nom}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {fiche.dossiers?.date_debut ?? "dates à confirmer"}
                    {fiche.dossiers?.date_fin ? ` → ${fiche.dossiers.date_fin}` : ""}
                  </span>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="reponses" className="grid gap-3">
          {reponses.length === 0 ? (
            <Card className="rounded-2xl">
              <CardContent className="p-6 text-sm text-muted-foreground">
                Vous n'avez encore transmis aucun document.
              </CardContent>
            </Card>
          ) : (
            reponses.map((doc) => (
              <Card key={doc.id} className="rounded-2xl border-border/70 shadow-soft">
                <CardContent className="flex flex-wrap items-center gap-3 p-5 text-sm">
                  <CheckCircle2 className="size-4 text-success" />
                  <span className="font-medium">
                    {doc.code} — {doc.label}
                  </span>
                  <span className="text-muted-foreground">{doc.reponse_nom}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {doc.statut === "archive" ? "Archivé" : "Reçu"}
                  </span>
                  {doc.drive_url ? (
                    <a
                      href={doc.drive_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary underline"
                    >
                      Archive <ExternalLink className="size-3" />
                    </a>
                  ) : null}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="profil">
          <Card className="rounded-2xl border-border/70 shadow-soft">
            <CardContent className="grid gap-4 p-6 sm:max-w-lg">
              <div className="grid gap-2">
                <Label>Prénom</Label>
                <Input
                  value={identite.prenom}
                  onChange={(e) => setIdentite((p) => ({ ...p, prenom: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Nom</Label>
                <Input
                  value={identite.nom}
                  onChange={(e) => setIdentite((p) => ({ ...p, nom: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>E-mail</Label>
                <Input value={profile?.email ?? user?.email ?? ""} disabled />
              </div>
              <div className="grid gap-2">
                <Label>Téléphone</Label>
                <Input
                  value={identite.telephone}
                  onChange={(e) => setIdentite((p) => ({ ...p, telephone: e.target.value }))}
                />
              </div>
              <Button variant="cta" className="justify-self-start" onClick={() => void enregistrerProfil()}>
                Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
