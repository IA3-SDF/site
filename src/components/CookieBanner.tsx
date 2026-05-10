'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { saveUserConsent } from '@/src/actions/consent';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

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
          className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900 to-slate-800 border-t border-slate-700 shadow-2xl"
        >
          {/* Contenu compact (par défaut) */}
          {!isExpanded && (
            <div className="px-6 py-4">
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
                <div className="flex-1">
                  <p className="text-sm text-slate-100">
                    🍪 Nous utilisons des cookies pour améliorer votre expérience.
                    <button
                      onClick={() => setIsExpanded(true)}
                      className="ml-2 font-semibold text-amber-400 hover:text-amber-300 transition"
                    >
                      En savoir plus
                    </button>
                  </p>
                </div>

                <div className="flex gap-3 flex-shrink-0">
                  <button
                    onClick={handleRejectAll}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition disabled:opacity-50"
                  >
                    Refuser
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition disabled:opacity-50"
                  >
                    {isLoading ? 'Traitement...' : 'Accepter tout'}
                  </button>
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
              className="px-6 py-6 max-w-7xl mx-auto"
            >
              {/* Titre */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white mb-2">
                    🔒 Gestion des cookies et données personnelles
                  </h2>
                  <p className="text-sm text-slate-300">
                    Nous respectons votre vie privée. Choisissez quels cookies vous autorisez.
                  </p>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-slate-400 hover:text-white transition"
                  aria-label="Fermer"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Grille de cookies */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {/* Préférences (toujours activée) */}
                <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-white">✓ Essentiels</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Nécessaires au fonctionnement du site
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="w-5 h-5 accent-amber-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Analytics */}
                <div
                  className="bg-slate-700 rounded-lg p-4 border border-slate-600 cursor-pointer hover:border-amber-500 transition"
                  onClick={() => toggleConsent('analytics')}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-white">📊 Analytique</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Comprendre comment vous utilisez le site
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={consent.analytics}
                      onChange={() => toggleConsent('analytics')}
                      className="w-5 h-5 accent-amber-500"
                    />
                  </div>
                </div>

                {/* Marketing */}
                <div
                  className="bg-slate-700 rounded-lg p-4 border border-slate-600 cursor-pointer hover:border-amber-500 transition"
                  onClick={() => toggleConsent('marketing')}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-white">🎯 Marketing</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Publicités personnalisées et contenu
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={consent.marketing}
                      onChange={() => toggleConsent('marketing')}
                      className="w-5 h-5 accent-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Lien légal */}
              <p className="text-xs text-slate-400 mb-6">
                Consultez notre{' '}
                <a href="/privacy" className="text-amber-400 hover:text-amber-300">
                  politique de confidentialité
                </a>{' '}
                pour plus d'informations.
              </p>

              {/* Boutons d'action */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleRejectAll}
                  disabled={isLoading}
                  className="px-6 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-600 hover:bg-slate-500 rounded-lg transition disabled:opacity-50"
                >
                  Refuser tous
                </button>
                <button
                  onClick={handleAcceptAll}
                  disabled={isLoading}
                  className="px-6 py-2 text-sm font-medium text-slate-900 bg-amber-400 hover:bg-amber-500 rounded-lg transition disabled:opacity-50"
                >
                  Accepter tous
                </button>
                <button
                  onClick={handleSavePreferences}
                  disabled={isLoading}
                  className="px-6 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Enregistrer mes choix
                    </>
                  )}
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
          className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3"
        >
          <Check size={20} />
          <span className="font-medium">Vos préférences ont été enregistrées</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
