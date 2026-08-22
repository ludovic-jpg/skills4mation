import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";

import { PageHero, PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/catalogue")({
  head: () => ({
    meta: [
      { title: "Catalogue de formation — Skills4mation" },
      {
        name: "description",
        content:
          "Découvrez les parcours de formation proposés par les formateurs experts du réseau Skills4mation, organisme certifié Qualiopi.",
      },
      { property: "og:title", content: "Catalogue de formation — Skills4mation" },
      {
        property: "og:description",
        content: "Parcours de formation sur mesure animés par les formateurs du réseau.",
      },
    ],
  }),
  component: Catalogue,
});

type Parcours = {
  id: string;
  titre: string;
  description: string | null;
  prenom: string | null;
  nom: string | null;
  photo_url: string | null;
};

function Catalogue() {
  const [q, setQ] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["catalogue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalogue_public")
        .select("id, titre, description, prenom, nom, photo_url")
        .order("ordre", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Parcours[];
    },
  });

  const parcours = (data ?? []).filter((p) =>
    `${p.titre} ${p.description ?? ""}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Catalogue"
        title="Les parcours de notre réseau"
        description="Des formations conçues par des experts métier, portées par un organisme certifié Qualiopi et mobilisables via vos dispositifs de financement."
      />

      <section className="section-shell py-14">
        <div className="relative max-w-md">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un parcours…"
            className="rounded-full pl-9"
          />
        </div>

        {isLoading ? (
          <p className="mt-10 text-sm text-muted-foreground">Chargement du catalogue…</p>
        ) : error ? (
          <p className="mt-10 text-sm text-destructive">
            Le catalogue est momentanément indisponible.
          </p>
        ) : parcours.length === 0 ? (
          <Card className="mt-10 rounded-2xl border-dashed">
            <CardContent className="p-10 text-center">
              <h2 className="text-lg font-semibold">Catalogue en construction</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Les parcours des formateurs validés apparaîtront ici dès leur publication.
              </p>
              <Button asChild variant="cta" className="mt-6">
                <Link to="/pole-formateur">Proposer mes formations</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {parcours.map((p) => (
              <Card key={p.id} className="rounded-2xl border-border/70 shadow-soft">
                <CardContent className="flex h-full flex-col p-6">
                  <h2 className="text-lg font-semibold">{p.titre}</h2>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {p.description || "Programme détaillé sur demande."}
                  </p>
                  <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                    {p.photo_url ? (
                      <img
                        src={p.photo_url}
                        alt=""
                        loading="lazy"
                        width={36}
                        height={36}
                        className="size-9 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex size-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                        {(p.prenom?.[0] ?? "S") + (p.nom?.[0] ?? "")}
                      </span>
                    )}
                    <div className="text-xs">
                      <p className="font-semibold">
                        {`${p.prenom ?? ""} ${p.nom ?? ""}`.trim() || "Formateur du réseau"}
                      </p>
                      <p className="text-muted-foreground">Formateur partenaire</p>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="mt-4 w-full">
                    <Link to="/contact">Demander ce parcours</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
