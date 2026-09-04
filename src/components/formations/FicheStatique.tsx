import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Check,
  ClipboardList,
  Clock,
  Euro,
  Target,
  type LucideIcon,
} from "lucide-react";

import { FormationCard } from "@/components/formations/FormationCard";
import { Media } from "@/components/site/Media";
import { Button } from "@/components/ui/button";
import {
  categoryLabel,
  type CarteHistorique,
  type FicheFormation,
} from "@/lib/catalogue-historique";

export const MODALITES_EVALUATION = [
  "Test de positionnement pour positionner et adapter la formation",
  "Évaluation régulière pendant la formation",
  "Évaluation finale en fin de parcours",
];

const DELAIS_ACCES_DEFAUT = "Retour en 24 h pour effectuer le recueil des besoins.";
const ACCESSIBILITE_DEFAUT =
  "Toutes nos formations sont accessibles, sous réserve d'étude préalable des besoins d'aménagement.";
const MAJ_DEFAUT = "03/09/26";
const SANS_CERTIFICATION = "Cette formation ne fait pas l'objet de certification.";

function InfoCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
      {Icon ? <Icon className="size-5 text-secondary" aria-hidden /> : null}
      <p className="eyebrow mt-2 text-secondary">{label}</p>
      <p className="mt-1.5 text-sm font-semibold leading-snug">{value}</p>
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 grid gap-3">
      {items.map((it) => (
        <li key={it} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
          <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

/** Fiche complète d'une formation du catalogue réseau Skills4mation. */
export function FicheStatique({
  fiche,
  related = [],
}: {
  fiche: FicheFormation;
  related?: CarteHistorique[];
}) {
  const autres = related.filter((f) => f.slug !== fiche.slug).slice(0, 4);

  return (
    <div>
      <section className="bg-gradient-hero py-14 text-primary-foreground">
        <div className="section-shell grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            {fiche.categorie ? (
              <p className="eyebrow text-cta">{categoryLabel(fiche.categorie)}</p>
            ) : null}
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-primary-foreground md:text-4xl">
              {fiche.heading || fiche.titre}
            </h1>
            <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
              Mise à jour du programme : {fiche.derniereMiseAJour ?? MAJ_DEFAUT}
            </p>
            {fiche.intro ? (
              <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/80">
                {fiche.intro}
              </p>
            ) : null}
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild variant="cta">
                <Link to="/evaluer-droit-formation">S'inscrire à cette formation</Link>
              </Button>
              {fiche.categorie ? (
                <Button
                  asChild
                  variant="outline"
                  className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Link to="/formations" search={{ categorie: fiche.categorie }}>
                    Toutes les formations {categoryLabel(fiche.categorie)}
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
          {fiche.image ? (
            <Media
              src={fiche.image}
              alt={fiche.titre}
              ratio="4/3"
              mdRatio="4/5"
              className="rounded-2xl shadow-elevated"
              priority
            />
          ) : null}
        </div>
      </section>

      <section className="section-shell -mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <InfoCard label="Niveau" value={fiche.niveau} icon={BarChart3} />
        <InfoCard label="Tarif" value={fiche.tarif} icon={Euro} />
        <InfoCard label="Objectif" value={fiche.objectif} icon={Target} />
        <InfoCard label="Durée" value={fiche.duree} icon={Clock} />
        <InfoCard label="Pré-requis" value={fiche.prerequis} icon={ClipboardList} />
      </section>

      <section className="section-shell grid gap-12 py-14 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-12">
          {fiche.objectifs.length > 0 ? (
            <div>
              <h2 className="text-2xl font-semibold">Objectifs pédagogiques</h2>
              <Bullets items={fiche.objectifs} />
            </div>
          ) : null}

          {fiche.public.length > 0 ? (
            <div>
              <h2 className="text-2xl font-semibold">Public cible</h2>
              <Bullets items={fiche.public} />
            </div>
          ) : null}

          {fiche.programme.length > 0 ? (
            <div>
              <h2 className="text-2xl font-semibold">Programme pédagogique</h2>
              <div className="mt-6 space-y-5">
                {fiche.programme.map((m) => (
                  <div
                    key={m.titre}
                    className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft"
                  >
                    <h3 className="text-base font-semibold">{m.titre}</h3>
                    <ul className="mt-3 grid gap-2">
                      {m.points.map((p) => (
                        <li
                          key={p}
                          className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                        >
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-secondary" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {fiche.resultats.length > 0 ? (
            <div>
              <h2 className="text-2xl font-semibold">Résultats attendus</h2>
              <Bullets items={fiche.resultats} />
            </div>
          ) : null}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          {fiche.modalites.length > 0 ? (
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
              <h2 className="text-lg font-semibold">Modalités pédagogiques</h2>
              <Bullets items={fiche.modalites} />
            </div>
          ) : null}
          {fiche.forts.length > 0 ? (
            <div className="rounded-2xl bg-accent p-6">
              <h2 className="text-lg font-semibold">Points forts</h2>
              <Bullets items={fiche.forts} />
            </div>
          ) : null}
          <div className="rounded-2xl bg-primary p-6 text-primary-foreground">
            <h2 className="text-lg font-semibold">Financement de votre formation</h2>
            <p className="mt-3 text-sm leading-relaxed text-primary-foreground/85">
              Plusieurs dispositifs de financement de la formation professionnelle peuvent couvrir
              tout ou partie du tarif. Skills4mation évalue vos droits avec vous et monte
              l'intégralité de votre dossier.
            </p>
            <Button asChild variant="cta" className="mt-5">
              <Link to="/evaluer-droit-formation">Évaluer mes droits</Link>
            </Button>
          </div>
        </aside>
      </section>

      <section className="border-y border-border bg-accent/40">
        <div className="section-shell py-14">
          <h2 className="text-2xl font-semibold">Informations réglementaires</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
              <h3 className="text-base font-semibold">Modalités d'évaluation</h3>
              {fiche.certification ? (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {fiche.certification.modalitesEvaluation}
                </p>
              ) : (
                <Bullets items={fiche.modalitesEvaluation ?? MODALITES_EVALUATION} />
              )}
            </div>
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
              <h3 className="text-base font-semibold">Délais d'accès</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {fiche.delaisAcces ?? DELAIS_ACCES_DEFAUT}
              </p>
              <h3 className="mt-6 text-base font-semibold">Accessibilité handicap</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {fiche.accessibiliteHandicap ?? ACCESSIBILITE_DEFAUT}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
              <h3 className="text-base font-semibold">Dernière mise à jour du programme</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {`Dernière mise à jour du programme le ${fiche.derniereMiseAJour ?? MAJ_DEFAUT}`}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
              <h3 className="text-base font-semibold">Certification</h3>
              {fiche.certification ? (
                <dl className="mt-3 grid gap-2 text-sm text-muted-foreground">
                  <div>
                    <dt className="font-semibold text-foreground">Intitulé exact</dt>
                    <dd>{fiche.certification.libelle}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">
                      N° d'enregistrement au Répertoire spécifique
                    </dt>
                    <dd>{fiche.certification.code}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">Certificateur</dt>
                    <dd>{fiche.certification.certificateur}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">Date d'enregistrement</dt>
                    <dd>{fiche.certification.dateEnregistrement}</dd>
                  </div>
                  {fiche.certification.validiteJusquau ? (
                    <div>
                      <dt className="font-semibold text-foreground">Validité jusqu'au</dt>
                      <dd>{fiche.certification.validiteJusquau}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="font-semibold text-foreground">
                      Ce que valide la certification
                    </dt>
                    <dd>{fiche.certification.description}</dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">{SANS_CERTIFICATION}</p>
              )}
            </div>
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft md:col-span-2">
              <h3 className="text-base font-semibold">Comment se déroule la certification ?</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {fiche.certification?.modalitesEvaluation ?? SANS_CERTIFICATION}
              </p>
            </div>
          </div>
        </div>
      </section>

      {fiche.anciens.length > 0 ? (
        <section className="section-shell py-14">
          <h2 className="text-2xl font-semibold">Ils ont suivi cette formation</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {fiche.anciens.map((a) => (
              <div
                key={a.name}
                className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft"
              >
                <p className="text-base font-semibold">{a.name}</p>
                <p className="mt-1 text-sm font-semibold text-secondary">{a.role}</p>
                {a.resultat ? <p className="mt-3 text-sm font-medium">{a.resultat}</p> : null}
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  « {a.temoignage} »
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {autres.length > 0 ? (
        <section className="section-shell pb-16">
          <h2 className="text-2xl font-semibold">
            Les formations qui pourraient également vous intéresser
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {autres.map((f) => (
              <FormationCard
                key={f.slug}
                formation={{
                  slug: f.slug,
                  titre: f.titre,
                  categorie: f.categorie,
                  image: f.visuel_url,
                }}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
