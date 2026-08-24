import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import logoWordmark from "@/assets/logo-skills4mation.png.asset.json";
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


/** Badge de certification. Remplacer par le fichier officiel Qualiopi fourni par le client. */
export function QualiopiBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-xl border border-secondary/30 bg-card px-4 py-3 shadow-soft",
        className,
      )}
    >
      <ShieldCheck className="size-6 text-secondary" aria-hidden />
      <div className="text-left leading-tight">
        <p className="text-sm font-semibold text-primary">Certifié Qualiopi</p>
        <p className="text-[11px] text-muted-foreground">
          Actions de formation · Portage de formation
        </p>
      </div>
    </div>
  );
}
