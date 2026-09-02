import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { QuestionsEditor } from "@/components/outils/QuestionsEditor";
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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { genererQuestionsOutil } from "@/lib/outils-ia.functions";
import { parseQuestions, type QuestionOutil } from "@/lib/outils";

type Table = "outils_positionnement" | "outils_evaluation_acquis";

/**
 * Génération IA depuis un parcours, édition manuelle et enregistrement d'un outil
 * (test de positionnement ou évaluation des acquis).
 */
export function OutilBuilder({
  table,
  type,
  titreDefaut,
  aide,
}: {
  table: Table;
  type: "positionnement" | "acquis";
  titreDefaut: string;
  aide: string;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const generer = useServerFn(genererQuestionsOutil);

  const [parcoursId, setParcoursId] = useState("");
  const [positionnementId, setPositionnementId] = useState("");
  const [titre, setTitre] = useState("");
  const [questions, setQuestions] = useState<QuestionOutil[]>([]);
  const [outilId, setOutilId] = useState<string | null>(null);

  const parcours = useQuery({
    queryKey: ["mes-parcours", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parcours_formation")
        .select("id, titre")
        .eq("formateur_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const outils = useQuery({
    queryKey: [table, user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("id, titre, parcours_id, questions, created_at")
        .eq("formateur_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Les acquis évalués reprennent les objectifs déjà couverts par le test de positionnement.
  const positionnements = useQuery({
    queryKey: ["outils_positionnement", user?.id],
    enabled: Boolean(user?.id) && type === "acquis",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outils_positionnement")
        .select("id, titre")
        .eq("formateur_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const generation = useMutation({
    mutationFn: async () => {
      if (!parcoursId) throw new Error("Choisissez un parcours de formation.");
      return generer({
        data: {
          parcoursId,
          type,
          ...(type === "acquis" && positionnementId ? { positionnementId } : {}),
        },
      });
    },
    onSuccess: (result) => {
      setTitre(result.titre);
      setQuestions(result.questions);
      setOutilId(null);
      toast.success("Proposition générée : relisez et ajustez avant d'enregistrer.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const enregistrer = useMutation({
    mutationFn: async () => {
      const nettoyees = questions.filter((q) => q.enonce.trim().length > 0);
      if (!nettoyees.length) throw new Error("Ajoutez au moins une question.");
      const payload = {
        formateur_id: user!.id,
        parcours_id: parcoursId || null,
        titre: titre.trim() || titreDefaut,
        questions: nettoyees as never,
      };
      if (outilId) {
        const { error } = await supabase.from(table).update(payload).eq("id", outilId);
        if (error) throw error;
        return outilId;
      }
      const { data, error } = await supabase.from(table).insert(payload).select("id").single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: async (id) => {
      setOutilId(id);
      toast.success("Outil enregistré.");
      await qc.invalidateQueries({ queryKey: [table] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function charger(outil: { id: string; titre: string; parcours_id: string | null; questions: unknown }) {
    setOutilId(outil.id);
    setTitre(outil.titre);
    setParcoursId(outil.parcours_id ?? "");
    setQuestions(parseQuestions(outil.questions));
  }

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="grid gap-4 p-6">
          <div>
            <h2 className="text-base font-semibold">Générer depuis un parcours</h2>
            <p className="mt-1 text-sm text-muted-foreground">{aide}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Parcours de formation</Label>
              <Select value={parcoursId} onValueChange={setParcoursId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un parcours" />
                </SelectTrigger>
                <SelectContent>
                  {(parcours.data ?? []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.titre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(parcours.data ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Créez d'abord un parcours depuis votre profil (analyse IA d'un support).
                </p>
              ) : null}
            </div>
            {type === "acquis" ? (
              <div className="grid gap-1.5">
                <Label>Test de positionnement associé (facultatif)</Label>
                <Select value={positionnementId} onValueChange={setPositionnementId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Aucun" />
                  </SelectTrigger>
                  <SelectContent>
                    {(positionnements.data ?? []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.titre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="cta"
              disabled={generation.isPending || !parcoursId}
              onClick={() => generation.mutate()}
            >
              <Sparkles className="mr-2 size-4" />
              {generation.isPending ? "Génération…" : "Générer depuis un parcours"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setOutilId(null);
                setTitre(titreDefaut);
                setQuestions([{ enonce: "", type: "ouverte", options: [] }]);
              }}
            >
              Créer de toutes pièces
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="grid gap-4 p-6">
          <div className="grid gap-1.5 sm:max-w-lg">
            <Label htmlFor={`titre-${table}`}>Titre de l'outil</Label>
            <Input
              id={`titre-${table}`}
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder={titreDefaut}
            />
          </div>
          <QuestionsEditor questions={questions} onChange={setQuestions} />
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="cta"
              disabled={enregistrer.isPending || questions.length === 0}
              onClick={() => enregistrer.mutate()}
            >
              {enregistrer.isPending ? "Enregistrement…" : outilId ? "Mettre à jour" : "Enregistrer"}
            </Button>
            {outilId ? <Badge variant="outline">Outil enregistré</Badge> : null}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="p-6">
          <h2 className="text-base font-semibold">Mes outils enregistrés</h2>
          <div className="mt-4 grid gap-2">
            {(outils.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun outil enregistré pour l'instant.</p>
            ) : null}
            {(outils.data ?? []).map((o) => (
              <div
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4 text-sm"
              >
                <div>
                  <p className="font-semibold">{o.titre}</p>
                  <p className="text-xs text-muted-foreground">
                    {parseQuestions(o.questions).length} question(s) ·{" "}
                    {new Date(o.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => charger(o)}>
                  Modifier
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
