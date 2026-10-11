# Livre blanc et Mes ressources

## Résultat
- Créer `/livre-blanc`, publique et indexable, avec la couverture composée en HTML/CSS, les six apprentissages, le sommaire réel, quatre questions propres au guide et un résumé de 300 à 500 mots.
- Le fichier joint contient **30 pages**, et non 24 : le bouton annoncera « PDF, 30 pages ».
- Créer `/ressources` sous la garde existante `_app`, accessible à tout compte connecté, sans exigence de rôle. Téléchargement privé, profil minimal, déconnexion existante, prochains guides et lien vers la candidature existante.
- Ajouter seulement les liens et encarts demandés dans l’accueil, le portage, l’en-tête, le pied de page, le sitemap et robots.txt.

## Confidentialité
- Stocker le PDF dans un bucket privé ; délivrer un lien signé valable cinq minutes et enregistrer chaque téléchargement.
- Créer une table de téléchargements et une table distincte de consentement marketing, avec accès limité aux propres lignes de chaque utilisateur.
- La case marketing reste facultative et décochée. Son choix est conservé localement pendant la connexion puis enregistré au retour sur `/ressources`, sans conditionner le téléchargement.
- Conserver strictement l’authentification existante et le lien `/auth?next=/ressources`. Vérifier et signaler ses limites éventuelles pour un nouveau compte Google, sans la modifier.

## Présentation et référencement
- Réutiliser les polices, boutons et utilitaires existants, sans refonte globale. Appliquer les couleurs demandées uniquement aux nouvelles pages.
- Ajouter les métadonnées et les données structurées Report + Organization ; identifier clairement la partie réservée au téléchargement connecté.
- `/ressources` reste en noindex et hors sitemap. Aucun PDF public.

## Détails techniques
- Deux nouveaux fichiers de route, un module de ressources partagé et une nouvelle migration additive ; aucun fichier d’authentification ou d’intégration modifié.
- Pour la modification du sitemap autorisée, conserver ses listes et supprimer le risque de résultat partiel : lectures publiques paginées, erreurs explicites, aucun timestamp lastmod inventé.
- Vérifier les accès anonyme/connecté, l’isolation des nouvelles tables, l’expiration du lien, les liens ajoutés et l’affichage à 390 px et sur ordinateur.
- Aucune publication ; aucun compte ni dossier existant modifié.