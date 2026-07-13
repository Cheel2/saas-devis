## Jalon 1 — Fondations & Auth

T-001 : Initialiser le projet Next.js avec la structure de dossiers
Desc : Créer le projet Next.js 15, configurer TypeScript strict, Tailwind CSS, shadcn/ui, et l'arborescence des dossiers.
AC :
- Créer le projet Next.js 15 avec App Router
- Configurer TypeScript en mode strict
- Installer et configurer Tailwind CSS 4
- Installer shadcn/ui et les composants de base (Button, Input, Dialog, Table, Badge, Card)
- Créer les dossiers app/, components/, lib/, services/, types/
Verif : npm run dev démarre sans erreur. La structure de dossiers correspond au CONTEXT.md.
Deps : Aucune (Fondation)
Files : package.json, tsconfig.json, tailwind.config.ts, app/layout.tsx, app/page.tsx

T-002 : Configurer les clients Supabase et les variables d'environnement
Desc : Créer les clients Supabase browser et server, configurer les variables d'environnement, et générer les types TypeScript.
AC :
- Créer le fichier .env.local avec les variables Supabase (URL, anon key, service role key)
- Créer lib/supabase/client.ts (browser client)
- Créer lib/supabase/server.ts (server client avec service_role)
- Générer les types TypeScript depuis le schéma Supabase (npm run db:types)
- Créer types/database.ts avec les types générés
Verif : Les clients Supabase se connectent sans erreur. Les types sont générés et compilés.
Deps : T-001
Files : .env.local, lib/supabase/client.ts, lib/supabase/server.ts, types/database.ts

T-003 : Exécuter le DDL SQL et créer les tables dans Supabase
Desc : Exécuter le script SQL complet (6 tables + devis_counter + fonction generer_numero_devis) dans l'éditeur SQL Supabase.
AC :
- Créer les tables entreprise, utilisateur, client, devis, ligne_devis, audit_log
- Créer la table devis_counter
- Créer la fonction generer_numero_devis()
- Créer les index recommandés
- Vérifier que toutes les tables existent dans le schema public
Verif : SELECT * FROM information_schema.tables WHERE table_schema = 'public' retourne 8 tables.
Deps : Aucune (Fondation)
Files : (script SQL exécuté dans Supabase)

T-004 : Activer le RLS et créer les politiques pour entreprise et utilisateur
Desc : Activer le RLS sur les 6 tables et créer les politiques pour les tables entreprise et utilisateur.
AC :
- Activer RLS sur les 6 tables
- Créer la politique entreprise_select (tous les utilisateurs actifs voient leur entreprise)
- Créer la politique entreprise_update_manager (manager uniquement)
- Créer la politique entreprise_delete_interdit (false)
- Créer la politique utilisateur_select (membres de l'entreprise)
- Créer la politique utilisateur_insert_manager (manager uniquement)
- Créer la politique utilisateur_update_manager (manager uniquement)
- Créer la politique utilisateur_delete_interdit (false)
Verif : Tester avec un utilisateur commercial : il peut lire son entreprise mais pas la modifier. Tester avec un manager : il peut modifier.
Deps : T-003
Files : (script SQL exécuté dans Supabase)

T-005 : Créer les politiques RLS pour client, devis, ligne_devis et audit_log
Desc : Créer les politiques RLS restantes pour les tables client, devis, ligne_devis et audit_log.
AC :
- Créer les politiques client_select, client_insert, client_update, client_delete_interdit
- Créer les politiques devis_select_commercial, devis_select_manager, devis_insert_commercial, devis_insert_manager, devis_update_commercial, devis_update_manager, devis_delete_interdit
- Créer les politiques ligne_devis_select_commercial, ligne_devis_select_manager, ligne_devis_insert_commercial, ligne_devis_insert_manager, ligne_devis_update_commercial, ligne_devis_update_manager, ligne_devis_delete_interdit
- Créer les politiques audit_log_select, audit_log_insert_interdit, audit_log_update_interdit, audit_log_delete_interdit
Verif : Tester avec un commercial : il ne voit que ses devis. Tester avec un manager : il voit tous les devis. Vérifier qu'aucun DELETE dur ne fonctionne.
Deps : T-004
Files : (script SQL exécuté dans Supabase)

T-006 : Implémenter le middleware d'authentification et le layout protégé
Desc : Créer le middleware Next.js qui vérifie la session JWT, redirige vers login si non authentifié, et refuse l'accès si l'entreprise est inactive.
AC :
- Créer le middleware qui vérifie le JWT Supabase
- Rediriger vers /login si l'utilisateur n'est pas authentifié
- Vérifier que l'entreprise de l'utilisateur est active (is_active = true)
- Rediriger vers /entreprise-inactive si l'entreprise est inactive
- Créer le layout dashboard avec sidebar, header, et slot pour les pages
Verif : Accéder à /dashboard sans session : redirection vers /login. Se connecter avec une entreprise inactive : redirection vers /entreprise-inactive.
Deps : T-002, T-004
Files : middleware.ts, app/(dashboard)/layout.tsx, components/layout/Sidebar.tsx, components/layout/Header.tsx

T-007 : Implémenter le module Indicateur Connexion
Desc : Créer le composant Indicateur Connexion qui affiche l'état online/offline en temps réel dans le header.
AC :
- Créer le composant ConnectionIndicator qui utilise navigator.onLine
- Écouter les événements online et offline du navigateur
- Afficher un indicateur visuel (vert = online, rouge = offline) dans le header
- Afficher un message explicatif quand le service est offline
- Bloquer la soumission des formulaires quand offline
Verif : Déconnecter le réseau : l'indicateur passe au rouge. Les boutons de soumission sont désactivés.
Deps : T-006
Files : components/indicators/ConnectionIndicator.tsx

T-008 : Implémenter le module Entreprise (profil et formulaire)
Desc : Créer la page et le formulaire de profil entreprise (raison sociale, logo, coordonnées bancaires, CG, préfixe, durée validité).
AC :
- Créer la page /entreprise avec le formulaire de profil
- Afficher les données actuelles de l'entreprise
- Permettre la modification du profil (manager uniquement)
- Permettre l'upload du logo (compression côté client, max 500x500px, < 200KB)
- Afficher un message d'erreur si l'upload échoue
- Mettre à jour le profil via l'API PUT /api/entreprise
Verif : Un manager peut modifier le profil. Un commercial voit le profil en lecture seule. Le logo est compressé et stocké.
Deps : T-006, T-007
Files : app/(dashboard)/entreprise/page.tsx, components/modules/EntrepriseForm.tsx, services/entreprise.ts

T-009 : Implémenter le module Auth (invitation d'utilisateurs)
Desc : Créer la page de gestion des utilisateurs avec invitation (email + rôle) et liste des membres.
AC :
- Créer la page /utilisateurs avec la liste des utilisateurs de l'entreprise
- Créer le formulaire d'invitation (email + rôle commercial/manager)
- Appeler l'API POST /api/utilisateurs pour créer l'utilisateur
- Afficher la liste avec rôle, statut actif, date d'invitation
- Empêcher l'invitation si l'email existe déjà dans l'entreprise
Verif : Un manager invite un commercial. Le commercial apparaît dans la liste. Un commercial ne peut pas accéder à /utilisateurs.
Deps : T-006, T-008
Files : app/(dashboard)/utilisateurs/page.tsx, components/modules/UserInviteForm.tsx, components/modules/UserList.tsx, services/utilisateurs.ts

T-010 : Tester le Jalon 1 (fondations et auth)
Desc : Écrire les tests qui vérifient que le Jalon 1 est complet : auth, RLS, entreprise, indicateur connexion.
AC :
- Vérifier que le middleware redirige correctement les non-authentifiés
- Vérifier que le middleware redirige les entreprises inactives
- Vérifier que le RLS isole correctement les données entre entreprises
- Vérifier que le commercial ne peut pas modifier le profil entreprise
- Vérifier que le manager peut inviter un utilisateur
- Vérifier que l'indicateur de connexion reflète l'état réseau
Verif : npm run test (tests unitaires) + tests manuels dans le navigateur.
Deps : T-001 à T-009
Files : (tests dans les fichiers existants)

## Jalon 2 — Noyau Métier

T-011 : Implémenter le module Client (CRUD annuaire)
Desc : Créer la page et le formulaire de gestion des clients (CRUD avec soft-delete).
AC :
- Créer la page /clients avec la liste paginée (20 par page)
- Créer le formulaire d'ajout de client (nom, téléphone, email, adresse)
- Créer le formulaire de modification de client
- Implémenter le soft-delete (PATCH /api/clients/[id]/supprimer)
- Implémenter la recherche par nom (ILIKE prefix)
- Afficher les messages d'erreur de validation
Verif : Créer un client. Le client apparaît dans la liste. Modifier le client. Supprimer le client (soft-delete). Le client disparaît de la liste mais reste en base.
Deps : T-010
Files : app/(dashboard)/clients/page.tsx, components/modules/ClientForm.tsx, components/modules/ClientList.tsx, app/api/clients/route.ts, app/api/clients/[id]/route.ts

T-012 : Implémenter le module Devis (création avec lignes)
Desc : Créer le formulaire de création de devis avec ajout dynamique de lignes de prestation.
AC :
- Créer la page /devis/nouveau avec le formulaire de création
- Sélectionner un client dans l'annuaire (dropdown)
- Ajouter des lignes de prestation dynamiquement (description, quantité, prix unitaire)
- Calculer le sous-total de chaque ligne (côté client pour l'affichage, côté serveur pour la persistance)
- Limiter à 50 lignes maximum
- Valider que quantité > 0, prix > 0, description non vide
- Appeler l'API POST /api/devis pour créer le devis
- Le numéro est généré automatiquement par la fonction SQL
Verif : Créer un devis avec 3 lignes. Le numéro est au format DEV-YYYY-XXXX. Le total est correct. Le devis est en statut brouillon.
Deps : T-011
Files : app/(dashboard)/devis/nouveau/page.tsx, components/modules/DevisForm.tsx, components/modules/LigneDevisForm.tsx, app/api/devis/route.ts

T-013 : Implémenter le module Devis (liste filtrée par statut)
Desc : Créer la page de liste des devis avec filtres par statut et pagination.
AC :
- Créer la page /devis avec la liste paginée
- Afficher les colonnes : numéro, client, statut, date, total
- Implémenter les filtres par statut (brouillon, en_attente, valide, refuse)
- Un commercial ne voit que ses propres devis
- Un manager voit tous les devis de l'entreprise
- Afficher le badge de statut avec la couleur correspondante
- Implémenter la pagination (20 par défaut, max 50)
Verif : Se connecter en commercial : voir uniquement ses devis. Se connecter en manager : voir tous les devis. Filtrer par statut : la liste se met à jour.
Deps : T-012
Files : app/(dashboard)/devis/page.tsx, components/modules/DevisList.tsx, components/modules/DevisFilters.tsx, app/api/devis/route.ts

T-014 : Implémenter le module Devis (détail et modification)
Desc : Créer la page de détail d'un devis avec possibilité de modification (si brouillon).
AC :
- Créer la page /devis/[id] avec les détails du devis
- Afficher les informations du devis (numéro, client, statut, dates, total, lignes)
- Permettre la modification si le statut est 'brouillon' (commercial uniquement)
- Bloquer la modification si le statut n'est pas 'brouillon' (vérification côté serveur)
- Permettre l'ajout, la modification et la suppression de lignes
- Recalculer le total automatiquement
Verif : Ouvrir un devis brouillon : le formulaire est éditable. Modifier une ligne : le total se met à jour. Soumettre : le devis passe en attente. Revenir : le formulaire est en lecture seule.
Deps : T-013
Files : app/(dashboard)/devis/[id]/page.tsx, components/modules/DevisDetail.tsx, app/api/devis/[id]/route.ts

T-015 : Implémenter le workflow de validation (soumission, validation, refus)
Desc : Implémenter les transitions de statut du devis : soumission (commercial), validation (manager), refus (manager).
AC :
- Créer l'endpoint PATCH /api/devis/[id]/soumettre (commercial → en_attente)
- Créer l'endpoint PATCH /api/devis/[id]/valider (manager → valide)
- Créer l'endpoint PATCH /api/devis/[id]/refuser (manager → brouillon + commentaire)
- Vérifier que le commercial ne peut pas valider/refuser
- Vérifier que le manager peut valider/refuser
- Vérifier que le refus rebascule le statut à brouillon
- Vérifier que le commentaire de refus est stocké
- Envoyer une notification au manager quand un devis est soumis
Verif : Soumettre un devis : statut passe à en_attente. Le manager reçoit une notification. Valider : statut passe à valide. Refuser : statut rebascule à brouillon avec commentaire.
Deps : T-014
Files : app/api/devis/[id]/soumettre/route.ts, app/api/devis/[id]/valider/route.ts, app/api/devis/[id]/refuser/route.ts, components/modules/DevisActions.tsx

T-016 : Tester le Jalon 2 (noyau métier)
Desc : Écrire les tests qui vérifient que le Jalon 2 est complet : client CRUD, devis CRUD, workflow validation.
AC :
- Vérifier que le client CRUD fonctionne (création, lecture, modification, soft-delete)
- Vérifier que le devis se crée avec un numéro unique
- Vérifier que le commercial ne voit que ses devis
- Vérifier que le manager voit tous les devis
- Vérifier que le commercial ne peut pas modifier un devis en attente
- Vérifier que le manager peut valider et refuser
- Vérifier que le refus rebascule à brouillon
- Vérifier que max 50 lignes est respecté
Verif : npm run test + tests manuels dans le navigateur.
Deps : T-011 à T-015
Files : (tests dans les fichiers existants)

## Jalon 3 — Workflow & PDF

T-017 : Implémenter le module Notification (badge in-app + email)
Desc : Créer le système de notification qui alerte le manager quand un devis est soumis en validation.
AC :
- Créer le composant NotificationBadge qui affiche le nombre de devis en attente
- Implémenter la logique de comptage des devis en attente pour le manager
- Afficher le badge dans le header
- Implémenter l'envoi d'email au manager (via Supabase Edge Function ou service externe gratuit)
- Marquer les notifications comme lues quand le manager consulte la liste
Verif : Soumettre un devis : le badge du manager affiche +1. Le manager reçoit un email. Consulter la liste : le badge disparaît.
Deps : T-016
Files : components/modules/NotificationBadge.tsx, components/layout/Header.tsx, app/api/notifications/route.ts

T-018 : Implémenter le module PDF (Edge Function de génération)
Desc : Créer l'Edge Function Supabase qui génère un PDF à partir d'un devis validé.
AC :
- Créer l'Edge Function supabase/functions/generate-pdf
- Récupérer le devis, les lignes, le client et l'entreprise en une seule requête SQL
- Générer le HTML du template PDF (logo, coordonnées, lignes, total)
- Convertir le HTML en PDF (utiliser une librairie légère compatible Deno)
- Compresser le logo avant injection
- Vérifier que le PDF pèse < 1 Mo (Must), < 600 KB (Plan)
- Retourner le PDF en base64 ou en blob
Verif : Appeler l'Edge Function avec un devis validé. Le PDF est généré. La taille est < 1 Mo. Le contenu est correct.
Deps : T-016
Files : supabase/functions/generate-pdf/index.ts

T-019 : Implémenter le module PDF (endpoint API et téléchargement)
Desc : Créer l'endpoint API et le bouton de téléchargement du PDF côté client.
AC :
- Créer l'endpoint GET /api/devis/[id]/pdf qui appelle l'Edge Function
- Vérifier que le devis est en statut 'valide' avant de générer
- Retourner le PDF avec le bon Content-Type (application/pdf)
- Créer le bouton "Télécharger PDF" sur la page de détail du devis
- Nommer le fichier téléchargé : [numero_devis].pdf
Verif : Cliquer sur "Télécharger PDF" sur un devis validé. Le fichier se télécharge. Le nom est correct. Le contenu est lisible.
Deps : T-018
Files : app/api/devis/[id]/pdf/route.ts, components/modules/PdfDownloadButton.tsx

T-020 : Implémenter le module Audit Trail (traçage des actions)
Desc : Créer le système d'audit qui trace 100% des actions critiques dans la table audit_log.
AC :
- Créer la fonction d'écriture d'audit (via service_role) dans services/audit.ts
- Tracer la création de devis (action: 'creation', entite: 'devis')
- Tracer la modification de devis (action: 'modification')
- Tracer la validation et le refus (action: 'validation', 'refus')
- Tracer le soft-delete de client et devis
- Tracer l'invitation d'utilisateur
- Afficher les logs d'audit sur la page /audit
- Implémenter la pagination des logs (20 par page)
Verif : Créer un devis. Un log apparaît dans /audit avec l'auteur, l'action, l'horodatage. Valider le devis. Un nouveau log apparaît.
Deps : T-016
Files : services/audit.ts, app/(dashboard)/audit/page.tsx, components/modules/AuditLogList.tsx, app/api/audit/route.ts

T-021 : Tester le Jalon 3 (workflow, PDF, audit)
Desc : Écrire les tests qui vérifient que le Jalon 3 est complet.
AC :
- Vérifier que la notification s'affiche quand un devis est soumis
- Vérifier que le PDF se génère et pèse < 1 Mo
- Vérifier que le PDF n'est pas générable si le devis n'est pas validé
- Vérifier que l'audit trail trace 100% des actions critiques
- Vérifier que les logs sont paginés correctement
- Vérifier que les logs sont filtrables par action et par auteur
Verif : npm run test + tests manuels dans le navigateur.
Deps : T-017 à T-020
Files : (tests dans les fichiers existants)

## Jalon 4 — Dashboard & Améliorations

T-022 : Implémenter le module Dashboard (statistiques)
Desc : Créer la page de tableau de bord avec les agrégations de devis par semaine et par statut.
AC :
- Créer la page /tableau-de-bord
- Afficher le nombre de devis créés par semaine (graphique ou compteur)
- Afficher la répartition par statut (brouillon, en_attente, valide, refuse)
- Implémenter le filtre par période (semaine, mois)
- L'endpoint GET /api/tableau-de-bord retourne les agrégations
- Utiliser une requête SQL GROUP BY pour les agrégations
Verif : Le dashboard affiche les statistiques correctes. Changer de période met à jour les données.
Deps : T-021
Files : app/(dashboard)/tableau-de-bord/page.tsx, components/modules/DashboardStats.tsx, app/api/tableau-de-bord/route.ts

T-023 : Implémenter la duplication de devis
Desc : Créer la fonctionnalité de duplication d'un devis existant.
AC :
- Ajouter le bouton "Dupliquer" sur la page de détail d'un devis
- Créer l'endpoint POST /api/devis/[id]/dupliquer
- Copier le client, les lignes (description, quantité, prix unitaire)
- Créer un nouveau devis en statut brouillon avec un nouveau numéro atomique
- Ne pas copier le statut, le commentaire de refus, ni les dates
- Rediriger vers le nouveau devis en édition
Verif : Dupliquer un devis. Un nouveau devis brouillon est créé avec les mêmes lignes. Le numéro est différent.
Deps : T-021
Files : app/api/devis/[id]/dupliquer/route.ts, components/modules/DuplicateDevisButton.tsx

T-024 : Implémenter la gestion complète des utilisateurs (modification, désactivation)
Desc : Compléter le module Utilisateur avec modification et désactivation.
AC :
- Ajouter le formulaire de modification d'utilisateur (nom, rôle, is_active)
- Créer l'endpoint PUT /api/utilisateurs/[id]
- Implémenter la désactivation (PATCH /api/utilisateurs/[id]/desactiver)
- Vérifier côté serveur que ce n'est pas le dernier manager actif
- Afficher un message d'erreur si la désactivation est bloquée
- Mettre à jour la liste en temps réel après désactivation
Verif : Désactiver un commercial. Le commercial disparaît de la liste. Tenter de désactiver le dernier manager : un message d'erreur bloque l'action.
Deps : T-021
Files : app/api/utilisateurs/[id]/route.ts, app/api/utilisateurs/[id]/desactiver/route.ts, components/modules/UserEditForm.tsx

T-025 : Tester le Jalon 4 (dashboard, duplication, gestion utilisateurs)
Desc : Écrire les tests qui vérifient que le Jalon 4 est complet.
AC :
- Vérifier que le dashboard affiche les bonnes statistiques
- Vérifier que la duplication crée un nouveau devis brouillon
- Vérifier que la désactivation du dernier manager est bloquée
- Vérifier que la modification d'utilisateur met à jour les données
Verif : npm run test + tests manuels dans le navigateur.
Deps : T-022 à T-024
Files : (tests dans les fichiers existants)

## Jalon 5 — Intégration & Qualité

T-026 : Implémenter les tests end-to-end du workflow complet
Desc : Écrire les tests Playwright qui simulent le workflow complet de création à validation.
AC :
- Tester le scénario : Manager crée entreprise → invite Commercial → Commercial crée client → Commercial crée devis → Commercial soumet devis → Manager reçoit notification → Manager valide devis → Manager télécharge PDF
- Tester le scénario de refus : Manager refuse devis → devis rebascule en brouillon
- Tester le scénario de désactivation : Manager désactive Commercial → Commercial ne peut plus se connecter
- Tester le scénario RLS : Commercial tente d'accéder aux devis d'un autre commercial → accès refusé
Verif : npm run test:e2e. Tous les scénarios passent.
Deps : T-025
Files : e2e/workflow-complete.spec.ts, e2e/workflow-refus.spec.ts, e2e/workflow-desactivation.spec.ts, e2e/rls-isolation.spec.ts

T-027 : Auditer les performances (FCP, bundle, API)
Desc : Mesurer et optimiser les performances selon les NFRs.
AC :
- Mesurer le FCP avec Lighthouse sur les pages principales (dashboard, liste devis, détail devis)
- Vérifier que FCP < 2.5s (Must) sur toutes les pages
- Mesurer le JS bundle initial avec next-bundle-analyzer
- Vérifier que le bundle < 150 KB gzippé (Plan)
- Mesurer la latence API des endpoints critiques (liste devis, création devis, génération PDF)
- Vérifier que API < 800ms (Must) en p95
- Documenter les résultats dans un rapport de performance
Verif : Lighthouse score > 90. Bundle analyzer < 150 KB. Logs de latence API < 800ms.
Deps : T-025
Files : scripts/perf-audit.ts, docs/performance-report.md

T-028 : Réviser la sécurité RLS et les autorisations
Desc : Vérifier que toutes les politiques RLS sont correctes et qu'aucune fuite de données n'existe.
AC :
- Auditer chaque politique RLS avec un utilisateur de chaque rôle
- Vérifier qu'un commercial ne peut pas lire les devis d'un autre commercial
- Vérifier qu'un commercial ne peut pas modifier un devis en attente
- Vérifier qu'un commercial ne peut pas valider un devis
- Vérifier qu'aucun utilisateur ne peut faire de hard delete
- Vérifier que l'audit log est immuable (pas de modification possible)
- Vérifier que le service_role key n'est pas exposé côté client
- Documenter les résultats dans un rapport de sécurité
Verif : Tests manuels + tests automatisés. Aucune fuite détectée.
Deps : T-025
Files : docs/security-audit.md, scripts/rls-test.ts

T-029 : Implémenter le rate limiting et la gestion des erreurs
Desc : Ajouter le rate limiting côté client et finaliser la gestion des erreurs globale.
AC :
- Implémenter le debounce sur la création de devis (2 secondes minimum entre deux soumissions)
- Implémenter le debounce sur la génération de PDF
- Vérifier que tous les endpoints retournent le format d'erreur unique
- Vérifier que les messages d'erreur sont en français
- Vérifier que les erreurs 429 (trop de requêtes) sont gérées côté client
- Implémenter le retry automatique côté client pour les erreurs réseau (max 3 tentatives)
Verif : Cliquer rapidement sur "Créer" : le deuxième clic est ignoré. Couper le réseau : 3 retries puis message d'erreur.
Deps : T-025
Files : lib/utils/debounce.ts, lib/utils/retry.ts, components/ui/ErrorAlert.tsx

T-030 : Finaliser la documentation et le déploiement
Desc : Documenter le projet, créer le README, et déployer sur Vercel.
AC :
- Créer le README.md avec les instructions d'installation, de configuration et de déploiement
- Documenter les variables d'environnement nécessaires
- Documenter les commandes de build et de test
- Déployer le projet sur Vercel (tier Hobby)
- Vérifier que le déploiement fonctionne (pas d'erreur 500)
- Vérifier que les Edge Functions sont déployées sur Supabase
- Créer un fichier CHANGELOG.md avec les fonctionnalités livrées
Verif : L'application est accessible en production. Les workflows principaux fonctionnent.
Deps : T-026 à T-029
Files : README.md, CHANGELOG.md, .env.example
