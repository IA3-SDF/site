/**
 * Utilitaires pour la gestion des cookies et du consentement RGPD
 */
import Cookies from 'js-cookie';

export interface ConsentData {
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const CONSENT_COOKIE_NAME = 'user_consent';
const CONSENT_EXPIRES_DAYS = 365;

/**
 * Récupérer le consentement depuis le cookie local
 */
export const getLocalConsent = (): ConsentData | null => {
  const stored = Cookies.get(CONSENT_COOKIE_NAME);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as ConsentData;
  } catch {
    return null;
  }
};

/**
 * Sauvegarder le consentement dans le cookie local
 */
export const setLocalConsent = (consent: ConsentData): void => {
  Cookies.set(CONSENT_COOKIE_NAME, JSON.stringify(consent), {
    expires: CONSENT_EXPIRES_DAYS,
    sameSite: 'Lax',
    secure: process.env.NODE_ENV === 'production',
  });
};

/**
 * Vérifier si l'utilisateur a donné son consentement
 */
export const hasUserConsented = (): boolean => {
  return getLocalConsent() !== null;
};

/**
 * Charger les scripts analytiques si consentement accordé
 */
export const initAnalytics = (): void => {
  const consent = getLocalConsent();

  if (consent?.analytics) {
    // Exemple : Google Analytics
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_ID) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        (window.dataLayer as any).push(arguments);
      }
      (window as any).gtag = gtag;
      gtag('js', new Date());
      gtag('config', process.env.NEXT_PUBLIC_GA_ID);
    }
  }
};

/**
 * Charger les scripts de marketing si consentement accordé
 */
export const initMarketing = (): void => {
  const consent = getLocalConsent();

  if (consent?.marketing) {
    // Exemple : Facebook Pixel
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_FB_PIXEL_ID) {
      const script = document.createElement('script');
      script.innerHTML = `
        !function(f,b,e,v,n,t,s){
          if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)
        }(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
    }
  }
};

/**
 * Réinitialiser le consentement (optionnel)
 */
export const resetConsent = (): void => {
  Cookies.remove(CONSENT_COOKIE_NAME);
};

export default {
  getLocalConsent,
  setLocalConsent,
  hasUserConsented,
  initAnalytics,
  initMarketing,
  resetConsent,
};
