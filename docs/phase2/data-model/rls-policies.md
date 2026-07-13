## Section 1 : Activation RLS

```sql
ALTER TABLE entreprise ENABLE ROW LEVEL SECURITY;
ALTER TABLE utilisateur ENABLE ROW LEVEL SECURITY;
ALTER TABLE client ENABLE ROW LEVEL SECURITY;
ALTER TABLE devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE ligne_devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
```

## Section 2 : Politiques par table

### entreprise

**entreprise_select**
Table : entreprise
Type : SELECT
Rôle ciblé : tous
Clause USING : `EXISTS (SELECT 1 FROM utilisateur u WHERE u.id = auth.uid() AND u.entreprise_id = entreprise.id AND u.is_deleted = false AND u.is_active = true)`
Clause WITH CHECK : —
Justification : Tout utilisateur actif d'une entreprise peut consulter le profil de son entreprise.

**entreprise_update_manager**
Table : entreprise
Type : UPDATE
Rôle ciblé : manager
Clause USING : `EXISTS (SELECT 1 FROM utilisateur u WHERE u.id = auth.uid() AND u.entreprise_id = entreprise.id AND u.role = 'manager' AND u.is_deleted = false AND u.is_active = true)`
Clause WITH CHECK : `EXISTS (SELECT 1 FROM utilisateur u WHERE u.id = auth.uid() AND u.entreprise_id = entreprise.id AND u.role = 'manager' AND u.is_deleted = false AND u.is_active = true)`
Justification : Seul le manager peut modifier le profil de son entreprise.

**entreprise_delete_interdit**
Table : entreprise
Type : DELETE
Rôle ciblé : tous
Clause USING : `false`
Clause WITH CHECK : —
Justification : Aucun utilisateur ne peut supprimer physiquement une entreprise (soft-delete uniquement via UPDATE).

### utilisateur

**utilisateur_select**
Table : utilisateur
Type : SELECT
Rôle ciblé : tous
Clause USING : `EXISTS (SELECT 1 FROM utilisateur u WHERE u.id = auth.uid() AND u.entreprise_id = utilisateur.entreprise_id AND u.is_deleted = false AND u.is_active = true) AND utilisateur.is_deleted = false`
Clause WITH CHECK : —
Justification : Tout utilisateur actif d'une entreprise peut consulter les membres de son entreprise (hors soft-deleted).

**utilisateur_insert_manager**
Table : utilisateur
Type : INSERT
Rôle ciblé : manager
Clause USING : —
Clause WITH CHECK : `EXISTS (SELECT 1 FROM utilisateur u WHERE u.id = auth.uid() AND u.entreprise_id = utilisateur.entreprise_id AND u.role = 'manager' AND u.is_deleted = false AND u.is_active = true) AND utilisateur.is_deleted = false`
Justification : Seul le manager peut créer un nouvel utilisateur dans son entreprise.

**utilisateur_update_manager**
Table : utilisateur
Type : UPDATE
Rôle ciblé : manager
Clause USING : `EXISTS (SELECT 1 FROM utilisateur u WHERE u.id = auth.uid() AND u.entreprise_id = utilisateur.entreprise_id AND u.role = 'manager' AND u.is_deleted = false AND u.is_active = true) AND utilisateur.is_deleted = false`
Clause WITH CHECK : `EXISTS (SELECT 1 FROM utilisateur u WHERE u.id = auth.uid() AND u.entreprise_id = utilisateur.entreprise_id AND u.role = 'manager' AND u.is_deleted = false AND u.is_active = true) AND utilisateur.is_deleted = false`
Justification : Seul le manager peut modifier un utilisateur de son entreprise (commercial interdit par règle métier).

**utilisateur_delete_interdit**
Table : utilisateur
Type : DELETE
Rôle ciblé : tous
Clause USING : `false`
Clause WITH CHECK : —
Justification : Aucun utilisateur ne peut supprimer physiquement un utilisateur (soft-delete via UPDATE uniquement).

### client

**client_select**
Table : client
Type : SELECT
Rôle ciblé : tous
Clause USING : `EXISTS (SELECT 1 FROM utilisateur u WHERE u.id = auth.uid() AND u.entreprise_id = client.entreprise_id AND u.is_deleted = false AND u.is_active = true) AND client.is_deleted = false`
Clause WITH CHECK : —
Justification : Tout utilisateur actif d'une entreprise peut consulter les clients de son annuaire.

**client_insert**
Table : client
Type : INSERT
Rôle ciblé : tous
Clause USING : —
Clause WITH CHECK : `EXISTS (SELECT 1 FROM utilisateur u WHERE u.id = auth.uid() AND u.entreprise_id = client.entreprise_id AND u.is_deleted = false AND u.is_active = true) AND client.is_deleted = false`
Justification : Tout utilisateur actif peut ajouter un client dans son entreprise.

**client_update**
Table : client
Type : UPDATE
Rôle ciblé : tous
Clause USING : `EXISTS (SELECT 1 FROM utilisateur u WHERE u.id = auth.uid() AND u.entreprise_id = client.entreprise_id AND u.is_deleted = false AND u.is_active = true) AND client.is_deleted = false`
Clause WITH CHECK : `EXISTS (SELECT 1 FROM utilisateur u WHERE u.id = auth.uid() AND u.entreprise_id = client.entreprise_id AND u.is_deleted = false AND u.is_active = true) AND client.is_deleted = false`
Justification : Tout utilisateur actif peut modifier un client de son entreprise.

**client_delete_interdit**
Table : client
Type : DELETE
Rôle ciblé : tous
Clause USING : `false`
Clause WITH CHECK : —
Justification : Aucun utilisateur ne peut supprimer physiquement un client (soft-delete via UPDATE uniquement).

### devis

**devis_select_commercial**
Table : devis
Type : SELECT
Rôle ciblé : commercial
Clause USING : `EXISTS (SELECT 1 FROM utilisateur u WHERE u.id = auth.uid() AND u.entreprise_id = devis.entreprise_id AND u.role = 'commercial' AND u.is_deleted = false AND u.is_active = true) AND devis.commercial_id = auth.uid() AND devis.is_deleted = false`
Clause WITH CHECK : —
Justification : Un commercial ne voit que ses propres devis non supprimés.

**devis_select_manager**
Table : devis
Type : SELECT
Rôle ciblé : manager
Clause USING : `EXISTS (SELECT 1 FROM utilisateur u WHERE u.id = auth.uid() AND u.entreprise_id = devis.entreprise_id AND u.role = 'manager' AND u.is_deleted = false AND u.is_active = true) AND devis.is_deleted = false`
Clause WITH CHECK : —
Justification : Un manager voit tous les devis de son entreprise non supprimés.

**devis_insert_commercial**
Table : devis
Type : INSERT
Rôle ciblé : commercial
Clause USING : —
Clause WITH CHECK : `EXISTS (SELECT 1 FROM utilisateur u WHERE u.id = auth.uid() AND u.entreprise_id = devis.entreprise_id AND u.role = 'commercial' AND u.is_deleted = false AND u.is_active = true) AND devis.commercial_id = auth.uid() AND devis.is_deleted = false`
Justification : Un commercial peut créer un devis dans son entreprise en se l'attribuant.

**devis_insert_manager**
Table : devis
Type : INSERT
Rôle ciblé : manager
Clause USING : —
Clause WITH CHECK : `EXISTS (SELECT 1 FROM utilisateur u WHERE u.id = auth.uid() AND u.entreprise_id = devis.entreprise_id AND u.role = 'manager' AND u.is_deleted = false AND u.is_active = true) AND devis.is_deleted = false`
Justification : Un manager peut créer un devis dans son entreprise (peut assigner un commercial).

**devis_update_commercial**
Table : devis
Type : UPDATE
Rôle ciblé : commercial
Clause USING : `EXISTS (SELECT 1 FROM utilisateur u WHERE u.id = auth.uid() AND u.entreprise_id = devis.entreprise_id AND u.role = 'commercial' AND u.is_deleted = false AND u.is_active = true) AND devis.commercial_id = auth.uid() AND devis.statut = 'brouillon' AND devis.is_deleted = false`
Clause WITH CHECK : `EXISTS (SELECT 1 FROM utilisateur u WHERE u.id = auth.uid() AND u.entreprise_id = devis.entreprise_id AND u.role = 'commercial' AND u.is_deleted = false AND u.is_active = true) AND devis.commercial_id = auth.uid() AND devis.is_deleted = false`
Justification : Un commercial ne peut modifier que ses devis en statut brouillon (règle métier : pas de modification si en attente, validé ou refusé).

**devis_update_manager**
Table : devis
Type : UPDATE
Rôle ciblé : manager
Clause USING : `EXISTS (SELECT 1 FROM utilisateur u WHERE u.id = auth.uid() AND u.entreprise_id = devis.entreprise_id AND u.role = 'manager' AND u.is_deleted = false AND u.is_active = true) AND devis.is_deleted = false`
Clause WITH CHECK : `EXISTS (SELECT 1 FROM utilisateur u WHERE u.id = auth.uid() AND u.entreprise_id = devis.entreprise_id AND u.role = 'manager' AND u.is_deleted = false AND u.is_active = true) AND devis.is_deleted = false`
Justification : Un manager peut modifier tout devis de son entreprise (validation, refus, commentaire).

**devis_delete_interdit**
Table : devis
Type : DELETE
Rôle ciblé : tous
Clause USING : `false`
Clause WITH CHECK : —
Justification : Aucun utilisateur ne peut supprimer physiquement un devis (soft-delete via UPDATE uniquement).

### ligne_devis

**ligne_devis_select_commercial**
Table : ligne_devis
Type : SELECT
Rôle ciblé : commercial
Clause USING : `EXISTS (SELECT 1 FROM devis d JOIN utilisateur u ON u.id = auth.uid() WHERE d.id = ligne_devis.devis_id AND d.commercial_id = auth.uid() AND d.is_deleted = false AND u.is_deleted = false AND u.is_active = true) AND ligne_devis.is_deleted = false`
Clause WITH CHECK : —
Justification : Un commercial ne voit que les lignes de ses propres devis non supprimés.

**ligne_devis_select_manager**
Table : ligne_devis
Type : SELECT
Rôle ciblé : manager
Clause USING : `EXISTS (SELECT 1 FROM devis d JOIN utilisateur u ON u.id = auth.uid() WHERE d.id = ligne_devis.devis_id AND d.entreprise_id = u.entreprise_id AND d.is_deleted = false AND u.is_deleted = false AND u.is_active = true) AND ligne_devis.is_deleted = false`
Clause WITH CHECK : —
Justification : Un manager voit les lignes de tous les devis de son entreprise non supprimés.

**ligne_devis_insert_commercial**
Table : ligne_devis
Type : INSERT
Rôle ciblé : commercial
Clause USING : —
Clause WITH CHECK : `EXISTS (SELECT 1 FROM devis d JOIN utilisateur u ON u.id = auth.uid() WHERE d.id = ligne_devis.devis_id AND d.commercial_id = auth.uid() AND d.statut = 'brouillon' AND d.is_deleted = false AND u.is_deleted = false AND u.is_active = true) AND ligne_devis.is_deleted = false`
Justification : Un commercial ne peut ajouter des lignes qu'à ses devis en statut brouillon.

**ligne_devis_insert_manager**
Table : ligne_devis
Type : INSERT
Rôle ciblé : manager
Clause USING : —
Clause WITH CHECK : `EXISTS (SELECT 1 FROM devis d JOIN utilisateur u ON u.id = auth.uid() WHERE d.id = ligne_devis.devis_id AND d.entreprise_id = u.entreprise_id AND d.is_deleted = false AND u.is_deleted = false AND u.is_active = true) AND ligne_devis.is_deleted = false`
Justification : Un manager peut ajouter des lignes à tout devis de son entreprise.

**ligne_devis_update_commercial**
Table : ligne_devis
Type : UPDATE
Rôle ciblé : commercial
Clause USING : `EXISTS (SELECT 1 FROM devis d JOIN utilisateur u ON u.id = auth.uid() WHERE d.id = ligne_devis.devis_id AND d.commercial_id = auth.uid() AND d.statut = 'brouillon' AND d.is_deleted = false AND u.is_deleted = false AND u.is_active = true) AND ligne_devis.is_deleted = false`
Clause WITH CHECK : `EXISTS (SELECT 1 FROM devis d JOIN utilisateur u ON u.id = auth.uid() WHERE d.id = ligne_devis.devis_id AND d.commercial_id = auth.uid() AND d.statut = 'brouillon' AND d.is_deleted = false AND u.is_deleted = false AND u.is_active = true) AND ligne_devis.is_deleted = false`
Justification : Un commercial ne peut modifier des lignes que dans ses devis en statut brouillon.

**ligne_devis_update_manager**
Table : ligne_devis
Type : UPDATE
Rôle ciblé : manager
Clause USING : `EXISTS (SELECT 1 FROM devis d JOIN utilisateur u ON u.id = auth.uid() WHERE d.id = ligne_devis.devis_id AND d.entreprise_id = u.entreprise_id AND d.is_deleted = false AND u.is_deleted = false AND u.is_active = true) AND ligne_devis.is_deleted = false`
Clause WITH CHECK : `EXISTS (SELECT 1 FROM devis d JOIN utilisateur u ON u.id = auth.uid() WHERE d.id = ligne_devis.devis_id AND d.entreprise_id = u.entreprise_id AND d.is_deleted = false AND u.is_deleted = false AND u.is_active = true) AND ligne_devis.is_deleted = false`
Justification : Un manager peut modifier les lignes de tout devis de son entreprise.

**ligne_devis_delete_interdit**
Table : ligne_devis
Type : DELETE
Rôle ciblé : tous
Clause USING : `false`
Clause WITH CHECK : —
Justification : Aucun utilisateur ne peut supprimer physiquement une ligne de devis (soft-delete via UPDATE uniquement).

### audit_log

**audit_log_select**
Table : audit_log
Type : SELECT
Rôle ciblé : tous
Clause USING : `EXISTS (SELECT 1 FROM utilisateur u WHERE u.id = auth.uid() AND u.entreprise_id = audit_log.entreprise_id AND u.is_deleted = false AND u.is_active = true)`
Clause WITH CHECK : —
Justification : Tout utilisateur actif d'une entreprise peut consulter les logs d'audit de son entreprise (audit_log n'a pas de colonne is_deleted, les logs sont immuables).

**audit_log_insert_interdit**
Table : audit_log
Type : INSERT
Rôle ciblé : tous
Clause USING : —
Clause WITH CHECK : `false`
Justification : Les logs d'audit sont immuables ; aucun utilisateur ne peut insérer manuellement un log (écriture réservée aux Edge Functions système).

**audit_log_update_interdit**
Table : audit_log
Type : UPDATE
Rôle ciblé : tous
Clause USING : `false`
Clause WITH CHECK : —
Justification : Les logs d'audit sont immuables ; aucune modification n'est autorisée.

**audit_log_delete_interdit**
Table : audit_log
Type : DELETE
Rôle ciblé : tous
Clause USING : `false`
Clause WITH CHECK : —
Justification : Les logs d'audit sont immuables ; aucune suppression n'est autorisée.
