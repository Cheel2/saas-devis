```markdown
name: frontend-ui-engineering-v2
description: Builds production-quality UIs. Use when building or modifying user-facing interfaces. Use when creating components, implementing layouts, managing state, or when the output needs to look and feel production-quality rather than AI-generated.
---

# Frontend UI Engineering (v2 — Enrichi)

## 1. OBJECTIF DU SKILL

**Pourquoi ce skill existe ?**
L'interface utilisateur est la vitrine du produit. Une UI de qualité professionnelle n'est pas seulement esthétique : elle est accessible, performante, cohérente, maintenable et **testée**. L'objectif est de produire des interfaces qui semblent avoir été conçues par un ingénieur expérimenté dans une grande entreprise — pas par une IA générique.

**Quel problème résout-il ?**
- Évite l'"AI aesthetic" (purple gradients, card grids génériques, padding excessif).
- Garantit l'accessibilité (WCAG 2.1 AA) dès la conception.
- Assure une cohérence visuelle et structurelle avec le design system.
- Maintient la performance (Core Web Vitals).
- Structure le code UI pour qu'il soit maintenable, testable et conforme aux principes SOLID.

**Dans quel contexte l'utiliser ?**
- Construction de nouveaux composants UI.
- Modification d'interfaces existantes.
- Implémentation de layouts responsives.
- Ajout d'interactivité ou de gestion d'état UI.
- Correction de problèmes visuels ou d'UX.

---

## 2. PRÉREQUIS

**Ce qui doit être déjà fait :**
- ✅ Design system identifié (ou décisions de design prises).
- ✅ Framework UI choisi (React, Vue, Svelte, etc.) et versions vérifiées.
- ✅ Les besoins d'accessibilité sont connus (WCAG 2.1 AA par défaut).
- ✅ Les conteneurs de données (API, stores) sont définis.
- ✅ **Convention de nommage du projet établie** (ou utiliser les règles par défaut de ce skill).
- ✅ **Seuil de virtualisation défini** (défaut : 100 éléments rendus simultanément).
- ✅ **Seuil de prop drilling défini** (défaut : éviter au-delà de 3 niveaux).

**Quels documents sont nécessaires :**
- Design system (couleurs, typographie, espacements, composants).
- Maquettes / wireframes (Figma, Sketch, ou descriptions).
- API contracts (pour les données à afficher).
- User flows (parcours utilisateur à supporter).

---

## 3. RÔLES ET RESPONSABILITÉS

| Rôle | Responsabilités |
|------|-----------------|
| Développeur UI (IA/Humain) | Implémente les composants selon le design system. Assure l'accessibilité (WCAG 2.1 AA). Optimise la performance. Structure le code pour la maintenabilité. **Applique TDD pour les composants UI.** |
| Designer (UI/UX) | Fournit les maquettes et le design system. Valide l'implémentation visuelle. |
| Testeur (Accessibilité) | Vérifie la conformité WCAG (axe, Lighthouse). Teste la navigation au clavier et les lecteurs d'écran. |
| Réviseur de code | Vérifie la séparation des responsabilités (présentation vs données). Vérifie la performance. Vérifie la cohérence avec le design system et les **conventions de nommage**. |

---

## 4. PROCESSUS DÉTAILLÉ (Étape par Étape)

### Étape 1 : Analyser le design et les besoins utilisateur

**Objectif :** Comprendre ce que l'UI doit faire avant d'écrire du code.

**Actions :**
- Identifier les composants nécessaires (réutilisables vs spécifiques).
- Identifier les parcours utilisateur et les états (loading, error, empty, success).
- Identifier les contraintes : breakpoints, accessibilité, performance (LCP, CLS, INP).
- **Vérifier l'application des principes SOLID** :
  - SRP : Chaque composant identifié ne doit faire qu'une seule chose.
  - OCP : Prévoir comment de nouvelles variantes pourront être ajoutées sans modifier le code existant.

**Questions à poser (Zéro Présomption) :**
- Y a-t-il des maquettes ou des wireframes ?
- Quels composants du design system puis-je réutiliser ?
- Quels sont les parcours utilisateur critiques ?
- Y a-t-il des contraintes d'accessibilité spécifiques ?
- **Quel est le seuil de virtualisation défini pour ce projet ?**

**Critères de validation :**
- La liste des composants est établie.
- Les états (loading, error, empty) sont identifiés.
- Les contraintes responsive et accessibilité sont documentées.

---

### Étape 2 : Structurer les composants et appliquer les conventions de nommage

**Objectif :** Organiser le code UI de manière maintenable, réutilisable et **lisible**.

**Structure de fichiers recommandée :**
```

src/components/ TaskList/ TaskList.tsx # Composant principal (PascalCase) TaskList.test.tsx # Tests (PascalCase + .test) TaskList.stories.tsx # Storybook (si utilisé) use-task-list.ts # Hook personnalisé (camelCase, préfixe use) types.ts # Types spécifiques au composant TaskList.module.css # Styles (si CSS Modules)

plain

````plain

**Conventions de nommage (Clean Code Ch. 4 — Meaningful Names) :**
| Élément | Convention | Exemple | Mauvais exemple |
|---------|------------|---------|-----------------|
| Composant | PascalCase, nom du domaine | `TaskItem`, `UserProfile` | `MyComponent`, `Component1` |
| Props (données) | camelCase, nom substantif | `task`, `isOpen`, `userId` | `data`, `info`, `x` |
| Props (callbacks) | camelCase, préfixe `on` | `onToggle`, `onDelete`, `onSubmit` | `click`, `doSomething` |
| Handlers internes | camelCase, préfixe `handle` | `handleClick`, `handleSubmit` | `clickHandler`, `submit` |
| Hooks personnalisés | camelCase, préfixe `use` | `useTaskList`, `useForm` | `taskListHook`, `helper` |
| Fichiers utilitaires | camelCase | `formatDate.ts`, `validators.ts` | `utils.ts`, `helpers.ts` |
| Classes CSS | kebab-case, sémantiques | `.btn-primary`, `.text-muted` | `.red`, `.big`, `.style1` |
| Variables d'état | Nom révélant l'intention | `isLoading`, `hasError` | `loading`, `err`, `flag` |

**Patterns de composition :**
- **Préférer la composition à la configuration** (OCP).
- **Séparer la récupération des données de la présentation** (Container/Presenter).
- **Garder les composants focalisés** : une seule responsabilité par composant (SRP).

**Questions à poser :**
- Ce composant a-t-il une seule responsabilité ?
- Les données sont-elles séparées de la présentation ?
- Y a-t-il du prop drilling au-delà du seuil défini ?

**Critères de validation :**
- Chaque composant fait une seule chose.
- Les noms révèlent l'intention sans commentaire.
- La structure de fichiers est cohérente avec le projet.

---

### Étape 3 : Implémenter le design system et les principes SOLID

**Objectif :** Utiliser les tokens de design de manière cohérente et architecturer les composants selon les principes SOLID (Clean Code Ch. 19).

**Éviter l'"AI Aesthetic" :**
| Élément AI (à éviter) | Pourquoi c'est un problème | Qualité Production |
|-----------------------|---------------------------|-------------------|
| Purple/indigo partout | Toutes les apps IA se ressemblent | Utiliser la palette réelle du projet |
| Dégradés excessifs | Bruit visuel | Design plat ou dégradés subtils du design system |
| Tout en `rounded-2xl` | Ignore la hiérarchie visuelle | Border-radius cohérent du design system |
| Padding excessif | Détruit la hiérarchie | Grille d'espacement cohérente |

**SOLID appliqué aux Composants UI :**
- **SRP (Single Responsibility)** : Un composant ne fait qu'une seule chose. S'il affiche ET fetch des données, scinder en Container + Presenter.
- **OCP (Open/Closed)** : Ouvrir à l'extension (nouvelle variante via `variant="outline"` ou composition), fermé à la modification (ne pas modifier le code source du `Button` pour ajouter un `IconButton`).
- **LSP (Liskov Substitution)** : Un composant spécialisé (ex: `PrimaryButton`) doit pouvoir remplacer le composant générique (`Button`) sans casser l'interface.
- **ISP (Interface Segregation)** : Les interfaces de props doivent être petites. Éviter les props "fourre-tout". Préférer `TaskItemProps` (id, title, done) à `TaskItemProps` (id, title, done, user, settings, theme).
- **DIP (Dependency Inversion)** : Dépendre d'abstractions, pas de concretions. Injecter le thème, les handlers, et les données via props plutôt que d'importer des modules globaux dans le composant.

**Utiliser des tokens sémantiques :**
```css
/* ❌ Valeurs brutes */
.btn { color: #7c3aed; padding: 12px; }

/* ✅ Tokens sémantiques */
.btn { color: var(--color-primary); padding: var(--spacing-md); }
````

**Hiérarchie typographique :**

- `h1` → Titre de page (une seule par page)
    
- `h2` → Titre de section
    
- `h3` → Titre de sous-section
    
- `body` → Texte par défaut
    
- `small` → Texte secondaire
    

**Critères de validation :**

- Les tokens de design sont utilisés (pas de valeurs brutes).
    
- Les noms des composants et props révèlent l'intention.
    
- Aucun "AI aesthetic" évident.
    
- Les principes SOLID sont respectés (pas de violation flagrante).
    

---

### Étape 4 : Assurer l'accessibilité (WCAG 2.1 AA)

**Objectif :** Rendre l'interface utilisable par tous.

**Navigation au clavier :**

tsx

```tsx
// ✅ Tous les éléments interactifs sont focusables
<button onClick={handleClick}>Cliquez-moi</button>

// ❌ Élément non-focusable
<div onClick={handleClick}>Cliquez-moi</div>
```

**Labels ARIA :**

tsx

```tsx
<button aria-label="Fermer le dialogue"><XIcon /></button>
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

**Gestion du focus :**

- Déplacer le focus dans les modales/dialogues.
    
- Piéger le focus à l'intérieur des modales ouvertes.
    

**Contraste :**

- Texte normal : ratio ≥ 4.5:1
    
- Texte large (18pt+) : ratio ≥ 3:1
    
- Ne pas utiliser la couleur comme seul indicateur d'information.
    

**Critères de validation :**

- Navigation au clavier fonctionnelle (Tab).
    
- Contraste WCAG 2.1 AA vérifié.
    
- Labels ARIA présents.
    
- axe-core ou Lighthouse : 0 erreurs d'accessibilité.
    

---

### Étape 5 : Rendre responsive

**Objectif :** L'interface fonctionne sur tous les écrans.

**Approche mobile-first :**

tsx

```tsx
<div className="
  grid grid-cols-1      /* Mobile */
  sm:grid-cols-2        /* Small */
  lg:grid-cols-3        /* Large */
  gap-4
">
```

**Breakpoints à tester :**

Table

|Breakpoint|Taille|Appareil typique|
|:--|:--|:--|
|320px|Mobile très petit|iPhone SE|
|375px|Mobile standard|iPhone standard|
|768px|Tablette|iPad|
|1024px|Desktop|Écran standard|
|1440px|Grand écran|Desktop large|

**Principes :**

- Mobile-first : commencer par le plus petit écran.
    
- Touch targets ≥ 44px sur mobile.
    
- Pas de horizontal scroll.
    

**Critères de validation :**

- L'UI fonctionne à 320px, 768px, 1024px, 1440px.
    
- Pas de horizontal scroll.
    
- Touch targets ≥ 44px sur mobile.
    

---

### Étape 6 : Gérer les états (Loading, Error, Empty)

**Objectif :** Tous les états possibles sont gérés, pas seulement l'état nominal.

**Les états essentiels :**

- **Loading** : Skeleton (préféré) ou spinner.
    
- **Error** : Message explicite + action de réessayer.
    
- **Empty** : Message informatif + action possible.
    
- **Success** : Données affichées.
    
- **Partial** : Données partielles.
    

**Pattern : Skeleton loading**

tsx

```tsx
function TaskListSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Chargement des tâches">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-12 bg-muted animate-pulse rounded" />
      ))}
    </div>
  );
}
```

**Pattern : Optimistic updates**

tsx

```tsx
// Mettre à jour l'UI avant la confirmation serveur, rollback en cas d'erreur
```

**Critères de validation :**

- Loading state présent (skeleton préféré).
    
- Error state présent (message explicite, retry).
    
- Empty state présent (message informatif, action possible).
    

---

### Étape 7 : Optimiser la performance

**Objectif :** L'interface est fluide et rapide.

**Core Web Vitals :**

Table

|Métrique|Objectif|Impact|
|:--|:--|:--|
|LCP|< 2.5s|Perçu de chargement|
|INP|< 200ms|Réactivité globale|
|CLS|< 0.1|Stabilité visuelle|

**Bonnes pratiques :**

- **Code splitting** : Lazy loading des composants.
    
- **Memoization** : `React.memo`, `useMemo`, `useCallback` pour éviter les re-rendus inutiles.
    
- **Virtualisation** : Pour les longues listes dépassant le **seuil de virtualisation défini dans les prérequis (défaut: 100 éléments)**.
    
    tsx
    
    ```tsx
    // ✅ Virtualisation pour les listes > seuil
    import { useVirtualizer } from '@tanstack/react-virtual';
    ```
    

**Critères de validation :**

- LCP < 2.5s (Lighthouse).
    
- CLS < 0.1.
    
- Pas de re-rendus inutiles (React DevTools Profiler).
    
- Les listes dépassant le seuil sont virtualisées.
    

---

### Étape 8 : Tester les composants UI (TDD & Clean Tests)

**Objectif :** Garantir la fiabilité du comportement UI via des tests propres et rapides (Clean Code Ch. 14-15).

**Discipline : Test-Driven Development (TDD)**

1. Écrire un test qui échoue (décrire le comportement attendu).
    
2. Écrire le minimum de code pour faire passer le test.
    
3. Refactorer en gardant les tests verts.
    

**Quoi tester (et ne pas tester) :**

Table

|✅ Tester|❌ Ne pas tester|
|:--|:--|
|Les interactions (clic, saisie, soumission)|Les détails d'implémentation (className, structure DOM interne)|
|Les transitions d'état (loading → success → error)|Le rendu pixel-perfect (CSS)|
|L'accessibilité (rôles ARIA, labels, focus)|Les éléments tiers (API, browser)|
|Les callbacks (onToggle appelé avec le bon id)|Les snapshots non sélectifs|

**Règle FIRST (Clean Tests Ch. 15) :**

- **F**ast : Les tests UI doivent s'exécuter en < 1s. Éviter le rendu réel du navigateur quand possible.
    
- **I**ndependent : Chaque test crée son propre rendu, pas de partage d'état entre tests.
    
- **R**epeatable : Même résultat sur toute machine, à tout moment.
    
- **S**elf-validating : Résultat booléen (vert/rouge), pas de log manuel à vérifier.
    
- **T**imely : Écrits avant ou en même temps que le code, jamais "plus tard".
    

**Structure d'un test propre :**

tsx

```tsx
// ✅ Nom = phrase descriptive du comportement
it('should mark task as completed when checkbox is clicked', () => {
  // Arrange
  const onToggle = jest.fn();
  render(<TaskItem task={{ id: '1', title: 'Test', done: false }} onToggle={onToggle} />);

  // Act
  const checkbox = screen.getByRole('checkbox', { name: /marquer "test" comme terminée/i });
  userEvent.click(checkbox);

  // Assert
  expect(onToggle).toHaveBeenCalledWith('1');
});
```

**Critères de validation :**

- Un test existe pour chaque état (loading, error, empty, success).
    
- Les tests vérifient le comportement, pas le CSS.
    
- Les tests suivent la règle FIRST.
    
- Couverture des interactions critiques (clavier, ARIA).
    

---

## 5. GESTION D'ÉTAT (State Management)

Choisir l'approche la plus simple :

Table

|Type d'état|Approche|Exemple|
|:--|:--|:--|
|État local|`useState`|Toggle, input value|
|État partagé (2-3 composants)|Lifted state|Parent-child props|
|État global (theme, auth)|Context|ThemeProvider|
|État URL|SearchParams|Filtres, pagination|
|Données serveur|React Query, SWR|Fetch, cache, mutations|
|État client complexe|Zustand, Redux|Panier, formulaire multi-étapes|

**Éviter le prop drilling au-delà du seuil défini dans les prérequis (défaut: 3 niveaux).**

---

## 6. ANTI-PATTERNS À ÉVITER

Table

|Anti-pattern|Problème|Solution|
|:--|:--|:--|
|Components > 200 lignes|Trop complexes|Split en sous-composants (SRP)|
|Inline styles|Pas de design system|Utiliser les tokens CSS|
|États manquants|Mauvaise UX|Gérer loading, error, empty|
|Pas de test clavier|Inaccessible|Tester Tab, Enter, Space|
|Couleur comme seul indicateur|Inaccessible|Ajouter texte, icônes|
|"AI aesthetic"|Signale basse qualité|Utiliser le design system réel|
|Prop drilling > seuil|Couplage fort|Introduire Context ou restructurer|
|Pas de memoization|Performance médiocre|`useMemo`, `useCallback`, `React.memo`|
|**Noms sans intention**|Code illisible|Renommer selon les conventions (Ch. 4)|
|**Tests qui vérifient le CSS**|Tests fragiles|Tester le comportement, pas le style|
|**Props interfaces trop larges**|Violation ISP|Scinder les interfaces de props|

---

## 7. RATIONALISATIONS COURANTES (À ÉVITER)

Table

|Rationalisation|Réalité|
|:--|:--|
|"L'accessibilité, c'est un bonus"|Exigence légale et de qualité.|
|"On rendra ça responsive plus tard"|3x plus difficile après coup.|
|"Le design n'est pas final, je vais skipper le styling"|Utiliser les defaults du design system.|
|"C'est juste un prototype"|Les prototypes deviennent du code de production.|
|"L'AI aesthetic est acceptable pour l'instant"|Signale une basse qualité.|
|"Les tests d'accessibilité, c'est pour plus tard"|Les bugs d'accessibilité sont plus coûteux à corriger tard.|
|**"On ajoutera les tests après"**|Les tests après-coup sont biaisés et oublient les cas d'erreur.|

---

## 8. RED FLAGS (Signaux d'alarme)

Table

|Signe|Problème|Solution|
|:--|:--|:--|
|Composants > 200 lignes|Trop de responsabilités|Split en sous-composants|
|Valeurs CSS arbitraires (13px, 2.3rem)|Pas de design system|Utiliser les tokens|
|Pas d'états loading/error|Mauvaise UX|Ajouter les états|
|Navigation au clavier non testée|Inaccessible|Tester au clavier|
|Couleur comme seul indicateur|Inaccessible|Ajouter texte/icônes|
|"AI aesthetic" visible|Basse qualité|Refactorer avec le design system|
|Pas de test d'accessibilité|Risque de non-conformité|Ajouter axe-core / Lighthouse|
|Re-rendus excessifs|Performance médiocre|Memoization|
|**Noms de props non descriptifs**|Code opaque|Renommer (ex: `data` → `userProfile`)|
|**Absence de tests de comportement**|Régressions silencieuses|Ajouter des tests d'interaction|

---

## 9. LIVRABLES ATTENDUS

Pour une tâche UI complétée avec ce skill :

Table

|Document|Description|
|:--|:--|
|Composants|Code UI structuré, accessible, responsive, SOLID.|
|Tests|Tests unitaires d'interaction (TDD, FIRST).|
|Stories (Storybook)|Documentation des composants (si utilisé).|
|Accessibility report|Lighthouse / axe-core : 0 erreurs.|
|Performance report|Lighthouse : scores ≥ 90.|

---

## 10. LIENS AVEC LES AUTRES PHASES

**Input (Phase 2) :**

- `api-and-interface-design-v2` → Données à afficher.
    
- `architectural-patterns` → Structure de l'UI (Component-based).
    
- `data-modeling` → Modèles de données pour l'affichage.
    

**Output (Phase 4) :**

- UI implémentée → Testée en Phase 4 (Verification).
    
- Components accessibles → Validation WCAG.
    
- Performance metrics → Validation Core Web Vitals.
    

**Dépendances internes :**

- `test-driven-development-v2` : Tests des composants UI.
    
- `source-driven-development-v2` : Vérification des patterns UI.
    
- `incremental-implementation-v2` : UI implémentée par incréments.
    
- `naming-conventions` : Conventions de nommage appliquées.
    
- `clean-tests` : Règles FIRST et structure des tests.
    

---

## 11. RESSOURCES UTILISÉES

- **Clean Code, 2nd Edition (Robert C. Martin)**
    
    - Ch. 4 : "Meaningful Names" — Conventions de nommage UI.
        
    - Ch. 6 : "Formatting" — Formatage vertical et horizontal.
        
    - Ch. 12 : "Objects and Data Structures" — Abstraction des données UI.
        
    - Ch. 13 : "Clean Classes" — SRP, OCP, cohésion.
        
    - Ch. 14 : "Testing Disciplines" — TDD comme fondation.
        
    - Ch. 15 : "Clean Tests" — Règle FIRST, tests de domaine.
        
    - Ch. 19 : "The SOLID Principles" — Application aux composants.
        
    - Ch. 21 : "Continuous Design" — 4 Cs (Clarity, Conciseness, Confirmability, Cohesion).
        

---

## 12. EXEMPLE COMPLET D'APPLICATION

**Contexte :** Implémentation d'une liste de tâches interactive avec ajout, suppression, et filtrage.

**Étape 1 : Analyser**

plain

```plain
COMPOSANTS : TaskList, TaskItem, TaskInput, TaskFilters, EmptyState, LoadingState
ÉTATS : loading (skeleton), empty (message + bouton), error (message + retry), success (liste)
CONTRAINTES : mobile-first, WCAG 2.1 AA, seuil virtualisation = 100
```

**Étape 2 : Structurer + Nommer**

plain

```plain
src/components/
  TaskList/
    TaskList.tsx          # Container (fetch + états)
    TaskList.test.tsx     # Tests d'interaction
    TaskItem.tsx          # Presenter (affichage d'une tâche)
    TaskInput.tsx         # Input avec validation
    TaskFilters.tsx       # Filtres par statut
    types.ts              # Task, TaskFilter, TaskItemProps
    use-task-list.ts      # Hook métier (useTaskList)
```

**Étape 3 : Implémenter avec Design System + SOLID**

tsx

```tsx
// ✅ SRP : TaskItem ne fait qu'afficher
// ✅ OCP : Nouveau type de tâche = nouvelle variante via props, pas modif du composant
// ✅ ISP : TaskItemProps est minimal (id, title, done, onToggle, onDelete)
// ✅ DIP : Le thème est injecté via ThemeProvider (Context), pas importé

export interface TaskItemProps {
  id: string;
  title: string;
  done: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ id, title, done, onToggle, onDelete }: TaskItemProps) {
  const handleToggle = () => onToggle(id);
  const handleDelete = () => onDelete(id);

  return (
    <li className="flex items-center gap-3 p-3">
      <input
        type="checkbox"
        checked={done}
        onChange={handleToggle}
        aria-label={`Marquer "${title}" comme ${done ? 'non' : ''} terminée`}
      />
      <span className={done ? 'line-through text-muted' : ''}>{title}</span>
      <button
        onClick={handleDelete}
        aria-label={`Supprimer "${title}"`}
        className="text-danger hover:text-danger-dark"
      >
        <TrashIcon />
      </button>
    </li>
  );
}
```

**Étape 4 : Accessibilité**

- Checkbox native (focusable par défaut).
    
- `aria-label` descriptifs sur les éléments sans texte visible.
    
- Contraste vérifié avec le design system.
    

**Étape 5 : Responsive**

tsx

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {tasks.map(task => <TaskItem key={task.id} {...task} />)}
</div>
```

**Étape 6 : États**

tsx

```tsx
function TaskListContainer() {
  const { tasks, isLoading, error } = useTasks();

  if (isLoading) return <TaskListSkeleton />;
  if (error) return <ErrorState message={error.message} retry={refetch} />;
  if (tasks.length === 0) return <EmptyState message="Aucune tâche" onAdd={handleAdd} />;

  return <TaskList tasks={tasks} onToggle={handleToggle} onDelete={handleDelete} />;
}
```

**Étape 7 : Performance**

tsx

```tsx
// ✅ Memoization pour éviter les re-rendus inutiles
const TaskItem = React.memo(function TaskItem({ ... }: TaskItemProps) { ... });

// ✅ Virtualisation si > seuil (100)
if (tasks.length > VIRTUALIZATION_THRESHOLD) {
  return <TaskListVirtual tasks={tasks} onToggle={onToggle} onDelete={onDelete} />;
}
```

**Étape 8 : Tests (TDD)**

tsx

```tsx
// TaskItem.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskItem } from './TaskItem';

describe('TaskItem', () => {
  it('should call onToggle with task id when checkbox is clicked', async () => {
    const onToggle = jest.fn();
    render(<TaskItem id="1" title="Buy milk" done={false} onToggle={onToggle} onDelete={jest.fn()} />);

    const checkbox = screen.getByRole('checkbox', { name: /marquer "buy milk" comme terminée/i });
    await userEvent.click(checkbox);

    expect(onToggle).toHaveBeenCalledWith('1');
  });

  it('should call onDelete with task id when delete button is clicked', async () => {
    const onDelete = jest.fn();
    render(<TaskItem id="1" title="Buy milk" done={false} onToggle={jest.fn()} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /supprimer "buy milk"/i });
    await userEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith('1');
  });
});
```

---

## 13. VÉRIFICATION FINALE (Definition of Done)

Après avoir implémenté une UI :

- [ ] Les composants rendent sans erreur console.
    
- [ ] Les conventions de nommage sont respectées (PascalCase, camelCase, prefixes).
    
- [ ] Tous les éléments interactifs sont accessibles au clavier (Tab).
    
- [ ] Un lecteur d'écran peut transmettre le contenu et la structure.
    
- [ ] Responsive : fonctionne à 320px, 768px, 1024px, 1440px.
    
- [ ] Les états loading, error, empty sont tous gérés.
    
- [ ] Le design system est respecté (couleurs, espacement, typographie).
    
- [ ] Aucun warning d'accessibilité dans DevTools ou axe-core.
    
- [ ] Lighthouse : scores ≥ 90 pour Performance, Accessibility, Best Practices.
    
- [ ] **Les tests unitaires passent et couvrent les interactions critiques (npm test).**
    
- [ ] **Les tests suivent la règle FIRST (rapides, indépendants, reproductibles).**
    
- [ ] **Les principes SOLID sont respectés (pas de violation flagrante).**
    
- [ ] Le bundle size n'a pas augmenté de manière significative.
    

plain

````plain

---

```markdown
<!-- frontend-ui-engineering-v2-quick.md -->
---
name: frontend-ui-engineering-v2-quick
description: Version condensée du skill frontend-ui-engineering-v2 pour les sessions rapides. Utiliser quand le contexte est limité ou pour un rappel rapide.
---

# Frontend UI Engineering — Quick Mode

## 1. CHECKLIST RAPIDE (7 Étapes)

### 1. Analyser
- [ ] Composants nécessaires identifiés (réutilisables vs spécifiques).
- [ ] États identifiés : loading, error, empty, success.
- [ ] Seuils confirmés : virtualisation (défaut: 100), prop drilling (défaut: 3 niveaux).

### 2. Structurer + Nommer
- [ ] Structure : `ComponentName/ComponentName.tsx` + test + hook + types.
- [ ] **Noms :** Composants `PascalCase`, props `camelCase`, callbacks `onX`, handlers internes `handleX`, hooks `useX`.
- [ ] **SRP :** Un composant = une seule chose. Séparer Container (data) et Presenter (UI).

### 3. Design System + SOLID
- [ ] Tokens sémantiques uniquement (pas de hex/pixels bruts).
- [ ] **SRP :** Un composant ne fait qu'une chose.
- [ ] **OCP :** Nouvelles variantes via props/composition, pas modification du code.
- [ ] **ISP :** Props petites et spécialisées (pas de mega-props).
- [ ] **DIP :** Thème et données injectés via props/Context.

### 4. Accessibilité (WCAG 2.1 AA)
- [ ] Tous les éléments interactifs sont focusables (`<button>`, pas `<div onClick>`).
- [ ] `aria-label` sur les éléments sans texte visible.
- [ ] Contraste ≥ 4.5:1 (texte normal), ≥ 3:1 (texte large).
- [ ] Couleur n'est pas le seul indicateur d'état.

### 5. Responsive (Mobile-First)
- [ ] Testé à 320px, 768px, 1024px, 1440px.
- [ ] Pas de horizontal scroll.
- [ ] Touch targets ≥ 44px sur mobile.

### 6. États
- [ ] **Loading :** Skeleton préféré à spinner.
- [ ] **Error :** Message explicite + bouton retry.
- [ ] **Empty :** Message informatif + action possible.

### 7. Performance
- [ ] `React.memo`, `useMemo`, `useCallback` utilisés si nécessaire.
- [ ] Virtualisation activée si liste > seuil (défaut: 100).
- [ ] Lazy loading pour les routes/composants lourds.

---

## 2. RÈGLES DE NOMMAGE (Clean Code Ch. 4)

| Élément | Règle | Exemple |
|---------|-------|---------|
| Fichier composant | PascalCase | `TaskItem.tsx` |
| Fichier hook/util | camelCase | `useTaskList.ts` |
| Composant | PascalCase, domaine | `UserProfile`, pas `MyComponent` |
| Props (données) | camelCase, substantif | `task`, `isOpen`, `userId` |
| Props (callback) | camelCase, prefix `on` | `onToggle`, `onDelete` |
| Handler interne | camelCase, prefix `handle` | `handleClick`, `handleSubmit` |
| Hook personnalisé | camelCase, prefix `use` | `useForm`, `useAuth` |
| Variable état | Intention révélée | `isLoading`, `hasError`, pas `loading` |

---

## 3. RÈGLES DE TEST (TDD + FIRST)

- **TDD :** Test avant code. Un test = un comportement.
- **FIRST :**
  - **F**ast : < 1s par test.
  - **I**ndependent : Pas de partage d'état entre tests.
  - **R**epeatable : Même résultat partout.
  - **S**elf-validating : Vert ou rouge, pas de log à lire.
  - **T**imely : Écrit en même temps que le code.
- **Quoi tester :** Interactions (clic, saisie), transitions d'état, callbacks, accessibilité (rôles).
- **Ne pas tester :** CSS, structure DOM interne, snapshots non sélectifs.

---

## 4. ANTI-PATTERNS (STOP)

- Composants > 200 lignes → Split.
- Inline styles / valeurs arbitraires → Tokens.
- `div onClick` sans `role`/`tabIndex` → Utiliser `<button>`.
- Props drilling > seuil → Context ou restructuration.
- Tests sur `className` → Tester le comportement.
- Pas d'états loading/error/empty → Ajouter immédiatement.
- "AI aesthetic" (purple, gradients excessifs, rounded-2xl partout) → Design system.

---

## 5. RED FLAGS

- [ ] Noms non descriptifs (`data`, `info`, `handleStuff`).
- [ ] Pas de tests d'interaction.
- [ ] axe-core ou Lighthouse > 0 erreurs d'accessibilité.
- [ ] Re-rendus excessifs (vérifier avec React DevTools).
- [ ] Listes longues non virtualisées (> seuil).

---

## 6. OUTPUT MINIMAL

Pour valider une tâche UI rapide :

1. **Code :** Composants nommés, SOLID, tokens, états gérés.
2. **Tests :** Au moins 1 test par interaction critique (FIRST).
3. **Accessibilité :** 0 erreurs axe-core.
4. **Responsive :** Vérifié visuellement aux 5 breakpoints.
````