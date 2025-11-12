-- Execute os dois SQLs abaixo no Supabase SQL Editor

-- ============ 1. CRIAR TABELA USER_DATA ============
CREATE TABLE IF NOT EXISTS public.user_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_email ON user_data(email);

ALTER TABLE user_data DISABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on user_data" ON user_data
  USING (TRUE)
  WITH CHECK (TRUE);

-- Inserir usuarios existentes
INSERT INTO public.user_data (user_id, email, full_name)
SELECT 
  id,
  email,
  (user_metadata->>'full_name')::text
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- ============ 2. CRIAR FUNÇÃO RPC ============
CREATE OR REPLACE FUNCTION public.get_users_with_profiles()
RETURNS TABLE (
  user_id UUID,
  email VARCHAR,
  full_name VARCHAR,
  profile_id UUID,
  profile_code VARCHAR,
  profile_description TEXT,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id as user_id,
    au.email,
    (au.user_metadata->>'full_name')::varchar as full_name,
    up.profile_id,
    p.code as profile_code,
    p.description as profile_description,
    up.created_at
  FROM auth.users au
  LEFT JOIN public.user_profiles up ON au.id = up.user_id
  LEFT JOIN public.profiles p ON up.profile_id = p.id
  ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_users_with_profiles() TO anon, authenticated, service_role;

-- Testar
SELECT * FROM public.get_users_with_profiles();
