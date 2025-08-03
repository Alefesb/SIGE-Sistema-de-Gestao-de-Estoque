-- Primeiro, vamos atualizar a tabela profiles para incluir nome de usuário
ALTER TABLE public.profiles 
ADD COLUMN username TEXT UNIQUE,
ADD COLUMN avatar_url TEXT,
ADD COLUMN status TEXT DEFAULT 'online';

-- Criar tabela para prioridades
CREATE TYPE prioridade_type AS ENUM ('alta', 'media', 'baixa');

-- Adicionar campos de prioridade e rastreamento de máquina à tabela bobinas
ALTER TABLE public.bobinas 
ADD COLUMN prioridade prioridade_type DEFAULT 'media',
ADD COLUMN usuario_adicionou UUID REFERENCES public.profiles(user_id),
ADD COLUMN em_maquina BOOLEAN DEFAULT FALSE,
ADD COLUMN data_para_maquina TIMESTAMP WITH TIME ZONE,
ADD COLUMN quantidade_usada INTEGER DEFAULT 0;

-- Criar tabela para controle de máquinas
CREATE TABLE public.maquinas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    bobina_atual UUID REFERENCES public.bobinas(id),
    operador UUID REFERENCES public.profiles(user_id),
    ativa BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.maquinas ENABLE ROW LEVEL SECURITY;

-- Create policies for maquinas
CREATE POLICY "Authenticated users can view all machines" 
ON public.maquinas 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create machines" 
ON public.maquinas 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update machines" 
ON public.maquinas 
FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete machines" 
ON public.maquinas 
FOR DELETE 
USING (true);

-- Criar tabela para histórico de uso de bobinas
CREATE TABLE public.historico_bobinas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    bobina_id UUID REFERENCES public.bobinas(id) ON DELETE CASCADE,
    maquina_id UUID REFERENCES public.maquinas(id),
    quantidade_usada INTEGER NOT NULL,
    data_uso TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    operador UUID REFERENCES public.profiles(user_id),
    observacoes TEXT
);

-- Enable RLS
ALTER TABLE public.historico_bobinas ENABLE ROW LEVEL SECURITY;

-- Create policies for historico_bobinas
CREATE POLICY "Authenticated users can view all history" 
ON public.historico_bobinas 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create history" 
ON public.historico_bobinas 
FOR INSERT 
WITH CHECK (true);

-- Criar tabelas para o sistema de chat
CREATE TABLE public.chat_rooms (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,
    type TEXT CHECK (type IN ('private', 'group')) DEFAULT 'private',
    created_by UUID REFERENCES public.profiles(user_id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_rooms
CREATE POLICY "Users can view their rooms" 
ON public.chat_rooms 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create rooms" 
ON public.chat_rooms 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Tabela para participantes dos chats
CREATE TABLE public.chat_participants (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(user_id),
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(room_id, user_id)
);

-- Enable RLS
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_participants
CREATE POLICY "Users can view their participations" 
ON public.chat_participants 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create participations" 
ON public.chat_participants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Tabela para mensagens
CREATE TABLE public.chat_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(user_id),
    content TEXT,
    message_type TEXT CHECK (message_type IN ('text', 'voice', 'image', 'sticker')) DEFAULT 'text',
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_messages
CREATE POLICY "Users can view messages from their rooms" 
ON public.chat_messages 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.chat_participants 
        WHERE room_id = chat_messages.room_id 
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can create messages in their rooms" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.chat_participants 
        WHERE room_id = chat_messages.room_id 
        AND user_id = auth.uid()
    )
);

-- Tabela para figurinhas
CREATE TABLE public.stickers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stickers ENABLE ROW LEVEL SECURITY;

-- Create policies for stickers
CREATE POLICY "Everyone can view stickers" 
ON public.stickers 
FOR SELECT 
USING (true);

-- Criar storage buckets para chat
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('chat-images', 'chat-images', true),
  ('chat-voices', 'chat-voices', true),
  ('stickers', 'stickers', true);

-- Create policies for chat storage
CREATE POLICY "Users can upload chat images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'chat-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Everyone can view chat images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'chat-images');

CREATE POLICY "Users can upload voice messages" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'chat-voices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view voice messages" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'chat-voices');

-- Create triggers for updated_at
CREATE TRIGGER update_maquinas_updated_at
BEFORE UPDATE ON public.maquinas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_rooms_updated_at
BEFORE UPDATE ON public.chat_rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir usuários específicos (isso será feito via aplicação)
-- Vamos criar uma função para inicializar usuários padrão
CREATE OR REPLACE FUNCTION public.create_default_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualizar o profile do usuário alefe.st.1198@gmail.com se existir
  UPDATE public.profiles 
  SET username = 'Alefe', full_name = 'Alefe' 
  WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email = 'alefe.st.1198@gmail.com'
  );

  -- Criar algumas figurinhas padrão
  INSERT INTO public.stickers (name, category, url) VALUES
  ('thumbs_up', 'reactions', 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f44d.png'),
  ('heart', 'reactions', 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2764.png'),
  ('laugh', 'reactions', 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f602.png'),
  ('fire', 'reactions', 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f525.png');
  
  -- Criar algumas máquinas exemplo
  INSERT INTO public.maquinas (nome) VALUES
  ('Máquina 01'),
  ('Máquina 02'),
  ('Máquina 03');
END;
$$;