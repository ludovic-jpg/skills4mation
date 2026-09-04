# Espace formateur : accès équipe, documents en lecture seule, génération à la soumission

## 1. Correction du bug d'accès de l'équipe (priorité)

Aujourd'hui les policies ci-dessous n'autorisent que le rôle `admin`, donc une conseillère ne voit
aucun dossier soumis. Une migration remplace la condition par le helper déjà utilisé sur
`demandes_financement`.

Aperçu de la migration :

```sql
-- dossiers
DROP POLICY IF EXISTS dossiers_admin_select ON public.dossiers;
CREATE POLICY dossiers_admin_select ON public.dossiers
  FOR SELECT TO authenticated USING (private.is_conseillere_ou_plus(auth.uid()));

DROP POLICY IF EXISTS dossiers_admin_update ON public.dossiers;
CREATE POLICY dossiers_admin_update ON public.dossiers
  FOR UPDATE TO authenticated USING (private.is_conseillere_ou_plus(auth.uid()));

-- dossier_pieces
DROP POLICY IF EXISTS pieces_admin_select ON public.dossier_pieces;
CREATE POLICY pieces_admin_select ON public.dossier_pieces
  FOR SELECT TO authenticated USING (private.is_conseillere_ou_plus(auth.uid()));

DROP POLICY IF EXISTS pieces_admin_update ON public.dossier_pieces;
CREATE POLICY pieces_admin_update ON public.dossier_pieces
  FOR UPDATE TO authenticated USING (private.is_conseillere_ou_plus(auth.uid()));

-- documents_dossier
DROP POLICY IF EXISTS docs_admin_select ON public.documents_dossier;
CREATE POLICY docs_admin_select ON public.documents_dossier
  FOR SELECT TO authenticated USING (private.is_conseillere_ou_plus(auth.uid()));
```

Vérification ensuite avec un compte de test portant uniquement le rôle `conseillere`, sur
`/admin/validation`, `/admin/dossiers` et `/admin/financements`.

### Autres policies encore limitées à `admin` — à valider avec toi avant modification

Recensées dans `supabase/migrations`, non modifiées à ce stade :

- `dossier_apprenants`, `document_envois`, `supports_pedagogiques` : lecture des pièces liées au
  dossier — probablement à ouvrir aussi, sinon la conseillère voit le dossier mais pas ses envois.
- `dossier_historique` : historique du pipeline, utile pour l'instruction.
- `candidatures_admin_select` / `candidatures_admin_update` : traitement des candidatures formateur.
- `demandes_budget`, `demandes_contact`, `demandes_droits_formation`, `formations_inscriptions`,
  `reclamations` : traitement CRM des demandes entrantes.
- `formations_catalogue` (validation de publication), `certifications`, `tarifs_cpf` : plutôt à
  garder en `admin` (paramétrage).
- `profiles_select_admin` / `profiles_update_admin`, `user_roles_select_admin`,
  `admin_read_all_files` (Storage) : sensibles ; l'accès Storage devra suivre si la conseillère doit
  ouvrir les PDF.
- `dossiers_protect_statut_crm` et `profiles_protect_statut` (triggers) : déjà cohérents.

## 2. Suppression de l'accès « Matrice »

`src/components/dossier/PiecesPanel.tsx` : suppression du bouton/lien `piece.matrice`. Le champ
reste dans `src/lib/dossier/pieces.ts` comme donnée interne, plus jamais rendu.

## 3. Onglet unique « Mes documents » en lecture seule

Nouveau composant `src/components/dossier/MesDocumentsPanel.tsx` remplaçant l'usage formateur de
`DocumentsPanel.tsx` et `PiecesPanel.tsx` :

- affiche uniquement les 6 documents du socle : `1A`, `1C`, `2`, `F0A`, `F3`, `F5` ;
- aucun bouton de génération, d'impression HTML, d'e-mail, de dépôt libre ni de select de statut ;
- statut calculé sur 2 valeurs : « En attente de retour » / « Complété » ;
- lien de téléchargement uniquement quand le fichier est diffusable (point 4).

`src/routes/_app.espace.dossiers.$id.tsx` : les onglets « Documents » et « Pièces & génération »
fusionnent en « Mes documents » ; la section « Déposer une pièce » (sélecteur `DOCUMENT_TYPES`) est
retirée de l'onglet « Suivi ». Les onglets « Envoi & signatures » et « Supports pédagogiques »
restent inchangés, ainsi que le Kanban admin, qui continue d'utiliser les panneaux existants.

## 4. Génération automatique à la soumission + verrou de diffusion

- Nouvelle server function `src/lib/dossier-socle.functions.ts` : au clic sur « Soumettre à
  validation », rendu des 6 documents via les builders existants, conversion par
  `htmlToPdfAvecRepli`, dépôt dans le bucket `documents`
  (`{formateur}/{dossier}/socle/{code}-....pdf`), mise à jour de `dossier_pieces`
  (`fichier_url`, `generated_at`, `statut`), puis rangement dans l'arborescence Drive du dossier via
  `ensureDossierTree` — aujourd'hui limité à la convention.
- Le passage à `demande_validation` déclenche cette génération avant le changement de statut ; en
  cas d'échec Drive, le repli PDF natif existant s'applique et le dossier est quand même soumis.
- Verrou global de diffusion : un document n'est téléchargeable que si
  `dossiers.signature_organisme_date` est renseigné. Sinon badge « En attente de retour », sans
  fichier.
- Calendrier de diffusion (en plus du verrou global), dans une fonction dédiée de
  `src/lib/dossier/visibilite.ts` : `1A` / `1C` / `2` / `F0A` à partir de `dossier_valide`, `F3` à
  partir de `formation_en_cours`, `F5` à partir de `formation_realisee`.
- Aucune autre pièce n'est touchée (`3A`, `F0C`, `1B`, `F9`, `F6`, `F0B`, `3B`, `F7`, `CERT-CONV`,
  `TP`, `EA`).

### Point de vigilance sur le calendrier

`F0A` (recueil des besoins) est un formulaire rempli en ligne par l'apprenant avant la formation :
le rendre visible seulement à `dossier_valide` est cohérent, mais son PDF récapitulatif n'existe
qu'après réponse de l'apprenant. Proposition : générer à la soumission un PDF « vierge » du recueil,
remplacé automatiquement par le récapitulatif dès que l'apprenant répond. Même logique pour `F5`,
généré à la soumission mais diffusé seulement à `formation_realisee`.
