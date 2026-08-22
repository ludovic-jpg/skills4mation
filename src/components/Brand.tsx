import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import logoMark from "@/assets/logo-mark.png";
import { cn } from "@/lib/utils";

export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="Skills4mation — accueil">
      {/* Zone logo : remplacer src/assets/logo-mark.png par le logo officiel Skills4mation */}
      <img
        src={logoMark}
        alt="Logo Skills4mation"
        width={40}
        height={40}
        className="h-10 w-10 rounded-xl bg-background object-contain p-1"
      />
      <span className="leading-tight">
        <span
          className={cn(
            "block font-display text-lg font-semibold tracking-tight",
            variant === "light" ? "text-primary-foreground" : "text-primary",
          )}
        >
          Skills4mation
        </span>
        <span
          className={cn(
            "block text-[11px] font-medium",
            variant === "light" ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          Ingénierie des compétences
        </span>
      </span>
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
          Actions de formation · Éligible CPF
        </p>
      </div>
    </div>
  );
}
