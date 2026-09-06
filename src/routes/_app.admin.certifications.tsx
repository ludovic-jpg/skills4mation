import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { adminNav } from "@/components/app/nav";
import type { Certification } from "@/components/app/CertificationSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/admin/certifications")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: AdminCertifications,
});

type Brouillon = Partial<Certification>;

function AdminCertifications() {
  const { isConseiller, loading } = useAuth();
  const queryClient = useQueryClient();
  const [edits, setEdits] = useState<Record<string, Brouillon>>({});

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-certifications"],
    enabled: isConseiller,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certifications")
        .select("id, marque, thematique, code_rs, prix_formateur_ttc, eligible_cpf, actif")
        .order("marque")
        .order("thematique");
      if (error) throw error;
      return (data ?? []) as Certification[];
    },
  });

  const save = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Brouillon }) => {
      const { error } = await supabase
        .from("certifications")
        .update({
          code_rs: patch.code_rs?.trim() ? patch.code_rs.trim() : null,
          prix_formateur_ttc: Number(patch.prix_formateur_ttc ?? 0) || 0,
          eligible_cpf: Boolean(patch.eligible_cpf),
          actif: Boolean(patch.actif),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_r, { id }) => {
      setEdits((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      void queryClient.invalidateQueries({ queryKey: ["admin-certifications"] });
      void queryClient.invalidateQueries({ queryKey: ["certifications"] });
      toast.success("Certification mise à jour.");
    },
    onError: (e: Error) =>
      toast.error(
        e.message.includes("certifications_cpf_requires_rs")
          ? "Un code RS est obligatoire pour rendre une certification éligible au CPF."
          : e.message,
      ),
  });

  if (!loading && !isConseiller) {
    return (
      <AppShell items={adminNav()} title="Certifications">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Cet écran est réservé à l&apos;équipe Skills4mation (rôle conseiller formation).
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      items={adminNav()}
      title="Certifications éligibles"
      subtitle="ICDL et Lilliate : codes RS, prix formateur et éligibilité CPF."
    >
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Marque</th>
                <th className="p-3">Thématique</th>
                <th className="p-3">Code RS</th>
                <th className="p-3">Prix formateur TTC</th>
                <th className="p-3">Éligible CPF</th>
                <th className="p-3">Actif</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={7}>
                    Chargement…
                  </td>
                </tr>
              ) : null}
              {data.map((c) => {
                const draft = { ...c, ...(edits[c.id] ?? {}) } as Certification;
                const modifie = Boolean(edits[c.id]);
                const set = (patch: Brouillon) =>
                  setEdits((prev) => ({ ...prev, [c.id]: { ...draft, ...patch } }));
                return (
                  <tr key={c.id} className="border-b border-border/60">
                    <td className="p-3 font-semibold">{c.marque}</td>
                    <td className="p-3">{c.thematique}</td>
                    <td className="p-3">
                      <Input
                        value={draft.code_rs ?? ""}
                        placeholder="RS…"
                        className="w-32"
                        onChange={(e) => set({ code_rs: e.target.value })}
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        type="number"
                        step="0.01"
                        value={String(draft.prix_formateur_ttc ?? "")}
                        className="w-28"
                        onChange={(e) => set({ prix_formateur_ttc: Number(e.target.value) })}
                      />
                    </td>
                    <td className="p-3">
                      <Switch
                        checked={draft.eligible_cpf}
                        onCheckedChange={(v) => set({ eligible_cpf: v })}
                      />
                    </td>
                    <td className="p-3">
                      <Switch checked={draft.actif} onCheckedChange={(v) => set({ actif: v })} />
                    </td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        disabled={!modifie || save.isPending}
                        onClick={() => save.mutate({ id: c.id, patch: draft })}
                      >
                        Enregistrer
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <p className="mt-4 text-xs text-muted-foreground">
        Une certification ne peut devenir éligible au CPF qu&apos;avec un code RS renseigné.
      </p>
    </AppShell>
  );
}
