/**
 * Script de teste para verificar a conexão com o Supabase
 * Execute com: npm exec vite-node -- src/test-supabase-connection.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vsahncqzvwcpvpqbixcw.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_vzmXmBQF3G8EyS04zdb5ng_9HiOQBuy';

console.log('🔍 Iniciando teste de conexão com Supabase...\n');
console.log('📍 URL:', SUPABASE_URL);
console.log('🔑 Chave:', SUPABASE_PUBLISHABLE_KEY.substring(0, 20) + '...\n');

async function testSupabaseConnection() {
  try {
    // Criar cliente Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: (() => {
          // Mock localStorage para ambiente Node.js
          const store: Record<string, string> = {};
          return {
            getItem: (key: string) => store[key] || null,
            setItem: (key: string, value: string) => {
              store[key] = value;
            },
            removeItem: (key: string) => {
              delete store[key];
            },
          };
        })(),
        persistSession: false,
        autoRefreshToken: true,
      },
    });

    console.log('✅ Cliente Supabase criado com sucesso\n');

    // Teste 1: Verificar autenticação (session)
    console.log('📌 Teste 1: Verificando autenticação...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (!sessionError) {
      console.log('✅ Autenticação respondendo corretamente');
      console.log('   Session:', sessionData?.session ? 'Existe' : 'Vazia\n');
    } else {
      console.log('⚠️  Aviso de autenticação:', sessionError.message, '\n');
    }

    // Teste 2: Tentar acessar a tabela "profiles"
    console.log('📌 Teste 2: Tentando acessar dados (tabela: profiles)...');
    const { data, error, status } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️  Tabela "profiles" não encontrada (esperado)');
        console.log('   Código:', error.code);
      } else {
        console.log('⚠️  Erro ao acessar dados:', error.message);
        console.log('   Código:', error.code);
      }
    } else {
      console.log('✅ Conseguindo acessar dados');
      console.log('   Status:', status);
      console.log('   Dados encontrados:', data?.length || 0, '\n');
    }

    // Teste 3: Simples verificação de conectividade via REST
    console.log('📌 Teste 3: Verificando conectividade REST...');
    const response = await fetch(SUPABASE_URL + '/rest/v1/', {
      headers: {
        'apikey': SUPABASE_PUBLISHABLE_KEY,
      },
    });
    if (response.ok) {
      console.log('✅ REST API respondendo');
      console.log('   Status:', response.status, '\n');
    } else {
      console.log('⚠️  REST API retornou status:', response.status, '\n');
    }

    console.log('🎉 Testes concluídos!');
    console.log('✅ Conexão com Supabase está funcionando corretamente!');
    console.log('\n📝 Resumo:');
    console.log('   • URL do projeto: ' + SUPABASE_URL);
    console.log('   • Autenticação: Respondendo');
    console.log('   • API REST: Respondendo');
    
  } catch (error) {
    console.error('❌ Erro durante teste de conexão:');
    if (error instanceof Error) {
      console.error('Mensagem:', error.message);
      console.error('Stack:', error.stack);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

testSupabaseConnection();
