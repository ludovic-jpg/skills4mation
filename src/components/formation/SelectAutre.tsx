import { useState } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const AUTRE = "__autre__";

/**
 * Menu déroulant de valeurs proposées, avec une option « Autre »
 * qui ouvre une zone de saisie libre.
 */
export function SelectAutre({
  label,
  value,
  onChange,
  options,
  placeholder = "Choisir…",
  rows = 3,
  hint,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  rows?: number;
  hint?: string;
  className?: string;
}) {
  const dansListe = options.includes(value);
  const [libre, setLibre] = useState(Boolean(value) && !dansListe);
  const autre = libre || (Boolean(value) && !dansListe);

  return (
    <div className={`grid gap-2 ${className ?? ""}`}>
      <Label>{label}</Label>
      <Select
        value={autre ? AUTRE : value}
        onValueChange={(v) => {
          if (v === AUTRE) {
            setLibre(true);
            return;
          }
          setLibre(false);
          onChange(v);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
          <SelectItem value={AUTRE}>Autre (saisie libre)</SelectItem>
        </SelectContent>
      </Select>
      {autre ? (
        <Textarea
          rows={rows}
          value={value}
          placeholder="Précisez…"
          onChange={(e) => onChange(e.target.value)}
        />
      ) : null}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
