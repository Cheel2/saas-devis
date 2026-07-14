````markdown
# clean-tests-v2

## 1. OBJECTIF DU SKILL

**Pourquoi ce skill existe ?**
Les tests sont aussi importants que le code de production — ils documentent le comportement attendu, protègent contre les régressions, et permettent le refactoring en toute confiance. Mais des tests sales (mal nommés, dupliqués, fragiles) deviennent un fardeau. Ce skill fournit les principes pour écrire des tests qui sont clairs, maintenables, et qui servent de documentation vivante.

**Les tests sont du code de première classe.**
Un test sale est une dette technique qui paralyse le refactoring. Un test propre est un actif stratégique : il est le fondement de l'architecture flexible. Sans tests propres, les développeurs craignent de modifier la structure, et le code pourrit. Avec eux, on peut modifier la structure sans modifier le comportement. Les tests propres sont la clé des *-ilities* : maintainability, flexibility, reusability.

**Quel problème résout-il ?**
- Les tests fragiles qui cassent à chaque refactoring.
- Les tests qui ne sont pas isolés (dépendent les uns des autres).
- Les tests lents qui découragent leur exécution fréquente.
- Les tests qui ne sont pas auto-validants (besoin d'interprétation).
- Les tests sales qui deviennent une dette technique.

**Dans quel contexte l'utiliser ?**
- Écriture de nouveaux tests unitaires.
- Refactorisation de tests existants.
- Revue de code pour évaluer la qualité des tests.
- Établissement de standards de test pour un projet.
- Toute modification de comportement (TDD).

---

## 2. PRÉREQUIS

**Ce qui doit être déjà fait :**
- ✅ Framework de test installé et configuré (Jest, Vitest, pytest, JUnit, Go test, etc.).
- ✅ Les conventions de nommage sont établies (naming-conventions-v2).
- ✅ La fonction à tester est conçue (function-design-v2).

**Quels documents sont nécessaires :**
- Spécification du comportement à tester.
- Suite de tests existante (pour la cohérence).
- Standards de test du projet.

**Quelles informations doivent être disponibles :**
- Les cas nominaux et les cas limites.
- Les dépendances à mocker (si nécessaires).
- Les besoins de performance des tests.

---

## 3. RÔLES ET RESPONSABILITÉS

| Rôle | Responsabilités |
|------|-----------------|
| **Développeur (IA/Humain)** | - Écrit des tests propres et lisibles.<br>- Suit le pattern Arrange-Act-Assert.<br>- Utilise DAMP (Descriptive And Meaningful Phrases) plutôt que DRY.<br>- Nomme les tests de manière descriptive.<br>- Assure l'isolation des tests.<br>- Traite les tests comme du code de production (refactoring, revue). |
| **Réviseur (Code Review)** | - Vérifie que les tests sont lisibles et maintenables.<br>- Vérifie l'isolation des tests.<br>- Vérifie l'absence de flaky tests.<br>- Vérifie que les tests sont auto-validants. |
| **Testeur (QA)** | - Valide que les tests couvrent les cas limites.<br>- Signale les flaky tests.<br>- Utilise les tests comme documentation. |

---

## 4. PROCESSUS DÉTAILLÉ (Étape par Étape)

### Étape 1 : Les 3 Lois du TDD

**Objectif :** Suivre les lois fondamentales du TDD pour garantir que chaque ligne de code est testée.

**Les 3 Lois (Uncle Bob) :**
1. Vous n'êtes pas autorisé à écrire du code de production avant d'avoir écrit un test unitaire qui échoue parce que ce code n'existe pas.
2. Vous n'êtes pas autorisé à écrire plus d'un test que ce qui est suffisant pour échouer (et l'échec de compilation est un échec).
3. Vous n'êtes pas autorisé à écrire plus de code de production que ce qui est suffisant pour faire passer le test qui échoue actuellement.

**Note : Les tests sont du code de première classe.**
Les tests doivent être aussi propres, aussi bien nommés, et aussi refactorisés que le code de production. Un test sale est une dette technique qui paralyse le refactoring.

**Note : Discipline alternative — TCR (Test && Commit || Revert).**
Après chaque modification, si les tests passent, on commit. Si les tests échouent, on revert. C'est une discipline avancée qui force des micro-cycles ultra-courts et un code toujours vert.

**Exemple :**

```typescript
// 1. Écrire un test qui échoue (RED)
it('calcule la remise pour un utilisateur premium', () => {
  const user = { isPremium: true };
  const total = 100;
  const discount = calculateDiscount(user, total);
  expect(discount).toBe(10); // Échoue car calculateDiscount n'existe pas
});

// 2. Écrire le minimum pour faire passer le test (GREEN)
function calculateDiscount(user: User, total: number): number {
  return 10; // Juste assez pour passer le test
}

// 3. Refactorer
function calculateDiscount(user: User, total: number): number {
  return user.isPremium ? total * 0.1 : 0;
}
````

**Questions à poser :**

- Le test échoue-t-il avant d'écrire le code ?
    
- Le code est-il le minimum pour faire passer le test ?
    
- Ai-je refactoré après que le test soit passé ?
    

**Critères de validation :**

- Les tests sont écrits avant le code.
    
- Les tests échouent avant l'implémentation.
    
- Le code est le minimum pour passer le test.
    
- Le refactoring est fait après le passage du test.
    

---

### Étape 2 : F.I.R.S.T. — Les caractéristiques des tests propres

**Objectif :** Chaque test doit être Fast, Isolated, Repeatable, Self-validating, et Timely.

Table

|Caractéristique|Description|Exemple|
|:--|:--|:--|
|**Fast**|Rapide. Idéalement < 100ms par test unitaire pur.|Pas de I/O, pas de réseau, pas de base de données|
|**Isolated**|Isolé des autres tests|Chaque test crée ses propres données|
|**Repeatable**|Répétable partout|Pas de dépendance à l'environnement|
|**Self-validating**|Auto-validant|Résultat booléen (PASS/FAIL)|
|**Timely**|Écrit en même temps que le code|TDD|

**Fast — Tests rapides :**

- Un test unitaire pur doit s'exécuter en quelques millisecondes.
    
- Si un test dépasse 1 seconde, vérifiez qu'il ne fait pas d'I/O, de réseau, ou de base de données réelle.
    

TypeScript

```typescript
// ❌ Lent (base de données réelle)
it('sauvegarde une tâche', async () => {
  const task = await db.save({ title: 'Test' });
  expect(task.id).toBeDefined();
});

// ✅ Rapide (mock ou in-memory)
it('sauvegarde une tâche', async () => {
  const repository = new InMemoryTaskRepository();
  const task = await repository.save({ title: 'Test' });
  expect(task.id).toBeDefined();
});
```

**Isolated — Tests isolés :**

TypeScript

```typescript
// ❌ Dépend d'un autre test (partage d'état)
let taskId: string;

it('crée une tâche', () => {
  const task = createTask({ title: 'Test' });
  taskId = task.id; // L'autre test en dépend
});

it('supprime la tâche', () => {
  const result = deleteTask(taskId);
  expect(result).toBe(true);
});

// ✅ Isolé (chaque test est indépendant)
it('crée une tâche', () => {
  const task = createTask({ title: 'Test' });
  expect(task.id).toBeDefined();
});

it('supprime une tâche', () => {
  const task = createTask({ title: 'Test' });
  const result = deleteTask(task.id);
  expect(result).toBe(true);
});
```

**Repeatable — Tests répétables :**

TypeScript

```typescript
// ❌ Dépend de l'environnement (date actuelle)
it('vérifie que la date limite est dans le futur', () => {
  const task = createTask({ deadline: new Date() });
  expect(task.isPastDue).toBe(false);
});

// ✅ Déterministe (date fixe)
it('vérifie que la date limite est dans le futur', () => {
  const now = new Date('2025-01-01');
  const task = createTask({ deadline: new Date('2025-01-02') });
  expect(task.isPastDue(now)).toBe(false);
});
```

**Self-validating — Tests auto-validants :**

TypeScript

```typescript
// ❌ Pas auto-validant (besoin d'interprétation)
it('génère le rapport correctement', () => {
  const report = generateReport();
  console.log(report); // Besoin de lire manuellement
});

// ✅ Auto-validant (assertions)
it('génère le rapport correctement', () => {
  const report = generateReport();
  expect(report).toContain('Total: 100');
  expect(report).toMatch(/Date: \d{4}-\d{2}-\d{2}/);
});
```

**Timely — Tests opportuns :**

TypeScript

```typescript
// ❌ Écrit après le code (tests de validation)
// Le code existe déjà, les tests sont écrits après

// ✅ Écrit en même temps (TDD)
// Le test est écrit avant le code
```

**Questions à poser :**

- Les tests sont-ils rapides (idéalement < 100ms, vérifiez si > 1s) ?
    
- Les tests sont-ils isolés (pas de partage d'état) ?
    
- Les tests sont-ils répétables (déterministes) ?
    
- Les tests sont-ils auto-validants (assertions) ?
    
- Les tests sont-ils écrits en même temps que le code ?
    

**Critères de validation :**

- **Fast** : les tests unitaires purs s'exécutent en < 100ms. Si > 1s, vérifier l'absence d'I/O.
    
- **Isolated** : chaque test est indépendant.
    
- **Repeatable** : les tests sont déterministes.
    
- **Self-validating** : les tests ont des assertions.
    
- **Timely** : les tests sont écrits en même temps que le code.
    

---

### Étape 3 : Arrange-Act-Assert (AAA)

**Objectif :** Chaque test doit avoir trois sections claires : Arrange (préparer), Act (exécuter), Assert (vérifier).

TypeScript

```typescript
// ✅ AAA Pattern
it('retourne les tâches triées par date de création', () => {
  // Arrange: Préparer les données
  const repository = new InMemoryTaskRepository();
  const task1 = repository.save({ title: 'Task 1', createdAt: new Date('2025-01-01') });
  const task2 = repository.save({ title: 'Task 2', createdAt: new Date('2025-01-02') });

  // Act: Exécuter l'action testée
  const tasks = repository.findAll({ sortBy: 'createdAt', order: 'desc' });

  // Assert: Vérifier le résultat
  expect(tasks[0].id).toBe(task2.id);
  expect(tasks[1].id).toBe(task1.id);
});
```

**Sections claires :**

TypeScript

```typescript
// ❌ AAA mélangé
it('retourne les tâches triées', () => {
  const task1 = repository.save({ title: 'Task 1' });
  const tasks = repository.findAll({ sortBy: 'createdAt' });
  const task2 = repository.save({ title: 'Task 2' });
  expect(tasks.length).toBe(2);
});

// ✅ AAA clair
it('retourne les tâches triées', () => {
  // Arrange
  const task1 = repository.save({ title: 'Task 1' });
  const task2 = repository.save({ title: 'Task 2' });

  // Act
  const tasks = repository.findAll({ sortBy: 'createdAt' });

  // Assert
  expect(tasks.length).toBe(2);
});
```

**Questions à poser :**

- Le test est-il organisé en AAA ?
    
- Les sections sont-elles clairement délimitées ?
    
- L'action testée est-elle unique ?
    

**Critères de validation :**

- Le test suit le pattern AAA.
    
- Les sections sont claires.
    
- L'action testée est unique (Single Act Rule).
    

---

### Étape 4 : DAMP plutôt que DRY dans les tests

**Objectif :** Les tests doivent être descriptifs et significatifs (DAMP) plutôt que trop secs (DRY).

**Règle :** Un test doit lire comme une spécification. Le partage de code ne doit pas compromettre la lisibilité.

TypeScript

```typescript
// ❌ Trop DRY - cache la spécification
const TASK_INPUT = { title: 'Test', assignee: 'user-1' };

it('valide les titres', () => {
  expect(() => createTask({ ...TASK_INPUT, title: '' })).toThrow();
  expect(() => createTask({ ...TASK_INPUT, title: 'a'.repeat(256) })).toThrow();
  expect(createTask({ ...TASK_INPUT, title: '  hello  ' }).title).toBe('hello');
});

// ✅ DAMP - chaque test est autonome et lisible
it('rejette les titres vides', () => {
  const input = { title: '', assignee: 'user-1' };
  expect(() => createTask(input)).toThrow('Title is required');
});

it('rejette les titres trop longs (> 255 caractères)', () => {
  const input = { title: 'a'.repeat(256), assignee: 'user-1' };
  expect(() => createTask(input)).toThrow('Title is too long');
});

it('supprime les espaces superflus des titres', () => {
  const input = { title: '  Acheter du pain  ', assignee: 'user-1' };
  const task = createTask(input);
  expect(task.title).toBe('Acheter du pain');
});
```

**Quand la duplication est acceptable :**

- Si elle rend le test plus lisible.
    
- Si elle évite le partage de contexte entre tests.
    
- Si chaque test devient indépendant.
    

**Questions à poser :**

- Le test est-il lisible sans comprendre le contexte partagé ?
    
- Le partage de code cache-t-il la spécification ?
    
- Chaque test est-il indépendant ?
    

**Critères de validation :**

- Les tests sont DAMP (descriptifs).
    
- La duplication est acceptable pour la lisibilité.
    
- Les tests sont indépendants malgré le partage.
    

---

### Étape 5 : Noms de tests descriptifs

**Objectif :** Le nom du test doit décrire le comportement attendu, pas l'implémentation.

TypeScript

```typescript
// ❌ Noms vagues
it('works', () => { ... });
it('test 1', () => { ... });
it('handles errors', () => { ... });

// ✅ Noms descriptifs (comme une spécification)
it('retourne les tâches triées par date de création, les plus récentes d\'abord', () => { ... });
it('lance une erreur NotFoundError quand la tâche n\'existe pas', () => { ... });
it('est idempotent — compléter une tâche déjà complétée ne fait rien', () => { ... });
it('envoie un email de confirmation au responsable de la tâche', () => { ... });
```

**Patterns de nommage :**

Table

|Pattern|Exemple|
|:--|:--|
|should + verbe + condition|should return tasks sorted by date|
|throws + erreur + quand|throws NotFoundError when task not found|
|does + action + quand|does not duplicate notifications when sending|
|is + adjectif + quand|is idempotent when called multiple times|

**Questions à poser :**

- Le nom du test décrit-il le comportement attendu ?
    
- Un nouveau venu pourrait-il comprendre le test par son nom ?
    
- Le nom est-il une phrase complète ?
    

**Critères de validation :**

- Les noms des tests sont descriptifs.
    
- Les noms des tests sont compréhensibles seuls.
    
- Les noms des tests forment une spécification.
    

---

### Étape 6 : Composed Assertions

**Objectif :** Utiliser des assertions composées pour réduire la duplication et améliorer la lisibilité.

TypeScript

```typescript
// ❌ Assertions répétitives
it('crée une tâche correctement', () => {
  const task = createTask({ title: 'Test', assignee: 'user-1' });
  expect(task.id).toBeDefined();
  expect(task.title).toBe('Test');
  expect(task.assignee).toBe('user-1');
  expect(task.status).toBe('pending');
  expect(task.createdAt).toBeInstanceOf(Date);
});

// ✅ Assertion composée
it('crée une tâche correctement', () => {
  const task = createTask({ title: 'Test', assignee: 'user-1' });
  expect(task).toMatchTask({
    title: 'Test',
    assignee: 'user-1',
    status: 'pending',
  });
});

// Matcher personnalisé
expect.extend({
  toMatchTask(received: Task, expected: Partial<Task>) {
    const pass = Object.keys(expected).every(key => 
      received[key as keyof Task] === expected[key as keyof Task]
    );
    return {
      message: () => `Expected task to match ${JSON.stringify(expected)}`,
      pass,
    };
  },
});
```

**Domain-Specific Testing Language (DSL) :**

Créez un langage spécifique pour vos tests :

TypeScript

```typescript
// DSL pour les tests de tâches
function createTestTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'test-1',
    title: 'Test Task',
    status: 'pending',
    assignee: 'user-1',
    createdAt: new Date(),
    ...overrides,
  };
}

function assertTaskEquals(actual: Task, expected: Partial<Task>): void {
  expect(actual).toMatchObject(expected);
}

// Utilisation du DSL
it('marque une tâche comme complétée', () => {
  const task = createTestTask({ status: 'pending' });
  const result = completeTask(task);
  assertTaskEquals(result, { status: 'completed' });
});
```

**Questions à poser :**

- Y a-t-il des assertions répétitives ?
    
- Un DSL de test serait-il utile ?
    
- Les assertions sont-elles claires et concises ?
    

**Critères de validation :**

- Les assertions sont composées (pas de répétition).
    
- Un DSL de test est utilisé si nécessaire.
    
- Les assertions sont claires.
    

---

### Étape 7 : Single Act Rule (Une seule action par test)

**Objectif :** Chaque test doit tester une seule action, pas plusieurs.

**Règle :** Arrange-Act-Assert ne doit avoir qu'un seul Act.

TypeScript

```typescript
// ❌ Plusieurs actions dans un test
it('gère les tâches correctement', () => {
  // Act 1: Créer
  const task = createTask({ title: 'Test' });
  expect(task.status).toBe('pending');

  // Act 2: Compléter
  const completed = completeTask(task.id);
  expect(completed.status).toBe('completed');

  // Act 3: Supprimer
  const result = deleteTask(task.id);
  expect(result).toBe(true);
});

// ✅ Une action par test
it('crée une tâche avec le statut pending', () => {
  const task = createTask({ title: 'Test' });
  expect(task.status).toBe('pending');
});

it('passe une tâche de pending à completed', () => {
  const task = createTask({ title: 'Test' });
  const completed = completeTask(task.id);
  expect(completed.status).toBe('completed');
});

it('supprime une tâche existante', () => {
  const task = createTask({ title: 'Test' });
  const result = deleteTask(task.id);
  expect(result).toBe(true);
});
```

**Exception :** Les tests paramétriques (table-driven) peuvent avoir plusieurs assertions sur une seule action.

TypeScript

```typescript
// ✅ Test paramétrique - une action, plusieurs cas
it.each([
  ['user@example.com', true],
  ['user@', false],
  ['@example.com', false],
  ['user@example', false],
])('valide l\'email %s comme %s', (email, expected) => {
  expect(isValidEmail(email)).toBe(expected);
});
```

**Questions à poser :**

- Le test a-t-il plusieurs actions ?
    
- Les actions pourraient-elles être séparées en plusieurs tests ?
    
- Un test paramétrique serait-il plus approprié ?
    

**Critères de validation :**

- Chaque test a une seule action.
    
- Les actions sont séparées en plusieurs tests.
    
- Les tests paramétriques sont utilisés pour les cas multiples.
    

---

### Étape 8 : Tests "propres" — Éviter les anti-patterns

**Objectif :** Éviter les pratiques qui rendent les tests fragiles ou difficiles à maintenir.

Table

|Anti-pattern|Problème|Solution|
|:--|:--|:--|
|**Tester les détails d'implémentation**|Tests cassent en refactorant|Tester les inputs/outputs|
|**Flaky tests**|Tests qui échouent parfois|Déterminisme, isolation|
|**Snapshot abuse**|Gros snapshots non relus|Snapshots limités|
|**Pas d'isolation**|Tests dépendants|Chaque test crée ses données|
|**Tout mocker**|Tests passent, production casse|Vraies implémentations > fakes > stubs > mocks|
|**Test qui passe du premier coup**|Ne teste rien|Vérifier l'échec avant|

TypeScript

```typescript
// ❌ Teste l'implémentation, pas le comportement
it('appelle database.query avec ORDER BY', () => {
  const spy = jest.spyOn(database, 'query');
  getTasks();
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('ORDER BY'));
});

// ✅ Teste le comportement
it('retourne les tâches triées par date', () => {
  const tasks = getTasks();
  expect(tasks[0].createdAt).toBeGreaterThan(tasks[1].createdAt);
});
```

**Questions à poser :**

- Le test teste-t-il le comportement ou l'implémentation ?
    
- Le test est-il déterministe ?
    
- Les dépendances sont-elles appropriées (mocks vs réels) ?
    

**Critères de validation :**

- Les tests testent le comportement, pas l'implémentation.
    
- Les tests sont déterministes (pas de flaky tests).
    
- Les dépendances sont appropriées.
    

---

### Étape 9 : Tests comme documentation

**Objectif :** Les tests doivent servir de documentation vivante du système.

TypeScript

```typescript
// Les tests forment une spécification exécutable
describe('TaskService', () => {
  describe('createTask', () => {
    it('crée une tâche avec un titre et un statut par défaut', () => { ... });
    it('rejette les titres vides', () => { ... });
    it('rejette les titres trop longs', () => { ... });
    it('supprime les espaces superflus des titres', () => { ... });
  });

  describe('completeTask', () => {
    it('passe le statut à completed et enregistre le timestamp', () => { ... });
    it('lance une erreur NotFoundError si la tâche n\'existe pas', () => { ... });
    it('est idempotent — compléter une tâche déjà complétée ne fait rien', () => { ... });
    it('envoie une notification au responsable', () => { ... });
  });
});
```

**Pourquoi les tests sont une bonne documentation :**

- Toujours à jour (ils passent ou échouent).
    
- Exécutables (on peut les lancer).
    
- Précis (pas d'ambiguïté).
    
- Exemples d'utilisation (montrent comment utiliser le code).
    

**Questions à poser :**

- Les tests peuvent-ils servir de documentation ?
    
- Un nouveau venu peut-il comprendre le système en lisant les tests ?
    
- Les tests sont-ils organisés comme une spécification ?
    

**Critères de validation :**

- Les tests sont organisés comme une spécification.
    
- Les tests sont compréhensibles par un nouveau venu.
    
- Les tests peuvent servir de documentation.
    

---

### Étape 10 : Les tests comme fondement de l'architecture

**Objectif :** Comprendre que les tests propres ne sont pas une fin en soi, mais un moyen de garder l'architecture flexible.

*_Les tests propres sont la clé des _-ilities :__

- **Maintainability :** On peut modifier le code sans peur parce que les tests détectent les régressions.
    
- **Flexibility :** On peut refactoriser la structure interne sans changer le comportement externe.
    
- **Reusability :** Les tests documentent les contrats, ce qui permet de réutiliser les composants en confiance.
    

**Règle :** Si vous ne pouvez pas tester une unité de manière isolée, c'est probablement que cette unité est trop couplée. Les tests propres révèlent les problèmes de conception.

**Questions à poser :**

- Les tests me donnent-ils la confiance de refactoriser ?
    
- Les tests révèlent-ils des problèmes de couplage ?
    
- Les tests sont-ils un frein ou un accélérateur ?
    

**Critères de validation :**

- Les tests permettent le refactoring sans peur.
    
- Les tests révèlent les problèmes de conception (couplage, complexité).
    
- Les tests sont un accélérateur, pas un frein.
    

---

## 5. ANTI-PATTERNS DE TESTS (RÉSUMÉ)

Table

|Anti-pattern|Problème|Solution|
|:--|:--|:--|
|Tester les détails d'implémentation|Fragile|Tester les inputs/outputs|
|Flaky tests|Non déterministes|Isolation, timing fixe|
|Snapshot abuse|Non relus|Limiter les snapshots|
|Pas d'isolation|Dépendance entre tests|Chaque test crée ses données|
|Tout mocker|Fausse confiance|Préférer les vrais implémentations|
|Test qui passe du premier coup|Ne teste rien|Vérifier l'échec avant|
|Nom vague|Pas descriptif|Nom comme une spécification|
|Plusieurs actions|Teste trop de choses|Une action par test|

---

## 6. RATIONALISATIONS COURANTES (À ÉVITER)

Table

|Rationalisation|Réalité|
|:--|:--|
|"J'écrirai les tests après"|Vous ne le ferez pas.|
|"C'est trop simple pour être testé"|Les tests documentent le comportement.|
|"Les tests me ralentissent"|Ils vous accélèrent plus tard.|
|"Le code est auto-explicatif"|Les tests SONT la spécification.|
|"Je teste avec des mocks partout"|Les mocks cachent les vrais problèmes.|
|"Un snapshot c'est plus simple"|Les snapshots ne sont pas relus.|

---

## 7. RED FLAGS (Signaux d'alarme)

Table

|Signe|Problème|Solution|
|:--|:--|:--|
|Test qui passe du premier coup|Ne teste rien|Vérifier l'échec|
|Tests qui échouent aléatoirement|Flaky|Déterminisme|
|Noms de tests vagues|Pas documentaires|Nom descriptif|
|Plusieurs actions par test|Teste trop|Une action|
|Grosses dépendances mockées|Fragile|Réduire les mocks|
|Snapshots non vérifiés|Pas relus|Réviser les snapshots|
|Tests lents|Pas F.I.R.S.T.|Optimiser|

---

## 8. LIVRABLES ATTENDUS

Pour des tests propres :

Table

|Document|Description|
|:--|:--|
|**Tests unitaires**|Tests lisibles et maintenables.|
|**DSL de test**|Langage spécifique si nécessaire.|
|**Matchers personnalisés**|Assertions composées.|
|**Documentation**|Les tests servent de spécification.|

---

## 9. LIENS AVEC LES AUTRES PHASES

**Input (ce qui vient d'avant - Phase 2)**

- api-and-interface-design-v2 → Contrats à tester.
    
- function-design-v2 → Fonctions à tester.
    

**Output (ce qui est transmis - Phase 4)**

- Suite de tests → Validation du système.
    
- Tests comme documentation → Facilite la maintenance.
    

**Dépendances internes**

- test-driven-development-v2 : Le processus TDD.
    
- function-design-v2 : Fonctions testables.
    
- class-design-v2 : Classes testables.
    

---

## 10. RESSOURCES UTILISÉES

- **Livre :** Clean Code, 2nd Edition (Robert C. Martin)
    
    - Chapter 14 : "Testing Disciplines" — Les 3 lois du TDD, TCR, Tests Enable the -ilities.
        
    - Chapter 15 : "Clean Tests" — F.I.R.S.T., AAA, DAMP vs DRY, Domain-Specific Testing Language.
        
    - Chapter 18 : "Simple Design" — Les tests comme première règle du design simple.
        
- **Skills Osmani :** Aucun équivalent direct (nouveau skill).
    
- **Autres références :**
    
    - Kent Beck, _Test Driven Development: By Example_.
        
    - Martin Fowler, _Refactoring_.
        

---

## 11. EXEMPLE COMPLET D'APPLICATION

**Contexte :** Tests pour un service de gestion de tâches

**Tests avant (problématiques) :**

TypeScript

```typescript
// ❌ Tests fragiles et peu lisibles
describe('TaskService', () => {
  let db: Database;
  let taskService: TaskService;

  beforeEach(() => {
    db = new Database();
    taskService = new TaskService(db);
  });

  it('works', () => {
    const task = taskService.createTask({ title: 'Test' });
    expect(task.id).toBeDefined();

    const tasks = taskService.getTasks();
    expect(tasks.length).toBe(1);

    taskService.completeTask(task.id);
    expect(task.status).toBe('completed');

    taskService.deleteTask(task.id);
    expect(tasks.length).toBe(0);
  });

  it('handles errors', () => {
    try {
      taskService.createTask({ title: '' });
    } catch (e) {
      expect(e.message).toBe('Title required');
    }
  });
});
```

**Tests après (propres) :**

TypeScript

```typescript
// ✅ Tests lisibles et maintenables

// 1. DSL de test
function createTestTaskService(): { service: TaskService; repository: InMemoryTaskRepository } {
  const repository = new InMemoryTaskRepository();
  const service = new TaskService(repository);
  return { service, repository };
}

function assertTaskMatches(actual: Task, expected: Partial<Task>): void {
  expect(actual).toMatchObject(expected);
}

// 2. Tests organisés par comportement
describe('TaskService', () => {
  describe('createTask', () => {
    it('crée une tâche avec un titre et le statut pending par défaut', () => {
      // Arrange
      const { service } = createTestTaskService();

      // Act
      const task = service.createTask({ title: 'Acheter du pain' });

      // Assert
      assertTaskMatches(task, {
        title: 'Acheter du pain',
        status: 'pending',
        assignee: null,
      });
      expect(task.id).toBeDefined();
      expect(task.createdAt).toBeInstanceOf(Date);
    });

    it('rejette les titres vides', () => {
      const { service } = createTestTaskService();
      expect(() => service.createTask({ title: '' }))
        .toThrow('Title is required');
    });

    it('rejette les titres trop longs (> 255 caractères)', () => {
      const { service } = createTestTaskService();
      const title = 'a'.repeat(256);
      expect(() => service.createTask({ title }))
        .toThrow('Title is too long');
    });

    it('supprime les espaces superflus des titres', () => {
      const { service } = createTestTaskService();
      const task = service.createTask({ title: '  Acheter du pain  ' });
      expect(task.title).toBe('Acheter du pain');
    });
  });

  describe('completeTask', () => {
    it('passe le statut à completed et enregistre le timestamp', () => {
      const { service } = createTestTaskService();
      const task = service.createTask({ title: 'Test' });
      const now = new Date();

      const completed = service.completeTask(task.id);

      assertTaskMatches(completed, {
        status: 'completed',
        completedAt: expect.any(Date),
      });
      expect(completed.completedAt!.getTime()).toBeGreaterThanOrEqual(now.getTime());
    });

    it('lance une erreur NotFoundError si la tâche n\'existe pas', () => {
      const { service } = createTestTaskService();
      expect(() => service.completeTask('non-existent-id'))
        .toThrow('Task not found');
    });

    it('est idempotent — compléter une tâche déjà complétée ne fait rien', () => {
      const { service } = createTestTaskService();
      const task = service.createTask({ title: 'Test' });
      const first = service.completeTask(task.id);
      const second = service.completeTask(task.id);

      expect(first.status).toBe('completed');
      expect(second.status).toBe('completed');
      expect(first.completedAt).toEqual(second.completedAt);
    });

    it('envoie une notification au responsable de la tâche', () => {
      // Arrange
      const { service } = createTestTaskService();
      const notifySpy = jest.spyOn(service, 'notifyAssignee');
      const task = service.createTask({ title: 'Test', assignee: 'user-1' });

      // Act
      service.completeTask(task.id);

      // Assert
      expect(notifySpy).toHaveBeenCalledWith('user-1', task);
    });
  });

  describe('getTasks', () => {
    it('retourne toutes les tâches triées par date de création, les plus récentes d\'abord', () => {
      const { service } = createTestTaskService();
      const task1 = service.createTask({ title: 'Task 1' });
      const task2 = service.createTask({ title: 'Task 2' });

      const tasks = service.getTasks({ sortBy: 'createdAt', order: 'desc' });

      expect(tasks[0].id).toBe(task2.id);
      expect(tasks[1].id).toBe(task1.id);
    });

    it('filtre par statut', () => {
      const { service } = createTestTaskService();
      service.createTask({ title: 'Task 1', status: 'pending' });
      service.createTask({ title: 'Task 2', status: 'completed' });

      const pending = service.getTasks({ status: 'pending' });

      expect(pending.length).toBe(1);
      expect(pending[0].title).toBe('Task 1');
    });
  });
});
```

**Résumé des améliorations :**

- **F.I.R.S.T.** : Tests rapides (in-memory), isolés, répétables, auto-validants, opportuns.
    
- **AAA** : Chaque test a Arrange-Act-Assert clair.
    
- **DAMP** : Tests descriptifs, pas de partage obscur.
    
- **Noms descriptifs** : Chaque test est une spécification.
    
- **Single Act Rule** : Une action par test.
    
- **Composed assertions** : DSL de test et matchers.
    
- **Teste le comportement** : Pas les détails d'implémentation.
    
- **Documentation** : Les tests forment une spécification exécutable.
    

---

## 12. VÉRIFICATION FINALE (Definition of Done)

Après avoir écrit ou refactoré des tests :

- [ ] Les tests suivent les 3 lois du TDD.
    
- [ ] Les tests sont traités comme du code de production (aussi propres, aussi refactorisés).
    
- [ ] Les tests sont Fast (idéalement < 100ms par test unitaire pur ; vérifier l'absence d'I/O si > 1s).
    
- [ ] Les tests sont Isolated (indépendants).
    
- [ ] Les tests sont Repeatable (déterministes).
    
- [ ] Les tests sont Self-validating (assertions).
    
- [ ] Les tests sont Timely (écrits en même temps que le code).
    
- [ ] Les tests suivent le pattern Arrange-Act-Assert.
    
- [ ] Les tests sont DAMP (Descriptive And Meaningful Phrases).
    
- [ ] Les noms des tests sont descriptifs.
    
- [ ] Chaque test a une seule action.
    
- [ ] Les tests testent le comportement, pas l'implémentation.
    
- [ ] Les tests servent de documentation vivante.
    
- [ ] Les tests permettent le refactoring sans peur (fondement de l'architecture flexible).