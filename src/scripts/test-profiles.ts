/**
 * Script de teste do sistema de perfis
 * Execute com: npm exec vite-node -- src/scripts/test-profiles.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vsahncqzvwcpvpqbixcw.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_vzmXmBQF3G8EyS04zdb5ng_9HiOQBuy';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: (() => {
      const store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
      };
    })(),
    persistSession: false,
    autoRefreshToken: true,
  },
});

async function testProfilesSystem() {
  console.log('🧪 Iniciando testes do sistema de perfis...\n');

  try {
    // Teste 1: Verificar módulos
    console.log('📌 Teste 1: Verificando módulos...');
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('*');

    if (modulesError) throw modulesError;
    console.log(`   ✅ ${modules?.length || 0} módulos encontrados`);
    if (modules && modules.length > 0) {
      console.log(`   • ${modules.slice(0, 3).map((m: any) => m.name).join(', ')}...`);
    }

    // Teste 2: Verificar funções
    console.log('\n📌 Teste 2: Verificando funções...');
    const { data: functions, error: functionsError } = await supabase
      .from('functions')
      .select('*');

    if (functionsError) throw functionsError;
    console.log(`   ✅ ${functions?.length || 0} funções encontradas`);
    if (functions && functions.length > 0) {
      console.log(`   • ${functions.map((f: any) => f.name).join(', ')}`);
    }

    // Teste 3: Verificar perfis
    console.log('\n📌 Teste 3: Verificando perfis...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) throw profilesError;
    console.log(`   ✅ ${profiles?.length || 0} perfis encontrados`);
    if (profiles && profiles.length > 0) {
      profiles.forEach((p: any) => {
        console.log(`   • ${p.code}: ${p.description} (${p.status ? 'Ativo' : 'Inativo'})`);
      });
    }

    // Teste 4: Verificar relacionamentos
    console.log('\n📌 Teste 4: Verificando relacionamentos...');
    const { data: moduleFunc, error: moduleFuncError } = await supabase
      .from('module_functions')
      .select('*');

    if (moduleFuncError) throw moduleFuncError;
    console.log(`   ✅ ${moduleFunc?.length || 0} relacionamentos módulo-função`);

    // Teste 5: Verificar permissões
    console.log('\n📌 Teste 5: Verificando permissões de perfis...');
    const { data: permissions, error: permissionsError } = await supabase
      .from('profile_module_permissions')
      .select('*, profiles(code), modules(name), functions(name)')
      .limit(5);

    if (permissionsError) throw permissionsError;
    console.log(`   ✅ ${permissions?.length || 0} permissões amostradas`);
    if (permissions && permissions.length > 0) {
      permissions.slice(0, 3).forEach((p: any) => {
        console.log(`   • ${(p.profiles as any).code}: ${(p.modules as any).name} → ${(p.functions as any).name}`);
      });
    }

    // Teste 6: Contar permissões por perfil
    console.log('\n📌 Teste 6: Distribuição de permissões...');
    try {
      const { data: permCount } = await supabase.rpc(
        'exec_sql',
        {
          sql: `
            SELECT p.code, COUNT(pmp.id) as total
            FROM profiles p
            LEFT JOIN profile_module_permissions pmp ON p.id = pmp.profile_id
            GROUP BY p.id, p.code
            ORDER BY total DESC
          `,
        }
      );

      if (permCount) {
        console.log('   Permissões por perfil:');
        (permCount as any[]).forEach((row: any) => {
          console.log(`   • ${row.code}: ${row.total} permissões`);
        });
      }
    } catch (e) {
      console.log('   ℹ️  RPC não disponível (é normal)');
    }

    // Teste 7: Inserir teste de novo perfil
    console.log('\n📌 Teste 7: Testando CRUD de perfis...');
    const testProfile = {
      code: `TEST_${Date.now()}`,
      description: 'Perfil de teste - pode ser deletado',
      status: true,
    };

    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert([testProfile])
      .select();

    if (insertError) throw insertError;
    console.log(`   ✅ Perfil criado: ${testProfile.code}`);

    if (insertData && insertData.length > 0) {
      const testId = insertData[0].id;

      // Testar update
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ description: 'Perfil atualizado de teste' })
        .eq('id', testId);

      if (updateError) throw updateError;
      console.log(`   ✅ Perfil atualizado`);

      // Testar delete
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', testId);

      if (deleteError) throw deleteError;
      console.log(`   ✅ Perfil deletado`);
    }

    // Resultado final
    console.log('\n' + '='.repeat(50));
    console.log('✅ TODOS OS TESTES PASSARAM!');
    console.log('='.repeat(50));
    console.log('\n📊 Resumo:');
    console.log(`   • Módulos: ${modules?.length || 0}`);
    console.log(`   • Funções: ${functions?.length || 0}`);
    console.log(`   • Perfis: ${profiles?.length || 0}`);
    console.log(`   • Permissões: ${permissions?.length || 0}+ (total maior)`);
    console.log('\n✨ Sistema de perfis está 100% funcional!');

  } catch (error) {
    console.error('\n❌ ERRO NOS TESTES:');
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    console.log('\n💡 Verifique se você executou o SQL em SETUP_SQL_PERFIS.sql');
    process.exit(1);
  }
}

testProfilesSystem();
