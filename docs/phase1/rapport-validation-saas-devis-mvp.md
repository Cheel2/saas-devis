# Rapport de Validation : SaaS Devis MVP

## Résumé

| Métrique | Valeur |
|----------|--------|
| **Nombre total de défauts trouvés** | 20 |
| **Défauts Majeurs (bloquants avant dev)** | 5 |
| **Défauts Mineurs (à améliorer)** | 15 |

**Verdict global :** La spécification présente une base solide mais contient **5 défauts majeurs** qui doivent impérativement être corrigés avant le passage à la Phase 2 (Plan). Le défaut le plus critique est une incohérence entre une NFR de disponibilité (PITR Supabase) et la contrainte "stack 100% gratuite" validée par le Product Champion.

---

## Défauts Identifiés

### DÉFAUTS MAJEURS

| ID | Exigence | Type de Défaut | Description | Sévérité | Action proposée |
|----|----------|----------------|-------------|----------|-----------------|
| D-001 | NFR-AVAIL-03 (Data_Backup_RPO) | Incohérence | Le Must exige "Supabase PITR activé" (Point-in-Time Recovery), mais PITR n'est **pas disponible sur le tier gratuit** de Supabase. C'est en contradiction directe avec la contrainte "outils 100% gratuits (Vercel + Supabase)" validée dans les Assumptions (#2, #3). Le Plan mentionne implicitement le tier Pro ("snapshots toutes les heures sur le tier Pro"), ce qui confirme l'incohérence. | Majeur | **Choisir une option :** (a) Lever la contrainte gratuite pour activer PITR Pro, ou (b) Remplacer le Must par une solution compatible avec le tier gratuit (ex: dumps automatisés quotidiens via Edge Function + stockage S3/Supabase Storage, ou accepter un RPO de 24h avec le backup natif gratuit de Supabase). Documenter la décision et mettre à jour les Assumptions si nécessaire. |
| D-006 | US-12 + Règle 5.5 + Boundaries | Cohérence / Ambiguïté | US-12 dit "supprimer un utilisateur" sans préciser "soft-delete". Règle 5.5 impose le soft-delete sur toutes les entités, mais ne précise pas le sort des devis créés par l'utilisateur supprimé. Les devis restent-ils orphelins ? Sont-ils réassignés ? L'audit trail (NFR-SEC-04) doit tracer l'action, mais sans règle de réassignation, l'intégrité référentielle est compromise. | Majeur | **Clarifier dans la spec :** (1) US-12 doit explicitement mentionner "soft-delete (désactivation du compte)". (2) Définir une règle métier : les devis d'un utilisateur soft-deleted restent attribués à son ID (conservation historique) mais deviennent consultables par les managers. (3) Interdire la suppression du dernier manager actif d'une entreprise (sinon l'entreprise devient orpheline). |
| D-010 | NFR-AVAIL-02 (Network_Resilience) | Cohérence | Le Must exige "100% de conservation des données saisies avant la déconnexion" et "Aucune donnée ne doit être perdue si la connexion revient dans les 30 secondes". Mais aucun mécanisme de persistance locale (localStorage, IndexedDB, file d'attente) n'est défini dans la spec. Sans ce mécanisme, les données saisies dans un formulaire non soumis sont perdues au rechargement de la page. La promesse de conservation est donc techniquement incohérente avec l'absence de mode offline/hors-ligne (hors scope selon l'intention validée). | Majeur | **Choisir une option :** (a) Ajouter une règle métier : "Les données saisies dans un formulaire non soumis ne sont pas conservées en cas de déconnexion — l'utilisateur doit réessayer", ou (b) Ajouter une NFR minimale de persistance locale (auto-save du brouillon de devis dans localStorage toutes les 10 secondes) et documenter cela comme une exception au hors-scope "mode offline". |
| D-012 | US-4 (Créer un devis) | Complétude | L'US ne mentionne aucune validation des données saisies : montants négatifs, quantité nulle, prix unitaire = 0, nombre de lignes maximum, caractères spéciaux dans la description. Sans ces règles, le système peut générer des devis incohérents (total négatif, devis vide). | Majeur | **Ajouter des règles de validation dans la spec :** (1) Quantité > 0 et entière. (2) Prix unitaire > 0. (3) Description obligatoire et non vide. (4) Nombre de lignes maximum : 50 (pour limiter la taille du PDF et la complexité du formulaire). (5) Total calculé = somme des lignes, non modifiable manuellement. |
| D-018 | US-9 (Connexion) + Règle 5.8 | Complétude | US-9 décrit la connexion mais ne mentionne pas le cas où l'entreprise de l'utilisateur est marquée "Inactive" (Règle 5.8). Si un utilisateur d'une entreprise inactive tente de se connecter, que se passe-t-il ? Message d'erreur ? Redirection ? Le système doit bloquer l'accès, mais ce comportement n'est pas spécifié dans l'US. | Majeur | **Ajouter une règle métier :** "Si l'entreprise de l'utilisateur est marquée Inactive, la connexion est refusée avec un message explicite : 'Votre abonnement est inactif. Contactez le support.'" Et ajouter un cas d'erreur dans US-9 : "En tant qu'utilisateur d'une entreprise inactive, je ne peux pas me connecter afin que l'accès soit contrôlé par le statut de souscription." |

### DÉFAUTS MINEURS

| ID | Exigence | Type de Défaut | Description | Sévérité | Action proposée |
|----|----------|----------------|-------------|----------|-----------------|
| D-002 | NFR-PERF-02 (API_Response_Time) | Clarté | Le Meter cite un endpoint exemple "/api/v1/products" qui n'appartient pas à ce projet. C'est un résidu du template NFR. Les endpoints réels du projet (/api/devis, /api/clients, etc.) ne sont pas listés. | Mineur | Remplacer l'exemple "/api/v1/products" par les endpoints réels du projet : `/api/devis`, `/api/clients`, `/api/entreprises`, `/api/users`, et l'Edge Function de génération PDF. |
| D-003 | US-5 (Consulter liste devis) | Clarté | L'expression "la liste de **mes** devis" est ambiguë selon le rôle. Pour un Commercial : "mes" = ceux que j'ai créés. Pour un Manager : "mes" = ceux de mon entreprise ? Ceux que j'ai validés ? Tous ? Cette ambiguïté peut conduire à deux implémentations différentes. | Mineur | Préciser dans la spec : "Un Commercial voit les devis qu'il a créés. Un Manager voit tous les devis de son entreprise, quelle que soit l'auteur." |
| D-004 | US-10 (Visualiser nombre devis) | Vérifiabilité | "Visualiser le nombre de devis créés par semaine" est trop vague pour être testé. Sous quelle forme ? Un chiffre brut ? Un graphique ? Une liste ? Quelle définition de "semaine" (calendaire L-D ou rolling 7 jours) ? "Créés" = tous les statuts ou seulement validés ? | Mineur | Reformuler l'US avec des critères d'acceptation précis : "En tant que manager, je veux voir un compteur affichant le nombre total de devis créés dans l'entreprise au cours des 7 derniers jours glissants, sur le tableau de bord principal, afin de mesurer l'activité commerciale." |
| D-005 | US-2 (Inviter utilisateurs) | Complétude | Le processus d'invitation n'est pas décrit. Le manager envoie un email ? Un lien d'invitation ? L'utilisateur reçoit un mot de passe temporaire ? Quelle est la durée de validité de l'invitation ? | Mineur | Ajouter une règle métier : "Le manager saisit l'email et le rôle du nouvel utilisateur. Le système envoie un email d'invitation avec un lien de création de mot de passe valable 48h. L'utilisateur doit définir son mot de passe à la première connexion." |
| D-007 | Règle 5.3 (Notifications) | Clarté | "Le badge in-app shall être mis à jour en temps réel (ou au rechargement de la page si le temps réel n'est pas disponible)" propose deux comportements contradictoires. C'est impossible à tester car le testeur ne sait pas quel comportement valider. | Mineur | Choisir un comportement unique pour le MVP et le documenter : "Le badge in-app est mis à jour au rechargement de la page. Le temps réel via WebSocket/Supabase Realtime est hors scope pour le MVP." |
| D-008 | NFR-SEC-05 (Access_Control_Validation) | Vérifiabilité | Le Must exige "0% de succès des accès non autorisés". Il est statistiquement impossible de prouver un taux de 0% par des tests. On peut tester des cas connus, mais pas prouver l'absence totale de vulnérabilités. | Mineur | Reformuler le Must en une exigence vérifiable : "Toutes les tentatives d'accès non autorisées documentées dans la matrice de test (minimum 10 scénarios d'intrusion) doivent être bloquées avec un code HTTP 403." |
| D-009 | Règle 5.7 (Email expéditeur) | Complétude | L'adresse "devis@notresaas.ci" est un placeholder. Le domaine réel du projet n'est pas défini dans les Assumptions. Sans domaine validé, l'email ne peut pas être configuré. | Mineur | Ajouter une Assumption : "Le domaine de production est [à définir] (ex: devispro.ci, saasdevis.ci). L'adresse expéditrice sera devis@[domaine].ci." Ou utiliser une adresse générique validée (ex: noreply@resend.com en phase de test). |
| D-011 | US-11 (Dupliquer devis) | Traçabilité | Aucune NFR ne mentionne explicitement US-11. La duplication est une opération de copie qui a des implications sur la performance (temps de copie) et la taille des données, mais aucune NFR ne la couvre. | Mineur | Ajouter une trace dans NFR-PERF-02 : "La duplication d'un devis (US-11) doit s'exécuter en < 400ms (Plan) car elle implique la copie des lignes de prestation et la génération d'un nouveau numéro." |
| D-013 | NFR-SEC-02 (RLS_Tenant_Isolation) | Vérifiabilité | Même problème que D-008 : "0% de fuite de données inter-entreprises" est impossible à prouver exhaustivement. | Mineur | Reformuler : "Aucune fuite de données inter-entreprises ne doit être détectée lors de l'exécution de la matrice de test RLS (minimum 20 scénarios de requêtes malveillantes)." |
| D-014 | Boundaries "Always Do" (Test mobile 360px) | Traçabilité | La règle "Tester l'affichage sur un écran mobile 360px de large avant de marquer une tâche UI comme terminée" n'est pas traçable vers une NFR explicite. Elle relève de l'usabilité mais aucune NFR ne couvre la responsive design. | Mineur | Ajouter une NFR d'usabilité minimale : "Tag: Responsive_Mobile / Scale: Largeur d'écran (px) / Must: L'interface est pleinement utilisable sur 360px de large / Plan: Testé sur Chrome DevTools 360x640 / Trace: Affecte toutes les US avec interface." |
| D-015 | Règle 5.2 (Numérotation) | Complétude | Le compteur incrémental `XXXX` n'a pas de gestion de débordement. Que se passe-t-il après `DEV-2026-9999` ? Le système passe-t-il à `DEV-2026-10000` (5 chiffres) ou bloque-t-il ? | Mineur | Ajouter une règle : "Le compteur est un entier sans limite supérieure fixe. Le format affiché pad avec le nombre de chiffres nécessaires (ex: DEV-2026-10000, DEV-2026-100000)." Ou définir une limite métier si applicable. |
| D-016 | US-1 (Profil entreprise) | Complétude | L'US ne mentionne pas la gestion d'erreur pour le logo (format non supporté, taille > 200KB, dimensions > 500x500px). Ces règles sont dans 5.1 mais pas dans l'US. | Mineur | Ajouter un cas d'erreur dans US-1 : "Le système shall refuser l'upload d'un logo dépassant 500x500px ou 200KB, avec un message d'erreur explicite en français." |
| D-017 | NFR-AVAIL-05 (RTO) | Vérifiabilité | Le Meter demande un "test de restauration sur staging mensuellement", mais aucun environnement de staging n'est défini dans les Assumptions. Pour un MVP, c'est une charge de test irréaliste. | Mineur | Simplifier le Meter : "Test de restauration documenté via le runbook Supabase PITR, exécuté une fois avant le lancement en production et à chaque changement majeur du schéma de base." Ou définir explicitement un environnement de staging dans les Assumptions. |
| D-019 | NFR-SEC-01 (Auth_Session_Security) | Clarté | "Durée de session max 24h (ou refresh token valide 7 jours avec re-authentification obligatoire)" est ambigu. C'est 24h ou 7 jours ? Les deux mécanismes sont-ils cumulés ? | Mineur | Choisir une politique unique : "Session JWT valide 24h. Refresh token valide 7 jours permettant de renouveler la session sans re-saisie du mot de passe. Re-authentification obligatoire (saisie du mot de passe) après 7 jours d'inactivité." |
| D-020 | US-7 (Approuver/refuser) | Complétude | L'US ne précise pas si le manager peut modifier le contenu du devis avant de l'approuver. C'est une question fonctionnelle importante : un manager fait-il une relecture passive ou peut-il corriger des erreurs ? | Mineur | Ajouter une règle métier : "Le manager ne peut pas modifier le contenu d'un devis soumis. Il peut uniquement approuver, refuser (avec commentaire), ou demander au commercial de modifier (en refusant avec commentaire explicite)." |

---

## Traçabilité Vérifiée

### Matrice de traçabilité US → NFR

| US | NFR liées | Statut |
|----|-----------|--------|
| US-1 | NFR-SEC-03 (chiffrement coordonnées bancaires) | ✓ OK |
| US-2 | NFR-SEC-01 (auth invitation) | ✓ OK |
| US-3 | NFR-PERF-02, NFR-PERF-06 | ✓ OK |
| US-4 | NFR-PERF-02, NFR-PERF-04, NFR-PERF-05, NFR-SEC-05, NFR-AVAIL-02 | ✓ OK |
| US-5 | NFR-PERF-02, NFR-PERF-06, NFR-SEC-04, NFR-SEC-05 | ✓ OK |
| US-6 | NFR-SEC-01, NFR-AVAIL-01 | ✓ OK |
| US-7 | NFR-SEC-04, NFR-SEC-05, NFR-AVAIL-02 | ✓ OK |
| US-8 | NFR-PERF-04, NFR-PERF-05 | ✓ OK |
| US-9 | NFR-SEC-01, NFR-SEC-03 | ✓ OK |
| US-10 | NFR-PERF-06 | ✓ OK |
| **US-11** | **Aucune NFR explicite** | **⚠ DÉFAUT D-011** |
| US-12 | NFR-SEC-01, NFR-SEC-04, NFR-SEC-05 | ✓ OK |

### Matrice de traçabilité NFR → US

| NFR | US liées | Statut |
|-----|----------|--------|
| NFR-PERF-01 | Toutes les US | ✓ OK |
| NFR-PERF-02 | US-3, US-4, US-5, US-8 | ✓ OK |
| NFR-PERF-03 | Toutes les US | ✓ OK |
| NFR-PERF-04 | US-8 | ✓ OK |
| NFR-PERF-05 | US-8 | ✓ OK |
| NFR-PERF-06 | US-3, US-5, US-10 | ✓ OK |
| NFR-PERF-07 | Toutes les US | ✓ OK |
| NFR-SEC-01 | US-9, US-2, US-12 | ✓ OK |
| NFR-SEC-02 | Toutes les US | ✓ OK |
| NFR-SEC-03 | US-1, US-9 | ✓ OK |
| NFR-SEC-04 | US-5, US-7, US-12, US-4 | ✓ OK |
| NFR-SEC-05 | US-4, US-7, US-5, US-12 | ✓ OK |
| NFR-AVAIL-01 | Toutes les US | ✓ OK |
| NFR-AVAIL-02 | US-4, US-3, US-7 | ✓ OK |
| NFR-AVAIL-03 | Toutes les US | ✓ OK |
| NFR-AVAIL-04 | Toutes les US | ✓ OK |
| NFR-AVAIL-05 | Toutes les US | ✓ OK |

### Traçabilité des Boundaries

| Boundary | Exigence couvrante | Statut |
|----------|-------------------|--------|
| "Tester l'affichage sur mobile 360px" | Aucune NFR explicite | ⚠ DÉFAUT D-014 |
| "Implémenter compteur SQL atomique" | Implicite dans NFR-PERF-02 (performance numérotation) | ⚠ Manque de traçabilité explicite |
| "Compresser logo à l'upload" | NFR-PERF-04 (taille PDF) indirectement | ⚠ Traçabilité indirecte |

---

## Décision

| Option | Statut |
|--------|--------|
| ☐ Approuvée sans réserve | — |
| ☑ **Approuvée avec corrections** | **Les 5 défauts majeurs (D-001, D-006, D-010, D-012, D-018) doivent être traités avant le passage à la Phase 2 (Plan). Les 15 défauts mineurs doivent être intégrés dans la spec corrigée.** |
| ☐ Rejetée (retour à la phase de spécification) | — |

**Conditions de passage à la Phase 2 :**
1. D-001 résolu : La stratégie de backup est cohérente avec la contrainte de stack gratuite.
2. D-006 résolu : La règle de soft-delete des utilisateurs et le sort de leurs devis sont documentés.
3. D-010 résolu : La stratégie de conservation des données en cas de déconnexion est cohérente avec le hors-scope offline.
4. D-012 résolu : Les règles de validation des données de devis sont ajoutées.
5. D-018 résolu : Le comportement de connexion pour une entreprise inactive est spécifié.

> **Le Product Champion doit valider ces corrections avant que la Phase 2 ne soit autorisée.**
