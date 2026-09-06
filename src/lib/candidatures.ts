import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type { CandidatureStatut } from "@/lib/statuts";

/** Clé de cache unique partagée par tous les écrans qui lisent les candidatures. */
export const CANDIDATURES_KEY = ["candidatures"] as const;

/** Clés React Query à rafraîchir dès qu'une demande change (candidature ou autre). */
export const DEMANDES_KEYS: readonly (readonly unknown[])[] = [
  CANDIDATURES_KEY,
  ["admin-demandes"],
  ["pilotage-candidatures"],
  ["pilotage-dossiers"],
];

export type Candidature = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  expertise: string | null;
  message: string | null;
  statut: CandidatureStatut;
  created_at: string;
  archived_at: string | null;
  assigne_nom: string | null;
  commentaire_admin: string | null;
  cv_url: string | null;
  parcours_formation_url: string | null;
  deroule_pedagogique_url: string | null;
};

/** Source de vérité unique : une seule requête / une seule clé de cache. */
export function useCandidatures(enabled = true) {
  return useQuery({
    queryKey: CANDIDATURES_KEY,
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidatures")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Candidature[];
    },
  });
}

/** Mutations candidatures : statut, affectation à un collaborateur, archivage. */
export function useCandidatureMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await supabase
        .from("candidatures")
        .update(patch as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      for (const key of DEMANDES_KEYS) void queryClient.invalidateQueries({ queryKey: key });
    },
    onError: () => toast.error("Mise à jour impossible."),
  });
}

const TABLES = [
  "candidatures",
  "demandes_budget",
  "demandes_contact",
  "demandes_droits_formation",
] as const;

/**
 * Écoute en direct des tables du module « Demandes » et invalidation de toutes les
 * clés concernées. À appeler une seule fois, au niveau du layout admin.
 */
export function useCandidaturesRealtime(actif: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!actif) return;

    const invalider = () => {
      for (const key of DEMANDES_KEYS) void queryClient.invalidateQueries({ queryKey: key });
    };

    const channel = supabase.channel("demandes-admin-realtime");
    for (const table of TABLES) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload: { eventType?: string; new?: Record<string, unknown> }) => {
          invalider();
          const evenement = (payload as unknown as { eventType: string }).eventType;
          if (table === "candidatures" && evenement === "INSERT") {
            const row = (payload.new ?? {}) as Record<string, unknown>;
            toast.success(
              `Nouvelle candidature reçue : ${String(row["prenom"] ?? "")} ${String(row["nom"] ?? "")}`.trim(),
            );
          }
        },
      );
    }
    void channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [actif, queryClient]);
}
