-- Corrigir RLS na tabela profile_module_permissions para permitir INSERT

ALTER TABLE profile_module_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on profile_module_permissions" ON profile_module_permissions;
DROP POLICY IF EXISTS "Allow insert on profile_module_permissions" ON profile_module_permissions;
DROP POLICY IF EXISTS "Allow update on profile_module_permissions" ON profile_module_permissions;
DROP POLICY IF EXISTS "Allow delete on profile_module_permissions" ON profile_module_permissions;

-- Políticas para CRUD completo
CREATE POLICY "Allow public read on profile_module_permissions" ON profile_module_permissions
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow insert on profile_module_permissions" ON profile_module_permissions
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow update on profile_module_permissions" ON profile_module_permissions
  FOR UPDATE USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Allow delete on profile_module_permissions" ON profile_module_permissions
  FOR DELETE USING (TRUE);

-- Verificar
SELECT tablename, policyname
FROM pg_policies
WHERE tablename = 'profile_module_permissions'
ORDER BY policyname;
