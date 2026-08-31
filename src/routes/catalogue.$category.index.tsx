import { createFileRoute, redirect } from "@tanstack/react-router";

/** Ancienne page catégorie : redirection permanente vers le catalogue filtré. */
export const Route = createFileRoute("/catalogue/$category/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/formations",
      search: { categorie: params.category },
      statusCode: 301,
    });
  },
});
