import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type { CandidatureStatut } from "@/lib/statuts";

export type Profile = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  photo_url: string | null;
  date_naissance: string | null;
  siret: string | null;
  telephone: string | null;
  statut_candidature: CandidatureStatut;
};

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: "admin" | "formateur" | null;
  loading: boolean;
  isAdmin: boolean;
  isValidatedFormateur: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<"admin" | "formateur" | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(userId: string | undefined) {
    if (!userId) {
      setProfile(null);
      setRole(null);
      return;
    }
    const [{ data: prof }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    setProfile((prof as Profile) ?? null);
    const list = (roles ?? []).map((r) => r.role);
    setRole(list.includes("admin") ? "admin" : list.includes("formateur") ? "formateur" : null);
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      await load(data.session?.user?.id);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (!mounted) return;
      if (
        event !== "SIGNED_IN" &&
        event !== "SIGNED_OUT" &&
        event !== "USER_UPDATED" &&
        event !== "TOKEN_REFRESHED"
      )
        return;
      setSession(next ?? null);
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setRole(null);
        return;
      }
      void load(next?.user?.id);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role,
      loading,
      isAdmin: role === "admin",
      isValidatedFormateur: role === "formateur" && profile?.statut_candidature === "valide",
      refresh: async () => {
        await load(session?.user?.id);
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, profile, role, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
