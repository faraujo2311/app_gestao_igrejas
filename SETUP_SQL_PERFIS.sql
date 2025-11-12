/**
 * INSTRUÇÕES PARA EXECUTAR AS MIGRAÇÕES DO SISTEMA DE PERFIS
 * 
 * 1. Abra o Supabase Dashboard: https://supabase.com
 * 2. Acesse seu projeto: app_gestao_igrejas
 * 3. Vá para a seção "SQL Editor"
 * 4. Crie uma nova query
 * 5. Copie e Cole TODO o SQL abaixo
 * 6. Clique em "Run"
 * 
 * O SQL irá criar todas as tabelas, índices e dados iniciais necessários
 */

-- ============ CRIAR TABELAS ============

CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS module_functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  function_id UUID NOT NULL REFERENCES functions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(module_id, function_id)
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profile_module_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  function_id UUID NOT NULL REFERENCES functions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(profile_id, module_id, function_id)
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ CRIAR ÍNDICES ============

CREATE INDEX IF NOT EXISTS idx_module_functions_module ON module_functions(module_id);
CREATE INDEX IF NOT EXISTS idx_module_functions_function ON module_functions(function_id);
CREATE INDEX IF NOT EXISTS idx_profile_permissions_profile ON profile_module_permissions(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_permissions_module ON profile_module_permissions(module_id);
CREATE INDEX IF NOT EXISTS idx_profile_permissions_function ON profile_module_permissions(function_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_profile ON user_profiles(profile_id);

-- ============ INSERIR MÓDULOS ============

INSERT INTO modules (name, description, order_index) VALUES
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
ON CONFLICT (name) DO NOTHING;

-- ============ INSERIR FUNÇÕES ============

INSERT INTO functions (name, slug, description) VALUES
  ('Consultar', 'read', 'Permissão para visualizar dados'),
  ('Criar', 'create', 'Permissão para criar novos registros'),
  ('Editar', 'update', 'Permissão para editar registros existentes'),
  ('Excluir', 'delete', 'Permissão para deletar registros'),
  ('Relatar', 'report', 'Permissão para gerar relatórios')
ON CONFLICT (slug) DO NOTHING;

-- ============ RELACIONAR FUNÇÕES COM MÓDULOS ============

INSERT INTO module_functions (module_id, function_id)
SELECT m.id, f.id FROM modules m, functions f
WHERE (m.name IN ('Ministérios', 'Membros', 'Células', 'Eventos', 'Voluntários', 'Financeiro', 'Avisos', 'Perfis', 'Usuários')
  AND f.slug IN ('read', 'create', 'update', 'delete'))
  OR (m.name = 'Configurações' AND f.slug IN ('read', 'update'))
  OR (m.name = 'Relatórios' AND f.slug IN ('read', 'report'))
ON CONFLICT DO NOTHING;

-- ============ CRIAR PERFIS PADRÃO ============

INSERT INTO profiles (code, description, status) VALUES
  ('SUPER_ADMIN', 'Super Administrador - Acesso total a todos os módulos', TRUE),
  ('ADMIN', 'Administrador - Acesso a maioria dos módulos', TRUE),
  ('MODERADOR', 'Moderador - Acesso limitado', TRUE),
  ('USUARIO', 'Usuário - Acesso básico', TRUE)
ON CONFLICT (code) DO NOTHING;

-- ============ ATRIBUIR PERMISSÕES AO SUPER_ADMIN ============

INSERT INTO profile_module_permissions (profile_id, module_id, function_id)
SELECT p.id, m.id, f.id FROM profiles p, modules m, functions f
WHERE p.code = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;

-- ============ ATRIBUIR PERMISSÕES AO ADMIN (Tudo exceto Perfis e Usuários) ============

INSERT INTO profile_module_permissions (profile_id, module_id, function_id)
SELECT p.id, m.id, f.id FROM profiles p, modules m, functions f
WHERE p.code = 'ADMIN'
  AND m.name NOT IN ('Perfis', 'Usuários', 'Configurações')
  AND f.slug IN ('read', 'create', 'update', 'delete')
ON CONFLICT DO NOTHING;

-- ============ ATRIBUIR PERMISSÕES AO MODERADOR (Leitura e algumas edições) ============

INSERT INTO profile_module_permissions (profile_id, module_id, function_id)
SELECT p.id, m.id, f.id FROM profiles p, modules m, functions f
WHERE p.code = 'MODERADOR'
  AND m.name NOT IN ('Perfis', 'Usuários', 'Configurações', 'Financeiro')
  AND f.slug IN ('read', 'update')
ON CONFLICT DO NOTHING;

-- ============ ATRIBUIR PERMISSÕES AO USUARIO (Apenas leitura) ============

INSERT INTO profile_module_permissions (profile_id, module_id, function_id)
SELECT p.id, m.id, f.id FROM profiles p, modules m, functions f
WHERE p.code = 'USUARIO'
  AND m.name NOT IN ('Perfis', 'Usuários', 'Configurações', 'Financeiro', 'Relatórios')
  AND f.slug = 'read'
ON CONFLICT DO NOTHING;

-- ============ VERIFICAÇÃO ============

-- Verificar tabelas criadas
SELECT 'Módulos' as entity, COUNT(*) as total FROM modules
UNION ALL
SELECT 'Funções', COUNT(*) FROM functions
UNION ALL
SELECT 'Perfis', COUNT(*) FROM profiles
UNION ALL
SELECT 'Permissões', COUNT(*) FROM profile_module_permissions;
