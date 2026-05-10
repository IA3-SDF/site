'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Server Action - Enregistrer le consentement RGPD
 * Vérification de session + Insertion dans la table user_consents
 */
export async function saveUserConsent(consentData: {
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}) {
  try {
    // Initialiser le client Supabase côté serveur
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Récupérer les cookies pour obtenir la session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-auth-token')?.value;

    if (!sessionCookie) {
      // Utilisateur non authentifié - accepter silencieusement
      console.log('[Consent] User not authenticated, consent stored locally only');
      return { success: true, authenticated: false };
    }

    // Obtenir l'utilisateur courant via la session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[Consent] Auth error:', authError);
      return { success: false, error: 'Authentication failed' };
    }

    // Récupérer les informations client (IP, User-Agent)
    const headers = new Headers();
    // Note: Dans une vraie app, vous récupérieriez ces infos du context Next.js
    // ou du header de la requête

    // Insérer le consentement dans la table
    const { data, error } = await supabase
      .from('user_consents')
      .insert({
        user_id: user.id,
        analytics: consentData.analytics,
        marketing: consentData.marketing,
        preferences: consentData.preferences,
        consent_version: '1.0',
      })
      .select('*')
      .single();

    if (error) {
      // Si l'erreur est "duplicate key", c'est normal (le trigger va remplacer)
      if (error.message.includes('duplicate')) {
        console.log('[Consent] Consent updated for user:', user.id);
        return { success: true, updated: true };
      }
      console.error('[Consent] Database error:', error);
      return { success: false, error: error.message };
    }

    console.log('[Consent] ✅ Consent saved for user:', user.id);
    return {
      success: true,
      data: data,
      authenticated: true,
    };
  } catch (err) {
    console.error('[Consent] Error in saveUserConsent:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Server Action - Récupérer le consentement de l'utilisateur
 */
export async function getUserConsent() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-auth-token')?.value;

    if (!sessionCookie) {
      return { success: true, authenticated: false, data: null };
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Authentication failed' };
    }

    const { data, error } = await supabase
      .from('user_consents')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned (normal si première visite)
      console.error('[Consent] Error fetching consent:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: data || null,
      authenticated: true,
    };
  } catch (err) {
    console.error('[Consent] Error in getUserConsent:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
