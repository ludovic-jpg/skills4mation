import { describe, expect, it } from "vitest";

import { publicRedirectTarget } from "@/lib/legacy-redirects";
import { estFichePublique } from "@/lib/seo-exclusions";

describe("redirections SEO du site public", () => {
  it("envoie les fiches bien-être vers formabientre.fr en un saut", () => {
    expect(publicRedirectTarget("/formations/formation-massage-lomi")).toBe(
      "https://formabientre.fr/formation/massage-lomi",
    );
    expect(publicRedirectTarget("/formation/bien-etre/formation-yoga-et-ayurveda/")).toBe(
      "https://formabientre.fr/formation/yoga-ayurveda",
    );
    expect(publicRedirectTarget("/catalogue/bien-etre/formation-massage-kobi")).toBe(
      "https://formabientre.fr/formation/massage-kobi",
    );
    expect(publicRedirectTarget("/formations/formation-massage-shinzu-body")).toBe(
      "https://formabientre.fr/formations",
    );
    expect(publicRedirectTarget("/formation/bien-etre/")).toBe(
      "https://formabientre.fr/formations",
    );
    expect(publicRedirectTarget("/formations", "?categorie=bien-etre")).toBe(
      "https://formabientre.fr/formations",
    );
  });

  it("retire la fiche de test", () => {
    expect(publicRedirectTarget("/formations/formation-albisser-mtiviu4q")).toBe("/formations");
    expect(estFichePublique({ slug: "formation-albisser-mtiviu4q", categorie: "ventes" })).toBe(
      false,
    );
    expect(estFichePublique({ slug: "formation-vente-conseil", categorie: "ventes" })).toBe(true);
    expect(estFichePublique({ slug: "nouvelle-fiche", categorie: "bien-etre" })).toBe(false);
  });

  it("ramène les chemins publics en minuscules sans toucher aux routes techniques", () => {
    expect(publicRedirectTarget("/Portage-Qualiopi")).toBe("/portage-qualiopi");
    expect(publicRedirectTarget("/Formations", "?categorie=langues")).toBe(
      "/formations?categorie=langues",
    );
    expect(publicRedirectTarget("/Formation/Ventes/Formation-Vente-Conseil/")).toBe(
      "/formations/formation-vente-conseil",
    );
    expect(publicRedirectTarget("/blog/%C3%A9t%C3%A9")).toBeNull();
    expect(publicRedirectTarget("/.mcp/invoke-tool/listTools")).toBeNull();
    expect(publicRedirectTarget("/api/public/formation-image/A/B.png")).toBeNull();
    expect(publicRedirectTarget("/images/Logo.PNG")).toBeNull();
    expect(publicRedirectTarget("/~flock.js")).toBeNull();
    expect(publicRedirectTarget("/espace/dossiers/ABC")).toBeNull();
  });

  it("laisse passer les pages normales", () => {
    expect(publicRedirectTarget("/formations/formation-vente-conseil")).toBeNull();
    expect(publicRedirectTarget("/portage-qualiopi")).toBeNull();
    expect(publicRedirectTarget("/")).toBeNull();
  });
});
