import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

/** Affichage simple d'une note sur 5 en étoiles (aucune librairie supplémentaire). */
export function Etoiles({
  note,
  taille = "size-4",
  onSelect,
}: {
  note: number;
  taille?: string;
  onSelect?: (note: number) => void;
}) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) =>
        onSelect ? (
          <button
            key={n}
            type="button"
            aria-label={`Attribuer ${n} étoile${n > 1 ? "s" : ""}`}
            onClick={() => onSelect(n)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={cn(taille, n <= note ? "fill-cta text-cta" : "text-muted-foreground")}
            />
          </button>
        ) : (
          <Star
            key={n}
            aria-hidden
            className={cn(taille, n <= Math.round(note) ? "fill-cta text-cta" : "text-muted-foreground")}
          />
        ),
      )}
    </span>
  );
}
