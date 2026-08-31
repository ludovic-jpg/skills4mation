/**
 * Signature électronique simple : empreinte du fichier déposé, horodatage
 * et certificat récapitulatif de la preuve de consentement.
 */

export type PreuveSignature = {
  code: string;
  label: string;
  signataire: string;
  email?: string | null;
  signatureUserId: string;
  signatureDate: string;
  hash: string;
  fichierNom: string;
  dossierLabel: string;
};

/** Empreinte SHA-256 (hexadécimal minuscule) du contenu binaire fourni. */
export async function sha256Hex(bytes: ArrayBuffer | Uint8Array): Promise<string> {
  const buffer =
    bytes instanceof Uint8Array
      ? bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
      : bytes;
  const digest = await crypto.subtle.digest("SHA-256", buffer as ArrayBuffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Horodatage lisible en français (fuseau Europe/Paris). */
export function horodatageFr(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "medium",
    timeZone: "Europe/Paris",
  }).format(date);
}

/** Nom d'archivage du certificat associé à un document signé. */
export function certificatFileName(baseName: string) {
  return `${baseName.replace(/\.(pdf|png|jpe?g)$/i, "")}_CERTIFICAT.pdf`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Certificat HTML récapitulatif (qui a signé, quand, empreinte du fichier). */
export function certificatSignatureHtml(preuve: PreuveSignature) {
  const lignes: Array<[string, string]> = [
    ["Document", `${preuve.code} — ${preuve.label}`],
    ["Dossier de formation", preuve.dossierLabel],
    ["Signataire", preuve.signataire],
    ["Adresse e-mail", preuve.email ?? "—"],
    ["Identifiant utilisateur", preuve.signatureUserId],
    ["Date et heure de signature", horodatageFr(preuve.signatureDate)],
    ["Horodatage UTC", preuve.signatureDate],
    ["Fichier déposé", preuve.fichierNom],
    ["Empreinte SHA-256", preuve.hash],
  ];

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8" />
<title>Certificat de signature électronique</title>
<style>
  body { font-family: Helvetica, Arial, sans-serif; color: #12181f; padding: 40px; }
  h1 { color: #0d2a4a; font-size: 20px; text-transform: uppercase; }
  .rule { height: 3px; background: #4f8f2f; margin: 10px 0 22px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  td { border: 1px solid #dbe1e8; padding: 8px 10px; vertical-align: top; }
  td.k { width: 220px; color: #5b6472; background: #f4f7fa; }
  td.v { font-weight: 700; word-break: break-all; }
  p.mention { margin-top: 22px; font-size: 11px; line-height: 1.6; color: #5b6472; }
</style></head>
<body>
  <h1>Certificat de signature électronique</h1>
  <div class="rule"></div>
  <table>
    ${lignes
      .map(([k, v]) => `<tr><td class="k">${escapeHtml(k)}</td><td class="v">${escapeHtml(v)}</td></tr>`)
      .join("\n    ")}
  </table>
  <p class="mention">
    Le signataire a coché la mention « Je certifie avoir pris connaissance de ce document et j'y appose
    ma signature électronique » avant le dépôt du fichier. L'empreinte SHA-256 ci-dessus garantit
    l'intégrité du fichier archivé : toute modification ultérieure produirait une empreinte différente.
    Certificat émis automatiquement par Skills4mation.
  </p>
</body></html>`;
}
