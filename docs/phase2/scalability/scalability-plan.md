## Section 1 : Évaluation des limites

| Ressource | Limite du tier gratuit | Consommation estimée (par entreprise/mois) | Capacité pour X entreprises | Seuil d'alerte |
|---|---|---|---|---|
| Stockage BDD | 500 MB | ~5 MB (profil + clients + devis + lignes + logs) | ~100 entreprises | 400 MB (80% de la limite) |
| Lignes lues/mois | 50 000 | ~1 500 (liste devis + clients + dashboard + audit) | ~33 entreprises | 40 000 lignes (80% de la limite) |
| Bande passante sortante | 500 MB | ~10 MB (JSON léger, pas de fichiers lourds) | ~50 entreprises | 400 MB (80% de la limite) |
| Edge Functions simultanées | 2 | 1 à 2 par requête (génération PDF) | N/A (concurrency, pas de quota mensuel) | Si > 2 appels PDF simultanés |
| Bande passante Vercel | 100 GB/mois | ~500 MB (JS bundle, assets statiques, API) | ~200 entreprises | 80 GB (80% de la limite) |
| Stockage fichiers (Supabase Storage) | 1 GB | ~50 MB (logos entreprise, PDF temporaires) | ~20 entreprises | 800 MB (80% de la limite) |

**Hypothèses de consommation** :
- Une entreprise de 10 employés génère ~100 devis/mois, ~50 clients, ~200 lignes de devis, ~500 entrées audit.
- Chaque devis génère ~3 requêtes de lecture (liste, détail, lignes).
- Un PDF généré pèse ~300 KB en moyenne. Les PDF sont stockés temporairement puis envoyés (pas archivés massivement).
- Le JS bundle initial est ~120 KB gzippé. Chaque page charge ~50 KB de données JSON supplémentaires.

**Conclusion** : Le bottleneck est le **stockage fichiers (1 GB)** et les **lignes lues (50 000/mois)**. À 50 entreprises, on atteint la limite de lignes lues. Le stockage BDD reste confortable. La bande passante Vercel est largement suffisante.

## Section 2 : Analyse des requêtes critiques

| Requête critique | Complexité | Risque de performance | Index suffisant ? | Justification |
|---|---|---|---|---|
| Liste des devis par commercial filtrée par statut | 1 table + filtres (commercial_id, statut, is_deleted) | Faible | Oui | Index composite `devis(commercial_id, statut, is_deleted)` couvre exactement le filtrage. Pas de JOIN nécessaire pour la liste de base. |
| Liste des clients par entreprise avec recherche par nom | 1 table + filtre ILIKE | Moyen | Partiellement | Index `client(entreprise_id, is_deleted)` couvre le filtre principal. Index `client(nom text_pattern_ops)` accélère la recherche par préfixe. Si la recherche passe à `ILIKE '%suffix%'`, l'index ne suffit plus. |
| Création d'un devis avec lignes | 2 tables (INSERT devis + INSERT lignes) + fonction numérotation | Moyen | Oui | La transaction inclut l'appel à `generer_numero_devis()` (UPSERT sur `devis_counter`). Le verrou de ligne sur `devis_counter` est le point de contention. Acceptable à < 5 req/sec. |
| Génération de PDF (Edge Function) | 1 requête (détail devis + lignes + entreprise) + rendu HTML→PDF | Élevé | Oui | L'Edge Function doit récupérer toutes les données en une requête, générer le HTML, puis le PDF. Le risque est le temps de rendu (> 800 ms Must). L'index `devis(id)` (PK) suffit pour la lecture. |
| Dashboard : agrégation des devis par semaine | 1 table + GROUP BY + COUNT | Moyen | Oui | Index `devis(date_creation)` accélère le GROUP BY. À volume faible (< 10 000 devis), la requête reste rapide. Si le volume augmente, un index sur `entreprise_id + date_creation` serait nécessaire. |

## Section 3 : Stratégie de cache

| Question | Réponse | Justification |
|---|---|---|
| Données lues fréquemment mais rarement modifiées ? | Oui | Le profil entreprise (logo, coordonnées bancaires, préfixe, CG) est lu à chaque création de devis et à chaque génération de PDF, mais modifié rarement (quelques fois par mois). La liste des clients est lue fréquemment mais modifiée occasionnellement. |
| Cache Supabase intégré suffisant ? | Partiellement | Supabase ne fournit pas de cache de requête SQL natif en tier Free. Le cache est limité au niveau de la connexion (pas de pool de connexions). Les requêtes identiques ne sont pas mises en cache automatiquement. |
| Cache applicatif nécessaire ? | Oui, léger | Un cache côté client (React state / React Query) peut stocker le profil entreprise et la liste des clients pendant la session. Cela évite de requêter Supabase à chaque navigation. Pas de Redis, pas de cache serveur. |

**Recommandation concrète** :
1. **Cache client (React Query / SWR)** : Mettre en cache le profil entreprise et la liste des clients avec un stale-time de 5 minutes. Cela réduit les requêtes répétées vers Supabase sans ajouter de complexité serveur.
2. **Pas de cache serveur** : Inutile sur un monolithe serverless sans Redis. Le cache client suffit pour les données à faible volatilité.
3. **Pas de cache de PDF** : Les PDF sont générés à la demande et envoyés immédiatement. Le stockage temporaire d'un PDF généré n'est pas justifié (pas de relecture fréquente).

## Section 4 : Plan d'action scalabilité

| # | Action | NFR liée | Priorité | Complexité |
|---|---|---|---|---|
| 1 | Implémenter le cache client React Query avec stale-time 5 min pour le profil entreprise et la liste des clients | API CRUD < 400ms (Plan) | Haute | Faible |
| 2 | Limiter la liste des devis à 20 éléments par défaut (Plan) et 50 maximum (Must) avec un curseur de pagination côté serveur | API CRUD < 400ms (Plan) | Haute | Faible |
| 3 | Optimiser la requête de génération PDF en une seule requête SQL (JOIN devis + lignes + entreprise + client) pour éviter les N+1 | API CRUD < 800ms (Must) | Haute | Moyenne |
| 4 | Compresser le logo entreprise côté serveur (Edge Function) avant injection dans le template PDF pour garantir PDF < 600 KB (Plan) | PDF < 600 KB (Plan) | Haute | Moyenne |
| 5 | Activer le code splitting de Next.js et auditer le bundle avec `next-bundle-analyzer` à chaque ajout de librairie | JS bundle < 150 KB gzippé (Plan) | Moyenne | Faible |
| 6 | Ajouter un index composite `devis(entreprise_id, date_creation)` si le dashboard devient lent à mesure que le volume de devis croît | API CRUD < 400ms (Plan) | Moyenne | Faible |
| 7 | Implémenter un rate limiting côté client (debounce sur la création de devis) pour éviter les pics de requêtes simultanées sur la fonction de numérotation | API CRUD < 800ms (Must) | Moyenne | Faible |
| 8 | Monitorer les quotas Supabase (lignes lues, stockage) via le dashboard et documenter un plan de migration vers Supabase Pro si le seuil de 50 entreprises est atteint | Disponibilité 99.5% (Plan) | Basse | Faible |
