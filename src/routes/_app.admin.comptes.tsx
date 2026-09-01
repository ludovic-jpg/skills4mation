import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { SUPER_ADMIN_NAV } from "@/components/app/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth, type AppRole } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/admin/comptes")({
  component: AdminComptes,
});

const ROLES_GERABLES: { value: AppRole; label: string }[] = [
  { value: "conseillere", label: "Conseillère formation" },
  { value: "super_admin", label: "Super admin" },
];

const LABELS: Record<string, string> = {
  super_admin: "Super admin",
  admin: "Super admin (héritée)",
  conseillere: "Conseillère formation",
  formateur: "Formateur",
  apprenant: "Apprenant",
};

type Profil = { id: string; prenom: string; nom: string; email: string };

function AdminComptes() {
  const { isSuperAdmin, loading, user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [choix, setChoix] = useState<Record<string, AppRole>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin-comptes"],
    enabled: isSuperAdmin,
    queryFn: async () => {
      const [{ data: profils, error: e1 }, { data: roles, error: e2 }] = await Promise.all([
        supabase.from("profiles").select("id, prenom, nom, email").order("nom"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      return {
        profils: (profils ?? []) as Profil[],
        roles: (roles ?? []) as { user_id: string; role: string }[],
      };
    },
  });

  const attribuer = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rôle attribué.");
      void queryClient.invalidateQueries({ queryKey: ["admin-comptes"] });
    },
    onError: () => toast.error("Attribution impossible."),
  });

  const retirer = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rôle retiré.");
      void queryClient.invalidateQueries({ queryKey: ["admin-comptes"] });
    },
    onError: () => toast.error("Retrait impossible."),
  });

  if (!loading && !isSuperAdmin) {
    return (
      <AppShell items={SUPER_ADMIN_NAV} title="Comptes & rôles">
        <Card className="rounded-2xl border-destructive/30">
          <CardContent className="p-8 text-sm text-muted-foreground">
            Accès réservé aux super admins Skills4mation.
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const rolesDe = (id: string) => (data?.roles ?? []).filter((r) => r.user_id === id);
  const profils = (data?.profils ?? []).filter((p) =>
    `${p.prenom} ${p.nom} ${p.email}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AppShell
      items={SUPER_ADMIN_NAV}
      title="Comptes & rôles"
      subtitle="Attribuer les rôles Conseillère formation et Super admin"
    >
      <Input
        placeholder="Rechercher un compte…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="max-w-sm"
      />

      <div className="mt-6 grid gap-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : profils.length === 0 ? (
          <Card className="rounded-2xl border-dashed">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              Aucun compte pour cette recherche.
            </CardContent>
          </Card>
        ) : (
          profils.map((p) => {
            const roles = rolesDe(p.id);
            const soiMeme = p.id === user?.id;
            return (
              <Card key={p.id} className="rounded-2xl border-border/70 shadow-soft">
                <CardContent className="flex flex-wrap items-start justify-between gap-4 p-6">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold">
                      {`${p.prenom} ${p.nom}`.trim() || p.email}
                    </h2>
                    <p className="text-sm text-muted-foreground">{p.email}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {roles.length === 0 ? (
                        <span className="text-xs text-muted-foreground">Aucun rôle</span>
                      ) : (
                        roles.map((r) => (
                          <span
                            key={r.role}
                            className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold"
                          >
                            {LABELS[r.role] ?? r.role}
                            {r.role === "conseillere" || r.role === "super_admin" ? (
                              <button
                                type="button"
                                disabled={soiMeme || retirer.isPending}
                                onClick={() =>
                                  retirer.mutate({ userId: p.id, role: r.role as AppRole })
                                }
                                className="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-40"
                              >
                                ×
                              </button>
                            ) : null}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={choix[p.id] ?? "conseillere"}
                      onValueChange={(value) =>
                        setChoix((prev) => ({ ...prev, [p.id]: value as AppRole }))
                      }
                    >
                      <SelectTrigger className="w-56">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES_GERABLES.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="teal"
                      size="sm"
                      disabled={attribuer.isPending}
                      onClick={() =>
                        attribuer.mutate({
                          userId: p.id,
                          role: choix[p.id] ?? "conseillere",
                        })
                      }
                    >
                      Attribuer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
