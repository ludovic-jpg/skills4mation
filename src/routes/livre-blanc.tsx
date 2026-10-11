import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowRight, BookOpen, Check, LockKeyhole, ShieldCheck } from 'lucide-react';
import { PublicLayout } from '@/components/site/PublicLayout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CONSENT_KEY, GUIDE } from '@/lib/ressources';
import '@/lib/ressources.css';

const TITLE = 'Guide portage Qualiopi formateur indépendant | Skills4mation';
const DESCRIPTION = 'Guide du portage Qualiopi pour formateurs indépendants : cadre légal, financements OPCO, coûts et dossier qualité. PDF gratuit de 30 pages.';
const CHAPITRES = [
  'Le portage Qualiopi : comment ça marche',
  'Pourquoi l’accès aux financements change votre activité',
  'Créer et certifier son propre organisme : le parcours réel',
  'Portage ou création d’organisme : le vrai comparatif',
  'OPCO, FAF, Transitions Pro : les dispositifs mobilisables',
  'Le dossier de formation : la preuve qui déclenche le paiement',
  'Choisir son organisme porteur — l’exemple Skills4mation',
];
const APPRENTISSAGES = [
  'Comprendre le cadre de la sous-traitance et les responsabilités de chacun.',
  'Identifier les financements professionnels adaptés à vos clients.',
  'Comparer le coût du portage avec celui de votre propre certification.',
  'Préparer les pièces et les preuves attendues dans un dossier de formation.',
  'Vérifier la certification, le contrat et les délais d’un organisme porteur.',
  'Construire votre plan d’action pour une première formation financée.',
];
const FAQ = [
  ['À qui s’adresse ce livre blanc ?', 'Aux formateurs indépendants, consultants, experts métier et organismes non certifiés qui souhaitent comprendre les formations financées et leurs obligations.'],
  ['Le PDF contient-il des outils pour comparer les options ?', 'Oui. Il présente un comparatif portage ou certification en propre, dix critères de sélection d’un porteur et un plan d’action. L’étude de cas est explicitement illustrative.'],
  ['Le guide garantit-il une prise en charge par un financeur ?', 'Non. Chaque demande dépend de l’éligibilité du bénéficiaire, du dispositif, du programme et de l’accord du financeur. Le CPF nécessite des conditions spécifiques : certification éligible et habilitation, notamment.'],
  ['Pourquoi une connexion est-elle demandée pour le télécharger ?', 'Votre espace conserve l’accès au PDF et vos téléchargements. Aucun renseignement supplémentaire n’est demandé. L’inscription aux prochains guides est facultative et peut être modifiée dans Mes ressources.'],
];
export const Route = createFileRoute('/livre-blanc')({
  head: () => ({
    meta: [
      { title: TITLE }, { name: 'description', content: DESCRIPTION },
      { property: 'og:title', content: TITLE }, { property: 'og:description', content: DESCRIPTION },
      { property: 'og:type', content: 'article' }, { property: 'og:url', content: 'https://skills4mation.com/livre-blanc' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [{ rel: 'canonical', href: 'https://skills4mation.com/livre-blanc' }],
    scripts: [{ type: 'application/ld+json', children: JSON.stringify({
      '@context': 'https://schema.org', '@graph': [
        { '@type': 'Organization', '@id': 'https://skills4mation.com/#organization', name: 'Skills4mation', url: 'https://skills4mation.com' },
        { '@type': 'Report', name: GUIDE.titre, author: { '@type': 'Organization', name: 'Skills4mation', '@id': 'https://skills4mation.com/#organization' }, datePublished: '2026-10', inLanguage: 'fr', isAccessibleForFree: false, url: 'https://skills4mation.com/livre-blanc', hasPart: { '@type': 'WebPageElement', isAccessibleForFree: false, cssSelector: '.gated' } },
      ],
    }) }],
  }),
  component: LivreBlanc,
});
function LivreBlanc() {
  const [consent, setConsent] = useState(false);
  function memoriserChoix() {
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ consent, date: Date.now() })); } catch { /* Le téléchargement reste accessible sans stockage local. */ }
  }
  return <div className="livre-blanc-theme"><PublicLayout>
    <section className="bg-gradient-hero text-primary-foreground">
      <div className="section-shell py-12 lg:py-16">
        <p className="eyebrow text-cta">Ressource gratuite · Édition octobre 2026</p>
        <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight text-primary-foreground sm:text-4xl lg:text-5xl">{GUIDE.titre}</h1>
        <div className="mt-8 grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="max-w-2xl text-lg text-primary-foreground/90">Comprenez le cadre légal, comparez les coûts et préparez vos formations financées sans créer votre propre organisme.</p>
            <div className="gated mt-7">
              <Button asChild variant="cta" size="lg" className="h-auto min-h-12 w-full whitespace-normal py-3 sm:w-auto">
                <Link to="/auth" search={{ next: '/ressources' }} onClick={memoriserChoix}>Accéder au guide gratuit (PDF, {GUIDE.pages} pages)<ArrowRight aria-hidden /></Link>
              </Button>
              <p className="mt-4 max-w-xl text-xs leading-relaxed text-primary-foreground/90">En créant votre espace, vous acceptez notre <Link to="/politique-de-confidentialite" className="underline underline-offset-4">politique de confidentialité</Link>. Vos données ne sont utilisées que pour l’accès aux ressources.</p>
              <label className="mt-4 flex max-w-xl cursor-pointer items-start gap-3 text-sm">
                <Checkbox checked={consent} onCheckedChange={(value) => setConsent(value === true)} className="mt-0.5 border-primary-foreground data-[state=checked]:bg-cta data-[state=checked]:text-cta-foreground" />
                <span>Je souhaite recevoir les prochains guides par e-mail <span className="text-primary-foreground/80">(facultatif)</span></span>
              </label>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm"><LockKeyhole className="size-4 shrink-0" aria-hidden />PDF réservé aux comptes connectés · Sans achat ni abonnement</p>
          </div>
          <div role="img" aria-label="Couverture du guide Portage Qualiopi, Skills4mation, édition octobre 2026, 30 pages" className="mx-auto flex aspect-[3/4] w-full max-w-72 flex-col justify-between rounded-3xl border border-border bg-card p-7 text-card-foreground shadow-elevated">
            <div><p className="font-display text-lg font-semibold text-primary">Skills4mation</p><p className="mt-2 text-xs text-muted-foreground">L’ingénierie des compétences en mouvement</p></div>
            <div><BookOpen className="mb-5 size-10 text-primary" aria-hidden /><p className="eyebrow">Guide pratique</p><p className="mt-3 font-display text-2xl font-semibold text-primary">Portage Qualiopi</p><p className="mt-3 text-sm">Le guide complet du formateur indépendant</p></div>
            <div className="border-t border-border pt-4 text-xs text-muted-foreground">Octobre 2026 · 30 pages</div>
          </div>
        </div>
      </div>
    </section>
    <section className="border-b border-border bg-accent py-5"><div className="section-shell flex flex-wrap justify-between gap-4 text-sm font-medium"><span className="flex items-center gap-2"><Check className="size-4" aria-hidden />Gratuit</span><span>Édition octobre 2026</span><span>Connexion Google en 1 clic</span></div></section>
    <section className="section-shell py-14 lg:py-16">
      <p className="eyebrow">Avant de vous engager</p><h2 className="mt-3 text-3xl font-semibold">Ce que vous allez apprendre</h2>
      <ul className="mt-8 grid gap-5 md:grid-cols-2">{APPRENTISSAGES.map((texte) => <li key={texte} className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden /><span>{texte}</span></li>)}</ul>
    </section>
    <section className="bg-muted/60 py-14"><div className="section-shell"><p className="eyebrow">Dans le guide</p><h2 className="mt-3 text-3xl font-semibold">Le sommaire</h2><ol className="mt-8 grid gap-3">{CHAPITRES.map((titre, index) => <li key={titre} className="flex gap-4 border-b border-border py-4"><span className="font-display text-lg font-semibold text-primary">{String(index + 1).padStart(2, '0')}</span><span className="font-medium">{titre}</span></li>)}</ol><p className="mt-5 text-sm text-muted-foreground">Également : résumé exécutif, introduction, étude de cas illustrative, plan d’action en dix étapes, conclusion et sources.</p></div></section>
    <section className="section-shell py-14"><h2 className="text-3xl font-semibold">Trois repères Skills4mation</h2><div className="mt-8 grid gap-5 md:grid-cols-3">{[
      ['24 h', 'Conventions et documents après validation du dossier.'],
      ['8 jours ouvrés', 'Paiement à réception des fonds, selon les conditions contractuelles.'],
      ['25 %', 'Commission sur le chiffre d’affaires HT généré via le portage.'],
    ].map(([chiffre, texte]) => <article key={chiffre} className="rounded-2xl border border-border p-6"><p className="font-display text-3xl font-semibold text-primary">{chiffre}</p><p className="mt-3 text-sm text-muted-foreground">{texte}</p></article>)}</div><p className="mt-5 text-sm text-muted-foreground">Source : <Link to="/portage-qualiopi" className="font-medium text-primary underline underline-offset-4">notre page de référence sur le portage Qualiopi</Link>, modalités affichées en octobre 2026. Ces repères ne garantissent pas un accord de financement.</p></section>
    <section className="bg-muted/60 py-14"><div className="section-shell max-w-4xl"><p className="eyebrow">Résumé public</p><h2 className="mt-3 text-3xl font-semibold">Choisir votre cadre de formation en connaissance de cause</h2><div className="mt-7 space-y-5 leading-relaxed text-muted-foreground">
      <p>Vous êtes formateur indépendant, consultant ou expert métier. Vos clients souhaitent développer leurs compétences et mobiliser un financement professionnel. Votre expertise pédagogique ne suffit toutefois pas à rendre une action finançable : le dispositif choisi, l’éligibilité du bénéficiaire et le cadre administratif doivent être vérifiés. Ce guide explique comment le portage Qualiopi peut répondre à cette situation, sans vous obliger à créer immédiatement votre propre organisme de formation.</p>
      <p>Le portage repose sur une relation de sous-traitance avec un organisme certifié. Le porteur contractualise avec le client et les financeurs, organise le suivi qualité et gère les pièces administratives. Vous concevez et animez la formation dans le cadre convenu. Le contrat doit préciser la répartition des responsabilités, les documents attendus, la commission et les conditions de reversement. Il ne s’agit ni de louer un certificat ni de transférer automatiquement une certification à votre activité.</p>
      <p>Le livre blanc compare ensuite cette solution avec la création d’un organisme et l’obtention de votre propre certification. Les coûts d’audit, le temps consacré à la qualité, les outils et le suivi récurrent doivent être considérés ensemble. Une commission variable et des coûts fixes ne répondent pas aux mêmes besoins. Le choix dépend de votre volume d’activité, de votre organisation et de votre capacité à maintenir les preuves nécessaires.</p>
      <p>Une partie du guide présente les OPCO, les fonds d’assurance formation et les dispositifs de transition professionnelle. Aucun financement n’est automatique. Le CPF obéit à des conditions spécifiques, notamment en matière de certification éligible et d’habilitation. Le guide invite à vérifier ces conditions avant de présenter une prise en charge comme acquise. Les données citées sont accompagnées de références dans le PDF ; les scénarios pédagogiques sont signalés comme illustratifs.</p>
      <p>Enfin, vous trouverez les points de contrôle d’un dossier : programme, convention, planning, recueil des besoins, émargements, évaluations et justificatifs de réalisation. Le dernier chapitre propose des critères pour choisir votre organisme porteur, vérifier sa certification et comparer ses engagements écrits. Un plan d’action vous aide à préparer votre première formation financée. Ce document constitue une information générale, non un avis juridique individuel ; les règles applicables et les conditions du financeur doivent être vérifiées pour chaque projet.</p>
    </div></div></section>
    <section className="section-shell max-w-4xl py-14"><p className="eyebrow">Questions sur le guide</p><h2 className="mt-3 text-3xl font-semibold">Avant de télécharger</h2><div className="mt-8 space-y-7">{FAQ.map(([q, a]) => <article key={q} className="border-b border-border pb-6"><h3 className="text-lg font-semibold">{q}</h3><p className="mt-3 leading-relaxed text-muted-foreground">{a}</p></article>)}</div><Button asChild variant="cta" size="lg" className="mt-8 h-auto min-h-12 whitespace-normal py-3"><Link to="/auth" search={{ next: '/ressources' }} onClick={memoriserChoix}>Accéder au guide gratuit (PDF, 30 pages)<ArrowRight aria-hidden /></Link></Button></section>
  </PublicLayout></div>;
}
