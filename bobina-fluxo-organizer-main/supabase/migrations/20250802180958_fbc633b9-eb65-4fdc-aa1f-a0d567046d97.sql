-- Corrigir função com search_path
CREATE OR REPLACE FUNCTION public.create_default_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Atualizar o profile do usuário alefe.st.1198@gmail.com se existir
  UPDATE public.profiles 
  SET username = 'Alefe', full_name = 'Alefe' 
  WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email = 'alefe.st.1198@gmail.com'
  );

  -- Criar algumas figurinhas padrão se não existirem
  INSERT INTO public.stickers (name, category, url) 
  SELECT 'thumbs_up', 'reactions', 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f44d.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.stickers WHERE name = 'thumbs_up');
  
  INSERT INTO public.stickers (name, category, url) 
  SELECT 'heart', 'reactions', 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2764.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.stickers WHERE name = 'heart');
  
  INSERT INTO public.stickers (name, category, url) 
  SELECT 'laugh', 'reactions', 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f602.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.stickers WHERE name = 'laugh');
  
  INSERT INTO public.stickers (name, category, url) 
  SELECT 'fire', 'reactions', 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f525.png'
  WHERE NOT EXISTS (SELECT 1 FROM public.stickers WHERE name = 'fire');
  
  -- Criar algumas máquinas exemplo se não existirem
  INSERT INTO public.maquinas (nome) 
  SELECT 'Máquina 01'
  WHERE NOT EXISTS (SELECT 1 FROM public.maquinas WHERE nome = 'Máquina 01');
  
  INSERT INTO public.maquinas (nome) 
  SELECT 'Máquina 02'
  WHERE NOT EXISTS (SELECT 1 FROM public.maquinas WHERE nome = 'Máquina 02');
  
  INSERT INTO public.maquinas (nome) 
  SELECT 'Máquina 03'
  WHERE NOT EXISTS (SELECT 1 FROM public.maquinas WHERE nome = 'Máquina 03');
END;
$$;