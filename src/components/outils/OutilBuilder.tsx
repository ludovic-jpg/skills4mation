import { useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, FilePlus2, Loader2, PencilLine, Sparkles } from "lucide-react";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { parseProgramme } from "@/lib/formations";
import { genererQuestionsOutil } from "@/lib/outils-ia.functions";
import { parseQuestions, type QuestionOutil } from "@/lib/outils";

type Table = "outils_positionnement" | "outils_evaluation_acquis";

/** Source de génération encodée dans une seule valeur de sélecteur : `f:<id>` ou `p:<id>`. */
type Source = { kind: "formation" | "parcours"; id: string } | null;
const AUCUN = "__aucun__";

function lireSource(valeur: string): Source {
  if (valeur.startsWith("f:")) return { kind: "formation", id: valeur.slice(2) };
  if (valeur.startsWith("p:")) return { kind: "parcours", id: valeur.slice(2) };
  return null;
}

/**
 * Génération IA depuis une formation du catalogue (ou un ancien parcours), édition
 * manuelle et enregistrement d'un outil (test de positionnement ou évaluation des acquis).
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
  const editeurRef = useRef<HTMLDivElement>(null);

  const [sourceValeur, setSourceValeur] = useState("");
  const [positionnementId, setPositionnementId] = useState(AUCUN);
  const [titre, setTitre] = useState("");
  const [questions, setQuestions] = useState<QuestionOutil[]>([]);
  const [outilId, setOutilId] = useState<string | null>(null);
  const source = lireSource(sourceValeur);

  const formations = useQuery({
    queryKey: ["outils-formations", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formations_catalogue")
        .select("id, titre, objectifs, programme")
        .eq("formateur_id", user!.id)
        .order("titre");
      if (error) throw error;
      return data ?? [];
    },
  });

  const parcours = useQuery({
    queryKey: ["mes-parcours", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parcours_formation")
        .select("id, titre, formation_catalogue_id")
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
        .select("id, titre, parcours_id, formation_id, questions, created_at")
        .eq("formateur_id", user!.id)
        .order("created_at", { ascending: false });
      // Tolérance : migration `formation_id` pas encore appliquée (42703 = colonne absente).
      if (error?.code === "42703") {
        const repli = await supabase
          .from(table)
          .select("id, titre, parcours_id, questions, created_at")
          .eq("formateur_id", user!.id)
          .order("created_at", { ascending: false });
        if (repli.error) throw repli.error;
        return (repli.data ?? []).map((o) => ({ ...o, formation_id: null as string | null }));
      }
      if (error) throw error;
      return data ?? [];
    },
  });

  // Les acquis évalués reprennent les objectifs déjà couverts par le test de positionnement.
  const positionnements = useQuery({
    queryKey: ["outils_positionnement", user?.id, "liste"],
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

  const listeFormations = useMemo(() => formations.data ?? [], [formations.data]);
  // `parcours_formation` sert surtout de miroir des formations (mis à jour à chaque
  // enregistrement d'une formation) : seuls les parcours SANS formation sont proposés
  // comme « Anciens parcours », sinon chaque formation apparaîtrait deux fois.
  const listeParcours = useMemo(
    () => (parcours.data ?? []).filter((p) => !p.formation_catalogue_id),
    [parcours.data],
  );
  /** Parcours miroir → formation d'origine (pour rouvrir un ancien outil sur sa formation). */
  const formationDuParcours = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of parcours.data ?? []) {
      if (p.formation_catalogue_id) m.set(p.id, p.formation_catalogue_id);
    }
    return m;
  }, [parcours.data]);
  const chargementSources = formations.isLoading || parcours.isLoading;
  const aucuneSource =
    !chargementSources && listeFormations.length === 0 && listeParcours.length === 0;

  const nomsSources = useMemo(() => {
    const noms = new Map<string, string>();
    for (const f of listeFormations) noms.set(`f:${f.id}`, f.titre);
    for (const p of parcours.data ?? []) noms.set(`p:${p.id}`, p.titre);
    return noms;
  }, [listeFormations, parcours.data]);

  const formationChoisie =
    source?.kind === "formation" ? listeFormations.find((f) => f.id === source.id) : undefined;
  const resumeFormation = formationChoisie
    ? {
        objectifs: (formationChoisie.objectifs ?? []).length,
        modules: parseProgramme(formationChoisie.programme).length,
      }
    : null;

  const generation = useMutation({
    mutationFn: async () => {
      if (!source) throw new Error("Choisissez une formation.");
      return generer({
        data: {
          ...(source.kind === "formation" ? { formationId: source.id } : { parcoursId: source.id }),
          type,
          ...(type === "acquis" && positionnementId !== AUCUN ? { positionnementId } : {}),
        },
      });
    },
    onSuccess: (result) => {
      setTitre(result.titre);
      setQuestions(result.questions);
      setOutilId(null);
      toast.success("Proposition générée : relisez et ajustez avant d'enregistrer.");
      requestAnimationFrame(() =>
        editeurRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    },
    onError: (e: Error) => toast.error(e.message || "La génération a échoué. Réessayez."),
  });

  const enregistrer = useMutation({
    mutationFn: async () => {
      const nettoyees = questions.filter((q) => q.enonce.trim().length > 0);
      if (!nettoyees.length) throw new Error("Ajoutez au moins une question.");
      // `formation_id` n'est envoyé que s'il est renseigné : un outil rattaché à un
      // ancien parcours reste enregistrable même si la migration n'est pas appliquée.
      const payload = {
        formateur_id: user!.id,
        ...(source?.kind === "formation" ? { formation_id: source.id } : {}),
        parcours_id: source?.kind === "parcours" ? source.id : null,
        titre: titre.trim() || titreDefaut,
        questions: nettoyees as never,
      };
      if (outilId) {
        const { error } = await supabase.from(table).update(payload).eq("id", outilId);
        if (error) throw new Error("Mise à jour impossible. Réessayez.");
        return outilId;
      }
      const { data, error } = await supabase.from(table).insert(payload).select("id").single();
      if (error) throw new Error("Enregistrement impossible. Réessayez.");
      return data.id;
    },
    onSuccess: async (id) => {
      setOutilId(id);
      toast.success("Outil enregistré.");
      await qc.invalidateQueries({ queryKey: [table] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function charger(outil: {
    id: string;
    titre: string;
    parcours_id: string | null;
    formation_id: string | null;
    questions: unknown;
  }) {
    setOutilId(outil.id);
    setTitre(outil.titre);
    const formationMiroir = outil.parcours_id
      ? formationDuParcours.get(outil.parcours_id)
      : undefined;
    setSourceValeur(
      outil.formation_id
        ? `f:${outil.formation_id}`
        : formationMiroir
          ? `f:${formationMiroir}`
          : outil.parcours_id
            ? `p:${outil.parcours_id}`
            : "",
    );
    setQuestions(parseQuestions(outil.questions));
    requestAnimationFrame(() =>
      editeurRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="grid gap-4 p-6">
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <Sparkles className="size-4 text-primary" aria-hidden />
              Générer depuis une formation
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{aide}</p>
          </div>

          {chargementSources ? (
            <Skeleton className="h-10 w-full rounded-md sm:max-w-md" />
          ) : aucuneSource ? (
            <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border p-5 text-sm">
              <p className="text-muted-foreground">
                Vous n'avez encore aucune formation. Créez-en une : ses objectifs et son programme
                serviront de base aux questions.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/espace/formations/new">
                  <FilePlus2 className="size-3.5" /> Créer une formation
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor={`source-${table}`}>Formation</Label>
                <Select value={sourceValeur} onValueChange={setSourceValeur}>
                  <SelectTrigger id={`source-${table}`}>
                    <SelectValue placeholder="Choisir une formation" />
                  </SelectTrigger>
                  <SelectContent>
                    {listeFormations.length ? (
                      <SelectGroup>
                        <SelectLabel>Mes formations</SelectLabel>
                        {listeFormations.map((f) => (
                          <SelectItem key={f.id} value={`f:${f.id}`}>
                            {f.titre}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ) : null}
                    {listeFormations.length && listeParcours.length ? <SelectSeparator /> : null}
                    {listeParcours.length ? (
                      <SelectGroup>
                        <SelectLabel>Anciens parcours</SelectLabel>
                        {listeParcours.map((p) => (
                          <SelectItem key={p.id} value={`p:${p.id}`}>
                            {p.titre}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ) : null}
                  </SelectContent>
                </Select>
                {resumeFormation ? (
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <BookOpen className="size-3.5" aria-hidden />
                    {resumeFormation.objectifs} objectif(s) · {resumeFormation.modules} module(s)
                    {resumeFormation.objectifs === 0 && resumeFormation.modules === 0
                      ? " — complétez la fiche formation pour des questions plus précises."
                      : ""}
                  </p>
                ) : null}
                {formations.isError || parcours.isError ? (
                  <p className="text-xs text-destructive">
                    Impossible de charger toutes vos formations. Rechargez la page.
                  </p>
                ) : null}
              </div>
              {type === "acquis" ? (
                <div className="grid gap-1.5">
                  <Label htmlFor="positionnement-associe">
                    Test de positionnement associé (facultatif)
                  </Label>
                  <Select value={positionnementId} onValueChange={setPositionnementId}>
                    <SelectTrigger id="positionnement-associe">
                      <SelectValue placeholder="Aucun" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={AUCUN}>Aucun</SelectItem>
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
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              variant="cta"
              disabled={generation.isPending || !source}
              onClick={() => generation.mutate()}
            >
              {generation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="mr-2 size-4" aria-hidden />
              )}
              {generation.isPending
                ? "Génération en cours… (environ 30 s)"
                : "Générer les questions"}
            </Button>
            <Button
              variant="outline"
              disabled={generation.isPending}
              onClick={() => {
                setOutilId(null);
                setTitre(titreDefaut);
                setQuestions([{ enonce: "", type: "ouverte", options: [] }]);
              }}
            >
              <PencilLine className="mr-2 size-4" aria-hidden />
              Créer de toutes pièces
            </Button>
          </div>
        </CardContent>
      </Card>

      <div ref={editeurRef} className="scroll-mt-6">
        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardContent className="grid gap-4 p-6" aria-busy={generation.isPending}>
            {generation.isPending ? (
              <div className="grid gap-3" aria-label="Génération des questions en cours">
                <Skeleton className="h-10 w-full rounded-md sm:max-w-lg" />
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
              </div>
            ) : (
              <>
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
                    {enregistrer.isPending
                      ? "Enregistrement…"
                      : outilId
                        ? "Mettre à jour"
                        : "Enregistrer"}
                  </Button>
                  {outilId ? <Badge variant="outline">Outil enregistré</Badge> : null}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/70 shadow-soft">
        <CardContent className="p-6">
          <h3 className="text-base font-semibold">Mes outils enregistrés</h3>
          <div className="mt-4 grid gap-2">
            {outils.isLoading ? (
              <>
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </>
            ) : outils.isError ? (
              <p className="text-sm text-destructive">
                Impossible de charger vos outils. Rechargez la page.
              </p>
            ) : (outils.data ?? []).length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Aucun outil enregistré pour l'instant.
              </p>
            ) : (
              (outils.data ?? []).map((o) => {
                const rattachement =
                  (o.formation_id && nomsSources.get(`f:${o.formation_id}`)) ||
                  (o.parcours_id && nomsSources.get(`p:${o.parcours_id}`)) ||
                  null;
                return (
                  <div
                    key={o.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{o.titre}</p>
                      <p className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                        {rattachement ? <Badge variant="secondary">{rattachement}</Badge> : null}
                        <span>
                          {parseQuestions(o.questions).length} question(s) ·{" "}
                          {new Date(o.created_at).toLocaleDateString("fr-FR")}
                        </span>
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => charger(o)}>
                      Modifier
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
