# CONTEXT.md — SaaS Devis (Côte d'Ivoire)

Fichier de règles persistantes pour les agents de codage (Phase 3 : Implémentation).
Lire intégralement avant chaque session de codage. Aucune hypothèse non listée ici n'est autorisée.

---

## Stack Technique

- Next.js 15 (App Router, Server Components par défaut)
- React 19
- TypeScript 5 (strict mode activé)
- Tailwind CSS 4 (compilation native, pas de PostCSS custom)
- Supabase JS v2 (client et server)
- TanStack Query (React Query) v5 (cache client, stale-time 5 min)
- shadcn/ui (composants UI de base : Button, Input, Dialog, Table, Badge, Card)
- Vercel (déploiement, tier Hobby)
- Supabase (PostgreSQL, Auth, RLS, Edge Functions, Storage, tier Free)
- Playwright (tests end-to-end)
- Vitest (tests unitaires)

---

## Commandes

- `npm run dev` — Démarrer le serveur de développement (localhost:3000)
- `npm run build` — Build de production (analyse du bundle incluse)
- `npm run lint` — ESLint + Prettier (check uniquement)
- `npm run lint:fix` — ESLint + Prettier (fix automatique)
- `npm run test` — Tests unitaires (Vitest)
- `npm run test:e2e` — Tests end-to-end (Playwright)
- `npm run db:types` — Générer les types TypeScript depuis le schéma Supabase

---

## Structure du Projet

```
app/
  (auth)/          — Routes publiques (login, register) — gérées par Supabase Auth
  (dashboard)/     — Routes protégées (layout avec auth guard)
    entreprise/    — Profil entreprise (US-1)
    utilisateurs/  — Gestion des utilisateurs (US-2, US-12)
    clients/       — Annuaire clients (US-3)
    devis/         — Liste et détail des devis (US-4, US-5, US-7, US-8, US-11)
    tableau-de-bord/ — Statistiques (US-10)
    audit/         — Logs d'audit (transverse)
  api/             — Route handlers Next.js (API interne)
    devis/         — CRUD devis + workflow
    clients/       — CRUD clients
    utilisateurs/  — CRUD utilisateurs
    entreprise/    — Profil entreprise
    tableau-de-bord/ — Agrégations
    audit/         — Consultation logs
components/
  ui/              — Composants shadcn/ui (ne pas modifier)
  modules/         — Composants métier (DevisCard, ClientForm, etc.)
  layout/          — Layouts partagés (Header, Sidebar, AuthGuard)
  indicators/      — Indicateur online/offline, badges statut
lib/
  supabase/        — Clients Supabase (browser + server)
  utils/           — Fonctions utilitaires (formatage, validation)
  constants/       — Constantes métier (statuts, rôles, limites)
services/          — Couche d'appel à Supabase (pas de supabase-js dans les composants)
  devis.ts
  clients.ts
  utilisateurs.ts
  entreprise.ts
  audit.ts
  pdf.ts
types/             — Définitions TypeScript (générées + custom)
  database.ts      — Types générés par Supabase CLI
  api.ts           — Types des réponses API
  business.ts      — Types métier (Devis, Client, etc.)
public/            — Assets statiques (favicon, images)
```

---

## Conventions de Code

- TypeScript strict : `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`
- snake_case pour les noms de colonnes SQL (ex: `entreprise_id`, `is_deleted`)
- camelCase pour les variables, fonctions, propriétés JS/TS (ex: `entrepriseId`, `isDeleted`)
- PascalCase pour les composants React, les types et les interfaces (ex: `DevisCard`, `DevisFormData`)
- SCREAMING_SNAKE_CASE pour les constantes (ex: `MAX_LIGNES_DEVIS = 50`)
- Imports organisés par ordre : React → Next.js → libs externes → `@/` (internes) → `../` (relatifs)
- Un composant par fichier. Nom du fichier = nom du composant.
- Pas de fichiers de plus de 200 lignes. Extraire en sous-composants si nécessaire.
- Pas de `any`. Utiliser `unknown` si le type est inconnu, puis affiner.
- Pas de `console.log` en production. Utiliser un logger structuré (ex: `lib/logger.ts`).
- Pas de magic numbers. Toutes les constantes métier dans `lib/constants/`.

---

## Règles Frontend (Next.js)

- Utiliser les Server Components par défaut pour les pages et les layouts.
- Utiliser `'use client'` uniquement pour les composants nécessitant : useState, useEffect, useContext, événements DOM, hooks React Query.
- Ne jamais appeler `supabase-js` directement depuis un composant React. Passer par les fonctions du dossier `services/`.
- Utiliser React Query (TanStack Query) pour toutes les requêtes de données. Stale-time : 5 min pour le profil entreprise et la liste des clients. Stale-time : 0 pour les devis (données fréquemment modifiées).
- Utiliser Tailwind CSS pour tout le styling. Pas de CSS modules, pas de styled-components.
- Interface utilisable sur 360px de large (mobile first). Breakpoints : sm (640px), md (768px), lg (1024px).
- Afficher l'indicateur de connexion (online/offline) en permanence dans le header. Utiliser `navigator.onLine` + événements `online`/`offline`.
- Activer le code splitting de Next.js (`dynamic imports`) pour les modules lourds (ex: formulaire de devis).
- Toutes les pages protégées doivent vérifier la session via `supabase.auth.getSession()` côté serveur (middleware ou layout).
- Refuser la connexion si l'entreprise est inactive (`is_active = false`). Rediriger vers une page d'erreur explicative.
- Afficher les messages d'erreur API en français avec le composant `ErrorAlert` (format JSON unique).
- Pagination : afficher 20 éléments par défaut. Proposer un sélecteur 20 / 50. Ne jamais dépasser 50.

---

## Règles Backend (Supabase)

- Utiliser le client Supabase server-side (`createClient` avec `service_role key`) uniquement dans les Route Handlers (`app/api/`) et les Edge Functions.
- Utiliser le client Supabase browser-side (`createClient` avec `anon key`) uniquement dans les fonctions du dossier `services/`.
- RLS est activé sur TOUTES les tables. Aucune requête ne contourne le RLS sauf via `service_role` pour les opérations système (audit, numérotation).
- Les Edge Functions sont réservées à : la génération de PDF et la fonction de numérotation atomique des devis.
- Toutes les réponses API en erreur doivent suivre le format : `{ code: string, message: string, details?: string }`.
- Gérer les erreurs Supabase (network, auth, RLS violation) et les mapper vers les codes d'erreur métier définis.
- Ne jamais faire de `DELETE FROM` dans le code. Toujours utiliser `UPDATE ... SET is_deleted = true`.
- Toujours inclure le filtre `is_deleted = false` dans les clauses `SELECT`.
- Toujours utiliser `TIMESTAMPTZ` (UTC) côté serveur. Jamais de timestamps locaux côté serveur.
- Les calculs de total et sous-total sont faits côté serveur (Edge Function ou trigger SQL). Ne jamais calculer le total côté client.
- La génération de PDF est toujours faite par appel à l'Edge Function. Jamais côté client.
- Les secrets (Supabase URL, anon key, service role key) sont dans les variables d'environnement. Jamais dans le code.

---

## Règles Métier (Implementées dans le code)

- Un commercial ne voit que les devis où `commercial_id = son_id`.
- Un manager voit tous les devis de son entreprise (`entreprise_id = son_entreprise_id`).
- Un commercial ne peut modifier un devis que si `statut = 'brouillon'`. Vérification côté serveur ET côté client.
- Un commercial ne peut pas valider ni refuser un devis. Action réservée au manager.
- Un devis ne peut contenir plus de 50 lignes de prestation. Vérification côté serveur ET côté client.
- Chaque ligne de devis doit avoir : `description` non vide, `quantite > 0`, `prix_unitaire > 0`.
- Le total du devis est calculé automatiquement : somme des `sous_total` des lignes. Non modifiable manuellement.
- Le sous-total d'une ligne est calculé automatiquement : `quantite * prix_unitaire`. Non modifiable manuellement.
- La date de validité par défaut est : `date_creation + entreprise.duree_validite_jours` jours. Modifiable par le commercial.
- Le refus d'un devis rebascule le statut à `'brouillon'`. Le commentaire de refus est stocké dans `commentaire_refus`.
- La désactivation d'un utilisateur (`is_active = false` ou `is_deleted = true`) est interdite si c'est le dernier manager actif de l'entreprise. Vérification côté serveur.
- La numérotation des devis utilise la fonction `generer_numero_devis(entreprise_id)` qui retourne un numéro unique atomique au format `PREFIXE-YYYY-XXXX`.
- Le logo entreprise est compressé à l'upload (max 500x500px, < 200 KB). Stocké dans Supabase Storage.
- Le PDF généré doit peser < 600 KB (Plan), < 1 Mo (Must). Template léger, logo compressé.
- L'audit trail trace 100% des actions critiques : création, modification, validation, refus, suppression logique. Écriture via `service_role` uniquement.

---

## Formatage et Affichage

- Montants FCFA : espace comme séparateur de milliers, virgule comme séparateur décimal. Exemple : `1 250 000,00 FCFA`
- Dates : format `JJ/MM/AAAA`. Exemple : `15/07/2026`
- Heures : format `HH:MM`. Exemple : `14:30`
- Numéros de téléphone : format international avec indicatif. Exemple : `+225 07 12 34 56 78`
- Messages d'erreur API : toujours en français, lisibles par un utilisateur non technique. Pas de codes techniques exposés.
- Statuts de devis affichés : Brouillon (gris), En attente (jaune), Validé (vert), Refusé (rouge)
- Rôles affichés : Commercial, Manager
- Pagination affichée : "Page X sur Y — N éléments"
- Indicateur online/offline : vert quand connecté, rouge quand déconnecté, avec message explicatif

---

## Pièges à Éviter

- NE PAS utiliser `supabase-js` directement dans les composants React. Toujours passer par `services/`.
- NE PAS stocker de secrets (clés API, mots de passe) dans le code source. Variables d'environnement uniquement.
- NE PAS faire de hard delete (`DELETE FROM`). Toujours soft-delete (`UPDATE is_deleted = true`).
- NE PAS calculer le total du devis côté client. Toujours lire la valeur calculée par le serveur.
- NE PAS générer le PDF côté client. Toujours appeler l'Edge Function Supabase.
- NE PAS utiliser de timestamps locaux côté serveur. Toujours UTC (`TIMESTAMPTZ`).
- NE PAS autoriser la modification d'un devis si le statut n'est pas `'brouillon'`. Vérification côté serveur obligatoire.
- NE PAS oublier le filtre `is_deleted = false` dans les requêtes `SELECT`.
- NE PAS utiliser de syntaxe d'import croisé entre modules métier (ex: `services/devis.ts` ne doit pas importer `services/audit.ts`).
- NE PAS exposer le `service_role key` côté client. Réservé aux Route Handlers et Edge Functions.
- NE PAS faire confiance aux validations côté client seules. Toujours valider côté serveur.
- NE PAS utiliser de `SELECT *`. Toujours lister explicitement les colonnes nécessaires.
- NE PAS oublier de gérer le cas `null` ou `undefined` dans les réponses Supabase.

---

## Points d'Attention Phase 3

- **Bundle JS** : Auditer avec `next-bundle-analyzer` à chaque ajout de librairie. Objectif < 150 KB gzippé.
- **FCP** : Mesurer avec Lighthouse. Objectif < 2.5s (Must). Optimiser les images, utiliser `next/image`.
- **API CRUD** : Mesurer la latence des Route Handlers. Objectif < 800ms (Must). Vérifier les index PostgreSQL.
- **RLS** : Tester chaque politique avec des utilisateurs de rôles différents. Vérifier qu'aucune fuite inter-entreprise n'existe.
- **Edge Functions** : Mesurer le temps de génération PDF. Objectif < 800ms (Must). Optimiser le template HTML.
- **PDF** : Vérifier la taille de chaque PDF généré. Objectif < 1 Mo (Must), < 600 KB (Plan).
- **Pagination** : Vérifier que la limite max est respectée (50 éléments). Pas de dépassement côté client.
- **Responsive** : Tester sur 360px de large. Tous les boutons doivent être tapables (min 44x44px).
- **Soft-delete** : Vérifier que toutes les requêtes de liste filtrent `is_deleted = false`. Aucune entité supprimée ne doit apparaître.
- **Numérotation** : Tester la création simultanée de plusieurs devis. Vérifier l'absence de doublons.
- **Audit trail** : Vérifier que 100% des actions critiques sont tracées avec auteur, horodatage, description.
- **Connexion** : Vérifier que l'indicateur online/offline reflète l'état réel du réseau.
- **Désactivation dernier manager** : Vérifier que la règle bloque correctement côté serveur.
