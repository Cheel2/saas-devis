````markdown
# code-smells-v2

## 1. OBJECTIF DU SKILL

**Pourquoi ce skill existe ?**
Les "code smells" (odeurs de code) sont des structures superficielles qui indiquent des problèmes plus profonds dans la conception. Un code qui "sent mauvais" est plus difficile à comprendre, à modifier, et à maintenir. Ce skill fournit un catalogue systématique des odeurs de code les plus courantes, leurs causes, leurs symptômes, et les refactorings pour les corriger.

**Un code smell n'est pas un bug.**
C'est un indicateur de faiblesse de conception qui peut ralentir le développement, accroître le risque de bugs futurs, ou rendre le code difficile à modifier. Un smell fonctionne aujourd'hui, mais il handicape demain.

**Quel problème résout-il ?**
- Permet d'identifier rapidement les problèmes de conception.
- Fournit un vocabulaire commun pour discuter des problèmes de code.
- Guide les refactorings vers des solutions éprouvées.
- Évite que les petites odeurs ne deviennent de gros problèmes.

**Dans quel contexte l'utiliser ?**
- Revue de code (identifier les problèmes).
- Refactorisation (savoir quoi corriger).
- Conception (éviter les odeurs dès le départ).
- Apprentissage (comprendre ce qui rend le code "propre").

---

## 2. PRÉREQUIS

**Ce qui doit être déjà fait :**
- ✅ Les principes de base des fonctions (function-design-v2) et des classes (class-design-v2) sont connus.
- ✅ Les conventions de nommage sont établies (naming-conventions-v2).
- ✅ Une suite de tests existe (pour refactorer en sécurité).

**Quels documents sont nécessaires :**
- Code source à analyser.
- Standards de codage du projet.

**Quelles informations doivent être disponibles :**
- Les motifs récurrents dans le code.
- Les zones de changement fréquent.

---

## 3. RÔLES ET RESPONSABILITÉS

| Rôle | Responsabilités |
|------|-----------------|
| **Développeur (IA/Humain)** | - Identifie les code smells.<br>- Propose des refactorings.<br>- Applique les corrections en sécurité (tests). |
| **Réviseur (Code Review)** | - Signale les code smells dans les revues.<br>- Utilise le vocabulaire des smells pour décrire les problèmes. |
| **Architecte Technique** | - Identifie les smells à l'échelle du système.<br>- Définit les priorités de refactoring. |
| **Tech Lead** | - Éduque l'équipe sur les code smells.<br>- Mène les refactorings majeurs. |

---

## 4. PROCESSUS DÉTAILLÉ (Étape par Étape)

### Étape 0 : Priorisation des smells

**Objectif :** Ne pas tous les traiter en même temps. Certains smells bloquent l'évolution, d'autres sont de la dette technique.

**Ordre de priorité (du plus critique au moins critique) :**

| Priorité | Catégorie | Pourquoi d'abord ? |
|----------|-----------|-------------------|
| **1** | **Change Preventers** (Shotgun Surgery, Divergent Change) | Bloquent l'évolution du système. Un changement simple nécessite de toucher partout. |
| **2** | **Couplage** (Feature Envy, Inappropriate Intimacy, Message Chains) | Fragilisent l'architecture. Les modifications en cascade sont imprévisibles. |
| **3** | **Bloaters** (Large Class, Long Method, Primitive Obsession) | Ralentissent la compréhension et la navigation. |
| **4** | **Dispensables** (Duplicate Code, Lazy Class, Data Class, Dead Code) | Dette technique pure. Faciles à corriger, mais s'accumulent. |
| **5** | **OO Abusers** (Switch Statements, Refused Bequest, Alternative Classes) | Mauvaise utilisation du paradigme OO. Généralement localisés. |

**Règle :** Corrigez d'abord les smells qui empêchent le changement, ensuite ceux qui ralentissent la compréhension.

---

### Étape 1 : Détection des odeurs de code

**Objectif :** Identifier les problèmes potentiels dans le code.

**Les 5 grandes catégories de smells :**

| Catégorie | Description | Exemples |
|-----------|-------------|----------|
| **Bloaters** | Code trop grand | Long Method, Large Class, Primitive Obsession |
| **Object-Orientation Abusers** | Mauvaise utilisation de l'OO | Switch Statements, Refused Bequest, Alternative Classes |
| **Change Preventers** | Code difficile à changer | Divergent Change, Shotgun Surgery, Parallel Inheritance |
| **Dispensables** | Code inutile | Duplicate Code, Lazy Class, Data Class, Dead Code |
| **Couplage** | Dépendances excessives | Feature Envy, Inappropriate Intimacy, Message Chains |

---

### Étape 2 : Long Method (Méthode trop longue)

**Symptômes :**
- Une méthode fait plus de 20 lignes.
- La méthode a plusieurs niveaux d'indentation.
- La méthode a plusieurs responsabilités.

**Solution :** Extract Method

```typescript
// ❌ Long Method - 30+ lignes
function processOrder(order: Order): number {
  let total = 0;
  for (const item of order.items) {
    let price = item.price;
    if (item.quantity > 10) {
      price = price * 0.9; // Remise de groupe
    }
    total += price * item.quantity;
  }

  let discount = 0;
  if (order.customer.isPremium) {
    discount = total * 0.1;
  } else if (order.totalAmount > 500) {
    discount = total * 0.05;
  }

  const tax = total * 0.2;
  const finalTotal = total - discount + tax;

  database.save(order.id, { total, discount, tax, finalTotal });
  email.send(order.customer.email, `Total: ${finalTotal}`);

  return finalTotal;
}

// ✅ Refactoré - méthodes courtes et focalisées
function processOrder(order: Order): number {
  const total = calculateSubtotal(order);
  const discount = calculateDiscount(order, total);
  const tax = calculateTax(total - discount);
  const finalTotal = total - discount + tax;

  saveOrder(order.id, finalTotal);
  notifyCustomer(order.customer, finalTotal);

  return finalTotal;
}

function calculateSubtotal(order: Order): number {
  return order.items.reduce((sum, item) => {
    const price = getItemPrice(item);
    return sum + price * item.quantity;
  }, 0);
}

function getItemPrice(item: OrderItem): number {
  return item.quantity > 10 ? item.price * 0.9 : item.price;
}

function calculateDiscount(order: Order, total: number): number {
  if (order.customer.isPremium) return total * 0.1;
  if (total > 500) return total * 0.05;
  return 0;
}
````

---

### Étape 3 : Large Class (Classe trop grande)

**Symptômes :**

- Une classe fait plus de 200 lignes.
    
- La classe a trop de méthodes ou de variables.
    
- La classe a plusieurs responsabilités.
    

**Solution :** Extract Class, Extract Subclass

TypeScript

```typescript
// ❌ Large Class - 300+ lignes
class OrderProcessor {
  private database: Database;
  private logger: Logger;
  private email: EmailService;
  private cache: Cache;

  // Validation
  validateOrder(order: Order): boolean { /* ... */ }
  validateCustomer(customer: Customer): boolean { /* ... */ }

  // Calcul
  calculateTotal(items: OrderItem[]): number { /* ... */ }
  calculateTax(total: number): number { /* ... */ }
  calculateDiscount(customer: Customer, total: number): number { /* ... */ }

  // Persistance
  saveOrder(order: Order): void { /* ... */ }
  loadOrder(id: string): Order { /* ... */ }

  // Email
  sendConfirmation(order: Order): void { /* ... */ }
  sendInvoice(order: Order): void { /* ... */ }

  // Cache
  cacheOrder(order: Order): void { /* ... */ }
  getCachedOrder(id: string): Order | null { /* ... */ }

  // Logging
  logOrder(order: Order): void { /* ... */ }
  logError(error: Error): void { /* ... */ }
}

// ✅ Refactoré - classes spécialisées
class OrderValidator {
  validate(order: Order): void { /* ... */ }
}

class OrderCalculator {
  calculateTotal(items: OrderItem[]): number { /* ... */ }
  calculateTax(total: number): number { /* ... */ }
}

class OrderRepository {
  save(order: Order): void { /* ... */ }
  findById(id: string): Order | null { /* ... */ }
}

class OrderNotifier {
  sendConfirmation(order: Order): void { /* ... */ }
}

class OrderLogger {
  logOrder(order: Order): void { /* ... */ }
}

class OrderProcessor {
  constructor(
    private validator: OrderValidator,
    private calculator: OrderCalculator,
    private repository: OrderRepository,
    private notifier: OrderNotifier,
    private logger: OrderLogger
  ) {}

  process(order: Order): void {
    this.validator.validate(order);
    const total = this.calculator.calculateTotal(order.items);
    this.repository.save(order);
    this.notifier.sendConfirmation(order);
    this.logger.logOrder(order);
  }
}
```

---

### Étape 4 : Primitive Obsession (Obsession des primitives)

**Symptômes :**

- Utilisation de primitives (string, number) pour des concepts métier.
    
- Validation répétée des mêmes primitives.
    
- Groupes de primitives qui apparaissent ensemble.
    

**Solution :** Replace Primitive with Object

TypeScript

```typescript
// ❌ Primitive Obsession
function createUser(
  name: string,
  email: string,
  phone: string,
  age: number,
  zipCode: string,
  city: string,
  country: string
): User {
  // Validation répétée partout
  if (!email.includes('@')) throw new Error('Invalid email');
  if (phone.length < 10) throw new Error('Invalid phone');
  if (age < 0 || age > 150) throw new Error('Invalid age');
  // ...
}

// ✅ Refactoré - objets de valeur
class Email {
  constructor(private value: string) {
    if (!value.includes('@')) throw new Error('Invalid email');
  }
  toString(): string { return this.value; }
}

class PhoneNumber {
  constructor(private value: string) {
    if (value.length < 10) throw new Error('Invalid phone');
  }
  toString(): string { return this.value; }
}

class Age {
  constructor(private value: number) {
    if (value < 0 || value > 150) throw new Error('Invalid age');
  }
  getValue(): number { return this.value; }
}

class Address {
  constructor(
    public readonly zipCode: string,
    public readonly city: string,
    public readonly country: string
  ) {}
}

class User {
  constructor(
    public readonly name: string,
    public readonly email: Email,
    public readonly phone: PhoneNumber,
    public readonly age: Age,
    public readonly address: Address
  ) {}
}
```

---

### Étape 5 : Switch Statements (Instructions switch)

**Symptômes :**

- Des switch statements ou if/else chains basés sur des types.
    
- Le même switch apparaît à plusieurs endroits.
    
- Ajouter un nouveau cas nécessite de modifier plusieurs endroits.
    

**Solution :** Replace Conditional with Polymorphism (ou Replace with Strategy/Map)

TypeScript

```typescript
// ❌ Switch statement - doit changer pour chaque nouveau type
class Shape {
  type: 'circle' | 'square' | 'triangle';
  radius?: number;
  side?: number;
  base?: number;
  height?: number;
}

class AreaCalculator {
  calculate(shape: Shape): number {
    switch (shape.type) {
      case 'circle': return Math.PI * shape.radius! * shape.radius!;
      case 'square': return shape.side! * shape.side!;
      case 'triangle': return 0.5 * shape.base! * shape.height!;
    }
  }
}

// ✅ Polymorphisme - ajouter un type sans modifier le code existant
interface Shape {
  area(): number;
}

class Circle implements Shape {
  constructor(private radius: number) {}
  area(): number { return Math.PI * this.radius * this.radius; }
}

class Square implements Shape {
  constructor(private side: number) {}
  area(): number { return this.side * this.side; }
}

class Triangle implements Shape {
  constructor(private base: number, private height: number) {}
  area(): number { return 0.5 * this.base * this.height; }
}

class AreaCalculator {
  calculate(shapes: Shape[]): number {
    return shapes.reduce((sum, shape) => sum + shape.area(), 0);
  }
}
```

---

### Étape 6 : Feature Envy (Envie de fonctionnalité)

**Symptômes :**

- Une méthode utilise beaucoup plus une autre classe que la sienne.
    
- La méthode devrait être dans la classe qu'elle utilise.
    

**Solution :** Move Method

TypeScript

```typescript
// ❌ Feature Envy - la méthode utilise plus Customer que Order
class Order {
  customer: Customer;
  items: OrderItem[];

  calculateDiscount(): number {
    // Utilise beaucoup Customer
    if (this.customer.isPremium) {
      return this.customer.totalSpent * 0.1;
    }
    if (this.customer.totalSpent > 1000) {
      return this.customer.totalSpent * 0.05;
    }
    return 0;
  }
}

// ✅ Refactoré - la méthode est déplacée dans Customer
class Customer {
  isPremium: boolean;
  totalSpent: number;

  calculateDiscount(order: Order): number {
    if (this.isPremium) {
      return this.totalSpent * 0.1;
    }
    if (this.totalSpent > 1000) {
      return this.totalSpent * 0.05;
    }
    return 0;
  }
}

class Order {
  customer: Customer;
  items: OrderItem[];

  calculateDiscount(): number {
    return this.customer.calculateDiscount(this);
  }
}
```

---

### Étape 7 : Data Class (Classe de données)

**Symptômes :**

- Une classe avec seulement des champs et des getters/setters.
    
- Pas de comportement métier.
    
- D'autres classes manipulent directement ses données.
    

**Solution :** Encapsulate Behavior

TypeScript

```typescript
// ❌ Data Class - juste des données
class UserData {
  name: string;
  email: string;
  phone: string;
  age: number;

  // Getters/Setters seulement
  getName(): string { return this.name; }
  setName(name: string): void { this.name = name; }
  getEmail(): string { return this.email; }
  setEmail(email: string): void { this.email = email; }
  // ...
}

// ✅ Refactoré - comportement ajouté
class User {
  constructor(
    private name: string,
    private email: Email,
    private phone: PhoneNumber,
    private age: Age
  ) {}

  getName(): string { return this.name; }
  getEmail(): string { return this.email.toString(); }

  // Comportement métier
  updateEmail(newEmail: string): void {
    this.email = new Email(newEmail);
    this.notifyEmailChange();
  }

  isEligibleForDiscount(): boolean {
    return this.age.getValue() > 18 && this.email.isValid();
  }

  private notifyEmailChange(): void {
    // Notification interne
  }
}
```

---

### Étape 8 : Shotgun Surgery (Chirurgie au fusil de chasse)

**Symptômes :**

- Une modification nécessite de changer plusieurs classes.
    
- La même logique est dispersée dans le code.
    

**Solution :** Move Method, Extract Class

TypeScript

```typescript
// ❌ Shotgun Surgery - la logique de taxe est partout
class OrderService {
  calculateTotal(order: Order): number {
    // Logique de taxe
    const taxRate = order.customer.country === 'FR' ? 0.2 : 0.1;
    // ...
  }
}

class InvoiceService {
  generateInvoice(order: Order): Invoice {
    // Logique de taxe dupliquée
    const taxRate = order.customer.country === 'FR' ? 0.2 : 0.1;
    // ...
  }
}

// ✅ Refactoré - logique centralisée
class TaxCalculator {
  calculateTax(order: Order): number {
    const rate = this.getTaxRate(order.customer.country);
    return order.total * rate;
  }

  private getTaxRate(country: string): number {
    switch (country) {
      case 'FR': return 0.2;
      case 'US': return 0.1;
      default: return 0.15;
    }
  }
}

class OrderService {
  constructor(private taxCalculator: TaxCalculator) {}

  calculateTotal(order: Order): number {
    return order.total + this.taxCalculator.calculateTax(order);
  }
}

class InvoiceService {
  constructor(private taxCalculator: TaxCalculator) {}

  generateInvoice(order: Order): Invoice {
    const tax = this.taxCalculator.calculateTax(order);
    // ...
  }
}
```

---

### Étape 9 : Duplicate Code (Code dupliqué)

**Symptômes :**

- Le même bloc de code apparaît à plusieurs endroits.
    
- Les modifications doivent être faites en plusieurs endroits.
    

**Solution :** Extract Method, Extract Class

TypeScript

```typescript
// ❌ Duplicate Code
class OrderService {
  calculateDiscount(order: Order): number {
    // Calcul de remise
    let discount = 0;
    if (order.customer.isPremium) {
      discount = order.total * 0.1;
    }
    if (order.total > 500) {
      discount = Math.max(discount, order.total * 0.05);
    }
    return discount;
  }
}

class InvoiceService {
  calculateDiscount(order: Order): number {
    // Même calcul dupliqué
    let discount = 0;
    if (order.customer.isPremium) {
      discount = order.total * 0.1;
    }
    if (order.total > 500) {
      discount = Math.max(discount, order.total * 0.05);
    }
    return discount;
  }
}

// ✅ Refactoré - logique centralisée
class DiscountCalculator {
  calculate(order: Order): number {
    let discount = 0;
    if (order.customer.isPremium) {
      discount = order.total * 0.1;
    }
    if (order.total > 500) {
      discount = Math.max(discount, order.total * 0.05);
    }
    return discount;
  }
}

class OrderService {
  constructor(private discountCalculator: DiscountCalculator) {}

  calculateDiscount(order: Order): number {
    return this.discountCalculator.calculate(order);
  }
}

class InvoiceService {
  constructor(private discountCalculator: DiscountCalculator) {}

  calculateDiscount(order: Order): number {
    return this.discountCalculator.calculate(order);
  }
}
```

---

### Étape 10 : Dead Code (Code mort)

**Symptômes :**

- Code jamais exécuté.
    
- Code commenté.
    
- Code qui n'est plus utilisé.
    

**Solution :** Delete Code

TypeScript

```typescript
// ❌ Dead Code
class OrderService {
  // Code commenté - jamais utilisé
  // processOldOrders(): void {
  //   // ...
  // }

  // Code jamais appelé
  private validateOrderLegacy(order: Order): boolean {
    // ...
    return true;
  }

  // Code jamais utilisé
  sendFax(order: Order): void {
    // ...
  }
}

// ✅ Supprimer le code mort
class OrderService {
  // Seulement le code utilisé
  processOrder(order: Order): void {
    this.validateOrder(order);
    this.saveOrder(order);
    this.sendEmail(order);
  }

  private validateOrder(order: Order): void {
    // ...
  }

  private saveOrder(order: Order): void {
    // ...
  }

  private sendEmail(order: Order): void {
    // ...
  }
}
```

---

### Étape 11 : Smells avancés — Référence rapide

**Objectif :** Couvrir les smells qui apparaissent dans la taxonomie mais qui ne sont pas détaillés dans les étapes précédentes.

Table

|Smell|Symptôme|Solution|
|:--|:--|:--|
|**Message Chains**|Enchaînement de getters : `a.b.c.d()`|Hide Delegate — créer une méthode déléguée|
|**Inappropriate Intimacy**|Deux classes trop dépendantes (trop de champs privés utilisés)|Move Method, Extract Class, ou Introduce Parameter Object|
|**Temporary Field**|Un champ qui n'est initialisé que dans certains cas ou méthodes|Extract Class pour isoler le comportement conditionnel|
|**Refused Bequest**|Une sous-classe n'utilise pas (ou redéfinit de manière vide) les méthodes héritées|Replace Inheritance with Delegation|
|**Lazy Class**|Une classe qui ne fait presque rien et pourrait être fusionnée|Collapse Hierarchy (fusionner avec parent/enfant)|
|**Divergent Change**|Une classe change pour plusieurs raisons différentes (plusieurs "acteurs")|Extract Class — appliquer le SRP au niveau classe|

**Détection rapide :**

- **Message Chains :** Si vous voyez `getX().getY().getZ().doSomething()`, c'est un Message Chain.
    
- **Inappropriate Intimacy :** Si deux classes ont beaucoup de méthodes privées qui se connaissent mutuellement.
    
- **Temporary Field :** Si un champ est null ou undefined dans certains états de l'objet.
    
- **Refused Bequest :** Si une sous-classe lance `NotImplementedError` ou laisse vide une méthode héritée.
    
- **Lazy Class :** Si supprimer la classe ne change presque rien au système.
    
- **Divergent Change :** Si un changement de taxe nécessite de modifier la classe, et un changement de validation nécessite aussi de modifier la même classe.
    

---

## 5. CATALOGUE RAPIDE DES CODE SMELLS

Table

|Smell|Symptôme|Solution|
|:--|:--|:--|
|Long Method|> 20 lignes|Extract Method|
|Large Class|> 200 lignes|Extract Class|
|Primitive Obsession|Primitives pour concepts métier|Replace with Object|
|Switch Statements|Switch basé sur type|Polymorphism|
|Feature Envy|Méthode utilise une autre classe|Move Method|
|Data Class|Seulement données|Encapsulate Behavior|
|Shotgun Surgery|Changement dans plusieurs classes|Centraliser|
|Duplicate Code|Code répété|Extract Method|
|Dead Code|Code jamais utilisé|Delete Code|
|Message Chains|Enchaînement de getters|Hide Delegate|
|Inappropriate Intimacy|Classes trop dépendantes|Move Method, Extract Class|
|Refused Bequest|Sous-classe n'utilise pas tout|Replace with Delegation|
|Lazy Class|Classe qui ne fait rien|Collapse Hierarchy|
|Temporary Field|Champ jamais initialisé|Extract Class|
|Divergent Change|Plusieurs raisons de changer|SRP|

---

## 6. RATIONALISATIONS COURANTES (À ÉVITER)

Table

|Rationalisation|Réalité|
|:--|:--|
|"C'est comme ça depuis toujours"|Les smells s'accumulent.|
|"On n'a pas le temps de refactorer"|Le temps perdu plus tard sera pire.|
|"Ça marche, alors pourquoi changer ?"|Ça fonctionne, mais c'est cher à maintenir.|
|"Le code est vieux, il faut le laisser"|Le code vieillit mal sans entretien.|
|"Un refactoring va tout casser"|Avec des tests, on refactore en sécurité.|
|"C'est juste une petite duplication"|Une petite duplication devient une grosse.|

---

## 7. RED FLAGS (Signaux d'alarme)

Table

|Signe|Problème|Solution|
|:--|:--|:--|
|Code > 50 lignes|Long Method|Extract Method|
|Classe > 200 lignes|Large Class|Extract Class|
|Switch avec 3+ cas|Switch Statements|Polymorphism|
|La même logique à 3 endroits|Duplicate Code|Extract Method|
|Code commenté depuis > 1 mois|Dead Code|Delete Code|
|Méthode qui utilise une autre classe plus que la sienne|Feature Envy|Move Method|
|Beaucoup de getters/setters|Data Class|Encapsulate Behavior|

---

## 8. LIVRABLES ATTENDUS

Pour une session de refactoring :

Table

|Document|Description|
|:--|:--|
|**Rapport de smells**|Liste des smells identifiés.|
|**Plan de refactoring**|Ordre des corrections (priorisé).|
|**Code refactoré**|Code corrigé.|
|**Tests**|Tests toujours passants.|

---

## 9. LIENS AVEC LES AUTRES PHASES

**Input (ce qui vient d'avant - Phase 2)**

- architectural-patterns → Smells au niveau architecture.
    
- class-design-v2 → Smells au niveau classe.
    

**Output (ce qui est transmis - Phase 4)**

- Code refactoré → Plus facile à tester.
    
- Moins de smells → Plus facile à maintenir.
    

**Dépendances internes**

- function-design-v2 : Smells de fonctions.
    
- class-design-v2 : Smells de classes.
    
- clean-tests-v2 : Smells de tests.
    

---

## 10. RESSOURCES UTILISÉES

**Livre principal (catalogue canonique) :**

- _Refactoring_, 2nd Edition (Martin Fowler) — Catalogue complet des code smells et des refactorings associés.
    

**Livre secondaire (principes sous-jacents) :**

- _Clean Code_, 2nd Edition (Robert C. Martin)
    
    - Chapter 3 : "First Principles" — Rigidité, fragilité, immobilité.
        
    - Chapter 10 : "One Thing" — Extract till you drop.
        
    - Chapter 13 : "Clean Classes" — SRP, OCP.
        

**Skills Osmani :** Aucun équivalent direct (nouveau skill).

**Autres références :**

- Joshua Kerievsky, _Refactoring to Patterns_.
    

---

## 11. EXEMPLE COMPLET D'APPLICATION

**Contexte :** Code legacy d'un système de gestion de commandes

**Avant - multiples smells :**

TypeScript

```typescript
// ❌ Large Class + Long Method + Switch + Duplicate Code
class OrderManager {
  private db: Database;
  private logger: Logger;
  private email: EmailService;

  process(order: any): number {
    // Validate (duplicate)
    if (!order.customer) {
      this.logger.log('No customer');
      return -1;
    }
    if (!order.items || order.items.length === 0) {
      this.logger.log('No items');
      return -1;
    }

    // Calculate (long method)
    let total = 0;
    for (const item of order.items) {
      let price = item.price;
      if (item.quantity > 10) {
        price = price * 0.9;
      }
      total += price * item.quantity;
    }

    // Discount (duplicate logic elsewhere)
    let discount = 0;
    if (order.customer.type === 'premium') {
      discount = total * 0.1;
    } else if (total > 500) {
      discount = total * 0.05;
    }

    // Tax (switch)
    let tax = 0;
    switch (order.customer.country) {
      case 'FR':
        tax = total * 0.2;
        break;
      case 'US':
        tax = total * 0.1;
        break;
      default:
        tax = total * 0.15;
    }

    const finalTotal = total - discount + tax;

    // Save (duplicate)
    this.db.save(order.id, {
      total,
      discount,
      tax,
      finalTotal,
      status: 'processed'
    });

    // Email (duplicate)
    this.email.send(order.customer.email, `Order ${order.id} processed`);
    this.logger.log(`Order ${order.id} processed`);

    return finalTotal;
  }

  // Duplicate code
  refund(order: any): number {
    // Validate (duplicate)
    if (!order.customer) {
      this.logger.log('No customer');
      return -1;
    }
    // ... plus de code dupliqué
  }
}
```

**Après - smells corrigés :**

TypeScript

```typescript
// ✅ Small classes, clean methods

// 1. Value Objects
class OrderId {
  constructor(private value: string) {
    if (!value) throw new ValidationError('Order ID required');
  }
  toString(): string { return this.value; }
}

class Customer {
  constructor(
    public readonly id: CustomerId,
    public readonly type: CustomerType,
    public readonly country: Country,
    public readonly email: Email
  ) {}
}

// 2. Validation Service
class OrderValidator {
  validate(order: Order): void {
    if (!order.customer) throw new ValidationError('Customer required');
    if (!order.items || order.items.length === 0) {
      throw new ValidationError('At least one item required');
    }
  }
}

// 3. Calculation Service (no switch)
class PriceCalculator {
  calculate(item: OrderItem): number {
    return item.quantity > 10 ? item.price * 0.9 : item.price;
  }
}

class DiscountCalculator {
  calculate(customer: Customer, total: number): number {
    if (customer.type === 'premium') return total * 0.1;
    if (total > 500) return total * 0.05;
    return 0;
  }
}

// 4. Tax Calculator (no switch)
class TaxCalculator {
  private rates = new Map<string, number>([
    ['FR', 0.2],
    ['US', 0.1],
    ['DE', 0.19],
  ]);

  calculate(customer: Customer, total: number): number {
    const rate = this.rates.get(customer.country) ?? 0.15;
    return total * rate;
  }
}

// 5. Repository (no duplicate)
class OrderRepository {
  constructor(private db: Database) {}

  save(order: Order): void {
    this.db.save(order.id.toString(), {
      total: order.total,
      discount: order.discount,
      tax: order.tax,
      finalTotal: order.finalTotal,
      status: order.status,
    });
  }
}

// 6. Notification Service (no duplicate)
class OrderNotifier {
  constructor(
    private email: EmailService,
    private logger: Logger
  ) {}

  notify(order: Order): void {
    this.email.send(order.customer.email, `Order ${order.id} processed`);
    this.logger.log(`Order ${order.id} processed`);
  }
}

// 7. Clean facade (no long method)
class OrderService {
  constructor(
    private validator: OrderValidator,
    private priceCalc: PriceCalculator,
    private discountCalc: DiscountCalculator,
    private taxCalc: TaxCalculator,
    private repository: OrderRepository,
    private notifier: OrderNotifier
  ) {}

  process(order: Order): ProcessedOrder {
    // Validate
    this.validator.validate(order);

    // Calculate
    const total = this.calculateTotal(order);
    const discount = this.discountCalc.calculate(order.customer, total);
    const tax = this.taxCalc.calculate(order.customer, total);
    const finalTotal = total - discount + tax;

    // Save & Notify
    const processed = new ProcessedOrder(order, total, discount, tax, finalTotal);
    this.repository.save(processed);
    this.notifier.notify(processed);

    return processed;
  }

  private calculateTotal(order: Order): number {
    return order.items.reduce(
      (sum, item) => sum + this.priceCalc.calculate(item) * item.quantity,
      0
    );
  }
}
```

**Résumé des améliorations :**

- **Large Class →** Classes spécialisées (Validator, Calculator, Repository, Notifier).
    
- **Long Method →** Méthodes courtes et focalisées.
    
- **Switch →** Strategy pattern (Map de taux).
    
- **Duplicate Code →** Centralisé dans les services.
    
- **Primitive Obsession →** Value Objects (OrderId, Customer, Email).
    
- **Data Class →** Comportement ajouté.
    

---

## 12. VÉRIFICATION FINALE (Definition of Done)

Après avoir identifié et corrigé les code smells :

- [ ] Aucun Long Method > 20 lignes.
    
- [ ] Aucune Large Class > 200 lignes.
    
- [ ] Pas de Primitive Obsession.
    
- [ ] Pas de Switch Statements basés sur des types (polymorphisme ou Map utilisés).
    
- [ ] Pas de Feature Envy.
    
- [ ] Pas de Data Classes sans comportement.
    
- [ ] Pas de Shotgun Surgery (logique centralisée).
    
- [ ] Pas de Duplicate Code.
    
- [ ] Pas de Dead Code.
    
- [ ] Tous les tests passent.
    
- [ ] Le code est plus facile à modifier.
    
- [ ] Les smells avancés (Message Chains, Inappropriate Intimacy, etc.) ont été vérifiés.