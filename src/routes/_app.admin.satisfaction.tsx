import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { AppShell } from "@/components/app/AppShell";
import { adminNav } from "@/components/app/nav";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/admin/satisfaction")({
  component: AdminSatisfaction,
  head: () => ({
    meta: [
      { title: "Satisfaction agrégée — Back-office Skills4mation" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

/**
 * Les questionnaires F5 (à chaud) et F7 (à froid) existent déjà et sont
 * archivés un par un dans document_envois.reponse_json, mais rien n'agrège
 * leurs notes : un formateur ou l'équipe devait ouvrir chaque réponse
 * individuellement pour se faire une idée de la tendance. Cet écran calcule
 * les moyennes par critère et par questionnaire, seule vue d'ensemble
 * exploitable comme preuve d'amélioration continue.
 */
const CRITERES_F5: { id: string; label: string }[] = [
  { id: "objectifs", label: "Objectifs clairement présentés" },
  { id: "contenu", label: "Contenu (attentes et niveau)" },
  { id: "animation", label: "Animation et pédagogie" },
  { id: "supports", label: "Supports et moyens" },
  { id: "organisation", label: "Organisation matérielle" },
  { id: "application", label: "Application dans l'activité" },
];

const CRITERES_F7: { id: string; label: string }[] = [
  { id: "pratique", label: "Mise en pratique des acquis" },
  { id: "effets", label: "Effets mesurables sur l'activité" },
  { id: "mobilisation", label: "Compétences toujours mobilisées" },
  { id: "accompagnement", label: "Accompagnement post-formation" },
  { id: "recommandation", label: "Recommanderait la formation" },
];

/** Les réponses sont stockées telles que saisies (« 3 — satisfait ») : on ne lit que le chiffre initial. */
function noteDe(valeur: unknown): number | null {
  const m = /^(\d)/.exec(String(valeur ?? "").trim());
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function moyenne(valeurs: number[]) {
  return valeurs.length ? valeurs.reduce((s, v) => s + v, 0) / valeurs.length : null;
}

function BlocQuestionnaire({
  titre,
  criteres,
  reponses,
}: {
  titre: string;
  criteres: { id: string; label: string }[];
  reponses: Record<string, string>[];
}) {
  const parCritere = criteres.map((c) => ({
    ...c,
    moyenne: moyenne(reponses.map((r) => noteDe(r[c.id])).filter((n): n is number => n !== null)),
  }));
  const toutesLesNotes = criteres.flatMap((c) =>
    reponses.map((r) => noteDe(r[c.id])).filter((n): n is number => n !== null),
  );
  const moyenneGlobale = moyenne(toutesLesNotes);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">{titre}</h2>
          <span className="text-xs text-muted-foreground">
            {reponses.length} réponse{reponses.length > 1 ? "s" : ""}
          </span>
        </div>
        {reponses.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Aucune réponse archivée pour l'instant.</p>
        ) : (
          <>
            <p className="mt-1 text-2xl font-bold">
              {moyenneGlobale === null ? "—" : `${moyenneGlobale.toFixed(1)} / 5`}
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                moyenne toutes notes confondues
              </span>
            </p>
            <dl className="mt-4 grid gap-1.5 text-sm">
              {parCritere.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-1.5"
                >
                  <dt className="text-muted-foreground">{c.label}</dt>
                  <dd className="font-semibold">{c.moyenne === null ? "—" : c.moyenne.toFixed(1)}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function AdminSatisfaction() {
  const { isConseiller } = useAuth();
  const equipe = isConseiller;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-satisfaction"],
    enabled: equipe,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_envois")
        .select("code, reponse_json")
        .in("code", ["F5", "F7"])
        .not("reponse_json", "is", null);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { reponsesF5, reponsesF7 } = useMemo(() => {
    const f5: Record<string, string>[] = [];
    const f7: Record<string, string>[] = [];
    for (const row of data ?? []) {
      const reponses = (row.reponse_json ?? {}) as Record<string, string>;
      if (row.code === "F5") f5.push(reponses);
      else if (row.code === "F7") f7.push(reponses);
    }
    return { reponsesF5: f5, reponsesF7: f7 };
  }, [data]);

  if (!equipe) {
    return (
      <AppShell items={adminNav()} title="Satisfaction agrégée">
        <Card className="rounded-2xl border-destructive/30">
          <CardContent className="p-8 text-sm text-muted-foreground">
            Accès réservé à l'équipe Skills4mation.
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      items={adminNav()}
      title="Satisfaction agrégée"
      subtitle="Moyennes des questionnaires de satisfaction à chaud (F5) et à froid (F7), déjà collectés en ligne mais jusqu'ici jamais agrégés."
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <BlocQuestionnaire
            titre="Satisfaction à chaud (F5)"
            criteres={CRITERES_F5}
            reponses={reponsesF5}
          />
          <BlocQuestionnaire
            titre="Satisfaction à froid — 3 mois (F7)"
            criteres={CRITERES_F7}
            reponses={reponsesF7}
          />
        </div>
      )}
    </AppShell>
  );
}
