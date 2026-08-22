import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";

import { PageHero, PublicLayout } from "@/components/site/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Skills4mation" },
      {
        name: "description",
        content:
          "Contactez Skills4mation pour vos projets de formation : diagnostic, ingénierie pédagogique, portage Qualiopi et financements.",
      },
      { property: "og:title", content: "Contact — Skills4mation" },
      {
        property: "og:description",
        content: "Parlons de votre projet de montée en compétences.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Contact"
        title="Parlons de votre projet"
        description="Entreprise, OPCO ou formateur indépendant : notre équipe vous répond sous 48 heures ouvrées."
      />

      <section className="section-shell grid gap-5 py-14 sm:grid-cols-3">
        {[
          { icon: Mail, titre: "Email", valeur: "contact@skills4mation.fr" },
          { icon: Phone, titre: "Téléphone", valeur: "+33 (0)1 84 80 00 00" },
          { icon: MapPin, titre: "Adresse", valeur: "France — interventions sur tout le territoire" },
        ].map((item) => (
          <Card key={item.titre} className="rounded-2xl border-border/70 shadow-soft">
            <CardContent className="p-6">
              <span className="inline-flex rounded-xl bg-accent p-3 text-accent-foreground">
                <item.icon className="size-5" />
              </span>
              <h2 className="mt-4 text-base font-semibold">{item.titre}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.valeur}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </PublicLayout>
  );
}
