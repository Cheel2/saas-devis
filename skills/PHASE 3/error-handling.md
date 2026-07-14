
````markdown
<!-- error-handling-v2.md -->
---
name: error-handling-v2
description: Handles errors systematically using exceptions, clean separation, and resilience patterns. Use when implementing logic that can fail, refactoring error-code-based code, designing APIs that communicate failures, or adding useful debug messages.
---

# Error Handling (v2 — Enrichi)

## 1. OBJECTIF DU SKILL

**Pourquoi ce skill existe ?**
La gestion des erreurs est souvent une réflexion après-coup, ce qui conduit à du code fragile, des messages d'erreur inutiles, et des bugs difficiles à diagnostiquer. Une gestion d'erreur bien conçue sépare la logique métier de la gestion des exceptions, utilise des exceptions plutôt que des codes d'erreur, et fournit des informations exploitables pour le débogage et la résolution.

**Quel problème résout-il ?**
- Les codes d'erreur créent des imbrications profondes et mélangent logique normale et gestion d'erreur.
- Les exceptions non gérées font planter l'application.
- Les messages d'erreur vagues rendent le débogage impossible.
- Les "dependency magnet" (fichiers d'erreurs) créent des couplages inutiles.
- Les fonctions qui traitent les erreurs ET la logique métier sont difficiles à comprendre.
- Les échecs silencieux (catch vide) cachent des bugs en production.

**Dans quel contexte l'utiliser ?**
- Implémentation de toute logique qui peut échouer (I/O, API, validation).
- Refactorisation de code utilisant des codes d'erreur.
- Conception d'APIs qui doivent communiquer des erreurs.
- Ajout de messages d'erreur utiles pour le débogage.
- Gestion des exceptions non anticipées.

---

## 2. PRÉREQUIS

**Ce qui doit être déjà fait :**
- ✅ Les cas d'erreur possibles sont identifiés (Phase 1).
- ✅ Les types d'exceptions sont définis (ou conventions du langage).
- ✅ Le logging est configuré.
- ✅ **L'architecture du projet est connue** (monolithe, microservices, serverless, etc.).

**Quels documents sont nécessaires :**
- Spécification des cas d'erreur (quand, pourquoi, comment).
- Convention de logging du projet.
- Types d'exceptions (hiérarchie).

**Quelles informations doivent être disponibles :**
- Les dépendances externes (API, base de données) et leurs modes d'échec.
- Les politiques de retry / fallback.
- Les besoins de monitoring et d'alerting.
- **Le modèle d'exécution : synchrone ou asynchrone** (pour les retry/circuit breaker).

---

## 3. RÔLES ET RESPONSABILITÉS

| Rôle | Responsabilités |
|------|-----------------|
| Développeur (IA/Humain) | Utilise des exceptions plutôt que des codes d'erreur. Extrait les try/catch de la logique métier. Fournit des messages d'erreur exploitables. Gère les exceptions à la périphérie. Implémente les retry/fallback si nécessaire. |
| Réviseur (Code Review) | Vérifie que les erreurs sont gérées (pas de fail-silent). Vérifie que les messages d'erreur sont utiles. Vérifie qu'il n'y a pas de codes d'erreur. |
| DevOps / SRE | Configure le monitoring des erreurs. Définit les alertes pour les erreurs critiques. |
| Support / QA | Utilise les messages d'erreur pour diagnostiquer les problèmes. Signale les erreurs peu claires. |

---

## 4. PROCESSUS DÉTAILLÉ (Étape par Étape)

### Étape 1 : Préférer les exceptions aux codes d'erreur

**Objectif :** Utiliser les exceptions (mécanisme du langage) plutôt que des codes d'erreur pour signaler les échecs.

**Pourquoi les exceptions sont meilleures :**
- Séparent la logique normale de la gestion d'erreur.
- Évitent l'imbrication profonde de if/else.
- Forcent le traitement (ou la remontée) de l'erreur.
- Fournissent des informations de stack trace.

```typescript
// ❌ Codes d'erreur - imbrication profonde
function deletePage(page: Page): number {
  const result1 = deletePageFromDatabase(page);
  if (result1 !== 0) {
    logger.log('Delete failed');
    return 1;
  }

  const result2 = registry.deleteReference(page.name);
  if (result2 !== 0) {
    logger.log('DeleteReference failed');
    return 1;
  }

  const result3 = configKeys.deleteKey(page.name);
  if (result3 !== 0) {
    logger.log('DeleteKey failed');
    return 1;
  }

  return 0;
}

// ✅ Exceptions - logique claire
function deletePage(page: Page): void {
  try {
    deletePageAndAllReferences(page);
  } catch (Exception e) {
    logger.log(e.getMessage());
    throw e; // Ou gérer et relancer
  }
}

function deletePageAndAllReferences(page: Page): void {
  deletePageFromDatabase(page);
  registry.deleteReference(page.name);
  configKeys.deleteKey(page.name);
}
````

**Les 3 formes de gestion d'erreur (du pire au meilleur) :**

**1. Échec silencieux (à éviter absolument) :** L'erreur est ignorée.

TypeScript

```typescript
// ❌ Échec silencieux - le pire
try {
  deletePage(page);
} catch (Exception e) {
  // Rien - personne ne saura que ça a échoué
}
```

**2. Échec avec log (acceptable seulement si suivi d'une action) :** L'erreur est logguée mais le programme continue.

TypeScript

```typescript
// ⚠️ Échec avec log seul = échec silencieux déguisé
try {
  deletePage(page);
} catch (Exception e) {
  logger.log(e.getMessage());
  // On continue - mais on sait que ça a échoué
}

// ✅ Échec avec log + action corrective (fallback, propagation, retry)
try {
  deletePage(page);
} catch (Exception e) {
  logger.log(e.getMessage());
  throw new DeletePageException('Failed to delete page', e); // Propagation
}
```

**3. Échec avec propagation (recommandé) :** L'erreur est logguée ET propagée.

TypeScript

```typescript
// ✅ Échec avec propagation
try {
  deletePage(page);
} catch (Exception e) {
  logger.log(e.getMessage());
  throw new DeletePageException('Failed to delete page', e);
}
```

**Questions à poser :**

- Utilise-t-on des codes d'erreur ou des exceptions ?
    
- Les échecs silencieux sont-ils évités ?
    
- Les exceptions sont-elles propagées correctement ?
    

**Critères de validation :**

- Les exceptions sont utilisées (pas de codes d'erreur).
    
- Pas d'échecs silencieux (catch vide).
    
- **Pas de catch qui logue seul sans propagation, fallback, ou retry explicite.**
    
- Les exceptions sont logguées avant d'être propagées.
    

---

### Étape 2 : Extraire les try/catch

**Objectif :** Séparer la gestion des erreurs de la logique métier.

**Règle :** Une fonction qui contient `try` ne doit faire que la gestion d'erreur. La logique métier est dans une fonction séparée.

TypeScript

```typescript
// ❌ Try/catch mélangé avec la logique
function processOrder(order: Order): void {
  try {
    validateOrder(order);
    const total = calculateTotal(order);
    saveOrder(order.id, total);
    sendEmail(order.customer, total);
  } catch (ValidationError e) {
    logger.log('Validation failed: ' + e.message);
    throw new OrderProcessingError('Failed to process order', e);
  } catch (DatabaseError e) {
    logger.log('Database error: ' + e.message);
    throw new OrderProcessingError('Failed to save order', e);
  } catch (EmailError e) {
    logger.log('Email error: ' + e.message);
    throw new OrderProcessingError('Failed to send email', e);
  }
}

// ✅ Try/catch extrait - logique pure
function processOrder(order: Order): void {
  try {
    processOrderInternal(order);
  } catch (Exception e) {
    logger.log(e.getMessage());
    throw e;
  }
}

function processOrderInternal(order: Order): void {
  validateOrder(order);
  const total = calculateTotal(order);
  saveOrder(order.id, total);
  sendEmail(order.customer, total);
}
```

**Avantages :**

- La logique métier est pure et lisible.
    
- La gestion d'erreur est centralisée.
    
- Les tests peuvent tester la logique sans s'inquiéter des exceptions.
    

**Questions à poser :**

- Le try/catch est-il séparé de la logique métier ?
    
- La fonction principale ne fait-elle que gérer les erreurs ?
    
- La logique métier est-elle testable sans le try/catch ?
    

**Critères de validation :**

- Les try/catch sont extraits dans des fonctions séparées.
    
- Les fonctions de logique métier ne contiennent pas de try/catch.
    
- Les fonctions de gestion d'erreur ne contiennent que de la gestion d'erreur.
    

---

### Étape 3 : Error handling is one thing

**Objectif :** Une fonction qui gère les erreurs ne fait que ça — pas de logique métier.

**Règle :** Si une fonction contient `try`, ce doit être le premier mot (après quelques déclarations) et il ne doit rien y avoir après catch/finally.

TypeScript

```typescript
// ✅ Une fonction = une seule chose (gestion d'erreur)
function deletePage(page: Page): void {
  try {
    deletePageAndAllReferences(page);
  } catch (Exception e) {
    logger.log(e.getMessage());
    throw new DeletePageException('Failed to delete page', e);
  }
}

// ✅ Une fonction = une seule chose (logique métier)
function deletePageAndAllReferences(page: Page): void {
  deletePage(page);
  registry.deleteReference(page.name);
  configKeys.deleteKey(page.name);
}

// ❌ Mélange : la fonction fait deux choses
function deletePage(page: Page): void {
  try {
    deletePage(page);
    registry.deleteReference(page.name);
    // Logique mélangée avec gestion d'erreur
  } catch (Exception e) {
    logger.log(e.getMessage());
    retryDelete(page); // Logique de retry dans catch
  }
}
```

**Lien avec CQS (Command Query Separation) :**

- Une fonction de gestion d'erreur est une **commande** : elle modifie l'état (log, propagation) et ne retourne pas de valeur métier.
    
- Elle ne devrait pas être utilisée comme une requête (`if (handleError(e)) { ... }`).
    

**Questions à poser :**

- La fonction fait-elle plus que la gestion d'erreur ?
    
- Y a-t-il de la logique métier dans le catch ?
    
- Le try est-il le premier mot de la fonction ?
    

**Critères de validation :**

- Les fonctions de gestion d'erreur ne font que ça.
    
- Pas de logique métier dans les blocs catch.
    
- Le try est le premier mot (ou après déclarations).
    

---

### Étape 4 : Fournir des messages d'erreur exploitables

**Objectif :** Les messages d'erreur doivent aider à diagnostiquer et résoudre le problème.

**Caractéristiques d'un bon message d'erreur :**

Table

|Caractéristique|Description|Exemple|
|:--|:--|:--|
|Contexte|Que faisait-on ?|`Failed to process order ${order.id}`|
|Détail|Qu'est-ce qui a échoué exactement ?|`Database connection timeout after 5000ms`|
|Cause probable|Pourquoi cela a-t-il échoué ?|`The customer does not exist in the database`|
|Action possible|Que peut faire l'utilisateur ?|`Please check that the customer exists and has sufficient balance`|

**Exemples :**

TypeScript

```typescript
// ❌ Message vague
throw new Error('Failed to process order');

// ✅ Message avec contexte
throw new OrderProcessingError(
  `Failed to process order ${order.id} for customer ${order.customerId}. ` +
  `Reason: ${e.message}. ` +
  `Please check that the customer exists and has sufficient balance.`
);

// ❌ Message technique (pour l'utilisateur)
throw new Error('SQL Error: 1062 Duplicate entry');

// ✅ Message adapté
throw new ValidationError(
  `A customer with email ${email} already exists. ` +
  `Please use a different email address or login to existing account.`
);
```

**Niveaux de message :**

Table

|Niveau|Usage|Exemple|
|:--|:--|:--|
|DEBUG|Développement|"Attempting to connect to database at localhost:5432"|
|INFO|Opération normale|"Order 123 processed successfully"|
|WARN|Problème non critique|"Retry 3/5 for order 123"|
|ERROR|Échec critique|"Failed to process order 123: Database unavailable"|
|FATAL|Arrêt de l'application|"Unable to start: Database connection failed"|

**Questions à poser :**

- Le message d'erreur est-il utile pour le débogage ?
    
- L'utilisateur peut-il comprendre ce qui s'est passé ?
    
- Y a-t-il suffisamment de contexte ?
    

**Critères de validation :**

- Les messages d'erreur incluent le contexte.
    
- Les messages sont compréhensibles par l'audience cible.
    
- Les messages incluent des actions possibles (si applicable).
    

---

### Étape 5 : Gérer les erreurs à la périphérie

**Objectif :** Les exceptions doivent être gérées à la périphérie (interface utilisateur, API, batch), pas au milieu de la logique métier.

**Principe :** Les couches internes (business, domaine) peuvent lancer des exceptions. Les couches externes (UI, API) les attrapent et les présentent à l'utilisateur.

**Architecture type (adapter selon le projet) :**

plain

```plain
┌─────────────────────────────────────────────────────┐
│  Périphérie (UI, API, Batch)                       │
│  ├── Attrape les exceptions                        │
│  ├── Formate pour l'utilisateur                    │
│  └── Logge l'erreur                               │
├─────────────────────────────────────────────────────┤
│  Couche Métier                                     │
│  ├── Lance des exceptions pour les cas d'échec    │
│  └── Ne gère PAS les exceptions (propagation)     │
├─────────────────────────────────────────────────────┤
│  Couche Infrastructure (Base de données, API)     │
│  ├── Lance des exceptions techniques              │
│  └── Ne gère PAS les exceptions (propagation)     │
└─────────────────────────────────────────────────────┘
```

**⚠️ Zéro Présomption :** Ce diagramme est un exemple d'architecture en couches. Si le projet utilise une architecture différente (hexagonale, onion, microservices, serverless), adapter la notion de "périphérie" au contexte du projet.

**Exemple :**

TypeScript

```typescript
// ✅ Périphérie (API) : gère les exceptions
async function handleRequest(req: Request, res: Response): Promise<void> {
  try {
    const result = await processOrder(req.body);
    res.json({ success: true, data: result });
  } catch (ValidationError e) {
    res.status(400).json({ error: e.message }); // Mauvaise requête
  } catch (DatabaseError e) {
    logger.error(e.message);
    res.status(500).json({ error: 'Internal server error' }); // Erreur serveur
  } catch (Exception e) {
    logger.error('Unexpected error', e);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
}

// ✅ Couche métier : lance des exceptions, ne les attrape pas
function processOrder(order: Order): void {
  validateOrder(order);
  const total = calculateTotal(order);
  saveOrder(order.id, total);
  sendEmail(order.customer, total);
  // Les exceptions remontent à la périphérie
}
```

**Lien avec la pureté des fonctions :**

- Les fonctions de la couche métier devraient être **pures** (pas d'I/O, pas d'effets de bord).
    
- La gestion d'erreur (I/O, logging) est intrinsèquement **impure**.
    
- En isolant la gestion d'erreur à la périphérie, on préserve la pureté du cœur métier.
    

**Questions à poser :**

- Les exceptions sont-elles attrapées à la périphérie ?
    
- Les couches internes propagent-elles les exceptions (pas de try/catch) ?
    
- Les erreurs sont-elles formatées pour l'utilisateur à la périphérie ?
    

**Critères de validation :**

- Les exceptions sont attrapées à la périphérie.
    
- Les couches internes propagent les exceptions.
    
- Les erreurs sont formatées pour l'audience cible.
    

---

### Étape 6 : Éviter les "Dependency Magnet"

**Objectif :** Ne pas créer un fichier central d'erreurs que tout le monde importe.

**Problème :** Un fichier central d'erreurs (`error.h`, `Error.java`) devient un "dependency magnet" — chaque modification oblige à recompiler tout le projet.

TypeScript

```typescript
// ❌ Dependency magnet - tout le monde importe ce fichier
// errors.ts
export enum ErrorCode {
  OK = 0,
  INVALID = 1,
  NO_SUCH = 2,
  LOCKED = 3,
  OUT_OF_RESOURCES = 4,
  // Ajouter une erreur → tout le monde recompile
}

// ✅ Exception hiérarchique - les erreurs sont dans leurs propres fichiers
// validation/ValidationError.ts
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// database/DatabaseError.ts
export class DatabaseError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// ✅ Interface d'erreur (Go)
// error.go
type Error interface {
  Error() string
}

// validation/errors.go
type ValidationError struct {
  Message string
}

func (e ValidationError) Error() string {
  return e.Message
}
```

**Solutions :**

- Hiérarchie d'exceptions : Chaque domaine a ses propres exceptions.
    
- Interfaces : Les erreurs implémentent une interface commune.
    
- Pattern Result (Option, Either) : Dans les langages fonctionnels.
    

**Questions à poser :**

- Y a-t-il un fichier central d'erreurs que tout le monde importe ?
    
- Les erreurs sont-elles spécifiques à leur domaine ?
    
- Les erreurs peuvent-elles être ajoutées sans recompiler tout le projet ?
    

**Critères de validation :**

- Pas de fichier central d'erreurs (dependency magnet).
    
- Les erreurs sont spécifiques à leur domaine.
    
- L'ajout d'une erreur n'oblige pas à recompiler tout le projet.
    

---

### Étape 7 : Gérer les erreurs de manière spécifique

**Objectif :** Chaque type d'erreur est traité de manière appropriée (pas de catch général).

TypeScript

```typescript
// ❌ Catch général - on ignore le type d'erreur
try {
  processOrder(order);
} catch (Exception e) {
  // On traite tout de la même manière
  logger.log(e.getMessage());
  res.status(500).json({ error: 'An error occurred' });
}

// ✅ Catch spécifique - traitement approprié
try {
  processOrder(order);
} catch (ValidationError e) {
  // Erreur utilisateur → code 400
  res.status(400).json({ error: e.message });
} catch (DatabaseError e) {
  // Erreur base de données → retry
  await retry(() => processOrder(order), 3);
  res.status(500).json({ error: 'Database temporarily unavailable' });
} catch (RateLimitError e) {
  // Rate limit → attendre
  await sleep(e.retryAfter);
  res.status(429).json({ error: 'Too many requests. Try again later.' });
} catch (Exception e) {
  // Erreur inattendue → log + 500
  logger.error('Unexpected error', e);
  res.status(500).json({ error: 'An unexpected error occurred' });
}
```

**Types d'erreurs et traitements typiques :**

Table

|Type d'erreur|Code HTTP|Traitement|
|:--|:--|:--|
|ValidationError|400|Message à l'utilisateur|
|NotFoundError|404|Message à l'utilisateur|
|AuthenticationError|401|Rediriger vers login|
|AuthorizationError|403|Message à l'utilisateur|
|DatabaseError|500|Retry, log, alerte|
|RateLimitError|429|Attendre, réessayer|
|NetworkError|500|Retry avec backoff|
|TimeoutError|504|Retry, log|

**Special Case Pattern (éviter les null checks répétés) :**

TypeScript

```typescript
// ❌ Null checks répétés partout
function getDiscount(user: User): number {
  if (user == null) return 0;
  if (user.subscription == null) return 0;
  return user.subscription.discount;
}

// ✅ Special Case : un objet null-safe
class NullSubscription extends Subscription {
  getDiscount(): number { return 0; }
}

// Le domaine garantit que subscription n'est jamais null
function getDiscount(user: User): number {
  return user.subscription.getDiscount(); // Toujours sûr
}
```

**Questions à poser :**

- Les exceptions sont-elles attrapées par type ou par catch général ?
    
- Le traitement est-il approprié au type d'erreur ?
    
- Y a-t-il des retry/fallback pour les erreurs récupérables ?
    
- Y a-t-il des null checks répétés qui pourraient être remplacés par un Special Case ?
    

**Critères de validation :**

- Les exceptions sont attrapées par type (pas de catch général).
    
- Le traitement est adapté au type d'erreur.
    
- Les retry/fallback sont implémentés pour les erreurs récupérables.
    

---

### Étape 8 : Implémenter les retry et fallback (Environnements asynchrones)

**⚠️ Zéro Présomption :** Les patterns de retry, circuit breaker et fallback s'appliquent principalement aux environnements asynchrones (Node.js, Python asyncio, Java async). Pour les environnements synchrones ou embarqués, se concentrer sur les étapes 1-7.

**Objectif :** Pour les erreurs temporaires, implémenter des mécanismes de récupération.

**Patterns de retry :**

**1. Retry simple :** Réessayer N fois avec délai fixe.

TypeScript

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (i < maxRetries - 1) {
        await sleep(delay * (i + 1)); // Délai progressif
      }
    }
  }
  throw lastError;
}
```

**2. Exponential backoff :** Délai qui double à chaque tentative.

TypeScript

```typescript
async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  initialDelay: number = 1000
): Promise<T> {
  let delay = initialDelay;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      await sleep(delay);
      delay *= 2;
    }
  }
}
```

**3. Circuit breaker :** Évite les appels répétés quand le service est en échec.

TypeScript

```typescript
class CircuitBreaker {
  private failures = 0;
  private open = false;
  private timeout: NodeJS.Timeout | null = null;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.open) {
      throw new CircuitOpenError('Circuit is open');
    }

    try {
      const result = await fn();
      this.reset();
      return result;
    } catch (e) {
      this.recordFailure();
      throw e;
    }
  }

  private recordFailure(): void {
    this.failures++;
    if (this.failures >= 5) {
      this.open = true;
      this.timeout = setTimeout(() => this.reset(), 30000);
    }
  }

  private reset(): void {
    this.failures = 0;
    this.open = false;
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}
```

**Patterns de fallback :**

TypeScript

```typescript
// Fallback : utiliser un cache si la source primaire échoue
async function getUserData(userId: string): Promise<User> {
  try {
    return await database.getUser(userId);
  } catch (DatabaseError) {
    logger.warn('Database unavailable, using cache');
    return await cache.getUser(userId);
  }
}

// Fallback : valeur par défaut
async function getConfig(key: string): Promise<string> {
  try {
    return await configService.get(key);
  } catch (ServiceError) {
    logger.warn('Config service unavailable, using default');
    return getDefaultConfig(key);
  }
}
```

**Questions à poser :**

- Les erreurs sont-elles temporaires ou permanentes ?
    
- Un retry est-il approprié ?
    
- Un fallback est-il possible ?
    
- **L'environnement est-il asynchrone (retry applicable) ou synchrone (se concentrer sur la propagation) ?**
    

**Critères de validation :**

- Les retry sont implémentés pour les erreurs temporaires.
    
- L'exponential backoff est utilisé pour éviter la surcharge.
    
- Les fallbacks sont implémentés quand c'est possible.
    
- Les circuit breakers sont implémentés pour les services externes.
    

---

## 5. ANTI-PATTERNS DE GESTION D'ERREUR (À ÉVITER)

Table

|Anti-pattern|Problème|Solution|
|:--|:--|:--|
|Échec silencieux|catch vide|Logger l'erreur ou la propager|
|Codes d'erreur|Imbrication profonde|Exceptions|
|Catch général|Traitement inapproprié|Catch par type|
|Logging excessif|Bruit, difficile à analyser|Logs utiles (niveau approprié)|
|Pas de contexte|Message vague|Ajouter contexte|
|Pas de propagation|Erreur mangée|Propager avec cause|
|Dependency magnet|Fichier central d'erreurs|Exceptions spécifiques|
|Pas de retry|Échec d'appel temporaire|Retry avec backoff|
|Pas de fallback|Échec sans alternative|Fallback si possible|
|Log seul sans action|Échec silencieux déguisé|Log + propagation/fallback/retry|

---

## 6. RATIONALISATIONS COURANTES (À ÉVITER)

Table

|Rationalisation|Réalité|
|:--|:--|
|"Je mets juste un try/catch pour être sûr"|Catch vide = échec silencieux = pire que l'erreur.|
|"Je vais catcher tout et logger"|Perte d'informations de stack trace. Log sans action = silencieux.|
|"Les exceptions sont lentes"|Négligeable comparé à la correction d'un bug.|
|"Je n'ai pas besoin de messages détaillés"|Pour le débogage en production, si.|
|"Je retry jusqu'à ce que ça marche"|Sans backoff, surcharge le système.|
|"Un fallback c'est trop complexe"|Moins complexe qu'un service qui tombe.|
|"Je logue et je continue, c'est suffisant"|Non. Log + propagation, ou log + fallback, ou log + retry.|

---

## 7. RED FLAGS (Signaux d'alarme)

Table

|Signe|Problème|Solution|
|:--|:--|:--|
|Catch vide|Échec silencieux|Logger ou propager|
|Codes d'erreur|Imbrication|Utiliser exceptions|
|Catch de `Exception` générique|Perte d'info|Catch par type|
|Message d'erreur vague|Debug difficile|Ajouter contexte|
|Pas de retry|Échec temporaire persistant|Ajouter retry|
|Pas de fallback|Pas d'alternative|Implémenter fallback|
|Fichier central d'erreurs|Couplage|Exceptions spécifiques|
|Log seul sans action|Échec silencieux déguisé|Ajouter propagation/fallback|
|Try/catch dans la logique métier|Mélange des responsabilités|Extraire|
|Catch général en haut de la stack|Perte de contexte|Catch spécifique par type|

---

## 8. LIVRABLES ATTENDUS

Pour une gestion d'erreur complétée :

Table

|Document|Description|
|:--|:--|
|Exceptions|Classes d'exceptions spécifiques par domaine.|
|Gestionnaires d'erreur|Middleware / handlers pour la périphérie.|
|Retry/fallback|Mécanismes de récupération (si environnement async).|
|Logs|Messages d'erreur exploitables.|

---

## 9. LIENS AVEC LES AUTRES PHASES

**Input (Phase 2) :**

- `api-and-interface-design-v2` → Quelles erreurs l'API peut retourner.
    
- `architectural-patterns` → Où les erreurs sont gérées (périphérie).
    

**Output (Phase 4) :**

- Gestion d'erreur robuste → Facilite le débogage (Phase 4).
    
- Logs exploitables → Facilite le monitoring (Phase 6).
    

**Dépendances internes :**

- `function-design-v2` : Les fonctions utilisent des exceptions (pas de codes d'erreur). Les try/catch sont extraits.
    
- `test-driven-development-v2` : Tests des cas d'erreur (écrire le test d'erreur avant le code).
    
- `code-smells-v2` : Détection des codes d'erreur et des catch vides.
    

---

## 10. RESSOURCES UTILISÉES

- **Clean Code, 2nd Edition (Robert C. Martin)**
    
    - Ch. 7 : "Clean Functions" — Gestion des erreurs et pureté.
        
    - Ch. 8 : "Function Heuristics" — Préférer les exceptions aux codes d'erreur, Extract Try/Catch, Error Handling Is One Thing, Dependency Magnet.
        
- **Skills Osmani :** Aucun équivalent direct (nouveau skill).
    

---

## 11. EXEMPLE COMPLET D'APPLICATION

**Contexte :** API de traitement de commande avec gestion d'erreur robuste.

**Exceptions spécifiques :**

TypeScript

```typescript
// 1. Exceptions par domaine
// validation/ValidationError.ts
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// order/OrderNotFoundError.ts
export class OrderNotFoundError extends Error {
  constructor(orderId: string) {
    super(`Order ${orderId} not found`);
    this.name = 'OrderNotFoundError';
  }
}

// database/DatabaseError.ts
export class DatabaseError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}
```

**Logique métier avec exceptions :**

TypeScript

```typescript
// order/OrderService.ts
export class OrderService {
  constructor(
    private database: Database,
    private cache: Cache,
    private emailService: EmailService
  ) {}

  async processOrder(orderId: string): Promise<void> {
    // Les exceptions remontent à l'appelant
    const order = await this.getOrder(orderId);
    this.validateOrder(order);
    await this.saveOrder(order);
    await this.sendConfirmation(order);
  }

  private async getOrder(orderId: string): Promise<Order> {
    const order = await this.database.findOrder(orderId);
    if (!order) {
      throw new OrderNotFoundError(orderId);
    }
    return order;
  }

  private validateOrder(order: Order): void {
    if (!order.items || order.items.length === 0) {
      throw new ValidationError('Order must have at least one item');
    }
    if (order.total <= 0) {
      throw new ValidationError('Order total must be positive');
    }
  }

  private async saveOrder(order: Order): Promise<void> {
    try {
      await this.database.saveOrder(order);
    } catch (e) {
      throw new DatabaseError('Failed to save order', e);
    }
  }
}
```

**Périphérie (API) avec gestion d'erreur :**

TypeScript

```typescript
// api/handlers/orderHandler.ts
import { withRetry } from '../utils/retry';

export async function processOrderHandler(req: Request, res: Response): Promise<void> {
  try {
    const orderId = req.params.id;

    // Retry pour les erreurs temporaires
    const result = await withRetry(
      () => orderService.processOrder(orderId),
      3,
      1000
    );

    res.json({ success: true, data: result });
  } catch (e) {
    handleOrderError(e, res);
  }
}

function handleOrderError(e: Error, res: Response): void {
  // Catch par type
  if (e instanceof ValidationError) {
    res.status(400).json({
      error: 'Invalid request',
      message: e.message,
      code: 'VALIDATION_ERROR'
    });
    return;
  }

  if (e instanceof OrderNotFoundError) {
    res.status(404).json({
      error: 'Order not found',
      message: e.message,
      code: 'ORDER_NOT_FOUND'
    });
    return;
  }

  if (e instanceof DatabaseError) {
    logger.error('Database error', { error: e.message, cause: e.cause });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Database temporarily unavailable. Please try again later.',
      code: 'DATABASE_ERROR'
    });
    return;
  }

  // Erreur inattendue
  logger.error('Unexpected error', { error: e.message, stack: e.stack });
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred. Our team has been notified.',
    code: 'INTERNAL_ERROR'
  });
}
```

**Retry avec exponential backoff :**

TypeScript

```typescript
// utils/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let delay = initialDelay;
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      // Ne pas retry pour les erreurs non récupérables
      if (e instanceof ValidationError || e instanceof OrderNotFoundError) {
        throw e;
      }
      if (attempt < maxRetries - 1) {
        logger.warn(`Retry ${attempt + 1}/${maxRetries}`, {
          error: e.message,
          delay: delay
        });
        await sleep(delay);
        delay *= 2; // Exponential backoff
      }
    }
  }

  throw new RetryExhaustedError(`Failed after ${maxRetries} attempts`, lastError);
}
```

---

## 12. VÉRIFICATION FINALE (Definition of Done)

Après avoir implémenté la gestion d'erreur :

- [ ] Les exceptions sont utilisées (pas de codes d'erreur).
    
- [ ] Pas d'échecs silencieux (catch vides).
    
- [ ] Pas de catch qui logue seul sans action (propagation, fallback, ou retry).
    
- [ ] Les try/catch sont extraits de la logique métier.
    
- [ ] Les messages d'erreur sont exploitables (contexte, action possible).
    
- [ ] Les erreurs sont gérées à la périphérie (adapté à l'architecture du projet).
    
- [ ] Les exceptions sont attrapées par type (pas de catch général).
    
- [ ] Les retry sont implémentés pour les erreurs temporaires (si environnement async).
    
- [ ] Les fallbacks sont implémentés quand c'est possible.
    
- [ ] Pas de fichier central d'erreurs (dependency magnet).
    
- [ ] Les erreurs sont logguées avec le niveau approprié.
    
- [ ] Les exceptions ont des types spécifiques (pas de `Error` générique).
    
- [ ] **Les fonctions de gestion d'erreur respectent CQS (commande, pas requête).**
    
- [ ] **La pureté du cœur métier est préservée (I/O isolés en périphérie).**