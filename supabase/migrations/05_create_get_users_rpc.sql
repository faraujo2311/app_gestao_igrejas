-- Criar função RPC para buscar usuários com email (usar com Service Key)

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

-- Dar permissão de execução
GRANT EXECUTE ON FUNCTION public.get_users_with_profiles() TO anon, authenticated, service_role;

-- Testar
SELECT * FROM public.get_users_with_profiles();
