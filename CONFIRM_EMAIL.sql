-- Confirmar email do usuario
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    confirmation_sent_at = NULL
WHERE email = 'faraujo@gmail.com';

-- Verificar
SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'faraujo@gmail.com';
