import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  choisirCandidature,
  complementProfil,
  decisionRattachement,
  hacherJeton,
  motifEmailExact,
} from "@/lib/candidature-questionnaire";

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

export type ResultatRattachement = {
  /** aucune : pas de candidature libre pour cet e-mail vérifié ; rien : jeton absent ou faux. */
  statut: "complet" | "simple" | "rien" | "aucune";
  champs: string[];
};

const entreeSchema = z.object({ jeton: z.string().uuid().optional() });

/**
 * Rattache au compte connecté la candidature déposée via /candidature (insert anonyme).
 * Sécurité :
 *  - l'e-mail utilisé est celui du compte, lu côté serveur, et seulement s'il est vérifié ;
 *  - les données et pièces ne sont recopiées dans le profil QUE si le navigateur présente le
 *    jeton de réclamation dont l'empreinte SHA-256 a été enregistrée au dépôt : une candidature
 *    déposée par un tiers au nom de cet e-mail ne peut rien injecter dans le profil, et un
 *    compte créé par un tiers avec l'e-mail du candidat ne récupère ni données ni pièces ;
 *  - candidature ancienne (sans empreinte, ou colonne pas encore créée) : seul profile_id est
 *    posé, aucune copie (comportement dégradé) ;
 *  - rien n'est renvoyé au client hormis le statut et la liste des champs complétés.
 * Idempotente : un second appel ne trouve plus de candidature libre.
 */
export const rattacherCandidature = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => entreeSchema.parse(data ?? {}))
  .handler(async ({ data, context }): Promise<ResultatRattachement> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const aucune: ResultatRattachement = { statut: "aucune", champs: [] };

    // Fiche du compte lue côté serveur (source de vérité), à partir de l'identifiant déjà
    // vérifié par le middleware — jamais d'une valeur envoyée par le navigateur.
    const { data: auth, error: authError } = await supabaseAdmin.auth.admin.getUserById(
      context.userId,
    );
    const user = auth?.user;
    if (authError || !user) return aucune;
    const email = user.email?.trim().toLowerCase();
    if (!email || !user.email_confirmed_at) return aucune;

    const { data: libres } = await supabaseAdmin
      .from("candidatures")
      .select("*")
      .ilike("email", motifEmailExact(email))
      .is("profile_id", null)
      .order("created_at", { ascending: false })
      .limit(10);
    const hashFourni = data.jeton ? await hacherJeton(data.jeton) : null;
    const candidature = choisirCandidature(
      (libres ?? []) as unknown as { id: string; jeton_hash?: unknown; [cle: string]: unknown }[],
      hashFourni,
    );
    if (!candidature) return aucune;

    const decision = decisionRattachement(candidature["jeton_hash"], hashFourni);
    if (decision === "rien") return { statut: "rien", champs: [] };

    // Rattachement conditionnel (course entre deux onglets : un seul gagne).
    const { data: liee } = await supabaseAdmin
      .from("candidatures")
      .update({ profile_id: user.id })
      .eq("id", candidature.id)
      .is("profile_id", null)
      .select("id")
      .maybeSingle();
    if (!liee) return aucune;
    if (decision === "simple") return { statut: "simple", champs: [] };

    const { data: profil } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (!profil) return { statut: "complet", champs: [] };

    const patch = complementProfil(profil as unknown as Record<string, unknown>, candidature);

    // Pièces déposées sans compte (dossier « public/ », chemins filtrés par complementProfil) :
    // copie sous un nom unique dans le dossier du formateur (policy « own folder »).
    // Échec de copie : la pièce n'est pas reportée au profil.
    for (const [colonne, nom] of Object.entries(PIECES_STOCKAGE)) {
      const source = patch[colonne];
      if (typeof source !== "string") continue;
      const ext =
        source
          .split(".")
          .pop()
          ?.toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .slice(0, 5) || "pdf";
      const cible = `${user.id}/${nom}-cand-${candidature.id}.${ext}`;
      const { error } = await supabaseAdmin.storage.from("candidatures").copy(source, cible);
      if (error) delete patch[colonne];
      else patch[colonne] = cible;
    }

    if (Object.keys(patch).length === 0) return { statut: "complet", champs: [] };

    let { error } = await supabaseAdmin
      .from("profiles")
      .update(patch as never)
      .eq("id", user.id);
    if (error?.code === "42703" && "questionnaire" in patch) {
      // Colonne `questionnaire` pas encore créée : on enregistre le reste.
      delete patch["questionnaire"];
      ({ error } = await supabaseAdmin
        .from("profiles")
        .update(patch as never)
        .eq("id", user.id));
    }
    if (error) {
      console.error("[candidature] complément du profil impossible", error.message);
      return { statut: "complet", champs: [] };
    }
    return { statut: "complet", champs: Object.keys(patch).map((c) => LIBELLES[c] ?? c) };
  });
