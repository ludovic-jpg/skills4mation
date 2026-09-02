import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { ExternalLink, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { FORMATEUR_NAV } from "@/components/app/nav";
import { OutilBuilder } from "@/components/outils/OutilBuilder";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CRM_PIPELINE, CRM_STATUTS, type CrmStatut } from "@/lib/crm";
import { envoyerDocumentApprenant } from "@/lib/dossier-envois.functions";
import { documentsApplicables } from "@/lib/dossier/html";
import { mergeDonnees } from "@/lib/dossier/types";

export const Route = createFileRoute("/_app/espace/outils")({
  component: OutilsPage,
  head: () => ({
    meta: [
      { title: "Mes outils pédagogiques — Espace formateur Skills4mation" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type DossierLigne = {
  id: string;
  dossier_nom: string | null;
  titre_formation: string | null;
  entreprise_nom: string | null;
  statut_crm: CrmStatut;
  donnees: unknown;
  created_at: string;
};

function libelleDossier(d: DossierLigne) {
  return (
    d.dossier_nom ||
    [d.entreprise_nom, d.titre_formation].filter(Boolean).join(" — ") ||
    `Dossier ${d.id.slice(0, 8)}`
  );
}

function OutilsPage() {
  const { user } = useAuth();

  const dossiers = useQuery({
    queryKey: ["mes-dossiers-outils", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossiers")
        .select("id, dossier_nom, titre_formation, entreprise_nom, statut_crm, donnees, created_at")
        .eq("formateur_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DossierLigne[];
    },
  });

  return (
    <AppShell
      items={FORMATEUR_NAV}
      title="Mes outils pédagogiques"
      subtitle="Recueil des besoins, test de positionnement, évaluation des acquis, satisfaction et retours"
    >
      <Tabs defaultValue="recueil">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="recueil">Recueil des besoins</TabsTrigger>
          <TabsTrigger value="positionnement">Test de positionnement</TabsTrigger>
          <TabsTrigger value="acquis">Évaluation des acquis</TabsTrigger>
          <TabsTrigger value="chaud">Évaluation à chaud</TabsTrigger>
          <TabsTrigger value="commentaires">Commentaires</TabsTrigger>
        </TabsList>

        <TabsContent value="recueil" className="mt-6">
          <RecueilTab dossiers={dossiers.data ?? []} />
        </TabsContent>
        <TabsContent value="positionnement" className="mt-6">
          <OutilBuilder
            table="outils_positionnement"
            type="positionnement"
            titreDefaut="Test de positionnement"
            aide="L'IA propose des questions (QCM ou ouvertes) alignées sur les modules et objectifs du parcours choisi. Vous restez libre de tout modifier avant d'enregistrer."
          />
        </TabsContent>
        <TabsContent value="acquis" className="mt-6">
          <OutilBuilder
            table="outils_evaluation_acquis"
            type="acquis"
            titreDefaut="Évaluation des acquis"
            aide="Les acquis évalués reprennent les objectifs du parcours et, si vous en associez un, ceux déjà couverts par votre test de positionnement."
          />
        </TabsContent>
        <TabsContent value="chaud" className="mt-6">
          <ChaudTab dossiers={dossiers.data ?? []} />
        </TabsContent>
        <TabsContent value="commentaires" className="mt-6">
          <CommentairesTab dossiers={dossiers.data ?? []} />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

/* ----------------------------- Recueil des besoins ----------------------------- */

function RecueilTab({ dossiers }: { dossiers: DossierLigne[] }) {
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const [dossierId, setDossierId] = useState("");
  const [edition, setEdition] = useState(false);
  const [questions, setQuestions] = useState<string[]>(
    () => profile?.recueil_besoins_questions_perso ?? [],
  );

  const dossier = dossiers.find((d) => d.id === dossierId) ?? dossiers[0];
  const questionsProfil = profile?.recueil_besoins_questions_perso ?? [];

  const apercu = useMemo(() => {
    if (!dossier) return "";
    const donnees = mergeDonnees(dossier.donnees);
    const doc = documentsApplicables(donnees, { questionsPerso: questionsProfil }).find(
      (d) => d.code === "F0A",
    );
    return doc ? doc.build(donnees) : "";
  }, [dossier, questionsProfil]);

  const save = useMutation({
    mutationFn: async () => {
      const nettoyees = questions.map((q) => q.trim()).filter(Boolean);
      const { error } = await supabase
        .from("profiles")
        .update({ recueil_besoins_questions_perso: nettoyees as never })
        .eq("id", user!.id);
      if (error) throw error;
      return nettoyees;
    },
    onSuccess: async (nettoyees) => {
      setQuestions(nettoyees);
      setEdition(false);
      toast.success("Modèle personnalisé : ces questions seront reprises sur vos nouveaux dossiers.");
      await qc.invalidateQueries();
    },
    onError: () => toast.error("Enregistrement impossible."),
  });

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="grid gap-4 p-6">
          <div>
            <h2 className="text-base font-semibold">Modèle par défaut (pièce F0A)</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Le recueil des besoins réutilise les champs de vos dossiers (contexte, attentes,
              niveau de départ, contraintes, modalités d'évaluation). Vos questions
              complémentaires sont ajoutées automatiquement à la génération de la pièce F0A sur
              tout nouveau dossier.
            </p>
          </div>
          {dossiers.length ? (
            <div className="grid gap-1.5 sm:max-w-md">
              <Label>Aperçu à partir d'un dossier</Label>
              <Select value={dossier?.id ?? ""} onValueChange={setDossierId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dossiers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {libelleDossier(d)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Créez un premier dossier pour visualiser le recueil des besoins.{" "}
              <Link className="underline" to="/espace/dossiers/new">
                Nouveau dossier
              </Link>
            </p>
          )}
          {apercu ? (
            <iframe
              title="Aperçu du recueil des besoins"
              srcDoc={apercu}
              className="h-[600px] w-full rounded-xl border border-border bg-white"
            />
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="grid gap-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Mes questions complémentaires</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {questionsProfil.length
                  ? `${questionsProfil.length} question(s) ajoutée(s) à votre modèle.`
                  : "Aucune question personnalisée : le modèle officiel est utilisé tel quel."}
              </p>
            </div>
            {!edition ? (
              <Button
                variant="outline"
                onClick={() => {
                  setQuestions(questionsProfil.length ? questionsProfil : [""]);
                  setEdition(true);
                }}
              >
                Personnaliser ce modèle
              </Button>
            ) : null}
          </div>

          {edition ? (
            <div className="grid gap-3">
              {questions.map((q, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={q}
                    placeholder="Votre question complémentaire"
                    onChange={(e) =>
                      setQuestions(questions.map((x, j) => (j === i ? e.target.value : x)))
                    }
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Supprimer la question"
                    onClick={() => setQuestions(questions.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setQuestions([...questions, ""])}>
                  <Plus className="mr-2 size-4" /> Ajouter une question
                </Button>
                <Button variant="cta" disabled={save.isPending} onClick={() => save.mutate()}>
                  {save.isPending ? "Enregistrement…" : "Enregistrer mon modèle"}
                </Button>
                <Button variant="ghost" onClick={() => setEdition(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          ) : questionsProfil.length ? (
            <ul className="grid gap-1 text-sm">
              {questionsProfil.map((q, i) => (
                <li key={i} className="rounded-lg border border-border px-3 py-2">
                  {i + 1}. {q}
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

/* ----------------------------- Évaluation à chaud ----------------------------- */

const INDEX_REALISEE = CRM_PIPELINE.indexOf("formation_realisee");

function estApresFormation(statut: CrmStatut) {
  const index = CRM_PIPELINE.indexOf(statut);
  return index >= 0 && index >= INDEX_REALISEE;
}

function ChaudTab({ dossiers }: { dossiers: DossierLigne[] }) {
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const envoyer = useServerFn(envoyerDocumentApprenant);
  const [lien, setLien] = useState(profile?.lien_tally_f5 ?? "");

  const eligibles = dossiers.filter((d) => estApresFormation(d.statut_crm));

  const saveLien = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ lien_tally_f5: lien.trim() || null })
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("Lien de questionnaire enregistré.");
      await qc.invalidateQueries();
    },
    onError: () => toast.error("Enregistrement impossible."),
  });

  const demande = useMutation({
    mutationFn: async (dossier: DossierLigne) => {
      const { data: apprenants, error } = await supabase
        .from("dossier_apprenants")
        .select("id, prenom, nom, email")
        .eq("dossier_id", dossier.id);
      if (error) throw error;
      if (!apprenants?.length)
        throw new Error("Aucun apprenant enregistré sur ce dossier : synchronisez-les d'abord.");

      const donnees = mergeDonnees(dossier.donnees);
      const doc = documentsApplicables(donnees).find((d) => d.code === "F5");
      if (!doc) throw new Error("Questionnaire de satisfaction indisponible.");
      const contenuHtml = doc.build(donnees);

      for (const a of apprenants) {
        await envoyer({
          data: {
            dossierId: dossier.id,
            apprenantId: a.id,
            code: "F5",
            label: "Évaluation à chaud",
            contenuHtml,
          },
        });
      }
      return apprenants.length;
    },
    onSuccess: (nb) => toast.success(`Demande d'évaluation envoyée à ${nb} apprenant(s).`),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="grid gap-4 p-6">
          <div>
            <h2 className="text-base font-semibold">Questionnaire interne (recommandé)</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Questions par défaut : contenu et objectifs, animation et pédagogie, supports,
              conditions matérielles, transfert en situation de travail, note globale. Le
              questionnaire est généré par le portail, envoyé aux apprenants pour réponse signée,
              puis archivé au dossier.
            </p>
          </div>
          <div className="grid gap-2 sm:max-w-xl">
            <Label htmlFor="tally">Lien de questionnaire externe (facultatif)</Label>
            <div className="flex gap-2">
              <Input
                id="tally"
                value={lien}
                placeholder="https://tally.so/r/..."
                onChange={(e) => setLien(e.target.value)}
              />
              <Button variant="outline" disabled={saveLien.isPending} onClick={() => saveLien.mutate()}>
                Enregistrer
              </Button>
            </div>
            {profile?.lien_tally_f5 ? (
              <p className="text-xs text-muted-foreground">
                Alternative disponible :{" "}
                <a
                  className="underline"
                  href={profile.lien_tally_f5}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  ouvrir mon questionnaire personnalisé <ExternalLink className="inline size-3" />
                </a>
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="p-6">
          <h2 className="text-base font-semibold">Dossiers concernés ({eligibles.length})</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Seuls les dossiers au statut « Formation réalisée » ou postérieur peuvent recevoir une
            évaluation à chaud.
          </p>
          <div className="mt-4 grid gap-3">
            {eligibles.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun dossier éligible pour le moment.
              </p>
            ) : null}
            {eligibles.map((d) => (
              <div
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4 text-sm"
              >
                <div>
                  <p className="font-semibold">{libelleDossier(d)}</p>
                  <Badge variant="outline" className="mt-1">
                    {CRM_STATUTS[d.statut_crm].label}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile?.lien_tally_f5 ? (
                    <Button asChild variant="outline" size="sm">
                      <a href={profile.lien_tally_f5} target="_blank" rel="noreferrer noopener">
                        Mon questionnaire externe
                      </a>
                    </Button>
                  ) : null}
                  <Button
                    variant="cta"
                    size="sm"
                    disabled={demande.isPending}
                    onClick={() => demande.mutate(d)}
                  >
                    <Send className="mr-2 size-4" /> Envoyer la demande d'évaluation à chaud
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------- Commentaires -------------------------------- */

type Retour = {
  id: string;
  date: string;
  source: "historique" | "F5" | "F7";
  dossierId: string;
  texte: string;
  lien?: string | null;
};

const SOURCES: Record<Retour["source"], string> = {
  historique: "Historique dossier",
  F5: "Évaluation à chaud",
  F7: "Évaluation à froid",
};

function CommentairesTab({ dossiers }: { dossiers: DossierLigne[] }) {
  const { user } = useAuth();
  const [filtre, setFiltre] = useState("tous");

  const retours = useQuery({
    queryKey: ["mes-retours", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const ids = dossiers.map((d) => d.id);
      if (!ids.length) return [] as Retour[];
      const [histo, envois] = await Promise.all([
        supabase
          .from("dossier_historique")
          .select("id, dossier_id, commentaire, created_at, nouveau_statut")
          .in("dossier_id", ids)
          .not("commentaire", "is", null)
          .order("created_at", { ascending: false }),
        supabase
          .from("document_envois")
          .select("id, dossier_id, code, label, statut, received_at, created_at, reponse_url, drive_url")
          .in("dossier_id", ids)
          .in("code", ["F5", "F7"])
          .in("statut", ["recu", "archive"])
          .order("created_at", { ascending: false }),
      ]);
      const liste: Retour[] = [
        ...(histo.data ?? []).map((h) => ({
          id: h.id,
          date: h.created_at,
          source: "historique" as const,
          dossierId: h.dossier_id,
          texte: h.commentaire ?? "",
        })),
        ...(envois.data ?? []).map((e) => ({
          id: e.id,
          date: e.received_at ?? e.created_at,
          source: (e.code === "F7" ? "F7" : "F5") as "F5" | "F7",
          dossierId: e.dossier_id,
          texte: `${e.label} — réponse reçue`,
          lien: e.drive_url,
        })),
      ];
      return liste.sort((a, b) => (a.date < b.date ? 1 : -1));
    },
  });

  const liste = (retours.data ?? []).filter((r) => filtre === "tous" || r.dossierId === filtre);

  return (
    <Card className="rounded-2xl border-border/70 shadow-soft">
      <CardContent className="grid gap-4 p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Retours croisés ({liste.length})</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Vue de lecture des commentaires d'historique de vos dossiers et des évaluations
              collectées. Les commentaires se saisissent depuis la fiche dossier.
            </p>
          </div>
          <div className="grid gap-1.5 sm:w-72">
            <Label>Filtrer par dossier</Label>
            <Select value={filtre} onValueChange={setFiltre}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les dossiers</SelectItem>
                {dossiers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {libelleDossier(d)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-3">
          {liste.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun retour pour le moment.</p>
          ) : null}
          {liste.map((r) => {
            const dossier = dossiers.find((d) => d.id === r.dossierId);
            return (
              <div key={`${r.source}-${r.id}`} className="rounded-xl border border-border p-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{SOURCES[r.source]}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.date).toLocaleString("fr-FR")}
                  </span>
                  {dossier ? (
                    <Link
                      className="text-xs underline"
                      to="/espace/dossiers/$id"
                      params={{ id: dossier.id }}
                    >
                      {libelleDossier(dossier)}
                    </Link>
                  ) : null}
                </div>
                <p className="mt-2 whitespace-pre-line">{r.texte}</p>
                {r.lien ? (
                  <a
                    className="mt-1 inline-flex items-center gap-1 text-xs underline"
                    href={r.lien}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Ouvrir la réponse archivée <ExternalLink className="size-3" />
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
