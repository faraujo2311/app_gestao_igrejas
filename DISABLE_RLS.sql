-- ============ DESABILITAR RLS (Row Level Security) ============
-- Isso permite que a aplicação insira dados sem restrições

ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE functions DISABLE ROW LEVEL SECURITY;
ALTER TABLE module_functions DISABLE ROW LEVEL SECURITY;
ALTER TABLE profile_module_permissions DISABLE ROW LEVEL SECURITY;

-- Verificar se funcionou
SELECT * FROM user_profiles LIMIT 1;
