/**
 * Script para criar tabelas do sistema de perfis no Supabase
 * Execute com: npm exec vite-node -- src/scripts/setup-profiles.ts
 */

const SUPABASE_URL = 'https://vsahncqzvwcpvpqbixcw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzYWhuY3F6dndjcHZwcWJpeGN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTA4ODA0MSwiZXhwIjoxODg4ODU2MDQxfQ.AEe8vc3nzSrCTsNHUEZHkW4sCTsH_KbWX4B6LRjqGCE';

// Arrays com as queries SQL
const queries = [
  // Criar tabela de módulos
  `CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Criar tabela de funções
  `CREATE TABLE IF NOT EXISTS functions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Criar tabela de relacionamento
  `CREATE TABLE IF NOT EXISTS module_functions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    function_id UUID NOT NULL REFERENCES functions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(module_id, function_id)
  )`,

  // Criar tabela de perfis
  `CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Criar tabela de permissões
  `CREATE TABLE IF NOT EXISTS profile_module_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    function_id UUID NOT NULL REFERENCES functions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(profile_id, module_id, function_id)
  )`,

  // Criar índices
  `CREATE INDEX IF NOT EXISTS idx_module_functions_module ON module_functions(module_id)`,
  `CREATE INDEX IF NOT EXISTS idx_module_functions_function ON module_functions(function_id)`,
  `CREATE INDEX IF NOT EXISTS idx_profile_permissions_profile ON profile_module_permissions(profile_id)`,
  `CREATE INDEX IF NOT EXISTS idx_profile_permissions_module ON profile_module_permissions(module_id)`,
  `CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status)`,

  // Criar tabela user_profiles
  `CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_user_profiles_profile ON user_profiles(profile_id)`,
];

// Queries de seed data
const seedQueries = [
  // Inserir módulos
  `INSERT INTO modules (name, description, order_index) VALUES
    ('Ministérios', 'Gerenciamento de ministérios da igreja', 1),
    ('Membros', 'Gerenciamento de membros da congregação', 2),
    ('Células', 'Gerenciamento de grupos de células', 3),
    ('Eventos', 'Gerenciamento de eventos da igreja', 4),
    ('Voluntários', 'Gerenciamento de voluntários', 5),
    ('Financeiro', 'Gestão financeira da igreja', 6),
    ('Avisos', 'Gerenciamento de avisos e comunicados', 7),
    ('Perfis', 'Gerenciamento de perfis de usuário', 8),
    ('Usuários', 'Gerenciamento de usuários do sistema', 9),
    ('Configurações', 'Configurações gerais do sistema', 10),
    ('Relatórios', 'Relatórios e análises', 11)
  ON CONFLICT (name) DO NOTHING`,

  // Inserir funções
  `INSERT INTO functions (name, slug, description) VALUES
    ('Consultar', 'read', 'Permissão para visualizar dados'),
    ('Criar', 'create', 'Permissão para criar novos registros'),
    ('Editar', 'update', 'Permissão para editar registros existentes'),
    ('Excluir', 'delete', 'Permissão para deletar registros'),
    ('Relatar', 'report', 'Permissão para gerar relatórios')
  ON CONFLICT (slug) DO NOTHING`,

  // Inserir perfis
  `INSERT INTO profiles (code, description, status) VALUES
    ('SUPER_ADMIN', 'Super Administrador - Acesso total a todos os módulos', TRUE),
    ('ADMIN', 'Administrador - Acesso a maioria dos módulos', TRUE),
    ('MODERADOR', 'Moderador - Acesso limitado', TRUE),
    ('USUARIO', 'Usuário - Acesso básico', TRUE)
  ON CONFLICT (code) DO NOTHING`,

  // Relacionar funções com módulos
  `INSERT INTO module_functions (module_id, function_id)
  SELECT m.id, f.id FROM modules m, functions f
  WHERE (m.name IN ('Ministérios', 'Membros', 'Células', 'Eventos', 'Voluntários', 'Financeiro', 'Avisos', 'Perfis', 'Usuários')
    AND f.slug IN ('read', 'create', 'update', 'delete'))
    OR (m.name = 'Configurações' AND f.slug IN ('read', 'update'))
    OR (m.name = 'Relatórios' AND f.slug IN ('read', 'report'))
  ON CONFLICT DO NOTHING`,

  // Dar todas as permissões ao SUPER_ADMIN
  `INSERT INTO profile_module_permissions (profile_id, module_id, function_id)
  SELECT p.id, m.id, f.id FROM profiles p, modules m, functions f
  WHERE p.code = 'SUPER_ADMIN'
  ON CONFLICT DO NOTHING`,

  // Dar permissões básicas ao USUARIO
  `INSERT INTO profile_module_permissions (profile_id, module_id, function_id)
  SELECT p.id, m.id, f.id FROM profiles p, modules m, functions f
  WHERE p.code = 'USUARIO'
    AND f.slug = 'read'
    AND m.name NOT IN ('Perfis', 'Usuários', 'Configurações')
  ON CONFLICT DO NOTHING`,
];

async function executeMigration() {
  try {
    console.log('🔍 Conectando ao Supabase...\n');

    // Executar queries diretamente via fetch
    const allQueries = [...queries, ...seedQueries];
    
    for (let i = 0; i < allQueries.length; i++) {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
          },
          body: JSON.stringify({ sql: allQueries[i] }),
        });

        if (response.ok) {
          console.log(`[${i + 1}/${allQueries.length}] ✅`);
        } else if (response.status === 404) {
          console.log('⚠️  RPC exec_sql não encontrada. Você precisará executar manualmente.');
          break;
        }
      } catch (e) {
        console.log(`[${i + 1}/${allQueries.length}] ⏭️ Erro, continuando...`);
      }
    }

    console.log('\n✅ Processo concluído!');
    console.log('\n⚠️  IMPORTANTE: Se houver erros acima, execute o seguinte SQL manualmente no Supabase SQL Editor:\n');
    
  } catch (err) {
    console.error('❌ Erro:', err);
    process.exit(1);
  }
}

executeMigration();
