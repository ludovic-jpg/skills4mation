import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion espace formateur — Skills4mation" },
      {
        name: "description",
        content:
          "Connectez-vous à votre espace Skills4mation pour gérer vos dossiers de formation et vos pièces Qualiopi.",
      },
      { property: "og:title", content: "Connexion espace formateur — Skills4mation" },
      { property: "og:description", content: "Accès à l'espace formateur Skills4mation." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const { session, isAdmin, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      void router.navigate({ to: isAdmin ? "/admin" : "/espace" });
    }
  }, [loading, session, isAdmin, router]);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
    setBusy(false);
    if (error) toast.error("Identifiants incorrects.");
  }

  async function signUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          prenom: String(form.get("prenom") ?? ""),
          nom: String(form.get("nom") ?? ""),
        },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Compte créé. Vérifiez votre boîte mail si une confirmation est demandée.");
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error("Connexion Google indisponible.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4 py-14">
      <div className="w-full max-w-md">
        <div className="mx-auto w-fit rounded-xl bg-background px-4 py-3">
          <Logo />
        </div>
        <Card className="mt-6 rounded-3xl border-none shadow-elevated">
          <CardContent className="p-7">
            <Tabs defaultValue="connexion">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="connexion">Connexion</TabsTrigger>
                <TabsTrigger value="inscription">Créer un compte</TabsTrigger>
              </TabsList>

              <TabsContent value="connexion" className="mt-6">
                <form onSubmit={signIn} className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" name="email" type="email" required autoComplete="email" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <Button type="submit" variant="cta" size="lg" disabled={busy}>
                    Se connecter
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="inscription" className="mt-6">
                <form onSubmit={signUp} className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="su-prenom">Prénom</Label>
                      <Input id="su-prenom" name="prenom" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="su-nom">Nom</Label>
                      <Input id="su-nom" name="nom" required />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="su-email">Email</Label>
                    <Input id="su-email" name="email" type="email" required autoComplete="email" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="su-password">Mot de passe</Label>
                    <Input
                      id="su-password"
                      name="password"
                      type="password"
                      minLength={8}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  <Button type="submit" variant="cta" size="lg" disabled={busy}>
                    Créer mon compte
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
            </div>
            <Button variant="outline" size="lg" className="w-full" onClick={google}>
              Continuer avec Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
