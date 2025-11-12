w-- ============ REABILITAR RLS COM POLÍTICAS CORRETAS ============
-- Isso resolve os erros de segurança do Supabase Linter

-- 1. PROFILES - Apenas leitura pública
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on profiles" ON profiles;
CREATE POLICY "Allow public read on profiles" ON profiles
  FOR SELECT USING (TRUE);

-- 2. MODULES - Apenas leitura pública
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on modules" ON modules;
CREATE POLICY "Allow public read on modules" ON modules
  FOR SELECT USING (TRUE);

-- 3. FUNCTIONS - Apenas leitura pública
ALTER TABLE functions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on functions" ON functions;
CREATE POLICY "Allow public read on functions" ON functions
  FOR SELECT USING (TRUE);

-- 4. MODULE_FUNCTIONS - Apenas leitura pública
ALTER TABLE module_functions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on module_functions" ON module_functions;
CREATE POLICY "Allow public read on module_functions" ON module_functions
  FOR SELECT USING (TRUE);

-- 5. PROFILE_MODULE_PERMISSIONS - Apenas leitura pública
ALTER TABLE profile_module_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on profile_module_permissions" ON profile_module_permissions;
CREATE POLICY "Allow public read on profile_module_permissions" ON profile_module_permissions
  FOR SELECT USING (TRUE);

-- 6. USER_PROFILES - Usuários podem ler suas próprias permissões, admin pode fazer tudo
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow users to read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow admin full access" ON user_profiles;

CREATE POLICY "Allow users to read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow admin full access" ON user_profiles
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Verificar RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'modules', 'functions', 'module_functions', 'profile_module_permissions', 'user_profiles')
ORDER BY tablename;
