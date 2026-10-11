import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  analyseSaisie,
  normaliseReponse,
  reponseRechercheSchema,
  type EntrepriseTrouvee,
} from "@/lib/entreprises";

const API = "https://recherche-entreprises.api.gouv.fr/search";

/** Saisie strictement bornée : SIRET/SIREN (chiffres, espaces, points) ou nom d'entreprise. */
const entreeSchema = z.object({
  q: z
    .string()
    .trim()
    .min(3)
    .max(120)
    .regex(/^[\p{L}\p{N}\s.,'’&()\-/]+$/u, "Recherche invalide."),
});

export type ResultatRechercheEntreprise =
  { ok: true; resultats: EntrepriseTrouvee[] } | { ok: false; message: string };

/**
 * Interroge l'API publique « Recherche d'entreprises » (sans clé) et renvoie des suggestions
 * normalisées. Les erreurs réseau sont renvoyées sous forme de message (jamais levées) :
 * côté formulaire, la saisie manuelle reste toujours possible.
 */
async function rechercher(q: string): Promise<ResultatRechercheEntreprise> {
  const recherche = analyseSaisie(q);
  if (recherche.type === "invalide") return { ok: false, message: recherche.message };
  if (recherche.type === "incomplet") return { ok: true, resultats: [] };

  const params = new URLSearchParams({
    q: recherche.q,
    page: "1",
    per_page: recherche.type === "nom" ? "6" : "1",
    limite_matching_etablissements: recherche.type === "siren" ? "20" : "10",
  });

  let res: Response;
  try {
    res = await fetch(`${API}?${params.toString()}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Skills4mation/1.0 (saisie assistee SIRET; +https://skills4mation.com)",
      },
      signal: AbortSignal.timeout(6000),
    });
  } catch (e) {
    const timeout = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError");
    return {
      ok: false,
      message: timeout
        ? "Le service de l'INSEE ne répond pas. Vous pouvez saisir les informations manuellement."
        : "Recherche d'entreprise indisponible. Vous pouvez saisir les informations manuellement.",
    };
  }

  if (res.status === 429) {
    return {
      ok: false,
      message: "Trop de recherches simultanées. Réessayez dans quelques secondes.",
    };
  }
  if (!res.ok) {
    // 400 : requête refusée par l'API (ex. terme trop court) — pas de résultat.
    if (res.status === 400) return { ok: true, resultats: [] };
    return {
      ok: false,
      message:
        "Recherche d'entreprise indisponible. Vous pouvez saisir les informations manuellement.",
    };
  }

  const json: unknown = await res.json().catch(() => null);
  const parsed = reponseRechercheSchema.safeParse(json);
  if (!parsed.success) {
    console.error("[entreprises] réponse inattendue de l'API", parsed.error.issues.slice(0, 3));
    return { ok: false, message: "Réponse inattendue du service de recherche d'entreprises." };
  }
  return { ok: true, resultats: normaliseReponse(parsed.data, recherche) };
}

/** Recherche d'entreprise pour un utilisateur connecté (profil, dossiers). */
export const rechercherEntreprise = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => entreeSchema.parse(data))
  .handler(async ({ data }) => rechercher(data.q));

/**
 * Variante publique (formulaires du site sans compte) : mêmes contrôles stricts de la saisie,
 * aucune donnée interne exposée — uniquement le relais de l'API ouverte de l'État.
 */
export const rechercherEntreprisePublique = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => entreeSchema.parse(data))
  .handler(async ({ data }) => rechercher(data.q));
