import { describe, expect, it } from "vitest";

import {
  cheminPiece,
  choisirCandidature,
  complementProfil,
  decisionRattachement,
  egalesTempsConstant,
  hacherJeton,
  jetonValide,
} from "@/lib/candidature-questionnaire";

const jeton = "3f8b2c6d-9a14-4e57-b0c2-7d1e5a9f4c38";

describe("jeton de réclamation", () => {
  it("hache en SHA-256 hex, de façon déterministe", async () => {
    const h = await hacherJeton(jeton);
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(await hacherJeton(jeton)).toBe(h);
    expect(await hacherJeton("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("valide le format UUID", () => {
    expect(jetonValide(jeton)).toBe(true);
    expect(jetonValide("pas-un-jeton")).toBe(false);
    expect(jetonValide(null)).toBe(false);
  });

  it("compare à temps constant", () => {
    expect(egalesTempsConstant("abcd", "abcd")).toBe(true);
    expect(egalesTempsConstant("abcd", "abce")).toBe(false);
    expect(egalesTempsConstant("abc", "abcd")).toBe(false);
  });

  it("décide complet / simple / rien", async () => {
    const h = await hacherJeton(jeton);
    const autre = await hacherJeton("4f8b2c6d-9a14-4e57-b0c2-7d1e5a9f4c38");
    expect(decisionRattachement(h, h)).toBe("complet");
    expect(decisionRattachement(h, autre)).toBe("rien");
    expect(decisionRattachement(h, null)).toBe("rien");
    expect(decisionRattachement(null, null)).toBe("simple");
    expect(decisionRattachement(undefined, h)).toBe("simple");
  });

  it("choisit la candidature dont l'empreinte correspond", async () => {
    const h = await hacherJeton(jeton);
    const liste = [
      { id: "recente", jeton_hash: "f".repeat(64) },
      { id: "visee", jeton_hash: h },
    ];
    expect(choisirCandidature(liste, h)?.id).toBe("visee");
    expect(choisirCandidature(liste, null)?.id).toBe("recente");
    expect(choisirCandidature([], h)).toBeNull();
  });
});

describe("filtrage des chemins de pièces", () => {
  it("n'accepte que les dépôts publics produits par /candidature", () => {
    expect(cheminPiece("public/3f8b2c6d-9a14/cv-mon_cv.pdf")).toBe(
      "public/3f8b2c6d-9a14/cv-mon_cv.pdf",
    );
    expect(cheminPiece("public/abc123/deroule-d.docx")).toBeTruthy();
    expect(cheminPiece("uid-tiers/cv.pdf")).toBeNull();
    expect(cheminPiece("public/abc123/../uid/cv-x.pdf")).toBeNull();
    expect(cheminPiece("public/abc123/photo-x.pdf")).toBeNull();
    expect(cheminPiece("https://exemple.fr/public/abc123/cv-x.pdf")).toBeNull();
    expect(cheminPiece(42)).toBeNull();
  });

  it("recopie le questionnaire normalisé, jamais la valeur brute", () => {
    const brut = { domaines: ["digital", "<script>"], pirate: "x", experience: "2_5" };
    const patch = complementProfil({ questionnaire: null }, { questionnaire: brut });
    const q = patch["questionnaire"] as Record<string, unknown>;
    expect(q["domaines"]).toEqual(["digital"]);
    expect(q["pirate"]).toBeUndefined();
    expect(q["experience"]).toBe("2_5");
  });
});
