"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { playRogerBeep, playAlertSound, speakAlert, unlockAudio } from '@/utils/sound';
import { showError } from '@/utils/toast';

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
  
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});

  const peerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<any>(null);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const handleIncomingStream = useCallback((presenceId: string, stream: MediaStream) => {
    console.log(`[Cruising] Stream audio ricevuto da: ${presenceId}`);
    setRemoteStreams(prev => ({ ...prev, [presenceId]: stream }));
  }, []);

  const leaveChannel = useCallback(async () => {
    console.log(`[Cruising] Chiusura canale: ${activeCarovanaId}`);
    
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

    const PeerClass = (window as any).Peer;
    if (!PeerClass) {
      console.error("[Cruising] Libreria PeerJS mancante");
      return;
    }

    try {
      // 1. Richiesta sicura del microfono
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });
      
      streamRef.current = stream;
      // Il microfono parte disabilitato (MUTO)
      stream.getAudioTracks().forEach(track => track.enabled = false);

      const sessionId = Math.random().toString(36).substring(2, 8);
      const peerId = `lwd-${carovanaId}-${username.replace(/\s+/g, '-')}-${sessionId}`;
      
      // 2. Connessione al server STUN/TURN
      const peer = new PeerClass(peerId, {
        host: '0.peerjs.com',
        port: 443,
        secure: true,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      peer.on('open', (myPeerId: string) => {
        console.log(`[Cruising] Connesso al server con ID: ${myPeerId}`);
        setIsActive(true);
        setActiveCarovanaId(carovanaId);
        setCurrentUsername(username);
        
        const channel = supabase.channel(`cruising-radio-${carovanaId}`, {
          config: { presence: { key: myPeerId } }
        });

        channel
          .on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            
            // Usiamo il setter funzionale per non perdere lo stato isSpeaking esistente
            setUnits(prevUnits => {
              const activeUnits: CruisingUnit[] = [];
              
              Object.keys(state).forEach((presenceId) => {
                if (presenceId !== myPeerId) {
                  const presenceInfo = state[presenceId][0] as any;
                  const existingUnit = prevUnits.find(u => u.id === presenceId);
                  
                  activeUnits.push({
                    id: presenceId,
                    username: presenceInfo.username,
                    avatarUrl: presenceInfo.avatarUrl,
                    role: presenceInfo.role,
                    carName: presenceInfo.carName,
                    isSpeaking: existingUnit ? existingUnit.isSpeaking : false
                  });

                  // Logica di Anti-Collisione
                  if (myPeerId > presenceId && peerRef.current) {
                    const existingConn = peerRef.current.connections[presenceId];
                    if (!existingConn || existingConn.length === 0) {
                      const call = peerRef.current.call(presenceId, streamRef.current!);
                      call.on('stream', (remoteStream: MediaStream) => {
                        handleIncomingStream(presenceId, remoteStream);
                      });
                    }
                  }
                }
              });
              return activeUnits;
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
        // Accetta la chiamata solo se appartiene alla stessa stanza
        if (call.peer.includes(carovanaId)) {
          call.answer(streamRef.current!);
          call.on('stream', (remoteStream: MediaStream) => {
            handleIncomingStream(call.peer, remoteStream);
          });
        }
      });

      peerRef.current = peer;

    } catch (err) {
      console.error('[Cruising] Errore avvio:', err);
      showError("Impossibile accedere al microfono. Controlla i permessi del tuo dispositivo.");
      leaveChannel();
    }
  }, [isActive, activeCarovanaId, leaveChannel, handleIncomingStream]);

  const toggleMic = useCallback((speaking: boolean) => {
    if (!streamRef.current) {
      console.warn("[Cruising] Impossibile attivare mic: flusso inesistente");
      return;
    }
    
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