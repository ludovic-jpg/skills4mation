/**
 * Génération PDF avec repli : Google Drive d'abord (rendu fidèle), puis
 * génération native pdf-lib (compatible Cloudflare Workers) si le connecteur est indisponible.
 * Server-only : ne jamais importer depuis du code client.
 */
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { CHARTE } from "./charte";

// pdf-lib plutôt que @react-pdf/renderer côté serveur : pdfkit (embarqué par
// React-PDF) construit au chargement une URL depuis import.meta.url et lit ses
// polices sur disque, ce que Cloudflare Workers refuse (« Invalid URL string »).
// pdf-lib est en JavaScript pur avec polices standard intégrées.

const A4 = { largeur: 595.28, hauteur: 841.89 };
const MARGE_X = 44;
const MARGE_Y = 40;
const TAILLE_TEXTE = 10;
const TAILLE_TITRE = 14;
const INTERLIGNE = 1.5;

function couleur(hex: string) {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

/** Les polices standard PDF n'encodent que WinAnsi : on remplace le reste. */
function versWinAnsi(texte: string, police: PDFFont): string {
  const normalise = texte
    .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u00AB\u00BB]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, "-")
    .replace(/[\u2022\u25CF\u25AA\u2023]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[\u00A0\u202F\u2009]/g, " ");
  let sortie = "";
  for (const caractere of normalise) {
    try {
      police.encodeText(caractere);
      sortie += caractere;
    } catch {
      sortie += caractere.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === caractere
        ? "?"
        : caractere.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
  }
  return sortie;
}

/** Découpe une ligne en segments qui tiennent dans la largeur utile. */
function couper(ligne: string, police: PDFFont, taille: number, largeur: number): string[] {
  const mots = ligne.split(" ");
  const lignes: string[] = [];
  let courante = "";
  for (const mot of mots) {
    const essai = courante ? `${courante} ${mot}` : mot;
    if (police.widthOfTextAtSize(essai, taille) <= largeur) {
      courante = essai;
      continue;
    }
    if (courante) lignes.push(courante);
    // Mot plus long que la ligne (URL, référence) : coupure caractère par caractère.
    let reste = mot;
    while (police.widthOfTextAtSize(reste, taille) > largeur && reste.length > 1) {
      let i = reste.length - 1;
      while (i > 1 && police.widthOfTextAtSize(reste.slice(0, i), taille) > largeur) i -= 1;
      lignes.push(reste.slice(0, i));
      reste = reste.slice(i);
    }
    courante = reste;
  }
  if (courante) lignes.push(courante);
  return lignes.length ? lignes : [""];
}

/** Extrait le texte lisible d'un document HTML (repli sans moteur de rendu). */
export function htmlEnLignes(html: string): string[] {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>(?=)/gi, "\n")
    .replace(/<\/(p|div|tr|h1|h2|h3|li|table|section)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean);
}

/** PDF natif de repli à partir du texte du document (compatible Cloudflare Workers). */
export async function pdfNatifDepuisHtml(html: string, titre: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(titre);
  const police = await doc.embedFont(StandardFonts.Helvetica);
  const gras = await doc.embedFont(StandardFonts.HelveticaBold);
  const largeurUtile = A4.largeur - 2 * MARGE_X;

  let page = doc.addPage([A4.largeur, A4.hauteur]);
  let y = A4.hauteur - MARGE_Y;
  const nouvellePageSiBesoin = (hauteur: number) => {
    if (y - hauteur < MARGE_Y) {
      page = doc.addPage([A4.largeur, A4.hauteur]);
      y = A4.hauteur - MARGE_Y;
    }
  };

  for (const segment of couper(versWinAnsi(titre, gras), gras, TAILLE_TITRE, largeurUtile)) {
    nouvellePageSiBesoin(TAILLE_TITRE * INTERLIGNE);
    y -= TAILLE_TITRE;
    page.drawText(segment, { x: MARGE_X, y, size: TAILLE_TITRE, font: gras, color: couleur(CHARTE.vert) });
    y -= TAILLE_TITRE * (INTERLIGNE - 1);
  }
  y -= 14;

  for (const ligne of htmlEnLignes(html)) {
    for (const segment of couper(versWinAnsi(ligne, police), police, TAILLE_TEXTE, largeurUtile)) {
      nouvellePageSiBesoin(TAILLE_TEXTE * INTERLIGNE);
      y -= TAILLE_TEXTE;
      page.drawText(segment, { x: MARGE_X, y, size: TAILLE_TEXTE, font: police, color: couleur(CHARTE.texte) });
      y -= TAILLE_TEXTE * (INTERLIGNE - 1);
    }
    y -= 5;
  }

  return doc.save();
}

/**
 * Convertit un HTML en PDF : deux tentatives via Google Drive, puis repli natif.
 * L'échec du connecteur est journalisé explicitement pour alerte admin, et le
 * callback optionnel `onDegrade` permet à l'appelant de propager l'information
 * jusqu'à l'interface (au lieu de la laisser uniquement dans les logs serveur) —
 * paramètre additif : les appels existants à deux arguments ne changent pas.
 */
export async function htmlToPdfAvecRepli(
  html: string,
  fileName: string,
  options?: { onDegrade?: () => void },
): Promise<Uint8Array> {
  const { htmlToPdf } = await import("@/lib/drive.server");
  for (let tentative = 1; tentative <= 2; tentative += 1) {
    try {
      return await htmlToPdf(html, fileName);
    } catch (error) {
      console.error(
        `[pdf] Google Drive htmlToPdf a échoué (tentative ${tentative}/2) pour ${fileName}:`,
        error,
      );
    }
  }
  console.error(
    `[pdf] ALERTE ADMIN — repli PDF natif utilisé pour ${fileName} : le connecteur Google Drive est indisponible.`,
  );
  options?.onDegrade?.();
  return pdfNatifDepuisHtml(html, fileName.replace(/\.pdf$/i, ""));
}
