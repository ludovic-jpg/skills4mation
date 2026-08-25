import { Link } from "@tanstack/react-router";

import charteLogo from "@/assets/charte-deontologie.png.asset.json";
import logoWordmark from "@/assets/logo-skills4mation.png.asset.json";
import qualiopiLogo from "@/assets/qualiopi.png.asset.json";
import { cn } from "@/lib/utils";

export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  return (
    <Link to="/" className="flex items-center" aria-label="Skills4mation — accueil">
      <img
        src={logoWordmark.url}
        alt="Logo Skills4mation"
        width={469}
        height={61}
        className={cn(
          "h-7 w-auto object-contain sm:h-8",
          variant === "light" && "rounded-lg bg-primary-foreground/95 px-2 py-1",
        )}
      />
      <span className="sr-only">Skills4mation — Ingénierie des compétences</span>
    </Link>

  );
}


export const CERT_LOGOS = { qualiopi: qualiopiLogo.url, charte: charteLogo.url };

/** Logo officiel Qualiopi — processus certifié (République française). */
export function QualiopiBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-soft",
        className,
      )}
    >
      <img
        src={qualiopiLogo.url}
        alt="Qualiopi — processus certifié, République française"
        width={640}
        height={360}
        loading="lazy"
        className="h-12 w-auto object-contain"
      />
      <span className="sr-only">
        Certification Qualiopi délivrée au titre des actions de formation
      </span>
    </div>
  );
}

/** Logo « Entreprise de formation respectant la charte de déontologie ». */
export function CharteDeontologieBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-soft",
        className,
      )}
    >
      <img
        src={charteLogo.url}
        alt="Entreprise de formation respectant la charte de déontologie"
        width={660}
        height={360}
        loading="lazy"
        className="h-12 w-auto object-contain"
      />
    </div>
  );
}
