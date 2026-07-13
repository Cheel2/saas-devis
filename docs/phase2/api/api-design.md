## Section 1 : Carte des endpoints

| Méthode | Chemin | Description | Rôle autorisé | Module |
|---|---|---|---|---|
| GET | /api/entreprise | Récupérer le profil de l'entreprise connectée | tous | Entreprise |
| PUT | /api/entreprise | Modifier le profil de l'entreprise (logo, coordonnées bancaires, CG, préfixe, durée validité) | manager | Entreprise |
| GET | /api/utilisateurs | Lister les utilisateurs de l'entreprise | manager | Utilisateur |
| POST | /api/utilisateurs | Inviter un nouvel utilisateur (email + rôle) | manager | Utilisateur |
| PUT | /api/utilisateurs/[id] | Modifier un utilisateur (nom, rôle, is_active) | manager | Utilisateur |
| PATCH | /api/utilisateurs/[id]/desactiver | Désactiver un utilisateur (soft-delete is_deleted = true) | manager | Utilisateur |
| GET | /api/clients | Lister les clients de l'entreprise | tous | Client |
| POST | /api/clients | Créer un client | tous | Client |
| GET | /api/clients/[id] | Récupérer un client | tous | Client |
| PUT | /api/clients/[id] | Modifier un client | tous | Client |
| PATCH | /api/clients/[id]/supprimer | Soft-delete un client (is_deleted = true) | tous | Client |
| GET | /api/devis | Lister les devis (filtrés par rôle : commercial = ses devis, manager = tous) | tous | Devis |
| POST | /api/devis | Créer un devis (brouillon) avec lignes | tous | Devis |
| GET | /api/devis/[id] | Récupérer un devis avec ses lignes | tous | Devis |
| PUT | /api/devis/[id] | Modifier un devis (uniquement si statut = brouillon pour commercial) | tous | Devis |
| PATCH | /api/devis/[id]/soumettre | Soumettre un devis en validation (statut brouillon → en_attente) | commercial | Devis |
| PATCH | /api/devis/[id]/valider | Valider un devis (statut en_attente → valide) | manager | Devis |
| PATCH | /api/devis/[id]/refuser | Refuser un devis (statut en_attente → brouillon, commentaire optionnel) | manager | Devis |
| PATCH | /api/devis/[id]/supprimer | Soft-delete un devis (is_deleted = true) | tous | Devis |
| POST | /api/devis/[id]/dupliquer | Dupliquer un devis existant (crée un nouveau brouillon avec les mêmes lignes) | tous | Devis |
| GET | /api/devis/[id]/pdf | Générer et télécharger le PDF d'un devis validé (appel vers Edge Function) | tous | PDF |
| GET | /api/tableau-de-bord | Récupérer les statistiques (nombre de devis par semaine, par statut) | manager | Dashboard |
| GET | /api/audit | Consulter les logs d'audit de l'entreprise | tous | Audit |

## Section 2 : Sémantique d'erreur

### Structure JSON d'une erreur

```json
{
  "code": "CODE_ERREUR",
  "message": "Description lisible en français",
  "details": "Information complémentaire (optionnel, pour le debug ou le support)"
}
```

### Taxonomie des codes d'erreur

| Code erreur | Message (français) | Code HTTP | Quand il est utilisé |
|---|---|---|---|
| VALIDATION_ERROR | Les données fournies sont invalides. | 422 | Un champ obligatoire est manquant, un type est incorrect, ou une règle métier de validation est violée (quantité <= 0, prix <= 0, email invalide). |
| ENTREPRISE_INACTIVE | Votre entreprise est inactive. Contactez votre administrateur. | 403 | L'utilisateur tente de se connecter ou d'accéder à l'application alors que son entreprise a is_active = false. |
| ACCES_REFUSE | Vous n'avez pas les droits pour effectuer cette action. | 403 | Le rôle de l'utilisateur ne permet pas l'opération (ex: commercial qui tente de valider un devis, ou modifier un utilisateur). |
| RESSOURCE_NON_TROUVEE | La ressource demandée n'existe pas ou n'est pas accessible. | 404 | L'identifiant fourni ne correspond à aucune ressource de l'entreprise de l'utilisateur (RLS bloque l'accès ou l'entité n'existe pas). |
| CONFLIT_NUMERO | Ce numéro de devis existe déjà. Veuillez réessayer. | 409 | Collision sur la contrainte UNIQUE(entreprise_id, numero) lors de la création d'un devis (rare, géré par retry côté client). |
| DERNIER_MANAGER | Impossible de désactiver le dernier manager actif de l'entreprise. | 409 | Un manager tente de désactiver le dernier utilisateur avec role = 'manager' et is_active = true de son entreprise. |
| DEVIS_NON_MODIFIABLE | Ce devis ne peut plus être modifié dans son état actuel. | 403 | Un commercial tente de modifier un devis dont le statut n'est pas 'brouillon'. |
| LIMITE_LIGNES | Un devis ne peut contenir plus de 50 lignes. | 422 | La création ou la modification d'un devis inclut plus de 50 lignes de prestation. |
| TROP_DE_REQUETES | Trop de requêtes. Veuillez patienter quelques instants. | 429 | Rate limiting déclenché (protection contre les abus sur les endpoints de création). |
| ERREUR_SERVEUR | Une erreur interne est survenue. Veuillez réessayer plus tard. | 500 | Erreur non anticipée côté serveur (Edge Function, base de données, etc.). |
| SERVICE_INDISPONIBLE | Le service est temporairement indisponible. Veuillez vérifier votre connexion. | 503 | Le service est hors ligne (indicateur de connexion détecte une indisponibilité). |

## Section 3 : Pagination et filtrage

### Format de la requête (paramètres query)

Tous les endpoints de liste (`GET /api/devis`, `GET /api/clients`, `GET /api/utilisateurs`, `GET /api/audit`) acceptent les paramètres suivants :

| Paramètre | Type | Obligatoire | Description | Valeur par défaut | Valeur max |
|---|---|---|---|---|---|
| page | integer | Non | Numéro de la page (commence à 1) | 1 | — |
| limit | integer | Non | Nombre d'éléments par page | 20 | 50 |

### Format de la réponse (structure JSON de la pagination)

```json
{
  "data": [ /* tableau d'éléments */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 87,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

### Règles de filtrage par module

| Endpoint | Filtres disponibles | Description |
|---|---|---|
| GET /api/devis | statut, commercial_id, client_id, date_debut, date_fin | Filtrer par statut (brouillon, en_attente, valide, refuse), par commercial (manager uniquement), par client, ou par plage de dates de création. |
| GET /api/clients | nom | Recherche partielle insensible à la casse sur le nom du client (ILIKE 'prefix%'). |
| GET /api/utilisateurs | role, is_active | Filtrer par rôle (commercial, manager) ou par statut actif/inactif. |
| GET /api/audit | action, entite_concernee, auteur_id, date_debut, date_fin | Filtrer par type d'action, entité concernée, auteur, ou plage de dates. |
| GET /api/tableau-de-bord | periode | Agrégation par période ('semaine', 'mois'). Défaut : 'semaine'. |

## Section 4 : Validation des entrées

| Module | Règles de validation |
|---|---|
| Entreprise | raison_sociale : obligatoire, 1 à 255 caractères. prefixe_numero : obligatoire, 1 à 10 caractères alphanumériques. duree_validite_jours : obligatoire, entier entre 1 et 365. logo_url : optionnel, URL valide si fourni. adresse_bancaire : optionnel, 500 caractères max. conditions_generales : optionnel, texte libre. |
| Utilisateur | email : obligatoire, format email valide, unique dans l'entreprise. nom_complet : obligatoire, 1 à 255 caractères. role : obligatoire, valeur dans ['commercial', 'manager']. is_active : obligatoire, boolean. |
| Client | nom : obligatoire, 1 à 255 caractères. telephone : obligatoire, format téléphone valide (regex internationale ou locale CI). email : optionnel, format email valide si fourni. adresse : optionnel, texte libre. |
| Devis | client_id : obligatoire, UUID valide, doit appartenir à l'entreprise de l'utilisateur. date_validite : obligatoire, date postérieure ou égale à la date de création. statut : obligatoire, valeur dans ['brouillon', 'en_attente', 'valide', 'refuse']. Nombre de lignes : max 50. |
| Ligne de devis | description : obligatoire, 1 à 500 caractères. quantite : obligatoire, entier strictement supérieur à 0. prix_unitaire : obligatoire, décimal strictement supérieur à 0, max 15 chiffres dont 2 décimales. sous_total : calculé automatiquement (quantite × prix_unitaire), non modifiable manuellement. |
| Workflow Devis | Soumission : le devis doit être en statut 'brouillon' et avoir au moins une ligne. Validation : le devis doit être en statut 'en_attente'. Refus : le devis doit être en statut 'en_attente', commentaire optionnel (max 1000 caractères). |
| Duplication | Le devis source doit exister et appartenir à l'entreprise. Le nouveau devis est créé en statut 'brouillon' avec un numéro atomique. Les lignes sont copiées (description, quantité, prix unitaire). Le client est conservé. |
