import { describe, expect, it } from "vitest";

import { balisesRestantes, renderTemplate } from "../render";

describe("renderTemplate", () => {
  it("remplace les variables fournies", () => {
    const html = renderTemplate("<p>{{titre}} — {{ ville }}</p>", { titre: "Agile", ville: "Paris" });
    expect(html).toContain("Agile — Paris");
    expect(balisesRestantes(html)).toHaveLength(0);
  });

  it("remplace les variables absentes par un tiret", () => {
    const html = renderTemplate("<p>{{inconnu}}</p>", {});
    expect(html).toContain("—");
    expect(html).not.toContain("{{");
  });

  it("respecte l'option de valeur vide", () => {
    expect(renderTemplate("<p>{{x}}</p>", {}, { vide: "N/A" })).toContain("N/A");
  });

  it("rend une chaîne vide sans substitution de tiret", () => {
    const html = renderTemplate("<p>[{{x}}]</p>", { x: "" });
    expect(html).toContain("[]");
  });

  it("échappe les valeurs pour éviter toute injection", () => {
    const html = renderTemplate("<p>{{x}}</p>", { x: "<img src=x onerror=1>" });
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });
});
