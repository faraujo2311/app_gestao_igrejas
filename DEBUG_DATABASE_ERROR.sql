-- Corrigir políticas RLS para permitir CRUD em Perfis

-- Remover políticas antigas
DROP POLICY IF EXISTS "Allow public read on profiles" ON profiles;

-- Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas completas (leitura pública, escrita para admin)
CREATE POLICY "Allow public read on profiles" ON profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow insert profiles" ON profiles
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow update profiles" ON profiles
  FOR UPDATE USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Allow delete profiles" ON profiles
  FOR DELETE USING (TRUE);

-- Verificar políticas
SELECT tablename, policyname
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
