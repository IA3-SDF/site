# 🔐 Configuration des RLS Policies Supabase

## ⚠️ PROBLÈME TROUVÉ

Votre script `teste.js` fonctionne avec la **SERVICE_ROLE_KEY** (accès complet), mais la **page admin et le frontend** utilisent la **ANON_KEY** qui est soumise aux **RLS Policies**.

Si vous voyez "**Aucune donnée**" dans la page admin alors que `teste.js` trouve les données, **c'est un problème de RLS Policies** !

---

## ✅ SOLUTION : Créer les RLS Policies

Allez dans **Supabase Dashboard** → **SQL Editor** et exécutez les requêtes ci-dessous :

### 1️⃣ **Enable RLS sur les tables** (si pas déjà fait)

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bureau ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
```

### 2️⃣ **Créer les Policies de LECTURE (SELECT)**

```sql
-- PROFILES : Lecture publique
CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT USING (true);

-- BUREAU : Lecture publique
CREATE POLICY "bureau_select_public" ON bureau
  FOR SELECT USING (true);

-- EVENTS : Lecture publique
CREATE POLICY "events_select_public" ON events
  FOR SELECT USING (true);

-- ALBUMS : Lecture publique
CREATE POLICY "albums_select_public" ON albums
  FOR SELECT USING (true);

-- REPORTS : Lecture publique
CREATE POLICY "reports_select_public" ON reports
  FOR SELECT USING (true);
```

### 3️⃣ **Créer les Policies d'ÉCRITURE (INSERT/UPDATE/DELETE)**

```sql
-- PROFILES : Seuls les admins peuvent modifier
CREATE POLICY "profiles_insert_admin" ON profiles
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "profiles_delete_admin" ON profiles
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- BUREAU : Seuls les admins peuvent modifier
CREATE POLICY "bureau_insert_admin" ON bureau
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "bureau_update_admin" ON bureau
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "bureau_delete_admin" ON bureau
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- EVENTS : Seuls les admins peuvent modifier
CREATE POLICY "events_insert_admin" ON events
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "events_update_admin" ON events
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "events_delete_admin" ON events
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ALBUMS : Seuls les admins peuvent modifier
CREATE POLICY "albums_insert_admin" ON albums
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "albums_update_admin" ON albums
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "albums_delete_admin" ON albums
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- REPORTS : Seuls les admins peuvent modifier
CREATE POLICY "reports_insert_admin" ON reports
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "reports_update_admin" ON reports
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "reports_delete_admin" ON reports
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## 🚀 Alternative : Désactiver RLS (Non recommandé pour la production)

Si vous voulez tester rapidement sans RLS :

```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE bureau DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE albums DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
```

⚠️ **Attention** : Ceci rend vos données publiques et modifiables par n'importe qui. À utiliser uniquement pour le développement.

---

## ✅ Vérification après configuration

1. Accédez à `http://localhost:3000/admin`
2. Vérifiez que les données s'affichent maintenant
3. Vérifiez la console du navigateur (F12) pour voir les logs `[Database]`

---

## 📝 Notes Importantes

- **ANON_KEY** : Utilisée par le frontend, soumise aux RLS policies
- **SERVICE_ROLE_KEY** : Utilisée par teste.js, bypass les RLS policies
- Les policies ci-dessus permettent la **lecture publique** et les **écritures admin seulement**

Si vous avez des erreurs, vérifiez :
1. ✅ RLS est activé sur les tables
2. ✅ Les policies sont créées correctement
3. ✅ Votre utilisateur connecté a `role = 'admin'`
4. ✅ Ouvrez la console navigateur (F12) pour voir les erreurs

