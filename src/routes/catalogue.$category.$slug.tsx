import { createFileRoute, redirect } from "@tanstack/react-router";

/** Ancienne fiche formation : redirection permanente vers /formations/<slug>. */
export const Route = createFileRoute("/catalogue/$category/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/formations/$slug",
      params: { slug: params.slug },
      statusCode: 301,
    });
  },
});
