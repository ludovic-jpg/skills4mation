import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { CrmBadge } from "@/components/app/CrmBadge";
import { FORMATEUR_NAV } from "@/components/app/nav";
import { DossierWizard } from "@/components/dossier/DossierWizard";
import type { FormationCatalogue } from "@/lib/formations";
import { EnvoisPanel } from "@/components/dossier/EnvoisPanel";
import { MesDocumentsPanel } from "@/components/dossier/MesDocumentsPanel";
import { SupportsPanel } from "@/components/dossier/SupportsPanel";

import { SignatureOrganismeBadge } from "@/components/dossier/SignatureOrganismeBadge";
import { ChecklistPaiement } from "@/components/dossier/ChecklistPaiement";

import { FriseEtapes, etapeDeStatut } from "@/components/dossier/FriseEtapes";
import { Badge } from "@/components/ui/badge";
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
import { formatDate } from "@/lib/statuts";
import { genererSocleDossier } from "@/lib/dossier-socle.functions";

const CERTIFICATION_LABELS = {
  en_cours: "En cours",
  obtenue: "Obtenue",
  non_obtenue: "Non obtenue",
} as const;

export const Route = createFileRoute("/_app/espace/dossiers/$id")({
  component: DossierDetail,
});

function DossierDetail() {
  const { id } = Route.useParams();
  const mesFormations = useQuery({
    queryKey: ["mes-formations-modeles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formations_catalogue")
        .select("*")
        .order("titre");
      if (error) throw error;
      return (data ?? []) as FormationCatalogue[];
    },
  });
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [onglet, setOnglet] = useState("suivi");
  const [baseFinancement, setBaseFinancement] = useState("");

  const { data: dossier, isLoading } = useQuery({
    queryKey: ["dossier", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossiers")
        .select("*")
        .eq("id", id)
        .maybeSingle();
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

  const autresDossiers = useQuery({
    queryKey: ["dossiers-base-financement", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossiers")
        .select("id, dossier_nom, entreprise_nom, titre_formation, statut_crm, donnees, created_at")
        .eq("formateur_id", user!.id)
        .in("statut_crm", ["dossier_valide", "demande_financement"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).filter((d) => d.id !== id);
    },
  });

  /** Reprend les éléments de financement d'un autre dossier actif comme base de travail. */
  const reprendreFinancement = useMutation({
    mutationFn: async (sourceId: string) => {
      const source = (autresDossiers.data ?? []).find((d) => d.id === sourceId);
      if (!source) throw new Error("Dossier source introuvable.");
      const src = mergeDonnees(source.donnees);
      const next: DossierDonnees = {
        ...donnees,
        tarifs: { ...src.tarifs },
        convention: { ...src.convention },
      };
      const { error } = await supabase.from("dossiers").update({ donnees: next }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Informations de financement reprises depuis le dossier sélectionné.");
      void queryClient.invalidateQueries({ queryKey: ["dossier", id] });
    },
    onError: () => toast.error("Reprise impossible."),
  });

  /** Résultat de certification, saisi après l'évaluation des acquis (EA). */
  const majCertification = useMutation({
    mutationFn: async (valeur: "en_cours" | "obtenue" | "non_obtenue") => {
      const { error } = await supabase
        .from("dossiers")
        .update({ certification_statut: valeur })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Résultat de certification enregistré.");
      void queryClient.invalidateQueries({ queryKey: ["dossier", id] });
    },
    onError: () => toast.error("Enregistrement impossible."),
  });

  /**
   * Soumission à validation : génère le socle documentaire (1A, 1C, 2, F0A, F3, F5),
   * l'archive dans le dossier, puis passe le dossier en demande de validation.
   */
  const soumettre = useMutation({
    mutationFn: async () => {
      if (!dossier || !user) return;
      try {
        await genererSocleDossier({ data: { dossierId: id } });
      } catch (err) {
        console.error("[dossier] Génération du socle documentaire impossible :", err);
        toast.warning(
          "Les documents seront régénérés par l'équipe : la préparation automatique a échoué.",
        );
      }
      const { error } = await supabase
        .from("dossiers")
        .update({ statut_crm: "demande_validation" })
        .eq("id", id);
      if (error) throw error;
      await supabase.from("dossier_historique").insert({
        dossier_id: id,
        ancien_statut: dossier.statut_crm,
        nouveau_statut: "demande_validation",
        auteur_id: user.id,
        commentaire: "Dossier complet soumis à validation par le formateur.",
      });
    },
    onSuccess: () => {
      toast.success("Dossier transmis à l'équipe Skills4mation : il est désormais verrouillé.");
      void queryClient.invalidateQueries({ queryKey: ["dossier", id] });
      void queryClient.invalidateQueries({ queryKey: ["dossier-historique", id] });
      void queryClient.invalidateQueries({ queryKey: ["dossier-pieces", id] });
    },
    onError: () => toast.error("Soumission impossible."),
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
      const { error } = await supabase.from("dossiers").update({ statut_crm: cible }).eq("id", id);
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
  const etape = etapeDeStatut(statut);
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
        <Tabs value={onglet} onValueChange={setOnglet} className="gap-6">
          <FriseEtapes statut={statut} />

          <TabsList>
            <TabsTrigger value="suivi">Suivi</TabsTrigger>
            <TabsTrigger value="variables">Formulaire du dossier</TabsTrigger>
            <TabsTrigger value="documents">Mes documents</TabsTrigger>
            <TabsTrigger value="signatures">Envoi &amp; signatures</TabsTrigger>
            <TabsTrigger value="supports">Supports pédagogiques</TabsTrigger>
          </TabsList>

          <TabsContent value="variables">
            <DossierWizard
              key={id}
              modeles={mesFormations.data ?? []}
              value={donnees}
              saving={saveDonnees.isPending}
              onSave={(next) => saveDonnees.mutate(next)}
              verrouille={statut !== "brouillon"}
              demandeEnCours={soumettre.isPending}
              onDemanderValidation={() => soumettre.mutate()}
            />
          </TabsContent>

          <TabsContent value="documents">
            <MesDocumentsPanel
              dossierId={id}
              statutCrm={statut}
              signatureOrganismeDate={dossier.signature_organisme_date}
            />
          </TabsContent>

          <TabsContent value="signatures">
            <EnvoisPanel dossierId={id} donnees={donnees} />
          </TabsContent>

          <TabsContent value="supports">
            {user ? <SupportsPanel dossierId={id} formateurId={user.id} /> : null}
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
                  <p className="mt-3 text-sm text-muted-foreground">
                    {CRM_STATUTS[statut]?.description}
                  </p>

                  <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                    <Info label="Entreprise" value={dossier.entreprise_nom} />
                    <Info label="SIRET" value={dossier.entreprise_siret} />
                    <Info label="Formation" value={dossier.titre_formation} />
                    <Info label="Début" value={formatDate(dossier.date_debut)} />
                    <Info label="Fin" value={formatDate(dossier.date_fin)} />
                    <Info
                      label="Numéro ADF"
                      value={donnees.adf || "En attente de validation par Skills4mation"}
                    />
                    <Info label="Référence" value={dossier.id} />
                  </dl>

                  {dossier.commentaire_admin ? (
                    <p className="mt-5 rounded-xl bg-muted/60 p-4 text-sm">
                      <span className="font-semibold">Commentaire de l'équipe : </span>
                      {dossier.commentaire_admin}
                    </p>
                  ) : null}

                  <div className="mt-5">
                    <SignatureOrganismeBadge dossier={dossier} />
                  </div>

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

              <ChecklistPaiement dossierId={id} statutCrm={statut} />

              {etape === "B" ? (
                <Card className="rounded-2xl border-border/70 shadow-soft">
                  <CardContent className="grid gap-4 p-6">
                    <h2 className="text-base font-semibold">Étape B — Demande de financement</h2>
                    <p className="text-sm text-muted-foreground">
                      Reprenez si besoin les informations de financement d'un autre dossier actif,
                      puis complétez la convention.
                    </p>
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="grid min-w-64 gap-1.5">
                        <span className="text-xs text-muted-foreground">
                          Dossier servant de base
                        </span>
                        <Select value={baseFinancement} onValueChange={setBaseFinancement}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir un dossier actif" />
                          </SelectTrigger>
                          <SelectContent>
                            {(autresDossiers.data ?? []).map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.dossier_nom || dossierNom(d)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="outline"
                        disabled={!baseFinancement || reprendreFinancement.isPending}
                        onClick={() => reprendreFinancement.mutate(baseFinancement)}
                      >
                        Reprendre ces informations
                      </Button>
                      <Button asChild variant="teal">
                        <Link to="/espace/financement">Rédiger la convention</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {etape === "C" ? (
                <Card className="rounded-2xl border-border/70 shadow-soft">
                  <CardContent className="grid gap-4 p-6">
                    <h2 className="text-base font-semibold">Étape C — Obtention du financement</h2>
                    <p className="text-sm text-muted-foreground">
                      Finalisez la convention et les dernières pièces administratives avant le
                      démarrage.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button asChild variant="teal">
                        <Link to="/espace/financement">Espace convention</Link>
                      </Button>
                      <Button variant="outline" onClick={() => setOnglet("signatures")}>
                        Envoi &amp; signatures
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {etape === "D" ? (
                <Card className="rounded-2xl border-border/70 shadow-soft">
                  <CardContent className="grid gap-4 p-6">
                    <h2 className="text-base font-semibold">Étape D — Fin de la formation</h2>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" onClick={() => setOnglet("documents")}>
                        Émargements (F3)
                      </Button>
                      <Button variant="outline" onClick={() => setOnglet("documents")}>
                        Évaluation des acquis (EA)
                      </Button>
                      <Button variant="outline" onClick={() => setOnglet("signatures")}>
                        Satisfaction à chaud (F5)
                      </Button>
                      <Button asChild variant="outline">
                        <Link to="/espace/outils">Commentaires</Link>
                      </Button>
                    </div>
                    <div className="grid gap-2 border-t border-border pt-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold">Résultat de la certification</h3>
                        <Badge variant="outline">
                          {CERTIFICATION_LABELS[
                            (dossier.certification_statut ??
                              "") as keyof typeof CERTIFICATION_LABELS
                          ] ?? "Non renseigné"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        À renseigner après l'évaluation des acquis. La convocation à l'examen de
                        certification s'envoie manuellement depuis l'onglet « Envoi &amp; signatures
                        ».
                      </p>
                      <div className="flex flex-wrap gap-3 pt-1">
                        {(["en_cours", "obtenue", "non_obtenue"] as const).map((valeur) => (
                          <Button
                            key={valeur}
                            size="sm"
                            variant={dossier.certification_statut === valeur ? "cta" : "outline"}
                            disabled={majCertification.isPending}
                            onClick={() => majCertification.mutate(valeur)}
                          >
                            {CERTIFICATION_LABELS[valeur]}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
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
