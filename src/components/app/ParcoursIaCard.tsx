import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  analyserFormationPourParcours,
  type ParcoursAnalyse,
} from "@/lib/parcours-ia.functions";

/** Modules édités sous forme de texte : un module par bloc, points en début de ligne par « - ». */
function modulesEnTexte(modules: ParcoursAnalyse["modules"]) {
  return modules
    .map((m) => [m.titre, ...m.points.map((p) => `- ${p}`)].join("\n"))
    .join("\n\n");
}

function texteEnModules(texte: string) {
  return texte
    .split(/\n\s*\n/)
    .map((bloc) => {
      const lignes = bloc.split("\n").map((l) => l.trim()).filter(Boolean);
      const titre = lignes.shift() ?? "";
      return {
        titre,
        points: lignes.map((l) => l.replace(/^[-•*]\s*/, "")),
      };
    })
    .filter((m) => m.titre || m.points.length > 0);
}

export function ParcoursIaCard() {
  const { user } = useAuth();
  const analyser = useServerFn(analyserFormationPourParcours);
  const [busy, setBusy] = useState<null | "upload" | "save">(null);
  const [source, setSource] = useState<string | null>(null);
  const [analyse, setAnalyse] = useState<ParcoursAnalyse | null>(null);
  const [modulesTexte, setModulesTexte] = useState("");

  async function traiter(file: File) {
    if (!user) return;
    setBusy("upload");
    const path = `${user.id}/parcours-ia/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("candidatures")
      .upload(path, file, { upsert: true, contentType: file.type || "application/pdf" });
    if (error) {
      setBusy(null);
      toast.error("Envoi du document impossible.");
      return;
    }
    try {
      const resultat = await analyser({ data: { path, nomFichier: file.name } });
      setSource(path);
      setAnalyse(resultat);
      setModulesTexte(modulesEnTexte(resultat.modules));
      toast.success("Analyse terminée : vérifiez et corrigez avant d'enregistrer.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analyse impossible.");
    }
    setBusy(null);
  }

  async function enregistrer() {
    if (!user || !analyse) return;
    setBusy("save");
    const { count } = await supabase
      .from("parcours_formation")
      .select("id", { count: "exact", head: true })
      .eq("formateur_id", user.id);
    const { error } = await supabase.from("parcours_formation").insert({
      formateur_id: user.id,
      titre: analyse.titre || "Parcours de formation",
      description: analyse.objectifs,
      objectifs: analyse.objectifs,
      prerequis: analyse.prerequis,
      duree_heures: analyse.dureeHeures,
      modules: texteEnModules(modulesTexte),
      document_source_url: source,
      genere_par_ia: true,
      ordre: (count ?? 0) + 1,
    });
    setBusy(null);
    if (error) {
      toast.error("Enregistrement du parcours impossible.");
      return;
    }
    setAnalyse(null);
    setSource(null);
    toast.success("Parcours Skills4mation enregistré.");
  }

  return (
    <Card className="rounded-2xl border-border/70 shadow-soft">
      <CardContent className="p-6">
        <h2 className="inline-flex items-center gap-2 text-base font-semibold">
          <Sparkles className="size-4 text-cta-foreground" /> Générer un parcours depuis un support
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Déposez un support existant (PDF ou Word) : l'IA en extrait un parcours structuré (titre,
          objectifs, prérequis, durée, modules) que vous pouvez corriger avant enregistrement.
        </p>

        <label className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border p-4">
          <span className="text-sm font-medium">Support de formation (PDF ou Word)</span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold">
            <Upload className="size-3.5" />
            {busy === "upload" ? "Analyse en cours…" : "Choisir un fichier"}
          </span>
          <input
            type="file"
            className="hidden"
            accept="application/pdf,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            disabled={busy !== null}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void traiter(file);
            }}
          />
        </label>

        {analyse ? (
          <form
            className="mt-6 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void enregistrer();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="ia_titre">Titre de la formation</Label>
              <Input
                id="ia_titre"
                value={analyse.titre}
                onChange={(e) => setAnalyse({ ...analyse, titre: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ia_objectifs">Objectifs pédagogiques</Label>
              <Textarea
                id="ia_objectifs"
                rows={5}
                value={analyse.objectifs}
                onChange={(e) => setAnalyse({ ...analyse, objectifs: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="ia_prerequis">Prérequis</Label>
                <Textarea
                  id="ia_prerequis"
                  rows={3}
                  value={analyse.prerequis}
                  onChange={(e) => setAnalyse({ ...analyse, prerequis: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ia_duree">Durée totale (heures)</Label>
                <Input
                  id="ia_duree"
                  type="number"
                  min={0}
                  value={analyse.dureeHeures ?? ""}
                  onChange={(e) =>
                    setAnalyse({
                      ...analyse,
                      dureeHeures: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ia_modules">
                Modules — un module par bloc : titre sur la première ligne, points clés préfixés
                par « - »
              </Label>
              <Textarea
                id="ia_modules"
                rows={10}
                value={modulesTexte}
                onChange={(e) => setModulesTexte(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              variant="cta"
              className="justify-self-start"
              disabled={busy === "save"}
            >
              {busy === "save" ? "Enregistrement…" : "Enregistrer comme parcours Skills4mation"}
            </Button>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
