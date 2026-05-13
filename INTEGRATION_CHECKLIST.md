# ✅ CHECKLIST D'INTÉGRATION - SYSTÈME RGPD COOKIES

## 📋 Fichiers Créés

Voici tous les fichiers qui ont été créés/modifiés pour vous:

```
✅ src/actions/consent.ts                    # Server Actions
✅ src/components/CookieBanner.tsx           # Composant UI principal (sticky)
✅ src/components/AnalyticsInitializer.tsx   # Initialise les analytics
✅ src/hooks/useConsent.ts                   # Hook personnalisé
✅ src/utils/consentUtils.ts                 # Utilitaires de gestion
✅ app/layout.tsx                            # Modifié (ajout CookieBanner)
✅ package.json                              # Modifié (ajout js-cookie)
✅ migrations/001_create_user_consents.sql   # Migration Supabase
✅ COOKIE_RGPD_SETUP.md                      # Documentation complète
✅ COOKIE_RGPD_EXAMPLES.ts                   # Exemples d'utilisation
```

---

## 🚀 ÉTAPES À SUIVRE (DANS L'ORDRE)

### ✅ ÉTAPE 1: Exécuter le SQL

1. Ouvrez [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor** → **New Query**
4. Copiez/collez le contenu de `migrations/001_create_user_consents.sql`
5. **Exécutez** la requête (bouton ► Play)
6. Vérifiez les **Verification Queries** en bas du fichier

```sql
-- Doit retourner: table_name = 'user_consents'
SELECT table_name FROM information_schema.tables WHERE table_name = 'user_consents';
```

### ✅ ÉTAPE 2: Installer les dépendances

```bash
# Depuis votre terminal
npm install
```

(Normalement `js-cookie` et `@types/js-cookie` sont déjà dans `package.json`)

### ✅ ÉTAPE 3: Vérifier les variables d'environnement

Assurez-vous que votre `.env.local` contient:

```bash
# Requis:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Optionnel (pour les analytics):
# NEXT_PUBLIC_GA_ID=G-XXXXXXX
# NEXT_PUBLIC_FB_PIXEL_ID=1234567890
```

### ✅ ÉTAPE 4: Vérifier l'intégration dans layout.tsx

Ouvrez `app/layout.tsx` et vérifiez que:
- ✅ Import: `import CookieBanner from '@/src/components/CookieBanner';`
- ✅ Rendu: `<CookieBanner />` présent dans le JSX

### ✅ ÉTAPE 5: Tester en local

```bash
npm run dev
```

Ouvrez http://localhost:3000 et vérifiez:

- [ ] Banneau apparaît en bas après 500ms
- [ ] Clic "Accepter tout" → banneau disparaît
- [ ] Vérifiez le cookie dans DevTools (F12 → Application → Cookies)
- [ ] Le cookie `user_consent` doit exister avec la valeur JSON

### ✅ ÉTAPE 6: Vérifier l'enregistrement Supabase

Si vous êtes connecté (auth):

1. Allez dans Supabase Dashboard → **Table Editor**
2. Ouvrez la table `user_consents`
3. Vous devez voir une ligne avec:
   - `user_id`: votre ID utilisateur
   - `analytics`: true/false
   - `marketing`: true/false
   - `preferences`: true
   - `accepted_at`: timestamp

### ✅ ÉTAPE 7: Optionnel - Modifier les Providers

Si vous voulez initialiser les analytics au démarrage, modifiez `app/providers.tsx`:

```tsx
import AnalyticsInitializer from '@/src/components/AnalyticsInitializer';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <AnalyticsInitializer />
    </>
  );
}
```

---

## 🔍 VÉRIFICATIONS IMPORTANTES

### Vérification 1: Base de données

```sql
-- Dans Supabase SQL Editor
SELECT * FROM user_consents LIMIT 10;
```

**Doit retourner:** Au moins 1 ligne si vous avez accepté les cookies

### Vérification 2: RLS Policies

```sql
-- Doit retourner 5 policies
SELECT policyname FROM pg_policies WHERE tablename = 'user_consents';
```

**Résultat attendu:**
- Admins can read all consents
- No deletes allowed
- No updates allowed
- Users can insert their own consent
- Users can read their own consent

### Vérification 3: Cookies côté client

```javascript
// Console DevTools (F12)
console.log(JSON.parse(decodeURIComponent(document.cookie.split('user_consent=')[1])))
```

**Doit retourner:**
```json
{
  "analytics": true,
  "marketing": false,
  "preferences": true
}
```

### Vérification 4: TypeScript

```bash
# Compile sans erreurs?
npm run build
```

---

## 🐛 DÉPANNAGE

### Le banneau ne s'affiche pas

```typescript
// Dans CookieBanner.tsx, recherchez:
setIsVisible(true);  // Doit être appelé

// Vérifiez:
// 1. CookieBanner est dans app/layout.tsx
// 2. Pas d'erreur dans Console (F12)
// 3. Cookie user_consent n'existe pas déjà
```

### L'enregistrement Supabase échoue

```typescript
// Dans src/actions/consent.ts, ligne ~20:
const { data: { user }, error: authError } = await supabase.auth.getUser();

// Si authError !== null:
// - Utilisateur n'est pas authentifié (normal pour anon)
// - Vérifier que SUPABASE_SERVICE_ROLE_KEY est correct
```

### Cookie ne persiste pas

```typescript
// Dans src/utils/consentUtils.ts, ligne ~15:
Cookies.set(CONSENT_COOKIE_NAME, JSON.stringify(consent), {
  sameSite: 'Lax',
  secure: process.env.NODE_ENV === 'production',  // ← Important
});

// En localhost: secure: false
// En production: secure: true (HTTPS required)
```

### Error "Row Level Security (RLS) rejected"

```sql
-- Vérifiez que les policies existent:
SELECT policyname FROM pg_policies WHERE tablename = 'user_consents';

-- Regénérez-les si manquants:
-- Copiez/collez la section "CREATE POLICIES" du fichier migration
```

---

## 📊 UTILISATION DANS VOS COMPOSANTS

### Simple: Vérifier le consentement

```tsx
'use client';

import { useConsent } from '@/src/hooks/useConsent';

export default function MyComponent() {
  const { canAnalytics, canMarketing } = useConsent();
  
  return (
    <div>
      {canAnalytics && <GoogleAnalytics />}
      {canMarketing && <FacebookPixel />}
    </div>
  );
}
```

### Avancé: Réagir aux changements

```tsx
'use client';

import { useEffect } from 'react';
import { getLocalConsent } from '@/src/utils/consentUtils';

export default function TrackingScript() {
  useEffect(() => {
    const consent = getLocalConsent();
    
    if (consent?.analytics) {
      // Initialiser analytics
      console.log('Analytics enabled');
    }
  }, []);

  return null;
}
```

---

## 🎨 PERSONNALISATIONS

### Changer les couleurs

Ouvrez `src/components/CookieBanner.tsx`:

```tsx
// Recherchez: bg-amber-500
// Remplacez par: bg-blue-500 ou votre couleur

className="... bg-amber-500 hover:bg-amber-600 ..."
```

### Ajouter plus de types de consentements

1. Modifiez `ConsentData` interface dans `src/utils/consentUtils.ts`
2. Ajoutez la colonne dans `migrations/001_create_user_consents.sql`
3. Mettez à jour `CookieBanner.tsx` pour le nouveau type

### Traduire en d'autres langues

Tous les textes sont dans `src/components/CookieBanner.tsx`. Cherchez les `<h2>`, `<p>` et `<button>`.

---

## 📈 ANALYTICS & MONITORING

### Voir les statistiques

```sql
-- Taux d'acceptation par jour
SELECT * FROM consent_analytics;

-- Détails journaliers
SELECT * FROM consent_daily_breakdown;

-- Top 10 derniers consentements
SELECT * FROM user_consents ORDER BY created_at DESC LIMIT 10;
```

### Créer un dashboard Supabase

1. Supabase Dashboard → **Dashboards** (nouvelle version)
2. Créez un dashboard personnalisé
3. Ajoutez des widgets avec les vues `consent_analytics` et `consent_daily_breakdown`

---

## 🔐 CONFORMITÉ RGPD

✅ **Ce système respecte:**

- [x] Consentement explicite (opt-in)
- [x] Choix granulaires (3 types)
- [x] Durée max 365 jours
- [x] Trace légale (pas de DELETE)
- [x] Authentification sécurisée (Server Actions)
- [x] RLS (données isolées par utilisateur)
- [x] Accessibilité (keyboard + screen readers)

**Ressources:**
- [CNIL - Cookies & Traceurs](https://www.cnil.fr/fr/cookies-et-autres-traceurs)
- [RGPD Art. 7 - Consentement](https://www.rgpd.eu/article-7-consentement.html)

---

## 🚀 PROCHAINES ÉTAPES

1. **Google Analytics**: Remplacez la placeholder dans `src/utils/consentUtils.ts`
2. **Facebook Pixel**: Ajoutez votre ID dans `.env.local`
3. **Page de préférences**: Créez `app/preferences/page.tsx` (voir exemples)
4. **Audit**: Consultez régulièrement `consent_analytics`
5. **Légal**: Linkez votre politique de confidentialité

---

## ❓ QUESTIONS FRÉQUENTES

**Q: Les cookies fonctionnent si l'utilisateur n'est pas connecté?**
A: Oui! Le cookie est sauvegardé localement. L'enregistrement Supabase ne se fait que si authentifié.

**Q: Combien de temps avant le cookie expire?**
A: 365 jours (configurable dans `consentUtils.ts`)

**Q: Puis-je modifier le consentement après l'avoir accepté?**
A: Non pour la base (politique RGPD). Le trigger la remplace automatiquement. Créez une page `/preferences` si besoin.

**Q: Et si l'utilisateur refuse les cookies?**
A: Le cookie `user_consent` est toujours créé avec `analytics: false, marketing: false`

**Q: Où sont stockés les cookies?**
A: Localement dans le navigateur + Supabase (si connecté)

---

## 📞 SUPPORT

Si vous rencontrez des problèmes:

1. Vérifiez les **Verification Queries** du fichier SQL
2. Consultez la section **DÉPANNAGE** ci-dessus
3. Vérifiez la Console du navigateur (F12)
4. Vérifiez les logs Supabase (Dashboard → Monitoring)

---

**Status:** ✅ PRÊT À UTILISER
**Version:** 1.0
**RGPD:** ✅ Compliant
**Créé:** 2026-05-10
