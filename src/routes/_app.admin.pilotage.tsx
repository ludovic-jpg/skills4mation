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
import { adminNav, ADMIN_NAV } from "@/components/app/nav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { calculerCommission, portageDepuisFinancement } from "@/lib/commission";
import { CRM_PIPELINE, CRM_STATUTS, type CrmStatut } from "@/lib/crm";

export const Route = createFileRoute("/_app/admin/pilotage")({
  component: Pilotage,
  head: () => ({
    meta: [
      { title: "Pilotage — Back-office Skills4mation" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

/** Le taux n'est plus fixe : il dépend du portage (CPF 30 %) et du CA porté annuel. */
function commissionDossier(
  d: { formateur_id?: string | null; donnees: unknown },
  caParFormateur: Map<string, number>,
) {
  const donnees = (d.donnees ?? {}) as { tarifs?: { modeFinancement?: string; coutCertification?: string } };
  const montant = montantDossier(d.donnees);
  return calculerCommission({
    montant,
    caAnnuel: caParFormateur.get(d.formateur_id ?? "") ?? montant,
    portage: portageDepuisFinancement(donnees.tarifs?.modeFinancement),
    coutCertification: Number(String(donnees.tarifs?.coutCertification ?? "0").replace(",", ".")) || 0,
  }).commission;
}

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

function IndicateurLigne({
  label,
  valeur,
  part,
}: {
  label: string;
  valeur: string;
  part: string;
}) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-b border-border/50 pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="whitespace-nowrap font-semibold">
        {valeur}
        {part !== "—" ? (
          <span className="ml-2 text-xs font-normal text-muted-foreground">{part}</span>
        ) : null}
      </span>
    </li>
  );
}

function Pilotage() {
  const { isConseiller, loading } = useAuth();
  const dossiers = useQuery({
    queryKey: ["pilotage-dossiers"],
    enabled: isConseiller,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossiers")
        .select(
          "id, formateur_id, statut_crm, donnees, created_at, updated_at, dossier_nom, entreprise_nom, titre_formation, signature_organisme_date, signature_organisme_certificat_url, drive_folder_id",
        );
      if (error) throw error;
      return data ?? [];
    },
  });

  const candidatures = useQuery({
    queryKey: ["candidatures"],
    enabled: isConseiller,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidatures")
        .select("id, profile_id, statut, created_at, archived_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  /** Indicateurs Qualiopi : traçabilité des pièces et signatures, sous-traitance formateurs. */
  const qualiopi = useQuery({
    queryKey: ["pilotage-qualiopi"],
    enabled: isConseiller,
    queryFn: async () => {
      const [pieces, envois, profils] = await Promise.all([
        supabase.from("dossier_pieces").select("dossier_id, statut"),
        supabase.from("document_envois").select("dossier_id, statut, signature_date, drive_url"),
        supabase.from("profiles").select("id, prenom, nom, numero_nda, siret"),
      ]);
      if (pieces.error) throw pieces.error;
      if (envois.error) throw envois.error;
      if (profils.error) throw profils.error;
      return {
        pieces: pieces.data ?? [],
        envois: envois.data ?? [],
        profils: profils.data ?? [],
      };
    },
  });

  const mois = douzeMois();
  const rows = dossiers.data ?? [];

  // CA porté annuel par formateur : base du barème dégressif Qualiopi.
  const caParFormateur = new Map<string, number>();
  for (const d of rows) {
    const cle = d.formateur_id ?? "";
    caParFormateur.set(cle, (caParFormateur.get(cle) ?? 0) + montantDossier(d.donnees));
  }

  const payes = rows.filter((d) => d.statut_crm === "paiement_organisme");
  const caTotal = payes.reduce((s, d) => s + montantDossier(d.donnees), 0);

  const caParMois = mois.map((cle) => {
    const ca = payes
      .filter((d) => moisCle(d.updated_at ?? d.created_at) === cle)
      .reduce((s, d) => s + montantDossier(d.donnees), 0);
    const commission = payes
      .filter((d) => moisCle(d.updated_at ?? d.created_at) === cle)
      .reduce((s, d) => s + commissionDossier(d, caParFormateur), 0);
    return { mois: moisLabel(cle), ca: Math.round(ca), commission: Math.round(commission) };
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

  /* ---------- Dossiers validés : répartition par statut et montants ---------- */

  // Un dossier est « validé » dès qu'il a dépassé la demande de validation.
  const ETAPES_VALIDEES = CRM_PIPELINE.filter(
    (s) => (CRM_STATUTS[s].etape ?? 0) >= 2,
  ) as CrmStatut[];
  const valides = rows.filter((d) => ETAPES_VALIDEES.includes(d.statut_crm as CrmStatut));

  const tableauValides = ETAPES_VALIDEES.map((statut) => {
    const lot = valides.filter((d) => d.statut_crm === statut);
    const montant = lot.reduce((s, d) => s + montantDossier(d.donnees), 0);
    return {
      statut,
      label: CRM_STATUTS[statut].label,
      tone: CRM_STATUTS[statut].tone,
      nb: lot.length,
      montant,
      commission: lot.reduce((s, d) => s + commissionDossier(d, caParFormateur), 0),
    };
  });
  const montantValides = valides.reduce((s, d) => s + montantDossier(d.donnees), 0);
  const commissionValides = valides.reduce((s, d) => s + commissionDossier(d, caParFormateur), 0);
  const commissionTotale = payes.reduce((s, d) => s + commissionDossier(d, caParFormateur), 0);

  /* ---------------------- Indicateurs Qualiopi ---------------------- */

  const q = qualiopi.data;
  const piecesCompletes = (q?.pieces ?? []).filter((p) => p.statut === "complete").length;
  const piecesTotal = (q?.pieces ?? []).length;
  const envoisSignes = (q?.envois ?? []).filter((e) => e.signature_date).length;
  const envoisTotal = (q?.envois ?? []).length;
  const envoisArchives = (q?.envois ?? []).filter((e) => e.drive_url).length;
  const validesSignes = valides.filter((d) => d.signature_organisme_date).length;
  const validesCertificat = valides.filter((d) => d.signature_organisme_certificat_url).length;
  const validesDrive = valides.filter((d) => d.drive_folder_id).length;

  const formateursPortes = Array.from(new Set(valides.map((d) => d.formateur_id)));
  const profilParId = new Map((q?.profils ?? []).map((p) => [p.id, p]));
  const sousTraitantsConformes = formateursPortes.filter((id) => {
    const p = profilParId.get(id);
    return Boolean(p?.siret);
  }).length;
  const sousTraitantsNda = formateursPortes.filter((id) =>
    Boolean(profilParId.get(id)?.numero_nda),
  ).length;

  const pct = (n: number, total: number) => (total ? `${Math.round((n / total) * 100)} %` : "—");

  if (!loading && !isConseiller) {
    return (
      <AppShell items={adminNav()} title="Pilotage">
        <Card className="rounded-2xl border-destructive/30">
          <CardContent className="p-8 text-sm text-muted-foreground">
            Le pilotage financier et les indicateurs Qualiopi sont réservés aux conseillers
            formation Skills4mation.
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      items={ADMIN_NAV}
      title="Pilotage"
      subtitle="Chiffre d'affaires porté, commission Skills4mation, dossiers validés, traçabilité Qualiopi et sous-traitance"
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
          value={euros(commissionTotale)}
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

      <Card className="mt-6">
        <CardContent className="pt-6">
          <h2 className="text-sm font-semibold">Dossiers validés par statut et montants</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Dossiers ayant passé la validation Skills4mation ({valides.length} dossiers,{" "}
            {euros(montantValides)} portés).
          </p>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Dossiers</TableHead>
                  <TableHead className="text-right">Montant porté</TableHead>
                  <TableHead className="text-right">Commission 20 %</TableHead>
                  <TableHead className="text-right">Part du portefeuille</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableauValides.map((r) => (
                  <TableRow key={r.statut}>
                    <TableCell className="font-medium">{r.label}</TableCell>
                    <TableCell className="text-right">{r.nb}</TableCell>
                    <TableCell className="text-right">{euros(r.montant)}</TableCell>
                    <TableCell className="text-right">{euros(r.commission)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {pct(r.montant, montantValides)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-semibold">Total validé</TableCell>
                  <TableCell className="text-right font-semibold">{valides.length}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {euros(montantValides)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {euros(commissionValides)}
                  </TableCell>
                  <TableCell className="text-right">—</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-sm font-semibold">Qualiopi — traçabilité</h2>
            <ul className="mt-4 grid gap-3 text-sm">
              <IndicateurLigne
                label="Pièces du dossier complètes"
                valeur={`${piecesCompletes}/${piecesTotal}`}
                part={pct(piecesCompletes, piecesTotal)}
              />
              <IndicateurLigne
                label="Documents signés par les apprenants"
                valeur={`${envoisSignes}/${envoisTotal}`}
                part={pct(envoisSignes, envoisTotal)}
              />
              <IndicateurLigne
                label="Documents archivés sur Drive"
                valeur={`${envoisArchives}/${envoisTotal}`}
                part={pct(envoisArchives, envoisTotal)}
              />
              <IndicateurLigne
                label="Signature Skills4mation apposée"
                valeur={`${validesSignes}/${valides.length}`}
                part={pct(validesSignes, valides.length)}
              />
              <IndicateurLigne
                label="Certificat de signature archivé"
                valeur={`${validesCertificat}/${valides.length}`}
                part={pct(validesCertificat, valides.length)}
              />
              <IndicateurLigne
                label="Dossiers rattachés à un espace Drive"
                valeur={`${validesDrive}/${valides.length}`}
                part={pct(validesDrive, valides.length)}
              />
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-sm font-semibold">Qualiopi — sous-traitance formateurs</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Formateurs portés sur les dossiers validés : conformité des pièces exigées par le
              critère 5 (sous-traitance et prestataires).
            </p>
            <ul className="mt-4 grid gap-3 text-sm">
              <IndicateurLigne
                label="Formateurs sous-traitants actifs"
                valeur={String(formateursPortes.length)}
                part="—"
              />
              <IndicateurLigne
                label="SIRET renseigné au profil"
                valeur={`${sousTraitantsConformes}/${formateursPortes.length}`}
                part={pct(sousTraitantsConformes, formateursPortes.length)}
              />
              <IndicateurLigne
                label="Numéro de déclaration d'activité (NDA)"
                valeur={`${sousTraitantsNda}/${formateursPortes.length}`}
                part={pct(sousTraitantsNda, formateursPortes.length)}
              />
              <IndicateurLigne
                label="Dossiers portés par formateur (moyenne)"
                valeur={
                  formateursPortes.length
                    ? (valides.length / formateursPortes.length).toFixed(1)
                    : "—"
                }
                part="—"
              />
            </ul>
            {formateursPortes.length && sousTraitantsConformes < formateursPortes.length ? (
              <Badge variant="outline" className="mt-4 border-destructive/40 text-destructive">
                {formateursPortes.length - sousTraitantsConformes} formateur(s) sans SIRET au profil
              </Badge>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
