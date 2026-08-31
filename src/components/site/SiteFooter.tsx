import { Link } from "@tanstack/react-router";
import { Linkedin, Mail, Twitter } from "lucide-react";

import { CharteDeontologieBadge, QualiopiBadge } from "@/components/Brand";

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="section-shell grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-xl font-semibold">Skills4mation</p>
          <p className="mt-3 max-w-sm text-sm text-primary-foreground/75">
            L'ingénierie des compétences en mouvement. Spécialiste du portage Qualiopi pour
            formateurs indépendants, organismes et entreprises de formation.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href="https://www.linkedin.com"
              aria-label="LinkedIn"
              className="rounded-full border border-primary-foreground/30 p-2 transition-colors hover:bg-primary-foreground/10"
            >
              <Linkedin className="size-4" />
            </a>
            <a
              href="https://twitter.com"
              aria-label="X"
              className="rounded-full border border-primary-foreground/30 p-2 transition-colors hover:bg-primary-foreground/10"
            >
              <Twitter className="size-4" />
            </a>
            <a
              href="mailto:contact@skills4mation.com"
              aria-label="Email"
              className="rounded-full border border-primary-foreground/30 p-2 transition-colors hover:bg-primary-foreground/10"
            >
              <Mail className="size-4" />
            </a>
          </div>
        </div>

        <nav className="text-sm">
          <p className="mb-3 font-semibold">Navigation</p>
          <ul className="space-y-2 text-primary-foreground/75">
            <li>
              <Link to="/portage-qualiopi" hash="portage">
                Portage Qualiopi
              </Link>
            </li>
            <li>
              <Link to="/portage-qualiopi" hash="tarifs">
                Tarifs
              </Link>
            </li>
            <li>
              <Link to="/formations">Catalogue de formation</Link>
            </li>
            <li>
              <Link to="/" hash="budget">
                Évaluer mon budget formation
              </Link>
            </li>
            <li>
              <Link to="/" hash="projet">
                Parler de mon projet
              </Link>
            </li>
            <li>
              <Link to="/pole-formateur" hash="candidature">Rejoindre Skills4mation</Link>
            </li>
            <li>
              <Link to="/blog">Blog pédagogique</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/auth">Espace formateur</Link>
            </li>
          </ul>
        </nav>

        <div className="text-sm">
          <p className="mb-3 font-semibold">Informations légales</p>
          <ul className="space-y-2 text-primary-foreground/75">
            <li>
              <Link to="/mentions-legales">Mentions légales</Link>
            </li>
            <li>
              <Link to="/politique-de-confidentialite">Politique de confidentialité</Link>
            </li>
            <li>
              <Link to="/politique-de-confidentialite" hash="cookies">
                Politique de cookies (UE)
              </Link>
            </li>
            <li>
              <Link to="/code-deontologique">Code déontologique</Link>
            </li>
            <li>
              <Link to="/evaluer-droit-formation">Évaluer mes droits formation</Link>
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <QualiopiBadge />
            <CharteDeontologieBadge />
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15 py-5">
        <p className="section-shell text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} Skills4mation — Organisme de formation certifié Qualiopi ·
          Portage de formation professionnelle.
        </p>
      </div>
    </footer>
  );
}
