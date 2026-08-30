import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  candidatureId: z.string().uuid(),
  redirectTo: z.string().url(),
});

/**
 * Valide une candidature ET donne l'accès à l'espace formateur :
 * création (ou réutilisation) du compte, rôle "formateur", profil validé.
 */
export const validerCandidatureEtDonnerAcces = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: roles, error: rolesError } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin");
    if (rolesError) throw new Error("Vérification des droits impossible.");
    if (!roles || roles.length === 0) throw new Error("Accès réservé aux administrateurs.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: candidature, error: candidatureError } = await supabaseAdmin
      .from("candidatures")
      .select("id, email, prenom, nom, telephone, siret, adresse, numero_nda, date_naissance")
      .eq("id", data.candidatureId)
      .maybeSingle();
    if (candidatureError || !candidature) throw new Error("Candidature introuvable.");

    const email = String(candidature.email).trim().toLowerCase();

    // Compte existant ?
    let userId: string | null = null;
    const { data: existing } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    userId = existing?.users.find((u) => (u.email ?? "").toLowerCase() === email)?.id ?? null;

    let invited = false;
    if (!userId) {
      const { data: invite, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        email,
        {
          redirectTo: data.redirectTo,
          data: { prenom: candidature.prenom, nom: candidature.nom },
        },
      );
      if (inviteError || !invite?.user) {
        throw new Error("Impossible d'envoyer l'invitation à ce formateur.");
      }
      userId = invite.user.id;
      invited = true;
    }

    await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        email,
        prenom: candidature.prenom,
        nom: candidature.nom,
        telephone: candidature.telephone,
        siret: candidature.siret,
        adresse: candidature.adresse,
        numero_nda: candidature.numero_nda,
        date_naissance: candidature.date_naissance,
        statut_candidature: "valide",
      },
      { onConflict: "id" },
    );

    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "formateur" }, { onConflict: "user_id,role" });

    await supabaseAdmin
      .from("candidatures")
      .update({ statut: "valide", traitee_at: new Date().toISOString(), profile_id: userId })
      .eq("id", data.candidatureId);

    return { ok: true as const, invited, email };
  });
