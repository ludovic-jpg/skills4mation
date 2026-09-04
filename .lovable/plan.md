# Bascule du catalogue historique dans la base

## Ce que j'ai constaté avant de proposer quoi que ce soit

Deux points changent le périmètre annoncé, il faut les valider avant l'étape 2 :

1. **`src/data/catalogue.ts` est déjà à 95 % du code mort.** Seuls `categoryLabel`
   et `CATEGORIES` (les 9 libellés de catégories, ~40 lignes) sont importés
   ailleurs. Le gros tableau `FORMATIONS` (les 303 Ko) n'est lu par aucun écran :
   les pages publiques utilisent `formations-statiques.ts` (titres + visuels) et
   `formation-details.ts` (le contenu des fiches). `FORMATIONS` reste toutefois
   la source la plus complète pour certains champs (tarif, modalités, catégorie),
   il sert donc de source à la migration, puis disparaît.
2. **`formations-statiques.ts` est hors périmètre (votre consigne) mais porte les
   visuels et la catégorie de chaque fiche.** Je ne le touche pas : il continue à
   fournir l'image et les fiches liées, et la migration y lit `img` / `cat` pour
   remplir `visuel_url` et `categorie` en base. On pourra le retirer dans un
   second chantier.

## 1. Correspondance des champs

| Statique | Colonne `formations_catalogue` |
| --- | --- |
| `slug` | `slug` (inchangé, aucune URL publique ne bouge) |
| `title` / `heading` | `titre` (et `heading` conservé dans `programme.meta`) |
| `cat` / `category` | `categorie` |
| `intro` | `intro` |
| `objectif` | `objectif` |
| `objectifs[]` | `objectifs` (text[]) |
| `duree` (« A partir de 21 H ») | `duree_texte` + `duree_heures` quand un nombre est extractible |
| `tarif` (« A partir de 2100 € ») | `tarif_details` + `tarif_ht` quand un nombre est extractible |
| `prerequis` | `prerequis` |
| `niveau` | `niveau` |
| `public[]` | `public_cible` (joint par retours à la ligne) |
| `modalites[]` | `modalites` (text[]) |
| `modules[]` / `programme[]` | `programme` (Json), normalisé en `{ titre, points[] }` — même forme que `parseProgramme()` déjà utilisé par l'espace formateur |
| `img` | `visuel_url` |
| — | `source = 'historique'`, `publiee = true`, `publication_statut = 'publiee'`, `formateur_id = null`, `format = 'presentiel'`, `tarif_unite = 'par participant'` |

### Champs sans colonne dédiée

`forts`, `resultats`, `anciens`, `modalitesEvaluation`, `delaisAcces`,
`accessibiliteHandicap`, `derniereMiseAJour` et l'objet `certification` détaillé
(libellé, code RS, certificateur, dates, description, modalités d'évaluation).

**Ma proposition pour `certification` : les deux à la fois.**

- la colonne texte `certification` reçoit le libellé lisible
  (« ICDL — … (RS1234) »), pour que l'affichage simple et les écrans formateur
  continuent de fonctionner ;
- l'objet complet part dans `programme` sous une clé `meta`, aux côtés des autres
  champs sans colonne :

```text
programme = {
  "modules": [ { "titre": "...", "points": ["..."] } ],
  "meta": {
    "heading": "...", "forts": [...], "resultats": [...],
    "anciens": [...], "modalitesEvaluation": [...],
    "delaisAcces": "...", "accessibiliteHandicap": "...",
    "derniereMiseAJour": "...",
    "certification": { "libelle": "...", "code": "...", ... }
  }
}
```

Aplatir la certification en texte seul ferait perdre le tableau réglementaire
(code RS, certificateur, dates de validité) que la fiche affiche aujourd'hui —
d'où le stockage structuré. `parseProgramme()` reste compatible : je lui ajoute
la lecture du format objet en plus du tableau nu actuel.

## 2. Migration des données

Une migration qui, pour chacune des 58 formations, insère la ligne fusionnée
(`FORMATIONS` + `FORMATION_DETAILS` + visuel/catégorie de `formations-statiques`)
avec `source='historique'`, `publiee=true` et le slug actuel, en
`ON CONFLICT (slug) DO NOTHING` — rien n'est écrasé pour un slug déjà présent.

**Point de blocage à corriger dans la même migration :** la règle de lecture
publique actuelle n'autorise que `source='skills4mation'` ou un formateur validé.
Sans changement, les fiches historiques seraient invisibles aux visiteurs. La
migration étend cette règle à `source='historique'` (lecture seule, uniquement
les fiches publiées).

## 3. Bascule des composants

- **Nouveau `src/lib/catalogue-historique.ts`** : hooks React Query
  (`useCataloguesHistoriques`, `useFormationHistoriqueBySlug`), cache 10 min,
  plus `CATEGORIES` / `categoryLabel` déplacés ici (données de référence de 40
  lignes, pas du contenu à migrer) et un adaptateur qui reconstruit un objet de
  type « fiche » depuis une ligne de base.
- `formations.index.tsx` : une seule requête sur `formations_catalogue`
  (historique publié + formateur publié), au lieu du mélange statique/base.
- `formations.$slug.tsx` : le loader lit la fiche par slug en base ; le `head()`
  SEO et le JSON-LD continuent d'être servis côté serveur.
- `FicheStatique.tsx` : reçoit désormais une ligne de base (via l'adaptateur) au
  lieu du couple `FormationStatique` + `FormationDetail`. Rendu inchangé.
- `FormationCard.tsx`, `FormationEditor.tsx`, `_app.espace.index.tsx` : simple
  changement d'import pour `categoryLabel` / `CATEGORIES`.

## 4. Recette puis nettoyage

Comparaison avant/après sur `/formations` (nombre de fiches, compteurs par
catégorie) et sur un échantillon de fiches `/formations/:slug` de chaque
catégorie, dont une fiche certifiée (ICDL/LILATE) pour vérifier le bloc
réglementaire. Ensuite seulement : suppression de `src/data/catalogue.ts` et
`src/data/formation-details.ts`, et signalement de tout fichier qui les
importerait encore. `src/data/blog.ts` et `src/data/formations-statiques.ts` ne
sont pas touchés.

## Détails techniques

- Le déclencheur `formations_publication_guard` remet `publiee=false` pour un
  auteur non-équipe ; la migration s'exécutant sans session, l'insertion passe
  en publié comme voulu.
- La migration est générée par un script local qui lit les deux fichiers TS et
  produit le SQL, pour éviter toute divergence de recopie manuelle.
- `parseProgramme()` gagne la lecture du format `{ modules, meta }` tout en
  restant compatible avec le tableau nu enregistré par l'espace formateur.
