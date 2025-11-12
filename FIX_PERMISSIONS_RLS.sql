-- ============================================================
-- Corrigir RLS em profile_module_permissions
-- ============================================================

-- Reabilitar RLS com políticas corretas
ALTER TABLE profile_module_permissions ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Allow public read on profile_module_permissions" ON profile_module_permissions;
DROP POLICY IF EXISTS "Allow insert profile_module_permissions" ON profile_module_permissions;
DROP POLICY IF EXISTS "Allow update profile_module_permissions" ON profile_module_permissions;
DROP POLICY IF EXISTS "Allow delete profile_module_permissions" ON profile_module_permissions;

-- Criar novas políticas que permitem tudo (para admin)
CREATE POLICY "Allow public read on profile_module_permissions" ON profile_module_permissions
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow insert profile_module_permissions" ON profile_module_permissions
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow update profile_module_permissions" ON profile_module_permissions
  FOR UPDATE USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Allow delete profile_module_permissions" ON profile_module_permissions
  FOR DELETE USING (TRUE);

-- Verificar
SELECT * FROM pg_policies WHERE tablename = 'profile_module_permissions';
