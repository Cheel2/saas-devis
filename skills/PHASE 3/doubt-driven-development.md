```markdown
# doubt-driven-development-v2

## TL;DR — Quick Reference

**Cycle :** CLAIM (nommer la décision) → EXTRACT (isoler artefact + contrat) → DOUBT (réviseur adversarial à contexte frais) → RECONCILE (classifier les findings) → STOP (3 cycles max).

**Règle d'or :** Ne JAMAIS transmettre la CLAIM au réviseur. ARTEFACT + CONTRACT seulement. Transmettre votre conclusion biaise le réviseur vers l'approbation.

**Pourquoi douter ? (Clean Code, Ch 29)**
> *"No Defect in Behavior or Structure"* — Un professionnel ne laisse passer aucun défaut. Le doute est la discipline qui empêche les défauts de passer inaperçus. La confiance corrèle mal avec la correction sur les problèmes nouveaux.

**Source + Doute = Vérité (Clean Code, Ch 30)**
- La **documentation** cite la décision.
- Le **test** prouve le comportement.
- Le **doute** attrape les angles morts avant qu'ils ne deviennent des bugs.

**3 cycles max.** Si après 3 cycles le réviseur trouve encore des problèmes substantiels, le problème est l'artefact, pas le nombre de cycles.

---

## 1. OBJECTIF DU SKILL

**Pourquoi ce skill existe ?**
Les sessions de travail prolongées créent un biais de confirmation insidieux : les hypothèses deviennent des "faits" sans que personne ne les remette en question. Les IA, comme les humains, deviennent confiantes dans leurs propres raisonnements et cessent de voir les angles morts. Ce skill matérialise un réviseur "à contexte frais" dont le seul objectif est de disprover, pas d'approuver. C'est la discipline qui empêche les décisions non triviales de passer sans examen contradictoire.

**Quel problème résout-il ?**
- Évite les décisions architecturales basées sur des hypothèses non vérifiées.
- Détecte les cas limites oubliés avant qu'ils ne deviennent des bugs en production.
- Empêche les "blind spots" d'équipe (tout le monde pense la même chose → tout le monde a tort de la même manière).
- Réduit le coût des erreurs en les attrapant quand la correction est encore bon marché.

**Dans quel contexte l'utiliser ?**
- Décisions architecturales sous incertitude.
- Code non trivial (plus de 50 lignes, logique complexe, changements dans plusieurs fichiers).
- Affirmations non évidentes ("ceci est thread-safe", "cela scale", "cela correspond à la spec").
- Travail dans du code que vous ne comprenez pas parfaitement.
- Tout changement à fort impact (production, données, API publique).

### Quand NE PAS utiliser ce skill

Ne pas appliquer `doubt-driven-development` dans les cas suivants :

- **Opérations mécaniques** : renommage, formatage, déplacement de fichiers.
- **Suivre une instruction utilisateur claire et sans ambiguïté.**
- **Lecture ou résumé de code existant.**
- **Changements d'une ligne avec correction évidente.**
- **Opérations d'outillage pures** : lancer des tests, lister des fichiers.
- **L'utilisateur a explicitement demandé la rapidité avant la vérification.**

Si vous doutez de chaque frappe, vous ne livrez rien. Ce skill s'applique uniquement aux décisions non triviales.

---

## 2. PRÉREQUIS

**Ce qui doit être déjà fait :**
- ✅ Une décision non triviale a été identifiée (voir définition ci-dessous).
- ✅ Le contexte de la décision est documenté (contraintes, objectifs).
- ✅ L'artefact à revoir (code, design, décision) est disponible et isolable.

**Qu'est-ce qu'une décision "non triviale" ?**

Une décision est non triviale si au moins une de ces conditions est vraie :
- Elle introduit ou modifie une logique de branchement (if, switch, loop).
- Elle traverse une frontière de module ou de service.
- Elle affirme une propriété que le type system ou le compilateur ne peut pas vérifier (thread-safety, idempotence, ordonnancement, invariants).
- Sa correction dépend d'un contexte que le futur lecteur ne pourra pas voir.
- Son rayon d'explosion est irreversible (déploiement en production, migration de données, changement d'API publique).

---

## 3. RÔLES ET RESPONSABILITÉS

| Rôle | Responsabilités |
|------|-----------------|
| **Orchestrateur (IA/Humain)** | Identifie les décisions non triviales. Extrait l'artefact et le contrat. Formule la CLAIM. Lance le réviseur à contexte frais. Reconcilie les retours et classe les findings. Décide de l'arrêt du cycle. |
| **Réviseur Adversaire (Subagent / IA externe)** | Reçoit ARTEFACT + CONTRACT (PAS la CLAIM). Identifie les problèmes, pas les qualités. Ne fournit PAS de solutions (sauf si demandé). Produit une liste de "ce qui pourrait mal tourner". |
| **Cross-Model (Optionnel)** | Deuxième opinion avec une architecture différente. Attrape les blind spots du premier modèle. Utilisé seulement si l'utilisateur l'autorise. |
| **Décideur (Utilisateur)** | Autorise ou non les cross-model. Prend les décisions finales sur les trade-offs. |

---

## 4. LOADING CONSTRAINTS (Contraintes d'orchestration)

> **CRITIQUE :** Ce skill est conçu pour l'**orchestrateur de session principale** (main session).  
> **NE PAS ajouter ce skill au `skills:` frontmatter d'un persona.**  
> Un persona qui suit l'étape 3 (DOUBT) et spawn un autre persona crée un anti-pattern d'orchestration (voir `references/orchestration-patterns.md` : "personas do not invoke other personas").  
> 
> **Si vous vous trouvez dans un contexte de subagent** où le spawn est impossible : utilisez le **fallback de dégradé** (self-questioning) décrit dans la section "Fallback sans subagent" ci-dessous. Signalez explicitement que le résultat est dégradé et préférez l'escalade quand l'utilisateur est joignable.

---

## 5. PROCESSUS DÉTAILLÉ (Étape par Étape)

### Le Cycle : CLAIM → EXTRACT → DOUBT → RECONCILE → STOP
```

CLAIM EXTRACT DOUBT RECONCILE STOP │ │ │ │ │ ▼ ▼ ▼ ▼ ▼ Nommer la Isoler le Lancer un Classifier les Condition décision + plus petit réviseur à retours : d'arrêt pourquoi unité contexte frais - Contract misread atteinte elle compte revoyable avec prompt - Valid + Actionnable + son adversarial - Valid + Trade-off contrat - Noise

plain

````plain

---

### Étape 1 : CLAIM — Formuler la décision

**Objectif :** Nommer explicitement la décision, son hypothèse, et son importance.

**Structure de la CLAIM :**

```markdown
CLAIM : "[La décision que vous êtes sur le point de prendre]"

WHY THIS MATTERS : "[Pourquoi cette décision est importante
et ce qui arriverait si elle était fausse]"
````

**Exemples :**

markdown

```markdown
CLAIM : "Le nouveau cache est thread-safe sous la charge
        décrite dans la spécification."

WHY THIS MATTERS : Une race condition ici corrompt les données
utilisateur et est difficile à détecter en QA.
```

markdown

```markdown
CLAIM : "Cette abstraction de base de données isolera
        complètement la couche métier du schéma."

WHY THIS MATTERS : Si l'abstraction fuit, les migrations
de schéma deviendront coûteuses et risquées.
```

**Si vous ne pouvez pas formuler la CLAIM en 2-3 lignes :**

- Vous avez un "vibe", pas une décision.
    
- Reformulez jusqu'à ce que la décision soit claire.
    
- Ou décomposez en plusieurs décisions plus petites.
    

**Questions à poser :**

- Quelle est l'hypothèse sous-jacente ?
    
- Qu'est-ce qui rend cette décision non triviale ?
    
- Que se passerait-il si cette décision était fausse ?
    
- Qui d'autre est concerné par cette décision ?
    

**Critères de validation :**

- La CLAIM est formulée en 2-3 lignes.
    
- La CLAIM est spécifique (pas vague ou générale).
    
- WHY THIS MATTERS est clair et concret.
    
- La décision est effectivement non triviale (selon la définition).
    

---

### Étape 2 : EXTRACT — Isoler l'artefact et le contrat

**Objectif :** Préparer le plus petit unité revoyable, en séparant l'artefact du raisonnement.

**Structure de l'EXTRACT :**

markdown

```markdown
ARTEFACT :
[Le code, le diff, la décision, ou l'assertion à revoir]
[Doit tenir dans l'esprit du réviseur en une lecture]

CONTRACT :
[Les contraintes que l'artefact doit satisfaire]
[Ce qui est "attendu" et "acceptable"]
```

**Règles :**

- **Séparer l'artefact du raisonnement.** Ne transmettez PAS votre raisonnement au réviseur. Le réviseur doit conclure par lui-même.
    
- **Isoler le plus petit unité possible.**
    
    - Code : le diff ou la fonction, pas le fichier entier.
        
    - Décision : la proposition en 3-5 phrases.
        
    - Assertion : la claim + les preuves supposées (gardées distinctes).
        
- **Rendre le contrat explicite.**
    
    - Qu'est-ce que l'artefact doit faire ?
        
    - Quelles sont les contraintes (performance, sécurité, etc.) ?
        
    - Qu'est-ce qui est hors de portée ?
        

**Exemple :**

markdown

````markdown
ARTEFACT :
```typescript
function calculateDiscount(user: User, total: number): number {
  if (user.isPremium) {
    return total * 0.15;
  }
  if (total > 500) {
    return total * 0.05;
  }
  return 0;
}
````

CONTRACT :

- La remise ne doit jamais dépasser 15% du total.
    
- Les utilisateurs premium doivent avoir la remise maximale.
    
- Le total est en euros, toujours positif.
    
- La fonction doit être pure (pas d'effets de bord).
    

plain

```plain

**Questions à poser :**
- Quel est le plus petit code qui capture la décision ?
- Quelles sont les contraintes essentielles ?
- Qu'est-ce que le réviseur doit savoir pour évaluer ?

**Critères de validation :**
- L'artefact est isolé et minimal.
- Le contrat est explicite et mesurable.
- Le raisonnement n'est pas inclus (seulement l'artefact + contrat).
- L'unité est revoyable en une lecture.

---

### Étape 3 : DOUBT — Lancer le réviseur à contexte frais

**Objectif :** Faire examiner l'artefact par un réviseur qui n'a pas le contexte et le biais de l'auteur.

**Le Prompt Adversarial (obligatoire) :**
```

Revue adverse. Trouvez ce qui NE VA PAS dans cet artefact.

Partez du principe que l'auteur est trop confiant. Recherchez :

- Les hypothèses non formulées
    
- Les cas limites non traités
    
- Le couplage caché ou l'état partagé
    
- Les façons dont le contrat pourrait être violé
    
- Les conventions existantes que cela pourrait casser
    
- Les modes d'échec sous des entrées inattendues
    

Ne VALIDEZ PAS. Ne RÉSUMEZ PAS. Trouvez des problèmes, ou dites explicitement que vous n'en trouvez aucun après un examen approfondi.

ARTEFACT : <coller l'artefact>

CONTRACT : <coller le contrat>

plain

````plain

**Règles essentielles :**

1. **NE PAS transmettre la CLAIM.**
   - Transmettre votre conclusion biaise le réviseur vers l'approbation.
   - Le réviseur doit déterminer indépendamment si l'artefact satisfait le contrat.

2. **NE PAS transmettre le raisonnement.**
   - Transmettre comment vous en êtes arrivé à cette décision biaise le réviseur.
   - Le réviseur doit partir des faits (artefact + contrat) seulement.

3. **Utiliser le prompt adversarial tel quel.**
   - Le prompt ci-dessus prime sur le comportement par défaut du persona.
   - "Find what is wrong" ≠ "Tell me what you think".

**Utilisation des Subagents :**

```markdown
Utilisez le persona code-reviewer avec le prompt adversarial ci-dessus.
Assurez-vous que le prompt prime sur le comportement par défaut du persona.

Pas de contexte supplémentaire. Juste ARTEFACT + CONTRACT.
````

**Questions à poser (au subagent) :**

- Quelles hypothèses ai-je formulées sans le dire ?
    
- Quels cas limites ai-je oubliés ?
    
- Y a-t-il des dépendances cachées ?
    

**Critères de validation :**

- Le prompt est adversarial ("trouver ce qui est faux").
    
- Seul ARTEFACT + CONTRACT ont été transmis.
    
- Le raisonnement et la CLAIM n'ont PAS été transmis.
    
- Le prompt prime sur le comportement par défaut du persona.
    

---

### Étape 4 : RECONCILE — Classifier les retours

**Objectif :** Analyser les retours du réviseur et décider quoi en faire.

**Ordre de précédence (premier matching gagne) :**

Table

|Classification|Description|Action|
|:--|:--|:--|
|**Contract misread**|Le réviseur a mal compris le contrat.|Clarifier le contrat, re-loop.|
|**Valid + Actionnable**|Vrai problème, corrigible.|Corriger l'artefact, re-loop.|
|**Valid + Trade-off**|Problème réel mais coût de correction > coût d'acceptation.|Documenter le trade-off, accepter.|
|**Noise**|Faux positif (contexte manquant, mal compris).|Noter, passer à autre chose.|

**Processus de classification :**

Pour chaque finding :

1. Relire l'artefact textuellement.
    
2. Le réviseur a-t-il vu quelque chose que vous n'avez pas vu ?
    
3. Le réviseur a-t-il mal compris quelque chose ?
    
4. Appliquer l'ordre de précédence.
    
    - Si le contrat est ambigu → Contract misread.
        
    - Si le problème est réel et corrigible → Actionnable.
        
    - Si le problème est réel mais coûteux à corriger → Trade-off.
        
    - Si le problème n'existe pas vraiment → Noise.
        
5. Agir en conséquence.
    
    - Actionnable : Corriger et re-loop.
        
    - Trade-off : Documenter et accepter.
        
    - Noise : Noter et passer.
        

**Exemple de classification :**

markdown

```markdown
FINDING #1 : "La fonction n'est pas pure car elle modifie une variable globale."

CLASSIFICATION : Valid + Actionnable
ACTION : Remplacer la variable globale par un paramètre.
NEXT : Re-loop avec l'artefact corrigé.

FINDING #2 : "La fonction ne gère pas le cas où la date est dans le futur."

CLASSIFICATION : Contract misread
RAISON : Le contrat spécifie explicitement que la date est toujours passée.
ACTION : Clarifier le contrat dans la documentation.
NEXT : Ne pas corriger le code, mais clarifier le contrat pour les futurs lecteurs.

FINDING #3 : "La fonction pourrait causer un deadlock en environnement multithread."

CLASSIFICATION : Valid + Trade-off
RAISON : L'environnement est mono-thread (spécifié dans le contrat).
ACTION : Documenter l'absence de threads dans le contrat.
COÛT DE CORRECTION : Réarchitecture majeure.
NEXT : Accepter le trade-off, documenter.
```

**Questions à poser :**

- Le réviseur a-t-il vu quelque chose que j'ai raté ?
    
- Le réviseur a-t-il un contexte différent du mien ?
    
- Quel est le coût réel de la correction ?
    
- Quel est le risque de ne pas corriger ?
    

**Critères de validation :**

- Chaque finding a été classé (pas ignoré).
    
- La classification a été faite en relisant l'artefact (pas en acceptant le réviseur).
    
- Les actions sont décidées pour chaque finding.
    
- Les trade-offs sont documentés.
    

---

### Étape 5 : STOP — Condition d'arrêt

**Objectif :** Décider quand arrêter le cycle.

**Conditions d'arrêt (premier matching gagne) :**

1. **Trivial :** Le prochain cycle ne produira que des findings triviaux ou déjà considérés. → STOP, documenter les résultats.
    
2. **3 cycles complétés :** Trois cycles de DOUBT sont suffisants. → STOP, escalader à l'utilisateur si nécessaire.
    
3. **User override :** L'utilisateur dit explicitement "ship it". → STOP, délivrer.
    

**Si après 3 cycles le réviseur trouve encore des problèmes substantiels :**

plain

```plain
3 cycles complets. L'artefact n'est pas encore prêt.

Problèmes substantiels restants :
1. [Problème #1]
2. [Problème #2]

Options :
A) Continuer le cycle (je veux plus de revues).
B) Revoir l'approche (l'artefact est fondamentalement problématique).
C) Accepter les risques (déployer quand même).

→ Quelle option préférez-vous ?
```

**Si 3 cycles est "manifestement insuffisant" :**

- L'artefact est trop gros — retour à Étape 2 (EXTRACT).
    
- Décomposer en plus petits artefacts.
    
- **Ne pas dépasser 3 cycles.** 3 cycles est une borne, pas une suggestion. Si 3 cycles n'ont pas suffi, le problème est l'artefact, pas le nombre de cycles.
    

**Critères de validation :**

- Une condition d'arrêt est atteinte.
    
- Les résultats des cycles sont documentés.
    
- Si l'utilisateur a été escaladé, la réponse est documentée.
    

---

## 6. FALLBACK SANS SUBAGENT (Mode dégradé)

Si vous êtes dans un contexte où le spawn de subagent est impossible (subagent imbriqué, environnement limité, etc.), utilisez ce fallback :

**Procédure :**

1. Réécrire ARTEFACT + CONTRACT comme un auto-prompt avec un séparateur mental fort.
    
2. Changer de "rôle" mentalement : vous n'êtes plus l'auteur, vous êtes le réviseur.
    
3. Appliquer le prompt adversarial à vous-même.
    
4. Classer vos propres findings comme en Étape 4.
    
5. **Signaler explicitement :** _"Résultat dégradé — pas de contexte frais réel. Préférer une revue externe quand possible."_
    

**Exemple d'auto-prompt :**

plain

```plain
--- SÉPARATEUR MENTAL ---
Je suis maintenant un réviseur à contexte frais. Je n'ai pas écrit ce code.
Je dois trouver ce qui est faux dans l'artefact suivant.

ARTEFACT :
[...]

CONTRACT :
[...]
--- SÉPARATEUR MENTAL ---
```

> **Attention :** Ce fallback est **dégradé** par définition. Vous portez votre propre contexte avec vous. Utilisez-le uniquement quand aucune autre option n'est disponible, et signalez-le toujours.

---

## 7. CROSS-MODEL ESCALATION (Optionnel)

**Objectif :** Obtenir une seconde opinion avec une architecture différente pour attraper les blind spots.

### Processus interactif (toujours offrir)

**Étape 1 : Demander à l'utilisateur**

Après le DOUBT (Étape 3), avant RECONCILE :

plain

```plain
Revue par un modèle unique terminée. Voulez-vous une seconde opinion
avec un modèle différent ?

Options :
- <votre_cli_ia> (autre architecture)
- Revue manuelle externe (vous la faites ailleurs)
- Skip (continuer avec les findings actuels)
```

Cette question est obligatoire dans chaque cycle interactif.

**Étape 2 : Si l'utilisateur choisit un CLI**

1. Vérifier que l'outil est dans le PATH.
    
    bash
    
    ```bash
    which <votre_cli_ia>
    ```
    
2. Tester que l'outil fonctionne.
    
    bash
    
    ```bash
    <votre_cli_ia> --version
    ```
    
3. Confirmer l'invocation exacte avec l'utilisateur (flags, auth, variables d'environnement).
    
4. Passer ARTEFACT + CONTRACT + prompt adversarial **SEULEMENT**.
    
    - Pas de contexte de session.
        
    - Pas de CLAIM.
        
5. Faire attention à l'échappement shell. Préférer `echo … | <outil>` ou heredoc sur `-p "…"`.
    

> **Note d'adaptation :** Remplacez `<votre_cli_ia>` par l'outil disponible dans votre environnement (ex: `kimi`, `qwen-cli`, `aider`, `codex`, `gemini`, etc.). Les flags et la syntaxe varient selon l'outil — ne jamais assumer.

**Exemple d'invocation générique :**

bash

```bash
# Écrire le prompt complet dans un fichier temporaire.
# Puis pipe via stdin pour éviter les métacaractères shell.

<votre_cli_ia> <flags> < /tmp/doubt-prompt.md
```

**Le sandbox read-only est critique :** Un artefact de doute peut contenir des instructions malveillantes. Un CLI cross-model pourrait les exécuter contre votre workspace. Utilisez toujours un mode read-only si disponible.

**Étape 3 : Si le CLI est indisponible**

plain

```plain
❌ <votre_cli_ia> non disponible (ou échec).

Options :
- Exécuter la revue manuellement (vous la faites ailleurs)
- Essayer un autre outil
- Skip (continuer avec les findings du premier modèle)
```

Ne pas tomber silencieusement sur le premier modèle.

**Étape 4 : Si l'utilisateur skip**

plain

```plain
→ Procéder avec les findings du modèle unique seulement.
```

Skipper est OK. Skipper silencieusement ne l'est pas.

### Contexte non-interactif (CI, /loop, autonome)

- Cross-model est **skip**, et le skip doit être **annoncé**.
    
- **Ne jamais invoquer un CLI externe sans autorisation explicite.**
    

---

## 8. DOUBT THEATER (Détection)

**Doubt theater :** Le réviseur a trouvé des problèmes substantiels pendant plusieurs cycles, mais aucun n'a été classé comme "Actionnable". Vous validez, vous ne doutez pas.

**Signal détectable :**

- Cycle 1 : 5 findings substantiels → 0 actionnables
    
- Cycle 2 : 4 findings substantiels → 0 actionnables
    
- Cycle 3 : 3 findings substantiels → 0 actionnables
    

**Action :** STOP et ESCALADER.

plain

```plain
DOUBT THEATER DÉTECTÉ :

Sur 3 cycles, le réviseur a trouvé 12 problèmes substantiels,
dont 0 classés comme actionnables. Vous validez, vous ne doutez pas.

Options :
A) Réexaminer les classifications (peut-être que des problèmes sont actionnables).
B) Accepter que vous êtes en désaccord avec le réviseur (problèmes de contexte).
C) Demander un cross-model (autre architecture).

→ Quelle option préférez-vous ?
```

---

## 9. RATIONALISATIONS COURANTES (À ÉVITER)

Table

|Rationalisation|Réalité|
|:--|:--|
|"Je suis confiant, je peux sauter l'étape de doute"|La confiance corrèle mal avec la correction sur les problèmes nouveaux. Les moments de certitude sont exactement quand les angles morts se cachent.|
|"Lancer un réviseur est trop coûteux"|Déboguer un commit erroné en production est plus coûteux. Le cycle est borné ; le bug ne l'est pas.|
|"Le réviseur va juste chipoter"|Seulement si non cadré. Contraintez le prompt à "problèmes qui feraient échouer l'artefact sous le contrat."|
|"Je ferai le doute à la fin avec /review"|/review est une porte de sortie finale. Le doute attrape les mauvaises directions tôt, quand la correction est bon marché. À la PR, il est trop tard.|
|"Si je doute à chaque étape, je ne livrerai jamais"|Le skill s'applique aux décisions non triviales, pas à chaque frappe. Relisez "Quand NE PAS utiliser".|
|"Deux opinions valent toujours mieux qu'une"|Pas quand la seconde a moins de contexte et produit du bruit. Reconciliez, ne déléguez pas.|
|"Le réviseur est en désaccord donc j'ai tort"|Le réviseur manque votre contexte — le désaccord est une information, pas un verdict. Relisez l'artefact, classez, puis décidez.|
|"L'utilisateur a dit oui une fois, je peux réinvoquer le CLI"|Chaque invocation est sa propre autorisation. L'artefact, le prompt, et les flags changent entre les appels — re-confirmez à chaque fois.|

---

## 10. RED FLAGS (Signaux d'alarme)

Table

|Signe|Problème|Solution|
|:--|:--|:--|
|Lancer un réviseur pour un renommage d'une ligne|Le skill est utilisé hors contexte.|Vérifier "Quand NE PAS utiliser".|
|Traiter la sortie du réviseur comme autoritaire sans relire l'artefact|Délégation excessive.|Relire l'artefact, classifier.|
|Faire >3 cycles sans escalader à l'utilisateur|Boucle infinie.|S'arrêter à 3 cycles.|
|Prompt du réviseur avec "est-ce bon ?" au lieu de "trouver les problèmes"|Le prompt n'est pas adversarial.|Utiliser le prompt exact.|
|Sauter le doute sous pression de temps sur une décision critique|Le risque est maximal quand la pression est haute.|Appliquer le skill rigoureusement.|
|Re-lancer un réviseur sur un artefact inchangé|Vous tournez en rond.|Si le réviseur dit la même chose, c'est probablement vrai.|
|Hardcoder une invocation CLI externe sans confirmer avec l'utilisateur|L'outil peut être absent ou mal configuré.|Vérifier PATH, version, syntaxe.|
|Skipper silencieusement le cross-model en contexte interactif|L'utilisateur ne sait pas que l'option existe.|Offrir explicitement.|
|Passer la CLAIM au réviseur|Biaise le réviseur vers l'approbation.|Ne passer que ARTEFACT + CONTRACT.|
|Utiliser le fallback self-questioning sans le signaler comme dégradé|L'utilisateur croit à une revue à contexte frais.|Toujours signaler "dégradé".|

---

## 11. INTERACTIONS AVEC LES AUTRES SKILLS

Table

|Skill|Interaction|
|:--|:--|
|`code-review-and-quality` / `/review`|Complémentaire. `/review` est un verdict final sur une PR ; doubt-driven est un doute par décision en cours. Utiliser les deux.|
|`source-driven-development`|SDD vérifie les faits sur les frameworks contre la documentation officielle. Doubt-driven vérifie votre raisonnement sur l'artefact. SDD vérifie que l'API existe ; doubt-driven vérifie que vous l'avez utilisée correctement sous le contrat.|
|`test-driven-development`|L'étape RED de TDD est un doute matérialisé — un test qui échoue est une tentative de réfutation. Quand TDD s'applique, ce test qui échoue est l'étape de doute pour les affirmations comportementales.|
|`debugging-and-error-recovery`|Quand le réviseur trouve un véritable mode d'échec, passer au skill de débogage pour localiser et corriger.|
|`incremental-implementation`|Le doute s'applique à chaque incrément. Un incrément non trivial → DOUBT avant de passer au suivant.|

---

## 12. LIVRABLES ATTENDUS

Pour une décision traitée avec ce skill :

Table

|Document|Description|
|:--|:--|
|Liste des CLAIMs|Chaque décision non triviale nommée explicitement.|
|Artefacts revus|Le code ou la décision, isolé et minimal.|
|Contrats|Les contraintes que l'artefact doit satisfaire.|
|Findings classés|Les retours du réviseur, classés et traités.|
|Trade-offs documentés|Les problèmes acceptés, avec leur justification.|
|Décision finale|La décision prise après le cycle de doute.|

---

## 13. LIENS AVEC LES AUTRES PHASES

**Input (ce qui vient d'avant — Phase 2)**

- `planning-and-task-breakdown-v2` → Quelles décisions architecturales nécessitent un doute ?
    
- `api-and-interface-design-v2` → Les contrats d'API sont des candidates naturelles au doute.
    

**Output (ce qui est transmis — Phase 4)**

- Décisions validées → Utilisées en Phase 4 (Verification) avec moins de risques.
    
- Findings documentés → Facilitent la revue de code (Phase 5 : Quality Assurance).
    

**Dépendances internes**

- `incremental-implementation-v2` : Le doute s'applique à chaque incrément non trivial.
    
- `test-driven-development-v2` : Le test qui échoue (RED) est la matérialisation du doute.
    
- `source-driven-development-v2` : Le doute sur la validité des patterns → source-driven pour vérifier.
    

---

## 14. RESSOURCES UTILISÉES

**Livre :** Clean Code, 2nd Edition (Robert C. Martin)

- **Chapter 1 :** "Clean Code" — L'attitude professionnelle : le doute comme discipline.
    
- **Chapter 17 :** "AIs, LLMs, and God Knows What" — Les LLMs ne raisonnent pas, ils sont statistiques. Le doute est nécessaire.
    
- **Chapter 28 :** "Harm" — Douter prévient le "harm to structure" (code qui dégrade la structure du système).
    
- **Chapter 29 :** "No Defect in Behavior or Structure" — Un professionnel ne laisse passer aucun défaut. Le doute est la discipline qui empêche les défauts de passer.
    
- **Chapter 30 :** "Repeatable Proof" — Le doute doit être matérialisé (test, réviseur), pas seulement ressenti.
    

**Skills Osmani :**

- `doubt-driven-development` (version originale) — Structure et cycle de base.
    

**Autres références :**

- `references/orchestration-patterns.md` — Contraintes d'orchestration (anti-pattern persona→persona).
    

---

## 15. EXEMPLE COMPLET D'APPLICATION

**Contexte :** Implémentation d'un cache avec expiration

**Décision :** "Utiliser un Map avec des timestamps pour le cache, avec nettoyage périodique."

### Application du processus :

**Étape 1 : CLAIM**

markdown

```markdown
CLAIM : "Un cache basé sur Map avec expiration par timestamp
        est suffisant pour notre charge (1000 requêtes/sec)."

WHY THIS MATTERS : Si le cache ne gère pas correctement
l'expiration ou les accès concurrents, nous aurons des
données périmées ou des fuites mémoire.
```

**Étape 2 : EXTRACT**

markdown

````markdown
ARTEFACT :
```typescript
class Cache<K, V> {
  private store = new Map<K, { value: V; expiresAt: number }>();

  set(key: K, value: V, ttl: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  }

  get(key: K): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  // Nettoyage périodique toutes les 5 secondes
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}
````

CONTRACT :

- Thread-safe (appelé depuis plusieurs threads)
    
- Pas de fuite mémoire (les entrées expirées sont supprimées)
    
- Performance : < 1ms par opération
    
- TTL en millisecondes, positif
    

plain

```plain

**Étape 3 : DOUBT**

Réviseur (adversarial) :
```

FINDING #1 : "La classe n'est pas thread-safe. Map n'est pas thread-safe, et les opérations get + delete ne sont pas atomiques."

FINDING #2 : "cleanup() doit être appelée manuellement. Si elle ne l'est pas, les entrées expirées restent dans la mémoire (fuite)."

FINDING #3 : "get() fait une mutation (delete) ce qui est un effet de bord inattendu — un get ne devrait pas supprimer."

FINDING #4 : "Le TTL en millisecondes peut causer des problèmes si l'horloge système change (NTP, heure d'hiver)."

plain

````plain

**Étape 4 : RECONCILE**

```markdown
FINDING #1 : "Pas thread-safe."

CLASSIFICATION : Valid + Actionnable
ACTION : Ajouter un Mutex ou utiliser ConcurrentMap.
NEXT : Re-loop avec l'artefact corrigé.

FINDING #2 : "cleanup() manuelle = risque de fuite."

CLASSIFICATION : Valid + Trade-off
RAISON : Nous utilisons un scheduler externe qui appelle cleanup().
COÛT DE CORRECTION : Réarchitecture majeure (auto-cleanup).
ACTION : Documenter que cleanup() doit être appelée régulièrement.
NEXT : Accepter le trade-off, documenter.

FINDING #3 : "get() fait delete = effet de bord."

CLASSIFICATION : Valid + Actionnable
ACTION : Séparer get() (lecture seule) et cleanup() (mutation).
NEXT : Re-loop avec l'artefact corrigé.

FINDING #4 : "TTL avec horloge système."

CLASSIFICATION : Valid + Trade-off
RAISON : Le système utilise une horloge NTP synchronisée.
COÛT DE CORRECTION : Utiliser monotonic clock (complexe).
ACTION : Documenter l'hypothèse d'horloge stable.
NEXT : Accepter le trade-off, documenter.
````

**Étape 5 : STOP**

plain

```plain
STOP : 2 cycles complétés, tous les findings substantiels traités.

Décision finale :
- La classe est maintenant thread-safe (Mutex ajouté).
- get() ne mute plus (suppression déplacée dans cleanup).
- cleanup() doit être appelée régulièrement (documenté).
- L'hypothèse d'horloge stable est documentée.

→ Prêt pour intégration.
```

---

## 16. VÉRIFICATION FINALE (Definition of Done)

Après avoir appliqué doubt-driven development :

- [ ] Chaque décision non triviale a été nommée explicitement comme CLAIM.
    
- [ ] Au moins une revue à contexte frais par artefact non trivial.
    
- [ ] Le réviseur a reçu ARTEFACT + CONTRACT — PAS la CLAIM.
    
- [ ] Le prompt du réviseur était adversarial ("find issues"), pas validant.
    
- [ ] Les findings ont été classés contre l'artefact (ordre de précédence).
    
- [ ] Une condition d'arrêt a été atteinte (trivial, 3 cycles, ou user override).
    
- [ ] En mode interactif, le cross-model a été explicitement offert.
    
- [ ] En mode non-interactif, le cross-model a été skip et annoncé.
    
- [ ] Tout CLI externe a été précédé d'une vérification PATH + syntaxe + autorisation.
    
- [ ] Si fallback self-questioning utilisé, signalé comme "dégradé".
    
- [ ] Aucun "Doubt Theater" non détecté (findings substantiels mais 0 actionnables sur 3 cycles).