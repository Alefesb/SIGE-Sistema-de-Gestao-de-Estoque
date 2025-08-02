import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Phone 
} from 'lucide-react';

interface ChatVoiceCallProps {
  targetUserId: string;
  onEndCall: () => void;
}

const ChatVoiceCall: React.FC<ChatVoiceCallProps> = ({ targetUserId, onEndCall }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [targetProfile, setTargetProfile] = useState<any>(null);
  
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchTargetProfile();
    initializeCall();

    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (isConnected) {
      intervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isConnected]);

  const fetchTargetProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error) throw error;
      setTargetProfile(data);
    } catch (error: any) {
      console.error('Error fetching target profile:', error);
    }
  };

  const initializeCall = async () => {
    try {
      // Get user media (audio only)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      });

      peerConnectionRef.current = peerConnection;

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };

      // Handle connection state
      peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === 'connected') {
          setIsConnected(true);
          toast({
            title: 'Chamada conectada',
            description: 'A chamada de voz foi estabelecida.',
          });
        } else if (peerConnection.connectionState === 'disconnected') {
          handleEndCall();
        }
      };

      // Simulate connection for demo purposes
      setTimeout(() => {
        setIsConnected(true);
      }, 2000);

      toast({
        title: 'Iniciando chamada',
        description: `Chamando ${targetProfile?.full_name || 'usuário'}...`,
      });

    } catch (error: any) {
      toast({
        title: 'Erro na chamada',
        description: 'Não foi possível acessar o microfone.',
        variant: 'destructive',
      });
      onEndCall();
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleEndCall = () => {
    cleanup();
    onEndCall();
    
    toast({
      title: 'Chamada encerrada',
      description: `Duração: ${formatDuration(callDuration)}`,
    });
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  const toggleSpeaker = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = isSpeakerOn;
      setIsSpeakerOn(!isSpeakerOn);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-elegant">
        <CardContent className="p-6 text-center">
          <div className="space-y-6">
            {/* Target User Avatar and Info */}
            <div className="space-y-3">
              <Avatar className="mx-auto h-24 w-24">
                <AvatarImage src={targetProfile?.avatar_url} />
                <AvatarFallback className="text-2xl bg-gradient-primary text-primary-foreground">
                  {targetProfile?.full_name?.charAt(0) || targetProfile?.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="text-xl font-semibold">
                  {targetProfile?.full_name || targetProfile?.username || 'Usuário'}
                </h3>
                <p className="text-muted-foreground">
                  {isConnected ? `Chamada ativa - ${formatDuration(callDuration)}` : 'Chamando...'}
                </p>
              </div>
            </div>

            {/* Call Status */}
            <div className="flex items-center justify-center">
              {isConnected ? (
                <div className="flex items-center gap-2 text-success">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="text-sm">Conectado</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-warning">
                  <Phone className="w-4 h-4 animate-pulse" />
                  <span className="text-sm">Conectando...</span>
                </div>
              )}
            </div>

            {/* Call Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={isMuted ? "destructive" : "outline"}
                size="icon"
                onClick={toggleMute}
                className="h-12 w-12 rounded-full"
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>

              <Button
                variant="destructive"
                size="icon"
                onClick={handleEndCall}
                className="h-14 w-14 rounded-full"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>

              <Button
                variant={!isSpeakerOn ? "destructive" : "outline"}
                size="icon"
                onClick={toggleSpeaker}
                className="h-12 w-12 rounded-full"
              >
                {isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
            </div>

            {/* Audio Elements */}
            <audio ref={localAudioRef} muted />
            <audio ref={remoteAudioRef} autoPlay />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatVoiceCall;