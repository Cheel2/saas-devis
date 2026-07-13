# Exigences Non-Fonctionnelles (NFR) — SaaS Devis MVP

## Version : 1.0.0 — Phase 1 (NFR Engineering)
## Date : 2026-07-11
## Statut : Proposition — En attente de validation du Product Champion

---

> **Contexte métier :** Ce SaaS cible des PME structurées en Côte d'Ivoire (5 à 50 employés) opérant dans un environnement de connectivité internet intermittente et des forfaits data limités. Les utilisateurs accèdent principalement via navigateur mobile. Toute métrique de performance doit donc privilégier la **légèreté**, la **rapidité perçue** et la **résilience aux réseaux faibles**.

---

## 1. PERFORMANCE

### NFR-PERF-01 : First Contentful Paint (FCP)
**Tag :** FCP_Loading
**Scale :** Secondes (temps entre la requête initiale et le premier rendu significatif)
**Meter :** Lighthouse CI (desktop + mobile 3G throttling), mesure sur 5 runs consécutifs, p95 retenu
**Must :** < 2.5 s (au-delà, l'utilisateur mobile en 3G considère l'application comme "lente" et risque d'abandon)
**Plan :** < 1.5 s (conforme à la contrainte spécifiée dans la spec ; objectif réaliste avec Next.js + code splitting + Tailwind purgé)
**Wish :** < 1.0 s (objectif long terme avec préchargement intelligent et cache Service Worker)
**Trace :** Affecte toutes les US (US-1 à US-12) — c'est la porte d'entrée de l'expérience utilisateur.
**Pourquoi :** En Côte d'Ivoire, la 3G reste prédominante en dehors des zones urbaines. Un FCP > 2.5s génère un taux de rebond > 40% sur mobile. Le forfait data est limité : l'utilisateur ne va pas attendre 5 secondes que la page charge.

---

### NFR-PERF-02 : Temps de Réponse API (CRUD Métier)
**Tag :** API_Response_Time
**Scale :** Millisecondes (temps entre la requête HTTP et la réponse complète JSON)
**Meter :** Tests automatisés (k6 ou Artillery) sur les endpoints critiques : liste devis, création devis, récupération client, génération PDF. Charge : 10 req/s simultanées, durée 3 min, p95 retenu.
**Must :** < 800 ms (au-delà, l'interface semble "figée" sur mobile, même avec indicateur de chargement)
**Plan :** < 400 ms (objectif réaliste avec Supabase eu-west-1, RLS optimisé, et index sur les clés étrangères `entreprise_id`)
**Wish :** < 200 ms (objectif long terme avec cache Redis côté Edge Function et requêtes préparées)
**Trace :** Affecte US-3 (création client), US-4 (création devis), US-5 (liste devis), US-8 (génération PDF)
**Pourquoi :** Les commerciaux créent des devis en déplacement, souvent sur des réseaux instables. Une API lente multiplie le risque de timeout et de perte de données saisies.

---

### NFR-PERF-03 : Taille du Bundle JavaScript Initial
**Tag :** JS_Bundle_Size
**Scale :** Kilooctets (KB) gzippé, mesuré sur le chunk initial chargé par le navigateur
**Meter :** `next build` + analyse webpack-bundle-analyzer, mesure du chunk `pages/_app` et dépendances critiques
**Must :** < 250 KB gzippé (au-delà, le temps de parsing sur un smartphone d'entrée de gamme dépasse 2s)
**Plan :** < 150 KB gzippé (objectif réaliste avec Next.js tree-shaking, dynamic imports, et suppression de dépendances non essentielles)
**Wish :** < 80 KB gzippé (objectif long terme avec remplacement progressif par des composants vanilla ou Svelte)
**Trace :** Affecte toutes les US — impact direct sur le FCP et la consommation data.
**Pourquoi :** Les forfaits data limités (souvent 1-5 Go/mois) font que chaque KB compte. Un bundle de 300 KB gzippé = ~1 Mo de data par chargement de page. Avec 20 visites/jour, cela représente 600 Mo/mois rien pour l'application.

---

### NFR-PERF-04 : Taille du PDF Généré
**Tag :** PDF_Size
**Scale :** Mégaoctets (Mo)
**Meter :** Génération de 20 PDF de référence (devis avec 5, 10 et 20 lignes de prestation, avec et sans logo) + mesure de la taille moyenne et du p95
**Must :** < 1.0 Mo (contrainte spécifiée dans la spec ; au-delà, WhatsApp compresse excessivement et le document perd en lisibilité)
**Plan :** < 600 Ko (objectif réaliste avec compression d'images, subset de polices, et génération côté serveur sans JS client lourd)
**Wish :** < 300 Ko (objectif long terme avec format vectoriel optimisé et images WebP intégrées)
**Trace :** Affecte US-8 (téléchargement PDF), US-4 (création devis), US-6 (notification)
**Pourquoi :** WhatsApp est le canal principal d'envoi. Un PDF > 1 Mo est refusé par certains opérateurs mobiles ou subit une compression agressive qui dégrade le logo et les tableaux. De plus, l'envoi consomme du forfait data du commercial.

---

### NFR-PERF-05 : Temps de Génération du PDF
**Tag :** PDF_Generation_Time
**Scale :** Secondes (temps entre la demande de génération et la disponibilité du fichier téléchargeable)
**Meter :** Edge Function Supabase, mesure du cold start + execution time sur 10 générations consécutives, p95 retenu
**Must :** < 5.0 s (au-delà, l'utilisateur pense que la génération a échoué et recharge la page)
**Plan :** < 2.5 s (objectif réaliste avec une bibliothèque légère comme PDF-LIB ou Puppeteer optimisé, exécution côté serveur)
**Wish :** < 1.0 s (objectif long terme avec template pré-compilé et mise en cache des ressources statiques)
**Trace :** Affecte US-8 (téléchargement PDF)
**Pourquoi :** Le manager valide et envoie le devis en direct, souvent face au client. Un délai > 5s crée de la tension et remet en question la fiabilité perçue du produit.

---

### NFR-PERF-06 : Pagination des Listes (Devis & Clients)
**Tag :** List_Pagination
**Scale :** Nombre d'éléments retournés par requête API
**Meter :** Requêtes sur les endpoints `/api/devis` et `/api/clients` avec paramètre `limit`, mesure du temps de réponse p95 pour 50, 100 et 200 éléments
**Must :** Maximum 50 éléments par page (contrainte spécifiée dans les Boundaries ; au-delà, le payload JSON dépasse 100 KB et le temps de rendu mobile s'allonge)
**Plan :** 20 éléments par page (objectif réaliste pour un écran mobile 360px ; scrolling infini ou pagination classique)
**Wish :** 50 éléments par page avec virtual scrolling (objectif long terme si le volume de données augmente)
**Trace :** Affecte US-3 (liste clients), US-5 (liste devis), US-10 (dashboard manager)
**Pourquoi :** Un commercial avec 200 clients ne doit pas attendre 3 secondes que toute la liste charge. La pagination réduit la charge réseau, la consommation data, et le temps de rendu DOM sur mobile.

---

### NFR-PERF-07 : Temps de Chargement Initial sur 3G
**Tag :** Page_Load_3G
**Scale :** Secondes (temps entre la navigation et l'interactivité complète — Time to Interactive, TTI)
**Meter :** Lighthouse CI avec throttling 3G Fast (1.6 Mbps down, 768 Kbps up, RTT 150ms), mesure sur 5 runs, p95 retenu
**Must :** < 5.0 s (contrainte spécifiée dans la spec ; au-delà, l'expérience est jugée "cassée" sur mobile)
**Plan :** < 3.0 s (objectif réaliste avec Next.js static generation pour les pages publiques, server-side rendering pour les pages protégées, et lazy loading des composants lourds)
**Wish :** < 2.0 s (objectif long terme avec préfetching des routes critiques et mise en cache agressive côté navigateur)
**Trace :** Affecte toutes les US — c'est la métrique globale de performance perçue.
**Pourquoi :** La 3G est le dénominateur commun en Côte d'Ivoire. Même en zone urbaine, la connexion fluctue. Un TTI > 5s signifie que le commercial ne peut pas interagir avec le formulaire de devis, ce qui bloque le workflow métier critique.

---

## 2. SÉCURITÉ

### NFR-SEC-01 : Authentification & Sessions
**Tag :** Auth_Session_Security
**Scale :** Standard de conformité (mécanisme + durée)
**Meter :** Audit manuel du code + test d'intrusion (tentative d'accès sans JWT, avec JWT expiré, avec JWT falsifié)
**Must :** Authentification email + mot de passe via Supabase Auth, mots de passe hashés (bcrypt/Argon2), sessions JWT stockées en cookies HTTPOnly + Secure + SameSite=Strict. Durée de session max 24h (ou refresh token valide 7 jours avec re-authentification obligatoire).
**Plan :** Même configuration que Must (Supabase Auth gère nativement ce niveau ; pas de déviation nécessaire pour le MVP)
**Wish :** Ajout de MFA (authentification à deux facteurs par SMS ou TOTP) pour les comptes Manager/Admin (objectif post-MVP)
**Trace :** Affecte US-9 (connexion), US-2 (invitation utilisateurs), US-12 (gestion des accès)
**Pourquoi :** Les devis contiennent des données commerciales sensibles (prix, coordonnées clients, conditions financières). Une session non sécurisée expose l'entreprise à la fuite de données concurrentielles. Le cookie HTTPOnly empêche le vol de session via XSS.

---

### NFR-SEC-02 : Isolation Multi-Tenant (RLS)
**Tag :** RLS_Tenant_Isolation
**Scale :** Taux de fuite de données inter-entreprises (doit être 0%)
**Meter :** Tests d'intrusion automatisés : 50 requêtes API malveillantes (modification du header `entreprise_id`, injection SQL dans les paramètres de requête, accès direct aux tables Supabase avec un token d'une autre entreprise). Aucune donnée ne doit être accessible ou modifiable.
**Must :** 0% de fuite de données inter-entreprises. Toutes les tables métier (Entreprise, Utilisateur, Client, Devis, LigneDevis) doivent avoir des politiques RLS actives et auditées. Aucune requête ne peut contourner le RLS.
**Plan :** Même configuration que Must (Supabase RLS est le pilier de l'architecture ; toute requête passe par les policies `USING` et `WITH CHECK`)
**Wish :** Ajout d'un audit automatique quotidien des politiques RLS (scan des tables sans RLS, détection des policies trop permissives) — objectif post-MVP
**Trace :** Affecte toutes les US — c'est la fondation de la sécurité du SaaS.
**Pourquoi :** Si un commercial de l'Entreprise A voit les devis de l'Entreprise B, c'est un incident critique de confidentialité. En Côte d'Ivoire, la confiance dans les outils numériques est fragile ; une fuite de données tue le produit.

---

### NFR-SEC-03 : Chiffrement des Données
**Tag :** Data_Encryption
**Scale :** Standard de chiffrement (transit + au repos)
**Meter :** Audit de configuration : vérification du TLS 1.3 sur Vercel (SSL Labs), vérification du chiffrement au repos dans Supabase (AES-256 par défaut), vérification qu'aucune donnée sensible n'est en clair dans les logs
**Must :** TLS 1.2 minimum en transit (HTTPS obligatoire sur toutes les routes), chiffrement AES-256 au repos côté Supabase. Aucune donnée sensible (mots de passe, tokens, clés API) ne doit transiter ou être stockée en clair.
**Plan :** TLS 1.3 en transit (Vercel le fournit par défaut), AES-256 au repos (Supabase par défaut). Clés API et secrets stockés dans les variables d'environnement Vercel/Supabase, jamais dans le code source.
**Wish :** Chiffrement de bout en bout des données métier sensibles (ex: coordonnées bancaires de l'entreprise) avec clé maître gérée par le client — objectif post-MVP
**Trace :** Affecte US-1 (profil entreprise — coordonnées bancaires), US-9 (connexion), toutes les US avec données client
**Pourquoi :** Les coordonnées bancaires et les informations clients sont des données sensibles. Même sur un MVP, l'absence de chiffrement basique est un risque juridique et une barrière à l'adoption par les PME qui craignent la fraude.

---

### NFR-SEC-04 : Audit Trail (Logs d'Action)
**Tag :** Audit_Trail
**Scale :** Couverture des actions critiques (% d'actions tracées sur les actions sensibles)
**Meter :** Audit du code + test de conformité : vérifier que chaque action critique (création de devis, validation, refus, modification utilisateur, suppression soft) génère un log immuable avec horodatage, identifiant utilisateur, identifiant entreprise, et description de l'action.
**Must :** 100% des actions suivantes doivent être tracées : création/modification/suppression soft de devis, validation/refus de devis, création/modification/suppression soft de client, invitation/suppression d'utilisateur, modification du profil entreprise. Les logs doivent être immuables (table dédiée `audit_logs`, accessible uniquement en lecture via RLS).
**Plan :** Même couverture que Must, avec stockage dans Supabase (table `audit_logs` avec RLS restrictif). Rétention minimum 1 an.
**Wish :** Export automatique des logs vers un SIEM externe (ex: Logtail) avec alerting en temps réel sur les actions suspectes — objectif post-MVP
**Trace :** Affecte US-5 (liste devis), US-7 (validation/refus), US-12 (gestion utilisateurs), US-4 (création devis)
**Pourquoi :** En cas de litige commercial ou de suspicion de fraude interne, le manager doit pouvoir prouver qui a fait quoi et quand. C'est aussi une exigence de conformité croissante dans les pays francophones d'Afrique.

---

### NFR-SEC-05 : Validation des Accès (Autorisation)
**Tag :** Access_Control_Validation
**Scale :** Taux de succès des tentatives d'accès non autorisées (doit être 0%)
**Meter :** Tests d'intrusion : un commercial tente de modifier un devis validé, un commercial tente de valider son propre devis, un utilisateur tente d'accéder à un devis d'une autre entreprise, un manager tente de supprimer définitivement (hard delete) un devis. Toutes ces tentatives doivent être bloquées.
**Must :** 0% de succès des accès non autorisés. Le système shall valider le rôle (Commercial vs Manager) et l'appartenance à l'entreprise avant chaque opération CRUD. Les règles métier (ex: un commercial ne peut pas modifier un devis validé) doivent être appliquées côté serveur (Edge Function), pas seulement côté client.
**Plan :** Même configuration que Must (les règles sont codées dans les Edge Functions et les policies RLS, jamais uniquement dans le frontend)
**Wish :** Ajout d'un système de permissions granulaires (ex: certains commerciaux peuvent voir mais pas créer) — objectif post-MVP
**Trace :** Affecte US-4 (création devis), US-7 (validation), US-5 (consultation devis), US-12 (gestion utilisateurs)
**Pourquoi :** La sécurité côté client est illusoire (tout peut être contourné via les DevTools). Si un commercial peut valider son propre devis en modifiant une requête API, le workflow de contrôle manager est complètement neutralisé.

---

## 3. DISPONIBILITÉ & FIABILITÉ

### NFR-AVAIL-01 : Disponibilité du Service (Uptime)
**Tag :** Service_Uptime
**Scale :** Pourcentage de temps de fonctionnement sur une période de 30 jours
**Meter :** Monitoring via Vercel Analytics + Supabase Status Page, mesure du taux de réussite des requêtes HTTP (status 2xx/3xx vs 5xx) sur 30 jours glissants
**Must :** 99.0% (soit ~7h20min d'indisponibilité mensuelle maximum). C'est le minimum acceptable pour un outil de vente utilisé en journée. Au-delà, les commerciaux perdent des opportunités.
**Plan :** 99.5% (soit ~3h40min d'indisponibilité mensuelle maximum). Objectif réaliste avec Vercel (99.99% SLA sur le edge) et Supabase (99.9% SLA sur la base). L'indisponibilité proviendrait principalement des déploiements mal planifiés.
**Wish :** 99.9% (soit ~43min d'indisponibilité mensuelle maximum). Objectif long terme avec déploiement blue/green et health checks automatiques.
**Trace :** Affecte toutes les US — c'est la disponibilité globale du SaaS.
**Pourquoi :** Un commercial en visite chez un client qui ne peut pas générer de devis à cause d'une panne perd immédiatement la crédibilité du produit et de son entreprise. Les PME ivoiriennes n'ont pas de plan B numérique.

---

### NFR-AVAIL-02 : Résilience aux Défaillances Réseau (Connexion Intermittente)
**Tag :** Network_Resilience
**Scale :** Taux de succès des opérations critiques après une déconnexion/réconnexion (sans perte de données saisies)
**Meter :** Test manuel sur réseau 3G instable (simulation via Chrome DevTools : offline 5s, online 10s, répété 3 fois) pendant la création d'un devis. Mesure : le devis est-il sauvegardé correctement ? Les données saisies pendant l'offline sont-elles préservées ?
**Must :** 100% de conservation des données saisies avant la déconnexion. Le système shall afficher un indicateur de connexion clair (online/offline) et empêcher la soumission de formulaires pendant l'offline. Aucune donnée ne doit être perdue si la connexion revient dans les 30 secondes.
**Plan :** Même comportement que Must, avec ajout d'un message toast "Connexion instable — vos données sont en sécurité" et blocage temporaire des boutons de soumission jusqu'à reconnexion.
**Wish :** Mode "optimistic UI" avec file d'attente locale (localStorage/IndexedDB) pour les opérations en offline, synchronisation automatique à la reconnexion — objectif post-MVP (hors scope actuel)
**Trace :** Affecte US-4 (création devis), US-3 (création client), US-7 (validation/refus)
**Pourquoi :** La connectivité intermittente est une contrainte majeure du projet. Si un commercial perd 10 minutes de saisie à cause d'une coupure réseau, il abandonnera l'outil au profit du papier. L'indicateur de connexion et le blocage des soumissions sont des filets de sécurité minimums.

---

### NFR-AVAIL-03 : Sauvegarde des Données (Backup & RPO)
**Tag :** Data_Backup_RPO
**Scale :** Temps maximum de données perdues en cas d'incident majeur (Recovery Point Objective)
**Meter :** Vérification de la configuration Supabase (Point-in-Time Recovery — PITR), test de restauration sur un environnement de staging mensuel
**Must :** RPO < 24 heures. Supabase PITR est activé (backup automatique quotidien avec possibilité de restauration à n'importe quel moment des dernières 24h). Aucune perte de données supérieure à 24h n'est acceptable.
**Plan :** RPO < 1 heure (Supabase PITR avec snapshots toutes les heures sur le tier Pro, ou configuration manuelle de dumps horaires via Edge Function + stockage S3). Pour le MVP gratuit, le backup quotidien natif de Supabase est le minimum viable.
**Wish :** RPO < 15 minutes avec réplication multi-région (Supabase read replicas) — objectif post-MVP
**Trace :** Affecte toutes les US — c'est la fiabilité de la persistance des données.
**Pourquoi :** Les PME n'ont pas de service informatique pour reconstruire des données perdues. Un devis validé et envoyé au client qui disparaît de la base est un incident irréparable pour la confiance. Le backup est une assurance vie.

---

### NFR-AVAIL-04 : Gestion des Erreurs (Graceful Degradation)
**Tag :** Error_Handling
**Scale :** Taux de récupération gracieuse face aux erreurs serveur (5xx, timeout, rate limiting)
**Meter :** Tests d'erreur simulées : injection de 500 Internal Server Error sur les endpoints critiques, simulation de timeout Supabase (2s de latence), simulation de rate limiting Vercel (429). Mesure : l'interface affiche-t-elle un message clair ? L'utilisateur peut-il réessayer ? Les données saisies sont-elles conservées ?
**Must :** 100% des erreurs serveur doivent être interceptées et affichées à l'utilisateur avec un message en français clair (ex: "Le service est temporairement indisponible. Veuillez réessayer dans quelques minutes."). Aucun crash de page (white screen) n'est toléré. Les formulaires doivent conserver les données saisies en cas d'erreur de soumission.
**Plan :** Même comportement que Must, avec ajout d'un bouton "Réessayer" sur chaque message d'erreur et log automatique de l'erreur côté serveur pour le debugging.
**Wish :** Retry automatique avec backoff exponentiel (3 tentatives espacées de 2s, 4s, 8s) avant d'afficher l'erreur à l'utilisateur — objectif post-MVP
**Trace :** Affecte toutes les US — c'est la résilience perçue du produit.
**Pourquoi :** Sur un réseau instable, les erreurs 500 et les timeouts sont fréquents. Si l'application affiche un écran blanc ou une stack trace technique, l'utilisateur non-technique panique et ne revient pas. Un message clair en français rassure et guide.

---

### NFR-AVAIL-05 : Temps de Reprise après Incident (RTO)
**Tag :** Recovery_Time_Objective
**Scale :** Heures entre la détection d'un incident majeur et la restauration du service complet
**Meter :** Simulation d'incident : suppression accidentelle d'une table critique sur staging, mesure du temps de restauration depuis le backup Supabase jusqu'à la récupération complète des données et la vérification de l'intégrité.
**Must :** RTO < 4 heures. En cas d'incident critique (perte de base de données, corruption majeure), le service doit être restauré et accessible en moins de 4 heures ouvrées.
**Plan :** RTO < 2 heures (objectif réaliste avec un runbook documenté de restauration Supabase PITR, testé mensuellement sur staging).
**Wish :** RTO < 30 minutes avec restauration automatique (failover vers une base de secours) — objectif post-MVP
**Trace :** Affecte toutes les US — c'est la capacité de survie du SaaS.
**Pourquoi :** Une indisponibilité de 4 heures en pleine journée de vente peut coûter des contrats à plusieurs PME. C'est un risque réputationnel majeur sur un marché où le bouche-à-oreille domine.

---

## 4. SYNTHÈSE DES TRADE-OFFS (CONFLITS & DÉCISIONS)

### Trade-off 1 : Sécurité (RLS + Chiffrement) vs Performance (Temps de Réponse API)

| Élément | Détail |
|---------|--------|
| **Conflit** | Les politiques RLS de Supabase ajoutent une couche de vérification à chaque requête SQL. Le chiffrement TLS 1.3 ajoute une latence réseau (~20-50ms par handshake). Ces deux mécanismes sont essentiels à la sécurité multi-tenant mais pénalisent la performance. |
| **Analyse** | NFR-SEC-02 (RLS) impose 0% de fuite de données — c'est non négociable. NFR-PERF-02 (API < 400ms Plan) est réaliste même avec RLS activé, à condition d'indexer correctement les colonnes `entreprise_id` et `user_id`. Le chiffrement TLS 1.3 est géré par Vercel/Supabase sans surcharge développeur. |
| **Décision** | **Privilégier la sécurité sans compromis.** Maintenir RLS strict sur toutes les tables. Accepter une latence API Plan de 400ms (p95) qui reste dans la fourchette "rapide" pour un utilisateur mobile. Optimiser par des index composites sur les requêtes les plus fréquentes (liste devis, détail client). |
| **Responsable** | Lead Developer (implémentation des index + review des policies RLS) |

---

### Trade-off 2 : Disponibilité (Uptime 99.5%) vs Coût (Stack Gratuite)

| Élément | Détail |
|---------|--------|
| **Conflit** | Vercel (tier gratuit) et Supabase (tier gratuit) offrent des SLA respectables mais sans garantie contractuelle stricte. Atteindre 99.5% d'uptime sur une stack 100% gratuite est ambitieux car les cold starts, les rate limits, et les maintenances planifiées peuvent causer des indisponibilités. |
| **Analyse** | NFR-AVAIL-01 (99.5% Plan) est réaliste pour un MVP à faible trafic (< 1000 requêtes/jour). Vercel edge a une disponibilité > 99.99%. Supabase gratuit a parfois des pauses de 1-2 min lors des déploiements de la base. Le risque principal vient des déploiements de code mal planifiés (downtime pendant le build). |
| **Décision** | **Accepter le risque du tier gratuit pour le MVP.** Maintenir le Plan à 99.5% mais documenter que ce seuil dépend de la stabilité des tiers. Mettre en place un monitoring (Vercel Analytics + Supabase Health) pour détecter les indisponibilités. Ne pas dépasser le budget gratuit (pas de passage au tier payant sans approbation explicite — voir Boundaries). Si le trafic dépasse les limites gratuites, le passage au tier payant sera une décision métier, pas technique. |
| **Responsable** | Product Champion (décision de passage au tier payant si les limites sont atteintes) |

---

### Trade-off 3 : Taille du PDF (Compression) vs Qualité Visuelle (Logo & Tableaux)

| Élément | Détail |
|---------|--------|
| **Conflit** | NFR-PERF-04 impose un PDF < 600 Ko (Plan). Un logo haute résolution et des tableaux riches avec des polices embarquées peuvent rapidement dépasser cette limite. La qualité perçue du devis (professionnalisme) dépend de la netteté du rendu. |
| **Analyse** | Le logo est compressé à < 200 KB (500x500px, WebP/PNG). Le template PDF est figé et utilise des polices système (pas d'embarquement de polices lourdes). Un devis de 20 lignes avec logo reste sous 600 Ko si les images sont optimisées. La qualité visuelle reste professionnelle. |
| **Décision** | **Privilégier la taille du PDF (Must < 1 Mo).** Utiliser des polices système (Helvetica/Arial équivalent) sans embarquement. Compresser le logo à 150 DPI maximum. Si un devis dépasse 600 Ko, activer une compression JPEG légère sur le logo (qualité 80%). Le professionnalisme vient du layout structuré, pas de la résolution d'image. |
| **Responsable** | Lead Developer (optimisation du pipeline PDF) |

---

### Trade-off 4 : Résilience Réseau (Indicateur Offline) vs Expérience Utilisateur (Fluidité)

| Élément | Détail |
|---------|--------|
| **Conflit** | NFR-AVAIL-02 impose un blocage des soumissions pendant l'offline pour éviter la perte de données. Cela peut frustrer l'utilisateur qui veut "juste envoyer" rapidement. Un mode offline avancé (file d'attente locale) serait plus fluide mais complexe et hors MVP. |
| **Analyse** | Le MVP n'inclut pas de mode offline avancé (hors scope de l'intention validée). Le blocage des soumissions avec un message clair est le compromis minimum viable. Il protège les données sans ajouter de complexité technique. |
| **Décision** | **Maintenir le blocage des soumissions avec message clair.** Ne pas implémenter de file d'attente locale dans le MVP (hors scope). Documenter cette limitation comme une fonctionnalité future (Wish). L'indicateur de connexion doit être discret mais visible (ex: petite barre en haut de l'écran, pas de popup bloquant). |
| **Responsable** | Lead Developer (implémentation du Network Status API) |

---

## 5. CHECKLIST DE VALIDATION NFR

- [ ] Toutes les NFR sont quantifiées avec le format Planguage complet (Tag, Scale, Meter, Must, Plan, Wish).
- [ ] Chaque NFR est traçable vers au moins une User Story de la spec fonctionnelle.
- [ ] Les contraintes déjà présentes dans la spec (FCP < 1.5s, PDF < 1 Mo, chargement < 3s sur 3G, pagination 50 éléments) sont transformées en Planguage.
- [ ] Les trade-offs entre NFR sont identifiés, analysés et résolus avec décision documentée.
- [ ] Les seuils proposés sont réalistes pour une stack Vercel + Supabase en tier gratuit.
- [ ] Le contexte PME Côte d'Ivoire (connectivité faible, forfaits data limités) est pris en compte dans chaque justification.
- [ ] Aucune NFR interne complexe (cyclomatique, couverture de test) n'a été ajoutée.

---

## APPROBATION

| Rôle | Nom | Date | Validation (Oui/Non/Ajustement) |
|------|-----|------|--------------------------------|
| Product Champion | — | 2026-07-11 | En attente |
| Lead Developer | — | — | En attente Phase 2 |
| Lead Tester | — | — | En attente Phase 2 |

---

> **Ces seuils (Must/Plan) vous semblent-ils réalistes pour un MVP, ou souhaitez-vous les ajuster ?**
