## Section 1 : Composants du système

| Composant | Description | US couvertes | Dépend de |
|---|---|---|---|
| Module Auth | Gestion de l'authentification (email/mot de passe), des sessions JWT et de la vérification du statut actif de l'entreprise à la connexion. | US-1, US-2, US-9, US-12 | Aucune |
| Module Entreprise | Profil entreprise (logo, coordonnées bancaires, CG) et gestion du statut actif/inactif. | US-1 | Aucune |
| Module Client | Annuaire des clients (CRUD avec soft-delete) liés à une entreprise. | US-3 | Module Auth, Module Entreprise |
| Module Devis | Création, édition, consultation et workflow de validation des devis avec lignes de prestation (max 50 lignes). | US-4, US-5, US-7, US-11 | Module Auth, Module Client, Module Entreprise |
| Module Notification | Système de notification in-app (badge) et par email déclenché par les changements de statut des devis. | US-6 | Module Devis, Module Auth |
| Module PDF | Génération côté serveur (Edge Function) du PDF d'un devis validé avec contrainte de taille < 1 Mo. | US-8 | Module Devis |
| Module Dashboard | Visualisation des statistiques de création de devis (nombre par semaine). | US-10 | Module Devis |
| Module Audit Trail | Traçage systématique de 100% des actions critiques (création, modification, validation, suppression logique) avec horodatage et auteur. | US-1 à US-12 (transverse) | Module Auth |
| Module Indicateur Connexion | Indicateur visuel online/offline reflétant l'état de la connectivité réseau et la disponibilité du service. | US-9 (transverse) | Module Auth |

## Section 2 : Graphe de dépendances

1. **Module Auth** — Fondation. Aucune dépendance. Tout le système repose sur l'identification et l'isolation multi-tenant.
2. **Module Entreprise** — Fondation. Aucune dépendance. Le profil entreprise est requis pour la personnalisation des devis et la vérification du statut actif.
3. **Module Client** — Dépend de Module Auth (pour l'identification de l'utilisateur) et Module Entreprise (pour l'isolation multi-tenant via RLS).
4. **Module Devis** — Dépend de Module Auth, Module Client (sélection du client) et Module Entreprise (paramètres de numérotation et personnalisation).
5. **Module Notification** — Dépend de Module Devis (déclencheur sur changement de statut) et Module Auth (identification du destinataire Manager).
6. **Module PDF** — Dépend de Module Devis (données du devis à formater) et Module Entreprise (logo et coordonnées bancaires à injecter dans le document).
7. **Module Dashboard** — Dépend de Module Devis (agrégation des données de création de devis).
8. **Module Audit Trail** — Dépend de Module Auth (identification de l'auteur). S'intègre transversalement aux modules métier (Devis, Client, Entreprise, Auth).
9. **Module Indicateur Connexion** — Dépend de Module Auth (affichage conditionnel à l'état connecté). S'intègre transversalement à l'interface.

## Section 3 : Matrice des risques

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Dépassement des limites du tier gratuit Supabase (connexions, stockage, Edge Functions) suite à une croissance imprévue du nombre d'entreprises. | Moyenne | Élevé | Monitorer les quotas via le dashboard Supabase ; documenter les seuils de réévaluation définis dans l'ADR-001 (100 entreprises, 50 req/sec, 10 GB). |
| Génération PDF dépassant 1 Mo ou dépassant 800 ms (Must) à cause d'un template trop lourd ou d'images non optimisées. | Moyenne | Élevé | Fixer un template PDF léger (pas d'images haute résolution), compresser le logo entreprise côté serveur, valider la taille en sortie avant envoi. |
| RLS mal configuré sur une table métier, entraînant une fuite de données entre entreprises (violation de l'isolation multi-tenant). | Moyenne | Élevé | Revoir systématiquement chaque politique RLS avec une checklist ; exécuter des tests d'intégration vérifiant qu'un utilisateur ne peut lire/écrire que les données de son entreprise. |
| Indisponibilité du service due à l'absence de SLA sur les tiers gratuits (Vercel Hobby, Supabase Free), rendant l'application inaccessible pour les PME. | Élevée | Moyen | Implémenter le Module Indicateur Connexion dès le Jalon 1 ; afficher un message explicite en cas d'indisponibilité ; refuser la connexion proprement si l'entreprise est inactive. |
| Bundle JavaScript initial dépassant 150 KB gzippé (Plan) à cause d'importations non contrôlées ou d'absence de code splitting. | Faible | Moyen | Activer le code splitting natif de Next.js, auditer les dépendances à chaque ajout de librairie, mesurer le bundle avec `next-bundle-analyzer`. |
| Soft-delete obligatoire complexifiant les requêtes et dégradant les performances si l'index `is_deleted` est omis sur les tables volumineuses. | Moyenne | Moyen | Créer un index sur `is_deleted` pour chaque table métier ; utiliser des vues ou des wrappers de requête qui filtrent automatiquement les lignes supprimées. |
| Désactivation du dernier manager actif d'une entreprise, bloquant irrémédiablement la validation des devis et la gestion des utilisateurs. | Faible | Élevé | Implémenter une règle métier côté serveur (Edge Function ou trigger) qui interdit la désactivation si l'utilisateur est le dernier manager avec `is_deleted = false`. |
| Workflow de validation mal modélisé (statuts brouillon → en attente → validé/refusé) provoquant des transitions illégales ou des pertes de données lors du refus. | Moyenne | Moyen | Modéliser les transitions de statut comme une machine à états finis avec validation côté serveur ; un refus rebascule explicitement en Brouillon avec conservation de l'historique. |

## Section 4 : Jalons de validation

| Jalon | Livrables | Critère de validation |
|---|---|---|
| Jalon 1 — Fondations & Auth | Module Auth (connexion, invitation, rôles), Module Entreprise (profil, statut actif/inactif), Module Indicateur Connexion, RLS sur toutes les tables fondations. | Un Manager peut créer un profil entreprise, inviter un Commercial, se connecter. La connexion est refusée si l'entreprise est inactive. L'indicateur online/offline reflète l'état réel du réseau. |
| Jalon 2 — Noyau Métier (Client & Devis) | Module Client (CRUD avec soft-delete), Module Devis (création, édition, liste filtrée par statut, max 50 lignes, validation métier). | Un Commercial peut créer un client, créer un devis avec lignes, consulter ses devis par statut. Les règles de validation (quantité > 0, prix > 0, description obligatoire) bloquent la soumission si non respectées. |
| Jalon 3 — Workflow & PDF | Module Notification (badge in-app + email au Manager), Module PDF (génération Edge Function < 1 Mo), Module Audit Trail (traçage 100% des actions critiques). | Un Manager reçoit une notification quand un devis passe en attente. Le Manager peut approuver/refuser avec commentaire. Le PDF généré d'un devis validé pèse < 1 Mo. L'audit trail enregistre chaque action avec auteur et horodatage. |
| Jalon 4 — Dashboard & Améliorations | Module Dashboard (devis par semaine), duplication de devis, gestion des utilisateurs (modification, désactivation). | Le Manager visualise un graphique ou un compteur de devis créés par semaine. Un Commercial peut dupliquer un devis existant. La désactivation du dernier manager est bloquée côté serveur. |
| Jalon 5 — Intégration & Qualité | Tests end-to-end du workflow complet, audit de performance (FCP, API, bundle), revue de sécurité RLS. | FCP < 2.5s (Must) sur les pages principales. API CRUD < 800 ms (Must) en p95. Bundle JS initial < 150 KB gzippé (Plan). Aucune fuite de données inter-entreprise détectée lors des tests RLS. |
