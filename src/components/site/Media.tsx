import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

type Ratio = "square" | "4/3" | "3/2" | "16/9" | "4/5" | "5/6";

const RATIO: Record<Ratio, string> = {
  square: "1 / 1",
  "4/3": "4 / 3",
  "3/2": "3 / 2",
  "16/9": "16 / 9",
  "4/5": "4 / 5",
  "5/6": "5 / 6",
};

const POSITION = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
} as const;

type MediaProps = {
  src: string;
  alt: string;
  ratio?: Ratio;
  mdRatio?: Ratio;
  position?: keyof typeof POSITION;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
};

/** Cadre unique pour tous les visuels de formation : le ratio est stable, l'image couvre. */
export function Media({
  src,
  alt,
  ratio = "4/3",
  mdRatio,
  position = "center",
  className,
  imgClassName,
  priority = false,
}: MediaProps) {
  const style = {
    "--media-ar": RATIO[ratio],
    "--media-ar-md": RATIO[mdRatio ?? ratio],
  } as CSSProperties;

  return (
    <div
      style={style}
      className={cn(
        "relative w-full overflow-hidden bg-muted aspect-[var(--media-ar)] md:aspect-[var(--media-ar-md)]",
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        className={cn(
          "absolute inset-0 size-full object-cover",
          POSITION[position],
          imgClassName,
        )}
      />
    </div>
  );
}
