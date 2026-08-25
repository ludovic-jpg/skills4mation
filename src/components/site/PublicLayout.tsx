import type { ReactNode } from "react";

import { CertificationsBand } from "@/components/site/CertificationsBand";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <CertificationsBand />
      <SiteFooter />
    </div>
  );
}


export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="bg-gradient-hero py-16 text-primary-foreground">
      <div className="section-shell max-w-3xl">
        <p className="eyebrow text-cta">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold text-primary-foreground sm:text-5xl">{title}</h1>
        <p className="mt-4 text-base text-primary-foreground/80">{description}</p>
      </div>
    </section>
  );
}
