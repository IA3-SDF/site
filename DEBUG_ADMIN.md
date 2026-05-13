# 🔍 Guide de Débogage - Page Admin

## Le Problème Principal

**Symptôme** : La page admin affiche "**Aucune donnée**" alors que `teste.js` trouve les données.

**Cause Racine** : Les **RLS Policies** ne sont pas configurées correctement.

---

## 🧪 Étapes de Débogage

### **Étape 1 : Ouvrir la Console Navigateur**
1. Appuyez sur **F12** (ou Ctrl+Shift+I)
2. Allez dans l'onglet **Console**
3. Voyez les logs `[Database]`, `[useAdminData]`, `[Auth]`

### **Étape 2 : Vérifier l'Erreur RLS**

Cherchez les messages comme :
```
[Database] ❌ Error fetching from profiles: 
{"message":"new row violates row-level security policy..."}
```

Si vous voyez cela, **c'est un problème de RLS Policies** !

### **Étape 3 : Tester avec teste.js**

```bash
node teste.js
```

- ✅ Si teste.js montre les données : RLS Policies ne sont pas configurées
- ❌ Si teste.js échoue aussi : Il y a un autre problème (BDD, connexion, etc.)

### **Étape 4 : Configurer les RLS Policies**

Consultez [RLS_POLICIES_SETUP.md](RLS_POLICIES_SETUP.md) et copiez-collez les requêtes SQL dans l'éditeur SQL Supabase.

---

## 🔐 Vérifier la Configuration RLS

### Dans Supabase Dashboard

1. Allez dans **SQL Editor**
2. Exécutez cette requête :

```sql
-- Vérifier les RLS policies
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'bureau', 'events', 'albums', 'reports');
```

Vous devriez voir :
```
| tablename | rowsecurity |
|-----------|------------|
| profiles  | t           |
| bureau    | t           |
| events    | t           |
| albums    | t           |
| reports   | t           |
```

Si `rowsecurity = false`, le RLS n'est pas activé !

### Lister les Policies Existantes

```sql
SELECT * FROM pg_policies 
WHERE tablename IN ('profiles', 'bureau', 'events', 'albums', 'reports');
```

---

## 🚨 Erreurs Courantes

### **Erreur 1 : "new row violates row-level security policy"**

```
[Database] ❌ Error fetching from profiles: 
{"message":"new row violates row-level security policy for table \"profiles\""}
```

**Solution** : Les RLS Policies SELECT n'existent pas. Créez-les via RLS_POLICIES_SETUP.md

---

### **Erreur 2 : "Supabase client is not initialized"**

```
[Database] ❌ Supabase client is not initialized
```

**Vérifications** :
- `.env.local` contient `NEXT_PUBLIC_SUPABASE_URL` ✅
- `.env.local` contient `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- Redémarrez le serveur Next.js

---

### **Erreur 3 : "No active session"**

```
[Auth] ⚠️ No active session
```

**Solution** :
- Vous devez d'abord vous **connecter** via `/auth/login`
- Créez un compte ou connectez-vous avec un compte existant

---

## 📊 Vérifier les Données en Base

### Via teste.js

```bash
node teste.js
```

Affichera les données de chaque table avec la SERVICE_ROLE_KEY.

### Via Supabase Dashboard

1. Allez dans l'onglet **Data** de Supabase
2. Sélectionnez la table (ex: `profiles`)
3. Voyez les données

---

## 🔒 Vérifier les Permissions

### Qui Peut Accéder ?

**teste.js** : ✅ SERVICE_ROLE_KEY (accès complet)
**Page Admin** : ANON_KEY soumise aux RLS Policies

### Votre Rôle

Pour modifier les données en tant qu'admin, vérifiez :

```sql
SELECT id, name, surname, role FROM profiles WHERE id = '<votre_user_id>';
```

Le `role` doit être `'admin'` pour avoir les droits.

---

## 🎯 Checklist de Configuration

- [ ] RLS Policies SELECT créées (lecture publique)
- [ ] RLS Policies INSERT créées (admin seulement)
- [ ] RLS Policies UPDATE créées (admin seulement)
- [ ] RLS Policies DELETE créées (admin seulement)
- [ ] Votre profil a `role = 'admin'`
- [ ] Vous êtes connecté à la page admin
- [ ] Aucune erreur dans la console (F12)

---

## 💡 Tests Rapides

### Test 1 : Charger les données

```javascript
// Dans la console (F12)
import { getAll } from '@/src/admin/config/database';
const data = await getAll('profiles');
console.log('Profiles:', data);
```

### Test 2 : Vérifier la session

```javascript
// Dans la console
import { supabase } from '@/src/services/supabase/client';
const { data } = await supabase.auth.getSession();
console.log('Session:', data);
```

### Test 3 : Directement interroger

```javascript
const { data, error } = await supabase
  .from('profiles')
  .select('*');
console.log('Data:', data);
console.log('Error:', error);
```

---

## 📞 Dernière Ressource

Si tout échoue :

1. **Consultez les logs** : Console (F12) + logs serveur
2. **Comparez avec teste.js** : Où fonctionne-t-il, où échoue-t-il ?
3. **Vérifiez les RLS Policies** : Sont-elles vraiment créées ?
4. **Redémarrez** : Next.js, navigateur, puis réessayez

