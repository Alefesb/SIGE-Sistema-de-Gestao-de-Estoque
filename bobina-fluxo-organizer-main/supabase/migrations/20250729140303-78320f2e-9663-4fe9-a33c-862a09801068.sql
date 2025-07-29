-- Atualizar o usuário alefe.st.1198@gmail.com para admin aprovado
UPDATE public.profiles 
SET role = 'admin'::user_role, status = 'approved'::approval_status, updated_at = now()
WHERE email = 'alefe.st.1198@gmail.com';