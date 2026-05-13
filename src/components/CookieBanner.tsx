'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { saveUserConsent } from '@/src/actions/consent';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Cookie, BarChart3, Target, Shield } from 'lucide-react';

interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const DEFAULT_CONSENT: ConsentState = {
  analytics: false,
  marketing: false,
  preferences: true, // Toujours activé (nécessaire pour le fonctionnement)
};

/**
 * CookieBanner - Composant RGPD sticky
 * Gère l'acceptation/refus des cookies avec persistance locale et serveur
 */
export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Vérifier si l'utilisateur a déjà donné son consentement
  useEffect(() => {
    const checkConsent = () => {
      const savedConsent = Cookies.get('user_consent');
      if (!savedConsent) {
        setIsVisible(true);
      } else {
        setIsSaved(true);
      }
    };

    // Petit délai pour éviter les flashs
    const timer = setTimeout(checkConsent, 500);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Accepter tous les cookies
   */
  const handleAcceptAll = async () => {
    const allConsent: ConsentState = {
      analytics: true,
      marketing: true,
      preferences: true,
    };
    await saveConsent(allConsent);
  };

  /**
   * Refuser les cookies non essentiels
   */
  const handleRejectAll = async () => {
    const minimalConsent: ConsentState = {
      analytics: false,
      marketing: false,
      preferences: true,
    };
    await saveConsent(minimalConsent);
  };

  /**
   * Sauvegarder les choix personnalisés
   */
  const handleSavePreferences = async () => {
    await saveConsent(consent);
  };

  /**
   * Fonction principale de sauvegarde
   */
  const saveConsent = async (consentData: ConsentState) => {
    setIsLoading(true);

    try {
      // Sauvegarder localement en priorité
      Cookies.set('user_consent', JSON.stringify(consentData), {
        expires: 365, // 1 an
        sameSite: 'Lax',
        secure: process.env.NODE_ENV === 'production',
      });

      // Sauvegarder en base de données si utilisateur authentifié
      const result = await saveUserConsent(consentData);

      if (!result.success && result.authenticated) {
        console.warn('[Consent] Failed to save to database:', result.error);
      } else if (result.success) {
        console.log('[Consent] ✅ Saved successfully', {
          local: true,
          server: result.authenticated,
        });
      }

      setIsSaved(true);
      setIsExpanded(false);

      // Dispatch custom event to notify same-tab listeners (e.g., AnalyticsInitializer)
      window.dispatchEvent(new CustomEvent('consentChanged', { detail: consentData }));

      // Fermer la bannière après 2 secondes
      setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    } catch (err) {
      console.error('[Consent] Error saving consent:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Mettre à jour le toggle d'un type de consentement
   */
  const toggleConsent = (key: keyof ConsentState) => {
    if (key === 'preferences') {
      // Les préférences sont toujours activées
      return;
    }
    setConsent((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Animation d'entrée
  const bannerVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
    exit: { y: 100, opacity: 0, transition: { duration: 0.2 } },
  };

  const successVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 400, damping: 25 },
    },
  };

  return (
    <AnimatePresence>
      {isVisible && !isSaved && (
        <motion.div
          variants={bannerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 shadow-2xl"
        >
          {/* Contenu compact (par défaut) */}
          {!isExpanded && (
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
              <div className="max-w-7xl mx-auto">
                {/* Layout mobile (stack) et desktop (flex horizontal) */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                  {/* Contenu texte */}
                  <div className="flex-1 flex items-start gap-3 sm:gap-4">
                    <Cookie className="w-6 h-6 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1">
                        Respect de votre vie privée
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        Nous utilisons des cookies pour améliorer votre expérience, personnaliser le contenu et analyser notre trafic. Consultez notre{' '}
                        <button
                          onClick={() => setIsExpanded(true)}
                          className="font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                          politique de confidentialité
                        </button>
                      </p>
                    </div>
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-2 sm:gap-3 flex-shrink-0 self-end sm:self-center">
                    <button
                      onClick={handleRejectAll}
                      disabled={isLoading}
                      className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Refuser
                    </button>
                    <button
                      onClick={() => setIsExpanded(true)}
                      className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-900 bg-gray-200 dark:bg-gray-300 hover:bg-gray-300 dark:hover:bg-gray-400 rounded-lg transition-colors"
                    >
                      Personnaliser
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      disabled={isLoading}
                      className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 shadow-lg shadow-primary/20"
                    >
                      {isLoading ? 'Traitement...' : 'Accepter tout'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contenu détaillé (mode développé) */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto"
            >
              {/* En-tête */}
              <div className="flex justify-between items-start gap-4 mb-6 sm:mb-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-primary flex-shrink-0" />
                    <h2 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                      Gestion des cookies et données
                    </h2>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    AMESCAO respecte votre vie privée. Nous utilisons différents types de cookies pour vous offrir une meilleure expérience et comprendre comment vous utilisez notre site.
                  </p>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 -m-2 flex-shrink-0"
                  aria-label="Fermer"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Grille de cookies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8">
                {/* Essentiels (toujours activés) */}
                <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-xl p-4 sm:p-5 border-2 border-green-200 dark:border-green-800/50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <h3 className="font-bold text-gray-900 dark:text-white">Essentiels</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        Nécessaires pour la sécurité et le fonctionnement du site (authentification, RGPD)
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <div className="w-5 h-5 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center">
                        <Check size={16} className="text-white" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-300 font-semibold">Toujours activé</p>
                </div>

                {/* Analytique */}
                <div
                  className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl p-4 sm:p-5 border-2 border-blue-200 dark:border-blue-800/50 cursor-pointer transition-all hover:shadow-md"
                  onClick={() => toggleConsent('analytics')}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <BarChart3 className={`w-5 h-5 flex-shrink-0 transition-colors ${consent.analytics ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
                        <h3 className="font-bold text-gray-900 dark:text-white">Analytique</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        Nous aide à comprendre vos interactions et à améliorer le site
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                        consent.analytics
                          ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500'
                          : 'border-gray-300 dark:border-gray-600 bg-transparent'
                      }`}>
                        {consent.analytics && <Check size={16} className="text-white mx-auto" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Marketing */}
                <div
                  className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-xl p-4 sm:p-5 border-2 border-purple-200 dark:border-purple-800/50 cursor-pointer transition-all hover:shadow-md"
                  onClick={() => toggleConsent('marketing')}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className={`w-5 h-5 flex-shrink-0 transition-colors ${consent.marketing ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500'}`} />
                        <h3 className="font-bold text-gray-900 dark:text-white">Marketing</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        Contenu et publicités personnalisées selon vos préférences
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                        consent.marketing
                          ? 'bg-purple-600 dark:bg-purple-500 border-purple-600 dark:border-purple-500'
                          : 'border-gray-300 dark:border-gray-600 bg-transparent'
                      }`}>
                        {consent.marketing && <Check size={16} className="text-white mx-auto" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lien légal */}
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4 mb-6 sm:mb-8 border border-gray-200 dark:border-slate-700">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  📋 En cliquant sur "Accepter tout", vous consentez à l'utilisation de tous les cookies. Vous pouvez modifier vos préférences à tout moment. Consultez notre{' '}
                  <a href="/privacy" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                    politique de confidentialité
                  </a>{' '}
                  pour plus de détails.
                </p>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={() => setIsExpanded(false)}
                  disabled={isLoading}
                  className="px-5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  Fermer
                </button>
                <button
                  onClick={handleRejectAll}
                  disabled={isLoading}
                  className="px-5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  Refuser tous
                </button>
                <button
                  onClick={handleSavePreferences}
                  disabled={isLoading}
                  className="px-5 py-3 text-sm font-semibold text-white bg-secondary hover:bg-secondary/90 rounded-lg transition-colors disabled:opacity-50 shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Mes choix
                    </>
                  )}
                </button>
                <button
                  onClick={handleAcceptAll}
                  disabled={isLoading}
                  className="px-5 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  {isLoading ? 'Traitement...' : 'Accepter tout'}
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Message de confirmation */}
      {isSaved && isVisible && (
        <motion.div
          variants={successVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed bottom-6 right-4 sm:right-6 z-50 bg-primary text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-xl flex items-center gap-3 max-w-sm"
        >
          <Check size={20} className="flex-shrink-0" />
          <span className="font-semibold text-sm sm:text-base">Vos préférences ont été enregistrées</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
