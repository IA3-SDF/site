## Architecture Supabase - Vue d'ensemble

### 📁 Structure des fichiers

```
src/services/
├── supabase/
│   ├── client.ts          ⬅️ CLIENT-SIDE (ANON_KEY)
│   └── server.ts          ⬅️ SERVER-SIDE (SERVICE_ROLE_KEY)
├── supabase.ts            ⬅️ SERVICE LAYER (couche métier)
└── ...

src/admin/config/
└── database.ts            ⬅️ ADMIN SERVICE (utilise client.ts)
```

---

## 🔑 Clients Supabase

### 1️⃣ **Client Côté Client** (`src/services/supabase/client.ts`)
- ✅ **Utilisé partout** : Client Components, RSC, edge functions
- 🔐 **Clé ANON** : Sécurisée par RLS policies dans Supabase
- 📦 **Export** : `supabase`, `SUPABASE_CONFIG`
- ⚠️ **NE PAS exposer la SERVICE_ROLE_KEY** au client

### 2️⃣ **Client Côté Serveur** (`src/services/supabase/server.ts`)
- ⚠️ **Réservé au serveur** : Server Actions, API Routes, Middleware
- 🔓 **Clé SERVICE_ROLE** : Pleins droits, NE JAMAIS exposer
- 📦 **Export** : `supabaseAdmin`
- 🚫 **Ne pas utiliser côté client**

---

## 🎯 Service Layer (`src/services/supabase.ts`)

**Fonction** : Couche d'abstraction pour les opérations métier

**Fonctions** :
- `getEvents()`, `getAlbums()`, `getReports()`, `getBoardMembers()`
- `getCurrentUserProfile()`, `updateUserProfile()`
- `getMediaUrl()` - Construit les URLs Supabase Storage
- `renderBlocksToText()` - Convertit blocks en texte

**Avantages** :
- ✅ Centralise la logique d'accès aux données
- ✅ Réutilisable partout dans l'app
- ✅ Facile à maintenir et tester
- ✅ Source unique de vérité pour les requêtes

---

## 🏗️ Admin Service (`src/admin/config/database.ts`)

**Fonction** : API pour le tableau de bord admin

**Opérations** : CRUD complet (Create, Read, Update, Delete)

**Fonctions** :
- `getAll(table)` - Récupère tous les items
- `insertItem(table, payload)` - Crée un nouvel item
- `updateItem(table, id, payload)` - Met à jour un item
- `deleteItem(table, id)` - Supprime un item
- `uploadFile(file, bucket)` - Upload vers Storage
- `getCurrentUserProfile()` - Récupère le profil utilisateur

**Avantage** :
- Utilise `client.ts` (pas de duplication)
- Logging détaillé `[Database]`, `[Auth]`, `[Upload]`

---

## 📋 Tableau des imports

| Fichier | Import | Cas d'usage |
|---------|--------|-----------|
| **Client Components** | `import { supabase } from '@/src/services/supabase/client'` | Direct access to data |
| **RSC/Server Actions** | `import { getEvents } from '@/src/services/supabase'` | Récupérer les données |
| **Admin Dashboard** | `import { getAll } from '@/src/admin/config/database'` | CRUD operations |
| **Upload** | `import { uploadFile } from '@/src/lib/upload'` | Upload files |
| **Admin Page** | Imports modulaires de `@/src/admin/...` | Composants admin |

---

## 🔒 Configuration Sécurité

### Environnement Variables
```bash
# ✅ PUBLIC (exposé au client)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# ❌ SECRET (serveur seulement)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

### RLS Policies
- Les requêtes client utilisent ANON_KEY
- Les RLS policies dans Supabase contrôlent l'accès
- Exemple : Les utilisateurs ne peuvent modifier que leurs propres données

---

## ✨ Changements Effectués

### ❌ Avant (Redondance)
```typescript
// Dans supabase.ts
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

// Dans database.ts
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Dans server.ts
export const supabaseClient = createClient(...); // JAMAIS UTILISÉ
```

### ✅ Après (Source unique)
```typescript
// client.ts - Source unique
export const SUPABASE_CONFIG = { url, anonKey, storageUrl };
export const supabase = createClient(...);

// database.ts
import { supabase } from '../../services/supabase/client';

// server.ts
export const supabaseAdmin = createClient(...);
```

---

## 🚀 Bonnes Pratiques

1. ✅ **Toujours passer par le service layer** (`supabase.ts`) quand possible
2. ✅ **Admin panel utilise `database.ts`** pour le CRUD
3. ✅ **Client components peuvent utiliser `supabase` directement** pour les mutations en temps réel
4. ✅ **Server Actions utilisent le service layer** (`supabase.ts`)
5. ❌ **Ne jamais** importer directement `supabaseAdmin` côté client
6. ❌ **Ne jamais** exposer les clés secrètes

---

## 🔧 Migration Guide

Si vous trouviez autre duplication :

1. **Vérifier** : Où est-ce utilisé ?
2. **Centraliser** : Créer une fonction dans `supabase.ts`
3. **Importer** : Utiliser le service layer partout
4. **Tester** : Build et vérifier les types
