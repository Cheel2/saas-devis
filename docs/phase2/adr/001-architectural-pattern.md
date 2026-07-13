# ADR-001 : Choix du pattern architectural — Monolithe Modulaire avec architecture Layered

## Contexte

SaaS Devis est un produit de gestion de devis destiné aux PME structurées en Côte d'Ivoire (5 à 50 employés). Le workflow métier est linéaire : un Commercial crée un devis, le soumet en validation, un Manager approuve ou refuse, puis le PDF est téléchargé et envoyé via WhatsApp ou email. La monnaie est le FCFA (pas de multi-devises), la langue est le français uniquement.

**Modèle de données** : Relationnel (SQL). Les entités (Entreprise, Utilisateur, Client, Devis, LigneDevis) sont fortement structurées avec des relations déterministes et des contraintes d'intégrité référentielle. Le workflow de validation et la numérotation atomique des devis exigent des transactions ACID.

**Workload** : OLTP (Online Transaction Processing). Le système exécute des opérations CRUD transactionnelles courtes (création de devis, changements de statut, génération ponctuelle de PDF). Il n'y a pas de reporting analytique massif ni d'agrégations complexes sur de grands volumes historiques.

**Cohérence requise** : Forte (ACID). La numérotation des devis via séquence SQL atomique, le workflow de validation (brouillon → en attente → validé/refusé), le Row Level Security (RLS) multi-tenant, le soft-delete obligatoire et l'audit trail à 100% des actions critiques imposent une cohérence transactionnelle stricte.

## Décision

**Pattern de déploiement choisi** : Monolithe Modulaire.

Le frontend Next.js (déployé sur Vercel) et le backend Supabase (PostgreSQL, Auth, Edge Functions) forment un déploiement unifié sans orchestration distribuée. Les modules métier (Auth, Devis, Client, PDF) sont séparés par frontières de code claires au sein d'une même base de code.

**Pattern de traitement associé** : Synchrone.

Le workflow est linéaire avec un seul déclencheur utilisateur à la fois. La génération de PDF via Edge Function Supabase est une opération ponctuelle synchrone. Aucun découplage temporel, aucun consommateur multiple, aucune file d'attente n'est nécessaire.

**Pattern de code associé** : Layered (Architecture en couches).

Séparation horizontale en couches (Présentation / Métier / Données) où la couche données appelle directement Supabase via `supabase-js`. Ce choix maximise la simplicité opérationnelle (criticité 5/5) et respecte la contrainte de budget nul (criticité 5/5).

## Justification

**Reliability** : Le Monolithe Modulaire élimine les risques de partitionnement réseau inhérents aux systèmes distribués. Avec un seul point de déploiement (Vercel + Supabase), il n'y a pas de défaillance inter-service. La fiabilité dépend uniquement des SLA des tiers gratuits, ce qui est acceptable car la criticité de la disponibilité est 3/5 et la tolérance aux pannes est faible (le workflow de création de devis n'est pas une mission critique temps réel).

**Scalability** : Les plafonds des tiers gratuits (Vercel Hobby, Supabase Free) seront le bottleneck avant l'architecture elle-même. Le trafic prévisionnel est < 5 req/sec par entreprise (criticité 1/5), le volume de données est < 1 GB par entreprise (criticité 1/5). Le Monolithe Modulaire est donc adéquat pour les premières dizaines d'entreprises. Les limites sont acceptables car elles coïncident avec les contraintes du budget nul.

**Maintainability** : L'architecture Layered est viable pour une équipe réduite car elle ne requiert pas de formation spécifique sur des patterns complexes (Hexagonal, CQRS). Les modules métier clairs (Auth, Devis, Client, PDF) limitent le couplage. Le risque de "boule de boue" est atténué par l'application stricte de frontières de dossiers métier. Le temps de mise en œuvre du MVP est rapide (quelques semaines).

**Cohérence** : Le Monolithe Modulaire sur PostgreSQL (Supabase) offre une cohérence transactionnelle native (ACID). Toutes les tables métier bénéficient du RLS, du soft-delete, de la numérotation atomique et de l'audit trail sans synchronisation inter-services. Cela répond directement à la criticité 4/5 de la cohérence forte.

**Risques distribués** : Non applicables. Il n'y a pas de réseau inter-services, pas de réplication multi-zone, pas de consensus distribué. Les seuls risques réseau sont ceux entre le client et Supabase (ou Vercel), gérés par les protocoles HTTPS standards. La latence p95 API < 800 ms (Must) est atteignable car les appels sont directs sans chatter réseau inter-services.

## Compromis acceptés

**Couplage fort avec Supabase** : L'architecture Layered appelle directement `supabase-js` dans la couche données, ce qui rend la migration future vers un autre backend coûteuse. **Stratégie d'atténuation** : Structurer les appels Supabase dans des services dédiés par entité (ex: `services/devis.ts`, `services/client.ts`) pour que la surface de couplage soit localisée et identifiable. Documenter chaque dépendance directe à Supabase dans un registre technique.

**Impossibilité de scaler indépendamment la génération PDF** : Le Monolithe Modulaire ne permet pas d'isoler la génération de PDF du reste de l'application. Si cette opération devient lente, elle impacte l'ensemble. **Stratégie d'atténuation** : La génération PDF est déjà confinée dans une Edge Function Supabase (serveur), ce qui isole l'exécution du frontend. Maintenir la taille PDF < 600 KB (Plan) pour garantir un temps de génération < 800 ms (Must).

## Risques résiduels

**Dépendance aux SLA des tiers gratuits** : Probabilité : Élevée (les tiers gratuits ne garantissent pas de SLA). Impact : Moyen (indisponibilité temporaire acceptable pour une PME). **Mitigation** : Monitorer la disponibilité via l'indicateur de connexion visuel obligatoire (online/offline). Refuser la connexion si l'entreprise est inactive, mais informer l'utilisateur de l'état du service. Prévoir un message d'indisponibilité clair.

**Boule de boue (Big Ball of Mud)** : Probabilité : Moyenne (équipe réduite, pression MVP). Impact : Élevé (maintenabilité dégradée à long terme). **Mitigation** : Appliquer strictement la règle "un dossier = un module métier". Interdire les imports croisés entre modules. Réviser les frontières de code à chaque sprint.

## Plan d'évolution

**Points de fragilité** :
1. La génération de PDF côté Edge Function peut devenir un goulot d'étranglement si le nombre de devis simultanés dépasse les limites de l'Edge Function gratuite.
2. Le couplage avec Supabase rend toute migration technique complexe si le fournisseur change ses conditions d'utilisation ou ses tarifs.
3. L'absence de mode offline avancé (hors périmètre) pourrait devenir un besoin utilisateur si la connectivité réseau en Côte d'Ivoire se dégrade.

**Strangler pattern** : Si une migration vers une architecture plus distribuée devient nécessaire, extraire d'abord la génération de PDF dans un service indépendant (toujours sur Supabase Edge Functions, mais avec son propre cycle de déploiement). Ensuite, isoler le module Client comme service autonome. Conserver le monolithe comme façade pendant la transition.

**Seuils de réévaluation** :
- Si le trafic dépasse **50 req/sec simultanés** (10x la valeur planifiée de < 5 req/sec), réévaluer la capacité du tier gratuit Supabase et envisager un plan payant ou une extraction de service.
- Si le volume de données dépasse **10 GB total** (10x la valeur planifiée de < 1 GB par entreprise), réévaluer le stockage et les performances des requêtes.
- Si la latence p95 de l'API dépasse **800 ms (Must)** de manière récurrente (plus de 5% des requêtes sur une semaine), réévaluer la couche données et les index PostgreSQL.
- Si le nombre d'entreprises actives dépasse **100**, réévaluer la disponibilité 99.5% (Plan) car la criticité 3/5 pourrait augmenter avec la base de clients.

## Conséquences

**Positives** :
- Mise en place rapide du MVP (quelques semaines) grâce à la simplicité de l'architecture Layered.
- Zéro coût d'infrastructure respecté (Vercel Hobby + Supabase Free).
- Cohérence transactionnelle forte native (ACID) sans surcouche applicative.
- Testabilité acceptable via des tests d'intégration sur Supabase.
- Pas de complexité opérationnelle (pas de DevOps dédié requis).
- Mapping direct entre les routes API Next.js et les appels Supabase.

**Négatives** :
- Couplage fort avec Supabase : migration future coûteuse.
- Impossibilité de scaler indépendamment les modules (tout le système monte en version ensemble).
- Testabilité unitaire de la logique métier limitée par l'absence d'abstraction (nécessite des mocks complexes ou des tests d'intégration).
- Les plafonds des tiers gratuits sont le bottleneck avant l'architecture elle-même.
- Toute défaillance du tier Supabase ou Vercel impacte l'ensemble du système (pas de redondance).
