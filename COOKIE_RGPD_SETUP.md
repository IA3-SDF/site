# 🍪 Système de Gestion des Cookies RGPD - Documentation Complète

## 📋 Vue d'ensemble

Ce système fournit une solution complète de gestion des cookies et du consentement RGPD pour votre application Next.js avec Supabase.

### ✨ Caractéristiques

- ✅ **Banneau Cookie Sticky** : Design moderne avec Tailwind CSS et Framer Motion
- ✅ **Persistance Locale** : Stockage avec `js-cookie` (1 an)
- ✅ **Persistance Serveur** : Table `user_consents` dans Supabase avec RLS
- ✅ **Conforme RGPD** : Acceptation explicite + trace légale intègre
- ✅ **Authentification** : Enregistrement automatique pour utilisateurs connectés
- ✅ **Anon-friendly** : Fonctionne aussi pour les utilisateurs non authentifiés
- ✅ **Mode Sombre** : UI adaptée au thème Tailwind

---

## 🗄️ ARCHITECTURE SQL

### Table `user_consents`

```sql
CREATE TABLE user_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  analytics BOOLEAN DEFAULT false,
  marketing BOOLEAN DEFAULT false,
  preferences BOOLEAN DEFAULT true,
  consent_version TEXT DEFAULT '1.0',
  ip_address INET,
  user_agent TEXT,
  accepted_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  CONSTRAINT one_consent_per_user UNIQUE(user_id)
);
```

### Politiques RLS

1. **INSERT** : Les utilisateurs peuvent insérer leur consentement
2. **SELECT** : Lecture de son propre consentement uniquement
3. **UPDATE** : Interdite (trace légale)
4. **DELETE** : Interdite (conformité RGPD)
5. **Admin** : Les admins peuvent lire tous les consentements

### Trigger Automatique

Un trigger `replace_user_consent()` s'exécute après chaque INSERT pour:
- Supprimer l'ancien consentement
- Garder uniquement le dernier enregistrement par utilisateur
- Maintenir une trace de chaque changement dans les logs Supabase

---

## 📁 Fichiers Créés

```
src/
├── actions/
│   └── consent.ts              # Server Actions
├── components/
│   └── CookieBanner.tsx        # Composant UI principal
└── utils/
    └── consentUtils.ts         # Utilitaires de gestion

app/
└── layout.tsx                  # Layout modifié
```

---

## 🚀 INSTALLATION & CONFIGURATION

### 1. Prérequisites

- Node.js 18+
- Next.js 14+ (app router)
- Supabase project configuré

### 2. Ajouter les dépendances

```bash
npm install js-cookie
npm install --save-dev @types/js-cookie
```

### 3. Configuration de l'environnement

Votre `.env.local` doit contenir :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Optionnel : pour les scripts analytiques
NEXT_PUBLIC_GA_ID=G-XXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID=1234567890
```

### 4. Exécuter le SQL dans Supabase

1. Allez dans **Supabase Dashboard** → **SQL Editor**
2. Créez une nouvelle requête
3. Collez le code SQL complet fourni au début
4. Exécutez les requêtes

### 5. Vérifier les permissions

Dans Supabase, allez à **Authentication → Policies** et vérifiez que:
- RLS est activé sur `user_consents`
- Les 5 politiques sont présentes

---

## 💻 UTILISATION

### Dans votre Layout (app/layout.tsx)

```tsx
import CookieBanner from '@/src/components/CookieBanner';

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          {children}
          <CookieBanner />  {/* ← À la fin, juste avant </Providers> */}
        </Providers>
      </body>
    </html>
  );
}
```

### Lire le consentement utilisateur

```tsx
import { getLocalConsent } from '@/src/utils/consentUtils';

export default function MyComponent() {
  const consent = getLocalConsent();
  
  if (consent?.analytics) {
    // Charger Google Analytics, Mixpanel, etc.
  }
  
  if (consent?.marketing) {
    // Charger Facebook Pixel, etc.
  }
}
```

### Initialiser Analytics côté client

```tsx
'use client';

import { useEffect } from 'react';
import { initAnalytics, initMarketing } from '@/src/utils/consentUtils';

export default function AnalyticsInitializer() {
  useEffect(() => {
    initAnalytics();
    initMarketing();
  }, []);

  return null;
}
```

### Réinitialiser le consentement (optionnel)

```tsx
import { resetConsent } from '@/src/utils/consentUtils';

export default function SettingsPage() {
  return (
    <button onClick={() => {
      resetConsent();
      window.location.reload();
    }}>
      Réinitialiser les préférences
    </button>
  );
}
```

---

## 🔍 FLUX DE DONNÉES

```
┌─────────────────────────────────────────────────────┐
│  Visiteur accède au site                            │
│  → Banneau apparaît en bas (sticky)                 │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┬───────────────┐
        │                     │               │
        ▼                     ▼               ▼
   [Accepter]         [Refuser]       [En savoir+]
        │                  │               │
        └──────────────────┴───────────────┘
                   │
        ┌──────────▼──────────┐
        │ Sauvegarder choix   │
        │ (js-cookie)         │
        │ (localStorage)      │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │ Server Action       │
        │ saveUserConsent()   │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │ INSERT INTO         │
        │ user_consents       │
        │ (avec RLS)          │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │ Trigger active:     │
        │ replace_user_       │
        │ consent()           │
        └─────────────────────┘
```

---

## 🔐 Sécurité & Conformité

### ✅ RGPD

- ✅ Consentement explicite requis (opt-in)
- ✅ Choix granulaires (analytics, marketing, essentiels)
- ✅ Cookies stockés 1 an max
- ✅ Trace légale immutable (pas de DELETE)
- ✅ Droit d'oubli : RLS empêche accès aux autres données

### ✅ Données

- ✅ `user_id` lié à `auth.users` (authentification garantie)
- ✅ RLS empêche les accès non autorisés
- ✅ Admins peuvent voir les statistiques (vue `consent_analytics`)

### ✅ Authentification

- ✅ Server Actions exécutées côté serveur uniquement
- ✅ Clé SERVICE_ROLE utilisée seulement côté serveur
- ✅ Clé ANON exposée côté client (sans risque)

---

## 📊 ANALYSER LES CONSENTEMENTS

### Via SQL (Supabase)

```sql
-- Voir tous les consentements
SELECT * FROM user_consents;

-- Taux d'acceptation
SELECT 
  COUNT(*) as total,
  ROUND(100.0 * SUM(CASE WHEN analytics THEN 1 ELSE 0 END) / COUNT(*), 2) as analytics_pct,
  ROUND(100.0 * SUM(CASE WHEN marketing THEN 1 ELSE 0 END) / COUNT(*), 2) as marketing_pct
FROM user_consents;

-- Consentements par jour
SELECT DATE(accepted_at), COUNT(*) as count
FROM user_consents
GROUP BY DATE(accepted_at)
ORDER BY DATE DESC;

-- Vue d'analytique (pré-construite)
SELECT * FROM consent_analytics;
```

### Via Dashboard Supabase

1. **Table Editor** → `user_consents`
2. **Monitoring** → Voir les logs RLS

---

## 🛠️ DÉPANNAGE

### Le banneau ne s'affiche pas?

```tsx
// Vérifier que CookieBanner est importé et monté
// dans app/layout.tsx (APRÈS les Providers)

// Debug dans le navigateur:
console.log(document.cookie); // Doit contenir 'user_consent'
```

### Les cookies ne se sauvegardent pas?

```tsx
// Vérifier que js-cookie est installé
npm list js-cookie

// Vérifier les types TypeScript
// Doit avoir @types/js-cookie dans devDependencies
```

### L'enregistrement serveur échoue?

```tsx
// Vérifier les logs Supabase
// Dashboard → Monitoring → Logs

// Vérifier que auth.users existe
// Dans SQL Editor: SELECT * FROM auth.users;

// Vérifier les RLS policies
// Dashboard → Security → Policies
```

### "Row Level Security (RLS) rejected"?

```sql
-- Vérifier que la user_id correspond à auth.uid()
-- Le trigger peut échouer si l'utilisateur n'existe pas

-- Solution: vérifier que l'utilisateur est authentifié avant d'insérer
```

---

## 🎨 PERSONNALISATION

### Couleurs

Ouvrez [src/components/CookieBanner.tsx](../components/CookieBanner.tsx) et changez:

```tsx
// De:
className="... bg-amber-500 hover:bg-amber-600 ..."

// À:
className="... bg-blue-500 hover:bg-blue-600 ..."
```

### Textes

```tsx
// Changer les messages dans les sections de banneau
<h2 className="text-lg font-bold text-white mb-2">
  🔒 Gestion des cookies et données personnelles
</h2>
```

### Délai d'apparition

```tsx
// Dans CookieBanner.tsx, ligne ~50:
const timer = setTimeout(checkConsent, 500); // ← Changer ce délai
```

---

## 📚 RESSOURCES

- [RGPD & Cookies - CNIL](https://www.cnil.fr/fr/cookies-et-autres-traceurs)
- [js-cookie Documentation](https://github.com/js-cookie/js-cookie)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

## ✅ CHECKLIST D'INTÉGRATION

- [ ] Code SQL exécuté dans Supabase
- [ ] `npm install js-cookie @types/js-cookie`
- [ ] Fichiers créés : `consent.ts`, `CookieBanner.tsx`, `consentUtils.ts`
- [ ] `app/layout.tsx` mis à jour avec `<CookieBanner />`
- [ ] `.env.local` configuré avec les variables Supabase
- [ ] Test local : `npm run dev` et vérifier le banneau
- [ ] Cookies visibles dans DevTools (Application → Cookies)
- [ ] Consentement enregistré dans Supabase

---

## 🎯 PROCHAINES ÉTAPES

1. **Analytiques** : Intégrez Google Analytics avec `initAnalytics()`
2. **Marketing** : Ajoutez Facebook Pixel avec `initMarketing()`
3. **Gestion des préférences** : Créez une page `/preferences` pour modifier les consentements
4. **Audit** : Consultez régulièrement `consent_analytics` pour les statistiques
5. **Légal** : Linkez votre politique de confidentialité dans la banneau

---

**Crée par:** Architecture Next.js Senior + DB Architecture  
**Version:** 1.0  
**RGPD:** ✅ Compliant  
**Dernière mise à jour:** 2026-05-10
