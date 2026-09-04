import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  FilePlus2,
  FolderPlus,
  Folders,
  Lock,
  Sparkles,
  TrendingUp,
  Trophy,
} from "lucide-react";

import { AppShell, usePhotoProfil } from "@/components/app/AppShell";
import { FORMATEUR_NAV } from "@/components/app/nav";
import { CrmBadge } from "@/components/app/CrmBadge";
import { StatutBadge } from "@/components/StatutBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { CATEGORIES } from "@/lib/catalogue-historique";
import { CRM_STATUTS, dossierNom, type CrmStatut } from "@/lib/crm";
import { visuelUrl } from "@/lib/formations";
import { formatDate } from "@/lib/statuts";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/espace/")({
  component: EspaceAccueil,
  head: () => ({
    meta: [
      { title: "Tableau de bord formateur | Skills4mation" },
      {
        name: "description",
        content:
          "Vos dossiers de formation, vos formations publiées, votre planning d'interventions et votre progression dans le portage Qualiopi Skills4mation.",
      },
      { property: "og:title", content: "Tableau de bord formateur Skills4mation" },
      {
        property: "og:description",
        content: "Suivi des dossiers, planning des interventions et progression du portage.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type Dossier = {
  id: string;
  dossier_nom: string | null;
  entreprise_nom: string | null;
  titre_formation: string | null;
  statut_crm: CrmStatut;
  date_debut: string | null;
  date_fin: string | null;
  created_at: string;
};

const EN_COURS: CrmStatut[] = [
  "demande_validation",
  "dossier_valide",
  "demande_financement",
  "accord_financement",
  "finalisation_administrative",
  "formation_en_cours",
];

function EspaceAccueil() {
  const { profile, user, isValidatedFormateur } = useAuth();
  const photo = usePhotoProfil(profile?.photo_url);
  const initiales =
    `${profile?.prenom?.[0] ?? ""}${profile?.nom?.[0] ?? ""}`.toUpperCase() || "S4";
  const secteurLabel = profile?.secteur_activite
    ? (CATEGORIES.find((c) => c.slug === profile.secteur_activite)?.label ??
      profile.secteur_activite)
    : null;

  const { data, isLoading } = useQuery({
    queryKey: ["tableau-de-bord-dossiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossiers")
        .select(
          "id, dossier_nom, entreprise_nom, titre_formation, statut_crm, date_debut, date_fin, created_at",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Dossier[];
    },
  });

  const { data: formations } = useQuery({
    queryKey: ["tableau-de-bord-formations", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formations_catalogue")
        .select("id, slug, titre, publiee, visuel_url")
        .eq("formateur_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const dossiers = data ?? [];
  const brouillons = dossiers.filter((d) => d.statut_crm === "brouillon");
  const enCours = dossiers.filter((d) => EN_COURS.includes(d.statut_crm));
  const realises = dossiers.filter((d) =>
    ["formation_realisee", "demande_paiement", "paiement_organisme", "paiement_formateur"].includes(
      d.statut_crm,
    ),
  );

  // Croissance : dossiers ouverts ce mois-ci comparés au mois précédent.
  const maintenant = new Date();
  const cleMois = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;
  const moisPrecedent = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, 1);
  const ceMois = dossiers.filter((d) => cleMois(new Date(d.created_at)) === cleMois(maintenant))
    .length;
  const moisDavant = dossiers.filter(
    (d) => cleMois(new Date(d.created_at)) === cleMois(moisPrecedent),
  ).length;
  const croissance =
    moisDavant === 0 ? (ceMois > 0 ? 100 : 0) : Math.round(((ceMois - moisDavant) / moisDavant) * 100);

  // Planning : prochaines interventions issues des dossiers actifs.
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const planning = dossiers
    .filter((d) => d.date_debut && (d.date_fin ?? d.date_debut) >= aujourdhui)
    .sort((a, b) => (a.date_debut ?? "").localeCompare(b.date_debut ?? ""))
    .slice(0, 6);

  const etapes = [
    {
      titre: "Profil complété",
      atteint: Boolean(profile?.siret && profile?.numero_nda),
      astuce: "Ajoutez votre SIRET et votre numéro de déclaration d'activité.",
      lien: "/espace/profil" as const,
    },
    {
      titre: "Candidature validée",
      atteint: isValidatedFormateur,
      astuce: "L'équipe Skills4mation valide votre dossier de candidature.",
      lien: "/espace/profil" as const,
    },
    {
      titre: "Première formation créée",
      atteint: (formations ?? []).length > 0,
      astuce: "Créez une formation réutilisable dans tous vos dossiers.",
      lien: "/espace/formations" as const,
    },
    {
      titre: "Premier dossier ouvert",
      atteint: dossiers.length > 0,
      astuce: "Ouvrez un dossier : le numéro ADF est attribué automatiquement.",
      lien: "/espace/dossiers/new" as const,
    },
    {
      titre: "Dossier validé par Skills4mation",
      atteint: dossiers.some((d) => (CRM_STATUTS[d.statut_crm]?.etape ?? 0) >= 2),
      astuce: "Complétez un dossier puis demandez la validation.",
      lien: "/espace/dossiers" as const,
    },
    {
      titre: "Formation réalisée",
      atteint: realises.length > 0,
      astuce: "Signalez la fin de formation pour déclencher le paiement.",
      lien: "/espace/dossiers" as const,
    },
  ];
  const franchies = etapes.filter((e) => e.atteint).length;
  const niveau = ["Nouveau venu", "Explorateur", "Formateur actif", "Formateur confirmé", "Expert du portage"][
    Math.min(4, Math.floor((franchies / etapes.length) * 5))
  ];

  const kpis = [
    { label: "Mes formations", valeur: (formations ?? []).length, icone: BookOpen, to: "/espace/formations" as const },
    { label: "Dossiers en cours", valeur: enCours.length, icone: Folders, to: "/espace/dossiers" as const },
    { label: "Total dossiers", valeur: dossiers.length, icone: Folders, to: "/espace/dossiers" as const },
    { label: "Brouillons à finaliser", valeur: brouillons.length, icone: FilePlus2, to: "/espace/dossiers" as const },
  ];

  return (
    <AppShell
      items={FORMATEUR_NAV}
      title={`Bienvenue ${profile?.prenom ?? ""}`.trim()}
      subtitle="Votre progression, vos dossiers et vos prochaines interventions"
      actions={
        <Button asChild variant="cta">
          <Link to="/espace/dossiers/new">
            <FolderPlus className="size-4" /> Nouveau dossier
          </Link>
        </Button>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <Card className="overflow-hidden rounded-2xl border-border/70 shadow-soft">
          <CardContent className="flex flex-wrap items-center gap-5 p-6">
            <Avatar className="size-24 shrink-0 rounded-full border-2 border-border">
              {photo ? <AvatarImage src={photo} alt="Votre photo de profil" /> : null}
              <AvatarFallback className="bg-secondary/15 text-2xl font-semibold text-secondary">
                {initiales}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-semibold">
                {`${profile?.prenom ?? ""} ${profile?.nom ?? ""}`.trim() || profile?.email}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <StatutBadge kind="candidature" statut={profile?.statut_candidature ?? "en_attente"} />
                {secteurLabel ? <Badge variant="secondary">{secteurLabel}</Badge> : null}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cta/15 px-3 py-1 text-xs font-semibold text-cta-foreground">
                  <Trophy className="size-3.5" /> {niveau}
                </span>
              </div>
              {!photo ? (
                <Link to="/espace/profil" className="mt-2 inline-block text-xs font-semibold underline">
                  Ajouter votre photo de profil
                </Link>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="inline-flex items-center gap-2 text-base font-semibold">
                <Sparkles className="size-4 text-cta-foreground" /> Votre parcours de portage
              </h2>
              <span className="text-sm font-semibold">
                {franchies}/{etapes.length}
              </span>
            </div>
            <Progress value={(franchies / etapes.length) * 100} className="mt-4" />
            <ul className="mt-4 grid gap-2">
              {etapes.map((etape) => (
                <li key={etape.titre}>
                  <Link
                    to={etape.lien}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-sm transition ${
                      etape.atteint
                        ? "border-success/40 bg-success/10 font-semibold"
                        : "border-dashed border-border/70 text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    {etape.atteint ? (
                      <Trophy className="size-4 shrink-0 animate-in zoom-in-50 text-success duration-500" />
                    ) : (
                      <Lock className="size-4 shrink-0" />
                    )}
                    <span className="min-w-0">
                      {etape.titre}
                      {etape.atteint ? null : (
                        <span className="block text-xs">{etape.astuce}</span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 rounded-2xl border-border/70 shadow-soft">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Mon expertise</h2>
            <Link to="/espace/profil" className="text-xs font-semibold underline">
              {profile?.expertise ? "Modifier mon profil" : "Compléter mon profil"}
            </Link>
          </div>
          {profile?.expertise ? (
            <p className="mt-3 line-clamp-4 text-sm text-muted-foreground">{profile.expertise}</p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Décrivez votre expertise en quelques lignes : elle valorise vos formations publiées et
              vos dossiers.
            </p>
          )}
        </CardContent>
      </Card>

      {!isValidatedFormateur ? (
        <Card className="mt-6 rounded-2xl border-cta/40 bg-cta/10">
          <CardContent className="p-6">
            <h2 className="text-base font-semibold">Candidature en cours de validation</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Votre accès complet sera activé dès que l'équipe Skills4mation aura validé votre
              candidature.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Link key={kpi.label} to={kpi.to} className="group">
            <Card className="h-full rounded-2xl border-border/70 shadow-soft transition group-hover:-translate-y-0.5 group-hover:border-secondary/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <kpi.icone className="size-4 text-secondary" />
                </div>
                <p className="mt-2 text-3xl font-semibold">{kpi.valeur}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card className="rounded-2xl border-border/70 shadow-soft">
          <CardContent className="p-6">
            <h2 className="inline-flex items-center gap-2 text-base font-semibold">
              <TrendingUp className="size-4 text-secondary" /> Activité du mois
            </h2>
            <p className="mt-3 text-3xl font-semibold">
              {croissance > 0 ? "+" : ""}
              {croissance} %
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {ceMois} dossier(s) ouvert(s) ce mois-ci contre {moisDavant} le mois précédent.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              {realises.length} formation(s) réalisée(s) · {(formations ?? []).filter((f) => f.publiee).length}{" "}
              formation(s) publiée(s) au catalogue.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-soft lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="inline-flex items-center gap-2 text-base font-semibold">
              <CalendarDays className="size-4 text-secondary" /> Planning de mes interventions
            </h2>
            {planning.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Aucune session programmée : ajoutez les dates de formation dans un dossier pour voir
                votre planning ici.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-border">
                {planning.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {d.titre_formation || dossierNom(d)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(d.date_debut)}
                        {d.date_fin && d.date_fin !== d.date_debut
                          ? ` → ${formatDate(d.date_fin)}`
                          : ""}{" "}
                        · {d.entreprise_nom || "Entreprise non renseignée"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CrmBadge statut={d.statut_crm} />
                      <Button asChild variant="ghost" size="icon" aria-label="Ouvrir le dossier">
                        <Link to="/espace/dossiers/$id" params={{ id: d.id }}>
                          <ArrowUpRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 rounded-2xl border-border/70 shadow-soft">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 text-base font-semibold">
              <BookOpen className="size-4 text-secondary" /> Aperçu de mes formations
            </h2>
            <Link to="/espace/formations" className="text-xs font-semibold underline">
              Voir toutes mes formations
            </Link>
          </div>
          {(formations ?? []).length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Aucune formation enregistrée pour l'instant.
            </p>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {(formations ?? []).slice(0, 3).map((f) => {
                const image = visuelUrl(f.visuel_url);
                return (
                  <li key={f.id}>
                    <Link
                      to="/espace/formations/$id"
                      params={{ id: f.id }}
                      className="block rounded-xl border border-border/70 p-3 transition hover:border-secondary/50"
                    >
                      <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                        {image ? (
                          <img src={image} alt="" className="size-full object-cover" />
                        ) : null}
                      </div>
                      <p className="mt-2 truncate text-sm font-semibold">{f.titre}</p>
                      <Badge variant={f.publiee ? "default" : "secondary"} className="mt-1">
                        {f.publiee ? "Publiée" : "Brouillon"}
                      </Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>



      <Card className="mt-6 rounded-2xl border-border/70 shadow-soft">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Mes dossiers récents</h2>
            {brouillons.length > 0 ? (
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
                {brouillons.length} brouillon(s) à finaliser
              </span>
            ) : null}
          </div>
          {isLoading ? (
            <p className="mt-4 text-sm text-muted-foreground">Chargement…</p>
          ) : dossiers.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Aucun dossier pour l'instant. Créez votre premier dossier de formation.
              </p>
              <Button asChild variant="cta" className="mt-4">
                <Link to="/espace/dossiers/new">Créer un dossier</Link>
              </Button>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {dossiers.slice(0, 8).map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link
                      to="/espace/dossiers/$id"
                      params={{ id: d.id }}
                      className="truncate text-sm font-semibold hover:underline"
                    >
                      {d.dossier_nom || dossierNom(d)}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Créé le {formatDate(d.created_at)}
                    </p>
                  </div>
                  <CrmBadge statut={d.statut_crm} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
