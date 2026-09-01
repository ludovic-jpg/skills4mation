import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import equipe from "@/assets/people-equipe.jpg";
import { AppShell } from "@/components/app/AppShell";
import { adminNav } from "@/components/app/nav";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CRM_STATUTS, type CrmStatut } from "@/lib/crm";

export const Route = createFileRoute("/_app/admin/pilotage")({
  component: Pilotage,
  head: () => ({
    meta: [
      { title: "Pilotage — Back-office Skills4mation" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const COMMISSION = 0.2;

function moisCle(iso: string) {
  return iso.slice(0, 7);
}

function moisLabel(cle: string) {
  const [a, m] = cle.split("-");
  return new Date(Number(a), Number(m) - 1, 1).toLocaleDateString("fr-FR", {
    month: "short",
    year: "2-digit",
  });
}

function douzeMois() {
  const now = new Date();
  const out: string[] = [];
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

function montantDossier(donnees: unknown) {
  const d = donnees as { tarifs?: { montantPrisEnCharge?: string } } | null;
  const brut = d?.tarifs?.montantPrisEnCharge ?? "";
  const n = Number(String(brut).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

const euros = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

function Pilotage() {
  const { isSuperAdmin, isConseillere } = useAuth();
  const dossiers = useQuery({
    queryKey: ["pilotage-dossiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossiers")
        .select("id, formateur_id, statut_crm, donnees, created_at, updated_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const candidatures = useQuery({
    queryKey: ["pilotage-candidatures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidatures")
        .select("id, profile_id, statut, created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const mois = douzeMois();
  const rows = dossiers.data ?? [];

  const payes = rows.filter((d) => d.statut_crm === "paiement_organisme");
  const caTotal = payes.reduce((s, d) => s + montantDossier(d.donnees), 0);

  const caParMois = mois.map((cle) => {
    const ca = payes
      .filter((d) => moisCle(d.updated_at ?? d.created_at) === cle)
      .reduce((s, d) => s + montantDossier(d.donnees), 0);
    return { mois: moisLabel(cle), ca: Math.round(ca), commission: Math.round(ca * COMMISSION) };
  });

  const parStatut = (Object.keys(CRM_STATUTS) as CrmStatut[])
    .filter((s) => s !== "paiement")
    .map((s) => ({
      statut: CRM_STATUTS[s].label,
      tone: CRM_STATUTS[s].tone,
      nb: rows.filter((d) => d.statut_crm === s).length,
    }))
    .filter((e) => e.nb > 0);

  const cands = candidatures.data ?? [];
  const conversion = mois.map((cle) => {
    const duMois = cands.filter((c) => moisCle(c.created_at) === cle);
    const convertis = duMois.filter(
      (c) => c.profile_id && rows.some((d) => d.formateur_id === c.profile_id),
    );
    return {
      mois: moisLabel(cle),
      candidatures: duMois.length,
      taux: duMois.length ? Math.round((convertis.length / duMois.length) * 100) : 0,
    };
  });

  const totalCands = cands.length;
  const totalConvertis = cands.filter(
    (c) => c.profile_id && rows.some((d) => d.formateur_id === c.profile_id),
  ).length;

  const toneColor: Record<string, string> = {
    neutral: "hsl(var(--muted-foreground))",
    info: "hsl(var(--primary))",
    teal: "hsl(var(--accent))",
    cta: "hsl(var(--secondary))",
    success: "hsl(var(--primary))",
    danger: "hsl(var(--destructive))",
  };

  return (
    <AppShell
      items={adminNav({ isSuperAdmin, isConseillere })}
      title="Pilotage"
      subtitle="Chiffre d'affaires porté, commission Skills4mation, avancement du pipeline et conversion des candidatures"
    >
      <div className="mb-6 overflow-hidden rounded-2xl border">
        <img
          src={equipe}
          alt="Équipe Skills4mation en réunion de pilotage"
          className="h-36 w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="CA porté (encaissé)" value={euros(caTotal)} hint="Dossiers au paiement organisme" />
        <Kpi
          label="Commission Skills4mation"
          value={euros(caTotal * COMMISSION)}
          hint="20 % du CA porté"
        />
        <Kpi label="Dossiers suivis" value={String(rows.length)} hint="Toutes étapes confondues" />
        <Kpi
          label="Conversion candidatures"
          value={totalCands ? `${Math.round((totalConvertis / totalCands) * 100)} %` : "—"}
          hint={`${totalConvertis} formateurs ont créé un dossier sur ${totalCands} candidatures`}
        />
      </div>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <h2 className="text-sm font-semibold">CA porté et commission par mois</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={caParMois}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mois" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(v: number) => euros(Number(v))} />
                <Legend />
                <Bar name="CA porté" dataKey="ca" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                <Bar
                  name="Commission 20 %"
                  dataKey="commission"
                  fill="hsl(var(--secondary))"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-sm font-semibold">Dossiers par étape du pipeline</h2>
            {parStatut.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">Aucun dossier pour le moment.</p>
            ) : (
              <div className="mt-4 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={parStatut} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} fontSize={12} />
                    <YAxis type="category" dataKey="statut" width={160} fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="nb" name="Dossiers" radius={[0, 6, 6, 0]}>
                      {parStatut.map((e) => (
                        <Cell key={e.statut} fill={toneColor[e.tone] ?? "hsl(var(--primary))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-sm font-semibold">
              Taux de conversion candidature → premier dossier
            </h2>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={conversion}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="mois" fontSize={12} />
                  <YAxis fontSize={12} unit="%" domain={[0, 100]} />
                  <Tooltip formatter={(v: number, n) => (n === "Taux" ? `${v} %` : v)} />
                  <Legend />
                  <Line
                    name="Taux"
                    type="monotone"
                    dataKey="taux"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                  <Line
                    name="Candidatures"
                    type="monotone"
                    dataKey="candidatures"
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="4 4"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
