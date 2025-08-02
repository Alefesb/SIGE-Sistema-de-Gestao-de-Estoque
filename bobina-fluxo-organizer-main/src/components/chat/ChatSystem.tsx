import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Send, 
  Mic, 
  Image as ImageIcon, 
  Smile, 
  Users,
  Phone,
  Video,
  Plus,
  MoreVertical
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ChatRoom {
  id: string;
  name?: string;
  type: 'private' | 'group';
  created_at: string;
  participants: {
    username: string;
    avatar_url?: string;
    status: string;
  }[];
}

interface ChatMessage {
  id: string;
  content?: string;
  message_type: 'text' | 'voice' | 'image' | 'sticker';
  file_url?: string;
  created_at: string;
  sender: {
    username: string;
    avatar_url?: string;
  };
}

interface User {
  user_id: string;
  username: string;
  avatar_url?: string;
  status: string;
}

const ChatSystem = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isUsersSheetOpen, setIsUsersSheetOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRooms();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom);
      subscribeToMessages(activeRoom);
    }
  }, [activeRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchRooms = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('chat_participants')
      .select(`
        room_id,
        chat_rooms (
          id,
          name,
          type,
          created_at
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching rooms:', error);
      return;
    }

    // Buscar participantes para cada sala
    const roomsWithParticipants = await Promise.all(
      data?.map(async (item) => {
        const room = item.chat_rooms;
        const { data: participants } = await supabase
          .from('chat_participants')
          .select(`
            profiles (
              username,
              avatar_url,
              status
            )
          `)
          .eq('room_id', room.id);

        return {
          ...room,
          type: room.type as 'private' | 'group',
          participants: participants?.map(p => p.profiles).filter(Boolean) || []
        };
      }) || []
    );

    setRooms(roomsWithParticipants);
  };

  const fetchUsers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url, status')
      .neq('user_id', user.id);

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    setUsers(data || []);
  };

  const fetchMessages = async (roomId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        id,
        content,
        message_type,
        file_url,
        created_at,
        profiles!chat_messages_sender_id_fkey (
          username,
          avatar_url
        )
      `)
      .eq('room_id', roomId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    const formattedMessages = data?.map(msg => ({
      ...msg,
      message_type: msg.message_type as 'text' | 'voice' | 'image' | 'sticker',
      sender: msg.profiles
    })) || [];

    setMessages(formattedMessages);
  };

  const subscribeToMessages = (roomId: string) => {
    const channel = supabase
      .channel(`messages-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          // Refetch messages when new message arrives
          fetchMessages(roomId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const createPrivateRoom = async (userId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Verificar se já existe uma sala privada entre os dois usuários
    const { data: existingRoom } = await supabase
      .from('chat_participants')
      .select(`
        room_id,
        chat_rooms!inner (
          id,
          type
        )
      `)
      .eq('user_id', user.id)
      .in('room_id', 
        await supabase
          .from('chat_participants')
          .select('room_id')
          .eq('user_id', userId)
          .then(res => res.data?.map(r => r.room_id) || [])
      );

    const privateRoom = existingRoom?.find(r => r.chat_rooms.type === 'private');
    
    if (privateRoom) {
      setActiveRoom(privateRoom.room_id);
      setIsUsersSheetOpen(false);
      return;
    }

    // Criar nova sala
    const { data: newRoom, error: roomError } = await supabase
      .from('chat_rooms')
      .insert([{
        type: 'private',
        created_by: user.id
      }])
      .select()
      .single();

    if (roomError) {
      toast({
        title: "Erro",
        description: "Erro ao criar sala de chat",
        variant: "destructive",
      });
      return;
    }

    // Adicionar participantes
    const { error: participantsError } = await supabase
      .from('chat_participants')
      .insert([
        { room_id: newRoom.id, user_id: user.id },
        { room_id: newRoom.id, user_id: userId }
      ]);

    if (participantsError) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar participantes",
        variant: "destructive",
      });
      return;
    }

    setActiveRoom(newRoom.id);
    fetchRooms();
    setIsUsersSheetOpen(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeRoom) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert([{
        room_id: activeRoom,
        sender_id: user.id,
        content: newMessage,
        message_type: 'text'
      }]);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem",
        variant: "destructive",
      });
      return;
    }

    setNewMessage("");
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const activeRoomData = rooms.find(r => r.id === activeRoom);
  const otherParticipants = activeRoomData?.participants?.filter(p => 
    p.username !== users.find(u => u.user_id === activeRoom)?.username
  ) || [];

  return (
    <div className="h-full flex">
      {/* Sidebar com salas */}
      <div className="w-80 border-r bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Conversas</h2>
            <Sheet open={isUsersSheetOpen} onOpenChange={setIsUsersSheetOpen}>
              <SheetTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Usuários</h3>
                  <div className="space-y-2">
                    {users.map((user) => (
                      <div
                        key={user.user_id}
                        className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent"
                        onClick={() => createPrivateRoom(user.user_id)}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback>
                              {user.username?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <Badge variant={user.status === 'online' ? 'default' : 'secondary'} className="text-xs">
                              {user.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="p-2 space-y-2">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  activeRoom === room.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent'
                }`}
                onClick={() => setActiveRoom(room.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    {room.participants.slice(0, 2).map((participant, index) => (
                      <Avatar key={index} className="w-8 h-8 border-2 border-background">
                        <AvatarImage src={participant.avatar_url} />
                        <AvatarFallback>
                          {participant.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {room.name || room.participants.map(p => p.username).join(', ')}
                    </p>
                    <p className="text-sm opacity-75">
                      {room.type === 'private' ? 'Conversa privada' : 'Grupo'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Área principal do chat */}
      <div className="flex-1 flex flex-col">
        {activeRoom ? (
          <>
            {/* Header do chat */}
            <div className="p-4 border-b bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    {otherParticipants.slice(0, 2).map((participant, index) => (
                      <Avatar key={index} className="w-10 h-10 border-2 border-background">
                        <AvatarImage src={participant.avatar_url} />
                        <AvatarFallback>
                          {participant.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {activeRoomData?.name || otherParticipants.map(p => p.username).join(', ')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {otherParticipants.length} participante(s)
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="flex items-start space-x-3"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={message.sender?.avatar_url} />
                      <AvatarFallback>
                        {message.sender?.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">
                          {message.sender?.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                      <div className="bg-muted rounded-lg p-3 max-w-md">
                        {message.message_type === 'text' && (
                          <p className="text-sm">{message.content}</p>
                        )}
                        {message.message_type === 'image' && (
                          <img 
                            src={message.file_url} 
                            alt="Imagem compartilhada" 
                            className="rounded max-w-full h-auto"
                          />
                        )}
                        {message.message_type === 'voice' && (
                          <audio controls className="w-full">
                            <source src={message.file_url} type="audio/webm" />
                          </audio>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input de mensagem */}
            <div className="p-4 border-t bg-card">
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="ghost">
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className={isRecording ? "text-destructive" : ""}
                >
                  <Mic className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Smile className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                </div>
                <Button 
                  size="sm" 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Selecione uma conversa</h3>
              <p className="text-muted-foreground">
                Escolha uma conversa existente ou inicie uma nova
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSystem;