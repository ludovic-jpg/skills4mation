import { supabase } from "@/integrations/supabase/client";

/**
 * Dépose un support de cours « générique » du formateur (indépendant d'un dossier) :
 * fichier dans le bucket `documents`, ligne dans `supports_pedagogiques`, puis
 * partage éventuel avec des apprenants précis (`supports_apprenants`).
 */
export async function deposerSupportGenerique({
  formateurId,
  fichier,
  titre,
  formationId,
  apprenantIds = [],
}: {
  formateurId: string;
  fichier: File | Blob;
  titre: string;
  formationId: string | null;
  apprenantIds?: string[];
}): Promise<string> {
  const nom = fichier instanceof File ? fichier.name : "";
  const ext =
    (nom.includes(".") ? nom.split(".").pop() : "")?.toLowerCase() ||
    extensionDepuisType(fichier.type);
  const path = `supports/generiques/${formateurId}/${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("documents")
    .upload(path, fichier, { upsert: true, contentType: fichier.type || "application/pdf" });
  if (upErr) throw new Error("Dépôt du fichier impossible.");

  const { data: inserted, error } = await supabase
    .from("supports_pedagogiques")
    .insert({
      dossier_id: null,
      formateur_id: formateurId,
      formation_id: formationId,
      titre: titre.trim() || nom || "Support de cours",
      type: ext === "pdf" ? "pdf" : "autre",
      fichier_url: path,
    })
    .select("id")
    .single();
  if (error || !inserted) throw new Error("Enregistrement impossible.");

  if (apprenantIds.length > 0) {
    const { error: linkErr } = await supabase
      .from("supports_apprenants")
      .insert(apprenantIds.map((apprenant_id) => ({ support_id: inserted.id, apprenant_id })));
    if (linkErr) throw new Error("Partage avec les apprenants impossible.");
  }
  return inserted.id;
}

function extensionDepuisType(type: string) {
  if (type.includes("presentationml")) return "pptx";
  if (type === "application/pdf") return "pdf";
  return "bin";
}
