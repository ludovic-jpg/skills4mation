import { createFileRoute } from "@tanstack/react-router";

/** Sert les visuels de formation (stockage privé) sur une adresse publique stable. */
export const Route = createFileRoute("/api/public/formation-image/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const raw = (params as { _splat?: string })._splat ?? "";
        const path = raw
          .split("/")
          .map((part) => decodeURIComponent(part))
          .filter((part) => part && part !== "." && part !== "..")
          .join("/");
        if (!path) return new Response("Not found", { status: 404 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("formations").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(await data.arrayBuffer(), {
          headers: {
            "Content-Type": data.type || "image/jpeg",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
