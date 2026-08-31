import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, FileText, Upload } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { CrmBadge } from "@/components/app/CrmBadge";
import { FORMATEUR_NAV } from "@/components/app/nav";
import { DocumentsPanel } from "@/components/dossier/DocumentsPanel";
import { DossierWizard } from "@/components/dossier/DossierWizard";
import { PiecesPanel } from "@/components/dossier/PiecesPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CRM_PIPELINE, CRM_STATUTS, crmProgress, dossierNom, type CrmStatut } from "@/lib/crm";
import { mergeDonnees, type DossierDonnees } from "@/lib/dossier/types";
import { DOCUMENT_TYPES, formatDate, type DocumentType } from "@/lib/statuts";

export const Route = createFileRoute("/_app/espace/dossiers/$id")({
  component: DossierDetail,
});

function DossierDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [type, setType] = useState<DocumentType>("signe");
  const [uploading, setUploading] = useState(false);

  const { data: dossier, isLoading } = useQuery({
    queryKey: ["dossier", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("dossiers").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: historique } = useQuery({
    queryKey: ["dossier-historique", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossier_historique")
        .select("*")
        .eq("dossier_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: pieces } = useQuery({
    queryKey: ["dossier-pieces", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossier_pieces")
        .select("code, statut, fichier_url")
        .eq("dossier_id", id);
      if (error) throw error;
      return data ?? [];
    },
  });


  const { data: documents } = useQuery({
    queryKey: ["dossier-documents", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents_dossier")
        .select("*")
        .eq("dossier_id", id)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const changerStatut = useMutation({
    mutationFn: async ({
      cible,
      commentaire,
    }: {
      cible: CrmStatut;
      commentaire: string;
      message: string;
    }) => {
      if (!dossier || !user) return;
      const { error } = await supabase
        .from("dossiers")
        .update({ statut_crm: cible })
        .eq("id", id);
      if (error) throw error;
      await supabase.from("dossier_historique").insert({
        dossier_id: id,
        ancien_statut: dossier.statut_crm,
        nouveau_statut: cible,
        auteur_id: user.id,
        commentaire,
      });
    },
    onSuccess: (_data, variables) => {
      toast.success(variables.message);
      void queryClient.invalidateQueries({ queryKey: ["dossier", id] });
      void queryClient.invalidateQueries({ queryKey: ["dossier-historique", id] });
    },
    onError: () => toast.error("Action impossible."),
  });


  async function uploadDocument(file: File) {
    if (!user) return;
    setUploading(true);
    const path = `${user.id}/${id}/${type}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("documents").upload(path, file, { upsert: true });
    if (error) {
      setUploading(false);
      toast.error("Envoi impossible.");
      return;
    }
    const { error: insertError } = await supabase.from("documents_dossier").insert({
      dossier_id: id,
      formateur_id: user.id,
      type,
      fichier_url: path,
      nom_fichier: file.name,
    });
    setUploading(false);
    if (insertError) {
      toast.error("Le document n'a pas pu être rattaché au dossier.");
      return;
    }
    void queryClient.invalidateQueries({ queryKey: ["dossier-documents", id] });
    toast.success("Document déposé.");
  }

  const saveDonnees = useMutation({
    mutationFn: async (donnees: DossierDonnees) => {
      const { error } = await supabase
        .from("dossiers")
        .update({
          donnees,
          entreprise_nom: donnees.entreprise.nom || null,
          entreprise_siret: donnees.entreprise.siret || null,
          titre_formation: donnees.formation.titre || null,
          date_debut: donnees.formation.dateDebut || null,
          date_fin: donnees.formation.dateFin || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Variables du dossier enregistrées.");
      void queryClient.invalidateQueries({ queryKey: ["dossier", id] });
    },
    onError: () => toast.error("Enregistrement impossible."),
  });

  const statut = (dossier?.statut_crm ?? "brouillon") as CrmStatut;
  const donnees = mergeDonnees(dossier?.donnees);
  const emargementsPrets = (pieces ?? []).some(
    (p) => p.code === "F3" && (p.statut === "complete" || Boolean(p.fichier_url)),
  );


  return (
    <AppShell
      items={FORMATEUR_NAV}
      title={dossier?.dossier_nom || (dossier ? dossierNom(dossier) : "Dossier")}
      subtitle="Suivi du dossier de formation"
      actions={
        <Button asChild variant="outline">
          <Link to="/espace/dossiers">
            <ArrowLeft className="size-4" /> Retour
          </Link>
        </Button>
      }
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : !dossier ? (
        <p className="text-sm text-muted-foreground">Dossier introuvable.</p>
      ) : (
        <Tabs defaultValue="suivi" className="gap-6">
          <TabsList>
            <TabsTrigger value="suivi">Suivi</TabsTrigger>
            <TabsTrigger value="variables">Formulaire du dossier</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="pieces">Pièces &amp; génération</TabsTrigger>
          </TabsList>

          <TabsContent value="variables">
            <DossierWizard
              key={id}

              value={donnees}
              saving={saveDonnees.isPending}
              onSave={(next) => saveDonnees.mutate(next)}
            />
          </TabsContent>

          <TabsContent value="documents">
            {user ? (
              <DocumentsPanel dossierId={id} formateurId={user.id} donnees={donnees} />
            ) : null}
          </TabsContent>

          <TabsContent value="pieces">
            {user ? (
              <PiecesPanel dossierId={id} formateurId={user.id} donnees={donnees} />
            ) : null}
          </TabsContent>

          <TabsContent value="suivi" className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div className="grid gap-6">
            <Card className="rounded-2xl border-border/70 shadow-soft">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CrmBadge statut={statut} />
                  <span className="text-xs text-muted-foreground">
                    Créé le {formatDate(dossier.created_at)}
                  </span>
                </div>
                <Progress value={crmProgress(statut)} className="mt-4" />
                <p className="mt-3 text-sm text-muted-foreground">{CRM_STATUTS[statut]?.description}</p>

                <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                  <Info label="Entreprise" value={dossier.entreprise_nom} />
                  <Info label="SIRET" value={dossier.entreprise_siret} />
                  <Info label="Formation" value={dossier.titre_formation} />
                  <Info label="Début" value={formatDate(dossier.date_debut)} />
                  <Info label="Fin" value={formatDate(dossier.date_fin)} />
                  <Info label="Référence" value={dossier.id} />
                </dl>

                {dossier.commentaire_admin ? (
                  <p className="mt-5 rounded-xl bg-muted/60 p-4 text-sm">
                    <span className="font-semibold">Commentaire de l'équipe : </span>
                    {dossier.commentaire_admin}
                  </p>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-3">
                  {dossier.drive_folder_url ? (
                    <Button asChild variant="teal">
                      <a href={dossier.drive_folder_url} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-4" /> Documents générés
                      </a>
                    </Button>
                  ) : null}
                  {statut === "dossier_valide" ? (
                    <Button
                      variant="cta"
                      disabled={changerStatut.isPending}
                      onClick={() =>
                        changerStatut.mutate({
                          cible: "demande_financement",
                          commentaire: "Demande de financement initiée par le formateur.",
                          message: "Demande de financement transmise à l'équipe.",
                        })
                      }
                    >
                      Demander le financement
                    </Button>
                  ) : null}
                  {statut === "accord_financement" || statut === "finalisation_administrative" ? (
                    <Button
                      variant="cta"
                      disabled={changerStatut.isPending}
                      onClick={() =>
                        changerStatut.mutate({
                          cible: "formation_en_cours",
                          commentaire: "Démarrage de la formation signalé par le formateur.",
                          message: "Démarrage de la formation enregistré.",
                        })
                      }
                    >
                      Signaler le début de la formation
                    </Button>
                  ) : null}
                  {statut === "formation_en_cours" ? (
                    <Button
                      variant="cta"
                      disabled={changerStatut.isPending}
                      onClick={() => {
                        if (!emargementsPrets)
                          toast.warning(
                            "Les émargements (F3) ne sont pas encore générés : pensez à les compléter.",
                          );
                        changerStatut.mutate({
                          cible: "formation_realisee",
                          commentaire: "Formation signalée comme réalisée par le formateur.",
                          message: "Formation signalée comme réalisée.",
                        });
                      }}
                    >
                      Signaler la formation comme réalisée
                    </Button>
                  ) : null}

                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/70 shadow-soft">
              <CardContent className="p-6">
                <h2 className="text-base font-semibold">Déposer une pièce</h2>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Select value={type} onValueChange={(value) => setType(value as DocumentType)}>
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DOCUMENT_TYPES).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <label>
                    <input
                      type="file"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void uploadDocument(file);
                        event.target.value = "";
                      }}
                    />
                    <span className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted">
                      <Upload className="size-4" /> {uploading ? "Envoi…" : "Choisir un fichier"}
                    </span>
                  </label>
                </div>

                <ul className="mt-5 divide-y divide-border">
                  {(documents ?? []).map((doc) => (
                    <li key={doc.id} className="flex items-center gap-3 py-3 text-sm">
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate">
                        {doc.nom_fichier || doc.fichier_url}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {DOCUMENT_TYPES[doc.type as DocumentType] ?? doc.type}
                      </span>
                    </li>
                  ))}
                  {(documents ?? []).length === 0 ? (
                    <li className="py-3 text-sm text-muted-foreground">
                      Aucune pièce déposée pour l'instant.
                    </li>
                  ) : null}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border-border/70 shadow-soft">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold">Historique des étapes</h2>
              <ol className="mt-4 space-y-4">
                {(historique ?? []).map((h) => (
                  <li key={h.id} className="border-l-2 border-border pl-4">
                    <p className="text-sm font-semibold">
                      {CRM_STATUTS[h.nouveau_statut as CrmStatut]?.label ?? h.nouveau_statut}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(h.created_at)}</p>
                    {h.commentaire ? <p className="mt-1 text-sm">{h.commentaire}</p> : null}
                  </li>
                ))}
                {(historique ?? []).length === 0 ? (
                  <li className="text-sm text-muted-foreground">
                    Aucun mouvement enregistré : le dossier vient d'être créé.
                  </li>
                ) : null}
              </ol>

              <h3 className="mt-8 text-sm font-semibold">Pipeline complet</h3>
              <ol className="mt-3 space-y-2 text-xs text-muted-foreground">
                {CRM_PIPELINE.map((etape) => (
                  <li
                    key={etape}
                    className={etape === statut ? "font-semibold text-foreground" : undefined}
                  >
                    {CRM_STATUTS[etape].etape}. {CRM_STATUTS[etape].label}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
          </TabsContent>
        </Tabs>
      )}
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value || "—"}</dd>
    </div>
  );
}
