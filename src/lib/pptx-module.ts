/**
 * Construction d'un fichier PowerPoint (.pptx) de module, DANS LE NAVIGATEUR.
 * `pptxgenjs` est chargé par import dynamique au moment de la génération : il ne
 * doit jamais être importé statiquement (SSR / Cloudflare Workers).
 *
 * Charte : fond blanc, bandeau et titres vert Skills4mation, accents jaunes,
 * titres 28–32 pt, puces ≥ 18 pt, numéro de diapositive et pied de page.
 */
import { CHARTE } from "@/lib/charte";
import { slugify } from "@/lib/formations";
import type { DeckModule, Diapositive, RoleDiapo } from "@/lib/supports-ia.functions";

const hex = (c: string) => c.replace("#", "");
const VERT = hex(CHARTE.vert);
const VERT_CLAIR = hex(CHARTE.vertClair);
const JAUNE = hex(CHARTE.jaune);
const TEXTE = hex(CHARTE.texte);
const GRIS = hex(CHARTE.gris);
const BORDURE = hex(CHARTE.bordure);
const FOND_DOUX = hex(CHARTE.fondDoux);
const BLANC = hex(CHARTE.blanc);
const POLICE = "Arial";

/** Dimensions du format 16:9 « LAYOUT_WIDE » (pouces). */
const L = 13.333;
const H = 7.5;
const MARGE = 0.7;

const ETIQUETTES: Record<RoleDiapo, string> = {
  titre: "Objectifs",
  accroche: "Pour commencer",
  contenu: "Contenu",
  activite: "Activité",
  synthese: "À retenir",
  questions: "Vérifions",
  transition: "Et ensuite",
};

export const PPTX_MIME =
  "application/vnd.openxmlformats-officedocument.presentationml.presentation";

/** `<formation>-module-<n>-<titre>.pptx`, en minuscules sans accents. */
export function nomFichierModule(
  deck: Pick<DeckModule, "formationTitre" | "moduleNumero" | "moduleTitre">,
) {
  const court = (v: string, n: number) => slugify(v).slice(0, n).replace(/-+$/g, "");
  return `${court(deck.formationTitre, 40)}-module-${deck.moduleNumero}-${court(deck.moduleTitre, 40)}.pptx`;
}

function tailleTitre(titre: string) {
  return titre.length > 70 ? 28 : titre.length > 45 ? 30 : 32;
}

function taillePuces(puces: string[]) {
  const total = puces.join(" ").length;
  return puces.length <= 4 && total < 220 ? 22 : puces.length <= 5 && total < 320 ? 20 : 18;
}

/** Génère le fichier .pptx d'un module et renvoie son contenu binaire. */
export async function construirePptxModule(deck: DeckModule): Promise<Blob> {
  const { default: PptxGenJS } = await import("pptxgenjs");
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Skills4mation";
  pptx.company = "Skills4mation";
  pptx.title = `${deck.formationTitre} — Module ${deck.moduleNumero} : ${deck.moduleTitre}`;
  pptx.subject = "Support de cours";
  pptx.theme = { headFontFace: POLICE, bodyFontFace: POLICE };

  const pied = `Skills4mation · ${deck.formationTitre}`;

  pptx.defineSlideMaster({
    title: "S4M_CONTENU",
    background: { color: BLANC },
    objects: [
      // Bandeau supérieur vert + liseré jaune.
      {
        rect: { x: 0, y: 0, w: L, h: 0.14, fill: { color: VERT }, line: { color: VERT, width: 0 } },
      },
      {
        rect: {
          x: 0,
          y: 0.14,
          w: L,
          h: 0.04,
          fill: { color: JAUNE },
          line: { color: JAUNE, width: 0 },
        },
      },
      // Pied de page.
      {
        line: {
          x: MARGE,
          y: H - 0.55,
          w: L - 2 * MARGE,
          h: 0,
          line: { color: BORDURE, width: 0.75 },
        },
      },
      {
        text: {
          text: pied,
          options: {
            x: MARGE,
            y: H - 0.5,
            w: L - 2 * MARGE - 1,
            h: 0.35,
            fontFace: POLICE,
            fontSize: 10,
            color: GRIS,
            valign: "middle",
          },
        },
      },
    ],
    slideNumber: {
      x: L - MARGE - 0.8,
      y: H - 0.5,
      w: 0.8,
      h: 0.35,
      fontFace: POLICE,
      fontSize: 10,
      color: VERT,
      bold: true,
      align: "right",
    },
  });

  pptx.defineSlideMaster({
    title: "S4M_TITRE",
    background: { color: BLANC },
    objects: [
      // Colonne verte à gauche, liseré jaune : élégant, sans fond sombre plein écran.
      {
        rect: { x: 0, y: 0, w: 0.45, h: H, fill: { color: VERT }, line: { color: VERT, width: 0 } },
      },
      {
        rect: {
          x: 0.45,
          y: 0,
          w: 0.08,
          h: H,
          fill: { color: JAUNE },
          line: { color: JAUNE, width: 0 },
        },
      },
      {
        text: {
          text: pied,
          options: {
            x: 1.1,
            y: H - 0.6,
            w: L - 2.2,
            h: 0.35,
            fontFace: POLICE,
            fontSize: 10,
            color: GRIS,
            valign: "middle",
          },
        },
      },
    ],
    slideNumber: {
      x: L - MARGE - 0.8,
      y: H - 0.6,
      w: 0.8,
      h: 0.35,
      fontFace: POLICE,
      fontSize: 10,
      color: VERT,
      bold: true,
      align: "right",
    },
  });

  for (const diapo of deck.diapositives) {
    if (diapo.role === "titre") ajouterDiapoTitre(pptx, deck, diapo);
    else ajouterDiapoContenu(pptx, deck, diapo);
  }

  return (await pptx.write({ outputType: "blob" })) as Blob;
}

type Pptx = InstanceType<typeof import("pptxgenjs").default>;

function ajouterDiapoTitre(pptx: Pptx, deck: DeckModule, diapo: Diapositive) {
  const slide = pptx.addSlide({ masterName: "S4M_TITRE" });
  const x = 1.1;
  const w = L - x - MARGE;
  slide.addText(`MODULE ${deck.moduleNumero} / ${deck.totalModules}`, {
    x,
    y: 0.75,
    w,
    h: 0.4,
    fontFace: POLICE,
    fontSize: 14,
    bold: true,
    color: VERT_CLAIR,
    charSpacing: 2,
  });
  slide.addText(deck.moduleTitre, {
    x,
    y: 1.15,
    w,
    h: 1.45,
    fontFace: POLICE,
    fontSize: deck.moduleTitre.length > 60 ? 32 : 40,
    bold: true,
    color: VERT,
    valign: "top",
    fit: "shrink",
  });
  slide.addShape("rect", {
    x,
    y: 2.75,
    w: 1.4,
    h: 0.07,
    fill: { color: JAUNE },
    line: { color: JAUNE, width: 0 },
  });
  slide.addText(deck.formationTitre, {
    x,
    y: 2.95,
    w,
    h: 0.5,
    fontFace: POLICE,
    fontSize: 18,
    color: GRIS,
    valign: "top",
  });

  if (diapo.puces.length) {
    slide.addShape("roundRect", {
      x,
      y: 3.75,
      w,
      h: 2.85,
      rectRadius: 0.12,
      fill: { color: FOND_DOUX },
      line: { color: BORDURE, width: 0.75 },
    });
    slide.addText("Objectifs du module", {
      x: x + 0.35,
      y: 3.9,
      w: w - 0.7,
      h: 0.45,
      fontFace: POLICE,
      fontSize: 16,
      bold: true,
      color: VERT,
    });
    slide.addText(
      diapo.puces.map((p) => ({
        text: p,
        options: { bullet: { code: "25B8" }, paraSpaceAfter: 6 },
      })),
      {
        x: x + 0.35,
        y: 4.4,
        w: w - 0.7,
        h: 2.1,
        fontFace: POLICE,
        fontSize: 18,
        color: TEXTE,
        valign: "top",
        fit: "shrink",
      },
    );
  }
  if (diapo.notes) slide.addNotes(diapo.notes);
}

function ajouterDiapoContenu(pptx: Pptx, deck: DeckModule, diapo: Diapositive) {
  const slide = pptx.addSlide({ masterName: "S4M_CONTENU" });
  const w = L - 2 * MARGE;
  const etiquette = ETIQUETTES[diapo.role];
  const mis_en_avant = diapo.role === "activite" || diapo.role === "questions";

  // Sur-titre : module + nature de la diapositive (pastille jaune pour les temps actifs).
  if (mis_en_avant) {
    slide.addText(etiquette.toUpperCase(), {
      shape: "roundRect",
      rectRadius: 0.1,
      x: MARGE,
      y: 0.45,
      w: 1.8,
      h: 0.36,
      fill: { color: JAUNE },
      fontFace: POLICE,
      fontSize: 11,
      bold: true,
      color: TEXTE,
      align: "center",
      valign: "middle",
      charSpacing: 1,
    });
    slide.addText(`Module ${deck.moduleNumero}`, {
      x: MARGE + 1.95,
      y: 0.45,
      w: 4,
      h: 0.36,
      fontFace: POLICE,
      fontSize: 11,
      color: GRIS,
      valign: "middle",
    });
  } else {
    slide.addText(`MODULE ${deck.moduleNumero} · ${etiquette.toUpperCase()}`, {
      x: MARGE,
      y: 0.45,
      w,
      h: 0.36,
      fontFace: POLICE,
      fontSize: 11,
      bold: true,
      color: VERT_CLAIR,
      valign: "middle",
      charSpacing: 1,
    });
  }

  slide.addText(diapo.titre, {
    x: MARGE,
    y: 0.85,
    w,
    h: 1.1,
    fontFace: POLICE,
    fontSize: tailleTitre(diapo.titre),
    bold: true,
    color: VERT,
    valign: "middle",
    fit: "shrink",
  });
  slide.addShape("rect", {
    x: MARGE,
    y: 2.0,
    w: 1.1,
    h: 0.06,
    fill: { color: JAUNE },
    line: { color: JAUNE, width: 0 },
  });

  const zone = { x: MARGE, y: 2.3, w, h: H - 2.3 - 0.75 };
  const taille = taillePuces(diapo.puces);

  if (diapo.role === "accroche" || diapo.role === "transition") {
    // Encadré doux avec liseré jaune : un temps de respiration, pas une liste dense.
    slide.addShape("rect", {
      ...zone,
      fill: { color: FOND_DOUX },
      line: { color: FOND_DOUX, width: 0 },
    });
    slide.addShape("rect", {
      x: zone.x,
      y: zone.y,
      w: 0.1,
      h: zone.h,
      fill: { color: JAUNE },
      line: { color: JAUNE, width: 0 },
    });
    slide.addText(
      diapo.puces.map((p) => ({ text: p, options: { breakLine: true, paraSpaceAfter: 10 } })),
      {
        x: zone.x + 0.5,
        y: zone.y + 0.3,
        w: zone.w - 0.9,
        h: zone.h - 0.6,
        fontFace: POLICE,
        fontSize: Math.max(taille, 22),
        color: TEXTE,
        valign: "middle",
        fit: "shrink",
      },
    );
  } else if (diapo.puces.length) {
    const numerotee = diapo.role === "questions" || diapo.role === "activite";
    slide.addText(
      diapo.puces.map((p) => ({
        text: p,
        options: {
          bullet: numerotee ? { type: "number" as const } : { code: "25A0", indent: 22 },
          paraSpaceAfter: 10,
        },
      })),
      { ...zone, fontFace: POLICE, fontSize: taille, color: TEXTE, valign: "top", fit: "shrink" },
    );
  }

  if (diapo.notes) slide.addNotes(diapo.notes);
}
