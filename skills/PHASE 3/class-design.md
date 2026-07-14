
````markdown
# class-design

## 1. OBJECTIF DU SKILL

**Pourquoi ce skill existe ?**
Les classes sont les unités d'organisation principales de la plupart des langages modernes. Une classe bien conçue est cohérente, faiblement couplée, a une seule responsabilité, et expose une interface claire. Ce skill fournit les principes SOLID (particulièrement SRP, OCP, LSP, ISP, DIP) et les heuristiques pour concevoir des classes qui sont faciles à comprendre, à tester, et à maintenir.

**Quel problème résout-il ?**
- Les classes qui font trop de choses (monolithes) sont impossibles à maintenir.
- Les classes trop couplées créent des effets de bord en cascade.
- Les classes qui ne respectent pas le LSP créent des bugs subtils.
- Les classes avec des interfaces larges forcent des dépendances inutiles.
- Les classes qui dépendent de détails concrets sont rigides.

**Dans quel contexte l'utiliser ?**
- Conception de nouvelles classes.
- Refactorisation de classes existantes.
- Revue de code pour évaluer la qualité des classes.
- Découpage de classes trop grandes.
- Application des principes SOLID.

---

## 2. PRÉREQUIS

**Ce qui doit être déjà fait :**
- ✅ Les besoins fonctionnels sont spécifiés (Phase 1).
- ✅ L'architecture générale est définie (Phase 2).
- ✅ Les conventions de nommage sont établies (naming-conventions-v2).
- ✅ Les fonctions sont bien conçues (function-design-v2).

**Quels documents sont nécessaires :**
- Spécifications des classes (responsabilités, interfaces).
- Diagramme d'architecture (architecture.md).
- Contrats d'API (api-and-interface-design-v2).

**Quelles informations doivent être disponibles :**
- Les dépendances entre classes.
- Les besoins de testabilité.
- Les contraintes de performance (si applicables).

---

## 3. RÔLES ET RESPONSABILITÉS

| Rôle | Responsabilités |
|------|-----------------|
| **Développeur (IA/Humain)** | - Conçoit des classes avec une seule responsabilité (SRP).<br>- Applique le Dependency Inversion Principle (DIP).<br>- Utilise l'héritage conformément au LSP.<br>- Sépare les interfaces (ISP).<br>- Garde les classes ouvertes à l'extension (OCP). |
| **Réviseur (Code Review)** | - Vérifie le SRP (une seule raison de changer).<br>- Vérifie le couplage (Law of Demeter).<br>- Vérifie la cohésion (tous les éléments liés).<br>- Vérifie l'absence de "feature envy". |
| **Architecte Technique** | - Définit les interfaces abstraites.<br>- Identifie les axes de changement.<br>- Applique les principes de composants (REP, CCP, CRP).<br>- Décide quand une classe mérite son propre fichier/module. |

---

## 4. PROCESSUS DÉTAILLÉ (Étape par Étape)

### Étape 1 : Single Responsibility Principle (SRP)

**Objectif :** Une classe doit avoir une seule raison de changer.

**Règle :** Une classe doit être responsable d'un seul acteur (groupe d'utilisateurs ou de stakeholders).

```typescript
// ❌ SRP violé - trois acteurs différents
class Employee {
  // Acteur 1 : CFO (calcul de paie)
  calculatePay(): number { ... }

  // Acteur 2 : COO (reporting des heures)
  reportHours(): string { ... }

  // Acteur 3 : CTO (persistance)
  save(): void { ... }
}

// ✅ SRP respecté - séparation des responsabilités
class EmployeeData {
  // Données partagées (simple structure)
  name: string;
  hoursWorked: number;
  hourlyRate: number;
}

class PayCalculator {
  calculatePay(employee: EmployeeData): number { ... }
}

class HourReporter {
  reportHours(employee: EmployeeData): string { ... }
}

class EmployeeSaver {
  save(employee: EmployeeData): void { ... }
}

// ✅ Ou avec façade pour simplifier l'utilisation
class EmployeeFacade {
  private data: EmployeeData;
  private payCalculator: PayCalculator;
  private hourReporter: HourReporter;
  private employeeSaver: EmployeeSaver;

  calculatePay(): number {
    return this.payCalculator.calculatePay(this.data);
  }
  // etc.
}
````

**Signes de violation du SRP :**

- La classe a plusieurs méthodes qui semblent liées à des domaines différents.
    
- Changer une fonctionnalité oblige à modifier la classe pour des raisons différentes.
    
- La classe a plusieurs "acteurs" (CFO, COO, CTO, etc.).
    

**Questions à poser :**

- Combien d'acteurs différents cette classe sert-elle ?
    
- Y a-t-il plusieurs raisons de changer cette classe ?
    
- Peut-on séparer les responsabilités en plusieurs classes ?
    

**Critères de validation :**

- La classe a une seule raison de changer.
    
- La classe sert un seul acteur.
    
- Les responsabilités sont clairement séparées.
    

---

### Étape 2 : Open-Closed Principle (OCP)

**Objectif :** Une classe doit être ouverte à l'extension mais fermée à la modification.

**Règle :** On doit pouvoir ajouter de nouvelles fonctionnalités sans modifier le code existant.

TypeScript

```typescript
// ❌ OCP violé - modification nécessaire pour chaque nouveau type
class Shape {
  type: 'circle' | 'square' | 'triangle';
  // ... autres propriétés
}

class AreaCalculator {
  calculateArea(shape: Shape): number {
    switch (shape.type) {
      case 'circle': return Math.PI * shape.radius * shape.radius;
      case 'square': return shape.side * shape.side;
      case 'triangle': return 0.5 * shape.base * shape.height;
      // Ajouter triangle = modifier la classe
    }
  }
}

// ✅ OCP respecté - polymorphisme
interface Shape {
  area(): number;
}

class Circle implements Shape {
  constructor(private radius: number) {}
  area(): number {
    return Math.PI * this.radius * this.radius;
  }
}

class Square implements Shape {
  constructor(private side: number) {}
  area(): number {
    return this.side * this.side;
  }
}

class Triangle implements Shape {
  constructor(private base: number, private height: number) {}
  area(): number {
    return 0.5 * this.base * this.height;
  }
}

class AreaCalculator {
  calculateArea(shapes: Shape[]): number {
    return shapes.reduce((sum, shape) => sum + shape.area(), 0);
  }
}
```

**Questions à poser :**

- L'ajout d'une nouvelle fonctionnalité nécessite-t-il de modifier des classes existantes ?
    
- Les extensions sont-elles faites par polymorphisme ou par conditionnelles ?
    
- Les classes sont-elles "fermées" aux modifications mais "ouvertes" à l'extension ?
    

**Critères de validation :**

- Les nouvelles fonctionnalités s'ajoutent sans modifier le code existant.
    
- Les switch/if basés sur des types sont évités (polymorphisme).
    
- Les classes sont extensibles via héritage ou interfaces.
    

---

### Étape 3 : Liskov Substitution Principle (LSP)

**Objectif :** Les sous-classes doivent pouvoir remplacer leur classe de base sans modifier le comportement du programme.

**Règle :** Si S est une sous-classe de T, alors les objets de type T peuvent être remplacés par des objets de type S sans altérer les propriétés du programme.

TypeScript

```typescript
// ❌ LSP violé - Square n'est pas substituable à Rectangle
class Rectangle {
  constructor(protected width: number, protected height: number) {}

  setWidth(width: number): void { this.width = width; }
  setHeight(height: number): void { this.height = height; }
  area(): number { return this.width * this.height; }
}

class Square extends Rectangle {
  setWidth(width: number): void {
    super.setWidth(width);
    super.setHeight(width);
  }
  setHeight(height: number): void {
    super.setHeight(height);
    super.setWidth(height);
  }
}

// Utilisation - problème
function resizeRectangle(rect: Rectangle): void {
  rect.setWidth(5);
  rect.setHeight(10);
  // Pour un Rectangle : area = 50
  // Pour un Square : area = 100 (parce que setHeight a modifié width aussi)
}

// ✅ LSP respecté - pas de substitution problématique
interface Shape {
  area(): number;
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}
  area(): number { return this.width * this.height; }
}

class Square implements Shape {
  constructor(private side: number) {}
  area(): number { return this.side * this.side; }
}
```

**Signes de violation du LSP :**

- Une sous-classe modifie le comportement attendu de la classe de base.
    
- Des `if (instanceof Subclass)` apparaissent dans le code.
    
- La sous-classe ne supporte pas toutes les méthodes de la classe de base.
    

**Questions à poser :**

- Cette sous-classe peut-elle remplacer sa classe de base partout ?
    
- Y a-t-il des `if (instanceof)` qui traitent différemment la sous-classe ?
    
- La sous-classe respecte-t-elle le contrat de la classe de base ?
    

**Critères de validation :**

- Les sous-classes sont substituables à leur classe de base.
    
- Aucun `if (instanceof)` pour traiter différemment les sous-classes.
    
- Les contrats des classes de base sont respectés.
    

---

### Étape 4 : Interface Segregation Principle (ISP)

**Objectif :** Les clients ne doivent pas être forcés de dépendre d'interfaces qu'ils n'utilisent pas.

**Règle :** Des interfaces spécifiques sont préférables à une interface générale.

TypeScript

```typescript
// ❌ Interface trop large - ISP violé
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  takeBreak(): void;
}

class HumanWorker implements Worker {
  work(): void { /* ... */ }
  eat(): void { /* ... */ }
  sleep(): void { /* ... */ }
  takeBreak(): void { /* ... */ }
}

class RobotWorker implements Worker {
  work(): void { /* ... */ }
  eat(): void { /* Impossible */ }
  sleep(): void { /* Impossible */ }
  takeBreak(): void { /* Impossible */ }
}

// ✅ Interfaces séparées - ISP respecté
interface Workable {
  work(): void;
}

interface Eatable {
  eat(): void;
}

interface Sleepable {
  sleep(): void;
}

interface Breakable {
  takeBreak(): void;
}

class HumanWorker implements Workable, Eatable, Sleepable, Breakable {
  work(): void { /* ... */ }
  eat(): void { /* ... */ }
  sleep(): void { /* ... */ }
  takeBreak(): void { /* ... */ }
}

class RobotWorker implements Workable {
  work(): void { /* ... */ }
}
```

**Signes de violation de l'ISP :**

- Des méthodes qui lancent UnsupportedOperationException.
    
- Des méthodes qui ne font rien (implémentations vides).
    
- Des clients qui n'utilisent qu'une partie des méthodes d'une interface.
    

**Questions à poser :**

- Y a-t-il des méthodes inutilisées dans cette interface ?
    
- Des clients sont-ils forcés d'implémenter des méthodes qu'ils n'utilisent pas ?
    
- Puis-je séparer cette interface en plusieurs interfaces plus spécifiques ?
    

**Critères de validation :**

- Les interfaces sont spécifiques aux besoins des clients.
    
- Pas de méthodes inutilisées ou impossibles à implémenter.
    
- Les clients dépendent seulement des interfaces qu'ils utilisent.
    

---

### Étape 5 : Dependency Inversion Principle (DIP)

**Objectif :** Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau. Les deux doivent dépendre des abstractions.

**Règle :** Les dépendances doivent pointer vers les abstractions, pas vers les concrétions.

TypeScript

```typescript
// ❌ DIP violé - High-level dépend de Low-level
class EmailService {
  send(email: string, message: string): void { /* ... */ }
}

class SMSService {
  send(phone: string, message: string): void { /* ... */ }
}

class NotificationService {
  private email: EmailService;
  private sms: SMSService;

  constructor() {
    this.email = new EmailService(); // Dépendance concrète
    this.sms = new SMSService();     // Dépendance concrète
  }

  notify(user: User, message: string): void {
    this.email.send(user.email, message);
    this.sms.send(user.phone, message);
  }
}

// ✅ DIP respecté - Dépendances vers les abstractions
interface MessageSender {
  send(recipient: string, message: string): void;
  getRecipient(user: User): string; // Chaque implémentation sait comment extraire son recipient
}

class EmailService implements MessageSender {
  getRecipient(user: User): string { return user.email; }
  send(email: string, message: string): void { /* ... */ }
}

class SMSService implements MessageSender {
  getRecipient(user: User): string { return user.phone; }
  send(phone: string, message: string): void { /* ... */ }
}

class NotificationService {
  private senders: MessageSender[]; // Dépendance vers l'abstraction

  constructor(senders: MessageSender[]) { // Injection de dépendance
    this.senders = senders;
  }

  notify(user: User, message: string): void {
    for (const sender of this.senders) {
      const recipient = sender.getRecipient(user); // Pas de instanceof !
      sender.send(recipient, message);
    }
  }
}
```

**Patterns pour le DIP :**

**Injection de dépendances (DI) :**

TypeScript

```typescript
class OrderService {
  constructor(
    private database: Database,
    private cache: Cache,
    private logger: Logger
  ) {}
}
```

**Abstract Factory :**

TypeScript

```typescript
interface ServiceFactory {
  createDatabase(): Database;
  createCache(): Cache;
  createLogger(): Logger;
}

class ProductionFactory implements ServiceFactory { /* ... */ }
class TestFactory implements ServiceFactory { /* ... */ }
```

**Dependency Injection Container :**

TypeScript

```typescript
// Utilisation d'un conteneur (ex: Inversify, Awilix)
const container = new Container();
container.register('database', Database);
container.register('cache', Cache);
container.register('orderService', OrderService);
```

**Questions à poser :**

- Les classes de haut niveau dépendent-elles de classes de bas niveau ?
    
- Les dépendances sont-elles vers des abstractions (interfaces) ?
    
- Les dépendances sont-elles injectées (pas de `new` dans la classe) ?
    

**Critères de validation :**

- Les dépendances pointent vers les abstractions.
    
- Les classes utilisent l'injection de dépendances.
    
- Pas de `new` pour les dépendances importantes.
    
- Les abstractions sont séparées des implémentations.
    
- **Aucun `instanceof` pour différencier les implémentations concrètes.**
    

---

### Étape 6 : Cohésion et Couplage

**Objectif :** Maximiser la cohésion (éléments liés) et minimiser le couplage (dépendances).

**Cohésion élevée :** Tous les éléments d'une classe sont fortement liés entre eux.

TypeScript

```typescript
// ❌ Cohésion faible - éléments non liés
class Utility {
  static formatDate(date: Date): string { /* ... */ }
  static calculateDistance(x1: number, y1: number, x2: number, y2: number): number { /* ... */ }
  static validateEmail(email: string): boolean { /* ... */ }
  static randomInt(max: number): number { /* ... */ }
}

// ✅ Cohésion élevée - éléments liés
class DateFormatter {
  format(date: Date): string { /* ... */ }
}

class DistanceCalculator {
  calculate(x1: number, y1: number, x2: number, y2: number): number { /* ... */ }
}

class EmailValidator {
  isValid(email: string): boolean { /* ... */ }
}

class RandomGenerator {
  nextInt(max: number): number { /* ... */ }
}
```

**Couplage faible :** Les classes dépendent peu les unes des autres.

TypeScript

```typescript
// ❌ Couplage fort - dépendances nombreuses
class OrderService {
  constructor(
    private database: Database,
    private cache: Cache,
    private logger: Logger,
    private emailService: EmailService,
    private notificationService: NotificationService,
    private paymentService: PaymentService,
    private shippingService: ShippingService,
    private inventoryService: InventoryService
  ) {}
}

// ✅ Couplage faible - dépendances minimales
class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private paymentProcessor: PaymentProcessor
  ) {}
  // Les autres dépendances sont gérées par les services délégués
}
```

**La Loi de Déméter (Law of Demeter) :**

TypeScript

```typescript
// ❌ Violation de Déméter - traversée d'objets
class OrderService {
  process(order: Order): void {
    const customer = order.customer;
    const address = customer.address;
    const country = address.country;
    // ...
  }
}

// ✅ Respect de Déméter - délégation
class OrderService {
  process(order: Order): void {
    const country = order.getCustomerCountry();
    // ...
  }
}
```

**Questions à poser :**

- Les éléments de cette classe sont-ils tous liés ?
    
- La classe a-t-elle trop de dépendances ?
    
- Y a-t-il des violations de la Loi de Déméter ?
    

**Critères de validation :**

- La cohésion est élevée (éléments liés).
    
- Le couplage est faible (peu de dépendances).
    
- La Loi de Déméter est respectée.
    
- Pas de "feature envy" (méthode qui utilise beaucoup une autre classe).
    

---

### Étape 7 : Objects vs Data Structures

**Objectif :** Distinguer les objets (comportement) des structures de données (données exposées).

Table

||Objets|Structures de données|
|:--|:--|:--|
|**Données**|Cachées|Exposées|
|**Comportement**|Exposé|Caché (ou absent)|
|**Nouveaux types**|Faciles à ajouter|Difficiles à ajouter|
|**Nouvelles fonctions**|Difficiles à ajouter|Faciles à ajouter|

TypeScript

```typescript
// ❌ Mélange - objet avec données exposées
class Point {
  public x: number; // Donnée exposée
  public y: number; // Donnée exposée

  distanceTo(other: Point): number { // Comportement
    return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
  }
}

// ✅ Objet - données cachées, comportement exposé
interface Point {
  getX(): number;
  getY(): number;
  distanceTo(other: Point): number;
}

// ✅ Structure de données - données exposées, pas de comportement
interface PointData {
  x: number;
  y: number;
}

// ✅ DTO (Data Transfer Object) - structure de données légitime
// Utilisé pour transférer des données entre couches ou processus
interface UserDTO {
  id: string;
  name: string;
  email: string;
}
// Règle : un DTO ne contient que des données, jamais de comportement métier.
```

**Antisymétrie Objet/Structure :**

plain

```plain
Procédural (données + fonctions séparées) :
  - Ajouter une fonction = facile
  - Ajouter un type = difficile

OO (données + fonctions ensemble) :
  - Ajouter un type = facile
  - Ajouter une fonction = difficile
```

**Questions à poser :**

- Cette classe est-elle un objet (comportement) ou une structure de données ?
    
- Les données sont-elles cachées ou exposées ?
    
- Est-ce que j'ajoute souvent des types ou des fonctions ?
    
- S'agit-il d'un DTO ? Si oui, assurez-vous qu'il n'y a aucun comportement.
    

**Critères de validation :**

- Les objets cachent leurs données.
    
- Les structures de données exposent leurs données.
    
- Le choix entre objet et structure est intentionnel.
    
- Les DTOs ne contiennent que des données, pas de logique métier.
    

---

### Étape 8 : Classes "propres" - Organisation et Fichiers

**Objectif :** Organiser les classes de manière à être facilement lisibles et navigables, et décider quand une classe mérite son propre fichier.

**Organisation recommandée :**

TypeScript

```typescript
class MyClass {
  // 1. Constantes publiques
  public static readonly MAX_SIZE = 100;

  // 2. Variables d'instance privées
  private state: State;
  private dependencies: Dependency[];

  // 3. Constructeur
  constructor(dependencies: Dependency[]) {
    this.dependencies = dependencies;
    this.state = new State();
  }

  // 4. Méthodes publiques (les plus importantes d'abord)
  public doSomething(): void {
    // ...
  }

  public getSomething(): Something {
    // ...
  }

  // 5. Méthodes privées (dans l'ordre d'appel)
  private validate(): void {
    // ...
  }

  private process(): void {
    // ...
  }

  // 6. Classes internes (si nécessaires)
  private class Helper {
    // ...
  }
}
```

**Classes et Modules versus Fichiers :**

- **Une classe = un fichier ?** Dans la plupart des langages OO (Java, C#, TypeScript), oui. Cela simplifie la navigation et la recherche.
    
- **Exception :** Les classes internes privées (helpers) peuvent rester dans le même fichier que la classe qui les utilise.
    
- **Taille de fichier :** Si un fichier dépasse 200-300 lignes, envisager de le diviser. Si une classe dépasse 200 lignes, elle fait probablement trop de choses (SRP violé).
    
- **Modules :** Un module regroupe des classes cohérentes. Par exemple, un module `order-processing` peut contenir `Order`, `OrderValidator`, `OrderCalculator` — mais chacune dans son propre fichier.
    

**Questions à poser :**

- La classe est-elle bien organisée (constantes → variables → constructeur → méthodes publiques → privées) ?
    
- Les méthodes sont-elles dans l'ordre d'appel (Stepdown Rule) ?
    
- Cette classe mérite-t-elle son propre fichier ?
    
- Le fichier fait-il moins de 200-300 lignes ?
    

**Critères de validation :**

- La classe suit une organisation cohérente.
    
- Les méthodes suivent le Stepdown Rule.
    
- Les sections sont clairement délimitées.
    
- Une classe = un fichier (sauf classes internes).
    
- La taille du fichier reste raisonnable (< 300 lignes).
    

---

### Étape 9 : Component Principles (Principes de Composants)

**Objectif :** Organiser les classes en composants réutilisables et maintenables.

**Règle :** Les classes qui changent ensemble doivent être regroupées ; les classes qui ne sont pas réutilisées ensemble ne doivent pas être forcées de l'être.

**REP — Reuse/Release Equivalence Principle :**

- Ce qui est réutilisé ensemble doit être publié (versionné) ensemble.
    
- Si une classe est réutilisée indépendamment des autres, elle mérite son propre composant.
    

**CCP — Common Closure Principle :**

- Un composant ne doit changer que pour une seule raison.
    
- Si un changement de requirement affecte toujours les mêmes 3 classes, elles devraient être dans le même composant.
    
- C'est le SRP appliqué au niveau composant.
    

**CRP — Common Reuse Principle :**

- Les classes qui ne sont pas réutilisées ensemble ne devraient pas être dans le même composant.
    
- Si un composant A dépend de B, mais n'utilise que 10% des classes de B, B devrait être scindé.
    

**Tension entre les principes :**

- CCP et REP sont en tension : CCP veut regrouper (pour la maintenance), REP veut séparer (pour la réutilisation).
    
- Un projet mature évolue généralement du CCP (maintenabilité) vers le REP (réutilisabilité).
    

**Questions à poser :**

- Si je change cette classe, combien d'autres classes du même composant doivent changer ?
    
- Un utilisateur de ce composant est-il forcé de dépendre de classes qu'il n'utilise pas ?
    
- Ce composant a-t-il une seule raison de changer ?
    

**Critères de validation :**

- Les classes d'un composant changent ensemble (CCP).
    
- Les classes d'un composant sont réutilisées ensemble (CRP).
    
- Le composant est publié comme une unité cohérente (REP).
    

---

## 5. ANTI-PATTERNS DE CLASSES (À ÉVITER)

Table

|Anti-pattern|Problème|Solution|
|:--|:--|:--|
|**God Class**|Une classe qui fait tout|SRP - Séparer|
|**Feature Envy**|Méthode qui utilise beaucoup une autre classe|Déplacer la méthode|
|**Primitive Obsession**|Utiliser des primitives pour des concepts complexes|Créer des classes|
|**Switch Statements**|Switch basé sur des types|Polymorphisme|
|**Data Class**|Classe sans comportement|Ajouter comportement ou DTO|
|**Shotgun Surgery**|Un changement nécessite de modifier plusieurs classes|Réorganiser|
|**Lazy Class**|Classe qui ne fait rien|Fusionner|
|**Inappropriate Intimacy**|Deux classes trop dépendantes|Découpler|

---

## 6. RATIONALISATIONS COURANTES (À ÉVITER)

Table

|Rationalisation|Réalité|
|:--|:--|
|"C'est plus simple de tout mettre dans une classe"|Plus facile à écrire, plus difficile à maintenir.|
|"Je séparerai plus tard"|Plus tard = jamais.|
|"La classe fait plusieurs choses mais c'est lié"|Si ce n'est pas le même acteur, séparez.|
|"J'utilise switch parce que c'est plus simple"|Le polymorphisme est plus extensible.|
|"La classe a juste besoin de ces données"|Si c'est juste des données, c'est une structure (ou un DTO).|

---

## 7. RED FLAGS (Signaux d'alarme)

Table

|Signe|Problème|Solution|
|:--|:--|:--|
|Classe > 200 lignes|Trop grande|Séparer|
|Plusieurs raisons de changer|SRP violé|Séparer|
|Switch/if basé sur un type|OCP violé|Polymorphisme|
|`if (instanceof)`|LSP violé|Revoir l'héritage|
|Dépendances nombreuses|Couplage fort|Réduire|
|Méthodes qui n'utilisent que peu de variables|Cohésion faible|Réorganiser|
|Feature envy|Mauvaise répartition|Déplacer|

---

## 8. LIVRABLES ATTENDUS

Pour une conception de classe complétée :

Table

|Document|Description|
|:--|:--|
|**Classes**|Code avec classes bien conçues (SRP, OCP, LSP, ISP, DIP).|
|**Interfaces**|Abstractions pour les dépendances.|
|**Tests unitaires**|Tests pour chaque classe.|
|**Diagramme de classes**|UML ou équivalent.|

---

## 9. LIENS AVEC LES AUTRES PHASES

**Input (ce qui vient d'avant - Phase 2)**

- architectural-patterns → Structure générale.
    
- api-and-interface-design-v2 → Interfaces publiques.
    
- data-modeling → Structures de données.
    

**Output (ce qui est transmis - Phase 4)**

- Classes testables → Facilite les tests unitaires.
    
- Classes découplées → Facilite le débogage.
    

**Dépendances internes**

- function-design-v2 : Méthodes des classes.
    
- error-handling-v2 : Gestion des erreurs dans les classes.
    
- naming-conventions-v2 : Noms des classes.
    

---

## 10. RESSOURCES UTILISÉES

- **Livre :** Clean Code, 2nd Edition (Robert C. Martin)
    
    - Chapter 12 : "Objects and Data Structures" — Opposition objet/structure.
        
    - Chapter 13 : "Clean Classes" — Organisation des classes, Classes vs Modules.
        
    - Chapter 19 : "The SOLID Principles" — SRP, OCP, LSP, ISP, DIP.
        
    - Chapter 20 : "Component Principles" — REP, CCP, CRP.
        
- **Skills Osmani :** Aucun équivalent direct (nouveau skill).
    
- **Autres références :**
    
    - Law of Demeter.
        
    - Design Patterns (GOF).
        

---

## 11. EXEMPLE COMPLET D'APPLICATION

**Contexte :** Système de gestion de commandes avec classes bien conçues

**Avant (God Class) :**

TypeScript

```typescript
class OrderSystem {
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

  // Logging
  logOrder(order: Order): void { /* ... */ }
  logError(error: Error): void { /* ... */ }

  // Cache
  cacheOrder(order: Order): void { /* ... */ }
  getCachedOrder(id: string): Order | null { /* ... */ }
}
```

**Après (classes séparées) :**

TypeScript

```typescript
// 1. Data Structure / DTO
interface Order {
  id: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
}

// 2. Validation (SRP)
class OrderValidator {
  validate(order: Order): void {
    if (!order.customer) throw new ValidationError('Customer required');
    if (!order.items || order.items.length === 0) {
      throw new ValidationError('At least one item required');
    }
  }
}

// 3. Calcul (SRP)
class OrderCalculator {
  calculateTotal(items: OrderItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
  calculateTax(total: number): number {
    return total * 0.2;
  }
  calculateDiscount(customer: Customer, total: number): number {
    return customer.isPremium ? total * 0.1 : 0;
  }
  calculateGrandTotal(order: Order): number {
    const total = this.calculateTotal(order.items);
    const discount = this.calculateDiscount(order.customer, total);
    const tax = this.calculateTax(total - discount);
    return total - discount + tax;
  }
}

// 4. Persistance (SRP) - Abstraction pour DIP
interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
}

// 5. Email (SRP) - Abstraction pour DIP
interface NotificationService {
  sendConfirmation(order: Order): Promise<void>;
}

// 6. Logging (SRP) - Abstraction pour DIP
interface Logger {
  logOrder(order: Order): void;
  logError(error: Error): void;
}

// 7. Cache (SRP) - Abstraction pour DIP
interface CacheService {
  cacheOrder(order: Order): void;
  getCachedOrder(id: string): Order | null;
}

// 8. Orchestration (Façade) - DIP via injection
class OrderFacade {
  constructor(
    private validator: OrderValidator,
    private calculator: OrderCalculator,
    private repository: OrderRepository,
    private notifications: NotificationService,
    private logger: Logger,
    private cache: CacheService
  ) {}

  async processOrder(order: Order): Promise<void> {
    try {
      // Validation
      this.validator.validate(order);

      // Calcul
      order.total = this.calculator.calculateGrandTotal(order);

      // Sauvegarde
      await this.repository.save(order);
      this.cache.cacheOrder(order);

      // Notification
      await this.notifications.sendConfirmation(order);

      // Logging
      this.logger.logOrder(order);
    } catch (e) {
      this.logger.logError(e);
      throw e;
    }
  }
}
```

**Résumé des améliorations :**

- **SRP :** Chaque classe a une seule responsabilité.
    
- **OCP :** On peut ajouter des validateurs sans modifier l'OrderFacade.
    
- **LSP :** Les interfaces permettent différentes implémentations.
    
- **ISP :** Les interfaces sont spécifiques.
    
- **DIP :** Les dépendances sont vers les abstractions.
    
- **Cohésion :** Chaque classe est fortement cohérente.
    
- **Couplage :** Les classes sont faiblement couplées.
    

---

## 12. VÉRIFICATION FINALE (Definition of Done)

Après avoir conçu ou refactoré des classes :

- [ ] Chaque classe a une seule raison de changer (SRP).
    
- [ ] Les classes sont ouvertes à l'extension (OCP).
    
- [ ] Les sous-classes sont substituables (LSP).
    
- [ ] Les interfaces sont spécifiques (ISP).
    
- [ ] Les dépendances sont vers les abstractions (DIP).
    
- [ ] La cohésion est élevée.
    
- [ ] Le couplage est faible.
    
- [ ] La Loi de Déméter est respectée.
    
- [ ] Les objets cachent leurs données.
    
- [ ] Les structures de données exposent leurs données (et les DTOs n'ont pas de comportement).
    
- [ ] Les classes sont organisées de manière lisible.
    
- [ ] Chaque classe est dans son propre fichier (sauf classes internes).
    
- [ ] Les composants respectent REP, CCP et CRP.