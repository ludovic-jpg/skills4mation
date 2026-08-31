import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, FolderCheck, ShieldCheck, Signature } from "lucide-react";

import { Logo } from "@/components/Brand";
import formatriceTablette from "@/assets/formatrice-tablette.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

function safeNext(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return undefined;
  return value;
}

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ next: safeNext(s['next']) }),
  head: () => ({
    meta: [
      { title: "Espace formateur — Connexion Skills4mation" },
      {
        name: "description",
        content:
          "Connectez-vous à l'espace formateur Skills4mation (portage Qualiopi) pour gérer vos dossiers de formation, vos pièces et vos signatures.",
      },
      { property: "og:title", content: "Espace formateur — Connexion Skills4mation" },
      { property: "og:description", content: "Accès au SaaS de portage Qualiopi Skills4mation." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

const ATOUTS = [
  { icon: FolderCheck, texte: "Vos dossiers de formation certifiés Qualiopi en 48 h" },
  { icon: Signature, texte: "Signature et archivage de vos pièces en ligne" },
  { icon: ShieldCheck, texte: "Paiement sous 10 jours ouvrés à réception des fonds" },
];

function AuthPage() {
  const router = useRouter();
  const { session, isAdmin, role, loading } = useAuth();
  const { next } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"login" | "reset">("login");

  useEffect(() => {
    if (!loading && session) {
      if (next) {
        window.location.href = next;
        return;
      }
      void router.navigate({
        to: isAdmin ? "/admin" : role === "apprenant" ? "/apprenant" : "/espace",
      });
    }
  }, [loading, session, isAdmin, role, router, next]);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    });
    setBusy(false);
    if (error) toast.error("Identifiants incorrects.");
  }

  async function resetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(
      String(form.get("email") ?? "").trim(),
      { redirectTo: window.location.origin },
    );
    setBusy(false);
    if (error) {
      toast.error("Envoi impossible pour le moment.");
      return;
    }
    toast.success("Si un compte existe, un email de réinitialisation vient d'être envoyé.");
    setMode("login");
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: next ? `${window.location.origin}${next}` : window.location.origin,
    });
    if (result.error) toast.error("Connexion Google indisponible.");
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden lg:block">
        <img
          src={formatriceTablette}
          alt="Formatrice souriante préparant ses dossiers de formation sur le portail Skills4mation"
          width={1200}
          height={1600}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/55 to-foreground/20" />
        <div className="relative flex h-full flex-col justify-end gap-6 p-12 text-background">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-80">
            Portage Qualiopi as a Service
          </p>
          <h2 className="text-4xl leading-tight font-semibold">
            Votre espace formateur,
            <br /> tout votre administratif porté.
          </h2>
          <ul className="grid gap-3 text-sm">
            {ATOUTS.map((item) => (
              <li key={item.texte} className="flex items-center gap-3">
                <span className="inline-flex rounded-lg bg-background/15 p-2">
                  <item.icon className="size-4" />
                </span>
                {item.texte}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex items-center justify-center bg-gradient-hero px-4 py-14">
        <div className="w-full max-w-md">
          <div className="mx-auto w-fit rounded-xl bg-background px-4 py-3">
            <Logo />
          </div>
          <Card className="mt-6 rounded-3xl border-none shadow-elevated">
            <CardContent className="p-7">
              <h1 className="text-2xl font-semibold">Espace formateur</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "login"
                  ? "Connectez-vous pour accéder à votre portail de portage Qualiopi."
                  : "Indiquez votre email pour recevoir un lien de réinitialisation."}
              </p>

              {mode === "login" ? (
                <>
                  <form onSubmit={signIn} className="mt-6 grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="vous@exemple.fr"
                      />
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
                      {busy ? "Connexion…" : "Se connecter"}
                    </Button>
                  </form>
                  <button
                    type="button"
                    onClick={() => setMode("reset")}
                    className="mt-3 text-xs font-medium text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </>
              ) : (
                <>
                  <form onSubmit={resetPassword} className="mt-6 grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input id="reset-email" name="email" type="email" required autoComplete="email" />
                    </div>
                    <Button type="submit" variant="cta" size="lg" disabled={busy}>
                      {busy ? "Envoi…" : "Recevoir le lien"}
                    </Button>
                  </form>
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="mt-3 text-xs font-medium text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Retour à la connexion
                  </button>
                </>
              )}

              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> ou{" "}
                <span className="h-px flex-1 bg-border" />
              </div>
              <Button variant="outline" size="lg" className="w-full" onClick={google}>
                Continuer avec Google
              </Button>

              <div className="mt-7 rounded-2xl bg-muted/60 p-5">
                <p className="text-sm font-semibold">Pas encore de compte ?</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  L'accès à l'espace formateur est activé après validation de votre candidature au
                  réseau Skills4mation.
                </p>
                <Button asChild variant="cta" className="mt-4 w-full">
                  <Link to="/pole-formateur" hash="candidature">
                    Rejoindre Skills4mation <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/" className="underline-offset-4 hover:underline">
              Retour au site Skills4mation
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
