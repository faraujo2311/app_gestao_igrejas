-- ============================================================
-- CORREÇÃO COMPLETA - RLS EM TODAS TABELAS
-- ============================================================

-- PARTE 1: user_profiles (atribuir perfil a usuário)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow insert on user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow update on user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow delete on user_profiles" ON user_profiles;

CREATE POLICY "Allow public read on user_profiles" ON user_profiles FOR SELECT USING (TRUE);
CREATE POLICY "Allow insert on user_profiles" ON user_profiles FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow update on user_profiles" ON user_profiles FOR UPDATE USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow delete on user_profiles" ON user_profiles FOR DELETE USING (TRUE);

-- PARTE 2: profiles (criar perfis)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on profiles" ON profiles;
DROP POLICY IF EXISTS "Allow insert profiles" ON profiles;
DROP POLICY IF EXISTS "Allow update profiles" ON profiles;
DROP POLICY IF EXISTS "Allow delete profiles" ON profiles;

CREATE POLICY "Allow public read on profiles" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "Allow insert profiles" ON profiles FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow update profiles" ON profiles FOR UPDATE USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow delete profiles" ON profiles FOR DELETE USING (TRUE);

-- PARTE 3: profile_module_permissions (atribuir permissões)
ALTER TABLE profile_module_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on profile_module_permissions" ON profile_module_permissions;
DROP POLICY IF EXISTS "Allow insert on profile_module_permissions" ON profile_module_permissions;
DROP POLICY IF EXISTS "Allow update on profile_module_permissions" ON profile_module_permissions;
DROP POLICY IF EXISTS "Allow delete on profile_module_permissions" ON profile_module_permissions;

CREATE POLICY "Allow public read on profile_module_permissions" ON profile_module_permissions FOR SELECT USING (TRUE);
CREATE POLICY "Allow insert on profile_module_permissions" ON profile_module_permissions FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow update on profile_module_permissions" ON profile_module_permissions FOR UPDATE USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow delete on profile_module_permissions" ON profile_module_permissions FOR DELETE USING (TRUE);

-- PARTE 4: modules (tabela de referência)
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on modules" ON modules;

CREATE POLICY "Allow public read on modules" ON modules FOR SELECT USING (TRUE);

-- PARTE 5: functions (tabela de referência)
ALTER TABLE functions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on functions" ON functions;

CREATE POLICY "Allow public read on functions" ON functions FOR SELECT USING (TRUE);

-- PARTE 6: module_functions (tabela de referência)
ALTER TABLE module_functions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on module_functions" ON module_functions;

CREATE POLICY "Allow public read on module_functions" ON module_functions FOR SELECT USING (TRUE);
