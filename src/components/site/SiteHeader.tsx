import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { to: "/", hash: undefined, label: "Accueil" },
  { to: "/", hash: "portage", label: "Portage Qualiopi" },
  { to: "/", hash: "etapes", label: "Comment ça marche" },
  { to: "/", hash: "tarifs", label: "Tarifs" },
  { to: "/", hash: "profils", label: "Pour qui ?" },
  { to: "/", hash: "faq", label: "Ressources" },
  { to: "/contact", hash: undefined, label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { session, isAdmin } = useAuth();
  const espaceTo = session ? (isAdmin ? "/admin" : "/espace") : "/auth";

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="section-shell flex h-18 items-center justify-between gap-3 py-3">
        <Logo />

        <nav className="hidden items-center gap-0.5 xl:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              {...(item.hash ? { hash: item.hash } : {})}
              activeOptions={{ exact: item.to === "/" && !item.hash }}
              className="rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden lg:inline-flex">
            <Link to="/" hash="simulateur">
              Simuler ma rémunération
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link to={espaceTo}>Espace formateur</Link>
          </Button>
          <Button asChild variant="cta" size="sm">
            <Link to="/pole-formateur">Devenir partenaire porté</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="xl:hidden" aria-label="Menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <nav className="mt-8 flex flex-col gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    {...(item.hash ? { hash: item.hash } : {})}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-accent"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/"
                  hash="simulateur"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-accent"
                >
                  Simuler ma rémunération
                </Link>
                <Link
                  to={espaceTo}
                  onClick={() => setOpen(false)}
                  className="mt-2 rounded-lg px-3 py-3 text-sm font-semibold text-secondary hover:bg-accent"
                >
                  Espace formateur
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
