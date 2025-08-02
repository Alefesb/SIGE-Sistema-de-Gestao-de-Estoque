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
  Video, 
  VideoOff,
  Monitor,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface ChatVideoCallProps {
  targetUserId: string;
  onEndCall: () => void;
}

const ChatVideoCall: React.FC<ChatVideoCallProps> = ({ targetUserId, onEndCall }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [targetProfile, setTargetProfile] = useState<any>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      // Get user media (video and audio)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }, 
        audio: true 
      });
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

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
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle connection state
      peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === 'connected') {
          setIsConnected(true);
          toast({
            title: 'Chamada de vídeo conectada',
            description: 'A chamada de vídeo foi estabelecida.',
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
        title: 'Iniciando videochamada',
        description: `Chamando ${targetProfile?.full_name || 'usuário'}...`,
      });

    } catch (error: any) {
      toast({
        title: 'Erro na videochamada',
        description: 'Não foi possível acessar a câmera ou microfone.',
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
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const handleEndCall = () => {
    cleanup();
    onEndCall();
    
    toast({
      title: 'Videochamada encerrada',
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

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    }
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement && containerRef.current) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 bg-black z-50 flex flex-col ${isFullscreen ? '' : 'p-4'}`}
    >
      {/* Video Container */}
      <div className="flex-1 relative">
        {/* Remote Video (Main) */}
        <div className="w-full h-full relative">
          {isConnected ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <div className="text-center text-white">
                <Avatar className="mx-auto h-24 w-24 mb-4">
                  <AvatarImage src={targetProfile?.avatar_url} />
                  <AvatarFallback className="text-2xl bg-gradient-primary text-primary-foreground">
                    {targetProfile?.full_name?.charAt(0) || targetProfile?.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold mb-2">
                  {targetProfile?.full_name || targetProfile?.username || 'Usuário'}
                </h3>
                <p className="text-muted-foreground">Conectando...</p>
              </div>
            </div>
          )}

          {/* Local Video (Picture in Picture) */}
          <div className="absolute top-4 right-4 w-32 h-24 md:w-48 md:h-36 bg-black rounded-lg overflow-hidden border-2 border-white">
            {isVideoOn ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <VideoOff className="h-6 w-6 text-white" />
              </div>
            )}
          </div>

          {/* Call Info */}
          <div className="absolute top-4 left-4 text-white">
            <div className="bg-black/50 rounded-lg p-2">
              <p className="text-sm font-medium">
                {targetProfile?.full_name || targetProfile?.username || 'Usuário'}
              </p>
              {isConnected && (
                <p className="text-xs opacity-75">{formatDuration(callDuration)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-black/80">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="icon"
            onClick={toggleMute}
            className="h-12 w-12 rounded-full"
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          <Button
            variant={!isVideoOn ? "destructive" : "secondary"}
            size="icon"
            onClick={toggleVideo}
            className="h-12 w-12 rounded-full"
          >
            {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
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
            variant="secondary"
            size="icon"
            onClick={toggleFullscreen}
            className="h-12 w-12 rounded-full"
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatVideoCall;