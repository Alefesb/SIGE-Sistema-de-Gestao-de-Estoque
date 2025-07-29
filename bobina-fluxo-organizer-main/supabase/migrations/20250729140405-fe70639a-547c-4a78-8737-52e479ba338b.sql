-- Verificar se a tabela sige precisa de políticas RLS ou pode ser removida/configurada
-- Como aparenta ser uma tabela de teste, vamos adicionar uma política básica para administradores

-- Criar política básica para a tabela sige (apenas administradores aprovados podem acessar)
CREATE POLICY "Admins can manage sige table" 
ON public.sige 
FOR ALL 
TO authenticated
USING ((get_user_role(auth.uid()) = 'admin'::user_role) AND (get_user_status(auth.uid()) = 'approved'::approval_status))
WITH CHECK ((get_user_role(auth.uid()) = 'admin'::user_role) AND (get_user_status(auth.uid()) = 'approved'::approval_status));