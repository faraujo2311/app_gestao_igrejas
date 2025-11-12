-- Criar tabela para armazenar dados do usuario (nome, email, etc)
-- Isso é necessário porque auth.users não é acessível via REST API com anon key

CREATE TABLE IF NOT EXISTS public.user_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_email ON user_data(email);

-- Desabilitar RLS para que a aplicação possa ler
ALTER TABLE user_data DISABLE ROW LEVEL SECURITY;

-- Adicionar política aberta
CREATE POLICY "Allow all operations on user_data" ON user_data
  USING (TRUE)
  WITH CHECK (TRUE);

-- Inserir o usuário criado
INSERT INTO public.user_data (user_id, email, full_name)
SELECT 
  id,
  email,
  (user_metadata->>'full_name')::text
FROM auth.users
WHERE email = 'faraujo@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- Verificar
SELECT * FROM public.user_data;
