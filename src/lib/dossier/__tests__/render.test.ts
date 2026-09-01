import { describe, expect, it } from "vitest";

import {
  balisesRestantes,
  contratSousTraitanceHtml,
  conventionHtml,
  convocationHtml,
  emargementHtml,
  planningHtml,
  recueilBesoinsHtml,
} from "../render";
import { DONNEES_VIDES, type DossierDonnees } from "../types";

const dossier: DossierDonnees = {
  ...DONNEES_VIDES,
  adf: "ADF-2026-001",
  entreprise: {
    nom: "Tech Innovate SAS",
    nomCommercial: "Tech Innovate",
    adresse: "12 avenue des Champs-Élysées, 75008 Paris",
    siret: "12345678900012",
    prenomRepresentant: "Claire",
    nomRepresentant: "Moreau",
    telephone: "0102030405",
    email: "claire@tech-innovate.fr",
  },
  formation: {
    ...DONNEES_VIDES.formation,
    titre: "Gestion de projet agile",
    objectifs: "Piloter un sprint et réussir la certification.",
    niveau: "Intermédiaire",
    prerequis: "Aucun",
    dateDebut: "2026-10-01",
    dateFin: "2026-10-05",
    heuresTotal: "35",
    heuresPresentiel: "21",
    nbJours: "5",
    format: "mixte",
    lienConnexion: "https://meet.example.com/s4m",
  },
  lieu: {
    intitule: "Tech Innovate SAS",
    adresse: "12 avenue des Champs-Élysées, 75008 Paris",
    siret: "12345678900012",
  },
  apprenants: Array.from({ length: 10 }, (_, i) => ({
    nom: `Stagiaire ${i + 1}`,
    poste: "Chef de projet",
    email: `stagiaire${i + 1}@tech-innovate.fr`,
    telephone: "0601020304",
    numeroCpf: `CPF-${i + 1}`,
    certification: "ICDL",
  })),
  sessions: Array.from({ length: 6 }, (_, i) => ({
    date: `2026-10-0${i + 1}`,
    heureDebut: "09:00",
    heureFin: "12:30",
    lieu: "Paris",
    module: `Module ${i + 1}`,
  })),
  tarifs: {
    prixUnitaire: "1200",
    nbStagiaires: "10",
    prixTotal: "12000",
    prixPresentiel: "7200",
    opco: "OPCO Atlas",
    subrogation: "oui",
    modeFinancement: "opco",
    montantPrisEnCharge: "12000",
    certificationIcdl: true,
    coutCertification: "89",
  },
  convention: { lieu: "Paris", date: "2026-09-15" },
  formateur: {
    prenom: "Jean",
    nom: "Dupont",
    entreprise: "JD Formation",
    adresse: "5 rue de la Paix, 75002 Paris",
    siret: "98765432100019",
    nda: "11756789012",
    ndaRegion: "Île-de-France",
    email: "jean@jdformation.fr",
    telephone: "0611223344",
    coutHoraire: "60",
    totalRecette: "2100",
    dateMissionOuverte: "2026-09-20",
  },
  besoins: {
    contexte: "Montée en compétences des chefs de projet.",
    attentes: "Maîtriser Scrum.",
    niveauDepart: "Notions de base.",
    contraintes: "Aucune contrainte particulière.",
    modalitesEvaluation: "Quiz et mise en situation.",
  },
};

const documents: Array<[string, string]> = [
  ["1A convention", conventionHtml(dossier)],
  ["2 planning", planningHtml(dossier)],
  ["3A convocation", convocationHtml(dossier)],
  ["F0A recueil des besoins", recueilBesoinsHtml(dossier)],
  ["F0C contrat de sous-traitance", contratSousTraitanceHtml(dossier)],
  ["F3 feuille d'émargement", emargementHtml(dossier)],
];

describe("gabarits officiels", () => {
  it.each(documents)("%s ne conserve aucune balise {{...}}", (_label, html) => {
    expect(balisesRestantes(html)).toEqual([]);
    expect(html.length).toBeGreaterThan(1000);
  });

  it("liste les apprenants au-delà du 8e en annexe de la convention", () => {
    const html = conventionHtml(dossier);
    expect(html).toContain("Annexe — Liste complémentaire des stagiaires");
    expect(html).toContain("Stagiaire 9");
    expect(html).toContain("Stagiaire 10");
  });

  it("génère une convocation et un recueil par apprenant", () => {
    expect(convocationHtml(dossier).split("<!DOCTYPE html>").length - 1).toBe(10);
    expect(recueilBesoinsHtml(dossier).split("<!DOCTYPE html>").length - 1).toBe(10);
  });
});
