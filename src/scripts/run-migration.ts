/**
 * Script para executar migração SQL no Supabase
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = 'https://vsahncqzvwcpvpqbixcw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada!');
  console.log('Você precisa adicionar a chave de serviço nas variáveis de ambiente.');
  process.exit(1);
}

async function runMigration() {
  try {
    console.log('🔍 Conectando ao Supabase...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Ler arquivo SQL
    const sqlPath = join(process.cwd(), 'supabase', 'migrations', '01_create_profiles_system.sql');
    const sql = readFileSync(sqlPath, 'utf-8');

    console.log('✅ Conectado ao Supabase');
    console.log('📝 Executando SQL...\n');

    // Executar SQL
    const { error } = await supabase.rpc('exec', { sql });

    if (error) {
      console.error('❌ Erro ao executar migração:', error);
      process.exit(1);
    }

    console.log('✅ Migração executada com sucesso!');

  } catch (err) {
    console.error('❌ Erro:', err);
    process.exit(1);
  }
}

runMigration();
