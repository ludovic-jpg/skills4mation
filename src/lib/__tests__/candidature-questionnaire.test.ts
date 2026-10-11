import { describe, expect, it } from "vitest";

import {
  NB_ETAPES,
  REPONSES_VIDES,
  brouillonUtile,
  complementProfil,
  lireBrouillon,
  lireQuestionnaire,
  linkedinValide,
  motDePasseValide,
  motifEmailExact,
  premiereEtapeInvalide,
  progression,
  resumeQuestionnaire,
  serialiserBrouillon,
  validerEtape,
  verifierFichier,
  versCandidature,
  type Reponses,
} from "@/lib/candidature-questionnaire";

const complet: Reponses = {
  ...REPONSES_VIDES,
  prenom: "Camille",
  nom: "Martin",
  email: "Camille.Martin@Exemple.fr ",
  telephone: "06 12 34 56 78",
  domaines: ["management", "autre"],
  domaineAutre: "Œnologie",
  specialite: "",
  experience: "5_10",
  publics: ["salaries"],
  modalites: ["presentiel", "mixte"],
  zone: "Grand Est",
  linkedin: "linkedin.com/in/camille",
  statutStructure: "societe",
  entreprise: "ACME",
  siret: "356 000 000 00048", // SIRET La Poste (valide)
  entrepriseAdresse: "1 rue de Paris",
  aNda: "oui",
  numeroNda: "44 67 12345 67",
  ndaRegion: "Grand Est",
  engagement: true,
  message: "",
};

const fichiers = {
  cv: { name: "cv.pdf", size: 1000 },
  parcours: { name: "p.docx", size: 1000 },
  deroule: { name: "d.pptx", size: 1000 },
};

describe("progression", () => {
  it("va de 1/8 à 100 %", () => {
    expect(progression(0)).toBe(13);
    expect(progression(NB_ETAPES - 1)).toBe(100);
    expect(progression(99)).toBe(100);
  });
});

describe("validerEtape", () => {
  it("exige l'identité complète", () => {
    const e = validerEtape(0, REPONSES_VIDES);
    expect(Object.keys(e).sort()).toEqual(["email", "nom", "prenom", "telephone"]);
    expect(validerEtape(0, complet)).toEqual({});
  });

  it("exige un domaine et la précision « autre »", () => {
    expect(validerEtape(1, { ...complet, domaines: [] })["domaines"]).toBeTruthy();
    expect(validerEtape(1, { ...complet, domaineAutre: " " })["domaineAutre"]).toBeTruthy();
  });

  it("vérifie SIRET et NDA seulement si nécessaire", () => {
    expect(validerEtape(4, complet)).toEqual({});
    expect(validerEtape(4, { ...complet, siret: "12345678901234" })["siret"]).toBeTruthy();
    expect(validerEtape(4, { ...complet, statutStructure: "aucune", siret: "" })).toEqual({});
    expect(validerEtape(4, { ...complet, numeroNda: "123" })["numeroNda"]).toBeTruthy();
    expect(validerEtape(4, { ...complet, aNda: "non", numeroNda: "" })).toEqual({});
  });

  it("contrôle les pièces", () => {
    expect(validerEtape(5, complet, fichiers)).toEqual({});
    const e = validerEtape(5, complet, { ...fichiers, cv: { name: "cv.exe", size: 10 } });
    expect(e["cv"]).toMatch(/Format/);
    expect(verifierFichier({ name: "a.pdf", size: 11 * 1024 * 1024 })).toMatch(/volumineux/);
    expect(verifierFichier(undefined)).toBe("Pièce obligatoire");
  });

  it("exige l'engagement", () => {
    expect(validerEtape(6, { ...complet, engagement: false })["engagement"]).toBeTruthy();
  });

  it("trouve la première étape incomplète", () => {
    expect(premiereEtapeInvalide(complet, fichiers)).toBe(-1);
    expect(premiereEtapeInvalide({ ...complet, publics: [] }, fichiers)).toBe(2);
  });
});

describe("règles diverses", () => {
  it("LinkedIn facultatif mais vérifié", () => {
    expect(linkedinValide("")).toBe(true);
    expect(linkedinValide("https://www.linkedin.com/in/x")).toBe(true);
    expect(linkedinValide("https://evil.com/linkedin.com")).toBe(false);
  });
  it("mot de passe", () => {
    expect(motDePasseValide("abcdefg1")).toBe(true);
    expect(motDePasseValide("abcdefgh")).toBe(false);
    expect(motDePasseValide("1234567")).toBe(false);
  });
  it("échappe les jokers LIKE", () => {
    expect(motifEmailExact(" A_b%c@x.fr")).toBe("a\\_b\\%c@x.fr");
  });
});

describe("versCandidature", () => {
  const urls = { cv_url: "a", parcours_formation_url: "b", deroule_pedagogique_url: "c" };
  it("normalise et construit le questionnaire", () => {
    const c = versCandidature(complet, urls);
    expect(c.email).toBe("camille.martin@exemple.fr");
    expect(c.siret).toBe("35600000000048");
    expect(c.numero_nda).toBe("44671234567");
    expect(c.expertise).toBe("Management & leadership, Œnologie");
    expect(c.questionnaire.version).toBe(1);
    expect(c.questionnaire.linkedin_url).toBe("https://linkedin.com/in/camille");
    expect(c.questionnaire.entreprise).toBe("ACME");
  });
  it("ignore SIRET/NDA sans structure", () => {
    const c = versCandidature({ ...complet, statutStructure: "aucune", aNda: "non" }, urls);
    expect(c.siret).toBeNull();
    expect(c.numero_nda).toBeNull();
    expect(c.questionnaire.entreprise).toBeNull();
  });
});

describe("questionnaire stocké", () => {
  it("lecture tolérante", () => {
    expect(lireQuestionnaire(null)).toBeNull();
    expect(lireQuestionnaire([1])).toBeNull();
    const q = lireQuestionnaire({ domaines: ["digital", "pirate"], experience: "nope" });
    expect(q?.domaines).toEqual(["digital"]);
    expect(q?.experience).toBeNull();
  });
  it("résumé en badges", () => {
    const c = versCandidature(complet, {
      cv_url: "",
      parcours_formation_url: "",
      deroule_pedagogique_url: "",
    });
    const r = resumeQuestionnaire(c.questionnaire);
    expect(r.find((l) => l.label === "Expérience")?.valeurs).toEqual(["5 à 10 ans"]);
    expect(resumeQuestionnaire(undefined)).toEqual([]);
  });
});

describe("complementProfil", () => {
  const cand = {
    ...versCandidature(complet, {
      cv_url: "public/abc123/cv-a.pdf",
      parcours_formation_url: "public/abc123/parcours-p.pdf",
      deroule_pedagogique_url: "public/abc123/deroule-d.pdf",
    }),
  };
  it("ne remplit que les champs vides", () => {
    const profil = {
      telephone: "07 00 00 00 00",
      expertise: null,
      siret: "",
      cv_url: null,
      secteur_activite: null,
      questionnaire: null,
    };
    const patch = complementProfil(profil, cand);
    expect(patch["telephone"]).toBeUndefined();
    expect(patch["expertise"]).toBe("Management & leadership, Œnologie");
    expect(patch["siret"]).toBe("35600000000048");
    expect(patch["cv_url"]).toBe("public/abc123/cv-a.pdf");
    expect(patch["secteur_activite"]).toBe("Management & leadership, Œnologie");
    expect(patch["questionnaire"]).toBeTruthy();
  });
  it("ignore les chemins de pièces étrangers au dépôt public", () => {
    const piegee = {
      ...cand,
      cv_url: "autre-uid/cv.pdf",
      deroule_pedagogique_url: "public/../x/cv-a.pdf",
    };
    const patch = complementProfil({ cv_url: null, deroule_pedagogique_url: null }, piegee);
    expect(patch["cv_url"]).toBeUndefined();
    expect(patch["deroule_pedagogique_url"]).toBeUndefined();
  });
  it("n'ajoute pas la colonne questionnaire si elle n'existe pas côté profil", () => {
    expect(complementProfil({ telephone: null }, cand)["questionnaire"]).toBeUndefined();
  });
  it("est idempotent", () => {
    const profil = { telephone: null, expertise: null, questionnaire: null };
    const patch = complementProfil(profil, cand);
    expect(complementProfil({ ...profil, ...patch }, cand)).toEqual({});
  });
});

describe("brouillon", () => {
  it("aller-retour sans perte et nettoyage", () => {
    const b = lireBrouillon(serialiserBrouillon(3, complet));
    expect(b?.etape).toBe(3);
    expect(b?.reponses.domaines).toEqual(complet.domaines);
    expect(brouillonUtile(b)).toBe(true);
    expect(lireBrouillon("{pas du json")).toBeNull();
    const pollue = lireBrouillon(
      JSON.stringify({ etape: 42, reponses: { domaines: ["x"], engagement: "oui" } }),
    );
    expect(pollue?.etape).toBe(NB_ETAPES - 1);
    expect(pollue?.reponses.domaines).toEqual([]);
    expect(pollue?.reponses.engagement).toBe(false);
    expect(brouillonUtile(pollue)).toBe(false);
  });
});
