import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { complementProfil, motifEmailExact } from "@/lib/candidature-questionnaire";

const LIBELLES: Record<string, string> = {
  telephone: "téléphone",
  expertise: "expertise",
  entreprise: "raison sociale",
  entreprise_adresse: "adresse de l'entreprise",
  siret: "SIRET",
  numero_nda: "numéro de déclaration d'activité",
  nda_region: "région de la déclaration",
  linkedin_url: "LinkedIn",
  cv_url: "CV",
  parcours_formation_url: "parcours de formation",
  deroule_pedagogique_url: "déroulé pédagogique",
  secteur_activite: "domaines",
  questionnaire: "profil formateur",
};

const PIECES_STOCKAGE: Record<string, string> = {
  cv_url: "cv",
  parcours_formation_url: "parcours",
  deroule_pedagogique_url: "deroule",
};

export type ResultatRattachement = { rattachee: boolean; champs: string[] };

/**
 * Rattache au compte connecté la candidature déposée via /candidature (insert anonyme),
 * puis complète les champs VIDES de son profil. Sécurité :
 *  - l'e-mail utilisé est celui du compte, et seulement s'il est vérifié (confirmation e-mail
 *    ou fournisseur OAuth) : impossible de « capter » la candidature de quelqu'un d'autre ;
 *  - seule la candidature la plus récente non rattachée (profile_id IS NULL) est concernée ;
 *  - rien n'est renvoyé au client hormis la liste des champs complétés.
 * Idempotente : un second appel ne trouve plus de candidature libre.
 */
export const rattacherCandidature = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ResultatRattachement> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Fiche du compte lue côté serveur (source de vérité), à partir de l'identifiant du jeton
    // déjà vérifié par le middleware — jamais d'une valeur envoyée par le navigateur.
    const { data: auth, error: authError } = await supabaseAdmin.auth.admin.getUserById(
      context.userId,
    );
    const user = auth?.user;
    if (authError || !user) return { rattachee: false, champs: [] };
    const email = user.email?.trim().toLowerCase();
    if (!email || !user.email_confirmed_at) return { rattachee: false, champs: [] };

    const { data: candidature } = await supabaseAdmin
      .from("candidatures")
      .select("*")
      .ilike("email", motifEmailExact(email))
      .is("profile_id", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!candidature) return { rattachee: false, champs: [] };

    // Rattachement conditionnel (course entre deux onglets : un seul gagne).
    const { data: liee } = await supabaseAdmin
      .from("candidatures")
      .update({ profile_id: user.id })
      .eq("id", candidature.id)
      .is("profile_id", null)
      .select("id")
      .maybeSingle();
    if (!liee) return { rattachee: false, champs: [] };

    const { data: profil } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (!profil) return { rattachee: true, champs: [] };

    const patch = complementProfil(
      profil as unknown as Record<string, unknown>,
      candidature as unknown as Record<string, unknown>,
    );

    // Pièces déposées sans compte (dossier « public/ ») : copie dans le dossier du formateur
    // pour qu'il puisse les consulter depuis son profil (policy « own folder »).
    for (const [colonne, nom] of Object.entries(PIECES_STOCKAGE)) {
      const source = patch[colonne];
      if (typeof source !== "string" || !source.startsWith("public/")) continue;
      const ext =
        source
          .split(".")
          .pop()
          ?.toLowerCase()
          .replace(/[^a-z0-9]/g, "") || "pdf";
      const cible = `${user.id}/${nom}.${ext}`;
      const { error } = await supabaseAdmin.storage.from("candidatures").copy(source, cible);
      // En cas d'échec (fichier déjà présent…), le chemin d'origine reste lisible par l'équipe.
      if (!error) patch[colonne] = cible;
    }

    if (Object.keys(patch).length === 0) return { rattachee: true, champs: [] };

    let { error } = await supabaseAdmin
      .from("profiles")
      .update(patch as never)
      .eq("id", user.id);
    if (error?.code === "42703" && "questionnaire" in patch) {
      // Colonne `questionnaire` pas encore créée : on enregistre le reste.
      const { questionnaire: _ignore, ...reste } = patch;
      void _ignore;
      ({ error } = await supabaseAdmin
        .from("profiles")
        .update(reste as never)
        .eq("id", user.id));
      delete patch["questionnaire"];
    }
    if (error) {
      console.error("[candidature] complément du profil impossible", error.message);
      return { rattachee: true, champs: [] };
    }
    return { rattachee: true, champs: Object.keys(patch).map((c) => LIBELLES[c] ?? c) };
  });
