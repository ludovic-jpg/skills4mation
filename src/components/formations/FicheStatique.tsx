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
import { categoryLabel } from "@/data/catalogue";
import type { FormationDetail } from "@/data/formation-details";
import { FORMATIONS_STATIQUES, type FormationStatique } from "@/data/formations-statiques";

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
  formation,
  detail,
}: {
  formation: FormationStatique;
  detail: FormationDetail;
}) {
  const related = FORMATIONS_STATIQUES.filter(
    (f) => f.cat === formation.cat && f.slug !== formation.slug,
  ).slice(0, 4);

  return (
    <div>
      <section className="bg-gradient-hero py-14 text-primary-foreground">
        <div className="section-shell grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="eyebrow text-cta">{categoryLabel(formation.cat)}</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-primary-foreground md:text-4xl">
              {detail.heading || formation.title}
            </h1>
            <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
              Mise à jour du programme : {detail.derniereMiseAJour ?? MAJ_DEFAUT}
            </p>
            {detail.intro ? (
              <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/80">
                {detail.intro}
              </p>
            ) : null}
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild variant="cta">
                <Link to="/evaluer-droit-formation">S'inscrire à cette formation</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/formations" search={{ categorie: formation.cat }}>
                  Toutes les formations {categoryLabel(formation.cat)}
                </Link>
              </Button>
            </div>
          </div>
          <Media
            src={formation.img}
            alt={formation.title}
            ratio="4/3"
            mdRatio="4/5"
            className="rounded-2xl shadow-elevated"
            priority
          />
        </div>
      </section>

      <section className="section-shell -mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <InfoCard label="Niveau" value={detail.niveau} icon={BarChart3} />
        <InfoCard label="Tarif" value={detail.tarif} icon={Euro} />
        <InfoCard label="Objectif" value={detail.objectif} icon={Target} />
        <InfoCard label="Durée" value={detail.duree} icon={Clock} />
        <InfoCard label="Pré-requis" value={detail.prerequis} icon={ClipboardList} />
      </section>

      <section className="section-shell grid gap-12 py-14 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-12">
          {detail.objectifs.length > 0 ? (
            <div>
              <h2 className="text-2xl font-semibold">Objectifs pédagogiques</h2>
              <Bullets items={detail.objectifs} />
            </div>
          ) : null}

          {detail.public.length > 0 ? (
            <div>
              <h2 className="text-2xl font-semibold">Public cible</h2>
              <Bullets items={detail.public} />
            </div>
          ) : null}

          {detail.programme.length > 0 ? (
            <div>
              <h2 className="text-2xl font-semibold">Programme pédagogique</h2>
              <div className="mt-6 space-y-5">
                {detail.programme.map((m) => (
                  <div
                    key={m.title}
                    className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft"
                  >
                    <h3 className="text-base font-semibold">{m.title}</h3>
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

          {detail.resultats.length > 0 ? (
            <div>
              <h2 className="text-2xl font-semibold">Résultats attendus</h2>
              <Bullets items={detail.resultats} />
            </div>
          ) : null}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          {detail.modalites.length > 0 ? (
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
              <h2 className="text-lg font-semibold">Modalités pédagogiques</h2>
              <Bullets items={detail.modalites} />
            </div>
          ) : null}
          {detail.forts.length > 0 ? (
            <div className="rounded-2xl bg-accent p-6">
              <h2 className="text-lg font-semibold">Points forts</h2>
              <Bullets items={detail.forts} />
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
              {detail.certification ? (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {detail.certification.modalitesEvaluation}
                </p>
              ) : (
                <Bullets items={detail.modalitesEvaluation ?? MODALITES_EVALUATION} />
              )}
            </div>
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
              <h3 className="text-base font-semibold">Délais d'accès</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {detail.delaisAcces ?? DELAIS_ACCES_DEFAUT}
              </p>
              <h3 className="mt-6 text-base font-semibold">Accessibilité handicap</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {detail.accessibiliteHandicap ?? ACCESSIBILITE_DEFAUT}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
              <h3 className="text-base font-semibold">Dernière mise à jour du programme</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {`Dernière mise à jour du programme le ${detail.derniereMiseAJour ?? MAJ_DEFAUT}`}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
              <h3 className="text-base font-semibold">Certification</h3>
              {detail.certification ? (
                <dl className="mt-3 grid gap-2 text-sm text-muted-foreground">
                  <div>
                    <dt className="font-semibold text-foreground">Intitulé exact</dt>
                    <dd>{detail.certification.libelle}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">
                      N° d'enregistrement au Répertoire spécifique
                    </dt>
                    <dd>{detail.certification.code}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">Certificateur</dt>
                    <dd>{detail.certification.certificateur}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">Date d'enregistrement</dt>
                    <dd>{detail.certification.dateEnregistrement}</dd>
                  </div>
                  {detail.certification.validiteJusquau ? (
                    <div>
                      <dt className="font-semibold text-foreground">Validité jusqu'au</dt>
                      <dd>{detail.certification.validiteJusquau}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="font-semibold text-foreground">
                      Ce que valide la certification
                    </dt>
                    <dd>{detail.certification.description}</dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">{SANS_CERTIFICATION}</p>
              )}
            </div>
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft md:col-span-2">
              <h3 className="text-base font-semibold">Comment se déroule la certification ?</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {detail.certification?.modalitesEvaluation ?? SANS_CERTIFICATION}
              </p>
            </div>
          </div>
        </div>
      </section>

      {detail.anciens && detail.anciens.length > 0 ? (
        <section className="section-shell py-14">
          <h2 className="text-2xl font-semibold">Ils ont suivi cette formation</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {detail.anciens.map((a) => (
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

      {related.length > 0 ? (
        <section className="section-shell pb-16">
          <h2 className="text-2xl font-semibold">
            Les formations qui pourraient également vous intéresser
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((f) => (
              <FormationCard
                key={f.slug}
                formation={{
                  slug: f.slug,
                  titre: f.title,
                  categorie: f.cat,
                  image: f.img,
                }}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
