import { useEffect, useState } from "react";
import { Linkedin } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/statuts";

type Trouve = {
  nom: string | null;
  email: string | null;
  poste: string | null;
  url: string | null;
};

/** Données réellement exposées par l'identité LinkedIn OIDC — aucune valeur inventée. */
function lireIdentite(data: Record<string, unknown> | null | undefined): Trouve {
  const val = (cle: string) => {
    const brut = data?.[cle];
    return typeof brut === "string" && brut.trim() ? brut.trim() : null;
  };
  return {
    nom:
      val("name") ??
      ([val("given_name"), val("family_name")].filter(Boolean).join(" ") || null),
    email: val("email"),
    poste: val("headline") ?? val("job_title"),
    url: val("profile") ?? val("public_profile_url") ?? val("website"),
  };
}

export function LinkedinConnect() {
  const { profile, user, refresh } = useAuth();
  const [busy, setBusy] = useState(false);
  const [trouve, setTrouve] = useState<Trouve | null>(null);
  const dejaConnecte = Boolean(profile?.linkedin_connected_at);

  // Au retour de la redirection OAuth, on lit l'identité liée et on demande confirmation.
  useEffect(() => {
    if (!user || dejaConnecte) return;
    let annule = false;
    void (async () => {
      const { data } = await supabase.auth.getUserIdentities();
      const identite = data?.identities?.find((i) => i.provider === "linkedin_oidc");
      if (!identite || annule) return;
      setTrouve(lireIdentite(identite.identity_data as Record<string, unknown> | undefined));
    })();
    return () => {
      annule = true;
    };
  }, [user, dejaConnecte]);

  async function connecter() {
    setBusy(true);
    const redirectTo = `${window.location.origin}/espace/profil`;
    const { error } = await supabase.auth.linkIdentity({
      provider: "linkedin_oidc",
      options: { redirectTo },
    });
    if (error) {
      setBusy(false);
      toast.error(
        "La connexion LinkedIn n'est pas disponible : le fournisseur LinkedIn n'est pas activé sur cet environnement.",
      );
    }
  }

  async function importer() {
    if (!user || !trouve) return;
    setBusy(true);
    const patch: Record<string, string | null> = {
      linkedin_connected_at: new Date().toISOString(),
    };
    if (trouve.url) patch.linkedin_url = trouve.url;
    // On complète sans jamais écraser un parcours déjà rédigé.
    if (!profile?.parcours_formation && trouve.poste) {
      patch.parcours_formation = trouve.poste;
    }
    const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
    setBusy(false);
    if (error) {
      toast.error("Import impossible.");
      return;
    }
    setTrouve(null);
    await refresh();
    toast.success("Profil LinkedIn importé.");
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {dejaConnecte ? (
        <Badge variant="secondary" className="gap-1.5">
          <Linkedin className="size-3.5" /> Profil LinkedIn connecté le{" "}
          {formatDate(profile?.linkedin_connected_at ?? null)}
        </Badge>
      ) : null}
      {dejaConnecte && profile?.linkedin_url ? (
        <a
          href={profile.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold underline"
        >
          Voir mon profil LinkedIn
        </a>
      ) : null}
      <Button type="button" variant="outline" size="sm" onClick={() => void connecter()} disabled={busy}>
        <Linkedin className="mr-1.5 size-4" />
        {dejaConnecte ? "Actualiser depuis LinkedIn" : "Connecter mon profil LinkedIn"}
      </Button>

      <Dialog open={Boolean(trouve)} onOpenChange={(open) => (open ? null : setTrouve(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voici ce que nous avons trouvé sur votre profil LinkedIn</DialogTitle>
            <DialogDescription>
              Importer ces informations dans votre profil formateur ? Rien n'est écrit avant votre
              confirmation, et votre parcours déjà rédigé n'est jamais écrasé.
            </DialogDescription>
          </DialogHeader>
          <dl className="grid gap-2 text-sm">
            {[
              ["Nom", trouve?.nom],
              ["E-mail", trouve?.email],
              ["Intitulé de poste", trouve?.poste],
              ["URL du profil", trouve?.url],
            ].map(([label, valeur]) => (
              <div key={label as string} className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="truncate font-medium">{valeur || "Non communiqué"}</dd>
              </div>
            ))}
          </dl>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTrouve(null)}>
              Annuler
            </Button>
            <Button type="button" variant="cta" onClick={() => void importer()} disabled={busy}>
              Importer dans mon profil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
