````markdown
<!-- function-design-v2.md -->
---
name: function-design-v2
description: Designs clean, focused, and maintainable functions. Use when creating, refactoring, or reviewing functions. Use when a function is too long, does too many things, has too many arguments, or contains hidden side effects.
---

# Function Design (v2 — Enrichi)

## 1. OBJECTIF DU SKILL

**Pourquoi ce skill existe ?**
Les fonctions sont la première ligne d'organisation de tout programme moderne. Une fonction bien conçue est petite, fait une chose, a un nom descriptif, des arguments limités, et se lit comme une prose bien écrite. Ce skill fournit les règles et heuristiques pour concevoir des fonctions qui sont faciles à comprendre, à tester, et à maintenir.

**Quel problème résout-il ?**
- Les fonctions de 3 000 lignes sont impossibles à comprendre et à modifier.
- Les fonctions qui font plusieurs choses cachent des bugs.
- Les fonctions avec trop d'arguments sont difficiles à appeler correctement.
- Les fonctions avec des effets de bord créent des couplages temporels.
- Les fonctions mal nommées obligent à lire le code pour comprendre l'intention.
- Les switch/if-else chains sur des types violent l'OCP et se répètent.
- La duplication entre fonctions fragilise le système (SRP).

**Dans quel contexte l'utiliser ?**
- Conception ou refactorisation de toute fonction.
- Revue de code pour évaluer la qualité des fonctions.
- Décomposition de fonctions trop longues.
- Réduction du nombre d'arguments.
- Élimination des effets de bord indésirables.
- Remplacement de switch/if-else chains par du polymorphisme.

---

## 2. PRÉREQUIS

**Ce qui doit être déjà fait :**
- ✅ Les besoins fonctionnels sont spécifiés (Phase 1).
- ✅ L'architecture générale est définie (Phase 2).
- ✅ Les conventions de nommage sont établies (`naming-conventions-v2`).

**Quels documents sont nécessaires :**
- Spécifications des fonctions (signatures, comportements attendus).
- Contrats d'API (`api-and-interface-design-v2`).
- Glossaire du domaine.

**Quelles informations doivent être disponibles :**
- Le langage de programmation (et ses conventions).
- Les prérequis de performance (si applicables).
- L'environnement d'exécution (thread-safe requis ?).

---

## 3. RÔLES ET RESPONSABILITÉS

| Rôle | Responsabilités |
|------|-----------------|
| Développeur (IA/Humain) | Conçoit des fonctions petites et focalisées. Limite le nombre d'arguments (≤ 3). Élimine les effets de bord indésirables. Nomme les fonctions de manière descriptive. Applique le Stepdown Rule. |
| Réviseur (Code Review) | Vérifie que les fonctions sont petites (≤ 20 lignes). Vérifie que les fonctions font une seule chose. Vérifie le nombre d'arguments. Vérifie l'absence d'effets de bord indésirables. |
| Architecte Technique | Définit les standards de conception de fonctions. Identifie les abstractions à extraire en fonctions. |
| Testeur (QA) | Vérifie que les fonctions sont testables (pas de dépendances cachées). Valide les cas limites. |

---

## 4. PROCESSUS DÉTAILLÉ (Étape par Étape)

### Étape 1 : Rendre les fonctions petites

**Objectif :** Les fonctions doivent être très petites — idéalement 3-10 lignes, maximum 20 lignes.

**Règle d'or :** Une fonction devrait tenir sur un écran (≈ 20-30 lignes).

**Pourquoi les petites fonctions :**
- Plus faciles à comprendre.
- Plus faciles à nommer.
- Plus faciles à tester.
- Plus faciles à réutiliser.
- Réduisent la duplication.

**Exemple :**
```typescript
// ❌ Trop grande (30+ lignes)
function generateReport(employee: Employee, date: Date): string {
  let total = 0;
  let report = "Rapport pour " + employee.name + "\n";
  report += "Date: " + date + "\n";
  report += "---\n";
  for (const rental of employee.rentals) {
    let amount = 0;
    switch (rental.type) {
      case 'new_release':
        amount = rental.days * 3;
        break;
      case 'regular':
        amount = 2;
        if (rental.days > 2) amount += (rental.days - 2) * 1.5;
        break;
      case 'childrens':
        amount = 1.5;
        if (rental.days > 3) amount += (rental.days - 3) * 1.5;
        break;
    }
    report += "\t" + rental.title + "\t" + amount + "\n";
    total += amount;
  }
  report += "Total: " + total + "\n";
  return report;
}

// ✅ Petite et focalisée (extract till you drop)
function generateReport(employee: Employee, date: Date): string {
  const rentals = employee.rentals;
  const total = calculateTotal(rentals);
  return formatReport(employee.name, date, rentals, total);
}

function calculateTotal(rentals: Rental[]): number {
  return rentals.reduce((sum, rental) => sum + calculateAmount(rental), 0);
}

function calculateAmount(rental: Rental): number {
  // 5-10 lignes selon le type
}

function formatReport(name: string, date: Date, rentals: Rental[], total: number): string {
  // 3-5 lignes
}
````

**Questions à poser :**

- Cette fonction fait-elle plus d'une chose ?
    
- Puis-je extraire une partie de cette fonction dans une nouvelle fonction ?
    
- La fonction tiendrait-elle sur un écran ?
    

**Critères de validation :**

- La fonction fait ≤ 20 lignes (idéalement ≤ 10).
    
- La fonction peut être extraite en plusieurs fonctions plus petites (si > 20 lignes).
    
- Les blocs (if, else, while) font 1-2 lignes (appels à d'autres fonctions).
    

---

### Étape 2 : Faire une seule chose (One Thing)

**Objectif :** Une fonction doit faire une seule chose, et le faire bien.

**Règle d'or :** Une fonction fait une seule chose si vous ne pouvez pas en extraire une autre fonction de manière significative.

**Test :** "Extract till you drop" — Si vous pouvez extraire une fonction avec un nom descriptif, la fonction originale faisait plus d'une chose.

**Exemple :**

TypeScript

```typescript
// ❌ Fait plusieurs choses
function processUserData(user: User): void {
  // 1. Valide
  if (!user.email) throw new Error('Email required');
  // 2. Transforme
  user.email = user.email.trim().toLowerCase();
  // 3. Sauvegarde
  database.save(user);
  // 4. Notifie
  emailService.sendWelcome(user.email);
}

// ✅ Chaque chose a sa fonction
function processUserData(user: User): void {
  validateUser(user);
  normalizeUser(user);
  saveUser(user);
  notifyUser(user);
}

function validateUser(user: User): void {
  if (!user.email) throw new Error('Email required');
}

function normalizeUser(user: User): void {
  user.email = user.email.trim().toLowerCase();
}

function saveUser(user: User): void {
  database.save(user);
}

function notifyUser(user: User): void {
  emailService.sendWelcome(user.email);
}
```

**Le niveau d'abstraction :**

- Une fonction qui fait une seule chose a toutes ses instructions au même niveau d'abstraction.
    

TypeScript

```typescript
// ❌ Mélange de niveaux d'abstraction
function getTasks(): Task[] {
  const tasks = [];                          // Niveau bas (détail)
  const result = query('SELECT * FROM tasks'); // Niveau très bas (SQL)
  for (const row of result.rows) {           // Niveau bas (itération)
    tasks.push(new Task(row.id, row.title)); // Niveau bas (construction)
  }
  return tasks;                              // Niveau haut (retour)
}

// ✅ Même niveau d'abstraction (niveau "récupération de tâches")
function getTasks(): Task[] {
  const rows = fetchTasksFromDatabase();
  return mapRowsToTasks(rows);
}

function fetchTasksFromDatabase(): Row[] {
  return query('SELECT * FROM tasks');
}

function mapRowsToTasks(rows: Row[]): Task[] {
  return rows.map(row => new Task(row.id, row.title));
}
```

**Questions à poser :**

- Cette fonction fait-elle exactement ce que son nom indique ?
    
- Y a-t-il des extractions possibles avec des noms significatifs ?
    
- Toutes les instructions sont-elles au même niveau d'abstraction ?
    

**Critères de validation :**

- La fonction fait exactement une chose.
    
- On ne peut pas extraire de fonction significative supplémentaire.
    
- Toutes les instructions sont au même niveau d'abstraction.
    

---

### Étape 3 : Éliminer la duplication (DRY)

**Objectif :** Ne pas répéter le même code dans plusieurs fonctions. La duplication est le premier symptôme d'une violation du SRP.

**Règle d'or :** Si le même code (ou presque) apparaît dans deux endroits, extrayez-le dans une fonction commune.

**Types de duplication :**

- **Duplication simple :** Mêmes lignes copiées-collées.
    
- **Duplication similaire :** Mêmes lignes avec quelques constantes ou variables différentes.
    
- **Duplication de boucle :** Même itération avec un corps différent.
    

**Exemple (duplication simple) :**

TypeScript

```typescript
// ❌ Duplication
function calculateArea(width: number, height: number): number {
  if (width <= 0 || height <= 0) {
    throw new Error('Dimensions must be positive');
  }
  return width * height;
}

function calculatePerimeter(width: number, height: number): number {
  if (width <= 0 || height <= 0) {
    throw new Error('Dimensions must be positive');
  }
  return 2 * (width + height);
}

// ✅ Extraction de la validation
function validateDimensions(width: number, height: number): void {
  if (width <= 0 || height <= 0) {
    throw new Error('Dimensions must be positive');
  }
}

function calculateArea(width: number, height: number): number {
  validateDimensions(width, height);
  return width * height;
}

function calculatePerimeter(width: number, height: number): number {
  validateDimensions(width, height);
  return 2 * (width + height);
}
```

**Exemple (duplication de boucle) :**

TypeScript

```typescript
// ❌ Boucles identiques, corps différents
function countSpaces(building: Building): number {
  let count = 0;
  for (const floor of building.floors) {
    for (const space of floor.spaces) {
      count++;
    }
  }
  return count;
}

function calculateArea(building: Building): number {
  let area = 0;
  for (const floor of building.floors) {
    for (const space of floor.spaces) {
      area += space.width * space.length;
    }
  }
  return area;
}

// ✅ Extraction de la boucle (Template Method / Lambda)
function traverseSpaces<T>(building: Building, fn: (space: Space) => T, initial: T): T {
  let result = initial;
  for (const floor of building.floors) {
    for (const space of floor.spaces) {
      result = fn(result, space);
    }
  }
  return result;
}

function countSpaces(building: Building): number {
  return traverseSpaces(building, (count, _) => count + 1, 0);
}

function calculateArea(building: Building): number {
  return traverseSpaces(building, (area, space) => area + space.width * space.length, 0);
}
```

**Questions à poser :**

- Ce code existe-t-il déjà ailleurs dans le codebase ?
    
- Deux fonctions ont-elles des structures identiques (if, switch, boucle) ?
    
- La duplication est-elle "essentielle" (même responsabilité) ou "accidentelle" (responsabilités différentes) ?
    

**Critères de validation :**

- Aucune duplication simple non justifiée.
    
- Les boucles répétées sont extraites en fonctions de traversée.
    
- La duplication extraite ne viole pas le SRP (même acteur).
    

---

### Étape 4 : Utiliser le Stepdown Rule et éviter l'Abstraction Roller Coaster

**Objectif :** Les fonctions doivent se lire de haut en bas, chaque fonction appelant la suivante à un niveau d'abstraction inférieur. Ne pas alterner sans cesse entre haut et bas niveau.

**Règle :** Une fonction doit être suivie par les fonctions du niveau d'abstraction suivant.

TypeScript

```typescript
// ✅ Stepdown Rule : lecture de haut en bas
function makeStatement(customer: Customer): string {
  clearTotals(customer);
  return makeHeader(customer) +
         makeDetails(customer) +
         makeFooter(customer);
}

function clearTotals(customer: Customer): void {
  customer.totalAmount = 0;
  customer.frequentRenterPoints = 0;
}

function makeHeader(customer: Customer): string {
  return "Rental Record for " + customer.name + "\n";
}

function makeDetails(customer: Customer): string {
  let details = "";
  for (const rental of customer.rentals) {
    details += makeDetail(rental);
  }
  return details;
}

function makeDetail(rental: Rental): string {
  const amount = calculateAmount(rental);
  return formatDetail(rental, amount);
}

// ... Les fonctions continuent de descendre
```

**Lecture comme une prose :**

- On commence par la fonction de plus haut niveau.
    
- On descend, un niveau d'abstraction à la fois.
    
- On peut arrêter à n'importe quel niveau quand on a compris.
    

**Abstraction Roller Coaster (piège) :**

- Ne pas alterner entre haut et bas niveau dans une même fonction.
    

TypeScript

```typescript
// ❌ Roller Coaster : on monte et descend sans arrêt
function processOrder(order: Order): void {
  validateOrder(order);                    // Haut niveau
  const conn = database.getConnection();   // BAS niveau (détail)
  const tx = conn.beginTransaction();      // BAS niveau
  for (const item of order.items) {        // Moyen niveau
    const stmt = conn.prepare("INSERT..."); // BAS niveau
    stmt.execute(item.id, item.qty);       // BAS niveau
  }
  tx.commit();                             // BAS niveau
  notifyCustomer(order.customer);          // Haut niveau
}

// ✅ Stepdown : chaque niveau est isolé
function processOrder(order: Order): void {
  validateOrder(order);
  saveOrderToDatabase(order);
  notifyCustomer(order.customer);
}

function saveOrderToDatabase(order: Order): void {
  const conn = database.getConnection();
  const tx = conn.beginTransaction();
  insertOrderItems(conn, order.items);
  tx.commit();
}

function insertOrderItems(conn: Connection, items: OrderItem[]): void {
  for (const item of items) {
    insertItem(conn, item);
  }
}

function insertItem(conn: Connection, item: OrderItem): void {
  const stmt = conn.prepare("INSERT INTO order_items (id, qty) VALUES (?, ?)");
  stmt.execute(item.id, item.qty);
}
```

**Questions à poser :**

- Peut-on lire cette fonction de haut en bas ?
    
- Chaque fonction appelle-t-elle des fonctions au niveau inférieur suivant ?
    
- Les fonctions sont-elles ordonnées par niveau d'abstraction ?
    
- Y a-t-il des sauts brutaux entre haut et bas niveau dans une même fonction ?
    

**Critères de validation :**

- Les fonctions se lisent de haut en bas.
    
- Chaque fonction est suivie par les fonctions du niveau suivant.
    
- Les noms des fonctions révèlent leur niveau d'abstraction.
    
- Pas d'Abstraction Roller Coaster dans une même fonction.
    

---

### Étape 5 : Éliminer les switch et les if-else chains (Polymorphisme)

**Objectif :** Les switch statements et les longues chaînes if-else sur un type sont intrinsèquement multi-choses. Ils violent l'OCP (Open/Closed Principle) et se dupliquent à travers le codebase.

**Règle d'or :** Un switch doit apparaître une seule fois, dans une factory concrète, pour créer des objets polymorphes. Jamais répété dans le code métier.

**Exemple (switch problématique) :**

TypeScript

```typescript
// ❌ Switch répété dans le code métier
function calculateAmount(rental: Rental): number {
  switch (rental.movie.type) {
    case 'new_release': return rental.days * 3;
    case 'regular': return rental.days > 2 ? 2 + (rental.days - 2) * 1.5 : 2;
    case 'childrens': return rental.days > 3 ? 1.5 + (rental.days - 3) * 1.5 : 1.5;
  }
}

function calculatePoints(rental: Rental): number {
  switch (rental.movie.type) {
    case 'new_release': return rental.days > 1 ? 2 : 1;
    case 'regular': return 1;
    case 'childrens': return 1;
  }
}
```

**Solution (polymorphisme via factory) :**

TypeScript

```typescript
// ✅ Une seule factory avec switch
interface RentalType {
  calculateAmount(days: number): number;
  calculatePoints(days: number): number;
}

class NewReleaseRental implements RentalType {
  calculateAmount(days: number): number { return days * 3; }
  calculatePoints(days: number): number { return days > 1 ? 2 : 1; }
}

class RegularRental implements RentalType {
  calculateAmount(days: number): number {
    return days > 2 ? 2 + (days - 2) * 1.5 : 2;
  }
  calculatePoints(_days: number): number { return 1; }
}

class ChildrensRental implements RentalType {
  calculateAmount(days: number): number {
    return days > 3 ? 1.5 + (days - 3) * 1.5 : 1.5;
  }
  calculatePoints(_days: number): number { return 1; }
}

// La factory contient le SEUL switch du système
class RentalTypeFactory {
  static create(typeName: string): RentalType {
    switch (typeName) {
      case 'new_release': return new NewReleaseRental();
      case 'regular': return new RegularRental();
      case 'childrens': return new ChildrensRental();
      default: throw new Error(`Unknown type: ${typeName}`);
    }
  }
}

// Le code métier est pur et sans switch
function calculateAmount(rental: Rental): number {
  return rental.type.calculateAmount(rental.days);
}

function calculatePoints(rental: Rental): number {
  return rental.type.calculatePoints(rental.days);
}
```

**Questions à poser :**

- Y a-t-il un switch ou une chaîne if-else sur un type ?
    
- Ce switch existe-t-il à plusieurs endroits dans le code ?
    
- Puis-je remplacer ce switch par du polymorphisme via une factory ?
    

**Critères de validation :**

- Les switch/if-else sur des types sont isolés dans une factory unique.
    
- Le code métier utilise le polymorphisme (pas de switch répété).
    
- Chaque nouvelle variante s'ajoute par extension (nouvelle classe), pas par modification du code existant (OCP).
    

---

### Étape 6 : Limiter les arguments et éviter les flag/output arguments

**Objectif :** Le nombre d'arguments d'une fonction doit être limité (idéalement 0-2, maximum 3). Les flag arguments et les output arguments sont des anti-patterns.

**La hiérarchie des arguments :**

Table

|Nombre|Qualité|Exemple|
|:--|:--|:--|
|0|Idéal|`stack.pop()`, `file.close()`|
|1|Très bien|`f(x)`, `user.getName()`|
|2|Acceptable|`distance(x1, y1)`|
|3|À limiter|`createPoint(x, y, z)`|
|4+|À éviter|`createUser(name, email, age, address, phone)`|

**Pourquoi limiter les arguments :**

- Plus d'arguments = plus de couplage.
    
- Plus de façons de se tromper d'ordre.
    
- Plus difficile à lire et à tester.
    

**Solutions pour réduire les arguments :**

**1. Utiliser des objets ou structures de données :**

TypeScript

```typescript
// ❌ 5 arguments
function createUser(name: string, email: string, age: number, address: string, phone: string): User {
  // ...
}

// ✅ 1 argument (objet)
interface UserInput {
  name: string;
  email: string;
  age: number;
  address: string;
  phone: string;
}

function createUser(input: UserInput): User {
  // ...
}
```

**2. Utiliser des arguments nommés (keyword arguments) :**

TypeScript

```typescript
// ✅ Avec arguments nommés (destructuring)
function createRental({ movie, days, discount = 0 }: CreateRentalInput): Rental {
  // ...
}

// Appel clair
const rental = createRental({
  movie: movie,
  days: 3,
  discount: 0.1,
});
```

**3. Extraire en plusieurs fonctions :**

TypeScript

```typescript
// ❌ Une fonction avec 4 arguments
function updateUser(id: string, name: string, email: string, age: number): void {
  // ...
}

// ✅ Plusieurs fonctions spécialisées
function updateUserName(id: string, name: string): void { ... }
function updateUserEmail(id: string, email: string): void { ... }
function updateUserAge(id: string, age: number): void { ... }
```

**Flag Arguments (à éviter) :**

TypeScript

```typescript
// ❌ Flag argument : la fonction fait deux choses
function generateReport(employee: Employee, includeDetails: boolean): string {
  if (includeDetails) {
    return generateDetailedReport(employee);
  } else {
    return generateSummaryReport(employee);
  }
}

// ✅ Deux fonctions explicites
function generateDetailedReport(employee: Employee): string { ... }
function generateSummaryReport(employee: Employee): string { ... }
```

**Output Arguments (à éviter) :**

TypeScript

```typescript
// ❌ Output argument : modifié en sortie
function calculateStats(numbers: number[], result: Stats): void {
  result.mean = numbers.reduce((a, b) => a + b) / numbers.length;
  result.sum = numbers.reduce((a, b) => a + b);
}

// ✅ Retourner la valeur (ou un objet)
function calculateStats(numbers: number[]): Stats {
  const sum = numbers.reduce((a, b) => a + b);
  return { mean: sum / numbers.length, sum };
}
```

**Questions à poser :**

- Combien d'arguments cette fonction a-t-elle ?
    
- Puis-je grouper certains arguments dans un objet ?
    
- Y a-t-il un booléen qui change le comportement de la fonction (flag argument) ?
    
- Un argument est-il modifié en sortie (output argument) ?
    

**Critères de validation :**

- La fonction a ≤ 3 arguments.
    
- Si plus de 3 arguments, ils sont groupés dans un objet.
    
- Aucun flag argument (booléen qui change le comportement).
    
- Aucun output argument (arguments modifiés en sortie).
    
- Les arguments sont dans un ordre logique.
    

---

### Étape 7 : Command Query Separation (CQS)

**Objectif :** Une fonction soit fait une action (commande), soit répond à une question (query), pas les deux.

**Règle :** Une fonction est soit une commande (modifie l'état) soit une requête (retourne une information), pas les deux.

TypeScript

```typescript
// ❌ Mélange commande + requête
function setAttribute(name: string, value: string): boolean {
  if (attributeExists(name)) {
    setAttributeValue(name, value);
    return true;
  }
  return false;
}

// Utilisation ambiguë
if (setAttribute('username', 'unclebob')) {
  // C'est un test ? Une action ?
}

// ✅ Séparé
function attributeExists(name: string): boolean { ... }
function setAttribute(name: string, value: string): void { ... }

// Utilisation claire
if (attributeExists('username')) {
  setAttribute('username', 'unclebob');
}
```

**Exceptions notables :**

TypeScript

```typescript
// CQS violé mais acceptable (idiomatique)
const top = stack.pop(); // Pop est une commande MAIS retourne aussi la valeur

// Solution (C++ STL)
const top = stack.top(); // Requête
stack.pop();             // Commande
```

**Questions à poser :**

- Cette fonction modifie-t-elle l'état ET retourne-t-elle une valeur ?
    
- Puis-je séparer en deux fonctions (commande + requête) ?
    
- L'ambiguïté est-elle acceptable (ex: stack.pop()) ?
    

**Critères de validation :**

- Les commandes ne retournent pas de valeur (ou retournent void).
    
- Les requêtes ne modifient pas l'état.
    
- Les exceptions idiomatiques sont documentées.
    

---

### Étape 8 : Préférer les exceptions aux codes d'erreur

**Objectif :** Utiliser les exceptions plutôt que des codes d'erreur pour signaler les problèmes.

**Raison :** Les codes d'erreur créent une imbrication profonde et mélangent la logique normale avec la gestion d'erreur.

TypeScript

```typescript
// ❌ Codes d'erreur (imbrication profonde)
function deletePage(page: Page): number {
  if (deletePage(page) != 0) {
    logger.log('delete failed');
    return 1;
  }
  if (registry.deleteReference(page.name) != 0) {
    logger.log('deleteReference failed');
    return 1;
  }
  if (configKeys.deleteKey(page.name) != 0) {
    logger.log('deleteKey failed');
    return 1;
  }
  return 0;
}

// ✅ Exceptions (logique séparée)
function deletePage(page: Page): void {
  try {
    deletePageAndAllReferences(page);
  } catch (Exception e) {
    logError(e);
  }
}

function deletePageAndAllReferences(page: Page): void {
  deletePage(page);
  registry.deleteReference(page.name);
  configKeys.deleteKey(page.name);
}

function logError(e: Exception): void {
  logger.log(e.getMessage());
}
```

**Extraction des try/catch :**

TypeScript

```typescript
// ❌ Try/catch qui encombre la logique
function deletePage(page: Page): void {
  try {
    deletePage(page);
    registry.deleteReference(page.name);
    configKeys.deleteKey(page.name);
  } catch (Exception e) {
    logger.log(e.getMessage());
  }
}

// ✅ Try/catch extrait
function deletePage(page: Page): void {
  try {
    deletePageAndAllReferences(page);
  } catch (Exception e) {
    logError(e);
  }
}

function deletePageAndAllReferences(page: Page): void {
  deletePage(page);
  registry.deleteReference(page.name);
  configKeys.deleteKey(page.name);
}
```

**Règle :** Une fonction ne doit traiter que les erreurs, ou que la logique métier, pas les deux.

**Questions à poser :**

- Utilise-t-on des codes d'erreur ou des exceptions ?
    
- Les try/catch sont-ils extraits de la logique métier ?
    
- La fonction traite-t-elle les erreurs ou la logique métier (pas les deux) ?
    

**Critères de validation :**

- Les exceptions sont utilisées (pas de codes d'erreur).
    
- Les try/catch sont extraits dans des fonctions séparées.
    
- Une fonction soit traite les erreurs, soit fait la logique métier.
    

---

### Étape 9 : Éviter les effets de bord et le couplage temporel

**Objectif :** Les fonctions doivent être pures (ou le plus possible) pour éviter les couplages temporels.

**Définition :** Une fonction pure :

- Dépend seulement de ses arguments.
    
- Ne modifie pas l'état du système.
    
- Retourne toujours le même résultat pour les mêmes arguments.
    

**Temporal Coupling (couplage temporel) :**

- Un effet de bord crée un couplage dans le temps : l'ordre des appels doit être préservé.
    
- Exemple : on ne peut pas `close()` avant `open()`, pas `release()` avant `seize()`.
    
- Ce couplage est insidieux et cause des race conditions, des problèmes de réentrance, et des bugs d'initialisation.
    

TypeScript

```typescript
// ❌ Effet de bord + couplage temporel
function checkout(cart: Cart): void {
  const total = calculateTotal(cart);
  balance = balance - total;        // Modifie une variable globale
  logger.log(`Purchase of ${total}`); // Effet de bord
  sendEmail(email, total);          // Effet de bord
}

// ✅ Plus pure (effets de bord isolés)
function calculateCheckout(cart: Cart): CheckoutResult {
  const total = calculateTotal(cart);
  const newBalance = balance - total; // Calcul, pas de modification
  return { total, newBalance, shouldSendEmail: true };
}

// L'effet de bord est géré par l'appelant
function processCheckout(cart: Cart): void {
  const result = calculateCheckout(cart);
  balance = result.newBalance;
  logger.log(`Purchase of ${result.total}`);
  sendEmail(email, result.total);
}
```

**Isoler les effets de bord :**

TypeScript

```typescript
// ✅ Effets de bord isolés en périphérie
function processOrder(order: Order): Result {
  // Partie pure : calculs métier
  const total = calculateTotal(order.items);
  const tax = calculateTax(total);
  const discount = calculateDiscount(order.user, total);
  const finalTotal = total + tax - discount;

  // Effets de bord : retournés pour être gérés par l'appelant
  return {
    finalTotal,
    shouldSendInvoice: true,
    shouldUpdateInventory: true,
  };
}

// L'appelant gère les effets de bord
function handleOrder(order: Order): void {
  const result = processOrder(order);
  if (result.shouldSendInvoice) {
    invoiceService.send(order.user.email, result.finalTotal);
  }
  if (result.shouldUpdateInventory) {
    inventoryService.update(order.items);
  }
}
```

**Questions à poser :**

- Cette fonction modifie-t-elle l'état du système ?
    
- Les effets de bord sont-ils isolés en périphérie ?
    
- Y a-t-il un ordre d'appel obligatoire entre plusieurs fonctions (couplage temporel) ?
    
- La fonction est-elle testable sans setup complexe ?
    

**Critères de validation :**

- La fonction est pure (ou le plus possible).
    
- Les effets de bord sont isolés en périphérie.
    
- Pas de couplage temporel caché entre fonctions.
    
- Les fonctions sont faciles à tester.
    

---

### Étape 10 : Refactorer itérativement (The Clean Method)

**Objectif :** Les fonctions propres ne sortent pas du premier coup. Elles émergent par itération : "First, make it work. Then, make it right."

**La boucle de refactoring :**

1. Écrire un test qui échoue (TDD).
    
2. Écrire le code minimal pour faire passer le test (même si c'est un peu "sale").
    
3. Refactorer pour rendre le code propre, en gardant les tests verts.
    
4. Répéter.
    

**Règle :** Ne pas essayer d'écrire la fonction parfaite du premier coup. Écrire une fonction qui marche, puis la nettoyer.

**Exemple d'itération :**

TypeScript

```typescript
// Étape 1 : Ça marche (mais c'est moche)
function calculateTax(income: number): number {
  if (income <= 30000) return 0;
  if (income <= 100000) return Math.round(0.15 * (income - 30000));
  if (income <= 250000) return Math.round(0.2 * (income - 100000) + 10500);
  if (income <= 500000) return Math.round(0.3 * (income - 250000) + 40500);
  return Math.round(0.4 * (income - 500000) + 115500);
}

// Étape 2 : Refactorer (table-driven, plus propre)
function calculateTax(income: number): number {
  const brackets = [
    { limit: 30000, rate: 0, offset: 0 },
    { limit: 100000, rate: 0.15, offset: 0 },
    { limit: 250000, rate: 0.20, offset: 10500 },
    { limit: 500000, rate: 0.30, offset: 40500 },
    { limit: Infinity, rate: 0.40, offset: 115500 },
  ];

  let previousLimit = 0;
  let previousOffset = 0;

  for (const bracket of brackets) {
    if (income <= bracket.limit) {
      return Math.round(bracket.rate * (income - previousLimit) + previousOffset);
    }
    previousOffset = (bracket.limit - previousLimit) * bracket.rate + previousOffset;
    previousLimit = bracket.limit;
  }

  return 0; // Ne devrait jamais arriver
}
```

**Questions à poser :**

- La fonction actuelle est-elle "sale" mais fonctionnelle ?
    
- Puis-je la refactorer sans casser les tests ?
    
- Les tests couvrent-ils tous les cas avant le refactoring ?
    

**Critères de validation :**

- Les tests passent avant, pendant et après le refactoring.
    
- Chaque étape de refactoring est petite et réversible.
    
- La fonction finale est plus petite, plus pure, et plus lisible que la version initiale.
    

---

### Étape 11 : Utiliser des noms de fonctions descriptifs

**Objectif :** Le nom de la fonction doit révéler son intention (voir `naming-conventions-v2`).

**Règle :** La longueur du nom est inversement proportionnelle à la taille du scope.

TypeScript

```typescript
// ✅ Scope global → nom court
function open(file: string): File { ... }

// ✅ Scope de classe → nom moyen
function openFileAndLog(file: string): File { ... }

// ✅ Scope privé → nom long
function openFileAndThrowExceptionIfNotFound(file: string): File { ... }

// ✅ Tests → nom très long
it('shouldOpenFileAndReturnValidFileObjectWhenFileExists', () => { ... });
```

**Questions à poser :**

- Le nom décrit-il ce que la fonction fait ?
    
- La longueur du nom est-elle adaptée à son scope ?
    
- Un nom plus long serait-il plus clair ?
    

**Critères de validation :**

- Le nom révèle l'intention.
    
- La longueur du nom est adaptée au scope.
    
- Le nom est un verbe ou une phrase verbale.
    

---

## 5. ANTI-PATTERNS DE FONCTIONS (À ÉVITER)

Table

|Anti-pattern|Problème|Solution|
|:--|:--|:--|
|Fonctions trop longues|> 20 lignes|Extraire jusqu'à ce que ce soit petit|
|Fonctions à plusieurs choses|Fait > 1 chose|Extraire en fonctions séparées|
|Niveaux d'abstraction mélangés|Confusion|Uniformiser le niveau|
|Trop d'arguments|> 3|Grouper dans un objet|
|Flag arguments|Booléen qui change le comportement|Deux fonctions séparées|
|Output arguments|Argument modifié en sortie|Retourner la valeur|
|Codes d'erreur|Imbrication profonde|Utiliser des exceptions|
|Effets de bord|Couplage temporel|Fonctions pures|
|Noms vagues|`doSomething()`|Nom descriptif|
|Effets de bord cachés|`getX()` qui modifie X|Séparer get et set|
|Switch répété|Violation OCP, duplication|Polymorphisme via factory|
|Duplication entre fonctions|Fragilité|Extraire fonction commune (DRY)|
|Abstraction Roller Coaster|Alternance haut/bas niveau|Isoler chaque niveau|

---

## 6. RATIONALISATIONS COURANTES (À ÉVITER)

Table

|Rationalisation|Réalité|
|:--|:--|
|"Je connais cette fonction par cœur"|Nouveau venu ne la connaît pas. Petit = clair.|
|"Les appels de fonction sont chers"|Les compilateurs modernes inlinent. Performance négligeable.|
|"J'extrais plus tard"|Plus tard = jamais.|
|"C'est plus simple de tout garder dans une fonction"|Plus simple pour écrire, plus difficile pour lire.|
|"Cette fonction n'est appelée qu'ici"|Elle peut l'être ailleurs plus tard. Petit = réutilisable.|
|"Tout le monde sait ce que fait cette fonction"|Si le nom ne le dit pas, non.|
|"Le switch est plus rapide que le polymorphisme"|La différence est négligeable. La maintenabilité prime.|
|"C'est juste une petite duplication"|La duplication s'accumule. DRY dès le départ.|

---

## 7. RED FLAGS (Signaux d'alarme)

Table

|Signe|Problème|Solution|
|:--|:--|:--|
|Fonction > 20 lignes|Trop grande|Extraire|
|Plusieurs if/else imbriqués|Fait plusieurs choses|Extraire chaque branche|
|Plusieurs switch sur un type|Fait plusieurs choses + violation OCP|Polymorphisme via factory|
|Switch répété dans plusieurs fonctions|Duplication + violation OCP|Extraire dans une factory|
|Arguments > 3|Trop couplé|Grouper|
|Flag argument|Fait deux choses|Deux fonctions|
|Output argument|Violation CQS|Retourner la valeur|
|Effet de bord caché|Couplage temporel|Rendre pur ou documenter|
|Nom ne correspond pas au corps|Trompeur|Renommer|
|Try/catch mélangé avec logique|Confusion|Extraire|
|Duplication de code entre 2+ fonctions|Violation DRY|Extraire fonction commune|
|Alternance haut/bas niveau dans une fonction|Roller Coaster|Isoler les niveaux|

---

## 8. LIVRABLES ATTENDUS

Pour une conception de fonction complétée :

Table

|Document|Description|
|:--|:--|
|Fonctions|Code avec fonctions petites et focalisées.|
|Documentation API|Description des fonctions publiques.|
|Tests unitaires|Tests pour chaque fonction.|

---

## 9. LIENS AVEC LES AUTRES PHASES

**Input (Phase 2) :**

- `api-and-interface-design-v2` → Signatures des fonctions.
    
- `planning-and-task-breakdown-v2` → Quelles fonctions sont nécessaires.
    

**Output (Phase 4) :**

- Fonctions testables → Facilite les tests unitaires.
    
- Fonctions pures → Facilite le débogage.
    

**Dépendances internes :**

- `naming-conventions-v2` : Noms des fonctions.
    
- `test-driven-development-v2` : Tests des fonctions.
    
- `error-handling-v2` : Gestion des erreurs dans les fonctions.
    
- `class-design-v2` : Fonctions comme méthodes de classes (cohésion).
    

---

## 10. RESSOURCES UTILISÉES

- **Clean Code, 2nd Edition (Robert C. Martin)**
    
    - Ch. 3 : "First Principles" — Fondamentaux des fonctions.
        
    - Ch. 7 : "Clean Functions" — Attributs des fonctions propres (small, one thing, abstraction).
        
    - Ch. 8 : "Function Heuristics" — Règles pratiques (args, CQS, exceptions, side effects, DRY).
        
    - Ch. 9 : "The Clean Method" — Refactoring itératif (make it work, then make it right).
        
    - Ch. 10 : "One Thing" — La règle "Faire une seule chose" (extract till you drop).
        
    - Ch. 11 : "Be Polite" — Stepdown Rule et Abstraction Roller Coaster.
        
- **Skills Osmani :** Aucun équivalent direct (nouveau skill).
    

---

## 11. EXEMPLE COMPLET D'APPLICATION

**Contexte :** Refactorisation d'une fonction de traitement de commande avec switch et duplication.

**Avant (fonction problématique) :**

TypeScript

```typescript
function processOrder(order: Order): number {
  // Validation (niveau bas)
  if (!order.customer) {
    console.log('No customer');
    return -1;
  }
  if (!order.items || order.items.length === 0) {
    console.log('No items');
    return -1;
  }

  // Calcul (niveau moyen)
  let total = 0;
  for (const item of order.items) {
    total += item.price * item.quantity;
  }

  // Remise (niveau haut)
  if (order.customer.isPremium) {
    total = total * 0.9;
  }

  // Taxe (niveau bas)
  const tax = total * 0.2;
  total = total + tax;

  // Sauvegarde (niveau très bas)
  database.save(order.id, { total });

  // Notification (effet de bord)
  email.send(order.customer.email, `Order total: ${total}`);

  return total;
}
```

**Après (fonctions propres) :**

TypeScript

```typescript
// Niveau 1 : Orchestration (Stepdown Rule)
function processOrder(order: Order): ProcessResult {
  validateOrder(order);
  const total = calculateTotal(order);
  const finalTotal = applyTax(total);
  saveOrder(order.id, finalTotal);
  notifyCustomer(order.customer, finalTotal);
  return { success: true, total: finalTotal };
}

// Niveau 2 : Validation
function validateOrder(order: Order): void {
  if (!order.customer) {
    throw new ValidationError('Customer is required');
  }
  if (!order.items || order.items.length === 0) {
    throw new ValidationError('At least one item is required');
  }
}

// Niveau 2 : Calcul
function calculateTotal(order: Order): number {
  let total = sumItems(order.items);
  if (order.customer.isPremium) {
    total = applyDiscount(total);
  }
  return total;
}

// Niveau 3 : Détails du calcul (DRY : réutilisable ailleurs)
function sumItems(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function applyDiscount(total: number): number {
  return total * 0.9;
}

// Niveau 2 : Taxe
function applyTax(total: number): number {
  return total * 1.2;
}

// Niveau 2 : Sauvegarde (effet de bord isolé)
function saveOrder(orderId: string, total: number): void {
  database.save(orderId, { total });
}

// Niveau 2 : Notification (effet de bord isolé)
function notifyCustomer(customer: Customer, total: number): void {
  email.send(customer.email, `Order total: ${total}`);
}
```

**Résumé des améliorations :**

- Petites fonctions : Chaque fonction fait ≤ 5 lignes.
    
- Une seule chose : Chaque fonction a une responsabilité unique.
    
- Stepdown Rule : Lecture de haut en bas.
    
- Arguments limités : Chaque fonction a 1-2 arguments.
    
- Erreurs par exceptions : Plus de codes d'erreur.
    
- Effets de bord : Isolés en périphérie (saveOrder, notifyCustomer).
    
- Noms descriptifs : Chaque nom révèle l'intention.
    
- DRY : `sumItems` peut être réutilisé ailleurs.
    

---

## 12. VÉRIFICATION FINALE (Definition of Done)

Après avoir conçu ou refactoré des fonctions :

- [ ] Toutes les fonctions font ≤ 20 lignes (idéalement ≤ 10).
    
- [ ] Chaque fonction fait exactement une chose.
    
- [ ] Les fonctions suivent le Stepdown Rule.
    
- [ ] Pas d'Abstraction Roller Coaster (alternance haut/bas niveau).
    
- [ ] Les fonctions ont ≤ 3 arguments.
    
- [ ] Pas de flag arguments (booléens qui changent le comportement).
    
- [ ] Pas de output arguments (arguments modifiés en sortie).
    
- [ ] Les exceptions sont utilisées (pas de codes d'erreur).
    
- [ ] Les try/catch sont extraits de la logique métier.
    
- [ ] Les fonctions sont pures (ou les effets de bord sont isolés).
    
- [ ] Pas de couplage temporel caché.
    
- [ ] Les noms des fonctions sont descriptifs.
    
- [ ] **Pas de switch/if-else sur des types répétés (polymorphisme utilisé).**
    
- [ ] **Pas de duplication entre fonctions (DRY respecté).**
    
- [ ] **La fonction a été refactorée itérativement (make it work → make it right).**
    
- [ ] Toutes les fonctions sont testées.
    

plain

````plain

---

```markdown
<!-- function-design-v2-quick.md -->
---
name: function-design-v2-quick
description: Version condensée du skill function-design-v2 pour les sessions rapides. Utiliser quand le contexte est limité ou pour un rappel rapide avant de concevoir une fonction.
---

# Function Design — Quick Mode

## 1. RÈGLES D'OR

1. **Small :** ≤ 20 lignes (idéalement ≤ 10).
2. **One Thing :** Si vous pouvez extraire une fonction significative, la fonction originale faisait plus d'une chose.
3. **DRY :** Pas de duplication entre fonctions.
4. **Stepdown :** Lire de haut en bas, un niveau d'abstraction à la fois.
5. **No Switch in Business Logic :** Switch/if-else sur un type → Polymorphisme via factory.
6. **Args ≤ 3 :** Sinon, grouper dans un objet.
7. **No Flag / No Output Args :** Deux fonctions explicites, retourner la valeur.
8. **CQS :** Commande (modifie) OU Requête (retourne), pas les deux.
9. **Exceptions :** Pas de codes d'erreur. Try/catch extraits.
10. **Pure :** Pas d'effets de bord cachés. Isoler les I/O en périphérie.
11. **Refactor :** First make it work, then make it right.
12. **Name :** Verbe descriptif, longueur inverse au scope.

---

## 2. CHECKLIST RAPIDE

### Avant d'écrire
- [ ] La fonction fait quelle UNE chose ?
- [ ] Quel est son niveau d'abstraction ?
- [ ] Combien d'arguments (≤ 3 ?) ?
- [ ] Y a-t-il un switch sur un type ?

### Pendant l'écriture
- [ ] ≤ 20 lignes.
- [ ] Toutes les lignes au même niveau d'abstraction.
- [ ] Pas de flag argument.
- [ ] Pas d'output argument.
- [ ] Pas de duplication avec une autre fonction.
- [ ] Pas de code d'erreur (exceptions).

### Après écriture
- [ ] Peut-on lire de haut en bas (Stepdown) ?
- [ ] Y a-t-il un Roller Coaster (alternance haut/bas) ?
- [ ] Les effets de bord sont-ils isolés ?
- [ ] Le nom est-il un verbe descriptif ?
- [ ] Les tests passent ?

---

## 3. ANTI-PATTERNS (STOP)

| Anti-pattern | Solution |
|--------------|----------|
| `function > 20 lines` | Extraire |
| `function does > 1 thing` | Extraire en fonctions séparées |
| `switch on type repeated` | Factory + polymorphisme |
| `duplication with another function` | Extract common function |
| `args > 3` | Object / destructuring |
| `flag argument (boolean)` | Two explicit functions |
| `output argument (mutated param)` | Return value |
| `error code return` | Throw exception |
| `hidden side effect` | Pure function or isolate I/O |
| `mixed high/low abstraction` | Stepdown, one level per function |
| `vague name (doSomething)` | Descriptive verb |

---

## 4. RED FLAGS

- [ ] Fonction > 20 lignes.
- [ ] Plus d'une responsabilité identifiable.
- [ ] Switch/if-else sur un type dans le code métier.
- [ ] Duplication de code avec une autre fonction.
- [ ] Arguments > 3.
- [ ] Flag argument (`includeDetails: boolean`).
- [ ] Output argument (`result: Stats`).
- [ ] Code d'erreur retourné.
- [ ] Effet de bord caché (get qui modifie).
- [ ] Try/catch mélangé avec la logique métier.
- [ ] Alternance haut/bas niveau dans une même fonction.
- [ ] Nom ne correspond pas au corps.

---

## 5. OUTPUT MINIMAL

Pour valider une fonction rapidement :

1. **Code :** ≤ 20 lignes, une chose, ≤ 3 args, pas de switch métier.
2. **Nom :** Verbe descriptif, longueur adaptée au scope.
3. **Tests :** Au moins 1 test par chemin (happy + error).
4. **DRY :** Pas de duplication avec une autre fonction du module.
````