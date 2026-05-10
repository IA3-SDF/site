'use client';

import { useState, useEffect } from 'react';
import { ConsentData, getLocalConsent, hasUserConsented } from '@/src/utils/consentUtils';

/**
 * Hook personnalisé pour accéder au consentement de l'utilisateur
 * 
 * @example
 * const { consent, hasConsented, canAnalytics, canMarketing } = useConsent();
 */
export function useConsent() {
  const [consent, setConsent] = useState<ConsentData | null>(null);
  const [hasConsented, setHasConsented] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier le consentement au montage
    const consentData = getLocalConsent();
    setConsent(consentData);
    setHasConsented(hasUserConsented());
    setIsLoading(false);

    // Écouter les changements (optionnel)
    const handleStorageChange = () => {
      const updated = getLocalConsent();
      setConsent(updated);
      setHasConsented(hasUserConsented());
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    // État brut
    consent,
    hasConsented,
    isLoading,

    // Raccourcis pratiques
    canAnalytics: consent?.analytics ?? false,
    canMarketing: consent?.marketing ?? false,
    canPreferences: consent?.preferences ?? true,
  };
}
