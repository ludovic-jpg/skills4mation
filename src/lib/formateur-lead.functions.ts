import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  prenom: z.string().trim().min(1).max(80),
  nom: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(255),
  telephone: z.string().trim().max(30).optional().default(""),
  statut: z.string().trim().max(120).optional().default(""),
  expertise: z.string().trim().max(400).optional().default(""),
  experience: z.string().trim().max(120).optional().default(""),
  volume: z.string().trim().max(120).optional().default(""),
  qualiopi: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().max(1500).optional().default(""),
});

/** Notifie contact@skills4mation.com d'une nouvelle demande de portage Qualiopi. */
export const envoyerCandidatureFormateur = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    try {
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      await sendTemplateEmail("candidature-formateur", "contact@skills4mation.com", {
        templateData: data,
        idempotencyKey: `candidature-formateur-${data.email}-${Date.now()}`,
      });
      return { notifie: true };
    } catch (error) {
      console.error("[candidature-formateur] échec de notification", error);
      return { notifie: false };
    }
  });
