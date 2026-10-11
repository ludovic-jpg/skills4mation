import { supabase } from '@/integrations/supabase/client';

export const GUIDE = {
  id: 'portage-qualiopi-octobre-2026',
  titre: 'Portage Qualiopi : le guide complet du formateur indépendant',
  pages: 30,
  bucket: 'ressources-privees',
  fichier: 'livre-blanc-portage-qualiopi-octobre-2026.pdf',
  expiration: 300,
} as const;
export const CONSENT_KEY = 'skills4mation-ressources-consent';
export function lireConsentementEnAttente(raw: string | null, maintenant = Date.now()): boolean | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || !('consent' in value) || !('date' in value)) return null;
    if (typeof value.consent !== 'boolean' || typeof value.date !== 'number') return null;
    if (maintenant - value.date > 60 * 60 * 1000 || value.date > maintenant) return null;
    return value.consent;
  } catch { return null; }
}
export async function enregistrerConsentement(userId: string, consent: boolean) {
  const { error } = await supabase.from('ressource_consentements').upsert({ user_id: userId, consent_marketing: consent });
  if (error) throw new Error('Votre préférence e-mail n’a pas été enregistrée. Vous pouvez réessayer sans attendre pour télécharger le guide.');
}
export async function telechargerGuide(userId: string) {
  const { data, error } = await supabase.storage.from(GUIDE.bucket).createSignedUrl(GUIDE.fichier, GUIDE.expiration);
  if (error || !data?.signedUrl) throw new Error('Le lien de téléchargement n’a pas pu être créé. Vérifiez votre connexion et réessayez.');
  const response = await fetch(data.signedUrl);
  if (!response.ok) throw new Error('Le PDF n’a pas pu être récupéré. Réessayez pour obtenir un nouveau lien.');
  const blob = await response.blob();
  const { error: historiqueError } = await supabase.from('ressource_telechargements').insert({ user_id: userId, ressource: GUIDE.id });
  if (historiqueError) throw new Error('Le téléchargement n’a pas pu être enregistré. Réessayez dans quelques instants.');
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = GUIDE.fichier;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
