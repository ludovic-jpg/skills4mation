# Skills4mation Hub

Construis une application web complète pour Skills4mation, un organisme de formation certifié Qualiopi qui propose un service de portage administratif et pédagogique à des formateurs indépendants. L'application comprend un site vitrine public et un SaaS accessible après connexion, réservé aux formateurs validés par Skills4mation ainsi qu'à l'équipe interne Skills4mation (back-office admin).

1. Stack technique

Frontend : React + Tailwind CSS + shadcn/ui (stack par défaut Lovable), design responsive mobile/tablette/desktop.

Backend/Auth/DB/Storage : Supabase, à activer dès le départ.

Authentification email + mot de passe (email de confirmation), avec possibilité d'ajouter une connexion Google plus tard.

Deux rôles distincts stockés dans une table profiles liée à auth.users : formateur et admin (équipe Skills4mation). Le rôle détermine l'interface affichée après connexion.

Row Level Security (RLS) stricte : un formateur ne doit jamais voir les dossiers, documents ou demandes de budget d'un autre formateur. Seuls les comptes admin ont une vue globale.

Supabase Storage pour : photos de profil, documents uploadés par les formateurs (documents signés, accords de financement, documents Qualiopi finaux).

2. Identité de marque et charte graphique

Le style doit s'inspirer du site institutionnel existant skills4mation.com : univers professionnel et sobre du secteur de la formation, avec une signature de marque autour de l'expertise pédagogique. Éléments à reprendre :




Tagline à utiliser en page d'accueil : « L'ingénierie des compétences en mouvement ».

Ton éditorial : professionnel, engageant, phrases courtes et percutantes, vocabulaire orienté « expertise », « parcours personnalisés », « ingénierie pédagogique », « portage ».

Mise en avant systématique de la certification Qualiopi (badge/logo Qualiopi visible en footer et sur les pages clés), ainsi que des mentions CPF et charte déontologique.

Palette suggérée (aucune charte graphique stricte au format hexadécimal n'étant disponible publiquement, propose une palette cohérente avec l'univers du site et facilement modifiable ensuite) :

Couleur principale : bleu profond/corporate (proche #1B3A5C ou #14406B) pour le header, les titres et les boutons primaires.

Couleur secondaire : bleu-vert / teal doux (#0F6E71 ou proche) pour les accents et éléments secondaires.

Couleur d'accent CTA : un orange ou doré chaleureux (#E8A33D ou proche) pour les boutons d'action principaux (« Je m'inscris », « Devenir formateur », « Déposer un document »).

Fond neutre clair (blancs cassés / gris très clairs), texte gris foncé/anthracite pour la lisibilité.

Typographie : une police sans-serif moderne et lisible (type Inter, Poppins ou similaire), hiérarchie claire des titres.

Composants : cartes arrondies avec ombre légère, boutons arrondis, badges de statut colorés (brouillon, en cours, documents générés, signé, financé, clôturé, archivé).

Prévoir un espace pour le logo « Skills4mation » (zone logo à afficher en header, à remplacer par le fichier réel de l'utilisateur ensuite).

3. Site vitrine (public, sans connexion)

Pages à créer :




Accueil : présentation de Skills4mation, proposition de valeur (formations sur mesure, expertise métier, portage Qualiopi), sections « avantages clés », « nos services » (diagnostic, ingénierie pédagogique, déploiement, mesure d'impact), certifications (Qualiopi, CPF, charte déontologique), appels à l'action « Devenir formateur » et « Nous contacter ».

Catalogue de formations : grille/liste des parcours de formation proposés par les formateurs du réseau (alimentée par les champs « parcours de formation proposés » renseignés dans les profils formateurs validés).

Pôle formateur / Devenir formateur : présentation du service de portage, avantages à rejoindre Skills4mation, formulaire de candidature (nom, prénom, email, téléphone, expertise, message) → à la soumission, crée une entrée « candidature » en base avec statut en attente, visible côté back-office admin pour validation. Un formateur n'a accès au SaaS qu'une fois sa candidature validée par un admin (déclenche la création de son compte/l'activation de son accès).

Mentions légales / Politique de confidentialité / Contact.

Header avec navigation (Accueil, Catalogue de formation, Pôle formateur, Contact) + bouton « Espace formateur » menant à la connexion. Footer avec réseaux sociaux, liens légaux, logo Qualiopi.

4. Espace SaaS Formateur (après connexion, statut « validé » uniquement)

Une fois connecté, un formateur validé accède à un tableau de bord avec les sections suivantes :

A. Monter un dossier de formation (génération des pièces Qualiopi)

Bouton « Créer un nouveau dossier » qui ouvre une page dédiée intégrant le formulaire Tally existant (https://tally.so/r/Zj9ABV, formulaire « Création de convention », en 7 étapes couvrant les informations du formateur puis de l'entreprise commanditaire : nom/prénom du représentant, SIRET, OPCO, téléphone, adresse, etc.) via iframe/embed officiel Tally.

Avant d'afficher le formulaire, créer côté Supabase un enregistrement dossiers avec un dossier_id unique (statut initial brouillon), lié au formateur connecté.

Passer ce dossier_id ainsi que l'id et l'email du formateur au formulaire Tally en paramètres cachés (hidden fields / query params) afin que le scénario Make déclenché à la soumission puisse identifier précisément le dossier et le formateur concernés.

À la soumission du formulaire (gérée en dehors du SaaS, côté Tally → Make), passer le statut du dossier à en cours de génération.

B. Récupérer l'ensemble des documents générés (téléchargement)

Créer un endpoint Supabase Edge Function (webhook) que le scénario Make pourra appeler en retour, avec en payload : dossier_id, lien_dossier_drive (URL du dossier Google Drive) et, si disponible, la liste des liens individuels de chaque document généré.

Cet endpoint met à jour l'enregistrement dossiers (colonnes drive_folder_url, documents en JSON, statut → documents générés) et déclenche une notification (in-app + email) au formateur.

Sur la page du dossier, afficher un bouton « Ouvrir le dossier Drive » (lien direct) ainsi que la liste des documents individuels avec bouton de téléchargement/ouverture pour chacun.

C. Déposer les documents signés

Sur chaque dossier, une zone d'upload (Supabase Storage) permettant au formateur de déposer les documents une fois signés par les parties. Statut du dossier → documents signés déposés.

D. Déposer l'accord de financement

Zone d'upload dédiée pour l'accord de financement (OPCO/entreprise). Statut du dossier → financement déposé.

E. Déposer l'ensemble des documents finaux Qualiopi signés

Zone d'upload finale pour le pack complet de documents Qualiopi signés, qui fait passer le dossier au statut complet / clôturable.

F. Archiver les dossiers clos

Action « Archiver » disponible sur un dossier au statut complet. Les dossiers archivés sortent de la liste active mais restent consultables dans un onglet « Archives » (lecture seule, recherche/filtre par date, client, statut).

G. Gérer son compte et son profil formateur

Page « Mon profil » permettant de modifier : photo de profil (upload vers Supabase Storage), nom/prénom, date de naissance, SIRET, coordonnées de contact, et une liste de parcours de formation proposés (ajout/suppression de tags ou de fiches formation, utilisés pour alimenter le catalogue public).

H. Demande de budget pour un prospect

Formulaire « Nouvelle demande de budget » : nom de l'entreprise prospect, contact, besoin de formation, volume/nombre de participants estimé, budget ou fourchette souhaitée, commentaire libre.

Chaque demande crée un enregistrement demandes_budget (statut en attente) visible par le formateur (suivi de ses propres demandes : en attente / en cours d'étude / validée / refusée) et par les admins Skills4mation qui la traitent.

5. Back-office Skills4mation (rôle admin)

Interface d'administration séparée pour l'équipe interne Skills4mation, avec :




Gestion des candidatures formateurs : liste des candidatures reçues depuis « Pôle formateur », détail, actions Valider / Refuser (la validation active le compte formateur et lui envoie ses accès).

Vue globale des dossiers de tous les formateurs, filtrable par statut (brouillon, en cours, documents générés, signés, financement déposé, complet, archivé), par formateur, par date.

Traitement des demandes de budget : liste de toutes les demandes, possibilité de changer leur statut (en cours d'étude / validée / refusée) et d'ajouter un commentaire visible par le formateur.

Suivi des accords de financement et documents déposés par dossier, avec possibilité de télécharger/consulter chaque pièce.

Notifications par email (via Supabase) aux formateurs à chaque changement de statut important (candidature validée, documents générés, demande de budget traitée).

6. Modèle de données (suggestion de tables Supabase)

profiles (id, role [formateur|admin], prenom, nom, email, photo_url, date_naissance, siret, telephone, statut_candidature, created_at)

parcours_formation (id, formateur_id, titre, description, ordre)

dossiers (id, formateur_id, entreprise_nom, statut, drive_folder_url, documents_json, created_at, updated_at, archived_at)

documents_dossier (id, dossier_id, type [signé|accord_financement|qualiopi_final], fichier_url, uploaded_at)

demandes_budget (id, formateur_id, entreprise_prospect, contact, besoin, budget_estime, statut, commentaire_admin, created_at)

candidatures (id, prenom, nom, email, telephone, expertise, message, statut, created_at)

7. Intégration Tally + Make + Google Drive (point d'attention important)

La génération des documents Qualiopi ne se fait pas dans l'application elle-même : elle est déléguée à un scénario Make déclenché par la soumission du formulaire Tally embarqué dans le SaaS (https://tally.so/r/Zj9ABV). Le rôle du SaaS est de :




Créer le dossier et transmettre son identifiant au formulaire Tally (paramètres cachés).

Exposer un webhook entrant (Supabase Edge Function) que Make appelle une fois les documents générés et déposés dans le dossier Google Drive, afin de recevoir en retour au minimum le lien du dossier Drive (et idéalement les liens des fichiers individuels).

Mettre à jour l'interface du formateur en conséquence (statut, lien de téléchargement, notification).




Merci de prévoir clairement cette route webhook côté Supabase (nom de la fonction, format JSON attendu en entrée) afin qu'elle puisse être branchée facilement à un scénario Make externe (non développé dans Lovable).

8. Priorités de construction

Auth Supabase + rôles + RLS.

Site vitrine (public).

Espace formateur : profil (G), création de dossier avec embed Tally (A), réception du lien Drive via webhook (B).

Uploads documents (C, D, E) + statuts + archivage (F).

Demandes de budget (H).

Back-office admin complet (candidatures, dossiers, demandes de budget).

Notifications email.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://skills4mation.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d8ba8821-9093-4866-919b-ab800e336108).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
