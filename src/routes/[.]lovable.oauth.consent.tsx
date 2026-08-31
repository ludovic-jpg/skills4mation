import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import { Logo } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type OAuthApi = {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};

type AuthorizationDetails = {
  client?: { name?: string } | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
};

function oauthApi(): OAuthApi {
  return (supabase.auth as unknown as { oauth: OAuthApi }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Autoriser une application — Skills4mation" },
      {
        name: "description",
        content: "Autorisez une application externe à accéder à votre espace formateur Skills4mation.",
      },
      { property: "og:title", content: "Autoriser une application — Skills4mation" },
      { property: "og:description", content: "Connexion sécurisée à votre espace Skills4mation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s['authorization_id'] === "string" ? s['authorization_id'] : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Paramètre authorization_id manquant.");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="section-shell py-20">
      <h1 className="text-2xl font-semibold">Demande d'autorisation invalide</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {String((error as Error)?.message ?? error)}
      </p>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientName = details?.client?.name ?? "cette application";

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauthApi();
    const { data, error: apiError } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (apiError) {
      setBusy(false);
      setError(apiError.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("Aucune redirection renvoyée par le serveur d'autorisation.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-hero px-4 py-14">
      <div className="w-full max-w-md">
        <div className="mx-auto w-fit rounded-xl bg-background px-4 py-3">
          <Logo />
        </div>
        <Card className="mt-6 rounded-3xl border-none shadow-elevated">
          <CardContent className="p-7">
            <h1 className="text-2xl font-semibold">Connecter {clientName}</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {clientName} pourra consulter et gérer vos dossiers de formation et vos formations
              Skills4mation en votre nom, avec vos propres droits d'accès.
            </p>
            {error && (
              <p role="alert" className="mt-4 text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="mt-7 grid gap-3">
              <Button variant="cta" size="lg" disabled={busy} onClick={() => decide(true)}>
                {busy ? "Traitement…" : "Autoriser"}
              </Button>
              <Button variant="outline" size="lg" disabled={busy} onClick={() => decide(false)}>
                Refuser
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
