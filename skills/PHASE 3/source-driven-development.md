```markdown
# source-driven-development-v2

## TL;DR — Quick Reference

**Cycle :** DÉTECTER (identifier la stack et les versions) → CHERCHER (consulter la documentation officielle) → IMPLÉMENTER (suivre les patterns documentés) → CITER (montrer les sources avec URL complète).

**Pourquoi ce skill est critique à l'ère de l'IA (Clean Code, Ch 17) :**
> *"Les LLMs ne raisonnent pas, ils sont statistiques. Les données d'entraînement contiennent des patterns obsolètes qui semblent corrects mais cassent contre la version actuelle. La documentation officielle est la seule source fiable."* — Robert C. Martin, *AIs, LLMs, and God Knows What*

**Règle d'or :** Chaque décision framework-spécifique doit être vérifiable par l'utilisateur via une URL officielle. Si vous ne pouvez pas citer, vous ne pouvez pas implémenter.

**Source + Test = Vérité (Clean Code, Ch 30) :**
- La **documentation** cite la décision (théorie).
- Le **test** prouve qu'elle fonctionne (pratique).
- Voir `test-driven-development-v2` pour la preuve empirique.

---

## 1. OBJECTIF DU SKILL

**Pourquoi ce skill existe ?**
Les données d'entraînement des IA et les mémoires des développeurs deviennent obsolètes. Les APIs changent, les bonnes pratiques évoluent, les patterns se déprécient. Ce skill impose que chaque décision d'implémentation spécifique à un framework soit vérifiée contre la documentation officielle. C'est la seule manière de produire du code fiable et maintenable.

**Quel problème résout-il ?**
- Évite d'utiliser des APIs dépréciées ou supprimées.
- Empêche les patterns "qui marchaient avant" mais ne sont plus recommandés.
- Réduit le temps de débogage des erreurs liées à des versions incorrectes.
- Donne au développeur une source de vérité vérifiable.
- Construit une confiance dans le code produit ("je sais d'où vient cette décision").

**Dans quel contexte l'utiliser ?**
- Implémentation de code utilisant un framework ou une bibliothèque.
- Construction de boilerplate ou de code starter qui sera copié.
- Décisions d'architecture où la documentation officielle est pertinente.
- Revue de code pour vérifier la conformité avec les standards actuels.
- Intégration avec des services tiers (API, SDK, bibliothèques).

### Quand NE PAS utiliser ce skill

Ne pas appliquer `source-driven-development` dans les cas suivants :

- **Pure logique indépendante du framework** : renommage de variables, correction de typos, déplacement de fichiers, boucles, conditionnelles, structures de données — tout ce qui fonctionne identiquement quelle que soit la version.
- **Configuration sans impact framework-spécifique** : changement de couleurs CSS custom, texte statique, assets.
- **L'utilisateur demande explicitement la rapidité avant la vérification** : *"Juste faites-le vite, je vérifierai moi-même"* — dans ce cas, signaler explicitement : *"Code non sourcé — à vérifier avant utilisation en production."*

---

## 2. PRÉREQUIS

**Ce qui doit être déjà fait :**
- ✅ La stack technique est identifiée (langages, frameworks, versions).
- ✅ Le projet a un fichier de dépendances (`package.json`, `go.mod`, `requirements.txt`, `Cargo.toml`, `Gemfile`, `pom.xml`, etc.).
- ✅ Les versions exactes des dépendances sont connues et verrouillées.

**Quels documents sont nécessaires :**
- `package.json` / `go.mod` / `requirements.txt` (ou équivalent).
- Documentation officielle des frameworks utilisés (URLs).
- Standards de codage du projet (si existants).

**Quelles informations doivent être disponibles :**
- Les versions exactes de chaque dépendance.
- Les sites web officiels de chaque framework/bibliothèque.
- Les canaux d'annonce des changements (blog, changelog, mailing list).

> **Note d'adaptation stack technique :** Les exemples ci-dessous utilisent React/TypeScript à titre d'illustration. Adaptez les commandes, les URLs et les patterns à votre stack identifiée en Phase 1 (Vue, Django, Go, Rust, Laravel, etc.).

---

## 3. RÔLES ET RESPONSABILITÉS

| Rôle | Responsabilités |
|------|-----------------|
| **Développeur (IA/Humain)** | Vérifie la version des dépendances avant d'écrire du code. Consulte la documentation officielle pour chaque pattern. Cite les sources de chaque décision non triviale. Signale explicitement ce qui n'a pas pu être vérifié. |
| **Réviseur (Code Review)** | Vérifie que les sources citées sont officielles (pas de blogs, Stack Overflow). Vérifie que les patterns correspondent aux versions déclarées. Signale les décisions non sourcées. |
| **Architecte Technique** | Définit la liste des sources officielles pour chaque framework. Identifie les migrations de version et leurs impacts. Met à jour la documentation des choix techniques. |

---

## 4. PROCESSUS DÉTAILLÉ (Étape par Étape)

### Le Cycle : DÉTECTER → CHERCHER → IMPLÉMENTER → CITER → VÉRIFIER
```

DÉTECTER CHERCHER IMPLÉMENTER CITER VÉRIFIER │ │ │ │ │ ▼ ▼ ▼ ▼ ▼ Quelle Obtenir la Suivre les Montrer les Tester le stack ? doc officielle patterns sources code pertinente documentés

plain

````plain

---

### Étape 1 : DÉTECTER — Identifier la stack et les versions

**Objectif :** Lire le fichier de dépendances du projet pour connaître exactement les versions utilisées.

**Actions :**

**Identifier le gestionnaire de dépendances :**

| Fichier | Stack |
|---------|-------|
| `package.json` | Node.js / React / Vue / Angular / Svelte |
| `composer.json` | PHP / Symfony / Laravel |
| `requirements.txt` / `pyproject.toml` | Python / Django / Flask |
| `go.mod` | Go |
| `Cargo.toml` | Rust |
| `Gemfile` | Ruby / Rails |
| `pom.xml` / `build.gradle` | Java / Spring |

**Extraire les versions exactes :**

```json
{
  "dependencies": {
    "react": "^19.1.0",
    "next": "15.2.0",
    "tailwindcss": "^4.0.3"
  }
}
````

**Annoter ce qui a été trouvé :**

plain

```plain
STACK DÉTECTÉE :
- React 19.1.0 (^19.1.0 dans package.json)
- Next.js 15.2.0
- Tailwind CSS 4.0.3 (^4.0.3)

→ Je vais consulter la documentation officielle pour les patterns.
```

**Questions à poser (Zéro Présomption) :**

- Quelles sont les versions exactes (pas approximatives) ?
    
- Y a-t-il des dépendances de développement importantes (Vite, Jest, etc.) ?
    
- Le projet utilise-t-il des fonctionnalités expérimentales (alpha, beta) ?
    
- Y a-t-il des notes de mise à jour (migration guide) pour ces versions ?
    

**Critères de validation :**

- Les versions de tous les frameworks majeurs sont identifiées.
    
- Les versions sont vérifiées dans le fichier de dépendances (pas assumées).
    
- Les versions sont notées explicitement avant de commencer.
    

---

### Étape 2 : CHERCHER — Consulter la documentation officielle

**Objectif :** Trouver la page de documentation spécifique au pattern que vous allez implémenter.

**Hiérarchie des sources (par ordre d'autorité) :**

Table

|Priorité|Source|Exemple|
|:--|:--|:--|
|1|Documentation officielle|`react.dev`, `docs.djangoproject.com`, `symfony.com/doc`|
|2|Blog officiel / Changelog|`react.dev/blog`, `nextjs.org/blog`|
|3|Références standards du Web|MDN, `web.dev`, `html.spec.whatwg.org`|
|4|Compatibilité navigateur/runtime|`caniuse.com`, `node.green`|

**Sources NON autoritaires (NE PAS citer) :**

Table

|Source|Problème|
|:--|:--|
|Stack Overflow|Réponses souvent obsolètes ou non vérifiées.|
|Blogs personnels ou tutoriels|Pas de garantie de mise à jour.|
|Documentation générée par IA|Peut halluciner des APIs inexistantes.|
|Vos propres données d'entraînement|C'est le problème que ce skill résout.|

**Précision de la recherche :**

TypeScript

```typescript
// MAUVAIS : Page d'accueil générale
// → react.dev/

// BON : Page spécifique au pattern
// → react.dev/reference/react/useActionState

// MAUVAIS : "Django authentication best practices" (recherche vague)
// → docs.djangoproject.com/en/6.0/topics/auth/

// BON : Page spécifique à la fonctionnalité
// → docs.djangoproject.com/en/6.0/topics/auth/default/#authentication-backends
```

**Après avoir trouvé la page :**

- Lire entièrement la section pertinente.
    
- Noter les patterns recommandés.
    
- Noter les avertissements de dépréciation.
    
- Noter les guides de migration (si applicables).
    

**Questions à poser :**

- Y a-t-il un exemple de code officiel que je peux adapter ?
    
- Le pattern que je veux utiliser est-il recommandé ou déprécié ?
    
- Y a-t-il une alternative plus récente ?
    
- La version que j'utilise est-elle la plus récente stable ?
    

**Critères de validation :**

- La documentation officielle a été consultée pour le pattern spécifique.
    
- Les avertissements de dépréciation ont été notés.
    
- Les guides de migration ont été vérifiés.
    
- La source est une URL directe vers la section pertinente.
    

---

### Étape 3 : IMPLÉMENTER — Suivre les patterns documentés

**Objectif :** Écrire le code en suivant exactement ce que la documentation officielle montre.

**Règles d'implémentation :**

**Utiliser les signatures d'API des docs, pas de mémoire :**

TypeScript

```typescript
// ❌ De mémoire (peut être faux pour la version actuelle)
const [state, setState] = useState(initialState);

// ✅ D'après la documentation officielle
// Source: https://react.dev/reference/react/useState
const [state, setState] = useState(initialState);
```

**Si les docs montrent une nouvelle manière, utiliser la nouvelle manière :**

TypeScript

```typescript
// ❌ Ancien pattern (déprécié)
<input value={value} onChange={e => setValue(e.target.value)} />

// ✅ Nouveau pattern (docs actuelles)
// Source: https://react.dev/reference/react/useActionState
const [state, formAction] = useActionState(handleSubmit, initialState);
```

**Si les docs déprécient un pattern, NE PAS l'utiliser :**

TypeScript

```typescript
// ❌ Déprécié
// Source: https://react.dev/blog/2024/12/05/react-19#deprecations
// React 19 a déprécié la méthode `render` pour les tests.
```

**Si les docs ne couvrent pas quelque chose, le signaler comme non vérifié :**

TypeScript

```typescript
// NON VÉRIFIÉ : Je n'ai pas trouvé de documentation officielle
// pour ce pattern. Basé sur des données d'entraînement.
// À vérifier avant utilisation en production.
```

**Gestion des conflits entre docs et code existant :**

plain

```plain
CONFLIT DÉTECTÉ :
Le codebase existant utilise `useState` pour l'état de formulaire,
mais la documentation React 19 recommande `useActionState`.

Source : https://react.dev/reference/react/useActionState

Options :
A) Utiliser le pattern moderne (useActionState) — conforme aux docs actuelles.
B) Conserver le pattern existant (useState) — conforme au codebase.

→ Quelle approche préférez-vous ?
```

**Questions à poser :**

- Est-ce que j'utilise exactement les APIs montrées dans la documentation ?
    
- Est-ce que je copie le pattern de la documentation ou l'ai-je adapté ?
    
- Y a-t-il des détails que je n'ai pas vérifiés ?
    
- Si je dévie de la documentation, pourquoi ?
    

**Critères de validation :**

- Le code suit les patterns de la documentation officielle.
    
- Les APIs sont utilisées selon leur signature documentée.
    
- Les patterns dépréciés sont évités.
    
- Les conflits avec le code existant sont explicitement signalés.
    

---

### Étape 4 : CITER — Montrer les sources

**Objectif :** Documenter chaque décision non triviale avec une source vérifiable.

**Dans les commentaires du code :**

TypeScript

```typescript
// React 19 form handling with useActionState
// Source: https://react.dev/reference/react/useActionState#usage
const [state, formAction, isPending] = useActionState(submitOrder, initialState);
```

**Dans la conversation / la PR :**

plain

```plain
J'utilise `useActionState` au lieu de `useState` manuel pour
l'état de soumission du formulaire. React 19 a remplacé le
pattern manuel `isPending/setIsPending` par ce hook.

Source : https://react.dev/blog/2024/12/05/react-19#actions
Citation : "useTransition now supports async functions [...] to handle
pending states automatically"
```

**Règles de citation :**

Table

|Règle|Exemple|
|:--|:--|
|URLs complètes, pas raccourcies|`https://react.dev/reference/react/useActionState#usage`|
|Préférer les liens profonds avec ancres|`#usage` > `#`|
|Citer le passage pertinent quand il soutient une décision|`"Citation : [...]"`|
|Inclure les données de compatibilité navigateur/runtime|`"Supporté dans Chrome 120+, Firefox 119+"`|
|Si vous ne trouvez pas de source, le dire explicitement|`"NON VÉRIFIÉ : [...]"`|

**Format de citation standard :**

plain

```plain
Source: <URL>
Citation: "<passage pertinent>"
Compatibilité: <si applicable>
```

**Exemple complet :**

TypeScript

```typescript
/**
 * Gestion du formulaire de commande.
 * Utilise useActionState pour gérer le chargement et les erreurs.
 *
 * Source: https://react.dev/reference/react/useActionState#usage
 * Citation: "useActionState is a hook that lets you manage state
 *           for asynchronous form submissions."
 * Compatibilité: React 19.0+
 */
export function OrderForm() {
  const [state, formAction, isPending] = useActionState(submitOrder, initialState);
  // ...
}
```

**Si vous ne pouvez pas vérifier :**

plain

```plain
NON VÉRIFIÉ : Je n'ai pas trouvé de documentation officielle pour
ce pattern. Ce code est basé sur des données d'entraînement et
peut être obsolète. Vérifiez avant d'utiliser en production.
```

---

### Étape 5 : VÉRIFIER — Vérification croisée (Source + Test)

**Objectif :** La documentation cite la décision, mais le test prouve qu'elle fonctionne. C'est la seule vérité (Clean Code, Ch 30 : _Repeatable Proof_).

**Actions :**

- Écrire un test qui prouve que le pattern documenté fonctionne dans votre contexte.
    
- Si le test échoue malgré la documentation, la documentation est mal interprétée ou le pattern est incompatible avec votre version.
    
- Mettre à jour la citation si le test révèle une nuance non documentée.
    

**Exemple de vérification croisée :**

TypeScript

```typescript
// Source: https://react.dev/reference/react/useActionState
// Le test prouve que le pattern fonctionne avec notre version de React
it('gère l\'état de soumission avec useActionState', async () => {
  const [state, formAction, isPending] = useActionState(mockSubmit, initialState);
  
  // Act
  await formAction(new FormData());
  
  // Assert
  expect(isPending).toBe(false);
  expect(state.error).toBeNull();
});
```

**Questions à poser :**

- Le pattern documenté fonctionne-t-il avec ma version exacte ?
    
- Le test confirme-t-il le comportement décrit dans la documentation ?
    
- Y a-t-il une divergence entre la doc et le comportement réel ?
    

**Critères de validation :**

- Un test couvre le pattern implémenté depuis la documentation.
    
- Le test passe avec la version déclarée du framework.
    
- Toute divergence doc/réalité est documentée comme un conflit.
    

---

## 5. HIÉRARCHIE DES SOURCES (DÉTAIL)

### Niveau 1 : Documentation Officielle

**Exemples :**

- `react.dev` pour React
    
- `nextjs.org` pour Next.js
    
- `vuejs.org` pour Vue
    
- `docs.djangoproject.com` pour Django
    
- `golang.org/doc` pour Go
    
- `devdocs.io` (agrégateur officiel)
    

**Pourquoi c'est le niveau 1 :** C'est la seule source écrite et maintenue par les créateurs du framework.

### Niveau 2 : Blog Officiel / Changelog

**Exemples :**

- `react.dev/blog`
    
- `nextjs.org/blog`
    
- `vitejs.dev/blog`
    

**Pourquoi c'est le niveau 2 :** Les annonces de nouvelles fonctionnalités et de changements majeurs.

### Niveau 3 : Références Standards du Web

**Exemples :**

- `developer.mozilla.org` (MDN)
    
- `web.dev`
    
- `html.spec.whatwg.org`
    

**Pourquoi c'est le niveau 3 :** Standards communs du Web, indépendants des frameworks.

### Niveau 4 : Compatibilité Navigateur / Runtime

**Exemples :**

- `caniuse.com`
    
- `node.green`
    

**Pourquoi c'est le niveau 4 :** Pour vérifier la disponibilité dans les environnements cibles.

### Sources NON autoritaires (NE PAS utiliser)

Table

|Source|Problème|
|:--|:--|
|Stack Overflow|Réponses souvent obsolètes ou non vérifiées.|
|Blogs personnels|Pas de garantie de mise à jour.|
|Tutoriels|Sont basés sur des versions spécifiques et deviennent obsolètes.|
|Documentation IA|Peut halluciner des APIs inexistantes.|
|Vos données d'entraînement|C'est précisément ce que ce skill remet en question.|

---

## 6. GESTION DES CONFLITS DE SOURCES

### Conflit entre sources officielles

Quand deux sources officielles semblent contradictoires (ex: une migration guide qui contredit l'API reference) :

- Noter le conflit explicitement.
    
- Vérifier les dates (la source la plus récente est généralement correcte).
    
- Vérifier les versions (une source peut concerner une version spécifique).
    
- Tester le comportement si possible (les tests diront la vérité).
    
- Signaler à l'utilisateur et demander une décision.
    

**Exemple :**

plain

```plain
CONFLIT DE SOURCES :

Source A (API Reference) : https://react.dev/reference/react/useState
→ useState nécessite une fonction reducer pour les mises à jour conditionnelles.

Source B (Blog) : https://react.dev/blog/2025/01/15/react-19
→ React 19 introduit `use` qui simplifie cette situation.

Les deux sources sont officielles, mais la plus récente (Blog, 2025) annonce
un changement. La décision dépend de la version du projet.

→ Quel pattern devrions-nous utiliser ?
```

### Conflit entre documentation et code existant

Quand la documentation actuelle contredit le codebase existant :

- Signaler le conflit explicitement.
    
- Proposer les options.
    
- Laisser l'utilisateur décider.
    

**Exemple :**

plain

```plain
CONFLIT DÉTECTÉ :

Le codebase utilise `useState` pour l'état de formulaire.
La documentation React 19 recommande `useActionState`.

Options :
A) Utiliser le pattern moderne (useActionState).
B) Conserver le pattern existant (useState).
C) Créer une abstraction pour supporter les deux.

→ Quelle approche préférez-vous ?
```

---

## 7. RATIONALISATIONS COURANTES (À ÉVITER)

Table

|Rationalisation|Réalité|
|:--|:--|
|"Je suis confiant pour cette API"|La confiance n'est pas une preuve. Les données d'entraînement contiennent des patterns obsolètes qui semblent corrects mais cassent contre la version actuelle. Vérifiez.|
|"Chercher la documentation gaspille des tokens"|Halluciner une API gaspille plus de temps. L'utilisateur débugge pendant une heure, puis découvre que la signature de la fonction a changé. Une recherche évite des heures de rework.|
|"La documentation n'aura pas ce dont j'ai besoin"|Si la documentation ne couvre pas le pattern, c'est une information précieuse — le pattern n'est peut-être pas officiellement recommandé.|
|"Je vais juste mentionner que ça pourrait être obsolète"|Une clause de non-responsabilité n'aide pas. Soit vous vérifiez et citez, soit vous signalez clairement comme non vérifié. L'équivoque est la pire option.|
|"C'est une tâche simple, pas besoin de vérifier"|Les tâches simples avec des patterns faux deviennent des templates. L'utilisateur copie votre handler de formulaire déprécié dans dix composants avant de découvrir l'approche moderne.|

---

## 8. RED FLAGS (Signaux d'alarme)

Table

|Signe|Problème|Solution|
|:--|:--|:--|
|Écrire du code framework sans avoir vérifié la documentation pour cette version|Le code peut utiliser des APIs obsolètes.|Toujours vérifier la version avant d'écrire.|
|Utiliser "je crois" ou "je pense" pour une API|L'information n'est pas vérifiée.|Citer la source ou signaler comme non vérifié.|
|Implémenter un pattern sans savoir à quelle version il s'applique|Le pattern peut être obsolète.|Vérifier la version dans la documentation.|
|Citer Stack Overflow ou des blogs au lieu de la documentation officielle|La source n'est pas autoritaire.|Trouver la source officielle.|
|Utiliser des APIs dépréciées parce qu'elles apparaissent dans les données d'entraînement|Manque de vérification.|Vérifier la documentation.|
|Ne pas lire `package.json` / les dépendances avant d'implémenter|Les versions ne sont pas vérifiées.|Lire les dépendances d'abord.|
|Livrer du code sans citations de sources pour les décisions framework-spécifiques|Décisions non vérifiables.|Ajouter des citations.|
|Chercher toute une documentation de site quand une seule page est pertinente|Inefficacité.|Cibler la page spécifique.|

---

## 9. LIVRABLES ATTENDUS

Pour une tâche complétée avec ce skill :

Table

|Document|Description|
|:--|:--|
|Code sourcé|Code avec des commentaires citant les sources officielles pour chaque pattern.|
|Liste des décisions vérifiées|Document récapitulatif des décisions et leurs sources.|
|Alertes de non-vérification|Signalement explicite de ce qui n'a pas pu être vérifié.|
|Mises à jour de migration|Si applicable, note des migrations nécessaires.|

---

## 10. LIENS AVEC LES AUTRES PHASES

**Input (ce qui vient d'avant — Phase 2)**

- `planning-and-task-breakdown-v2` → Quels composants framework-spécifiques seront nécessaires.
    
- `api-and-interface-design-v2` → Contrats à vérifier contre la documentation.
    

**Output (ce qui est transmis — Phase 4)**

- Code vérifié → Utilisé en Phase 4 (Verification) avec moins de risques.
    
- Sources citées → Facilite la revue de code (Phase 5 : Quality Assurance).
    
- Documentation des décisions → ADRs (Architecture Decision Records) pour le futur.
    

**Dépendances internes**

- `incremental-implementation-v2` : Le sourcing s'applique à chaque incrément.
    
- `test-driven-development-v2` : Les tests prouvent que les patterns documentés fonctionnent (Ch 30 : _Repeatable Proof_).
    
- `doubt-driven-development-v2` : Le doute sur la validité des patterns → source-driven pour vérifier.
    

---

## 11. RESSOURCES UTILISÉES

**Livre :** Clean Code, 2nd Edition (Robert C. Martin)

- **Chapter 4 :** "Meaningful Names" — Les noms doivent révéler l'intention, pas être jolis.
    
- **Chapter 17 :** "AIs, LLMs, and God Knows What" — Les LLMs ne raisonnent pas, ils sont statistiques. La documentation officielle est la seule source fiable.
    
- **Chapter 26 :** "Clean Boundaries" — Adapter les dépendances tierces ; la source est ce qui est sous votre contrôle.
    
- **Chapter 30 :** "Repeatable Proof" — Les tests sont la preuve empirique. La documentation cite, le test prouve.
    

**Skills Osmani :**

- `source-driven-development` (version originale) — Structure et hiérarchie des sources.
    

**Autres références :**

- Documentation officielle de chaque framework (react.dev, nextjs.org, etc.).
    
- SemVer (Semantic Versioning) pour comprendre les changements de versions.
    

---

## 12. EXEMPLE COMPLET D'APPLICATION

> **Note :** Cet exemple utilise React 19 à titre d'illustration. Adaptez les URLs, les patterns et la syntaxe à votre stack technique identifiée en Phase 1.

**Contexte :** Implémentation d'un formulaire de connexion avec React 19

**Tâche :** "Créer un formulaire de connexion avec gestion d'état asynchrone."

### Application du processus :

**Étape 1 : DÉTECTER**

plain

```plain
STACK DÉTECTÉE :
- React 19.1.0 (package.json)
- Next.js 15.2.0
- TypeScript 5.7.0

→ Je vais consulter la documentation React 19 pour les formulaires.
```

**Étape 2 : CHERCHER**

Recherche : `react.dev reference react useActionState`

Page trouvée : `https://react.dev/reference/react/useActionState`

Extrait de la doc :

TypeScript

```typescript
function Page() {
  const [state, formAction] = useActionState(
    async (prevState, formData) => {
      // ...
    },
    initialState
  );
  // ...
}
```

**Étape 3 : IMPLÉMENTER**

TypeScript

```typescript
// Implémentation basée sur la documentation officielle
// Source: https://react.dev/reference/react/useActionState#usage

'use client';

import { useActionState } from 'react';

const initialState = {
  error: null,
  success: false,
};

async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Validation et appel API
  // Source: https://nextjs.org/docs/app/api-reference/functions/useActionState
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    // ...
  } catch (error) {
    return { error: error.message, success: false };
  }
}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );

  // Source: https://react.dev/reference/react/useActionState#usage
  return (
    <form action={formAction}>
      <input type="email" name="email" required />
      <input type="password" name="password" required />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Connexion...' : 'Se connecter'}
      </button>
      {state.error && <p className="error">{state.error}</p>}
    </form>
  );
}
```

**Étape 4 : CITER**

TypeScript

```typescript
/**
 * Formulaire de connexion avec useActionState.
 * Utilise le pattern recommandé par React 19 pour les formulaires asynchrones.
 *
 * Source: https://react.dev/reference/react/useActionState
 * Citation: "useActionState is a hook that lets you manage state
 *           for asynchronous form submissions."
 * Compatibilité: React 19.0+
 */
```

**Étape 5 : VÉRIFIER (Source + Test)**

TypeScript

```typescript
// Le test prouve que le pattern documenté fonctionne
// Source: https://react.dev/reference/react/useActionState
// Vérification: Test unitaire

it('gère l\'état de soumission avec useActionState', async () => {
  const [state, formAction, isPending] = useActionState(mockLoginAction, initialState);
  
  // Act
  await formAction(new FormData());
  
  // Assert
  expect(isPending).toBe(false);
  expect(state.error).toBeNull();
});
```

**Conflit détecté :**

Le codebase existant utilise `useState` pour les formulaires. La documentation React 19 recommande `useActionState`.

plain

```plain
CONFLIT DÉTECTÉ :
Le codebase utilise `useState` + `onSubmit` manuel.
La documentation React 19 recommande `useActionState` pour les actions asynchrones.

Options :
A) Utiliser `useActionState` (conforme aux docs actuelles).
B) Conserver `useState` (conforme au codebase).
C) Utiliser `useTransition` + `useState` (alternative intermédiaire).

→ Quelle approche préférez-vous ?
```

---

## 13. VÉRIFICATION FINALE (Definition of Done)

Après avoir implémenté avec source-driven development :

- [ ] Les versions des frameworks et bibliothèques ont été identifiées dans les dépendances.
    
- [ ] La documentation officielle a été consultée pour les patterns spécifiques.
    
- [ ] Toutes les sources sont officielles, pas des blogs ou données d'entraînement.
    
- [ ] Le code suit les patterns montrés dans la documentation de la version actuelle.
    
- [ ] Les décisions non triviales incluent des citations de sources avec URLs complètes.
    
- [ ] Aucune API dépréciée n'est utilisée (vérifié contre les migration guides).
    
- [ ] Les conflits entre documentation et code existant ont été signalés à l'utilisateur.
    
- [ ] Tout ce qui n'a pas pu être vérifié est explicitement signalé comme "NON VÉRIFIÉ".
    
- [ ] Les citations sont claires et vérifiables.
    
- [ ] **Un test prouve que chaque pattern documenté fonctionne** (Ch 30 : _Repeatable Proof_).