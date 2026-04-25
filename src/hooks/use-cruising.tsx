"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { playRogerBeep, playAlertSound, speakAlert, getGlobalAudioContext } from '@/utils/sound';

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

export type ConnectionStatus = 'idle' | 'initializing' | 'connecting-server' | 'connecting-units' | 'ready' | 'error';

interface CruisingContextType {
  isActive: boolean;
  isSpeaking: boolean;
  status: ConnectionStatus;
  units: CruisingUnit[];
  activeCarovanaId: string | null;
  lastAlert: RoadAlert | null;
  joinChannel: (carovanaId: string, username: string, avatarUrl: string, role: string, carName?: string) => Promise<void>;
  leaveChannel: () => void;
  toggleMic: (speaking: boolean) => void;
  sendAlert: (type: string, message: string) => void;
}

const CruisingContext = createContext<CruisingContextType | undefined>(undefined);

export const CruisingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [units, setUnits] = useState<CruisingUnit[]>([]);
  const [activeCarovanaId, setActiveCarovanaId] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [lastAlert, setLastAlert] = useState<RoadAlert | null>(null);

  const peerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<any>(null);
  const heartbeatRef = useRef<any>(null);

  const playRemoteStream = useCallback((presenceId: string, remoteStream: MediaStream) => {
    const sinkId = `sink-${presenceId}`;
    let audio = document.getElementById(sinkId) as HTMLAudioElement;
    
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = sinkId;
      audio.autoplay = true;
      // @ts-ignore
      audio.playsInline = true;
      // @ts-ignore
      audio.webkitPlaysInline = true;
      audio.style.display = 'none';
      document.body.appendChild(audio);
    }

    audio.srcObject = remoteStream;
    audio.play().catch(() => {
      window.addEventListener('touchstart', () => audio.play(), { once: true });
    });
  }, []);

  const leaveChannel = useCallback(() => {
    setStatus('idle');
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    if (peerRef.current) peerRef.current.destroy();
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    
    document.querySelectorAll('[id^="sink-"]').forEach(s => s.remove());
    
    setIsActive(false);
    setUnits([]);
    setActiveCarovanaId(null);
    setIsSpeaking(false);
  }, []);

  const joinChannel = useCallback(async (carovanaId: string, username: string, avatarUrl: string, role: string, carName?: string) => {
    const PeerClass = (window as any).Peer;
    if (!PeerClass) return;

    setStatus('initializing');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true
        } 
      });
      streamRef.current = stream;
      stream.getAudioTracks().forEach(track => track.enabled = false);

      // ID più corto per evitare problemi di buffer su reti mobili
      const myPeerId = `lwd-${carovanaId.substring(0,4)}-${Math.random().toString(36).substring(2, 6)}`;
      
      const peer = new PeerClass(myPeerId, {
        debug: 1,
        config: {
          'iceServers': [
            { 'urls': 'stun:stun.l.google.com:19302' },
            {
              urls: [
                'turn:lwdstrct.metered.live:443?transport=tcp', 
                'turn:lwdstrct.metered.live:80?transport=tcp',
                'turn:lwdstrct.metered.live:443?transport=udp'
              ],
              username: '5adb9880780dccfb855a62d9',
              credential: 'Ink+Z3uyHb+fOamN'
            }
          ],
          'iceCandidatePoolSize': 10,
          'iceTransportPolicy': 'all'
        }
      });

      setStatus('connecting-server');

      peer.on('open', (id: string) => {
        setIsActive(true);
        setStatus('connecting-units');
        setActiveCarovanaId(carovanaId);
        setCurrentUsername(username);
        
        const channel = supabase.channel(`cruising-${carovanaId}`, {
          config: { 
            presence: { key: id },
            broadcast: { ack: false }
          },
        });

        channel
          .on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            const activeUnits: CruisingUnit[] = [];
            
            Object.keys(state).forEach((presenceId) => {
              if (presenceId !== id) {
                const presenceInfo = state[presenceId][0] as any;
                activeUnits.push({
                  id: presenceId,
                  username: presenceInfo.username,
                  avatarUrl: presenceInfo.avatarUrl,
                  role: presenceInfo.role,
                  carName: presenceInfo.carName,
                  isSpeaking: false
                });

                // Logica di chiamata: chi ha l'ID "minore" chiama chi ha l'ID "maggiore"
                if (id < presenceId) {
                  const call = peerRef.current.call(presenceId, streamRef.current!);
                  if (call) {
                    call.on('stream', (remoteStream: MediaStream) => {
                      playRemoteStream(presenceId, remoteStream);
                    });
                  }
                }
              }
            });
            setUnits(activeUnits);
            if (status !== 'ready') setStatus('ready');
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
          .subscribe(async (subStatus) => {
            if (subStatus === 'SUBSCRIBED') {
              await channel.track({ username, avatarUrl, role, carName, joinedAt: new Date().toISOString() });
              
              // Heartbeat per mantenere attiva la connessione mobile
              if (heartbeatRef.current) clearInterval(heartbeatRef.current);
              heartbeatRef.current = setInterval(() => {
                channel.send({ type: 'broadcast', event: 'heartbeat', payload: { id } });
              }, 5000);
            }
          });
        
        channelRef.current = channel;
      });

      peer.on('call', (call: any) => {
        call.answer(streamRef.current!);
        call.on('stream', (remoteStream: MediaStream) => {
          playRemoteStream(call.peer, remoteStream);
        });
      });

      peer.on('error', (err: any) => {
        console.error('[Cruising] Peer Error:', err.type);
        setStatus('error');
        if (err.type === 'network' || err.type === 'server-error') {
          setTimeout(() => joinChannel(carovanaId, username, avatarUrl, role, carName), 3000);
        }
      });

      peerRef.current = peer;
    } catch (err) {
      console.error('[Cruising] Errore inizializzazione:', err);
      setStatus('error');
    }
  }, [playRemoteStream, status]);

  const toggleMic = useCallback((speaking: boolean) => {
    if (!streamRef.current || !channelRef.current) return;
    
    const context = getGlobalAudioContext();
    if (context?.state === 'suspended') context.resume();

    streamRef.current.getAudioTracks().forEach(track => track.enabled = speaking);
    setIsSpeaking(speaking);

    if (!speaking) playRogerBeep();

    channelRef.current.send({
      type: 'broadcast',
      event: 'speaking_state',
      payload: { username: currentUsername, isSpeaking: speaking }
    });
  }, [currentUsername]);

  const sendAlert = useCallback((type: string, message: string) => {
    if (!channelRef.current) return;
    playAlertSound();
    channelRef.current.send({
      type: 'broadcast',
      event: 'road_alert',
      payload: { type, message, sender: currentUsername }
    });
  }, [currentUsername]);

  return (
    <CruisingContext.Provider value={{ 
      isActive, isSpeaking, status, units, activeCarovanaId, lastAlert,
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