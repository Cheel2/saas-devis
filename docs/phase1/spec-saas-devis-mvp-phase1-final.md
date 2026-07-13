# Spec : SaaS Devis (MVP Côte d'Ivoire)

## Version : 1.0.0 — Phase 1 (SPECIFY) FINALISÉE
## Date : 2026-07-11
## Statut : APPROUVÉE par le Product Champion

---

## 1. ASSUMPTIONS SURFACÉES

Les hypothèses suivantes ont été surfacées et validées par le Product Champion :

| # | Hypothèse | Statut |
|---|-----------|--------|
| 1 | Application web responsive (pas native). | Validé |
| 2 | Stack : Next.js (frontend, Vercel) + Supabase (PostgreSQL, Auth, Edge Functions). | Validé |
| 3 | Hébergement : Vercel (frontend) + Supabase (BDD/Auth), SSL automatique. | Validé |
| 4 | Architecture multi-tenant via Row Level Security (RLS) de Supabase. | Validé |
| 5 | Interface : Tailwind CSS (compilé) + Next.js avec code splitting pour chargement minimal. | Validé |
| 6 | Authentification : email + mot de passe via Supabase Auth. | Validé |
| 7 | Mots de passe hashés et sessions JWT gérées par Supabase (cookies HTTPOnly). | Validé |
| 8 | Deux rôles : Commercial et Manager/Admin (via metadata Supabase). | Validé |
| 9 | Un même utilisateur peut cumuler les deux rôles. | Validé |
| 10 | Modèle de données : Entreprise, Utilisateur, Client, Devis, LigneDevis. | Validé |
| 11 | Annuaire client isolé par entreprise (RLS). | Validé |
| 12 | Numérotation automatique configurable par entreprise (ex: DEV-001). | Validé |
| 13 | Montants en FCFA, total auto (somme des lignes), pas de TVA auto. | Validé |
| 14 | Devis validé par le manager verrouillé en lecture seule pour le commercial. | Validé |
| 15 | Workflow binaire : approuve / refuse (avec commentaire optionnel). | Validé |
| 16 | WhatsApp : PDF téléchargeable + partage manuel via l'app WhatsApp du téléphone. | Validé |
| 17 | Email : envoi via SMTP gratuit (Resend) ou Edge Functions Supabase. | Validé |
| 18 | PDF compressé (< 1 Mo). | Validé |
| 19 | Contenu PDF obligatoire : logo, coordonnées, infos client, tableau prestations, montant total, date validité, conditions. | Validé |
| 20 | Modèle de revenu : abonnement mensuel par entreprise (10 000 – 30 000 FCFA). | Validé |
| 21 | Gestion de la souscription manuelle / hors MVP (pas de portail de paiement automatisé). | Validé |
| 22 | Pas de période d'essai gratuite automatisée dans le MVP. | Validé |
| 23 | Configuration entreprise : logo, raison sociale, coordonnées bancaires, texte conditions générales. | Validé |
| 24 | Temps de chargement initial < 3 secondes sur 3G. | Validé |
| 25 | First Contentful Paint (FCP) < 1.5 seconde, JS initial minimal via code splitting Next.js. | Validé |
| 26 | PDF généré < 1 Mo. | Validé |
| 27 | Données stockées en Europe (Supabase eu-west-1) pour conformité. | Validé |
| 28 | Application uniquement en français (pas d'i18n). | Validé |
| 29 | Dates et formats numériques selon conventions françaises (espace milliers, virgule décimale). | Validé |

---

## 2. OBJECTIF

**Statement of Purpose :**

> Le système shall fournir une application web ultra-légère permettant aux commerciaux de PME structurées en Côte d'Ivoire de créer des devis professionnels personnalisés à partir d'un annuaire client réutilisable, et aux managers/dirigeants de les valider avant envoi par WhatsApp ou email sous forme de PDF compressé, le tout dans un environnement optimisé pour une connectivité intermittente et des forfaits data limités.

---

## 3. USER STORIES (MVP)

| ID | User Story | Priorité |
|----|------------|----------|
| US-1 | En tant que **manager**, je veux **créer le profil de mon entreprise** (logo, raison sociale, coordonnées bancaires, conditions générales) afin de **personnaliser les devis émis par mon équipe**. | Haute |
| US-2 | En tant que **manager**, je veux **inviter des utilisateurs** (commerciaux et/ou managers) dans mon espace entreprise afin de **constituer mon équipe de vente**. | Haute |
| US-3 | En tant que **commercial**, je veux **ajouter un client à l'annuaire** (nom, contact, adresse) afin de **réutiliser ses informations dans mes futurs devis**. | Haute |
| US-4 | En tant que **commercial**, je veux **créer un devis** en sélectionnant un client existant et en renseignant des lignes de prestation (description, quantité, prix unitaire) afin de **générer un document professionnel rapidement**. | Haute |
| US-5 | En tant que **commercial**, je veux **consulter la liste de mes devis** (brouillon, en attente de validation, validé, refusé) afin de **suivre l'état de mes propositions commerciales**. | Haute |
| US-6 | En tant que **manager**, je veux **recevoir une notification** (badge in-app + email immédiat) lorsqu'un commercial soumet un devis en validation afin de **le relire et décider de son approbation**. | Haute |
| US-7 | En tant que **manager**, je veux **approuver ou refuser un devis** (avec un commentaire optionnel) afin de **contrôler la qualité des propositions envoyées aux clients**. | Haute |
| US-8 | En tant que **manager**, je veux **télécharger le PDF d'un devis validé** afin de **l'envoyer au client par WhatsApp ou email**. | Haute |
| US-9 | En tant que **utilisateur**, je veux **me connecter avec mon email et mon mot de passe** afin d'**accéder à mon espace de travail sécurisé**. | Haute |
| US-10 | En tant que **manager**, je veux **visualiser le nombre de devis créés par semaine** afin de **mesurer l'activité commerciale de mon équipe**. | Moyenne |
| US-11 | En tant que **commercial**, je veux **dupliquer un devis existant** afin de **gagner du temps sur des propositions similaires**. | Moyenne |
| US-12 | En tant que **manager**, je veux **modifier ou supprimer un utilisateur de mon entreprise** afin de **gérer les accès de mon équipe**. | Moyenne |

---

## 4. BOUNDARIES

**Always Do :**
- Exécuter `npm run build` et vérifier l'absence d'erreurs avant chaque commit.
- Utiliser les Edge Functions de Supabase pour toute logique serveur (pas de backend séparé).
- Appliquer les Row Level Security (RLS) de Supabase sur **toutes** les tables contenant des données métier.
- Générer le PDF côté serveur (Edge Function) pour minimiser le JS client.
- Compresser le logo entreprise à l'upload (max 500x500px, < 200 KB, format WebP/PNG).
- Formater les montants en FCFA avec séparateur d'espace et virgule décimale (ex: `1 250 000,00 FCFA`).
- Utiliser des dates au format `JJ/MM/AAAA`.
- Valider que le commercial appartient à l'entreprise du devis avant toute opération CRUD.
- Logger les actions de validation/refus de devis (qui, quand, pourquoi).
- Tester l'affichage sur un écran mobile 360px de large avant de marquer une tâche UI comme terminée.
- Implémenter le compteur de numérotation de devis via une séquence SQL atomique dans Supabase pour éviter toute collision en cas de création simultanée.
- Appliquer le soft-delete sur toutes les entités métier (colonne `is_deleted`, jamais de hard delete).
- Envoyer les emails de notification depuis l'adresse générique du SaaS (`devis@notresaas.ci`).
- Afficher un badge in-app visible immédiatement lorsqu'un devis est soumis en validation.

**Ask First :**
- Ajouter une nouvelle dépendance npm (même si elle semble "indispensable").
- Modifier le schéma de la base de données (ajout/suppression de colonne ou table).
- Changer la logique de numérotation automatique des devis (hors configuration par l'utilisateur dans son profil).
- Modifier les règles RLS de Supabase.
- Ajouter un nouveau champ au formulaire de création de devis.
- Changer le format ou le contenu du PDF généré.
- Implémenter une notification autre que email + badge in-app (ex: SMS, push).
- Dépasser le budget Vercel/Supabase gratuit (passage à un tier payant).
- Permettre le hard delete d'une entité métier.

**Never Do :**
- Committer des secrets (clés API Supabase, tokens, mots de passe) dans le code source.
- Supprimer un test existant sans approbation écrite du Product Champion.
- Permettre à un commercial de modifier un devis après qu'il a été soumis en validation (statut "En attente").
- Permettre à un commercial de modifier un devis après qu'il a été validé par le manager.
- Stocker les données d'une entreprise dans une table sans politique RLS active.
- Générer un PDF dépassant 1 Mo.
- Charger plus de 50 devis à la fois sans pagination côté serveur.
- Implémenter une gestion multi-devises (uniquement FCFA).
- Implémenter un pipeline de statuts avancé (brouillon → en attente → validé/refusé uniquement).
- Implémenter une gestion de facturation, de paiement en ligne, ou d'intégration CRM/ERP.
- Ajouter du contenu en anglais ou une autre langue que le français.
- Déployer sur un environnement de production sans que le build passe sans erreur.
- Effectuer un hard delete sur une entité métier (client, devis, utilisateur, entreprise).
- Bloquer la création d'un devis si le logo entreprise n'est pas encore uploadé.

---

## 5. RÈGLES MÉTIER COMPLÉMENTAIRES

Les règles suivantes découlent de la résolution des Open Questions et constituent des contraintes fonctionnelles obligatoires pour le MVP.

### 5.1 Logo Entreprise
- Le logo de l'entreprise est **optionnel** à la création du profil.
- Il peut être ajouté ou modifié à tout moment par le manager.
- Spécifications techniques : max 500x500px, compressé à < 200 KB, formats acceptés WebP ou PNG.
- Le système shall afficher un placeholder visuel si aucun logo n'est défini.

### 5.2 Numérotation des Devis
- Le système shall générer automatiquement un numéro de devis selon le format prédéfini par défaut : `DEV-YYYY-XXXX` (ex: `DEV-2026-0042`).
- Le manager peut configurer un préfixe personnalisé dans les paramètres entreprise.
- Le compteur incrémental (`XXXX`) shall être géré par une séquence SQL atomique dans Supabase pour garantir l'absence de collision en cas de création simultanée par plusieurs commerciaux.
- Le numéro est définitivement attribué dès la création du devis (même en statut "Brouillon").

### 5.3 Notifications de Validation
- Lorsqu'un commercial soumet un devis en validation, le système shall déclencher **deux notifications en parallèle** :
  1. Un **badge in-app** visible sur l'interface du manager (icône de notification, compteur).
  2. Un **email immédiat** envoyé à l'adresse du manager via l'adresse expéditrice générique `devis@notresaas.ci`.
- Le badge in-app shall être mis à jour en temps réel (ou au rechargement de la page si le temps réel n'est pas disponible dans le MVP).

### 5.4 Workflow de Refus
- Lorsqu'un manager refuse un devis, le système shall :
  1. Enregistrer le commentaire de refus (optionnel mais recommandé).
  2. Rebasculer automatiquement le statut du devis en **"Brouillon"**.
  3. Rendre le devis à nouveau entièrement modifiable par le commercial qui l'a créé.
- Le commercial peut alors modifier le devis et le soumettre à nouveau en validation.
- L'historique des soumissions et refus successifs est conservé (logs d'audit).

### 5.5 Suppression des Données
- Le système shall appliquer un **soft-delete** sur toutes les entités métier : `Entreprise`, `Utilisateur`, `Client`, `Devis`, `LigneDevis`.
- Aucune opération de hard delete n'est autorisée dans le MVP.
- Les entités soft-deleted (colonne `is_deleted = true`) sont exclues des listes et des requêtes métier par défaut via les politiques RLS.
- Cette règle garantit la conservation légale et l'intégrité référentielle.

### 5.6 Template PDF
- Le PDF généré utilise un **template unique et figé** pour le MVP.
- Aucune personnalisation du layout PDF (couleurs, positionnement, typographie) n'est permise au-delà des données configurables (logo, raison sociale, coordonnées, conditions).
- Le système shall garantir que le PDF respecte les contraintes de taille (< 1 Mo) et de contenu obligatoire.

### 5.7 Email Expéditeur
- Tous les emails envoyés par le système (notification de validation, envoi de devis) partent de l'adresse générique du SaaS : `devis@notresaas.ci`.
- Le nom d'affichage de l'expéditeur shall inclure le nom de l'entreprise (ex: `"Société ABC via SaaS Devis" <devis@notresaas.ci>`) pour identifier l'origine auprès du client final.

### 5.8 Gestion de l'Abonnement
- Dans le MVP, l'accès au SaaS est **binaire** : l'entreprise est soit **Active** (souscription à jour), soit **Inactive** (souscription expirée ou non payée).
- Aucune limite fonctionnelle (nombre de devis, nombre d'utilisateurs, nombre de clients) n'est appliquée dans le MVP, quelle que soit la tranche tarifaire (10 000 ou 30 000 FCFA).
- La gestion du statut Actif/Inactif est manuelle (hors MVP automatisé) via un tableau d'administration interne.
- Le système shall bloquer l'accès à l'application pour tous les utilisateurs d'une entreprise marquée Inactive.

### 5.9 Données Obligatoires du Client
- Pour créer un client dans l'annuaire, les champs suivants sont **obligatoires** :
  - Nom du client (ou raison sociale)
  - Numéro de téléphone
- Les champs suivants sont **optionnels** :
  - Adresse email
  - Adresse physique
- Le système shall empêcher la soumission du formulaire si un champ obligatoire est vide.

### 5.10 Date de Validité du Devis
- Chaque devis shall comporter une **date de validité** indiquant jusqu'à quand le devis reste proposable au client.
- La date de validité par défaut est calculée automatiquement à **J+30** (30 jours après la date de création du devis).
- Le manager peut configurer une valeur par défaut différente dans les paramètres entreprise (ex: 15 jours, 60 jours).
- Le commercial peut modifier la date de validité manuellement lors de la création ou modification d'un devis.
- La date de validité est affichée sur le PDF généré.

---

## 6. APPROBATION

| Rôle | Nom | Date | Signature (Oui/Non) |
|------|-----|------|---------------------|
| Product Champion | — | 2026-07-11 | **OUI** |
| Lead Developer | — | — | En attente Phase 2 |
| Lead Tester | — | — | En attente Phase 2 |

**Phase 1 (SPECIFY) — FINALISÉE et APPROUVÉE.**

> La spécification est prête pour la Phase 2 (Plan). Aucune modification de scope ne sera acceptée sans passage par le processus de Change Control (Phase 5).
ADDENDUM : CORRECTIONS POST-VALIDATION (Rapport de Validation v1.0)
Cet addendum fait office de mise à jour officielle de la spécification. En cas de contradiction avec le corps du document, c'est l'Addendum qui prévaut.

ADD-001 : Stratégie de Sauvegarde (Corrige D-001)
NFR-AVAIL-03 (Data_Backup_RPO) modifiée :

Must : RPO < 24 heures. Utilisation du backup quotidien natif du tier gratuit de Supabase. Pas d'activation de PITR (Point-in-Time Recovery) pour rester dans les contraintes de budget.
Plan : RPO < 24 heures (idem Must sur le tier gratuit).Justification : Le PITR est une fonctionnalité payante (tier Pro). L'acceptation d'une perte de données maximale de 24h est un risque métier acceptable pour un MVP de cette taille.
ADD-002 : Gestion de la désactivation d'un utilisateur (Corrige D-006)
US-12 et Règle 5.5 modifiées :

L'action de "suppression" devient une "désactivation" (soft-delete : is_active = false).
Les devis créés par l'utilisateur désactivé restent attachés à son ID pour garantir l'intégrité de l'historique et de l'audit trail.
Ces devis deviennent consultables par tous les Managers de l'entreprise.
Règle ajoutée : Il est interdit de désactiver le dernier utilisateur ayant le rôle Manager/Admin actif d'une entreprise (pour éviter qu'une entreprise ne devienne orpheline).
ADD-003 : Résilience réseau et données non soumises (Corrige D-010)
NFR-AVAIL-02 (Network_Resilience) modifiée :

Must : Le système affiche un indicateur visuel clair (ex: barre "Hors connexion") et bloque toute soumission de formulaire. Les données saisies mais NON SOUMISES sont perdues en cas de rechargement ou de fermeture de la page.
Plan : Même comportement que Must, avec ajout d'un message d'avertissement "Enregistrez votre travail avant de quitter" lorsque le réseau est détecté comme instable.Justification : La promesse de "0% de perte de données" sans mécanisme de persistance locale (localStorage) est techniquement impossible et hors scope du MVP.
ADD-004 : Validation des données de devis (Corrige D-012)
Règle Métier 5.11 ajoutée :Le système doit valider les données saisies dans les lignes de devis avant toute sauvegarde :

Quantité : entier supérieur à 0.
Prix unitaire : nombre supérieur à 0.
Description : texte obligatoire, non vide.
Limite : maximum 50 lignes par devis.
Total : calculé automatiquement par le système (somme des lignes). Le champ total est en lecture seule pour l'utilisateur.
ADD-005 : Connexion entreprise inactive (Corrige D-018)
US-9 modifiée :Ajout du cas d'erreur : "En tant qu'utilisateur d'une entreprise inactive, je ne peux pas me connecter afin que l'accès soit contrôlé par le statut de souscription."Comportement : Si l'entreprise de l'utilisateur est marquée Inactive, l'authentification Supabase réussit, mais l'application bloque l'accès à l'interface et affiche : "Votre abonnement a expiré. Contactez le responsable de votre entreprise."

Intégration des Défauts Mineurs (D-002 à D-020)
Les 15 défauts mineurs identifiés dans le rapport de validation sont acceptés en l'état par le Product Champion. Ils seront traités comme des règles d'implémentation directes par le Lead Developer en Phase 3 (ex: remplacement de l'exemple /api/v1/products par les vrais endpoints, clarification du rôle "Manager" dans la vue des devis, etc.).