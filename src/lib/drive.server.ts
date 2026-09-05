/**
 * Archivage Google Drive via le connecteur Lovable (Drive de Skills4mation).
 * Server-only : ne jamais importer depuis du code client.
 */
const GATEWAY = "https://connector-gateway.lovable.dev/google_drive";
const FOLDER_MIME = "application/vnd.google-apps.folder";
const DOC_MIME = "application/vnd.google-apps.document";

function headers() {
  const lovable = process.env["LOVABLE_API_KEY"];
  const drive = process.env["GOOGLE_DRIVE_API_KEY"];
  if (!lovable || !drive) throw new Error("Connecteur Google Drive non configuré.");
  return {
    Authorization: `Bearer ${lovable}`,
    "X-Connection-Api-Key": drive,
  };
}

async function driveFetch(path: string, init?: RequestInit) {
  if (!path.startsWith("/") || /[\u0000-\u001F\u007F]/.test(path)) {
    throw new Error("Connecteur Google Drive : chemin de requête invalide.");
  }

  let url: URL;
  try {
    url = new URL(`${GATEWAY}${path}`);
  } catch (error) {
    console.error("[drive] URL de connecteur invalide", { path, error });
    throw new Error("Connecteur Google Drive indisponible : URL de requête invalide.");
  }

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { ...headers(), ...(init?.headers ?? {}) },
    });
  } catch (error) {
    console.error(`[drive] ${init?.method ?? "GET"} ${path} -> erreur réseau`, error);
    throw new Error(
      "Connexion à Google Drive impossible. Vérifiez la connexion Google Drive puis réessayez.",
    );
  }
  if (!res.ok) {
    const body = await res.text();
    console.error(`[drive] ${init?.method ?? "GET"} ${path} -> ${res.status}: ${body}`);
    throw new Error(
      `Google Drive a refusé la requête [${res.status}]. Vérifiez la connexion Google Drive puis réessayez.`,
    );
  }
  return res;
}

function requireDriveId(value: unknown, contexte: string): string {
  if (typeof value !== "string" || !value.trim() || !/^[A-Za-z0-9_-]+$/.test(value)) {
    console.error(`[drive] identifiant absent ou invalide (${contexte})`);
    throw new Error(
      "Google Drive a renvoyé une réponse invalide. Vérifiez la connexion Google Drive puis réessayez.",
    );
  }
  return value;
}

function escapeQuery(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

/** Trouve ou crée un dossier Drive (idempotent). */
export async function ensureFolder(name: string, parentId?: string | null): Promise<string> {
  const clauses = [
    `mimeType='${FOLDER_MIME}'`,
    `name='${escapeQuery(name)}'`,
    "trashed=false",
    parentId ? `'${escapeQuery(parentId)}' in parents` : null,
  ].filter(Boolean);
  const q = encodeURIComponent(clauses.join(" and "));
  const found = await driveFetch(`/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=1`);
  const list = (await found.json()) as { files?: Array<{ id: string }> };
  if (list.files?.[0]?.id) return list.files[0].id;

  const created = await driveFetch(`/drive/v3/files?fields=id`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      mimeType: FOLDER_MIME,
      ...(parentId ? { parents: [parentId] } : {}),
    }),
  });
  const doc = (await created.json()) as { id?: unknown };
  return requireDriveId(doc.id, `création du dossier « ${name} »`);
}

function multipartBody(metadata: unknown, contentType: string, content: Uint8Array) {
  const boundary = `s4m${Math.random().toString(36).slice(2)}`;
  const encoder = new TextEncoder();
  const head = encoder.encode(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
      metadata,
    )}\r\n--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`,
  );
  const tail = encoder.encode(`\r\n--${boundary}--`);
  const body = new Uint8Array(head.length + content.length + tail.length);
  body.set(head, 0);
  body.set(content, head.length);
  body.set(tail, head.length + content.length);
  return { body, boundary };
}

async function uploadRaw(
  metadata: Record<string, unknown>,
  contentType: string,
  content: Uint8Array,
  convertTo?: string,
) {
  const { body, boundary } = multipartBody(
    convertTo ? { ...metadata, mimeType: convertTo } : metadata,
    contentType,
    content,
  );
  const res = await driveFetch(
    `/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink`,
    {
      method: "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body,
    },
  );
  const uploaded = (await res.json()) as { id?: unknown; webViewLink?: unknown };
  return {
    id: requireDriveId(uploaded.id, "téléversement du fichier"),
    webViewLink: typeof uploaded.webViewLink === "string" ? uploaded.webViewLink : undefined,
  };
}

/** Convertit un document HTML en PDF via Google Docs, puis renvoie les octets. */
export async function htmlToPdf(html: string, name: string): Promise<Uint8Array> {
  const temp = await uploadRaw({ name: `~tmp-${name}` }, "text/html", new TextEncoder().encode(html), DOC_MIME);
  try {
    const exported = await driveFetch(
      `/drive/v3/files/${temp.id}/export?mimeType=${encodeURIComponent("application/pdf")}`,
    );
    return new Uint8Array(await exported.arrayBuffer());
  } finally {
    await driveFetch(`/drive/v3/files/${temp.id}`, { method: "DELETE" }).catch(() => undefined);
  }
}

/** Dépose un fichier binaire dans un dossier Drive. */
export async function uploadToFolder(
  name: string,
  contentType: string,
  content: Uint8Array,
  parentId: string,
) {
  return uploadRaw(
    { name, parents: [requireDriveId(parentId, "dossier de destination")] },
    contentType,
    content,
  );
}

/**
 * Arborescence d'archivage : Skills4mation › Dossiers Formation › [Dossier] › [Apprenant]
 */
export async function ensureDossierTree(dossierLabel: string, apprenantLabel?: string) {
  const racine = await ensureFolder("Skills4mation");
  const dossiers = await ensureFolder("Dossiers Formation", racine);
  const dossier = await ensureFolder(dossierLabel, dossiers);
  const cible = apprenantLabel ? await ensureFolder(apprenantLabel, dossier) : dossier;
  return { dossierFolderId: dossier, targetFolderId: cible };
}

export function folderUrl(id: string) {
  return `https://drive.google.com/drive/folders/${requireDriveId(id, "lien du dossier")}`;
}
