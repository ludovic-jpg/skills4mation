import { createFileRoute } from "@tanstack/react-router";

import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

/**
 * Tâche planifiée quotidienne (appelée par pg_cron via pg_net) :
 * - satisfaction à froid F7 pour les formations terminées il y a ~3 mois ;
 * - rattrapage des automatisations documentaires (3A, F0C, 1B).
 * Protégée par un jeton Bearer (`LOVABLE_CRON_SECRET`).
 */
export const Route = createFileRoute("/api/public/cron/taches-quotidiennes")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const refus = await authenticateCronRequest(request);
        if (refus) return refus;
        try {
          const { tacheQuotidienne } = await import("@/lib/automatisations.server");
          const resultat = await tacheQuotidienne();
          return new Response(JSON.stringify(resultat), {
            headers: { "content-type": "application/json" },
          });
        } catch (error) {
          console.error("[cron] tâche quotidienne en échec", error);
          return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Erreur" }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }
      },
    },
  },
});
