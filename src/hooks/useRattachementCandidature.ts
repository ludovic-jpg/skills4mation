import { useEffect } from "react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { rattacherCandidature } from "@/lib/candidature.functions";

/**
 * À l'arrivée dans l'espace formateur : rattache la candidature déposée via /candidature
 * (avant création du compte) et complète le profil. Une seule tentative par session
 * navigateur ; tout échec est silencieux (le profil reste modifiable à la main).
 */
export function useRattachementCandidature() {
  const { user, role, refresh } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (!userId || role !== "formateur") return;
    const cle = `s4m-rattachement-${userId}`;
    try {
      if (window.sessionStorage.getItem(cle)) return;
      window.sessionStorage.setItem(cle, "1");
    } catch {
      /* sessionStorage indisponible : on tente quand même (la fonction est idempotente) */
    }
    rattacherCandidature()
      .then(async (res) => {
        if (!res.rattachee) return;
        if (res.champs.length) {
          await refresh();
          toast.success("Votre candidature est reliée à votre profil", {
            description: `Repris automatiquement : ${res.champs.join(", ")}.`,
          });
        }
      })
      .catch(() => {
        /* silencieux */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- une fois par utilisateur
  }, [userId, role]);
}
