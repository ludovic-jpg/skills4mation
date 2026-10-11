import { useState } from "react";
import { toast } from "sonner";
import { PencilLine } from "lucide-react";

import { ChoixCartes } from "@/components/candidature/Champs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import {
  DOMAINES,
  EXPERIENCES,
  MODALITES,
  PUBLICS,
  QUESTIONNAIRE_VERSION,
  lireQuestionnaire,
  resumeQuestionnaire,
  type DomaineId,
  type ExperienceId,
  type ModaliteId,
  type PublicId,
} from "@/lib/candidature-questionnaire";

/**
 * « Mon profil formateur » : domaines, expérience, publics et modalités issus du questionnaire
 * de candidature, lisibles en badges et modifiables simplement. Tolère un profil sans
 * questionnaire (ancien compte) ou une base pas encore migrée.
 */
export function ProfilFormateurCard({
  userId,
  questionnaire,
  onSaved,
}: {
  userId: string | undefined;
  questionnaire: unknown;
  onSaved: () => Promise<void>;
}) {
  const q = lireQuestionnaire(questionnaire);
  const [edition, setEdition] = useState(false);
  const [saving, setSaving] = useState(false);
  const [domaines, setDomaines] = useState<DomaineId[]>([]);
  const [experience, setExperience] = useState<ExperienceId | "">("");
  const [publics, setPublics] = useState<PublicId[]>([]);
  const [modalites, setModalites] = useState<ModaliteId[]>([]);

  function ouvrir() {
    setDomaines(q?.domaines ?? []);
    setExperience(q?.experience ?? "");
    setPublics(q?.publics ?? []);
    setModalites(q?.modalites ?? []);
    setEdition(true);
  }

  async function enregistrer() {
    if (!userId) return;
    setSaving(true);
    const base =
      questionnaire && typeof questionnaire === "object" && !Array.isArray(questionnaire)
        ? (questionnaire as Record<string, unknown>)
        : {};
    const suivant = {
      ...base,
      version: q?.version ?? QUESTIONNAIRE_VERSION,
      domaines,
      domaine_autre: domaines.includes("autre") ? (q?.domaine_autre ?? null) : null,
      experience: experience || null,
      publics,
      modalites,
    };
    const { error } = await supabase
      .from("profiles")
      .update({ questionnaire: suivant as Json })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      toast.error(
        error.code === "42703"
          ? "Cette section sera disponible après la prochaine mise à jour de la plateforme."
          : "Enregistrement impossible.",
      );
      return;
    }
    await onSaved();
    setEdition(false);
    toast.success("Profil formateur mis à jour.");
  }

  const resume = resumeQuestionnaire(questionnaire).filter((l) =>
    ["Domaines", "Expérience", "Publics", "Modalités", "Zone d'intervention"].includes(l.label),
  );

  return (
    <Card className="rounded-2xl border-border/70 shadow-soft">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Mon profil formateur</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Vos domaines, publics et façons de former : ils aident l'équipe à vous proposer les
              bons projets.
            </p>
          </div>
          {!edition ? (
            <Button type="button" variant="outline" size="sm" onClick={ouvrir}>
              <PencilLine className="size-4" aria-hidden /> Modifier
            </Button>
          ) : null}
        </div>

        {!edition ? (
          resume.length ? (
            <dl className="mt-5 grid gap-4">
              {resume.map((ligne) => (
                <div key={ligne.label} className="grid gap-1.5 sm:grid-cols-[10rem_1fr]">
                  <dt className="text-sm text-muted-foreground">{ligne.label}</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {ligne.valeurs.map((v) => (
                      <Badge
                        key={v}
                        variant="outline"
                        className="rounded-full border-primary/20 bg-accent font-medium text-accent-foreground"
                      >
                        {v}
                      </Badge>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-5 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
              Pas encore renseigné. Cliquez sur « Modifier » pour indiquer vos domaines et vos
              publics.
            </p>
          )
        ) : (
          <div className="mt-5 grid gap-6">
            <ChoixCartes
              name="pf-domaines"
              legende="Domaines"
              options={DOMAINES}
              valeurs={domaines}
              multiple
              colonnes={3}
              onChange={(v) => setDomaines(v as DomaineId[])}
            />
            <ChoixCartes
              name="pf-experience"
              legende="Expérience de formateur"
              options={EXPERIENCES}
              valeurs={experience ? [experience] : []}
              colonnes={2}
              onChange={(v) => setExperience((v[0] ?? "") as ExperienceId | "")}
            />
            <ChoixCartes
              name="pf-publics"
              legende="Publics"
              options={PUBLICS}
              valeurs={publics}
              multiple
              colonnes={3}
              onChange={(v) => setPublics(v as PublicId[])}
            />
            <ChoixCartes
              name="pf-modalites"
              legende="Modalités"
              options={MODALITES}
              valeurs={modalites}
              multiple
              colonnes={3}
              onChange={(v) => setModalites(v as ModaliteId[])}
            />
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="cta"
                disabled={saving}
                onClick={() => void enregistrer()}
              >
                {saving ? "Enregistrement…" : "Enregistrer mon profil formateur"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={saving}
                onClick={() => setEdition(false)}
              >
                Annuler
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
