import { createFileRoute, redirect } from "@tanstack/react-router";

/** Ancien catalogue statique : redirection permanente vers le catalogue unifié. */
export const Route = createFileRoute("/catalogue/")({
  beforeLoad: () => {
    throw redirect({ to: "/formations", statusCode: 301 });
  },
});
