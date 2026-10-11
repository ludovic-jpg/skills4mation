import { describe, expect, it } from "vitest";

import {
  analyseSaisie,
  formateSiret,
  normaliseReponse,
  reponseRechercheSchema,
  sirenValide,
  siretValide,
} from "@/lib/entreprises";

// Réponses réelles de https://recherche-entreprises.api.gouv.fr/search (11/10/2026), allégées.
import fixtures from "./fixtures/recherche-entreprises.json";

const parse = (r: unknown) => reponseRechercheSchema.parse(r);

describe("contrôle SIREN / SIRET", () => {
  it("valide la clé de Luhn", () => {
    expect(siretValide("418 166 096 00069")).toBe(true);
    expect(siretValide("41816609600068")).toBe(false);
    expect(sirenValide("418166096")).toBe(true);
    expect(sirenValide("418166097")).toBe(false);
  });

  it("gère l'exception La Poste", () => {
    expect(sirenValide("356000000")).toBe(true);
    expect(siretValide("35600000000048")).toBe(true);
    // Établissement La Poste : somme des chiffres multiple de 5, hors Luhn.
    expect(siretValide("35600000012345")).toBe(false);
    expect(siretValide("35600000049837")).toBe(true);
  });

  it("analyse la saisie", () => {
    expect(analyseSaisie("418 166 096 00069")).toEqual({ type: "siret", q: "41816609600069" });
    expect(analyseSaisie("41816609600068")).toMatchObject({ type: "invalide" });
    expect(analyseSaisie("418166096")).toEqual({ type: "siren", q: "418166096" });
    expect(analyseSaisie("4181660")).toEqual({ type: "incomplet" });
    expect(analyseSaisie("oc")).toEqual({ type: "incomplet" });
    expect(analyseSaisie("Octo technology")).toEqual({ type: "nom", q: "Octo technology" });
  });

  it("formate un SIRET", () => {
    expect(formateSiret("41816609600069")).toBe("418 166 096 00069");
  });
});

describe("normalisation de la réponse", () => {
  it("cible l'établissement exact d'un SIRET (siège)", () => {
    const [e, ...reste] = normaliseReponse(parse(fixtures.siret), {
      type: "siret",
      q: "41816609600069",
    });
    expect(reste).toHaveLength(0);
    expect(e).toMatchObject({
      siret: "41816609600069",
      siren: "418166096",
      raisonSociale: "OCTO-TECHNOLOGY",
      adresse: "34 AVENUE DE L'OPERA",
      codePostal: "75002",
      ville: "PARIS",
      adresseComplete: "34 AVENUE DE L'OPERA 75002 PARIS",
      codeNaf: "62.02A",
      effectif: "500 à 999 salariés",
      formeJuridique: "SAS",
      etatAdministratif: "A",
      estSiege: true,
      dirigeant: { prenom: "Olivier", nom: "ROUX" },
    });
  });

  it("cible un établissement secondaire fermé", () => {
    const res = normaliseReponse(parse(fixtures.siretFerme), {
      type: "siret",
      q: "41816609600010",
    });
    expect(res).toHaveLength(1);
    expect(res[0]).toMatchObject({
      siret: "41816609600010",
      estSiege: false,
      etatAdministratif: "C",
      codePostal: "92150",
      ville: "SURESNES",
      adresse: "51 RUE DE VERDUN",
    });
  });

  it("renvoie le siège pour un SIREN et pour une recherche par nom", () => {
    const siren = normaliseReponse(parse(fixtures.siren), { type: "siren", q: "418166096" });
    expect(siren[0]?.siret).toBe("41816609600069");
    const nom = normaliseReponse(parse(fixtures.nom), { type: "nom", q: "octo technology" });
    expect(nom.length).toBeGreaterThan(1);
    expect(nom.every((e) => e.siret.length === 14)).toBe(true);
    expect(new Set(nom.map((e) => e.siren)).size).toBe(nom.length);
  });

  it("gère La Poste", () => {
    const [e] = normaliseReponse(parse(fixtures.laPoste), { type: "siret", q: "35600000000048" });
    expect(e?.raisonSociale).toBe("LA POSTE");
    expect(e?.codePostal).toBe("75015");
  });
});
