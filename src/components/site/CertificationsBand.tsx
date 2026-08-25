import { Users, type LucideIcon } from "lucide-react";

import { CERT_LOGOS } from "@/components/Brand";

type Certification = {
  logo?: string;
  alt?: string;
  icon?: LucideIcon;
  titre: string;
  texte: string;
};

const CERTIFICATIONS: Certification[] = [
  {
    logo: CERT_LOGOS.qualiopi,
    alt: "Qualiopi — processus certifié, République française",
    titre: "Qualiopi — processus certifié",
    texte:
      "Skills4mation est certifié Qualiopi pour les actions de formation et le portage de formation.",
  },
  {
    logo: CERT_LOGOS.charte,
    alt: "Entreprise de formation respectant la charte de déontologie",
    titre: "Charte de déontologie",
    texte:
      "Nous respectons les 10 engagements déontologiques des organismes de formation professionnelle.",
  },
  {
    icon: Users,
    titre: "Réseau de formateurs portés",
    texte:
      "Des formateurs indépendants sélectionnés, référencés et suivis sur des critères de qualité.",
  },
];

export function CertificationsBand() {
  return (
    <section className="border-t border-border/70 bg-muted/40 py-14">
      <div className="section-shell">
        <h2 className="text-center text-2xl font-semibold sm:text-3xl">
          Skills4mation, un organisme de formation reconnu pour sa qualité
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {CERTIFICATIONS.map((c) => (
            <div
              key={c.titre}
              className="flex flex-col items-center rounded-2xl border border-border/70 bg-card px-6 py-7 text-center shadow-soft"
            >
              <span className="flex h-20 items-center justify-center">
                {c.logo ? (
                  <img
                    src={c.logo}
                    alt={c.alt ?? c.titre}
                    loading="lazy"
                    className="h-16 w-auto object-contain"
                  />
                ) : c.icon ? (
                  <span className="flex size-14 items-center justify-center rounded-full bg-gradient-teal text-primary-foreground">
                    <c.icon className="size-7" aria-hidden />
                  </span>
                ) : null}
              </span>
              <p className="mt-4 font-display text-base font-semibold text-primary">{c.titre}</p>
              <p className="mt-2 text-sm text-muted-foreground">{c.texte}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
