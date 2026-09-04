<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Vocabulaire métier

- « dossier » (table dossiers) = ce que l'équipe désigne en interne comme
  une « Opportunité » dans sa vision CRM. Nom technique inchangé, libellé
  affiché seul peut varier.
- Rôles : formateur (propriétaire de son dossier) < conseillere < admin
  < super_admin. Toute policy RLS destinée à l'équipe Skills4mation doit
  utiliser private.is_conseillere_ou_plus(auth.uid()), jamais
  has_role(auth.uid(), 'admin') seul (voir supabase/migrations, 2026-09-04).
- Socle des 6 documents formateur (lecture seule, générés automatiquement
  à la soumission, visibles seulement après validation admin) :
  1A Convention, 1C Programme, 2 Planning, F0A Recueil des besoins,
  F3 Émargement, F5 Satisfaction à chaud. Liste de référence :
  PIECES_SOCLE dans src/lib/dossier/pieces.ts.

## Fichiers à ne jamais ouvrir ni modifier à la main

- src/routeTree.gen.ts — généré par TanStack Router, écrasé à chaque build.
- bun.lock — lockfile, jamais édité manuellement.
- supabase/migrations/\*.sql déjà appliquées — ne modifie jamais une
  migration existante, toujours en créer une nouvelle.

## Composants formateur vs back-office

- src/components/dossier/MesDocumentsPanel.tsx = vue formateur (lecture
  seule, 6 documents du socle uniquement).
- src/components/dossier/PiecesPanel.tsx et DocumentsPanel.tsx = outils
  back-office, utilisés uniquement depuis KanbanDossiers.tsx (admin). Ne
  pas les réintroduire côté formateur.
