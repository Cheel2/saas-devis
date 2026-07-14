

````markdown
name: naming-conventions
description: Provides systematic rules for choosing names that communicate intention clearly. Use when naming variables, functions, classes, files, or directories. Use when renaming unclear names, establishing naming conventions, or reviewing code for naming quality.
---

# Naming Conventions

## 1. OBJECTIF DU SKILL

**Pourquoi ce skill existe ?**
Les noms sont partout dans le code : variables, fonctions, classes, fichiers, dossiers. Un bon nom révèle l'intention, un mauvais nom cache la signification. Ce skill fournit des règles systématiques pour choisir des noms qui communiquent clairement l'intention, qui sont prononçables, recherchables, et qui s'intègrent dans un système de noms cohérent.

**Quel problème résout-il ?**
- Les noms vagues ou trompeurs (`d`, `list1`, `data`) ralentissent la compréhension.
- Les noms non prononçables (`genymdhms`) empêchent la discussion.
- Les noms inconsistants ("amount" ici, "price" ailleurs) créent de la confusion.
- Les noms encodés (`m_`, `I`, Hungarian) ajoutent du bruit inutile.
- Les noms "cute" ou culturellement dépendants (`HolyHandGrenade`, `eatMyShorts`) obscurcissent l'intention.
- Le "mental mapping" force le lecteur à traduire mentalement (`r` pour URL).

**Dans quel contexte l'utiliser ?**
- Choix de noms pour toute nouvelle variable, fonction, classe, ou fichier.
- Renommage de noms existants qui ne sont pas clairs.
- Revue de code pour vérifier la qualité des noms.
- Établissement de conventions de nommage pour un projet.

---

## 2. PRÉREQUIS

**Ce qui doit être déjà fait :**
- ✅ Le langage et ses conventions de nommage (CamelCase, snake_case, etc.) sont connus.
- ✅ Les standards de codage du projet sont définis.
- ✅ Le domaine métier (Ubiquitous Language) est identifié.

**Quels documents sont nécessaires :**
- Standards de codage du projet.
- Glossaire du domaine métier.
- Noms existants dans le codebase (pour la cohérence).

**Quelles informations doivent être disponibles :**
- Les conventions du langage (ex: Java → camelCase pour les méthodes, PascalCase pour les classes).
- Les termes métier à utiliser (ex: "Client" vs "Customer").
- Les termes techniques à utiliser (ex: "Repository" vs "DAO").

---

## 3. RÔLES ET RESPONSABILITÉS

| Rôle | Responsabilités |
|------|-----------------|
| Développeur (IA/Humain) | Choisit des noms intention-révélateurs. Vérifie la cohérence avec le codebase existant. Renomme les noms qui ne sont pas clairs. Documente les choix de nommage importants. |
| Réviseur (Code Review) | Vérifie que les noms révèlent l'intention. Signale les noms vagues, trompeurs, ou inconsistants. Vérifie la prononçabilité et la recherchabilité. |
| Architecte Technique | Définit les conventions de nommage du projet. Maintient le glossaire des termes métier et techniques. Harmonise les noms à travers le codebase. |

---

## 4. PROCESSUS DÉTAILLÉ (Étape par Étape)

### Étape 1 : Utiliser des noms intention-révélateurs

**Objectif :** Le nom doit répondre aux questions : pourquoi existe-t-il ? que fait-il ? comment est-il utilisé ?

**Règle d'or :** Si un nom nécessite un commentaire pour communiquer son intention, le nom ne révèle pas son intention.

**Exemples :**
```typescript
// ❌ Mauvais : ne révèle rien
int d; // temps écoulé en jours

// ✅ Bon : révèle l'intention
int elapsedTimeInDays;
int daysSinceCreation;
int fileAgeInDays;
````

**Système de noms :** Construisez un système de noms cohérent qui communique des informations sur l'application :

TypeScript

```typescript
// Avant : noms vagues
public List<int[]> getThem() {
  List<int[]> list1 = new ArrayList<int[]>();
  for (int[] x : theList)
    if (x[0] == 4)
      list1.add(x);
  return list1;
}

// Après : noms intention-révélateurs
public List<Cell> getFlaggedCells() {
  List<Cell> flaggedCells = new ArrayList<Cell>();
  for (Cell cell : gameBoard)
    if (cell.isFlagged())
      flaggedCells.add(cell);
  return flaggedCells;
}
```

**Questions à poser :**

- Ce nom répond-il aux 3 questions (pourquoi, quoi, comment) ?
    
- Un nouveau venu comprendrait-il ce que fait ce code sans commentaire ?
    
- Ce nom est-il plus clair que le nom qu'il remplace ?
    

**Critères de validation :**

- Le nom révèle l'intention sans commentaire.
    
- Le nom est compréhensible par un nouveau venu.
    
- Le nom s'intègre dans un système de noms cohérent.
    

---

### Étape 2 : Éviter les désinformations

**Objectif :** Ne pas laisser de faux indices qui obscurcissent le sens du code.

**Règles :**

- Ne pas utiliser "List" si ce n'est pas une List.
    
- Éviter les noms qui varient subtilement.
    
- Éviter les illusions d'optique (lettres ambiguës).
    

**Exemples :**

TypeScript

```typescript
// ❌ Désinformant (ce n'est pas une List)
let accountList = {}; // C'est un objet

// ✅ Honnête
let accountGroup = {};
let accounts = {};

// ❌ Trop similaires, faciles à confondre
XYZControllerForEfficientHandlingOfStrings
XYZControllerForEfficientStorageOfStrings

// ✅ Noms distincts
StringHandlerController
StringStorageController

// ❌ Danger : l minuscule et O majuscule peuvent être confondus avec 1 et 0
int a = l;
if ( O == l )
  a = O1;

// ✅ Correct
int a = 1;
if (O == L)
  a = 01;
```

**Questions à poser :**

- Ce nom pourrait-il être confondu avec un autre ?
    
- Ce nom est-il honnête sur ce qu'il représente ?
    
- Y a-t-il des lettres ou chiffres qui pourraient être confondus ?
    

**Critères de validation :**

- Le nom ne laisse pas de faux indices.
    
- Le nom est distinct des autres noms similaires.
    
- Le nom n'utilise pas de lettres ambiguës (l, O, etc.).
    

---

### Étape 3 : Faire des distinctions significatives

**Objectif :** Ne pas utiliser de nombres ou de mots vides pour distinguer des noms.

**Règles :**

- Ne pas utiliser de séries numériques.
    
- Éviter les mots vides (Info, Data, Object).
    
- Ne pas faire de distinctions inutiles.
    

**Exemples :**

TypeScript

```typescript
// ❌ Série numérique (pas de sens)
function copyChars(char a1[], char a2[]) {
  for (int i = 0; i < a1.length; i++) {
    a2[i] = a1[i];
  }
}

// ✅ Noms significatifs
function copyChars(char source[], char destination[]) {
  for (int i = 0; i < source.length; i++) {
    destination[i] = source[i];
  }
}

// ❌ Mots vides
class ProductInfo {}
class ProductData {}
class CustomerObject {}

// ✅ Noms significatifs
class Product {}
class Customer {}

// ❌ Fonctions confuses
getActiveAccount();
getActiveAccounts();
getActiveAccountInfo();

// ✅ Noms distincts
getActiveAccount();        // Retourne le compte actif unique
getAllActiveAccounts();    // Retourne tous les comptes actifs
getActiveAccountDetails(); // Retourne les détails du compte actif
```

**Questions à poser :**

- Les noms sont-ils distincts de manière significative ?
    
- Y a-t-il des mots vides (Info, Data) que je peux supprimer ?
    
- Chaque nom a-t-il une signification unique ?
    

**Critères de validation :**

- Les noms distinctifs sont significatifs.
    
- Aucun mot vide (Info, Data, Object).
    
- Les fonctions ont des noms qui indiquent leur différence.
    

---

### Étape 4 : Utiliser des noms prononçables

**Objectif :** Les noms doivent pouvoir être prononcés pour faciliter la discussion.

**Exemples :**

TypeScript

```typescript
// ❌ Imprononçable
class DtaRcrd102 {
  private Date genymdhms;
  private Date modymdhms;
}

// ✅ Prononçable
class CustomerRecord {
  private Date generationTimestamp;
  private Date modificationTimestamp;
}
```

**Pourquoi c'est important :** Si vous ne pouvez pas le prononcer, vous ne pouvez pas en discuter facilement. "Hey, regarde ce record ! Le timestamp de génération est réglé sur demain !"

**Questions à poser :**

- Ce nom peut-il être prononcé facilement ?
    
- Un collègue pourrait-il le dire à voix haute sans hésiter ?
    
- Y a-t-il des acronymes ou abréviations que je pourrais développer ?
    

**Critères de validation :**

- Le nom est prononçable.
    
- Le nom utilise des mots complets (pas d'abréviations obscures).
    
- Le nom est facile à mentionner dans une conversation.
    

---

### Étape 5 : Utiliser des noms recherchables

**Objectif :** Les noms doivent pouvoir être trouvés facilement avec un outil de recherche.

**Règles :**

- Les constantes doivent être recherchables.
    
- Les noms courts sont pour les petits scopes.
    

**Exemples :**

TypeScript

```typescript
// ❌ Non recherchable (7)
for (int j=0; j<34; j++) {
  s += (t[j]*4)/5;
}

// ✅ Recherchable (constantes nommées)
const int WORK_DAYS_PER_WEEK = 5;
const int REAL_DAYS_PER_IDEAL_DAY = 4;
const int NUMBER_OF_TASKS = 34;

int sum = 0;
for (int j=0; j < NUMBER_OF_TASKS; j++) {
  int realTaskDays = taskEstimate[j] * REAL_DAYS_PER_IDEAL_DAY;
  int realTaskWeeks = (realTaskDays / WORK_DAYS_PER_WEEK);
  sum += realTaskWeeks;
}

// ✅ OK : n court (scope de 2 lignes)
for (int n=0; n<20; n++) {
  System.out.println("" + n + " " + n*n);
}

// ❌ Mauvaise idée : n en variable d'instance (scope large)
class Customer {
  private int n; // Que signifie n ?
}
```

**Règle de recherche :** Si une variable ou constante peut être vue/utilisée à plusieurs endroits, donnez-lui un nom recherchable.

**Questions à poser :**

- Ce nom peut-il être trouvé facilement avec grep ?
    
- Y a-t-il des nombres magiques qui devraient être des constantes nommées ?
    
- Le nom est-il trop court pour son scope ?
    

**Critères de validation :**

- Les constantes ont des noms recherchables.
    
- Les nombres magiques sont remplacés par des constantes nommées.
    
- Les noms courts sont utilisés uniquement dans des scopes restreints.
    

---

### Étape 6 : Adapter la longueur au scope

**Objectif :** La longueur d'un nom doit être proportionnelle à la taille de son scope.

**Règle pour les variables :** Plus le scope est large, plus le nom doit être long. **Règle inverse pour les fonctions et classes :** Plus le scope est large (global/public), plus le nom doit être court et général. Plus le scope est petit (privé/local), plus le nom peut être long et descriptif.

**Pourquoi la règle inverse ?** Une fonction globale est appelée fréquemment ; son nom doit être court et pratique (`open`). Une fonction privée est appelée rarement ; son nom peut être long et explicatif (`openFileAndThrowExceptionIfNotFound`).

**Tableau de référence :**

Table

|Élément|Règle|Exemple|
|:--|:--|:--|
|Variables locales|Courte (scope d'une fonction)|`count`, `i`, `result`|
|Arguments|Courte (scope d'une fonction)|`user`, `data`, `options`|
|Variables d'instance|Plus longue (scope d'une classe)|`userCount`, `dataStore`|
|Variables globales|Encore plus longue|`applicationUserCount`|
|Fonctions globales|Courte (appelées souvent, scope large)|`open()`, `save()`|
|Méthodes publiques|Moyenne (scope de la classe)|`calculateTotal()`|
|Méthodes privées|Plus longue (scope restreint)|`openFileAndLogError()`|
|Méthodes de test|Très longue (scope zéro)|`shouldReturnValidUserWhenLoginIsSuccessful()`|
|Classes globales|Courte (un mot ou deux)|`User`, `TaskRepository`|
|Classes dérivées / internes|Plus longue (scope restreint)|`PremiumUserDecorator`|

**Exemples :**

TypeScript

```typescript
// Variable : scope large → nom long
class UserSession {
  private authenticationToken: string;
}

// Fonction : scope global → nom court et pratique (convenient)
function open(filePath: string): File { ... }

// Fonction : scope privé → nom long et descriptif (descriptive)
private function openFileAndThrowExceptionIfNotFound(filePath: string): File { ... }

// Test : scope zéro → nom très long
it('shouldReturnValidUserWhenLoginIsSuccessfulWithValidCredentials', () => { ... });
```

**Questions à poser :**

- Le scope de ce nom est-il large ou restreint ?
    
- La longueur du nom est-elle adaptée à son scope ?
    
- Pour une fonction : ce nom est-il assez court pour être pratique si souvent appelé ? Assez long pour être descriptif si rarement appelé ?
    

**Critères de validation :**

- La longueur du nom est adaptée à son scope.
    
- Les noms de fonctions/classes globales sont courts.
    
- Les noms de fonctions/classes privées sont longs et descriptifs.
    

---

### Étape 7 : Éviter les encodages

**Objectif :** Ne pas encoder le type ou la portée dans le nom.

**Règles :**

- Pas de préfixes de type (Hungarian notation).
    
- Pas de préfixes de membre (`m_`).
    
- Pas de préfixe `I` pour les interfaces.
    

**Exemples :**

TypeScript

```typescript
// ❌ Hungarian notation
string strName;
int iCount;
bool bIsActive;

// ✅ Pas d'encodage
string name;
int count;
bool isActive;

// ❌ Préfixe m_
class Part {
  private String m_description;
}

// ✅ Pas de préfixe
class Part {
  private String description;
}

// ❌ Préfixe I
interface IShapeFactory { ... }
class ShapeFactory implements IShapeFactory { ... }

// ✅ Interface sans préfixe, implémentation suffixée
interface ShapeFactory { ... }
class ShapeFactoryImpl implements ShapeFactory { ... }
```

**Questions à poser :**

- Ce nom contient-il des informations de type ou de portée ?
    
- L'IDE ou le compilateur peut-il fournir ces informations à la place ?
    
- Le nom serait-il plus lisible sans l'encodage ?
    

**Critères de validation :**

- Aucun préfixe de type (Hungarian).
    
- Aucun préfixe de membre (`m_`).
    
- Les interfaces n'ont pas de préfixe `I`.
    
- Les implémentations peuvent avoir un suffixe (`Impl`).
    

---

### Étape 8 : Utiliser les bonnes parties du discours

**Objectif :** Les classes = noms, les méthodes = verbes.

**Tableau de référence :**

Table

|Élément|Partie du discours|Exemple|
|:--|:--|:--|
|Classes|Nom ou nom composé|`Customer`, `WikiPage`, `AddressParser`|
|Classes (instance)|Nom singulier|`Customer` (pas `Customers`)|
|Classes (collection)|Nom pluriel|`Customers` (collection de Customer)|
|Méthodes|Verbe ou verbe composé|`postPayment()`, `deletePage()`, `save()`|
|Accesseurs|`get` + nom|`getName()`, `getTotal()`|
|Mutateurs|`set` + nom|`setName()`, `setTotal()`|
|Prédicats|`is` + adjectif|`isValid()`, `isActive()`|
|Constructeurs|Nom de la classe|`new Customer()`|
|Factory methods|Nom descriptif|`Customer.fromJson()`, `Customer.fromDatabase()`|

**Exemples :**

TypeScript

```typescript
// ✅ Classes = noms
class Customer { ... }
class UserRepository { ... }
class PaymentProcessor { ... }

// ✅ Méthodes = verbes
paymentProcessor.processPayment();
userRepository.findUserById();
customer.setName("John");

// ✅ Accesseurs/Mutateurs/Prédicats
customer.getName();
customer.setName("John");
customer.isActive();

// ✅ Factory methods
let customer = Customer.fromJson(jsonData);
let user = User.createWithDefaults();
```

**Questions à poser :**

- Les classes ont-elles des noms (substantifs) ?
    
- Les méthodes ont-elles des verbes ?
    
- Les accesseurs/prédicats suivent-ils les conventions du langage (get, set, is) ?
    

**Critères de validation :**

- Les classes utilisent des noms.
    
- Les méthodes utilisent des verbes.
    
- Les accesseurs/prédicats suivent les conventions.
    
- Les factory methods sont des noms descriptifs.
    

---

### Étape 9 : Éviter les noms "cute" et le mental mapping

**Objectif :** Choisir la clarté sur l'originalité ou l'intelligence.

**Règles :**

- Ne pas utiliser de noms "cute" (marrants, culturellement dépendants, ou trop intelligents).
    
- Ne pas forcer le lecteur à faire du "mental mapping" (traduire mentalement un nom en un autre concept).
    

**Exemples de noms "cute" :**

TypeScript

```typescript
// ❌ Cute : mémorable seulement pour ceux qui partagent l'humour de l'auteur
function HolyHandGrenade() { ... } // Que fait cette fonction ? Supprimer ?
function whack() { ... }           // Veut dire "kill" ?
function eatMyShorts() { ... }     // Veut dire "abort" ?

// ✅ Clair
function deleteItems() { ... }
function kill() { ... }
function abort() { ... }
```

**Exemples de mental mapping :**

TypeScript

```typescript
// ❌ Mental mapping : le lecteur doit traduire "r" en "URL" mentalement
let r = "https://example.com"; // r pour URL ? Pourquoi pas "url" ?

// ❌ Mental mapping : i pour "index" dans un scope de 50 lignes
for (let i = 0; i < tasks.length; i++) {
  // ... 40 lignes de code ...
  process(tasks[i]);
  // Le lecteur a oublié que "i" signifie "index" ou "taskIndex"
}

// ✅ Pas de mental mapping
let url = "https://example.com";
for (let taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
  process(tasks[taskIndex]);
}
```

**Questions à poser :**

- Ce nom est-il un jeu de mots, une référence culturelle, ou une blague ?
    
- Un nouveau venu comprendrait-il ce nom sans explication ?
    
- Ce nom force-t-il le lecteur à traduire mentalement une lettre ou un mot en un autre concept ?
    

**Critères de validation :**

- Aucun nom "cute" ou culturellement dépendant.
    
- Aucun mental mapping (noms courts arbitraires dans des scopes larges).
    
- Le nom dit ce qu'il fait, sans couche d'interprétation.
    

---

### Étape 10 : Un seul mot par concept

**Objectif :** Utiliser le même mot pour le même concept dans tout le codebase.

**Règles :**

- Choisir un mot et le garder.
    
- Auditer les noms pour la cohérence.
    

**Exemples :**

TypeScript

```typescript
// ❌ Mélange de termes
function getAmount() { ... }      // Dans un module
function getPrice() { ... }       // Dans un autre
function getCost() { ... }        // Dans un troisième

// ✅ Un seul terme
function getTotal() { ... }       // Partout
function getTotalWithTax() { ... }

// Vocabulaire cohérent :
class Order {
  private total: number;          // ✅ "total"
  getTotal(): number { ... }      // ✅ "total"
  setTotal(value: number): void   // ✅ "total"
}

class Invoice {
  private total: number;          // ✅ "total"
  getTotal(): number { ... }      // ✅ "total"
}
```

**Questions à poser :**

- Y a-t-il plusieurs mots pour le même concept ?
    
- Le vocabulaire est-il cohérent à travers le codebase ?
    
- Les termes métier sont-ils utilisés de manière cohérente ?
    

**Critères de validation :**

- Un seul mot par concept.
    
- Le vocabulaire est cohérent à travers le codebase.
    
- Les termes métier sont utilisés de manière cohérente.
    

---

### Étape 11 : Utiliser des noms du domaine (problème ou solution)

**Objectif :** Choisir des noms appropriés au niveau d'abstraction.

**Règles :**

- Utiliser les noms du domaine solution pour le code technique.
    
- Utiliser les noms du domaine problème pour le code métier.
    

**Exemples :**

TypeScript

```typescript
// ✅ Noms techniques (compris par les développeurs)
class JobQueue { ... }
class FIFO { ... }
class AccountVisitor { ... }

// ✅ Noms métier (compris par les experts métier)
class Customer { ... }
class Order { ... }
class PaymentProcessor { ... }
```

**Questions à poser :**

- À quel niveau d'abstraction se trouve ce code ?
    
- Qui va lire ce code (développeurs ou experts métier) ?
    
- Les noms sont-ils appropriés à leur contexte ?
    

**Critères de validation :**

- Les noms techniques utilisent le domaine solution.
    
- Les noms métier utilisent le domaine problème.
    
- Les noms sont appropriés à leur niveau d'abstraction.
    

---

### Étape 12 : Ajouter un contexte significatif

**Objectif :** Placer les noms dans un contexte pour clarifier leur signification.

**Règles :**

- Utiliser des classes ou structures pour fournir le contexte.
    
- Extraire le contexte pour clarifier.
    

**Exemples :**

TypeScript

```typescript
// ❌ Contexte manquant (variables isolées)
let state: string; // État de quoi ? Machine ? Adresse ?

// ✅ Contexte fourni par la classe
class Address {
  private state: string; // Maintenant clair : état de l'adresse
}

// ❌ Contexte à inférer
function printGuessStatistics(candidate: string, count: number) {
  let number: string;
  let verb: string;
  let pluralModifier: string;
  // ...
}

// ✅ Contexte explicite
class GuessStatisticsMessage {
  private number: string;
  private verb: string;
  private pluralModifier: string;

  make(candidate: string, count: number): string {
    // ...
  }
}
```

**Questions à poser :**

- Ces noms ont-ils un sens en dehors de leur contexte ?
    
- Un nouveau venu pourrait-il comprendre ces noms isolément ?
    
- Une classe ou structure pourrait-elle fournir le contexte manquant ?
    

**Critères de validation :**

- Les noms sont dans un contexte approprié.
    
- Le contexte est fourni par la classe ou la structure.
    
- Les noms sont compris en isolation.
    

---

### Étape 13 : Ne pas ajouter de contexte superflu

**Objectif :** Éviter les préfixes ou suffixes inutiles.

**Règles :**

- Ne pas préfixer toutes les classes du projet.
    
- Utiliser des noms précis mais pas superflus.
    

**Exemples :**

TypeScript

```typescript
// ❌ Préfixe GSD sur toutes les classes
class GSDCustomer { ... }
class GSDOrder { ... }
class GSDProduct { ... }

// ✅ Noms simples
class Customer { ... }
class Order { ... }
class Product { ... }

// ❌ Superflu
class GSDAccountAddress { ... }

// ✅ Précis
class PostalAddress { ... }
class MACAddress { ... }
class URIAddress { ... }
```

**Questions à poser :**

- Ce préfixe est-il vraiment nécessaire ?
    
- Un nom plus court serait-il aussi clair ?
    
- Y a-t-il une redondance dans ce nom ?
    

**Critères de validation :**

- Aucun préfixe de projet superflu.
    
- Les noms sont précis mais pas excessifs.
    
- Aucune redondance inutile.
    

---

### Étape 14 : Le nom doit être légèrement plus abstrait que l'implémentation

**Objectif :** Le nom cache l'implémentation pour permettre son changement futur.

**Règle (Clean Code Ch. 7) :** Le nom d'une fonction doit être légèrement plus abstrait que le code qu'il contient. Il doit décrire _ce qui_ est fait, pas _comment_ c'est fait.

**Exemples :**

TypeScript

```typescript
// ❌ Trop concret : expose l'implémentation
function addAtoBandDivideBy2(a: number, b: number): number {
  return (a + b) / 2.0;
}

// ✅ Abstrait : cache l'implémentation
function average(a: number, b: number): number {
  return (a + b) / 2.0;
}

// Si l'implémentation change (moyenne de N nombres), le nom reste valide :
function average(...numbers: number[]): number {
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}
```

**Questions à poser :**

- Ce nom décrit-il le résultat ou l'implémentation ?
    
- Si l'algorithme change, le nom devra-t-il aussi changer ?
    
- Le nom est-il assez abstrait pour survivre à un refactoring ?
    

**Critères de validation :**

- Le nom décrit l'intention, pas l'algorithme.
    
- Le nom survivrait à un changement d'implémentation.
    
- Le nom est légèrement plus abstrait que le code.
    

---

### Étape 15 : Noms de tests — Descriptifs et explicites

**Objectif :** Les noms de tests doivent être des phrases descriptives du comportement attendu.

**Règle (Clean Code Ch. 15 + clean-tests) :** Les noms de tests sont les plus longs de tous car ils ont le scope le plus petit (zéro). Ils doivent décrire le scénario, l'action, et le résultat attendu.

**Formats recommandés :**

- `should[ExpectedBehavior]When[Condition]`
    
- `should[ExpectedBehavior]With[Input]`
    
- `it('[action] [condition] [résultat]')`
    

**Exemples :**

TypeScript

```typescript
// ❌ Trop vague
it('test1', () => { ... });
it('userTest', () => { ... });

// ✅ Descriptif
it('shouldReturnValidUserWhenLoginIsSuccessfulWithValidCredentials', () => { ... });
it('shouldThrowInvalidArgumentExceptionWhenEmailIsEmpty', () => { ... });
it('shouldMarkTaskAsCompletedWhenCheckboxIsClicked', () => { ... });
```

**Questions à poser :**

- Ce nom de test décrit-il le comportement attendu ?
    
- Peut-on comprendre ce qui est testé sans lire le code du test ?
    
- Le nom suit-il la convention du projet (should/when, given/when/then, etc.) ?
    

**Critères de validation :**

- Le nom de test est une phrase descriptive.
    
- Le nom indique le scénario et le résultat attendu.
    
- Le nom est compris sans lire le corps du test.
    

---

## 5. ANTI-PATTERNS DE NOMMAGE (À ÉVITER)

Table

|Anti-pattern|Problème|Solution|
|:--|:--|:--|
|Noms vagues|`data`, `info`, `temp`|Révéler l'intention|
|Nombres magiques|`7` dans le code|Constante nommée|
|Hungarian notation|`strName`, `iCount`|Noms sans préfixe|
|Préfixes de membre|`m_`, `_`|Noms simples|
|Série numérique|`a1`, `a2`, `a3`|Noms significatifs|
|Mots vides|`ProductInfo`, `Data`|Noms significatifs|
|Préfixes I|`IShapeFactory`|Interface sans préfixe|
|Noms trop longs|`ThisIsAVeryLongName`|Longueur adaptée au scope|
|Noms trop courts|`n`, `i` hors scope court|Longueur adaptée au scope|
|Noms "cute"|`HolyHandGrenade`, `whack`|Choisir la clarté|
|Mental mapping|`r` pour URL, `i` pour index dans un scope large|Nom complet (`url`, `taskIndex`)|
|Noms trop concrets|`addAtoBandDivideBy2`|Abstraire (`average`)|

---

## 6. RATIONALISATIONS COURANTES (À ÉVITER)

Table

|Rationalisation|Réalité|
|:--|:--|
|"C'est juste une variable locale, j'utilise un nom court"|Un nom court dans un scope de 50 lignes est ambigu. La longueur doit être proportionnelle au scope.|
|"Tout le monde sait ce que signifie i"|Oui, dans une boucle de 2 lignes. Pas comme variable d'instance.|
|"Je vais le renommer plus tard"|Le renommage est plus cher à faire plus tard.|
|"C'est un nom technique, pas besoin d'être clair"|Les noms techniques doivent être clairs aussi.|
|"Je suis le seul à travailler sur ce code"|Quelqu'un d'autre le lira. Même vous dans 6 mois.|
|"Ce nom est drôle, ça rend le code plus fun"|La clarté prime sur l'humour. Un nom "cute" devient un obstacle dans 3 mois.|

---

## 7. RED FLAGS (Signaux d'alarme)

Table

|Signe|Problème|Solution|
|:--|:--|:--|
|Nom nécessitant un commentaire|Le nom ne révèle pas l'intention|Renommer|
|Nom difficile à prononcer|Inconvenant à la discussion|Rendre prononçable|
|Nom non recherchable|Difficile à trouver|Utiliser des noms longs|
|Plusieurs noms pour un concept|Incohérence|Uniformiser|
|Préfixes de type|Encodage inutile|Supprimer|
|Nombres magiques|Non recherchables|Constantes nommées|
|Contexte manquant|Nom ambigu|Ajouter contexte|
|Nom "cute" ou culturel|Obscurcit l'intention|Renommer avec clarté|
|Mental mapping|Force la traduction mentale|Utiliser le nom complet|
|Nom trop concret|Expose l'implémentation|Abstraire|
|Nom de test vague|On ne sait pas ce qui est testé|Décrire le comportement|

---

## 8. LIVRABLES ATTENDUS

Pour une tâche de nommage complétée :

Table

|Document|Description|
|:--|:--|
|Glossaire|Liste des termes et concepts du domaine.|
|Conventions de nommage|Document des règles du projet.|
|Code renommé|Noms intention-révélateurs dans tout le code.|

---

## 9. LIENS AVEC LES AUTRES PHASES

**Input (Phase 2) :**

- `data-modeling` → Noms des entités et attributs.
    
- `api-and-interface-design-v2` → Noms des endpoints et méthodes.
    

**Output (Phase 4) :**

- Code nommé clairement → Plus facile à lire et déboguer.
    
- Glossaire → Outil pour la documentation.
    

**Dépendances internes :**

- `function-design-v2` : Noms de fonctions (taille, abstraction, arguments).
    
- `class-design-v2` : Noms de classes (cohésion, responsabilité).
    
- `clean-tests-v2` : Noms de tests (descriptifs, FIRST).
    
- `frontend-ui-engineering-v2` : Conventions de nommage des composants, props, handlers.
    

---

## 10. RESSOURCES UTILISÉES

- **Clean Code, 2nd Edition (Robert C. Martin)**
    
    - Ch. 4 : "Meaningful Names" — Toutes les règles de nommage.
        
    - Ch. 7 : "Clean Functions" — Noms descriptifs vs convenient, abstraction des noms, longueur inverse.
        
    - Ch. 13 : "Clean Classes" — Noms de classes.
        
    - Ch. 15 : "Clean Tests" — Noms de tests descriptifs.
        
- **Skills Osmani :** Aucun équivalent direct (nouveau skill).
    
- **Autres références :**
    
    - Tim Ottinger's "Rules for Names" (source originale des règles de nommage).
        
    - Domain-Driven Design (Ubiquitous Language).
        

---

## 11. EXEMPLE COMPLET D'APPLICATION

**Contexte :** Refactorisation de noms dans un système de gestion de tâches.

**Avant (noms vagues) :**

TypeScript

```typescript
class TaskManager {
  private items: Task[];
  private d: Date;
  private f: boolean;

  getData() {
    let t = 0;
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].status === 'pending') {
        t++;
      }
    }
    return t;
  }
}
```

**Après (noms intention-révélateurs) :**

TypeScript

```typescript
class TaskService {
  private tasks: Task[];
  private defaultDeadline: Date;
  private isInitialized: boolean;

  getPendingTaskCount(): number {
    let count = 0;
    for (const task of this.tasks) {
      if (task.status === 'pending') {
        count++;
      }
    }
    return count;
  }
}
```

**Résumé des changements :**

- `items` → `tasks` (plus précis)
    
- `d` → `defaultDeadline` (intention révélée)
    
- `f` → `isInitialized` (booléen avec préfixe `is`)
    
- `getData` → `getPendingTaskCount` (décrit ce qui est retourné)
    
- `t` → `count` (nom significatif dans le scope)
    
- `i` → `task` (boucle avec nom significatif)
    

---

## 12. VÉRIFICATION FINALE (Definition of Done)

Après avoir appliqué les conventions de nommage :

- [ ] Tous les noms révèlent l'intention.
    
- [ ] Aucun nom n'est trompeur ou désinformant.
    
- [ ] Les distinctions entre noms sont significatives.
    
- [ ] Tous les noms sont prononçables.
    
- [ ] Les noms importants sont recherchables.
    
- [ ] Les longueurs sont adaptées aux scopes (règle proportionnelle pour les variables, règle inverse pour les fonctions/classes).
    
- [ ] Aucun encodage (Hungarian, `m_`, `I`).
    
- [ ] Les classes utilisent des noms, les méthodes des verbes.
    
- [ ] Un seul mot par concept est utilisé.
    
- [ ] Les noms sont dans un contexte approprié.
    
- [ ] Aucun contexte superflu n'est ajouté.
    
- [ ] **Aucun nom "cute" ou mental mapping.**
    
- [ ] **Les noms de fonctions sont légèrement plus abstraits que leur implémentation.**
    
- [ ] **Les noms de tests sont descriptifs et explicites.**
    

plain

````plain

---

```markdown
<!-- naming-conventions-quick.md -->
---
name: naming-conventions-quick
description: Version condensée du skill naming-conventions pour les sessions rapides. Utiliser quand le contexte est limité ou pour un rappel rapide avant de nommer.
---

# Naming Conventions — Quick Mode

## 1. RÈGLE D'OR

> Si un nom nécessite un commentaire, le nom est mauvais.

---

## 2. CHECKLIST RAPIDE (15 Étapes)

### 1. Intention-révélateur
- [ ] Le nom répond à : pourquoi ? quoi ? comment ?
- [ ] Un nouveau venu comprend sans commentaire.

### 2. Pas de désinformation
- [ ] Pas de `List` si ce n'est pas une List.
- [ ] Pas de noms trop similaires (`Handling` vs `Storage`).
- [ ] Pas de lettres ambiguës (`l`, `O`).

### 3. Distinctions significatives
- [ ] Pas de séries numériques (`a1`, `a2`).
- [ ] Pas de mots vides (`Info`, `Data`, `Object`).
- [ ] Chaque nom a un sens unique.

### 4. Prononçable
- [ ] On peut le dire à voix haute.
- [ ] Pas d'abréviations obscures (`genymdhms`).

### 5. Recherchable
- [ ] Pas de nombres magiques (`7` → `WORK_DAYS_PER_WEEK`).
- [ ] Noms courts uniquement dans des scopes de 2-3 lignes.

### 6. Longueur adaptée au scope
| Élément | Scope | Longueur | Exemple |
|---------|-------|----------|---------|
| Variable globale | Large | Longue | `applicationUserCount` |
| Variable locale | Petit | Courte | `count`, `i` |
| Fonction globale | Large | **Courte** | `open()`, `save()` |
| Fonction privée | Petit | **Longue** | `openFileAndLogError()` |
| Test | Zéro | **Très longue** | `shouldReturnUserWhenLoginSuccessful()` |

### 7. Pas d'encodage
- [ ] Pas de Hungarian (`strName`, `iCount`).
- [ ] Pas de `m_` ou `_`.
- [ ] Interface sans `I` (`ShapeFactory`, `ShapeFactoryImpl`).

### 8. Bonnes parties du discours
- [ ] Classes = **noms** (`Customer`, `OrderProcessor`).
- [ ] Méthodes = **verbes** (`save()`, `processPayment()`).
- [ ] Accesseurs = `getX` / `setX` / `isX`.

### 9. Pas de "cute" ni mental mapping
- [ ] Pas de blagues (`HolyHandGrenade`, `eatMyShorts`).
- [ ] Pas de traduction mentale (`r` pour URL → `url`).

### 10. Un seul mot par concept
- [ ] `getTotal` partout, pas `getAmount` ici et `getPrice` là.

### 11. Domaine approprié
- [ ] Code technique → noms solution (`JobQueue`, `FIFO`).
- [ ] Code métier → noms problème (`Customer`, `Order`).

### 12. Contexte significatif
- [ ] Variables isolées → regrouper dans une classe.
- [ ] `state` seul est ambigu ; `Address.state` est clair.

### 13. Pas de contexte superflu
- [ ] Pas de préfixe projet (`GSDCustomer` → `Customer`).
- [ ] Noms précis mais pas excessifs.

### 14. Abstraction
- [ ] Le nom cache l'implémentation.
- [ ] `average()` pas `addAtoBandDivideBy2()`.

### 15. Tests descriptifs
- [ ] `should[Behavior]When[Condition]`.
- [ ] `shouldThrowExceptionWhenEmailIsEmpty`.

---

## 3. CONVENTIONS PAR ÉLÉMENT

| Élément | Convention | Exemple |
|---------|------------|---------|
| Classe | PascalCase, nom | `TaskService`, `UserRepository` |
| Variable | camelCase, intention | `pendingTaskCount`, `isActive` |
| Constante | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Fonction globale | camelCase, verbe court | `open()`, `save()` |
| Fonction privée | camelCase, verbe long | `validateUserCredentials()` |
| Hook / Callback | camelCase, prefix `on` | `onSubmit`, `onTaskToggle` |
| Handler interne | camelCase, prefix `handle` | `handleClick`, `handleSubmit` |
| Interface | PascalCase, sans `I` | `PaymentGateway` |
| Implémentation | PascalCase, suffix `Impl` | `StripePaymentGatewayImpl` |
| Test | phrase descriptive | `shouldReturnUserWhenValidCredentials` |

---

## 4. ANTI-PATTERNS (STOP)

| Anti-pattern | Solution |
|--------------|----------|
| `data`, `info`, `temp` | Nommer l'intention |
| `a1`, `a2`, `x1` | Noms significatifs |
| `strName`, `iCount` | Sans préfixe |
| `m_description`, `_value` | Sans préfixe |
| `ProductInfo`, `CustomerData` | `Product`, `Customer` |
| `HolyHandGrenade`, `whack()` | `deleteItems()`, `abort()` |
| `r` pour URL, `i` dans un scope large | `url`, `taskIndex` |
| `addAtoBandDivideBy2` | `average()` |
| `test1`, `userTest` | `should[Behavior]When[Condition]` |

---

## 5. RED FLAGS

- [ ] Nom nécessitant un commentaire.
- [ ] Nom imprononçable.
- [ ] Nom non recherchable (nombre magique, lettre seule).
- [ ] Plusieurs mots pour le même concept.
- [ ] Préfixe de type ou de membre.
- [ ] Nom "cute" ou culturel.
- [ ] Mental mapping (traduction mentale requise).
- [ ] Nom trop concret (expose l'implémentation).
- [ ] Nom de test vague (`test1`).

---

## 6. OUTPUT MINIMAL

Pour valider une tâche de nommage rapide :

1. **Audit :** Chaque nom passe la checklist ci-dessus.
2. **Cohérence :** Un seul mot par concept dans le fichier/module.
3. **Glossaire :** Les termes métier sont documentés (même brièvement).
````