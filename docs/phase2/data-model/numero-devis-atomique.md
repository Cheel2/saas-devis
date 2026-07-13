## Section 1 : QCM — Choix du mécanisme de stockage

### Option A : Table de compteurs avec UPSERT atomique (INSERT ... ON CONFLICT DO UPDATE)

**Description technique** : Une table dédiée `devis_counter` stocke le dernier compteur par entreprise et par année. La génération d'un numéro se fait via un UPSERT PostgreSQL qui verrouille la ligne concernée, incrémente le compteur, et retourne la valeur atomiquement.

**Avantage principal** : Atomicité SQL native sans verrou explicite. L'UPSERT (`ON CONFLICT DO UPDATE`) gère simultanément la création du compteur pour une nouvelle année et l'incrément pour une année existante, avec un verrou de ligne implicite qui empêche toute race condition.

**Inconvénient principal** : Verrouillage de la ligne `devis_counter` pendant la transaction. Si plusieurs commerciaux créent un devis simultanément dans la même entreprise, ils s'attendent mutuellement sur cette ligne. Acceptable car le trafic est < 5 req/sec (criticité 1/5) et la durée du verrou est inférieure à la milliseconde.

### Option B : Colonnes de compteur dans la table entreprise (UPDATE ... RETURNING)

**Description technique** : Deux colonnes `dernier_numero` et `derniere_annee` sont ajoutées à la table `entreprise`. La génération du numéro se fait par un `UPDATE entreprise SET dernier_numero = dernier_numero + 1 WHERE id = ? AND derniere_annee = ? RETURNING dernier_numero`.

**Avantage principal** : Aucune table supplémentaire. Une seule requête sans JOIN ni sous-requête. Le compteur est co-localisé avec l'entreprise.

**Inconvénient principal** : La ligne `entreprise` est verrouillée à chaque création de devis. Cela bloque toute lecture ou modification du profil entreprise (logo, coordonnées bancaires) pour tous les utilisateurs de cette entreprise pendant la transaction. Impact inacceptable sur la disponibilité du profil entreprise.

### Option C : Verrouillage par advisory lock (pg_advisory_lock) avec table de compteurs

**Description technique** : Une table `devis_counter` stocke le compteur. Avant toute opération, la session acquiert un verrou advisory (`pg_advisory_lock`) basé sur le hash de `entreprise_id + annee`, puis lit le compteur, l'incrémente, et libère le verrou.

**Avantage principal** : Le verrou advisory ne bloque pas la table ni la ligne. Il est indépendant des transactions et des tables, ce qui élimine la contention sur les index de `devis_counter`.

**Inconvénient principal** : Le verrou advisory est par session et doit être explicitement libéré (`pg_advisory_unlock`). Si la session est interrompue (timeout, crash de l'Edge Function), le verrou persiste jusqu'à la fin de la session, bloquant toute autre création de devis pour cette entreprise. Complexité opérationnelle injustifiée pour un trafic faible.

### Recommandation

**Option A** (Table de compteurs avec UPSERT atomique).

Justification : L'atomicité est garantie par le mécanisme natif `ON CONFLICT DO UPDATE` de PostgreSQL, qui verrouille la ligne de manière implicite et transactionnelle. Le verrou est de courte durée (lecture + écriture d'une seule ligne) et la contention est négligeable vu le trafic prévisionnel (< 5 req/sec). L'approche est standard, maintenable, et ne requiert aucune gestion manuelle de verrou. Elle gère nativement la réinitialisation annuelle (nouvelle ligne pour chaque année) et ne pollue pas la table `entreprise` avec des données techniques.

## Section 2 : Requête atomique

```sql
-- Table de compteurs par entreprise et par année
CREATE TABLE IF NOT EXISTS devis_counter (
    entreprise_id UUID NOT NULL REFERENCES entreprise(id) ON DELETE CASCADE,
    annee INTEGER NOT NULL,
    compteur INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (entreprise_id, annee)
);

-- Fonction atomique de génération de numéro de devis
CREATE OR REPLACE FUNCTION generer_numero_devis(p_entreprise_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_prefixe VARCHAR(10);
    v_annee INTEGER;
    v_compteur INTEGER;
BEGIN
    -- Récupérer le préfixe de l'entreprise
    SELECT prefixe_numero INTO v_prefixe
    FROM entreprise
    WHERE id = p_entreprise_id;

    IF v_prefixe IS NULL THEN
        RAISE EXCEPTION 'Entreprise non trouvée pour l''id %', p_entreprise_id;
    END IF;

    -- Année en cours
    v_annee := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;

    -- UPSERT atomique : insère compteur=1 si nouvelle année, incrémente sinon
    -- Le verrou de ligne implicite de ON CONFLICT DO UPDATE garantit l'atomicité
    INSERT INTO devis_counter (entreprise_id, annee, compteur)
    VALUES (p_entreprise_id, v_annee, 1)
    ON CONFLICT (entreprise_id, annee) DO UPDATE
    SET compteur = devis_counter.compteur + 1
    RETURNING compteur INTO v_compteur;

    -- Formater le numéro : PREFIXE-YYYY-XXXX
    RETURN v_prefixe || '-' || v_annee::TEXT || '-' || LPAD(v_compteur::TEXT, 4, '0');
END;
$$;
```
