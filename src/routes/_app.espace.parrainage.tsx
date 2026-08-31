import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Mail, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import visuel from "@/assets/people-equipe.jpg";
import { AppShell } from "@/components/app/AppShell";
import { FORMATEUR_NAV } from "@/components/app/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { TONE_CLASSES } from "@/lib/statuts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/espace/parrainage")({
  component: Parrainage,
  head: () => ({
    meta: [
      { title: "Programme Ambassadeur — Espace formateur Skills4mation" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type FilleulType = "formateur" | "client";
type Statut = "invite" | "inscrit" | "actif";

const STATUTS: Record<Statut, { label: string; tone: keyof typeof TONE_CLASSES }> = {
  invite: { label: "Invité", tone: "neutral" },
  inscrit: { label: "Inscrit", tone: "info" },
  actif: { label: "Actif", tone: "success" },
};

const TYPES: Record<FilleulType, string> = {
  formateur: "Formateur porté",
  client: "Client / entreprise",
};

function Parrainage() {
  const { user, profile } = useAuth();
  const qc = useQueryClient();

  const [email, setEmail] = useState("");
  const [nom, setNom] = useState("");
  const [type, setType] = useState<FilleulType>("formateur");
  const [commentaire, setCommentaire] = useState("");

  const filleuls = useQuery({
    queryKey: ["ambassadeurs", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ambassadeurs")
        .select("id, filleul_email, filleul_nom, filleul_type, statut, commentaire, created_at")
        .eq("parrain_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const lien = `https://skills4mation.com/pole-formateur?parrain=${user?.id ?? ""}`;

  const inviter = useMutation({
    mutationFn: async () => {
      const clean = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) throw new Error("E-mail invalide.");
      const { error } = await supabase.from("ambassadeurs").insert({
        parrain_id: user!.id,
        filleul_email: clean,
        filleul_nom: nom.trim() || null,
        filleul_type: type,
        commentaire: commentaire.trim() || null,
      });
      if (error) throw error;
      return clean;
    },
    onSuccess: (clean) => {
      const prenom = profile?.prenom ?? "";
      const sujet = encodeURIComponent(
        type === "formateur"
          ? "Rejoins Skills4mation, le portage Qualiopi clé en main"
          : "Vos formations financées et conformes Qualiopi avec Skills4mation",
      );
      const corps = encodeURIComponent(
        `Bonjour,\n\n${prenom} vous recommande Skills4mation.\n\n${lien}\n\nÀ bientôt,\n${prenom}`,
      );
      window.location.href = `mailto:${clean}?subject=${sujet}&body=${corps}`;
      setEmail("");
      setNom("");
      setCommentaire("");
      toast.success("Parrainage enregistré, votre e-mail d'invitation est prêt.");
      qc.invalidateQueries({ queryKey: ["ambassadeurs", user?.id] });
    },
    onError: (e: Error) =>
      toast.error(
        e.message.includes("duplicate") ? "Ce filleul est déjà parrainé." : e.message,
      ),
  });

  const majStatut = useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: Statut }) => {
      const { error } = await supabase.from("ambassadeurs").update({ statut }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Statut mis à jour.");
      qc.invalidateQueries({ queryKey: ["ambassadeurs", user?.id] });
    },
  });

  const rows = filleuls.data ?? [];
  const compte = (s: Statut) => rows.filter((r) => r.statut === s).length;

  return (
    <AppShell
      items={FORMATEUR_NAV}
      title="Programme Ambassadeur"
      subtitle="Recommandez Skills4mation à un formateur ou à une entreprise et suivez vos parrainages"
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <h2 className="text-sm font-semibold">Parrainer par e-mail</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="p-email">E-mail du filleul *</Label>
                <Input
                  id="p-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="prenom.nom@exemple.fr"
                />
              </div>
              <div>
                <Label htmlFor="p-nom">Nom (optionnel)</Label>
                <Input id="p-nom" value={nom} onChange={(e) => setNom(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Type de filleul</Label>
              <div className="mt-2 flex gap-2">
                {(Object.keys(TYPES) as FilleulType[]).map((t) => (
                  <Button
                    key={t}
                    type="button"
                    variant={type === t ? "default" : "outline"}
                    size="sm"
                    onClick={() => setType(t)}
                  >
                    {TYPES[t]}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="p-com">Contexte (optionnel)</Label>
              <Textarea
                id="p-com"
                rows={3}
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Comment le connaissez-vous, quel besoin de formation ?"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="cta"
                onClick={() => inviter.mutate()}
                disabled={inviter.isPending || !email.trim()}
              >
                <Send className="mr-1.5 size-4" /> Enregistrer et inviter
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await navigator.clipboard.writeText(lien);
                  toast.success("Lien de parrainage copié.");
                }}
              >
                <Copy className="mr-1.5 size-4" /> Copier mon lien
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border">
            <img
              src={visuel}
              alt="Formateurs du réseau Skills4mation"
              className="h-40 w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(STATUTS) as Statut[]).map((s) => (
              <Card key={s}>
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold">{compte(s)}</p>
                  <p className="text-xs text-muted-foreground">{STATUTS[s].label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <h2 className="text-sm font-semibold">Mes parrainages</h2>
          {rows.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Aucun parrainage pour le moment. Invitez un confrère formateur ou une entreprise.
            </p>
          ) : (
            <ul className="mt-4 divide-y">
              {rows.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-56 flex-1">
                    <p className="text-sm font-semibold">{r.filleul_nom || r.filleul_email}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.filleul_email} · {TYPES[r.filleul_type as FilleulType]} ·{" "}
                      {new Date(r.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-semibold",
                      TONE_CLASSES[STATUTS[r.statut as Statut].tone],
                    )}
                  >
                    {STATUTS[r.statut as Statut].label}
                  </span>
                  {r.statut !== "actif" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        majStatut.mutate({
                          id: r.id,
                          statut: r.statut === "invite" ? "inscrit" : "actif",
                        })
                      }
                    >
                      {r.statut === "invite" ? "Marquer inscrit" : "Marquer actif"}
                    </Button>
                  ) : null}
                  <Button size="sm" variant="ghost" asChild>
                    <a href={`mailto:${r.filleul_email}`}>
                      <Mail className="size-4" />
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
