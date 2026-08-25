import { Award, ShieldCheck, Users } from "lucide-react";

const CERTIFICATIONS = [
  {
    icon: ShieldCheck,
    titre: "Qualiopi — processus certifié",
    texte:
      "Skills4mation est certifié Qualiopi pour les actions de formation et le portage de formation.",
  },
  {
    icon: Award,
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
              <span className="flex size-14 items-center justify-center rounded-full bg-gradient-teal text-primary-foreground">
                <c.icon className="size-7" aria-hidden />
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
