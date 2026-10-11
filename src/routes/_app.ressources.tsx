import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BookOpen, Download, LogOut, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CONSENT_KEY, GUIDE, enregistrerConsentement, lireConsentementEnAttente, telechargerGuide } from '@/lib/ressources';
import '@/lib/ressources.css';

export const Route = createFileRoute('/_app/ressources')({
  head: () => ({ meta: [
    { title: 'Mes ressources | Skills4mation' }, { name: 'description', content: 'Votre guide et vos ressources Skills4mation dans votre espace connecté.' },
    { property: 'og:title', content: 'Mes ressources | Skills4mation' }, { property: 'og:description', content: 'Accès privé à vos ressources Skills4mation.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex, nofollow' },
  ] }),
  component: MesRessources,
});
function MesRessources() {
  const { user: routeUser } = Route.useRouteContext();
  const { user, profile, signOut } = useAuth();
  const compte = user ?? routeUser;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [sortie, setSortie] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [consentBusy, setConsentBusy] = useState(true);
  const [consentError, setConsentError] = useState('');
  const [pendingConsent, setPendingConsent] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    async function charger() {
      setConsentBusy(true);
      let pending: boolean | null = null;
      try { pending = lireConsentementEnAttente(localStorage.getItem(CONSENT_KEY)); } catch { /* Pas de consentement implicite. */ }
      try {
        if (pending !== null) {
          await enregistrerConsentement(compte.id, pending);
          if (active) setConsent(pending);
          try { localStorage.removeItem(CONSENT_KEY); } catch { /* Facultatif. */ }
        } else {
          const { data, error } = await supabase.from('ressource_consentements').select('consent_marketing').eq('user_id', compte.id).maybeSingle();
          if (error) throw new Error('Votre préférence e-mail ne peut pas être chargée. Vous pouvez télécharger le guide et réessayer plus tard.');
          if (active) setConsent(data?.consent_marketing ?? false);
        }
      } catch (e) {
        if (active) { setPendingConsent(pending); if (pending !== null) setConsent(pending); setConsentError(e instanceof Error ? e.message : 'Votre préférence e-mail n’a pas pu être chargée.'); }
      } finally { if (active) setConsentBusy(false); }
    }
    void charger();
    return () => { active = false; };
  }, [compte.id]);
  async function changerConsentement(value: boolean) {
    setConsentBusy(true); setConsentError('');
    try { await enregistrerConsentement(compte.id, value); setConsent(value); setPendingConsent(null); try { localStorage.removeItem(CONSENT_KEY); } catch { /* Facultatif. */ } }
    catch (e) { setPendingConsent(value); setConsentError(e instanceof Error ? e.message : 'Préférence non enregistrée. Réessayez.'); }
    finally { setConsentBusy(false); }
  }
  async function telecharger() {
    setBusy(true); setError(''); setMessage('');
    try { await telechargerGuide(compte.id); setMessage('Votre PDF est prêt. Le téléchargement a été lancé.'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Téléchargement impossible. Réessayez.'); }
    finally { setBusy(false); }
  }
  async function deconnecter() {
    setSortie(true); setError('');
    try { await queryClient.cancelQueries(); queryClient.clear(); await signOut(); await navigate({ to: '/auth', replace: true }); }
    catch { setError('La déconnexion n’a pas abouti. Réessayez.'); setSortie(false); }
  }
  const metadataName: unknown = compte.user_metadata?.['full_name'] ?? compte.user_metadata?.['name'];
  const nom = profile ? `${profile.prenom} ${profile.nom}`.trim() : typeof metadataName === 'string' ? metadataName : 'Votre compte';
  return <div className="livre-blanc-theme min-h-screen bg-background">
    <header className="border-b border-border"><div className="section-shell flex flex-wrap items-center justify-between gap-4 py-5"><Link to="/livre-blanc" className="font-display text-xl font-semibold text-primary">Skills4mation</Link><Button variant="outline" onClick={deconnecter} disabled={sortie}><LogOut aria-hidden />{sortie ? 'Déconnexion…' : 'Déconnexion'}</Button></div></header>
    <main className="section-shell py-10 sm:py-14">
      <p className="eyebrow">Votre espace connecté</p><h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Mes ressources</h1>
      <div className="mt-6 border-b border-border pb-6"><p className="font-medium">{nom || 'Votre compte'}</p><p className="mt-1 break-all text-sm text-muted-foreground">{compte.email}</p></div>
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
        <article className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8"><BookOpen className="size-9 text-primary" aria-hidden /><p className="eyebrow mt-5">Livre blanc · Octobre 2026</p><h2 className="mt-3 text-2xl font-semibold">{GUIDE.titre}</h2><p className="mt-4 text-muted-foreground">Cadre légal, financements professionnels, coûts et pièces du dossier. PDF · {GUIDE.pages} pages.</p><Button variant="cta" size="lg" onClick={telecharger} disabled={busy} className="mt-7 h-auto min-h-12 w-full whitespace-normal py-3 sm:w-auto"><Download aria-hidden />{busy ? 'Préparation du PDF…' : 'Télécharger le guide (PDF)'}</Button><p className="mt-3 text-xs text-muted-foreground">Accès réservé à votre espace · Gratuit</p>{message && <p role="status" className="mt-4 text-sm text-primary">{message}</p>}{error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}</article>
        <article className="rounded-3xl border border-border bg-accent p-6 sm:p-8"><h2 className="text-xl font-semibold">Rejoindre notre réseau de formateurs</h2><p className="mt-4 text-sm leading-relaxed text-muted-foreground">Vous souhaitez proposer vos formations sous notre certification Qualiopi ? Présentez votre parcours à notre équipe.</p><Button asChild variant="default" className="mt-6"><Link to="/candidature">Postuler<ArrowRight aria-hidden /></Link></Button></article>
      </div>
      <section className="mt-10 border-b border-border pb-8"><h2 className="text-xl font-semibold">Vos préférences e-mail</h2><label className="mt-5 flex cursor-pointer items-start gap-3 text-sm"><Checkbox checked={consent} disabled={consentBusy} onCheckedChange={(v) => void changerConsentement(v === true)} className="mt-0.5" /><span>Je souhaite recevoir les prochains guides par e-mail <span className="text-muted-foreground">(facultatif)</span></span></label><p className="mt-3 text-xs text-muted-foreground">Cette préférence ne conditionne jamais le téléchargement. <Link to="/politique-de-confidentialite" className="underline">Politique de confidentialité</Link>.</p>{consentBusy && <p role="status" className="mt-3 text-sm text-muted-foreground">Enregistrement de votre préférence…</p>}{consentError && <div role="alert" className="mt-4 text-sm text-destructive"><p>{consentError}</p><Button variant="outline" size="sm" className="mt-3" onClick={() => void changerConsentement(pendingConsent ?? consent)}>Réessayer</Button></div>}</section>
      <section className="py-9"><h2 className="text-2xl font-semibold">Prochaines ressources</h2><p className="mt-4 text-muted-foreground">Aucune autre ressource disponible pour le moment.</p></section>
    </main>
  </div>;
}
