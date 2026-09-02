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
  adresse: string | null;
  numero_nda: string | null;
  nda_region: string | null;
  nda_document_url: string | null;
  entreprise: string | null;
  entreprise_adresse: string | null;
  cv_url: string | null;
  deroule_pedagogique_url: string | null;
  parcours_formation: string | null;
  parcours_formation_url: string | null;
  secteur_activite: string | null;
  expertise: string | null;
  linkedin_url: string | null;
  linkedin_connected_at: string | null;
  /** Questions additionnelles de recueil des besoins propres au formateur (tableau de chaînes). */
  recueil_besoins_questions_perso: string[] | null;
  /** Lien Tally personnalisé pour la satisfaction à chaud (alternative au formulaire interne). */
  lien_tally_f5: string | null;
  statut_candidature: CandidatureStatut;

};

export type AppRole = "super_admin" | "conseillere" | "admin" | "formateur" | "apprenant";

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  roles: AppRole[];
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isConseillere: boolean;
  isValidatedFormateur: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(userId: string | undefined) {
    if (!userId) {
      setProfile(null);
      setRole(null);
      setRoles([]);
      return;
    }
    const [{ data: prof }, { data: roleRows }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    setProfile((prof as Profile) ?? null);
    const list = ((roleRows ?? []).map((r) => r.role) as AppRole[]) ?? [];
    setRoles(list);
    const priorite: AppRole[] = ["super_admin", "admin", "conseillere", "formateur", "apprenant"];
    setRole(priorite.find((r) => list.includes(r)) ?? null);
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
        setRoles([]);
        return;
      }
      void load(next?.user?.id);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(() => {
    const isSuperAdmin = roles.includes("super_admin") || roles.includes("admin");
    const isConseillere = roles.includes("conseillere");
    return {
      session,
      user: session?.user ?? null,
      profile,
      role,
      roles,
      loading,
      isAdmin: isSuperAdmin || isConseillere,
      isSuperAdmin,
      isConseillere,
      isValidatedFormateur: role === "formateur" && profile?.statut_candidature === "valide",
      refresh: async () => {
        await load(session?.user?.id);
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    };
  }, [session, profile, role, roles, loading]);


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
