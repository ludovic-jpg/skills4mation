import { useEffect } from "react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { CLE_JETON, PARAM_JETON, jetonValide } from "@/lib/candidature-questionnaire";
import { rattacherCandidature } from "@/lib/candidature.functions";

/** Évite deux appels simultanés (double montage en mode strict, onglets rapides). */
let enCours = false;

function lireJeton(): string | undefined {
  try {
    const url = new URLSearchParams(window.location.search).get(PARAM_JETON);
    if (jetonValide(url)) return url;
  } catch {
    /* URL illisible */
  }
  try {
    const local = window.localStorage.getItem(CLE_JETON);
    if (jetonValide(local)) return local;
  } catch {
    /* stockage indisponible */
  }
  return undefined;
}

function oublierJeton() {
  try {
    window.localStorage.removeItem(CLE_JETON);
  } catch {
    /* stockage indisponible */
  }
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has(PARAM_JETON)) {
      url.searchParams.delete(PARAM_JETON);
      window.history.replaceState(window.history.state, "", url.toString());
    }
  } catch {
    /* sans effet */
  }
}

/**
 * À l'arrivée dans l'espace formateur : rattache la candidature déposée via /candidature
 * (avant création du compte). Le jeton de réclamation (URL de retour ou localStorage) est
 * requis pour recopier données et pièces dans le profil. Une tentative concluante par session ;
 * tout échec est silencieux (le profil reste modifiable à la main).
 */
export function useRattachementCandidature() {
  const { user, role, refresh } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (!userId || role !== "formateur" || enCours) return;
    const cle = `s4m-rattachement-${userId}`;
    const jeton = lireJeton();
    try {
      // Déjà traité dans cette session, sauf si un nouveau jeton arrive par l'URL.
      if (window.sessionStorage.getItem(cle) && !jeton) return;
    } catch {
      /* sessionStorage indisponible : la fonction est idempotente */
    }
    enCours = true;
    rattacherCandidature({ data: jeton ? { jeton } : {} })
      .then(async (res) => {
        if (res.statut !== "rien") {
          try {
            window.sessionStorage.setItem(cle, "1");
          } catch {
            /* sans effet */
          }
        }
        if (res.statut === "complet" || res.statut === "simple") oublierJeton();
        if (res.champs.length) {
          await refresh();
          toast.success("Votre candidature est reliée à votre profil", {
            description: `Repris automatiquement : ${res.champs.join(", ")}.`,
          });
        }
      })
      .catch(() => {
        /* silencieux */
      })
      .finally(() => {
        enCours = false;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- une fois par utilisateur
  }, [userId, role]);
}
