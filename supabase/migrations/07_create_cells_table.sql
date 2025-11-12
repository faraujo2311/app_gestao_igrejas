-- ============================================================
-- CRIAR TABELA DE CÉLULAS (PEQUENOS GRUPOS)
-- ============================================================
-- Data: 12 de novembro de 2025
-- Descrição: Tabela para gerenciar células (pequenos grupos de estudo)
-- ============================================================

-- PARTE 1: CRIAR TABELA DE CÉLULAS
-- ============================================================

CREATE TABLE IF NOT EXISTS cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  host VARCHAR(255),
  leader_id UUID,
  vice_leader_id UUID,
  day_of_week VARCHAR(20),
  time TIME,
  address TEXT,
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (leader_id) REFERENCES members(id) ON DELETE SET NULL,
  FOREIGN KEY (vice_leader_id) REFERENCES members(id) ON DELETE SET NULL
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_cells_leader ON cells(leader_id);
CREATE INDEX IF NOT EXISTS idx_cells_vice_leader ON cells(vice_leader_id);
CREATE INDEX IF NOT EXISTS idx_cells_status ON cells(status);
CREATE INDEX IF NOT EXISTS idx_cells_name ON cells(name);

-- PARTE 2: CRIAR TABELA DE RELACIONAMENTO (MUITOS PARA MUITOS)
-- ============================================================

-- Tabela para relacionar membros com células
CREATE TABLE IF NOT EXISTS cell_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cell_id UUID NOT NULL REFERENCES cells(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(cell_id, member_id)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_cell_members_cell ON cell_members(cell_id);
CREATE INDEX IF NOT EXISTS idx_cell_members_member ON cell_members(member_id);

-- PARTE 3: HABILITAR RLS NA TABELA CELLS
-- ============================================================

ALTER TABLE cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE cell_members ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Allow public read on cells" ON cells;
DROP POLICY IF EXISTS "Allow insert on cells" ON cells;
DROP POLICY IF EXISTS "Allow update on cells" ON cells;
DROP POLICY IF EXISTS "Allow delete on cells" ON cells;

DROP POLICY IF EXISTS "Allow public read on cell_members" ON cell_members;
DROP POLICY IF EXISTS "Allow insert on cell_members" ON cell_members;
DROP POLICY IF EXISTS "Allow update on cell_members" ON cell_members;
DROP POLICY IF EXISTS "Allow delete on cell_members" ON cell_members;

-- Criar novas políticas para cells
CREATE POLICY "Allow public read on cells" ON cells FOR SELECT USING (TRUE);
CREATE POLICY "Allow insert on cells" ON cells FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow update on cells" ON cells FOR UPDATE USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow delete on cells" ON cells FOR DELETE USING (TRUE);

-- Criar novas políticas para cell_members
CREATE POLICY "Allow public read on cell_members" ON cell_members FOR SELECT USING (TRUE);
CREATE POLICY "Allow insert on cell_members" ON cell_members FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow update on cell_members" ON cell_members FOR UPDATE USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow delete on cell_members" ON cell_members FOR DELETE USING (TRUE);

-- PARTE 4: CONFIGURAR PERMISSÕES PARA CÉLULAS (MÓDULO)
-- ============================================================

-- Conceder permissões ao perfil SUPER_ADMIN
INSERT INTO profile_module_permissions (profile_id, module_id, function_id)
SELECT 
  p.id,
  m.id,
  f.id
FROM profiles p, modules m, functions f
WHERE p.code = 'SUPER_ADMIN'
  AND m.name = 'Células'
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
  AND m.name = 'Células'
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
  AND m.name = 'Células'
  AND f.slug IN ('read', 'create')
ON CONFLICT DO NOTHING;

-- PARTE 5: VALIDAR CONFIGURAÇÃO
-- ============================================================

-- Verificar que as tabelas foram criadas
SELECT 'Tabela cells criada' as status, count(*) as total_cells FROM cells;
SELECT 'Tabela cell_members criada' as status, count(*) as total_members FROM cell_members;

-- Verificar que o módulo Células existe
SELECT 'Módulo Células' as tipo, COUNT(*) as total FROM modules WHERE name = 'Células';

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
WHERE m.name = 'Células'
GROUP BY p.code, m.name, f.slug
ORDER BY p.code, f.slug;

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================
-- Se não houver erros acima, o módulo de Células está pronto!
-- Acesse: http://localhost:8082/admin/celulas
-- ============================================================
