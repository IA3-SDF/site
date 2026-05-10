/**
 * EXEMPLES D'UTILISATION - Système de Gestion des Cookies RGPD
 * Ces exemples montrent comment utiliser le système dans vos pages et composants
 */

// ============================================
// 1️⃣ INITIALISER LES ANALYTICS AU DÉMARRAGE
// ============================================

// app/providers.tsx - Ajouter le composant AnalyticsInitializer

import { ReactNode } from 'react';
import AnalyticsInitializer from '@/src/components/AnalyticsInitializer';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <AnalyticsInitializer />
    </>
  );
}

// src/components/AnalyticsInitializer.tsx

'use client';

import { useEffect } from 'react';
import { initAnalytics, initMarketing, getLocalConsent } from '@/src/utils/consentUtils';

export default function AnalyticsInitializer() {
  useEffect(() => {
    // Initialiser les scripts analytiques si consentement accordé
    const consent = getLocalConsent();
    
    if (consent?.analytics) {
      initAnalytics();
    }
    
    if (consent?.marketing) {
      initMarketing();
    }
    
    // Écouter les changements (optionnel)
    window.addEventListener('consent-changed', () => {
      const updatedConsent = getLocalConsent();
      console.log('Consentement mis à jour:', updatedConsent);
    });

    return () => {
      window.removeEventListener('consent-changed', () => {});
    };
  }, []);

  return null;
}

// ============================================
// 2️⃣ PAGE DE GESTION DES PRÉFÉRENCES
// ============================================

// app/preferences/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { getLocalConsent, setLocalConsent, ConsentData } from '@/src/utils/consentUtils';

export default function PreferencesPage() {
  const [consent, setConsent] = useState<ConsentData | null>(null);

  useEffect(() => {
    setConsent(getLocalConsent());
  }, []);

  const handleChange = (key: keyof ConsentData) => {
    if (consent) {
      const updated = { ...consent, [key]: !consent[key] };
      setLocalConsent(updated);
      setConsent(updated);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Gérer mes préférences</h1>

      {consent ? (
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Essentiels</h2>
                <p className="text-gray-600">Nécessaires pour le fonctionnement</p>
              </div>
              <input type="checkbox" checked disabled className="w-6 h-6" />
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Analytique</h2>
                <p className="text-gray-600">Nous aider à améliorer le site</p>
              </div>
              <input
                type="checkbox"
                checked={consent.analytics}
                onChange={() => handleChange('analytics')}
                className="w-6 h-6"
              />
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Marketing</h2>
                <p className="text-gray-600">Publicités personnalisées</p>
              </div>
              <input
                type="checkbox"
                checked={consent.marketing}
                onChange={() => handleChange('marketing')}
                className="w-6 h-6"
              />
            </div>
          </div>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            ← Retour à l'accueil
          </button>
        </div>
      ) : (
        <p className="text-gray-600">Aucun consentement enregistré. Acceptez les cookies d'abord.</p>
      )}
    </div>
  );
}

// ============================================
// 3️⃣ COMPOSANT POUR VÉRIFIER LE CONSENTEMENT
// ============================================

// src/components/ConditionalAnalytics.tsx

'use client';

import { useEffect, useState } from 'react';
import { getLocalConsent } from '@/src/utils/consentUtils';

interface ConditionalAnalyticsProps {
  type: 'analytics' | 'marketing';
  children: React.ReactNode;
}

export default function ConditionalAnalytics({ type, children }: ConditionalAnalyticsProps) {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const consent = getLocalConsent();
    setHasConsent(consent?.[type] ?? false);
  }, [type]);

  if (!hasConsent) return null;

  return <>{children}</>;
}

// Utilisation:
/*
<ConditionalAnalytics type="analytics">
  <Analytics />
</ConditionalAnalytics>
*/

// ============================================
// 4️⃣ EXEMPLE AVEC GOOGLE ANALYTICS
// ============================================

// src/components/GoogleAnalytics.tsx

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Le consentement est déjà vérifié par AnalyticsInitializer
    // Ce composant sera rendu uniquement s'il y a consentement

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('pageview', {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return null;
}

// ============================================
// 5️⃣ COMPOSANT POUR AFFICHER LE STATUT
// ============================================

// src/components/ConsentStatus.tsx

'use client';

import { useEffect, useState } from 'react';
import { getLocalConsent, hasUserConsented } from '@/src/utils/consentUtils';

export default function ConsentStatus() {
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    if (hasUserConsented()) {
      const consent = getLocalConsent();
      const types = [];
      if (consent?.analytics) types.push('Analytics');
      if (consent?.marketing) types.push('Marketing');
      setStatus(`Consentis: ${types.join(', ')}`);
    } else {
      setStatus('Aucun consentement enregistré');
    }
  }, []);

  return (
    <div className="bg-blue-100 border border-blue-300 rounded p-4">
      <p className="text-sm text-blue-800">📋 {status}</p>
      <a href="/preferences" className="text-blue-600 hover:underline text-sm">
        Gérer les préférences →
      </a>
    </div>
  );
}

// ============================================
// 6️⃣ HOOK PERSONNALISÉ
// ============================================

// src/hooks/useConsent.ts

import { useState, useEffect } from 'react';
import { ConsentData, getLocalConsent } from '@/src/utils/consentUtils';

export function useConsent() {
  const [consent, setConsent] = useState<ConsentData | null>(null);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    const data = getLocalConsent();
    setConsent(data);
    setHasConsented(!!data);
  }, []);

  return {
    consent,
    hasConsented,
    canAnalytics: consent?.analytics ?? false,
    canMarketing: consent?.marketing ?? false,
  };
}

// Utilisation:
/*
'use client';

import { useConsent } from '@/src/hooks/useConsent';

export default function MyComponent() {
  const { canAnalytics, canMarketing } = useConsent();
  
  return (
    <div>
      {canAnalytics && <Analytics />}
      {canMarketing && <Marketing />}
    </div>
  );
}
*/

// ============================================
// 7️⃣ EXEMPLE DE PAGE AVEC CONSENTEMENT
// ============================================

// app/page.tsx - Exemple complet

'use client';

import { useConsent } from '@/src/hooks/useConsent';
import ConsentStatus from '@/src/components/ConsentStatus';

export default function HomePage() {
  const { hasConsented } = useConsent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Bienvenue sur AMESCAO</h1>
        
        {!hasConsented && (
          <div className="bg-amber-100 border border-amber-300 rounded-lg p-4 mb-6">
            <p className="text-amber-800">
              💡 Acceptez les cookies (voir en bas) pour une meilleure expérience
            </p>
          </div>
        )}

        {hasConsented && (
          <ConsentStatus />
        )}

        <div className="mt-8 prose">
          {/* Contenu de votre site */}
        </div>
      </div>
    </div>
  );
}

// ============================================
// 8️⃣ TESTING - VÉRIFIER LES COOKIES
// ============================================

// Pour tester dans le navigateur (Console DevTools):

/*
// 1. Vérifier les cookies
document.cookie;
// → "user_consent=%7B%22analytics%22%3Atrue%2C%22marketing%22%3Afalse%2C%22preferences%22%3Atrue%7D"

// 2. Parser le cookie
JSON.parse(decodeURIComponent(document.cookie.split('user_consent=')[1]));
// → { analytics: true, marketing: false, preferences: true }

// 3. Supprimer le cookie (pour réinitialiser)
document.cookie = "user_consent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

// 4. Vérifier Supabase
// → Allez dans Supabase Dashboard → user_consents
// → Vous devriez voir une ligne avec votre user_id et le consentement
*/

// ============================================
// 9️⃣ VARIABLES D'ENVIRONNEMENT
// ============================================

/*
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Analytics (optionnel)
NEXT_PUBLIC_GA_ID=G-XXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID=1234567890
*/

export {};
