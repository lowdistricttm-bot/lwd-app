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
  const isConnectingRef = useRef(false);

  const playRemoteStream = useCallback((presenceId: string, remoteStream: MediaStream) => {
    const sinkId = `sink-${presenceId}`;
    let audio = document.getElementById(sinkId) as HTMLAudioElement;
    
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = sinkId;
      audio.autoplay = true;
      // @ts-ignore
      audio.playsInline = true;
      audio.style.display = 'none';
      document.body.appendChild(audio);
    }

    audio.srcObject = remoteStream;
    audio.play().catch(() => console.log("[Cruising] Audio in attesa di interazione"));
  }, []);

  const leaveChannel = useCallback(() => {
    isConnectingRef.current = false;
    setStatus('idle');
    
    if (peerRef.current) {
      try { peerRef.current.destroy(); } catch (e) {}
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
      // 1. Microfono
      if (!streamRef.current) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current.getAudioTracks().forEach(track => track.enabled = false);
      }

      // 2. PeerJS - Configurazione MINIMALE (quella che funzionava bene)
      // Usiamo il costruttore più semplice possibile per il cloud di PeerJS
      const peer = new PeerClass(undefined, {
        debug: 1,
        config: {
          'iceServers': [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      setStatus('connecting-server');

      peer.on('open', (id: string) => {
        console.log("[Cruising] Radio Online. ID:", id);
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

      peer.on('call', (call: any) => {
        call.answer(streamRef.current!);
        call.on('stream', (remoteStream: MediaStream) => playRemoteStream(call.peer, remoteStream));
      });

      peer.on('error', (err: any) => {
        console.error('[Cruising] PeerJS Error:', err.type);
        // Non mettiamo in errore per ogni minima cosa, solo se la rete cade davvero
        if (err.type === 'network' || err.type === 'server-error') {
          setStatus('error');
          isConnectingRef.current = false;
        }
      });

      peerRef.current = peer;
    } catch (err) {
      console.error('[Cruising] Init Error:', err);
      setStatus('error');
      isConnectingRef.current = false;
    }
  }, [playRemoteStream]);

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