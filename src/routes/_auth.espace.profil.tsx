import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { FORMATEUR_NAV } from "@/components/app/nav";
import { StatutBadge } from "@/components/StatutBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_auth/espace/profil")({
  component: Profil,
});

function Profil() {
  const { profile, user, refresh } = useAuth();
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        prenom: String(form.get("prenom") ?? "").trim().slice(0, 80),
        nom: String(form.get("nom") ?? "").trim().slice(0, 80),
        telephone: String(form.get("telephone") ?? "").trim().slice(0, 30) || null,
        siret: String(form.get("siret") ?? "").trim().slice(0, 20) || null,
        date_naissance: String(form.get("date_naissance") ?? "") || null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Enregistrement impossible.");
      return;
    }
    await refresh();
    toast.success("Profil mis à jour.");
  }

  return (
    <AppShell items={FORMATEUR_NAV} title="Mon profil" subtitle="Vos informations formateur">
      <Card className="max-w-2xl rounded-2xl border-border/70 shadow-soft">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Statut de candidature</p>
            <StatutBadge kind="candidature" statut={profile?.statut_candidature ?? "en_attente"} />
          </div>

          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input id="prenom" name="prenom" defaultValue={profile?.prenom ?? ""} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" name="nom" defaultValue={profile?.nom ?? ""} required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email ?? ""} disabled />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input id="telephone" name="telephone" defaultValue={profile?.telephone ?? ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="siret">SIRET</Label>
                <Input id="siret" name="siret" defaultValue={profile?.siret ?? ""} maxLength={20} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date_naissance">Date de naissance</Label>
              <Input
                id="date_naissance"
                name="date_naissance"
                type="date"
                defaultValue={profile?.date_naissance ?? ""}
              />
            </div>
            <Button type="submit" variant="cta" size="lg" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
