import { Link, useRouter } from "@tanstack/react-router";
import { LogOut, Menu } from "lucide-react";
import { useState, type ComponentType, type ReactNode } from "react";

import { Logo } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";

export type NavItem = { to: string; label: string; icon: ComponentType<{ className?: string }> };

export function AppShell({
  items,
  title,
  subtitle,
  actions,
  children,
}: {
  items: NavItem[];
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { profile, isAdmin, isSuperAdmin, isConseillere, signOut } = useAuth();
  const router = useRouter();
  const roleBadge = isSuperAdmin
    ? { label: "Super admin", tone: "bg-secondary text-secondary-foreground" }
    : isConseillere
      ? { label: "Conseillère formation", tone: "bg-accent text-accent-foreground" }
      : { label: "Formateur partenaire", tone: "bg-muted text-muted-foreground" };
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-1">
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: item.to.split("/").length <= 2 }}
          onClick={() => setOpen(false)}
          activeProps={{
            className: "bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
          }}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent/70"
        >
          <item.icon className="size-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  const sidebarInner = (
    <div className="flex h-full flex-col">
      <div className="rounded-xl bg-sidebar-accent/40 p-3">
        <p className="text-sm font-semibold text-sidebar-foreground">
          {profile ? `${profile.prenom} ${profile.nom}`.trim() || profile.email : "…"}
        </p>
        <p className="text-xs text-sidebar-foreground/70">
          {isAdmin ? "Équipe Skills4mation" : "Formateur partenaire"}
        </p>
      </div>
      <div className="mt-6 flex-1">{nav}</div>
      <button
        onClick={async () => {
          await signOut();
          router.navigate({ to: "/" });
        }}
        className="mt-6 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/70"
      >
        <LogOut className="size-4" /> Se déconnecter
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-72 shrink-0 flex-col bg-sidebar p-5 lg:flex">
        <div className="rounded-xl bg-background/95 p-2">
          <Logo />
        </div>
        <div className="mt-6 flex-1">{sidebarInner}</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-background/90 px-5 py-4 backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-sidebar p-5">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="mt-6 h-[calc(100%-3rem)]">{sidebarInner}</div>
              </SheetContent>
            </Sheet>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold">{title}</h1>
              {subtitle ? (
                <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`hidden rounded-full px-3 py-1 text-xs font-semibold sm:inline-flex ${roleBadge.tone}`}
            >
              {roleBadge.label}
            </span>
            {actions}
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
