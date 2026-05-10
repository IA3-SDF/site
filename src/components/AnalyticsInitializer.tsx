'use client';

import { useEffect } from 'react';
import { initAnalytics, initMarketing, getLocalConsent } from '@/src/utils/consentUtils';

/**
 * AnalyticsInitializer
 * Composant qui initialise les scripts analytiques/marketing en fonction du consentement
 * À intégrer dans les Providers
 */
export default function AnalyticsInitializer() {
  useEffect(() => {
    // Vérifier le consentement au montage
    const consent = getLocalConsent();

    if (consent?.analytics) {
      console.log('[Analytics] ✅ Initializing analytics...');
      initAnalytics();
    }

    if (consent?.marketing) {
      console.log('[Marketing] ✅ Initializing marketing...');
      initMarketing();
    }

    // Écouter les changements de consentement
    const handleConsentChange = () => {
      const updatedConsent = getLocalConsent();
      console.log('[Consent] Updated:', updatedConsent);

      // Vous pouvez ici réinitialiser les scripts si le consentement change
      if (updatedConsent?.analytics) {
        initAnalytics();
      }
      if (updatedConsent?.marketing) {
        initMarketing();
      }
    };

    window.addEventListener('storage', handleConsentChange);

    return () => {
      window.removeEventListener('storage', handleConsentChange);
    };
  }, []);

  return null;
}
