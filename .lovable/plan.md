# Phase 2 — Nettoyage des pièces, automatisations et satisfaction à froid

## 1. Retrait de 3 pièces de l'interface

- `src/lib/dossier/pieces.ts` : suppression des entrées `3B`, `F6`, `F0B` de `PIECES` et des mêmes codes dans `PIECES_REQUISES_PAIEMENT` (qui devient `1A, 1B, 2, 3A, F0C, F3, F5, F7, F9`).
- Aucun autre fichier ne référence ces trois codes en dur : la disparition est immédiate partout (fiche dossier, Kanban, checklist paiement, validation).
- Hors périmètre, non touchés : table des certifications, `CertificationSelect`, `/admin/certifications`, `TarifsStep`, `espace/financement`. `CERT-CONV`, `TP`, `EA` inchangés.

## 2. Automatisation de trois documents

### 1B — Attestation de réalisation
- Déclencheur : passage de `dossier_pieces.statut` à `complete` pour le code `F3` d'un dossier.
- Implémentation : nouveau trigger base de données sur `dossier_pieces` qui insère une ligne de file d'attente légère, plus une nouvelle fonction serveur `genererEtEnvoyer1B` appelée par l'interface au moment où l'émargement est marqué complété (chemin synchrone immédiat), avec reprise par la tâche planifiée quotidienne pour les cas manqués.
- Génère le PDF via le constructeur `1B` existant + `htmlToPdfAvecRepli`, dépose dans le bucket `documents` et dans l'arborescence Drive, met `dossier_pieces` (`1B`) à `complete`, puis envoie l'e-mail à chaque apprenant.
- Nouveau modèle e-mail `attestation-realisation` (pièce téléchargeable via lien signé 7 jours).

### 3A — Convocation des stagiaires
- Déclencheur : passage de `dossiers.statut_crm` à `accord_financement`.
- Implémentation : dans la mutation existante de changement d'étape (fiche dossier + Kanban + validation admin), appel d'une nouvelle fonction serveur `genererDocumentsAccordFinancement` qui boucle sur les apprenants du dossier, génère une convocation nominative, l'archive (Storage + Drive), met à jour `dossier_pieces`, et envoie l'e-mail.
- Nouveau modèle e-mail `convocation-stagiaire` (dates, lieu ou lien de connexion, formateur).
- Garde-fou d'idempotence : rien n'est régénéré si un envoi `3A` existe déjà pour l'apprenant.

### F0C — Ordre de mission formateur (à valider)
Même déclencheur `accord_financement`. **Proposition** : réutiliser exactement les deux mécanismes déjà en production, sans nouveau procédé :
1. côté Skills4mation, la signature organisme de la convention (SHA-256 + certificat de preuve) est apposée automatiquement à la génération ;
2. côté formateur, le flux de signature électronique existant de `document_envois` (consentement explicite, empreinte SHA-256 du PDF, horodatage, certificat de preuve archivé) — la même page de signature que les apprenants, mais adressée au formateur (`apprenant_id` laissé vide, destinataire = formateur).

Avantage : aucune nouvelle brique juridique, preuves homogènes avec le reste du dossier. Alternative possible si tu préfères : simple case d'acceptation sans certificat (plus léger, moins probant). Nouveau modèle e-mail `ordre-de-mission-formateur`.

## 3. F9 — Facture formateur en pro forma

- `F9` devient générable : nouveau PDF pro forma construit à partir des montants du dossier (coût horaire, volume, recette, commission), marqué visiblement « PRO FORMA — modèle, ne vaut pas facture ».
- Généré automatiquement avec le reste du dossier et consultable dans « Mes documents ».
- Emplacement de dépôt séparé conservé : nouvelle pièce `F9R` « Facture réelle du formateur » (dépôt manuel obligatoire avant mise en paiement), qui remplace `F9` dans `PIECES_REQUISES_PAIEMENT`.

## 4. Nettoyage des vestiges Tally

- Vérification faite : `F5` et `F7` passent uniquement par `pieceMode === "formulaire"` / `FormulaireEnvoi` / `repondreFormulaire`.
- `source` de `F5` et `F7` : `"tally"` → `"pdf"`. La valeur `"tally"` disparaît alors de `PieceSource` et de `PIECE_SOURCES`.
- Le libellé d'état `en_attente_tally` (valeur d'énumération en base) est conservé tel quel : le renommer imposerait une migration d'énumération risquée sans gain visible (l'étiquette affichée est déjà « En attente de retour »).
- Migration : suppression de `profiles.lien_tally_f5` et `document_envois.tally_submission_id` après retrait des deux dernières références de code (`useAuth.tsx` pour la première, aucune pour la seconde).

## 5. Satisfaction à froid à +3 mois (à valider)

**Approche proposée** :
- Nouvelle route publique `src/routes/api/public/cron/satisfaction-froid.ts`, protégée par le contrôle de secret cron déjà fourni par la plateforme (en-tête `Authorization: Bearer`), donc non appelable de l'extérieur.
- Planification quotidienne à 07:00 UTC par `pg_cron` + `pg_net` vers l'URL stable de production.
- Logique : dossiers dont la date de fin vaut exactement « aujourd'hui − 3 mois », hors dossiers refusés ; pour chaque apprenant sans envoi `F7` existant, création de l'envoi du formulaire de satisfaction à froid et e-mail d'invitation (nouveau modèle `satisfaction-a-froid`), puis `dossier_pieces` (`F7`) passé en attente de retour.
- Rattrapage : fenêtre de 7 jours au lieu d'un jour exact, pour absorber une journée d'indisponibilité.
- Le même passage quotidien sert de filet de sécurité pour les attestations `1B` non générées.

## Détails techniques

Fichiers créés : `src/lib/dossier-automatisations.functions.ts`, `src/routes/api/public/cron/satisfaction-froid.ts`, 4 modèles e-mail dans `src/lib/email-templates/` (+ enregistrement dans `registry.ts`).
Fichiers modifiés : `pieces.ts`, `visibilite.ts`, `html.ts` (pro forma F9), `formulaires.ts`, `useAuth.tsx`, fiche dossier formateur, `KanbanDossiers.tsx`, `_app.admin.validation.tsx`.
Migrations : suppression des deux colonnes Tally, planification `pg_cron`, éventuelle table de file d'attente si le trigger `1B` est retenu.
