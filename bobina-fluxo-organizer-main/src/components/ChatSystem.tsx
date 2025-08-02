import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Video, 
  Mic, 
  MicOff, 
  Users,
  Plus,
  Search,
  Settings,
  PhoneCall,
  VideoIcon,
  Volume2,
  VolumeX
} from 'lucide-react';
import ChatVideoCall from '@/components/ChatVideoCall';
import ChatVoiceCall from '@/components/ChatVoiceCall';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  room_id: string;
  created_at: string;
  message_type: 'text' | 'voice' | 'video' | 'file';
  file_url?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'private' | 'group';
  created_by: string;
  created_at: string;
}

interface ChatParticipant {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  status: 'online' | 'offline' | 'busy';
  avatar_url?: string;
}

const ChatSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchUsers, setSearchUsers] = useState('');
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [callTarget, setCallTarget] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchRooms();
      fetchAllProfiles();
      
      // Set up real-time subscriptions
      const messagesChannel = supabase
        .channel('chat-messages')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as Message;
            if (newMessage.room_id === activeRoom) {
              setMessages(prev => [...prev, newMessage]);
            }
          }
        })
        .subscribe();

      const roomsChannel = supabase
        .channel('chat-rooms')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_rooms' }, () => {
          fetchRooms();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(messagesChannel);
        supabase.removeChannel(roomsChannel);
      };
    }
  }, [user, activeRoom]);

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom);
      fetchParticipants(activeRoom);
    }
  }, [activeRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchRooms = async () => {
    try {
      const { data: participantRooms, error } = await supabase
        .from('chat_participants')
        .select(`
          room_id,
          chat_rooms (*)
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      const roomsData = participantRooms?.map(p => p.chat_rooms).filter(Boolean) || [];
      setRooms(roomsData as ChatRoom[]);
    } catch (error: any) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data as Message[] || []);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchParticipants = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_participants')
        .select('*')
        .eq('room_id', roomId);

      if (error) throw error;
      setParticipants(data || []);
    } catch (error: any) {
      console.error('Error fetching participants:', error);
    }
  };

  const fetchAllProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setProfiles(data as Profile[] || []);
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeRoom || !user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          content: newMessage,
          sender_id: user.id,
          room_id: activeRoom,
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar mensagem',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const createPrivateRoom = async (targetUserId: string) => {
    try {
      // Check if private room already exists
      const { data: existingParticipants } = await supabase
        .from('chat_participants')
        .select('room_id, chat_rooms!inner(*)')
        .eq('user_id', user?.id)
        .eq('chat_rooms.type', 'private');

      if (existingParticipants) {
        for (const participant of existingParticipants) {
          const { data: otherParticipants } = await supabase
            .from('chat_participants')
            .select('user_id')
            .eq('room_id', participant.room_id);

          if (otherParticipants?.some(p => p.user_id === targetUserId)) {
            setActiveRoom(participant.room_id);
            return;
          }
        }
      }

      // Create new private room
      const { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          name: 'Chat Privado',
          type: 'private',
          created_by: user?.id
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add participants
      const { error: participantError } = await supabase
        .from('chat_participants')
        .insert([
          { room_id: room.id, user_id: user?.id },
          { room_id: room.id, user_id: targetUserId }
        ]);

      if (participantError) throw participantError;

      setActiveRoom(room.id);
      await fetchRooms();

      toast({
        title: 'Chat privado criado',
        description: 'Você pode começar a conversar agora.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao criar chat',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const startVoiceCall = (targetUserId: string) => {
    setCallTarget(targetUserId);
    setIsVoiceCallActive(true);
  };

  const startVideoCall = (targetUserId: string) => {
    setCallTarget(targetUserId);
    setIsVideoCallActive(true);
  };

  const endCall = () => {
    setIsVoiceCallActive(false);
    setIsVideoCallActive(false);
    setCallTarget(null);
  };

  const getProfileByUserId = (userId: string) => {
    return profiles.find(p => p.user_id === userId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-online';
      case 'busy': return 'bg-busy';
      case 'offline': return 'bg-offline';
      default: return 'bg-offline';
    }
  };

  const filteredUsers = profiles.filter(profile => 
    profile.user_id !== user?.id &&
    (profile.full_name?.toLowerCase().includes(searchUsers.toLowerCase()) ||
     profile.username?.toLowerCase().includes(searchUsers.toLowerCase()))
  );

  const activeRoomData = rooms.find(r => r.id === activeRoom);
  const roomParticipants = participants.map(p => getProfileByUserId(p.user_id)).filter(Boolean);

  return (
    <div className="h-[calc(100vh-12rem)] max-h-[800px]">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
        {/* Sidebar - Users and Rooms */}
        <div className="md:col-span-1 space-y-4">
          {/* All Users */}
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Usuários
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchUsers}
                  onChange={(e) => setSearchUsers(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 p-4">
                  {filteredUsers.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => createPrivateRoom(profile.user_id)}
                    >
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {profile.full_name?.charAt(0) || profile.username?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(profile.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {profile.full_name || profile.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {profile.status === 'online' ? 'Online' : 
                           profile.status === 'busy' ? 'Ocupado' : 'Offline'}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            startVoiceCall(profile.user_id);
                          }}
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            startVideoCall(profile.user_id);
                          }}
                        >
                          <Video className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-3">
          {activeRoom ? (
            <Card className="h-full flex flex-col">
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5" />
                    <div>
                      <h3 className="font-semibold">{activeRoomData?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {roomParticipants.length} participante(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {roomParticipants.map((participant) => (
                      <div key={participant?.id} className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startVoiceCall(participant?.user_id || '')}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startVideoCall(participant?.user_id || '')}
                        >
                          <Video className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[400px] p-4">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const sender = getProfileByUserId(message.sender_id);
                      const isOwnMessage = message.sender_id === user?.id;

                      return (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={sender?.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {sender?.full_name?.charAt(0) || sender?.username?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                            <div className={`rounded-lg p-3 ${
                              isOwnMessage 
                                ? 'bg-primary text-primary-foreground ml-auto' 
                                : 'bg-muted'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Selecione um usuário</h3>
                <p className="text-muted-foreground">
                  Escolha um usuário da lista para iniciar uma conversa
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Voice Call Component */}
      {isVoiceCallActive && callTarget && (
        <ChatVoiceCall
          targetUserId={callTarget}
          onEndCall={endCall}
        />
      )}

      {/* Video Call Component */}
      {isVideoCallActive && callTarget && (
        <ChatVideoCall
          targetUserId={callTarget}
          onEndCall={endCall}
        />
      )}
    </div>
  );
};

export default ChatSystem;