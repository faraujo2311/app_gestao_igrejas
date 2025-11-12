-- Remover restrição RLS se existir
ALTER TABLE IF EXISTS user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS functions DISABLE ROW LEVEL SECURITY;

-- Recriação segura da tabela user_profiles
DROP TABLE IF EXISTS user_profiles CASCADE;

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_profile ON user_profiles(profile_id);

-- Adicionar política de segurança básica (sem restrições)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política que permite tudo (sem restrições)
CREATE POLICY "Allow all operations on user_profiles" ON user_profiles
  USING (TRUE)
  WITH CHECK (TRUE);

-- Mesmo para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on profiles" ON profiles
  USING (TRUE)
  WITH CHECK (TRUE);
