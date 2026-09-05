import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { declencherAutomatisations } from "@/lib/dossier-automatisations.functions";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Lock,
  Mail,
  Upload,
} from "lucide-react";

import { CrmBadge } from "@/components/app/CrmBadge";
import { DocumentsPanel } from "@/components/dossier/DocumentsPanel";
import { MesDocumentsPanel } from "@/components/dossier/MesDocumentsPanel";
import { EnvoisPanel } from "@/components/dossier/EnvoisPanel";
import { FriseEtapes } from "@/components/dossier/FriseEtapes";
import { PiecesPanel } from "@/components/dossier/PiecesPanel";
import {
  BANDEAUX,
  COLONNE_LABELS,
  DOCUMENT_REQUIS,
  STATUTS_FORMATEUR,
} from "@/components/dossier/kanban-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CRM_STATUTS, dossierNom, type CrmStatut } from "@/lib/crm";
import { PIECES } from "@/lib/dossier/pieces";
import { ChecklistPaiement } from "@/components/dossier/ChecklistPaiement";
import { mergeDonnees } from "@/lib/dossier/types";
import { pieceVisibleSelonStatut } from "@/lib/dossier/visibilite";
import { envoyerRelanceFinancement } from "@/lib/dossier-relance-financement.functions";
import { synchroniserApprenants } from "@/lib/dossier-envois.functions";

import { DOCUMENT_TYPES, type DocumentType } from "@/lib/statuts";

type KanbanRow = {
  id: string;
  formateur_id: string;
  dossier_nom: string | null;
  entreprise_nom: string | null;
  titre_formation: string | null;
  date_debut: string | null;
  statut_crm: CrmStatut;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  drive_folder_url: string | null;
};

type PendingMove = { row: KanbanRow; cible: CrmStatut; type: DocumentType };

function joursDepuis(iso: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

export function KanbanDossiers({ mode }: { mode: "formateur" | "admin" }) {
  const { user, isAdmin, isConseillere, isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();
  const equipe = Boolean(isAdmin || isConseillere || isSuperAdmin);

  const [search, setSearch] = useState("");
  const [formateurFiltre, setFormateurFiltre] = useState("tous");
  const [archiveFiltre, setArchiveFiltre] = useState<"actifs" | "archives">("actifs");
  const [replies, setReplies] = useState<Record<string, boolean>>(
    Object.fromEntries(BANDEAUX.map((b) => [b.cle, Boolean(b.replieParDefaut)])),
  );
  const [dragId, setDragId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingMove | null>(null);
  const [uploading, setUploading] = useState(false);


  const cleDossiers = mode === "admin" ? "kanban-dossiers-admin" : "kanban-dossiers-formateur";

  const { data: rows, isLoading } = useQuery({
    queryKey: [cleDossiers, archiveFiltre],
    queryFn: async () => {
      let requete = supabase
        .from("dossiers")
        .select(
          "id, formateur_id, dossier_nom, entreprise_nom, titre_formation, date_debut, statut_crm, created_at, updated_at, archived_at, drive_folder_url",
        );
      requete =
        archiveFiltre === "archives"
          ? requete.not("archived_at", "is", null)
          : requete.is("archived_at", null);
      const { data, error } = await requete.order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as KanbanRow[];
    },
  });


  const { data: piecesRows } = useQuery({
    queryKey: ["kanban-pieces", mode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossier_pieces")
        .select("dossier_id, code, statut");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: docsRows } = useQuery({
    queryKey: ["kanban-documents", mode],
    queryFn: async () => {
      const { data, error } = await supabase.from("documents_dossier").select("dossier_id, type");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: histoRows } = useQuery({
    queryKey: ["kanban-historique", mode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossier_historique")
        .select("dossier_id, created_at, nouveau_statut")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: formateurs } = useQuery({
    queryKey: ["kanban-formateurs"],
    enabled: mode === "admin",
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, prenom, nom, email");
      if (error) throw error;
      return data ?? [];
    },
  });

  const nomFormateur = (id: string) => {
    const p = (formateurs ?? []).find((f) => f.id === id);
    return p ? `${p.prenom} ${p.nom}`.trim() || p.email : "Formateur";
  };

  const derniereEtape = useMemo(() => {
    const map = new Map<string, string>();
    for (const h of histoRows ?? [])
      if (!map.has(h.dossier_id)) map.set(h.dossier_id, h.created_at);
    return map;
  }, [histoRows]);

  const compteurPieces = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of piecesRows ?? []) {
      if (p.statut === "complete") map.set(p.dossier_id, (map.get(p.dossier_id) ?? 0) + 1);
    }
    return map;
  }, [piecesRows]);

  const documentsParDossier = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const d of docsRows ?? []) {
      const set = map.get(d.dossier_id) ?? new Set<string>();
      set.add(d.type);
      map.set(d.dossier_id, set);
    }
    return map;
  }, [docsRows]);

  const dossiers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (rows ?? []).filter((r) => {
      if (mode === "admin" && formateurFiltre !== "tous" && r.formateur_id !== formateurFiltre)
        return false;
      if (!q) return true;
      return [r.entreprise_nom, r.titre_formation, r.dossier_nom]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [rows, search, formateurFiltre, mode]);

  const detail = (rows ?? []).find((r) => r.id === detailId) ?? null;

  const changerStatut = useMutation({
    mutationFn: async ({
      row,
      cible,
      commentaire,
    }: {
      row: KanbanRow;
      cible: CrmStatut;
      commentaire?: string;
    }) => {
      if (!user) throw new Error("Session expirée.");
      if (cible === "refuse" && commentaire !== undefined && !commentaire.trim())
        throw new Error("commentaire");
      const note = commentaire?.trim() || null;
      const { error } = await supabase
        .from("dossiers")
        .update({
          statut_crm: cible,
          ...(note ? { commentaire_admin: note } : {}),
          ...(cible === "paiement_formateur" ? { archived_at: null } : {}),
        })
        .eq("id", row.id);
      if (error) throw error;
      const { error: histError } = await supabase.from("dossier_historique").insert({
        dossier_id: row.id,
        ancien_statut: row.statut_crm,
        nouveau_statut: cible,
        auteur_id: user.id,
        commentaire: note ?? `Déplacement Kanban vers « ${COLONNE_LABELS[cible] ?? cible} »`,
      });
      if (histError) throw histError;
      if (cible === "accord_financement") {
        await declencherAutomatisations({ data: { dossierId: row.id } }).catch((err) =>
          console.error("[automatisations]", err),
        );
      }
      if (cible === "dossier_valide") {
        await synchroniserApprenants({ data: { dossierId: row.id } }).catch((err) =>
          console.error("[sync-apprenants]", err),
        );
        const res = await envoyerRelanceFinancement({ data: { dossierId: row.id } });
        return { relance: res.envoyes };
      }

      return { relance: 0 };
    },
    onSuccess: (res) => {
      toast.success(
        res.relance
          ? `Étape mise à jour — ${res.relance} e-mail(s) de demande de financement envoyé(s).`
          : "Étape mise à jour.",
      );
      void queryClient.invalidateQueries({ queryKey: [cleDossiers] });
      void queryClient.invalidateQueries({ queryKey: ["kanban-historique", mode] });
    },
    onError: (error: Error) =>
      toast.error(
        error.message === "commentaire"
          ? "Un commentaire est obligatoire pour refuser un dossier."
          : "Déplacement impossible.",
      ),
  });

  const archiver = useMutation({
    mutationFn: async (row: KanbanRow) => {
      const { error } = await supabase
        .from("dossiers")
        .update({ archived_at: row.archived_at ? null : new Date().toISOString() })
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Archivage mis à jour.");
      setDetailId(null);
      void queryClient.invalidateQueries({ queryKey: [cleDossiers] });
    },
    onError: () => toast.error("Action impossible."),
  });

  const relancer = useMutation({
    mutationFn: async (dossierId: string) => envoyerRelanceFinancement({ data: { dossierId } }),
    onSuccess: (res) =>
      res.envoyes
        ? toast.success(`${res.envoyes} e-mail(s) envoyé(s) aux apprenants.`)
        : toast.error(res.message ?? "Aucun envoi effectué."),
    onError: () => toast.error("Envoi impossible."),
  });


  function tenterDeplacement(row: KanbanRow, cible: CrmStatut) {
    if (row.statut_crm === cible) return;
    if (!equipe && !STATUTS_FORMATEUR.includes(cible)) {
      toast.error("Cette étape est une décision Skills4mation : le suivi reste en lecture seule.");
      return;
    }
    const requis = DOCUMENT_REQUIS[cible];
    if (requis && !documentsParDossier.get(row.id)?.has(requis)) {
      setPending({ row, cible, type: requis });
      return;
    }
    changerStatut.mutate({ row, cible });
  }

  async function deposerDocument(
    row: KanbanRow,
    type: DocumentType,
    file: File,
    apres?: () => void,
  ) {
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "pdf";
    const path = `${row.formateur_id}/${row.id}/${type}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("documents").upload(path, file);
    if (error) {
      setUploading(false);
      toast.error("Dépôt impossible.");
      return;
    }
    const { error: insertError } = await supabase.from("documents_dossier").insert({
      dossier_id: row.id,
      formateur_id: row.formateur_id,
      type,
      fichier_url: path,
      nom_fichier: file.name,
    });
    setUploading(false);
    if (insertError) {
      toast.error("Le document n'a pas pu être rattaché au dossier.");
      return;
    }
    toast.success(`${DOCUMENT_TYPES[type]} déposé.`);
    await queryClient.invalidateQueries({ queryKey: ["kanban-documents", mode] });
    apres?.();
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function onDragEnd(event: DragEndEvent) {
    setDragId(null);
    const cible = event.over?.id as CrmStatut | undefined;
    const row = (rows ?? []).find((r) => r.id === event.active.id);
    if (!cible || !row) return;
    tenterDeplacement(row, cible);
  }

  const dragRow = (rows ?? []).find((r) => r.id === dragId) ?? null;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Rechercher une entreprise, une formation…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        {mode === "admin" ? (
          <Select value={formateurFiltre} onValueChange={setFormateurFiltre}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Tous les formateurs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous les formateurs</SelectItem>
              {(formateurs ?? []).map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {`${f.prenom} ${f.nom}`.trim() || f.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement du suivi…</p>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={(e: DragStartEvent) => setDragId(String(e.active.id))}
          onDragEnd={onDragEnd}
        >
          {BANDEAUX.map((bandeau) => {
            const replie = replies[bandeau.cle];
            const total = dossiers.filter((d) => bandeau.statuts.includes(d.statut_crm)).length;
            return (
              <section key={bandeau.cle} className="grid gap-3">
                <button
                  type="button"
                  onClick={() => setReplies((s) => ({ ...s, [bandeau.cle]: !s[bandeau.cle] }))}
                  className="flex items-center gap-2 text-left"
                >
                  {replie ? (
                    <ChevronRight className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  )}
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Étape {bandeau.cle}
                  </span>
                  <span className="text-sm font-semibold">{bandeau.titre}</span>
                  <span className="text-xs text-muted-foreground">({total})</span>
                </button>

                {replie ? null : (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {bandeau.statuts.map((statut) => (
                      <Colonne
                        key={statut}
                        statut={statut}
                        verrouille={!equipe && !STATUTS_FORMATEUR.includes(statut)}
                        dossiers={dossiers.filter((d) => d.statut_crm === statut)}
                        piecesTotal={
                          PIECES.filter((p) => pieceVisibleSelonStatut(p.code, statut)).length
                        }
                        compteurPieces={compteurPieces}
                        derniereEtape={derniereEtape}
                        nomFormateur={mode === "admin" ? nomFormateur : undefined}
                        onOpen={setDetailId}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}

          <DragOverlay>
            {dragRow ? (
              <div className="rounded-xl border border-border bg-card p-3 text-sm font-semibold shadow-lg">
                {dragRow.dossier_nom || dossierNom(dragRow)}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Modale de dépôt obligatoire avant le changement de colonne */}
      <Dialog open={Boolean(pending)} onOpenChange={(o) => (o ? null : setPending(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pending ? DOCUMENT_TYPES[pending.type] : "Pièce justificative"} obligatoire
            </DialogTitle>
            <DialogDescription>
              Déposez la pièce justificative pour passer ce dossier en «{" "}
              {pending ? (COLONNE_LABELS[pending.cible] ?? pending.cible) : ""} ». Le déplacement
              est enregistré dès que le dépôt réussit.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label>Document (PDF, image ou bureautique)</Label>
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.xlsx,.png,.jpg,.jpeg"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file || !pending) return;
                const move = pending;
                void deposerDocument(move.row, move.type, file, () => {
                  setPending(null);
                  changerStatut.mutate({ row: move.row, cible: move.cible });
                });
              }}
            />
            {uploading ? <p className="text-xs text-muted-foreground">Dépôt en cours…</p> : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* Panneau de détail */}
      <Sheet open={Boolean(detailId)} onOpenChange={(o) => (o ? null : setDetailId(null))}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
          {detail ? (
            <DetailDossier
              row={detail}
              equipe={equipe}
              uploading={uploading}
              onUpload={(type, file) => void deposerDocument(detail, type, file)}
              onRelancer={() => relancer.mutate(detail.id)}
              relanceEnCours={relancer.isPending}
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Colonne({
  statut,
  dossiers,
  verrouille,
  piecesTotal,
  compteurPieces,
  derniereEtape,
  nomFormateur,
  onOpen,
}: {
  statut: CrmStatut;
  dossiers: KanbanRow[];
  verrouille: boolean;
  piecesTotal: number;
  compteurPieces: Map<string, number>;
  derniereEtape: Map<string, string>;
  nomFormateur?: ((id: string) => string) | undefined;
  onOpen: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: statut });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border p-3 transition-colors ${
        isOver ? "border-secondary/50 bg-secondary/5" : "border-border/70 bg-muted/30"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold leading-snug">
            {COLONNE_LABELS[statut] ?? CRM_STATUTS[statut]?.label}
          </p>
          <p className="text-xs text-muted-foreground">{dossiers.length} dossier(s)</p>
        </div>
        {verrouille ? (
          <span
            title="Décision Skills4mation — lecture seule"
            className="flex items-center gap-1 text-xs text-muted-foreground"
          >
            <Lock className="size-3.5" /> Équipe
          </span>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2">
        {dossiers.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/70 p-3 text-xs text-muted-foreground">
            Aucun dossier
          </p>
        ) : (
          dossiers.map((d) => (
            <Carte
              key={d.id}
              row={d}
              piecesTotal={piecesTotal}
              piecesCompletes={compteurPieces.get(d.id) ?? 0}
              depuis={derniereEtape.get(d.id) ?? d.updated_at}
              formateur={nomFormateur?.(d.formateur_id)}
              onOpen={onOpen}
            />
          ))
        )}
      </div>
    </div>
  );
}

function Carte({
  row,
  piecesTotal,
  piecesCompletes,
  depuis,
  formateur,
  onOpen,
}: {
  row: KanbanRow;
  piecesTotal: number;
  piecesCompletes: number;
  depuis: string;
  formateur?: string | undefined;
  onOpen: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: row.id });
  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(row.id)}
      className={`cursor-grab rounded-xl border-border/70 shadow-soft transition-opacity ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <CardContent className="grid gap-2 p-3">
        <p className="text-sm font-semibold leading-snug">{row.dossier_nom || dossierNom(row)}</p>
        <CrmBadge statut={row.statut_crm} className="w-fit" />
        {row.entreprise_nom ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="size-3.5" /> {row.entreprise_nom}
          </p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          {piecesCompletes}/{piecesTotal} pièces complètes · depuis {joursDepuis(depuis)} j dans
          cette étape
        </p>
        {formateur ? <p className="text-xs text-muted-foreground">{formateur}</p> : null}
      </CardContent>
    </Card>
  );
}

function DetailDossier({
  row,
  equipe,
  uploading,
  onUpload,
  onRelancer,
  relanceEnCours,
}: {
  row: KanbanRow;
  equipe: boolean;
  uploading: boolean;
  onUpload: (type: DocumentType, file: File) => void;
  onRelancer: () => void;
  relanceEnCours: boolean;
}) {
  const { data: dossier } = useQuery({
    queryKey: ["dossier", row.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossiers")
        .select("*")
        .eq("id", row.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const donnees = mergeDonnees(dossier?.donnees);
  const typeParDefaut: DocumentType =
    row.statut_crm === "refuse"
      ? "refus_financement"
      : row.statut_crm === "accord_financement"
        ? "accord_financement"
        : row.statut_crm === "formation_realisee"
          ? "qualiopi_final"
          : "signe";
  const [type, setType] = useState<DocumentType>(typeParDefaut);

  return (
    <div className="grid gap-5">
      <SheetHeader className="p-0">
        <SheetTitle className="text-left text-base">
          {row.dossier_nom || dossierNom(row)}
        </SheetTitle>
      </SheetHeader>

      <FriseEtapes statut={row.statut_crm} />

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <Link to="/espace/dossiers/$id" params={{ id: row.id }}>
            <ExternalLink className="mr-1.5 size-4" /> Ouvrir la fiche complète
          </Link>
        </Button>
        <Button size="sm" variant="teal" disabled={relanceEnCours} onClick={onRelancer}>
          <Mail className="mr-1.5 size-4" />
          {relanceEnCours ? "Envoi…" : "Renvoyer l'e-mail"}
        </Button>
      </div>

      <ChecklistPaiement dossierId={row.id} statutCrm={row.statut_crm} />

      <Tabs defaultValue="documents">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="documents">
            {equipe ? "Documents numériques (PDF)" : "Mes documents"}
          </TabsTrigger>
          {equipe ? <TabsTrigger value="depot">Déposer une pièce</TabsTrigger> : null}
          <TabsTrigger value="envois">Envois &amp; signatures</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="mt-5 grid gap-6">
          {equipe ? (
            <>
              <PiecesPanel
                dossierId={row.id}
                formateurId={row.formateur_id}
                donnees={donnees}
                statutCrm={row.statut_crm}
              />
              <DocumentsPanel
                dossierId={row.id}
                formateurId={row.formateur_id}
                donnees={donnees}
                statutCrm={row.statut_crm}
              />
            </>
          ) : (
            <MesDocumentsPanel
              dossierId={row.id}
              statutCrm={row.statut_crm}
              signatureOrganismeDate={dossier?.signature_organisme_date ?? null}
            />
          )}
        </TabsContent>

        {equipe ? (
          <TabsContent value="depot" className="mt-5">
            <Card className="rounded-2xl border-border/70 shadow-soft">
              <CardContent className="grid gap-3 p-6">
                <div className="flex items-center gap-2">
                  <Upload className="size-4 text-muted-foreground" />
                  <h2 className="text-base font-semibold">Déposer une pièce du dossier</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Le type est présélectionné selon la colonne courante ; la section correspondante
                  est validée dès que le dépôt réussit.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Type de pièce</Label>
                    <Select value={type} onValueChange={(v) => setType(v as DocumentType)}>
                      <SelectTrigger>
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
                  </div>
                  <div className="grid gap-2">
                    <Label>Fichier</Label>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.xlsx,.png,.jpg,.jpeg"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onUpload(type, file);
                      }}
                    />
                  </div>
                </div>
                {!equipe ? (
                  <p className="text-xs text-muted-foreground">
                    Les décisions de financement restent validées par l&apos;équipe Skills4mation.
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        ) : null}

        <TabsContent value="envois" className="mt-5">
          <EnvoisPanel dossierId={row.id} donnees={donnees} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
