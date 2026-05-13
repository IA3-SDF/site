# 📊 Guide Complet - Page Administrateur

## 🎯 Vue d'ensemble

La page administrateur est le centre de contrôle pour gérer tous les contenus de votre site AMESCAO. Elle permet de :

- ✅ **Créer** de nouveaux éléments
- ✅ **Lire** et consulter les données
- ✅ **Modifier** les éléments existants
- ✅ **Supprimer** les éléments

---

## 📍 Structure des Tables

### 1️⃣ **Profils** (`profiles`)
Gère les profils utilisateurs du système.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | ID unique (auto) |
| `name` | Text | Prénom |
| `surname` | Text | Nom de famille |
| `email` | Email | Email unique |
| `photo` | Text | URL de la photo |
| `role` | Select | Rôle (`member`, `admin`) |
| `created_at` | Timestamp | Date de création |

### 2️⃣ **Bureau** (`bureau`)
Gère les membres du bureau de l'association.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | ID unique (auto) |
| `name` | Text | Prénom |
| `surname` | Text | Nom de famille |
| `role` | Text | Poste (Président, Vice-Président, etc.) |
| `biography` | Text | Biographie détaillée |
| `photo` | Text | URL de la photo |
| `order` | Number | Ordre d'affichage |
| `created_at` | Timestamp | Date de création |

### 3️⃣ **Événements** (`events`)
Gère tous les événements de l'association.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | ID unique (auto) |
| `title` | Text | Titre de l'événement |
| `date` | Timestamp | Date et heure |
| `content` | Rich Text | Description détaillée |
| `cover_photo` | Text | Photo principale |
| `other_photos` | Array | Galerie de photos supplémentaires |
| `created_at` | Timestamp | Date de création |

### 4️⃣ **Rapports** (`reports`)
Gère les rapports d'activité.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | ID unique (auto) |
| `title` | Text | Titre du rapport |
| `date` | Date | Date de publication |
| `content` | Rich Text | Contenu / Résumé |
| `document_pdf_link` | Text | URL du PDF |
| `created_at` | Timestamp | Date de création |

### 5️⃣ **Albums** (`albums`)
Gère les albums photos par événement.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | ID unique (auto) |
| `event_title` | Text | Titre de l'événement lié |
| `event_date` | Date | Date de l'événement |
| `photos` | Array | Liste des URLs des photos |
| `created_at` | Timestamp | Date de création |

---

## 🚀 Utilisation de la Page Admin

### **Accès à la Page Admin**
```
http://localhost:3000/admin
```

### **Navigation**
1. Cliquez sur un élément de la **sidebar gauche** pour sélectionner la table
2. Les données s'affichent automatiquement

### **Créer un Nouvel Élément**
1. Cliquez sur le bouton **"+ Nouveau"** en haut à droite
2. Remplissez le formulaire
3. Cliquez sur **"Enregistrer"**

### **Modifier un Élément**
1. Cliquez sur la **carte** de l'élément à modifier
2. Le formulaire s'ouvre avec les données pré-remplies
3. Apportez les changements
4. Cliquez sur **"Enregistrer"**

### **Supprimer un Élément**
1. Passez votre souris sur la **carte** 
2. Cliquez sur l'icône **🗑️ (Supprimer)** qui apparaît
3. Confirmez la suppression

---

## 🔐 Configuration Requise

### ⚠️ RLS Policies MUST BE CONFIGURED

Si la page admin affiche "**Aucune donnée**", c'est un problème de **RLS Policies**.

**Solution** : Consultez [RLS_POLICIES_SETUP.md](RLS_POLICIES_SETUP.md) pour configurer les politiques d'accès.

---

## 📋 Types de Champs Disponibles

| Type | Description | Exemple |
|------|-------------|---------|
| `text` | Texte simple | "Titre de l'événement" |
| `email` | Email | "user@example.com" |
| `number` | Nombre | "42" |
| `date` | Date seulement | "2026-05-06" |
| `datetime-local` | Date + Heure | "2026-05-06T15:30" |
| `textarea` | Texte multiligne | Biographie |
| `rich_text` | Éditeur de texte riche | Contenu long |
| `select` | Liste déroulante | `member` ou `admin` |
| `single_image` | Une image (upload) | Photo de profil |
| `multiple_images` | Plusieurs images (upload) | Galerie de photos |
| `file_url` | Lien ou upload PDF | Document PDF |

---

## 🐛 Dépannage

### **"Aucune donnée" s'affiche**
- ✅ Vérifiez les RLS Policies (cf. RLS_POLICIES_SETUP.md)
- ✅ Vérifiez que vous êtes connecté avec un compte admin
- ✅ Ouvrez la Console (F12) et regardez les erreurs

### **Impossible de créer/modifier/supprimer**
- ✅ Vérifiez que votre compte a `role = 'admin'`
- ✅ Vérifiez que les RLS Policies INSERT/UPDATE/DELETE sont configurées

### **Les images ne s'affichent pas**
- ✅ Vérifiez que le bucket Supabase Storage `amescao` existe
- ✅ Vérifiez les permissions du bucket

### **"Supabase client is not initialized"**
- ✅ Vérifiez que votre `.env.local` contient les bonnes clés
- ✅ Redémarrez le serveur Next.js

---

## 💡 Conseils d'Utilisation

1. **Photos** : Utilisez des images compressées (< 2MB) pour une meilleure performance
2. **Ordre Bureau** : Utilisez des nombres (1, 2, 3...) pour contrôler l'ordre d'affichage
3. **Dates Événements** : Utilisez le format `YYYY-MM-DD` pour la cohérence
4. **Édition Rich Text** : Utilisez la barre d'outils pour formater le contenu

---

## 🎨 Architecture Admin

```
src/admin/
├── components/
│   ├── AdminGuard.tsx          # Protection d'accès
│   ├── Sidebar.tsx             # Navigation
│   ├── Header.tsx              # En-tête avec compteur
│   ├── MainContent.tsx         # Grille d'éléments
│   ├── CardItem.tsx            # Carte d'un élément
│   ├── RichEditor.tsx          # Éditeur texte riche
│   └── modals/
│       └── FormModal.tsx       # Formulaire dynamique
├── config/
│   └── database.ts             # Opérations CRUD
├── hooks/
│   └── useAdminData.ts         # Gestion d'état
├── schemas.ts                  # Définition des formulaires
└── types.ts                    # Types TypeScript
```

---

## 📞 Support

Pour les problèmes :
1. Consultez [RLS_POLICIES_SETUP.md](RLS_POLICIES_SETUP.md)
2. Vérifiez la Console (F12)
3. Regardez les logs `[Database]` et `[useAdminData]`

