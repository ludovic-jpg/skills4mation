/**
 * Génération PDF avec repli : Google Drive d'abord (rendu fidèle), puis
 * génération native @react-pdf/renderer si le connecteur est indisponible.
 * Server-only : ne jamais importer depuis du code client.
 */
import { Document, Page, StyleSheet, Text, renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";

const s = StyleSheet.create({
  page: { paddingVertical: 40, paddingHorizontal: 44, fontSize: 10, color: "#12181f" },
  title: { fontSize: 14, fontWeight: 700, color: "#0d2a4a", marginBottom: 14 },
  p: { marginBottom: 5, lineHeight: 1.5 },
});

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

/** PDF natif de repli à partir du texte du document. */
export async function pdfNatifDepuisHtml(html: string, titre: string): Promise<Uint8Array> {
  const lignes = htmlEnLignes(html);
  const doc = createElement(
    Document,
    null,
    createElement(
      Page,
      { size: "A4", style: s.page },
      createElement(Text, { style: s.title }, titre),
      ...lignes.map((ligne, index) => createElement(Text, { key: index, style: s.p }, ligne)),
    ),
  );
  const buffer = await renderToBuffer(doc as never);
  return new Uint8Array(buffer);
}

/**
 * Convertit un HTML en PDF : deux tentatives via Google Drive, puis repli natif.
 * L'échec du connecteur est journalisé explicitement pour alerte admin.
 */
export async function htmlToPdfAvecRepli(html: string, fileName: string): Promise<Uint8Array> {
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
  return pdfNatifDepuisHtml(html, fileName.replace(/\.pdf$/i, ""));
}
