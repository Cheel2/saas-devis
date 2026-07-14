```markdown
# incremental-implementation-v2

## TL;DR — Quick Reference

**Cycle d'un incrément :** Découper → Implémenter → Tester → Vérifier l'état du système → Commiter → Passer au suivant.

**3 règles d'or :**
1. **Une seule chose par incrément** — Un commit = une chose logique.
2. **Gardez le système compilable** — Build vert après chaque incrément.
3. **First, make it work. Then, make it right.** — Les 3 niveaux : (1) ça fonctionne, (2) c'est lisible, (3) c'est découplé.

**Pourquoi nettoyer à chaque incrément ?**  
*Clean Code, Ch 1 : "We read more than we write" — le ratio lecture/écriture est supérieur à 10:1. Un incrément sale multiplie le coût de la lecture pour tous les incréments suivants. Nettoyer maintenant est un investissement, pas une dépense.*

---

## 1. OBJECTIF DU SKILL

**Pourquoi ce skill existe ?**
L'implémentation incrémentale est la discipline d'exécution qui transforme une spécification en code fonctionnel, tout en gardant le système dans un état fonctionnel à chaque étape. Elle permet de livrer de la valeur de manière continue et de détecter les problèmes tôt.

**Quel problème résout-il ?**
- Évite les "big bang" integrations où tout casse à la fois.
- Réduit le temps de débogage (si ça marchait il y a 2 minutes, le bug est dans les dernières lignes).
- Permet un retour rapide des tests et des utilisateurs.
- Rend chaque livraison réversible si nécessaire.

**Dans quel contexte l'utiliser ?**
- Toute implémentation qui touche plus d'un fichier.
- Tout changement qui pourrait casser le build.
- Toute fonctionnalité qui semble "trop grosse" pour être livrée en une seule fois.
- Quand vous êtes tenté d'écrire plus de ~100 lignes sans tester.

---

## 2. PRÉREQUIS

**Ce qui doit être déjà fait :**
- ✅ Phase 1 (Requirements Engineering) terminée : les exigences sont spécifiées et validées.
- ✅ Phase 2 (System & Software Design) terminée : l'architecture, les interfaces et le plan de tâches existent.
- Les tâches sont décomposées en unités implémentables (issues du `planning-and-task-breakdown-v2`).
- Les tests d'acceptance sont écrits et comprennent les critères de succès de la feature.

**Quels documents sont nécessaires :**
- `PRD.md` / `SRS.md` — Spécifications des exigences.
- `architecture.md` — Décisions d'architecture.
- `task-plan.md` — Plan de tâches détaillé.
- `api-contract.md` — Contrat d'API (si applicable).
- Suite de tests (unitaires et d'acceptance) existante ou à créer.

**Quelles informations doivent être disponibles :**
- La stack technique est identifiée (versions des frameworks, langages).
- Les normes de codage du projet sont définies.
- Les conventions de commit et de branche sont claires.

> **Note d'adaptation stack technique :** Les exemples de commandes ci-dessous utilisent des patterns courants (`npm test`, `npm run build`, `npx tsc --noEmit`). Adaptez-les à votre stack identifiée en Phase 1 (ex: `pytest`, `cargo test`, `go test`, `dotnet build`, etc.).

---

## 3. RÔLES ET RESPONSABILITÉS

| Rôle | Responsabilités |
|------|-----------------|
| **Développeur (IA/Humain)** | Écrit le code de l'incrément courant. Exécute les tests localement avant le commit. S'assure que le build reste vert. Révise son propre code avant de le soumettre. |
| **Réviseur (Code Review)** | Vérifie que l'incrément est atomique (une seule chose). Vérifie que les tests couvrent le nouveau code. Vérifie que le code suit les standards du projet. Identifie les risques cachés. |
| **Testeur (QA / Acceptance)** | Valide que l'incrément répond aux critères d'acceptance. Vérifie qu'aucune régression n'est introduite. Signale les bugs avant qu'ils ne s'accumulent. |
| **Responsable Technique / Lead** | Priorise les incréments. S'assure que les incréments ne créent pas de dette technique excessive. Prend la décision de "feature flag" ou de branche. |

---

## 4. PROCESSUS DÉTAILLÉ (Étape par Étape)

### Étape 1 : Découper la tâche en incréments

**Objectif :** Transformer une tâche (issue, user story) en une séquence d'incréments verticaux, chacun livrant de la valeur.

**Actions :**
- Identifier les fonctionnalités minimales qui peuvent être livrées indépendamment.
- Classer les incréments par dépendance : A → B → C.
- Évaluer le risque de chaque incrément (technique, fonctionnel, performance).
- Décider de l'ordre d'exécution (risque d'abord, ou valeur d'abord).

**Questions à poser :**
- Qu'est-ce qui peut être livré en premier sans bloquer le reste ?
- Quels sont les points de risque (nouvelle API, intégration externe) ?
- Combien de temps devrait prendre cet incrément ? (Idéalement, une session de travail continue : 2-4h selon le contexte du projet).
- Si cet incrément échoue, quel est le plan B ?

**Critères de validation :**
- La séquence d'incréments est documentée.
- Chaque incrément a un critère de succès mesurable.
- Les dépendances sont clairement identifiées.
- Les incréments sont nommés de manière descriptive.

**Exemple :**
```

Tâche : "Ajouter la fonctionnalité de partage de tâches"

Incrément 1 : Modèle de données et API de base (création d'un lien de partage) → Critère : Un utilisateur peut générer un token de partage pour une tâche. → Tests : Création du token, récupération, expiration.

Incrément 2 : Interface de partage (UI pour générer/copier le lien) → Critère : L'utilisateur voit un bouton "Partager" qui génère et copie le lien. → Tests : Click sur le bouton, token généré, message de confirmation.

Incrément 3 : Page de visualisation publique (affichage de la tâche partagée) → Critère : Un utilisateur sans compte peut voir la tâche via le lien. → Tests : Accès au lien, affichage des données, message si token invalide.

Incrément 4 : Permissions et sécurité (contrôle d'accès) → Critère : Seul le propriétaire peut partager ; le token expire. → Tests : Vérification du propriétaire, expiration du token, révocation.

plain

```plain

---

### Étape 2 : Implémenter un incrément

**Objectif :** Écrire le code qui réalise l'incrément, en suivant le principe *"First, make it work. Then, make it right."* (Kent Beck, Clean Code, Ch 9).

**Actions :**
- **Faire fonctionner :** Écrire le code minimal qui fait passer les tests.
- **Rendre propre :** Refactorer pour améliorer la structure sans changer le comportement.
- **Ne pas mélanger :** L'incrément ne doit pas faire autre chose que ce qu'il spécifie.

**Principe Zéro Présomption :**
- Si une information manque, identifier et demander.
- Ne pas inventer des hypothèses sur le comportement attendu.
- Si le comportement est ambigu, proposer des options.

**Règle des 3 niveaux :**
```

Niveau 1 : Le code fonctionne (tests passent). Niveau 2 : Le code est lisible et bien nommé. Niveau 3 : Le code est découplé et testable.

plain

```plain
Toucher les 3 niveaux avant de passer à l'incrément suivant.

**Pourquoi nettoyer maintenant ? (Clean Code, Ch 1 & Ch 11)**
- Le code est lu plus de 10 fois pour chaque fois qu'il est écrit. Un incrément mal nommé ou mal structuré devient un obstacle pour tous les incréments suivants.
- La *Stepdown Rule* (Ch 11) : chaque fonction doit se lire comme un récit de haut en bas. Les fonctions appelées doivent apparaître sous leur appelante, et chaque fonction doit rester à un seul niveau d'abstraction.

**Questions à poser :**
- Qu'est-ce que je ne comprends pas dans ce code existant ?
- Cette API que j'utilise, est-ce la bonne version ?
- Ce nom de fonction reflète-t-il son comportement exact ?
- Y a-t-il une duplication que je pourrais éliminer ?
- Les fonctions se lisent-elles de haut en bas sans saut d'abstraction ? (Stepdown Rule)

**Critères de validation (par incrément) :**
- Tests unitaires écrits et passant pour le nouveau code.
- Build réussi (`[votre_commande_build]`).
- Linting passe (`[votre_commande_lint]`).
- Le code est relu et accepté.
- La fonctionnalité est démontrable (manuellement ou via test d'acceptance).
- **Stepdown Rule respectée :** Les fonctions sont ordonnées par niveau d'abstraction décroissant.

---

### Étape 3 : Tester et vérifier l'incrément

**Objectif :** S'assurer que l'incrément fonctionne en isolation et n'introduit pas de régression.

**Actions :**
- **Tests unitaires :** Vérifier chaque nouvelle fonction/méthode.
- **Tests d'intégration :** Vérifier les interactions avec le reste du système.
- **Tests manuels :** Si nécessaire, vérifier visuellement ou fonctionnellement.
- **Régression :** Exécuter la suite complète des tests existants.

**La règle Beyoncé :** *"If you liked it, you should have put a test on it."* — Chaque nouveau comportement doit avoir un test qui le prouve.

**Le Test Pyramid :**
```

plain

```plain
      ╱╲
     ╱  ╲         E2E Tests (~5%)
    ╱    ╲
   ╱──────╲
  ╱        ╲      Integration Tests (~15%)
 ╱          ╲
╱────────────╲
```

╱ ╲ Unit Tests (~80%) ╱ ╲ ╱──────────────────╲

plain

```plain

**Questions à poser :**
- Quels cas limites pourraient casser cet incrément ?
- Comment tester le cas d'échec (erreur API, timeout) ?
- Y a-t-il des effets de bord non anticipés ?

**Critères de validation :**
- Tous les tests nouveaux et existants passent.
- La couverture de code n'a pas diminué (si mesurée).
- Les tests d'acceptance de la feature passent.
- Aucun "flaky test" n'a été introduit.

---

### Étape 4 : Vérifier l'état du système après l'incrément

**Objectif :** S'assurer que le système dans son ensemble reste dans un état fonctionnel et déployable.

**Actions :**
- **Build complet :** Compiler tout le projet (pas seulement le module modifié).
- **Tests complets :** Exécuter l'ensemble de la suite de tests.
- **Vérification manuelle :** Tester les fonctionnalités clés (smoke test).
- **Analyse de performance :** Si l'incrément peut impacter les performances.

**Questions à poser :**
- Le système démarre-t-il correctement ?
- Les fonctionnalités existantes critiques fonctionnent-elles toujours ?
- Y a-t-il des warnings ou des erreurs dans les logs ?
- Le temps de chargement a-t-il augmenté de manière significative ?

**Critères de validation :**
- Le build complet réussit.
- Aucune régression détectée.
- Le système est déployable (même derrière un feature flag).
- Les métriques de performance sont acceptables.

---

### Étape 5 : Commiter l'incrément

**Objectif :** Enregistrer le travail de manière atomique et documentée.

**Actions :**
- **Message de commit descriptif :** Expliquer "quoi" et "pourquoi", pas seulement "comment".
- **Commit atomique :** Un commit = un incrément = une chose.
- **Vérifier avant de pousser :** S'assurer que les tests passent avant le push.

**Message de commit (Conventional Commits) :**
```

feat(tasks): add sharing link generation

- Generate unique token per task with 24h expiration
    
- Add GET endpoint /tasks/:id/share to retrieve token
    
- Add POST endpoint /share/:token to access shared task
    
- Include database migration for share_tokens table
    

Ref: #TASK-1234

plain

```plain

**Principes de commit atomique :**
- Un commit ne doit pas faire plus d'une chose.
- Un commit ne doit pas laisser le build cassé.
- Un commit doit avoir un message qui explique le pourquoi.

**Règle de la tente de camp :** *"Leave the code cleaner than you found it"* (Boy Scout Rule, Clean Code, Ch 1) — profiter de chaque incrément pour améliorer un petit peu le code adjacent.

**Questions à poser :**
- Ce commit fait-il une seule chose ?
- Le message est-il compréhensible par quelqu'un qui n'était pas là ?
- Ai-je oublié d'inclure des fichiers ?
- Ai-je inclus des fichiers qui ne devraient pas être commités ?

**Critères de validation :**
- Le commit est atomique (une seule chose).
- Le message suit les conventions du projet.
- Le commit a été poussé (ou est prêt à l'être).
- Aucune information sensible n'est dans le commit.

---

### Étape 6 : Passer à l'incrément suivant

**Objectif :** Utiliser la dynamique du succès pour continuer.

**Actions :**
- **Prendre du recul :** Réfléchir à ce qui a été appris pendant l'incrément.
- **Ajuster le plan :** Si des surprises sont survenues, ajuster les prochains incréments.
- **Commander le prochain :** Sélectionner le prochain incrément à réaliser.

**Principes :**
- **Stop and reflect :** Après chaque incrément, réfléchir à ce qui a été appris.
- **Feedback loop :** Utiliser le feedback des tests et des revues pour affiner les prochains incréments.
- **Momentum :** Maintenir la cadence, mais sans sacrifier la qualité.

**Questions à poser :**
- Qu'ai-je appris qui pourrait changer les prochains incréments ?
- Y a-t-il un risque que j'ai sous-estimé ?
- Les prochains incréments sont-ils toujours pertinents ?

**Critères de validation :**
- Le plan est mis à jour si nécessaire.
- Les leçons apprises sont documentées (dans le commit, la PR, ou le wiki).
- La transition vers le prochain incrément est fluide.

---

## 5. STRATÉGIES DE DÉCOUPAGE (Slicing Strategies)

### Vertical Slices (Préféré)

Construire un chemin complet à travers la stack :
```

Incrément 1 : Créer une tâche (DB + API + UI basique) → Tests passent, l'utilisateur peut créer une tâche via l'UI.

Incrément 2 : Lister les tâches (query + API + UI) → Tests passent, l'utilisateur voit ses tâches.

Incrément 3 : Éditer une tâche (update + API + UI) → Tests passent, l'utilisateur peut modifier les tâches.

Incrément 4 : Supprimer une tâche (delete + API + UI + confirmation) → Tests passent, CRUD complet.

plain

```plain

**Pourquoi les vertical slices ?**
- Chaque incrément est livrable et testable.
- Détection précoce des problèmes d'intégration.
- Feedback utilisateur plus rapide.
- Réduction du "big bang" integration.

### Contract-First Slicing

Quand le backend et le frontend doivent se développer en parallèle :
```

Incrément 0 : Définir le contrat API (types, interfaces, OpenAPI spec) → Les deux équipes s'accordent sur l'interface.

Incrément 1a : Backend implémente le contrat + tests API. → Backend prêt, peut être testé indépendamment.

Incrément 1b : Frontend implémente avec des données mockées. → Frontend prêt, peut être testé indépendamment.

Incrément 2 : Intégrer et tester bout-en-bout. → L'ensemble fonctionne ensemble.

plain

```plain

**Pourquoi contract-first ?**
- Permet le parallélisme (2 équipes ou 2 devs).
- Le contrat devient la source de vérité.
- Réduit les surprises lors de l'intégration.
- La documentation de l'API est générée automatiquement.

### Risk-First Slicing

Attaquer le plus risqué ou incertain d'abord :
```

Incrément 1 : Prouver que la connexion WebSocket fonctionne (risque élevé). → Si échec, on le découvre avant d'investir plus.

Incrément 2 : Ajouter les mises à jour en temps réel sur la connexion prouvée. → Fonctionnalité progressive.

Incrément 3 : Ajouter le support hors ligne et la reconnexion. → Dernier risque géré.

plain

```plain

**Pourquoi risk-first ?**
- "Fail fast" : Découvrir les problèmes critiques tôt.
- Apprentissage précoce : Les insights d'un incrément risqué éclairent les suivants.
- Réduction de l'incertitude : Le plus dur est fait en premier.

---

## 6. RÈGLES D'IMPLÉMENTATION

### Règle 0 : Simplicité d'abord

Avant d'écrire du code, demandez : *"Quelle est la chose la plus simple qui pourrait fonctionner ?"*

**Simplicity Check :**
```

✗ Classe EventBus générique avec pipeline de middleware pour une seule notification. ✓ Simple appel de fonction.

✗ Pattern Abstract Factory pour deux composants similaires. ✓ Deux composants simples avec des utilitaires partagés.

✗ Form builder configurable pour trois formulaires. ✓ Trois composants de formulaire.

plain

```plain

Trois lignes similaires valent mieux qu'une abstraction prématurée. Implémentez la version naïve, évidemment correcte. Optimisez seulement après que la correction est prouvée par des tests.

### Règle 0.5 : Discipline de périmètre

Ne touchez que ce que la tâche requiert.

**NE PAS faire :**
- "Nettoyer" le code adjacent à votre changement.
- Refactorer les imports dans des fichiers que vous ne modifiez pas.
- Supprimer des commentaires que vous ne comprenez pas.
- Ajouter des fonctionnalités qui ne sont pas dans le spec.
- Moderniser la syntaxe dans des fichiers que vous ne lisez que.

Si vous remarquez quelque chose à améliorer hors de votre tâche :
```

REMARQUÉ MAIS PAS TOUCHÉ :

- src/utils/format.ts a un import unused (non lié à cette tâche).
    
- Le middleware d'auth pourrait avoir de meilleurs messages d'erreur (autre tâche). → Souhaitez-vous que je crée une tâche pour ces améliorations ?
    

plain

````plain

### Règle 1 : Une seule chose par incrément

Chaque incrément change une chose logique. Ne mélangez pas les préoccupations :

**Mauvais :** Un commit qui ajoute un nouveau composant, refactore un existant, et met à jour la config build.

**Bon :** Trois commits séparés — un pour chaque changement.

### Règle 2 : Gardez le système compilable

Après chaque incrément, le projet doit compiler et les tests existants doivent passer. Ne laissez pas le codebase dans un état cassé entre les incréments.

### Règle 3 : Feature Flags pour les fonctionnalités incomplètes

Si une fonctionnalité n'est pas prête pour les utilisateurs mais que vous devez fusionner des incréments :

```typescript
// Feature flag pour le travail en cours
const ENABLE_TASK_SHARING = process.env.FEATURE_TASK_SHARING === 'true';

if (ENABLE_TASK_SHARING) {
  // Nouvelle UI de partage
}
````

Cela permet de fusionner de petits incréments sur la branche principale sans exposer le travail incomplet.

### Règle 4 : Safe Defaults (Comportement par défaut sûr)

Le nouveau code doit par défaut avoir un comportement sûr et conservateur :

TypeScript

```typescript
// Sûr : désactivé par défaut, opt-in
export function createTask(data: TaskInput, options?: { notify?: boolean }) {
  const shouldNotify = options?.notify ?? false; // Par défaut : ne pas notifier
  // ...
}
```

### Règle 5 : Rollback-Friendly

Chaque incrément doit être indépendamment réversible :

- Les changements additifs (nouveaux fichiers, nouvelles fonctions) sont faciles à révertir.
    
- Les modifications du code existant doivent être minimales et focalisées.
    
- Les migrations de base de données doivent avoir des rollbacks correspondants.
    
- Évitez de supprimer quelque chose dans un commit et de le remplacer dans le même commit — séparez-les.
    

---

## 7. VÉRIFICATION PAR INCÉMENT (Checklist)

Après chaque incrément, vérifier :

- [ ] Le changement fait une seule chose et la fait complètement.
    
- [ ] Tous les tests existants passent (`[votre_commande_test]`).
    
- [ ] Le build réussit (`[votre_commande_build]`).
    
- [ ] Le type checking passe (`[votre_commande_type_check]` ou équivalent).
    
- [ ] Le linting passe (`[votre_commande_lint]`).
    
- [ ] La nouvelle fonctionnalité fonctionne comme prévu (vérification manuelle si nécessaire).
    
- [ ] Le commit est atomique et bien nommé.
    
- [ ] Aucun code mort ou commenté n'est laissé.
    
- [ ] Aucune information sensible n'est commitée (secrets, tokens).
    
- [ ] **Stepdown Rule :** Les fonctions se lisent de haut en bas, du niveau d'abstraction le plus élevé au plus détaillé.
    

> **Note :** Exécutez chaque commande de vérification après un changement qui pourrait l'affecter. Après une exécution réussie, ne répétez pas la même commande sans changement de code — cela n'ajoute aucune information.

---

## 8. RATIONALISATIONS COURANTES (À ÉVITER)

Table

|Rationalisation|Réalité|
|:--|:--|
|"Je testerai tout à la fin"|Les bugs s'accumulent. Un bug dans l'incrément 1 rend les incréments 2-5 faux. Testez chaque incrément.|
|"C'est plus rapide de tout faire d'un coup"|Ça semble plus rapide jusqu'à ce que quelque chose casse et que vous ne puissiez pas trouver laquelle des 500 lignes changées a causé le problème.|
|"Ces changements sont trop petits pour être commités séparément"|Les petits commits sont gratuits. Les gros commits cachent des bugs et rendent les rollbacks douloureux.|
|"J'ajouterai le feature flag plus tard"|Si la fonctionnalité n'est pas complète, elle ne doit pas être visible par l'utilisateur. Ajoutez le flag maintenant.|
|"Ce refactor est assez petit pour être inclus"|Les refactors mélangés avec des fonctionnalités rendent les revues et le débogage plus difficiles. Séparez-les.|
|"C'est juste un prototype, je nettoierai plus tard"|Les prototypes deviennent du code de production. Nettoyer plus tard = jamais.|
|"Laissez-moi relancer le build pour être sûr"|Après un run réussi, répéter la même commande n'ajoute rien si le code n'a pas changé depuis.|

---

## 9. RED FLAGS (Signaux d'alarme)

Table

|Signe|Problème|Solution|
|:--|:--|:--|
|Plus de 100 lignes écrites sans exécuter les tests|L'incrément est trop gros ou vous avez oublié de tester.|Découper davantage ou exécuter les tests immédiatement.|
|Changements multiples non liés dans un même incrément|Le périmètre a dérivé.|Séparer en plusieurs incréments.|
|"Laissez-moi juste ajouter ça aussi" (scope creep)|Expansion du périmètre.|Noter pour plus tard, ne pas inclure.|
|Build ou tests cassés entre les incréments|L'état du système n'est pas stable.|Réparer avant de continuer.|
|Gros commits non poussés qui s'accumulent|Peur de commiter ou incrément trop gros.|Commiter plus tôt, plus souvent.|
|Construction d'abstractions avant le 3ème cas d'usage|Abstraction prématurée.|Implémenter le cas simple d'abord.|
|Toucher des fichiers hors du périmètre de la tâche|Discipline de périmètre faible.|Revenir au périmètre défini.|
|Créer de nouveaux utilitaires pour une opération unique|Surcharge architecturale.|Inline ou local d'abord.|

---

## 10. LIVRABLES ATTENDUS

Pour une tâche complétée avec ce skill :

Table

|Document|Description|
|:--|:--|
|Plan d'incréments (`increment-plan.md`)|La séquence des incréments, leurs critères de succès, leurs dépendances.|
|Code source|Le code de chaque incrément, avec les tests correspondants.|
|Commits atomiques|Chaque incrément est un commit avec un message descriptif.|
|PR / revue de code|Une revue qui vérifie que chaque incrément est atomique et testé.|
|Documentation (si API)|La documentation API mise à jour si l'incrément l'a modifiée.|
|Feature flags (si nécessaire)|Les flags configurés pour masquer les fonctionnalités incomplètes.|

---

## 11. LIENS AVEC LES AUTRES PHASES

**Input (ce qui vient d'avant — Phase 2)**

- `planning-and-task-breakdown-v2` → Plan de tâches détaillé.
    
- `api-and-interface-design-v2` → Contrats d'API.
    
- `architectural-patterns` → Décisions d'architecture.
    
- `data-modeling` → Modèles de données.
    

**Output (ce qui est transmis — Phase 4)**

- Code source fonctionnel + tests unitaires.
    
- Documentation de mise à jour.
    
- Feature flags configurés.
    
- Métriques de performance (si pertinentes).
    
- Incréments validés → Prêt pour la Phase 4 (Verification / Testing).
    

**Dépendances internes**

- `test-driven-development-v2` : Les tests écrits pendant l'implémentation.
    
- `source-driven-development-v2` : Vérification des sources lors de l'implémentation.
    
- `doubt-driven-development-v2` : Doute sur les décisions non triviales.
    
- `frontend-ui-engineering-v2` : Pour l'implémentation de l'UI.
    

---

## 12. RESSOURCES UTILISÉES

**Livre :** Clean Code, 2nd Edition (Robert C. Martin)

- **Chapter 1 :** "Clean Code" — _We Read More Than We Write_ (ratio 10:1, justification du nettoyage immédiat).
    
- **Chapter 2 :** "Clean That Code!" — Le processus de nettoyage.
    
- **Chapter 9 :** "The Clean Method" — TDD + Refactoring.
    
- **Chapter 10 :** "One Thing" — Extract till you drop.
    
- **Chapter 11 :** "Be Polite" — Stepdown Rule (lire le code de haut en bas).
    

**Skills Osmani :**

- `incremental-implementation` (version originale) — Structure et cycle de base.
    
- `test-driven-development` — Intégration avec les tests.
    
- `source-driven-development` — Vérification des sources.
    

**Autres références :**

- Kent Beck, _"First, make it work. Then, make it right."_
    
- Boy Scout Rule : _"Leave the campground cleaner than you found it."_
    
- Martin Fowler, _Refactoring_.
    
- Conventional Commits (standard de messages de commit).
    

---

## 13. EXEMPLE COMPLET D'APPLICATION

**Contexte :** Ajout de la fonctionnalité "Partage de tâches" (Task Sharing)

**Tâche initiale :** "Permettre aux utilisateurs de partager une tâche avec des collègues via un lien."

**Plan d'incréments :**

plain

```plain
Incrément 1 : Modèle de données - Token de partage
  - Fichiers : migrations/2025_share_tokens.sql, models/ShareToken.ts
  - Tests : ShareToken model (création, expiration, validation)
  - Commit : "feat(tasks): add share token model"

Incrément 2 : API - Génération de token
  - Fichiers : api/tasks/[id]/share/route.ts
  - Tests : Endpoint POST /tasks/:id/share (201, 404, 401)
  - Commit : "feat(api): add share token generation endpoint"

Incrément 3 : UI - Bouton "Partager"
  - Fichiers : components/TaskSharing/ShareButton.tsx
  - Tests : Click → génération → copie du lien
  - Commit : "feat(ui): add share button to task detail"

Incrément 4 : Page publique - Visualisation
  - Fichiers : app/share/[token]/page.tsx
  - Tests : Accès au lien public, données correctes, erreur si token invalide
  - Commit : "feat(ui): add public task view page"

Incrément 5 : Sécurité - Permissions et expiration
  - Fichiers : middleware/share-auth.ts
  - Tests : Expiration du token, révocation, permissions propriétaire
  - Commit : "feat(security): add share token permissions and expiration"
```

**Règle 0 en action (Simplicité d'abord) :** Pour l'incrément 1, la version naïve :

TypeScript

```typescript
// Naïf mais fonctionnel - Règle 0
export class ShareToken {
  constructor(
    public readonly token: string,
    public readonly taskId: string,
    public readonly expiresAt: Date
  ) {}
}
```

**Pourquoi c'est suffisant pour l'incrément 1 ?**

- Pas besoin d'abstraction pour un modèle simple.
    
- Pas besoin de générique ou de pattern complexe.
    
- Les tests prouveront que ça fonctionne.
    
- On refactorera si nécessaire dans un incrément ultérieur.
    

**Règle 0.5 en action (Discipline de périmètre) :**

plain

```plain
Incrément 1 : Modèle de données
  → TOUCHE : migrations/, models/ShareToken.ts
  → NE TOUCHE PAS : api/, components/, app/
  → REMARQUÉ : Le modèle User a un champ 'share_tokens' non utilisé.
             → Hors périmètre, noté pour plus tard.
```

> **Note :** Les noms de fichiers et extensions (`.ts`, `.tsx`, `.sql`) reflètent une stack TypeScript/Node à titre d'exemple. Adaptez les chemins et extensions à votre stack technique (`.py`, `.go`, `.rs`, `.java`, etc.).

---

## 14. VÉRIFICATION FINALE (Definition of Done)

Après avoir terminé tous les incréments d'une tâche :

- [ ] Chaque incrément a été testé individuellement et commité.
    
- [ ] L'ensemble de la suite de tests passe.
    
- [ ] Le build est propre.
    
- [ ] La fonctionnalité fonctionne bout-en-bout comme spécifié.
    
- [ ] Les feature flags sont configurés (si nécessaire).
    
- [ ] La documentation est mise à jour.
    
- [ ] Aucun commit non poussé ne reste.
    
- [ ] La revue de code a été effectuée et approuvée.
    
- [ ] **Stepdown Rule :** Le code final se lit comme un récit de haut en bas, du niveau d'abstraction le plus élevé au plus détaillé.