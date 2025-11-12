-- ============================================================
-- CRIAR TABELA DE EVENTOS
-- ============================================================
-- Data: 12 de novembro de 2025
-- Descrição: Tabela para gerenciar eventos da igreja
-- ============================================================

-- PARTE 1: CRIAR TABELA DE EVENTOS
-- ============================================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location VARCHAR(255),
  event_type VARCHAR(50), -- Culto, Reunião, Especial, etc
  status VARCHAR(50) DEFAULT 'Planejado', -- Planejado, Realizado, Cancelado
  responsible_id UUID,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (responsible_id) REFERENCES members(id) ON DELETE SET NULL
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_responsible ON events(responsible_id);

-- PARTE 2: CRIAR TABELA DE PRESENÇA EM EVENTOS
-- ============================================================

CREATE TABLE IF NOT EXISTS event_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, member_id)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_attendance_event ON event_attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_member ON event_attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_attended ON event_attendance(attended);

-- PARTE 3: HABILITAR RLS NA TABELA EVENTS
-- ============================================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Allow public read on events" ON events;
DROP POLICY IF EXISTS "Allow insert on events" ON events;
DROP POLICY IF EXISTS "Allow update on events" ON events;
DROP POLICY IF EXISTS "Allow delete on events" ON events;

DROP POLICY IF EXISTS "Allow public read on event_attendance" ON event_attendance;
DROP POLICY IF EXISTS "Allow insert on event_attendance" ON event_attendance;
DROP POLICY IF EXISTS "Allow update on event_attendance" ON event_attendance;
DROP POLICY IF EXISTS "Allow delete on event_attendance" ON event_attendance;

-- Criar novas políticas para events
CREATE POLICY "Allow public read on events" ON events FOR SELECT USING (TRUE);
CREATE POLICY "Allow insert on events" ON events FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow update on events" ON events FOR UPDATE USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow delete on events" ON events FOR DELETE USING (TRUE);

-- Criar novas políticas para event_attendance
CREATE POLICY "Allow public read on event_attendance" ON event_attendance FOR SELECT USING (TRUE);
CREATE POLICY "Allow insert on event_attendance" ON event_attendance FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow update on event_attendance" ON event_attendance FOR UPDATE USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow delete on event_attendance" ON event_attendance FOR DELETE USING (TRUE);

-- PARTE 4: CONFIGURAR PERMISSÕES PARA EVENTOS (MÓDULO)
-- ============================================================

-- Primeiro, criar o módulo se não existir
INSERT INTO modules (name, description) 
VALUES ('Eventos', 'Gerenciar eventos da igreja')
ON CONFLICT DO NOTHING;

-- Conceder permissões ao perfil SUPER_ADMIN
INSERT INTO profile_module_permissions (profile_id, module_id, function_id)
SELECT 
  p.id,
  m.id,
  f.id
FROM profiles p, modules m, functions f
WHERE p.code = 'SUPER_ADMIN'
  AND m.name = 'Eventos'
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
  AND m.name = 'Eventos'
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
  AND m.name = 'Eventos'
  AND f.slug IN ('read', 'create')
ON CONFLICT DO NOTHING;

-- PARTE 5: VALIDAR CONFIGURAÇÃO
-- ============================================================

-- Verificar que as tabelas foram criadas
SELECT 'Tabela events criada' as status, count(*) as total_events FROM events;
SELECT 'Tabela event_attendance criada' as status, count(*) as total_attendance FROM event_attendance;

-- Verificar que o módulo Eventos existe
SELECT 'Módulo Eventos' as tipo, COUNT(*) as total FROM modules WHERE name = 'Eventos';

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================
-- Se não houver erros acima, o módulo de Eventos está pronto!
-- ============================================================
