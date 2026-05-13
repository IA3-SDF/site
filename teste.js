/**
 * Script de test Supabase
 * Récupère les données de toutes les tables et les affiche dans la console
 * 
 * Usage: node teste.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validation
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERREUR: Variables d\'environnement manquantes!');
  console.error('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log('🔗 Connexion à Supabase...\n');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Clé SERVICE_ROLE: ✅ Chargée (server-only)\n');

// Liste des tables à récupérer
const tables = [
  'events',
  'albums',
  'reports',
  'bureau',
  'profiles',
];

/**
 * Récupère les données d'une table
 */
async function fetchTableData(tableName) {
  try {
    const { data, error, status } = await supabase
      .from(tableName)
      .select('*')
      .limit(100); // Limite pour ne pas surcharger

    if (error) {
      return {
        table: tableName,
        status: '❌',
        error: error.message,
        code: error.code,
      };
    }

    return {
      table: tableName,
      status: '✅',
      count: data ? data.length : 0,
      data: data || [],
    };
  } catch (err) {
    return {
      table: tableName,
      status: '❌',
      error: err.message,
    };
  }
}

/**
 * Récupère les données de toutes les tables
 */
async function fetchAllTables() {
  console.log('📊 Récupération des données des tables...\n');
  console.log('━'.repeat(60));

  const results = [];

  for (const table of tables) {
    const result = await fetchTableData(table);
    results.push(result);

    // Affichage du résultat
    if (result.status === '✅') {
      console.log(`${result.status} ${result.table.toUpperCase()}`);
      console.log(`   └─ ${result.count} enregistrement(s)\n`);
      
      // Affiche les métadonnées (non-sensitive) par défaut
      if (result.data.length > 0) {
        const verbose = process.env.VERBOSE_PREVIEW === 'true';
        if (verbose) {
          console.log(`   📋 Aperçu des données (VERBOSE MODE):`);
          // Sanitize common sensitive fields
          const sanitizedData = result.data.slice(0, 2).map((row) => {
            const sanitized = { ...row };
            if (sanitized.email) sanitized.email = '[REDACTED_EMAIL]';
            if (sanitized.name) sanitized.name = '[REDACTED_NAME]';
            if (sanitized.surname) sanitized.surname = '[REDACTED_SURNAME]';
            if (sanitized.id && typeof sanitized.id === 'string') sanitized.id = '[REDACTED_ID]';
            return sanitized;
          });
          console.log(JSON.stringify(sanitizedData, null, 2));
        } else {
          console.log(`   📋 Data preview: ${result.count} record(s) fetched`);
        }
        console.log('');
      }
    } else {
      console.log(`${result.status} ${result.table.toUpperCase()}`);
      console.log(`   └─ Erreur: ${result.error}\n`);
    }
  }

  console.log('━'.repeat(60));
  console.log('\n');

  // Résumé
  const successful = results.filter(r => r.status === '✅').length;
  const failed = results.filter(r => r.status === '❌').length;

  console.log('📈 RÉSUMÉ:');
  console.log(`   ✅ Tables réussies: ${successful}`);
  console.log(`   ❌ Tables échouées: ${failed}`);
  console.log(`   📊 Total enregistrements: ${results.reduce((sum, r) => sum + (r.count || 0), 0)}\n`);

  if (successful > 0) {
    console.log('✨ Connexion à la BDD Supabase: OK');
    console.log('🎉 Votre base de données est bien liée!\n');
  } else {
    console.log('⚠️  Aucune table accessible. Vérifiez votre configuration.\n');
  }
}

// Lancer le test
fetchAllTables()
  .then(() => {
    console.log('✅ Test terminé');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Erreur fatale:', err.message);
    process.exit(1);
  });
