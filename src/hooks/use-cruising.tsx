"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { playRogerBeep, playAlertSound, speakAlert, unlockAudio } from '@/utils/sound';

interface CruisingUnit {
  id: string;
  username: string;
  avatarUrl?: string;
  role?: string;
  isSpeaking: boolean;
  carName?: string;
}

export interface RoadAlert {
  type: string;
  message: string;
  sender: string;
}

interface CruisingContextType {
  isActive: boolean;
  isSpeaking: boolean;
  units: CruisingUnit[];
  activeCarovanaId: string | null;
  lastAlert: RoadAlert | null;
  remoteStreams: Record<string, MediaStream>;
  joinChannel: (carovanaId: string, username: string, avatarUrl: string, role: string, carName?: string) => Promise<void>;
  leaveChannel: () => void;
  toggleMic: (speaking: boolean) => void;
  sendAlert: (type: string, message: string) => void;
}

const CruisingContext = createContext<CruisingContextType | undefined>(undefined);

export const CruisingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [units, setUnits] = useState<CruisingUnit[]>([]);
  const [activeCarovanaId, setActiveCarovanaId] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [lastAlert, setLastAlert] = useState<RoadAlert | null>(null);
  
  // STATO FONDAMENTALE PER L'AUDIO MOBILE: Manteniamo gli stream nello stato React
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});

  const peerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<any>(null);

  const handleIncomingStream = useCallback((presenceId: string, stream: MediaStream) => {
    console.log(`[Cruising] Flusso audio stabile ricevuto da: ${presenceId}`);
    setRemoteStreams(prev => ({ ...prev, [presenceId]: stream }));
  }, []);

  const leaveChannel = useCallback(async () => {
    console.log(`[Cruising] Chiusura sicura canale: ${activeCarovanaId}`);
    
    if (peerRef.current) {
      peerRef.current.disconnect();
      peerRef.current.destroy();
      peerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    setIsActive(false);
    setUnits([]);
    setRemoteStreams({});
    setActiveCarovanaId(null);
    setIsSpeaking(false);
    setLastAlert(null);
  }, [activeCarovanaId]);

  const joinChannel = useCallback(async (carovanaId: string, username: string, avatarUrl: string, role: string, carName?: string) => {
    if (activeCarovanaId && activeCarovanaId !== carovanaId) {
      await leaveChannel();
    }

    if (isActive && activeCarovanaId === carovanaId) return;

    await unlockAudio();

    const PeerClass = (window as any).Peer;
    if (!PeerClass) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });
      streamRef.current = stream;
      stream.getAudioTracks().forEach(track => track.enabled = false);

      const sessionId = Math.random().toString(36).substring(2, 10);
      const peerId = `lwd-${carovanaId}-${username.replace(/\s+/g, '-')}-${sessionId}`;
      
      const peer = new PeerClass(peerId, {
        host: '0.peerjs.com',
        port: 443,
        secure: true,
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' } // Fallback ultra-stabile
          ]
        }
      });

      peer.on('open', (myPeerId: string) => {
        console.log(`[Cruising] Radio collegata: ${myPeerId}`);
        setIsActive(true);
        setActiveCarovanaId(carovanaId);
        setCurrentUsername(username);
        
        const channel = supabase.channel(`cruising-radio-${carovanaId}`, {
          config: { presence: { key: myPeerId } }
        });

        channel
          .on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            const activeUnits: CruisingUnit[] = [];
            
            Object.keys(state).forEach((presenceId) => {
              if (presenceId !== myPeerId) {
                const presenceInfo = state[presenceId][0] as any;
                activeUnits.push({
                  id: presenceId,
                  username: presenceInfo.username,
                  avatarUrl: presenceInfo.avatarUrl,
                  role: presenceInfo.role,
                  carName: presenceInfo.carName,
                  isSpeaking: false
                });

                // ANTI-COLLISIONE: Chiama solo se il tuo ID è "maggiore" dell'altro.
                // Evita che A e B si chiamino contemporaneamente incrociando i flussi.
                if (myPeerId > presenceId && peerRef.current && !peerRef.current.connections[presenceId]) {
                  console.log(`[Cruising] Avvio chiamata verso: ${presenceId}`);
                  const call = peerRef.current.call(presenceId, streamRef.current!);
                  call.on('stream', (remoteStream: MediaStream) => {
                    handleIncomingStream(presenceId, remoteStream);
                  });
                }
              }
            });
            setUnits(activeUnits);

            // Pulizia flussi "zombie"
            setRemoteStreams(prev => {
              const next = { ...prev };
              Object.keys(next).forEach(streamId => {
                if (!state[streamId] && streamId !== myPeerId) {
                  delete next[streamId];
                }
              });
              return next;
            });
          })
          .on('broadcast', { event: 'speaking_state' }, ({ payload }) => {
            setUnits(prev => prev.map(u => u.username === payload.username ? { ...u, isSpeaking: payload.isSpeaking } : u));
          })
          .on('broadcast', { event: 'road_alert' }, ({ payload }) => {
            if (payload.sender !== username) {
              playAlertSound();
              speakAlert(`${payload.message}. Segnalato da ${payload.sender}`);
              setLastAlert({ type: payload.type, message: payload.message, sender: payload.sender });
              setTimeout(() => setLastAlert(null), 8000);
            }
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await channel.track({
                username,
                avatarUrl,
                role,
                carName,
                joined_at: new Date().toISOString()
              });
            }
          });
        
        channelRef.current = channel;
      });

      peer.on('call', (call: any) => {
        console.log(`[Cruising] Rispondo alla chiamata di: ${call.peer}`);
        call.answer(streamRef.current!);
        call.on('stream', (remoteStream: MediaStream) => {
          handleIncomingStream(call.peer, remoteStream);
        });
      });

      peerRef.current = peer;
    } catch (err) {
      console.error('[Cruising] Errore critico Microfono:', err);
    }
  }, [isActive, activeCarovanaId, leaveChannel, handleIncomingStream]);

  const toggleMic = useCallback((speaking: boolean) => {
    if (!streamRef.current) return;
    
    if (speaking) unlockAudio();

    streamRef.current.getAudioTracks().forEach(track => track.enabled = speaking);
    setIsSpeaking(speaking);

    if (!speaking) playRogerBeep();

    channelRef.current?.send({
      type: 'broadcast',
      event: 'speaking_state',
      payload: { username: currentUsername, isSpeaking: speaking }
    });
  }, [currentUsername]);

  const sendAlert = useCallback((type: string, message: string) => {
    playAlertSound();
    channelRef.current?.send({
      type: 'broadcast',
      event: 'road_alert',
      payload: { type, message, sender: currentUsername }
    });
  }, [currentUsername]);

  useEffect(() => {
    return () => {
      leaveChannel();
    };
  }, [leaveChannel]);

  return (
    <CruisingContext.Provider value={{ 
      isActive, isSpeaking, units, activeCarovanaId, lastAlert, remoteStreams,
      joinChannel, leaveChannel, toggleMic, sendAlert 
    }}>
      {children}
    </CruisingContext.Provider>
  );
};

export const useCruising = () => {
  const context = useContext(CruisingContext);
  if (!context) throw new Error('useCruising must be used within CruisingProvider');
  return context;
};