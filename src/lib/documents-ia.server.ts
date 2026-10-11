/**
 * Outils serveur de lecture des documents déposés pour l'IA (PDF, Word).
 * Server-only : compatible Cloudflare Workers (pas de fs, JSZip chargé à la demande).
 */

/** Taille maximale d'un document soumis à l'IA (octets). */
export const TAILLE_MAX_DOCUMENT_IA = 10 * 1024 * 1024;

/** Extrait le texte brut d'un .docx (zip OOXML) sans dépendance serveur supplémentaire. */
export async function texteDocx(bytes: Uint8Array): Promise<string> {
  const JSZip = (await import("jszip")).default;
  let zip: Awaited<ReturnType<typeof JSZip.loadAsync>>;
  try {
    zip = await JSZip.loadAsync(bytes);
  } catch {
    throw new Error("Document Word illisible : enregistrez-le au format .docx et réessayez.");
  }
  const xml = await zip.file("word/document.xml")?.async("string");
  if (!xml) throw new Error("Document Word illisible.");
  return xml
    .replace(/<w:tab\/>/g, "\t")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(Number.parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim()
    .slice(0, 60000);
}

/** Encode des octets en base64 sans dépendre de Buffer (Workers). */
export function enBase64(bytes: Uint8Array): string {
  let binaire = "";
  const pas = 0x8000;
  for (let i = 0; i < bytes.length; i += pas) {
    binaire += String.fromCharCode(...bytes.subarray(i, i + pas));
  }
  return btoa(binaire);
}
