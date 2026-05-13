/**
 * GUIDE DE RÉFÉRENCE - IMPORTS SUPABASE
 * 
 * Utilisez ce fichier comme référence pour savoir quel import utiliser
 */

// ============================================================================
// 1️⃣ CLIENT COMPONENTS (page.tsx, components/*, etc.)
// ============================================================================

// ✅ Pour lire des données
import { getEvents, getAlbums, getReports, getBoardMembers, getMediaUrl } from '@/src/services/supabase';
import { getCurrentUserProfile, updateUserProfile } from '@/src/services/supabase';

// ✅ Pour accès direct (mutations en temps réel, state management)
import { supabase } from '@/src/services/supabase/client';

// ✅ Pour uploads
import { uploadFile } from '@/src/lib/upload';

// ============================================================================
// 2️⃣ SERVER ACTIONS & MIDDLEWARE
// ============================================================================

// ✅ Utiliser le service layer (jamais le client directement)
import { getEvents, getAlbums, getReports, getBoardMembers } from '@/src/services/supabase';

// ❌ NE PAS faire ça côté serveur :
// import { supabase } from '@/src/services/supabase/client'; // ❌ Mauvais

// ❌ NE JAMAIS importer le client admin côté client :
// import { supabaseAdmin } from '@/src/services/supabase/server'; // ❌ DANGER !

// ============================================================================
// 3️⃣ ADMIN DASHBOARD
// ============================================================================

// ✅ Pour CRUD operations
import { getAll, insertItem, updateItem, deleteItem, uploadFile } from '@/src/admin/config/database';
import { getCurrentUserProfile, logoutUser } from '@/src/admin/config/database';

// ============================================================================
// EXEMPLES D'UTILISATION
// ============================================================================

/**
 * Exemple 1: Récupérer des événements (Client Component)
 */
async function ExampleGetEvents() {
  // ✅ Bon
  const events = await getEvents();
  
  // ❌ Mauvais - crée une dépendance directe
  // const { data } = await supabase.from('events').select('*');
}

/**
 * Exemple 2: Afficher une image stockée
 */
function ExampleShowImage() {
  // ✅ Bon
  const imageUrl = getMediaUrl('events/photo-123.jpg');
  
  // ❌ Mauvais - hardcoder l'URL
  // const imageUrl = `https://xucxrnwuxwdwfqvfhlib.supabase.co/storage/v1/object/public/amescao/...`;
}

/**
 * Exemple 3: Admin - Récupérer tous les items
 */
async function ExampleAdminGetAll() {
  // ✅ Bon - utilise le service admin
  const items = await getAll('events');
  
  // ❌ Mauvais - ne pas recréer le client
  // const { data } = await supabase.from('events').select('*');
}

/**
 * Exemple 4: Upload de fichier
 */
async function ExampleUploadFile(file: File) {
  // ✅ Bon - utility dédiée
  const url = await uploadFile(file);
  
  // ❌ Mauvais - logique dispersée
  // const { data } = await supabase.storage.from('amescao').upload(...);
}

/**
 * Exemple 5: Authentification
 */
async function ExampleGetUser() {
  // ✅ Bon - service centralisé
  const profile = await getCurrentUserProfile();
  
  // ❌ Mauvais - repeater du code
  // const { data } = await supabase.auth.getSession();
  // const profile = await supabase.from('profiles').select(...);
}

// ============================================================================
// RÉSUMÉ RAPIDE
// ============================================================================

/*
┌─────────────────────┬──────────────────┬─────────────────────────────┐
│ Contexte            │ Fichier Principal│ Import                      │
├─────────────────────┼──────────────────┼─────────────────────────────┤
│ Pages/Composants    │ Client Component │ /services/supabase          │
│ avec données        │ (use client)      │ /services/supabase/client   │
├─────────────────────┼──────────────────┼─────────────────────────────┤
│ Server Actions      │ action.ts        │ /services/supabase          │
├─────────────────────┼──────────────────┼─────────────────────────────┤
│ Middleware          │ middleware.ts    │ /services/supabase/client   │
├─────────────────────┼──────────────────┼─────────────────────────────┤
│ Admin CRUD          │ AdminPage        │ /admin/config/database      │
├─────────────────────┼──────────────────┼─────────────────────────────┤
│ Upload Fichiers     │ N'importe où     │ /lib/upload                 │
├─────────────────────┼──────────────────┼─────────────────────────────┤
│ Server-only         │ Serveur Auth     │ /services/supabase/server   │
│ (admin secrets)     │                  │ (supabaseAdmin seulement)   │
└─────────────────────┴──────────────────┴─────────────────────────────┘
*/
