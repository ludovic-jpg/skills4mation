import { useQuery } from "@tanstack/react-query";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export type Certification = {
  id: string;
  marque: string;
  thematique: string;
  code_rs: string | null;
  prix_formateur_ttc: number;
  eligible_cpf: boolean;
  actif: boolean;
};

export function certificationLabel(c: Certification) {
  return `${c.thematique}${c.code_rs ? ` — ${c.code_rs}` : ""}`;
}

/** Certifications actives du catalogue Skills4mation (ICDL / Lilliate). */
export function useCertifications(cpfUniquement = false) {
  return useQuery({
    queryKey: ["certifications", cpfUniquement],
    queryFn: async () => {
      let q = supabase
        .from("certifications")
        .select("id, marque, thematique, code_rs, prix_formateur_ttc, eligible_cpf, actif")
        .eq("actif", true)
        .order("marque")
        .order("thematique");
      if (cpfUniquement) q = q.eq("eligible_cpf", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Certification[];
    },
  });
}

/**
 * Sélecteur partagé de certification : regroupé par marque, réutilisable
 * partout où une certification doit être choisie (wizard dossier, formations…).
 */
export function CertificationSelect({
  value,
  onChange,
  cpfUniquement = false,
  label = "Certification visée",
  disabled,
  className,
}: {
  value: string | null;
  onChange: (certification: Certification | null) => void;
  cpfUniquement?: boolean;
  label?: string;
  disabled?: boolean;
  className?: string;
}) {
  const { data: certifications = [], isLoading } = useCertifications(cpfUniquement);
  const marques = Array.from(new Set(certifications.map((c) => c.marque)));

  return (
    <div className={`grid gap-2 ${className ?? ""}`}>
      <Label>{label}</Label>
      <Select
        value={value ?? "aucune"}
        disabled={disabled}
        onValueChange={(v) =>
          onChange(v === "aucune" ? null : (certifications.find((c) => c.id === v) ?? null))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? "Chargement…" : "Aucune certification"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="aucune">Aucune certification</SelectItem>
          {marques.map((marque) => (
            <SelectGroup key={marque}>
              <SelectLabel>{marque}</SelectLabel>
              {certifications
                .filter((c) => c.marque === marque)
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {certificationLabel(c)}
                  </SelectItem>
                ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
      {cpfUniquement ? (
        <p className="text-xs text-muted-foreground">
          Seules les certifications disposant d&apos;un code RS sont éligibles au CPF.
        </p>
      ) : null}
    </div>
  );
}
