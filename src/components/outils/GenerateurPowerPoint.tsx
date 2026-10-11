import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FilePlus2,
  FolderUp,
  Layers,
  Loader2,
  Presentation,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

import { SUPPORTS_GENERIQUES_KEY } from "@/components/outils/SupportsCoursPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { parseProgramme } from "@/lib/formations";
import { genererDiapositivesModule } from "@/lib/supports-ia.functions";
import { deposerSupportGenerique } from "@/lib/supports";

type EtatModule =
  | { statut: "generation" }
  | { statut: "pret"; fichier: File; diapos: number }
  | { statut: "enregistrement"; fichier: File; diapos: number }
  | { statut: "enregistre"; fichier: File; diapos: number }
  | { statut: "erreur"; message: string };

function telecharger(fichier: File) {
  const url = URL.createObjectURL(fichier);
  const a = document.createElement("a");
  a.href = url;
  a.download = fichier.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/**
 * Génération d'un PowerPoint par module du programme d'une formation : contenu
 * rédigé par l'IA (serveur), fichier .pptx construit dans le navigateur.
 */
export function GenerateurPowerPoint() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const genererDiapos = useServerFn(genererDiapositivesModule);

  const [formationId, setFormationId] = useState("");
  const [etats, setEtats] = useState<Record<number, EtatModule>>({});
  const [lot, setLot] = useState<{ fait: number; total: number } | null>(null);
  const [rattacher, setRattacher] = useState(true);

  const formations = useQuery({
    queryKey: ["pptx-formations", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formations_catalogue")
        .select("id, titre, programme")
        .eq("formateur_id", user!.id)
        .order("titre");
      if (error) throw error;
      return data ?? [];
    },
  });

  const formation = (formations.data ?? []).find((f) => f.id === formationId);
  const modules = useMemo(() => parseProgramme(formation?.programme), [formation]);
  const occupe = lot !== null || Object.values(etats).some((e) => e.statut === "generation");

  function maj(index: number, etat: EtatModule) {
    setEtats((prev) => ({ ...prev, [index]: etat }));
  }

  /** Génère le .pptx d'un module ; renvoie le fichier ou null en cas d'échec. */
  async function genererModule(index: number, telechargerApres: boolean): Promise<File | null> {
    if (!formation) return null;
    maj(index, { statut: "generation" });
    try {
      const deck = await genererDiapos({ data: { formationId: formation.id, moduleIndex: index } });
      // Import dynamique : pptxgenjs n'est chargé qu'au clic, jamais côté serveur.
      const { construirePptxModule, nomFichierModule, PPTX_MIME } =
        await import("@/lib/pptx-module");
      const blob = await construirePptxModule(deck);
      const fichier = new File([blob], nomFichierModule(deck), { type: PPTX_MIME });
      maj(index, { statut: "pret", fichier, diapos: deck.diapositives.length });
      if (telechargerApres) telecharger(fichier);
      return fichier;
    } catch (error) {
      const message =
        error instanceof Error && error.message ? error.message : "La génération a échoué.";
      maj(index, { statut: "erreur", message });
      return null;
    }
  }

  async function genererUn(index: number) {
    const fichier = await genererModule(index, true);
    if (fichier) toast.success(`PowerPoint du module ${index + 1} téléchargé.`);
    else toast.error(`Le PowerPoint du module ${index + 1} n'a pas pu être généré.`);
  }

  async function genererTous() {
    setLot({ fait: 0, total: modules.length });
    let reussis = 0;
    // Un module à la fois : chaque appel IA reste court et un échec n'interrompt pas les autres.
    for (let i = 0; i < modules.length; i++) {
      const fichier = await genererModule(i, true);
      if (fichier) reussis++;
      setLot({ fait: i + 1, total: modules.length });
    }
    setLot(null);
    if (reussis === modules.length) toast.success(`${reussis} PowerPoint générés et téléchargés.`);
    else
      toast.warning(
        `${reussis} sur ${modules.length} PowerPoint générés : relancez les modules en erreur.`,
      );
  }

  async function enregistrer(index: number) {
    const etat = etats[index];
    if (!user || !formation || !etat || !("fichier" in etat)) return;
    maj(index, { statut: "enregistrement", fichier: etat.fichier, diapos: etat.diapos });
    try {
      await deposerSupportGenerique({
        formateurId: user.id,
        fichier: etat.fichier,
        titre: `${formation.titre} — Module ${index + 1} : ${modules[index]?.titre ?? ""}`.trim(),
        formationId: rattacher ? formation.id : null,
      });
      maj(index, { statut: "enregistre", fichier: etat.fichier, diapos: etat.diapos });
      toast.success("Support enregistré dans « Mes supports de cours ».");
      void queryClient.invalidateQueries({ queryKey: [SUPPORTS_GENERIQUES_KEY] });
    } catch (error) {
      maj(index, { statut: "pret", fichier: etat.fichier, diapos: etat.diapos });
      toast.error(error instanceof Error ? error.message : "Enregistrement impossible.");
    }
  }

  const aEnregistrer = Object.entries(etats)
    .filter(([, e]) => e.statut === "pret")
    .map(([i]) => Number(i));

  async function enregistrerTous() {
    for (const i of aEnregistrer) await enregistrer(i);
  }

  return (
    <Card className="rounded-2xl border-border/70 shadow-soft">
      <CardContent className="grid gap-5 p-6">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Presentation className="size-4 text-primary" aria-hidden />
            Générer un PowerPoint par module
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choisissez une formation : chaque module de son programme devient une présentation prête
            à projeter (objectifs, accroche, contenus, activité, synthèse, questions), avec vos
            notes d'animation sous chaque diapositive.
          </p>
        </div>

        {formations.isLoading ? (
          <Skeleton className="h-10 w-full rounded-md sm:max-w-md" />
        ) : formations.isError ? (
          <p className="text-sm text-destructive">
            Impossible de charger vos formations. Rechargez la page.
          </p>
        ) : (formations.data ?? []).length === 0 ? (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border p-5 text-sm">
            <p className="text-muted-foreground">
              Créez d'abord une formation avec son programme : chaque module donnera un PowerPoint.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/espace/formations/new">
                <FilePlus2 className="size-3.5" /> Créer une formation
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-1.5 sm:max-w-md">
            <Label htmlFor="pptx-formation">Formation</Label>
            <Select
              value={formationId}
              disabled={occupe}
              onValueChange={(v) => {
                setFormationId(v);
                setEtats({});
              }}
            >
              <SelectTrigger id="pptx-formation">
                <SelectValue placeholder="Choisir une formation" />
              </SelectTrigger>
              <SelectContent>
                {(formations.data ?? []).map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.titre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {formation && modules.length === 0 ? (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border p-5 text-sm">
            <p className="text-muted-foreground">
              Le programme de cette formation ne contient encore aucun module.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/espace/formations/$id" params={{ id: formation.id }}>
                Compléter le programme
              </Link>
            </Button>
          </div>
        ) : null}

        {formation && modules.length > 0 ? (
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium">
                {modules.length} module{modules.length > 1 ? "s" : ""} au programme
              </p>
              <div className="flex flex-wrap gap-2">
                {aEnregistrer.length > 1 ? (
                  <Button
                    variant="outline"
                    disabled={occupe}
                    onClick={() => void enregistrerTous()}
                  >
                    <FolderUp className="mr-2 size-4" aria-hidden />
                    Tout enregistrer dans mes supports
                  </Button>
                ) : null}
                <Button variant="cta" disabled={occupe} onClick={() => void genererTous()}>
                  {lot ? (
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  ) : (
                    <Layers className="mr-2 size-4" aria-hidden />
                  )}
                  {lot
                    ? `Génération ${Math.min(lot.fait + 1, lot.total)} / ${lot.total}…`
                    : "Tous les modules"}
                </Button>
              </div>
            </div>

            {lot ? (
              <div className="grid gap-1.5" role="status" aria-live="polite">
                <Progress
                  value={(lot.fait / lot.total) * 100}
                  aria-label="Progression de la génération"
                />
                <p className="text-xs text-muted-foreground">
                  Environ 30 secondes par module. Gardez cette page ouverte : chaque fichier se
                  télécharge dès qu'il est prêt.
                </p>
              </div>
            ) : null}

            <ol className="grid gap-3">
              {modules.map((m, i) => {
                const etat = etats[i];
                const fichierPret = etat && "fichier" in etat ? etat.fichier : null;
                return (
                  <li
                    key={`${i}-${m.titre}`}
                    className="flex flex-col gap-3 rounded-xl border border-border/70 p-4 transition-colors hover:border-primary/30 sm:flex-row sm:items-center"
                  >
                    <span
                      aria-hidden
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-snug">
                        <span className="sr-only">Module {i + 1} : </span>
                        {m.titre || `Module ${i + 1}`}
                      </p>
                      <p className="pt-0.5 text-xs text-muted-foreground" aria-live="polite">
                        {etat?.statut === "generation"
                          ? "Rédaction des diapositives…"
                          : etat?.statut === "erreur"
                            ? etat.message
                            : etat && "diapos" in etat
                              ? `${etat.diapos} diapositives · ${etat.statut === "enregistre" ? "enregistré dans vos supports" : "téléchargé"}`
                              : `${m.points.length} point${m.points.length > 1 ? "s" : ""} clé${m.points.length > 1 ? "s" : ""}`}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {etat?.statut === "enregistre" ? (
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle2 className="size-3.5" aria-hidden /> Enregistré
                        </Badge>
                      ) : null}
                      {etat?.statut === "erreur" ? (
                        <AlertCircle className="size-4 text-destructive" aria-label="Erreur" />
                      ) : null}
                      {fichierPret ? (
                        <Button size="sm" variant="ghost" onClick={() => telecharger(fichierPret)}>
                          <Download className="size-3.5" aria-hidden /> Télécharger
                        </Button>
                      ) : null}
                      {etat?.statut === "pret" || etat?.statut === "enregistrement" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={etat.statut === "enregistrement"}
                          onClick={() => void enregistrer(i)}
                        >
                          {etat.statut === "enregistrement" ? (
                            <Loader2 className="size-3.5 animate-spin" aria-hidden />
                          ) : (
                            <FolderUp className="size-3.5" aria-hidden />
                          )}
                          Enregistrer dans mes supports
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant={etat ? "outline" : "teal"}
                        disabled={occupe}
                        onClick={() => void genererUn(i)}
                        aria-label={`${etat ? "Régénérer" : "Générer"} le PowerPoint du module ${i + 1}`}
                      >
                        {etat?.statut === "generation" ? (
                          <Loader2 className="size-3.5 animate-spin" aria-hidden />
                        ) : etat ? (
                          <RotateCcw className="size-3.5" aria-hidden />
                        ) : (
                          <Presentation className="size-3.5" aria-hidden />
                        )}
                        {etat?.statut === "generation"
                          ? "Génération…"
                          : etat
                            ? "Régénérer"
                            : "Générer"}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ol>

            <label className="flex items-start gap-3 rounded-xl bg-muted/60 p-4 text-sm">
              <Switch
                checked={rattacher}
                onCheckedChange={(v) => setRattacher(v === true)}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium">
                  Rattacher les supports enregistrés à cette formation
                </span>
                <span className="block text-xs text-muted-foreground">
                  Ils seront alors accessibles à ses apprenants ; vous pourrez masquer chaque
                  support dans la liste ci-dessous.
                </span>
              </span>
            </label>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
