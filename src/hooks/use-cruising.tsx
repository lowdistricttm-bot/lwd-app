"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { playRogerBeep, playAlertSound, speakAlert, getGlobalAudioContext } from '@/utils/sound';
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
  const isConnectingRef = useRef(false);
  const retryTimerRef = useRef<any>(null);
  const retryDelayRef = useRef(2000); // Parte da 2 secondi

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
    audio.play().catch(() => console.log("[Cruising] Audio in attesa di interazione"));
  }, []);

  const leaveChannel = useCallback(() => {
    console.log("[Cruising] Reset connessione...");
    isConnectingRef.current = false;
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    setStatus('idle');
    
    if (peerRef.current) {
      try {
        peerRef.current.disconnect();
        peerRef.current.destroy();
      } catch (e) {}
      peerRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    document.querySelectorAll('[id^="sink-"]').forEach(s => s.remove());
    
    setIsActive(false);
    setUnits([]);
    setActiveCarovanaId(null);
    setIsSpeaking(false);
  }, []);

  const joinChannel = useCallback(async (carovanaId: string, username: string, avatarUrl: string, role: string, carName?: string) => {
    if (isConnectingRef.current) return;
    isConnectingRef.current = true;

    const PeerClass = (window as any).Peer;
    if (!PeerClass) {
      setStatus('error');
      isConnectingRef.current = false;
      return;
    }

    setStatus('initializing');

    try {
      if (!streamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { echoCancellation: true, noiseSuppression: true } 
        });
        streamRef.current = stream;
        stream.getAudioTracks().forEach(track => track.enabled = false);
      }

      // ID corto e pulito per evitare problemi di parsing
      const myPeerId = `lwd${Math.random().toString(36).substring(2, 7)}`;
      
      // Configurazione MINIMALE: lasciamo che PeerJS usi i suoi server cloud ottimizzati
      const peer = new PeerClass(myPeerId, {
        debug: 2,
        config: {
          'iceServers': [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      setStatus('connecting-server');

      peer.on('open', (id: string) => {
        console.log("[Cruising] Connesso al server. ID:", id);
        retryDelayRef.current = 2000; // Reset delay al successo
        setIsActive(true);
        setStatus('connecting-units');
        setActiveCarovanaId(carovanaId);
        setCurrentUsername(username);
        
        const channel = supabase.channel(`cruising-${carovanaId}`, {
          config: { presence: { key: id } },
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

                if (id < presenceId) {
                  const call = peerRef.current.call(presenceId, streamRef.current!);
                  if (call) {
                    call.on('stream', (remoteStream: MediaStream) => playRemoteStream(presenceId, remoteStream));
                  }
                }
              }
            });
            setUnits(activeUnits);
            setStatus('ready');
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
              await channel.track({ username, avatarUrl, role, carName });
            }
          });
        
        channelRef.current = channel;
      });

      peer.on('disconnected', () => {
        console.warn("[Cruising] Disconnesso. Riconnessione...");
        peer.reconnect();
      });

      peer.on('call', (call: any) => {
        call.answer(streamRef.current!);
        call.on('stream', (remoteStream: MediaStream) => playRemoteStream(call.peer, remoteStream));
      });

      peer.on('error', (err: any) => {
        console.error('[Cruising] Errore:', err.type);
        
        if (['network', 'server-error', 'socket-closed', 'socket-error', 'lost-connection'].includes(err.type)) {
          leaveChannel();
          // Strategia di Backoff: raddoppia il tempo di attesa fino a 30 secondi
          const delay = retryDelayRef.current;
          retryDelayRef.current = Math.min(retryDelayRef.current * 2, 30000);
          
          console.log(`[Cruising] Riprovo tra ${delay/1000} secondi...`);
          retryTimerRef.current = setTimeout(() => {
            joinChannel(carovanaId, username, avatarUrl, role, carName);
          }, delay);
        }
      });

      peerRef.current = peer;
    } catch (err) {
      console.error('[Cruising] Errore fatale:', err);
      setStatus('error');
      isConnectingRef.current = false;
    }
  }, [playRemoteStream, leaveChannel]);

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
  if (context === undefined) {
    throw new Error('useCruising deve essere utilizzato all\'interno di un CruisingProvider');
  }
  return context;
};