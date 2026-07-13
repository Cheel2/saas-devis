## Section 1 : DDL SQL

```sql
-- Table : entreprise — Profil et paramètres de l'entreprise
CREATE TABLE IF NOT EXISTS entreprise (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raison_sociale VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500) NULL,
    adresse_bancaire VARCHAR(500) NULL,
    conditions_generales TEXT NULL,
    prefixe_numero VARCHAR(10) NOT NULL DEFAULT 'DEV',
    duree_validite_jours INTEGER NOT NULL DEFAULT 30,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table : utilisateur — Membres de l'entreprise (Commercial ou Manager)
CREATE TABLE IF NOT EXISTS utilisateur (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    entreprise_id UUID NOT NULL REFERENCES entreprise(id) ON DELETE RESTRICT,
    email VARCHAR(255) NOT NULL UNIQUE,
    nom_complet VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('commercial', 'manager')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table : client — Annuaire des clients de l'entreprise
CREATE TABLE IF NOT EXISTS client (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entreprise_id UUID NOT NULL REFERENCES entreprise(id) ON DELETE RESTRICT,
    nom VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NULL,
    adresse TEXT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table : devis — Documents de devis avec workflow de validation
CREATE TABLE IF NOT EXISTS devis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entreprise_id UUID NOT NULL REFERENCES entreprise(id) ON DELETE RESTRICT,
    client_id UUID NOT NULL REFERENCES client(id) ON DELETE RESTRICT,
    commercial_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
    numero VARCHAR(20) NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'en_attente', 'valide', 'refuse')),
    date_creation DATE NOT NULL DEFAULT CURRENT_DATE,
    date_validite DATE NOT NULL,
    total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    commentaire_refus TEXT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (entreprise_id, numero)
);

-- Table : ligne_devis — Lignes de prestation d'un devis
CREATE TABLE IF NOT EXISTS ligne_devis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    devis_id UUID NOT NULL REFERENCES devis(id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    quantite INTEGER NOT NULL CHECK (quantite > 0),
    prix_unitaire DECIMAL(15,2) NOT NULL CHECK (prix_unitaire > 0),
    sous_total DECIMAL(15,2) NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table : audit_log — Traçage immuable des actions critiques
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entreprise_id UUID NOT NULL REFERENCES entreprise(id) ON DELETE RESTRICT,
    auteur_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
    action VARCHAR(50) NOT NULL,
    entite_concernee VARCHAR(50) NOT NULL,
    entite_id UUID NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Section 2 : Index recommandés

| Table | Colonne(s) | Type d'index | Justification (quelle requête critique) |
|---|---|---|---|
| devis | commercial_id, statut, is_deleted | B-Tree composite | Liste des devis par commercial filtrée par statut (US-5). Requête fréquente : `WHERE commercial_id = ? AND statut = ? AND is_deleted = false`. Composite pour couvrir le filtrage multi-critère. |
| devis | entreprise_id, statut, is_deleted | B-Tree composite | Liste des devis par entreprise pour le Manager (US-5). Requête : `WHERE entreprise_id = ? AND statut = ? AND is_deleted = false`. |
| devis | numero | B-Tree | Recherche de devis par numéro (US-5, US-8). Requête : `WHERE numero = ? AND is_deleted = false`. |
| client | entreprise_id, is_deleted | B-Tree composite | Liste des clients par entreprise (US-3). Requête : `WHERE entreprise_id = ? AND is_deleted = false`. |
| client | nom | B-Tree (text_pattern_ops) | Recherche partielle de client par nom dans l'annuaire (US-3, US-4). Requête : `WHERE nom ILIKE 'prefix%' AND entreprise_id = ?`. |
| ligne_devis | devis_id, is_deleted | B-Tree composite | Chargement des lignes d'un devis (US-4, US-5). Requête : `WHERE devis_id = ? AND is_deleted = false`. |
| audit_log | entreprise_id, created_at DESC | B-Tree composite | Audit trail par entreprise trié par date décroissante (US-1 à US-12). Requête : `WHERE entreprise_id = ? ORDER BY created_at DESC LIMIT 20`. |
| audit_log | auteur_id, created_at DESC | B-Tree composite | Audit trail par auteur trié par date décroissante (US-12). Requête : `WHERE auteur_id = ? ORDER BY created_at DESC LIMIT 20`. |
| utilisateur | entreprise_id, role, is_active, is_deleted | B-Tree composite | Vérification du dernier manager actif (règle métier) et liste des utilisateurs par entreprise (US-2, US-12). Requête : `WHERE entreprise_id = ? AND role = 'manager' AND is_active = true AND is_deleted = false`. |
| devis | date_creation | B-Tree | Agrégation des devis par semaine pour le Dashboard (US-10). Requête : `GROUP BY DATE_TRUNC('week', date_creation) WHERE entreprise_id = ?`. |
