-- ============================================================
-- ATIVAR MÓDULO DE MEMBROS - EXECUTE ESTE SCRIPT COMPLETO
-- ============================================================
-- Data: 12 de novembro de 2025
-- Versão: 1.0.3 (CORRIGIDO - Renomeia is_deacon para is_tithe_payer)
-- ============================================================

-- PARTE 1: RECRIAR TABELA DE MEMBROS COM COLUNA CORRIGIDA
-- ============================================================

-- Remover políticas RLS antes de dropar
DROP POLICY IF EXISTS "Allow public read on members" ON members;
DROP POLICY IF EXISTS "Allow insert on members" ON members;
DROP POLICY IF EXISTS "Allow update on members" ON members;
DROP POLICY IF EXISTS "Allow delete on members" ON members;

-- Dropar tabela antiga e recriar
DROP TABLE IF EXISTS members CASCADE;

-- Criar tabela completa
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  birth_date DATE,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  marital_status VARCHAR(50),
  baptism_date DATE,
  ministry_id UUID NOT NULL,
  is_tithe_payer BOOLEAN DEFAULT FALSE,
  has_children BOOLEAN DEFAULT FALSE,
  mother_name VARCHAR(255),
  observations TEXT,
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (ministry_id) REFERENCES ministries(id) ON DELETE RESTRICT
);

-- Criar índices para performance
CREATE INDEX idx_members_ministry ON members(ministry_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_full_name ON members(full_name);

-- PARTE 2: HABILITAR RLS NA TABELA MEMBERS
-- ============================================================

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Allow public read on members" ON members;
DROP POLICY IF EXISTS "Allow insert on members" ON members;
DROP POLICY IF EXISTS "Allow update on members" ON members;
DROP POLICY IF EXISTS "Allow delete on members" ON members;

-- Criar novas políticas
CREATE POLICY "Allow public read on members" ON members FOR SELECT USING (TRUE);
CREATE POLICY "Allow insert on members" ON members FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow update on members" ON members FOR UPDATE USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow delete on members" ON members FOR DELETE USING (TRUE);

-- PARTE 3: CONFIGURAR PERMISSÕES PARA MEMBROS
-- ============================================================

-- Conceder permissões ao perfil SUPER_ADMIN
INSERT INTO profile_module_permissions (profile_id, module_id, function_id)
SELECT 
  p.id,
  m.id,
  f.id
FROM profiles p, modules m, functions f
WHERE p.code = 'SUPER_ADMIN'
  AND m.name = 'Membros'
  AND f.slug IN ('read', 'create', 'update', 'delete')
ON CONFLICT DO NOTHING;

-- Conceder permissões ao perfil ADMIN
INSERT INTO profile_module_permissions (profile_id, module_id, function_id)
SELECT 
  p.id,
  m.id,
  f.id
FROM profiles p, modules m, functions f
WHERE p.code = 'ADMIN'
  AND m.name = 'Membros'
  AND f.slug IN ('read', 'create', 'update', 'delete')
ON CONFLICT DO NOTHING;

-- Conceder permissões ao perfil REDACAO (apenas leitura e criação)
INSERT INTO profile_module_permissions (profile_id, module_id, function_id)
SELECT 
  p.id,
  m.id,
  f.id
FROM profiles p, modules m, functions f
WHERE p.code = 'REDACAO'
  AND m.name = 'Membros'
  AND f.slug IN ('read', 'create')
ON CONFLICT DO NOTHING;

-- PARTE 4: VALIDAR CONFIGURAÇÃO
-- ============================================================

-- Verificar que a tabela foi criada
SELECT 'Tabela members criada' as status, count(*) as total_members FROM members;

-- Verificar que o módulo Membros existe
SELECT 'Módulo Membros' as tipo, COUNT(*) as total FROM modules WHERE name = 'Membros';

-- Verificar permissões configuradas
SELECT 
  p.code as perfil,
  m.name as modulo,
  f.slug as funcao,
  COUNT(*) as total
FROM profile_module_permissions pmp
JOIN profiles p ON pmp.profile_id = p.id
JOIN modules m ON pmp.module_id = m.id
JOIN functions f ON pmp.function_id = f.id
WHERE m.name = 'Membros'
GROUP BY p.code, m.name, f.slug
ORDER BY p.code, f.slug;

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================
-- Se não houver erros acima, o módulo de Membros está ativo!
-- Acesse: http://localhost:8082/admin/membros
-- ============================================================
