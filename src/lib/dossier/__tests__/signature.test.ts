import { describe, expect, it } from "vitest";

import {
  certificatFileName,
  certificatSignatureHtml,
  horodatageFr,
  sha256Hex,
} from "../signature";

const PREUVE = {
  code: "3A",
  label: "Convocation de formation",
  signataire: "Claire Moreau",
  email: "claire@tech-innovate.fr",
  signatureUserId: "11111111-2222-3333-4444-555555555555",
  signatureDate: "2026-03-04T09:30:00.000Z",
  hash: "a".repeat(64),
  fichierNom: "convocation_signee.pdf",
  dossierLabel: "Tech Innovate SAS - Gestion de projet agile",
};

describe("sha256Hex", () => {
  it("renvoie l'empreinte connue d'une chaîne vide", async () => {
    expect(await sha256Hex(new Uint8Array())).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });

  it("renvoie 64 caractères hexadécimaux et change avec le contenu", async () => {
    const a = await sha256Hex(new TextEncoder().encode("document A"));
    const b = await sha256Hex(new TextEncoder().encode("document B"));
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toBe(b);
  });

  it("est stable pour un même contenu", async () => {
    const bytes = new TextEncoder().encode("contenu identique");
    expect(await sha256Hex(bytes)).toBe(await sha256Hex(bytes.slice()));
  });
});

describe("certificatFileName", () => {
  it("remplace l'extension par le suffixe certificat", () => {
    expect(certificatFileName("3A_Claire_Moreau_Agile_2026-03-04.pdf")).toBe(
      "3A_Claire_Moreau_Agile_2026-03-04_CERTIFICAT.pdf",
    );
    expect(certificatFileName("3A_Claire")).toBe("3A_Claire_CERTIFICAT.pdf");
  });
});

describe("horodatageFr", () => {
  it("formate en heure de Paris", () => {
    expect(horodatageFr("2026-03-04T09:30:00.000Z")).toContain("2026");
    expect(horodatageFr("2026-03-04T09:30:00.000Z")).toMatch(/10:30/);
  });

  it("retourne la valeur brute si la date est invalide", () => {
    expect(horodatageFr("pas-une-date")).toBe("pas-une-date");
  });
});

describe("certificatSignatureHtml", () => {
  const html = certificatSignatureHtml(PREUVE);

  it("contient les preuves essentielles", () => {
    expect(html).toContain("Certificat de signature électronique");
    expect(html).toContain(PREUVE.signataire);
    expect(html).toContain(PREUVE.hash);
    expect(html).toContain(PREUVE.signatureUserId);
    expect(html).toContain(PREUVE.signatureDate);
    expect(html).toContain("3A — Convocation de formation");
  });

  it("échappe le HTML des valeurs et ne laisse aucune variable de gabarit", () => {
    const injecte = certificatSignatureHtml({ ...PREUVE, signataire: "<script>x</script>" });
    expect(injecte).not.toContain("<script>x</script>");
    expect(injecte).toContain("&lt;script&gt;");
    expect(html).not.toMatch(/\{\{/);
  });

  it("affiche un tiret quand l'e-mail est absent", () => {
    expect(certificatSignatureHtml({ ...PREUVE, email: null })).toContain("<td class=\"v\">—</td>");
  });
});
