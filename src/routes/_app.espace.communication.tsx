import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Banknote, ClipboardCheck, ClipboardList, FileSignature, Send, SmilePlus } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { FORMATEUR_NAV } from "@/components/app/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CRM_PIPELINE, type CrmStatut } from "@/lib/crm";
import { envoyerDocumentApprenant } from "@/lib/dossier-envois.functions";
import { envoyerDocumentsFinancement } from "@/lib/dossier-communication.functions";
import { DOCUMENTS } from "@/lib/dossier/html";
import { mergeDonnees } from "@/lib/dossier/types";
import { pieceLabel } from "@/lib/dossier/pieces";
import {
  PREREQUIS_ENVOI_TIERS,
  prerequisEnvoiTiersManquants,
} from "@/lib/dossier/visibilite";
import { parseQuestions } from "@/lib/outils";

export const Route = createFileRoute("/_app/espace/communication")({
  component: CommunicationPage,
  head: () => ({
    meta: [
      { title: "Communication avec Apprenant — Espace formateur Skills4mation" },
      {
        name: "description",
        content:
          "Envoyez à un apprenant ses formulaires et documents de formation : recueil des besoins, financement, positionnement, émargement, évaluation et satisfaction.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Communication avec Apprenant — Skills4mation" },
      {
        property: "og:description",
        content: "Centralisez l'envoi des documents et formulaires à vos apprenants.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type ApprenantRow = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  dossier_id: string;
  dossiers: {
    titre_formation: string | null;
    entreprise_nom: string | null;
    statut_crm: CrmStatut;
    donnees: unknown;
  } | null;
};

/** Un envoi F5 n'est possible qu'une fois la formation réalisée. */
function satisfactionAutorisee(statut: CrmStatut | undefined) {
  if (!statut) return false;
  const index = CRM_PIPELINE.indexOf(statut);
  const seuil = CRM_PIPELINE.indexOf("formation_realisee");
  return index >= 0 && seuil >= 0 && index >= seuil;
}

function outilHtml(titre: string, questions: ReturnType<typeof parseQuestions>) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8" /><style>
    body{font-family:Helvetica,Arial,sans-serif;color:#12181f;font-size:12px;padding:28px}
    h1{color:#0d2a4a;font-size:17px}li{margin-bottom:10px}
    .opt{color:#5b6472}
  </style></head><body><h1>${titre}</h1><ol>${questions
    .map(
      (q) =>
        `<li><strong>${q.enonce}</strong>${
          q.type === "qcm" && q.options.length
            ? `<div class="opt">${q.options.map((o) => `☐ ${o}`).join("&nbsp;&nbsp;")}</div>`
            : `<div class="opt">Réponse : ……………………………………………………………</div>`
        }</li>`,
    )
    .join("")}</ol></body></html>`;
}

function CommunicationPage() {
  const { user } = useAuth();
  const envoyer = useServerFn(envoyerDocumentApprenant);
  const envoyerFinancement = useServerFn(envoyerDocumentsFinancement);
  const [cle, setCle] = useState("");
  const [dossierId, setDossierId] = useState("");
  const [tpId, setTpId] = useState("");
  const [eaId, setEaId] = useState("");

  const { data: apprenants } = useQuery({
    queryKey: ["communication-apprenants", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossier_apprenants")
        .select(
          "id, prenom, nom, email, dossier_id, dossiers(titre_formation, entreprise_nom, statut_crm, donnees)",
        )
        .eq("formateur_id", user!.id)
        .order("nom");
      if (error) throw error;
      return (data ?? []) as unknown as ApprenantRow[];
    },
  });

  const { data: testsPositionnement } = useQuery({
    queryKey: ["communication-tp", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outils_positionnement")
        .select("id, titre, questions")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: evaluationsAcquis } = useQuery({
    queryKey: ["communication-ea", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outils_evaluation_acquis")
        .select("id, titre, questions")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Un même apprenant peut apparaître sur plusieurs dossiers : on regroupe par e-mail.
  const groupes = useMemo(() => {
    const map = new Map<string, { label: string; lignes: ApprenantRow[] }>();
    for (const row of apprenants ?? []) {
      const email = (row.email ?? "").toLowerCase();
      if (!email) continue;
      const label = `${row.prenom} ${row.nom}`.trim() || email;
      const entree = map.get(email) ?? { label, lignes: [] };
      entree.lignes.push(row);
      map.set(email, entree);
    }
    return map;
  }, [apprenants]);

  const lignes = groupes.get(cle)?.lignes ?? [];
  const ligne = lignes.find((l) => l.dossier_id === dossierId) ?? null;
  const statut = ligne?.dossiers?.statut_crm;
  const donnees = useMemo(() => mergeDonnees(ligne?.dossiers?.donnees), [ligne]);

  // Statuts des pièces retournées par l'apprenant, pour signaler un envoi trop précoce.
  const { data: piecesRetour } = useQuery({
    queryKey: ["communication-prerequis", dossierId],
    enabled: Boolean(dossierId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossier_pieces")
        .select("code, statut")
        .eq("dossier_id", dossierId)
        .in("code", PREREQUIS_ENVOI_TIERS);
      if (error) throw error;
      return data ?? [];
    },
  });

  const prerequisManquants = useMemo(
    () =>
      prerequisEnvoiTiersManquants(
        Object.fromEntries((piecesRetour ?? []).map((p) => [p.code, p.statut])),
      ),
    [piecesRetour],
  );

  const envoiSimple = useMutation({
    mutationFn: async ({ code, html, label }: { code: string; html: string; label: string }) => {
      if (!ligne) throw new Error("Choisissez un apprenant et un dossier.");
      return envoyer({
        data: {
          dossierId: ligne.dossier_id,
          apprenantId: ligne.id,
          code,
          label,
          contenuHtml: html,
        },
      });
    },
    onSuccess: () => toast.success("Document transmis à l'apprenant."),
    onError: (error: Error) => toast.error(error.message),
  });

  const envoiFinancement = useMutation({
    mutationFn: async () => {
      if (!ligne) throw new Error("Choisissez un apprenant et un dossier.");
      return envoyerFinancement({
        data: { dossierId: ligne.dossier_id, apprenantId: ligne.id },
      });
    },
    onSuccess: (result) =>
      toast.success(`Pièces transmises : ${result.pieces.join(", ") || "aucune"}.`),
    onError: (error: Error) => toast.error(error.message),
  });

  function envoyerDocumentCode(code: string) {
    const doc = DOCUMENTS.find((d) => d.code === code);
    if (!doc) {
      toast.error("Gabarit indisponible pour cette pièce.");
      return;
    }
    envoiSimple.mutate({ code, label: doc.label, html: doc.build(donnees) });
  }

  const occupe = envoiSimple.isPending || envoiFinancement.isPending;

  return (
    <AppShell
      items={FORMATEUR_NAV}
      title="Communication avec Apprenant"
      subtitle="Envoyez les formulaires et documents à un apprenant, quel que soit son dossier."
    >
      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Apprenant</Label>
            <Select
              value={cle}
              onValueChange={(valeur) => {
                setCle(valeur);
                const premier = groupes.get(valeur)?.lignes[0];
                setDossierId(premier?.dossier_id ?? "");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un apprenant" />
              </SelectTrigger>
              <SelectContent>
                {[...groupes.entries()].map(([email, groupe]) => (
                  <SelectItem key={email} value={email}>
                    {groupe.label} — {email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Dossier concerné</Label>
            <Select value={dossierId} onValueChange={setDossierId} disabled={lignes.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un dossier" />
              </SelectTrigger>
              <SelectContent>
                {lignes.map((l) => (
                  <SelectItem key={l.dossier_id} value={l.dossier_id}>
                    {l.dossiers?.titre_formation || "Formation"} ·{" "}
                    {l.dossiers?.entreprise_nom || "Sans entreprise"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!ligne ? (
        <Card className="mt-6 rounded-2xl">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Sélectionnez un apprenant puis son dossier pour accéder aux envois.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Action
            icon={ClipboardList}
            titre="Recueil des besoins (F0A)"
            texte="Formulaire générique unique, rempli en ligne par l'apprenant dans son espace."
            bouton="Envoyer le recueil des besoins"
            occupe={occupe}
            onClick={() => envoyerDocumentCode("F0A")}
          />

          <Action
            icon={Banknote}
            titre="Demande de financement"
            texte="Envoi groupé de la convention (1A), du planning (2) et du programme de formation (1C), avec un seul e-mail."
            bouton="Envoyer les 3 pièces"
            occupe={occupe}
            onClick={() => envoiFinancement.mutate()}
            avertissement={
              prerequisManquants.length > 0
                ? `À envoyer de préférence après retour de ${prerequisManquants
                    .map((c) =>
                      c === "F0A" ? "Recueil des besoins (F0A)" : "Test de positionnement (TP)",
                    )
                    .join(" et ")} : sans cela, la convention et le programme partent sans connaître le niveau réel de l'apprenant.`
                : undefined
            }
          />

          <Card className="rounded-2xl border-border/70 shadow-soft">
            <CardContent className="grid gap-3 p-6">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="size-4 text-muted-foreground" />
                <h2 className="text-base font-semibold">Test de positionnement (TP)</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Choisissez l'un de vos modèles construits dans « Mes outils pédagogiques ».
              </p>
              <Select value={tpId} onValueChange={setTpId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un test" />
                </SelectTrigger>
                <SelectContent>
                  {(testsPositionnement ?? []).map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.titre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="teal"
                disabled={occupe || !tpId}
                onClick={() => {
                  const outil = (testsPositionnement ?? []).find((o) => o.id === tpId);
                  if (!outil) return;
                  envoiSimple.mutate({
                    code: "TP",
                    label: outil.titre || pieceLabel("TP"),
                    html: outilHtml(outil.titre || "Test de positionnement", parseQuestions(outil.questions)),
                  });
                }}
              >
                <Send className="size-4" /> Envoyer le test
              </Button>
            </CardContent>
          </Card>

          <Action
            icon={FileSignature}
            titre="Relevé de fréquentation (F3)"
            texte="Feuille d'émargement à signer, flux de signature électronique habituel."
            bouton="Envoyer l'émargement"
            occupe={occupe}
            onClick={() => envoyerDocumentCode("F3")}
          />

          <Card className="rounded-2xl border-border/70 shadow-soft">
            <CardContent className="grid gap-3 p-6">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="size-4 text-muted-foreground" />
                <h2 className="text-base font-semibold">Évaluation des acquis (EA)</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Modèle rattaché à votre parcours de formation, construit dans « Mes outils
                pédagogiques ».
              </p>
              <Select value={eaId} onValueChange={setEaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une évaluation" />
                </SelectTrigger>
                <SelectContent>
                  {(evaluationsAcquis ?? []).map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.titre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="teal"
                disabled={occupe || !eaId}
                onClick={() => {
                  const outil = (evaluationsAcquis ?? []).find((o) => o.id === eaId);
                  if (!outil) return;
                  envoiSimple.mutate({
                    code: "EA",
                    label: outil.titre || pieceLabel("EA"),
                    html: outilHtml(outil.titre || "Évaluation des acquis", parseQuestions(outil.questions)),
                  });
                }}
              >
                <Send className="size-4" /> Envoyer l'évaluation
              </Button>
            </CardContent>
          </Card>

          <Action
            icon={SmilePlus}
            titre="Satisfaction à chaud (F5)"
            texte={
              satisfactionAutorisee(statut)
                ? "Formulaire générique unique, rempli en ligne par l'apprenant."
                : "Disponible une fois la formation réalisée."
            }
            bouton="Envoyer le questionnaire"
            occupe={occupe || !satisfactionAutorisee(statut)}
            onClick={() => envoyerDocumentCode("F5")}
          />
        </div>
      )}
    </AppShell>
  );
}

function Action({
  icon: Icon,
  titre,
  texte,
  bouton,
  occupe,
  onClick,
  avertissement,
}: {
  icon: typeof Send;
  titre: string;
  texte: string;
  bouton: string;
  occupe: boolean;
  onClick: () => void;
  /** Signal non bloquant affiché au-dessus du bouton d'envoi. */
  avertissement?: string;
}) {
  return (
    <Card className="rounded-2xl border-border/70 shadow-soft">
      <CardContent className="grid gap-3 p-6">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">{titre}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{texte}</p>
        {avertissement ? <p className="text-xs text-amber-600">{avertissement}</p> : null}
        <Button variant="teal" disabled={occupe} onClick={onClick} className="w-fit">
          <Send className="size-4" /> {bouton}
        </Button>
      </CardContent>
    </Card>
  );
}
