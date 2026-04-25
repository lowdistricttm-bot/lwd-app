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

  const peerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<any>(null);
  const audioContainerRef = useRef<HTMLDivElement | null>(null);

  const playRemoteStream = useCallback((presenceId: string, remoteStream: MediaStream) => {
    console.log(`[Cruising] Tentativo riproduzione stream da: ${presenceId}`);
    
    if (!audioContainerRef.current) {
      const container = document.createElement('div');
      container.id = 'lwd-audio-container';
      container.style.display = 'none';
      document.body.appendChild(container);
      audioContainerRef.current = container;
    }

    const oldAudio = document.getElementById(`audio-${presenceId}`);
    if (oldAudio) oldAudio.remove();

    const audio = document.createElement('audio');
    audio.id = `audio-${presenceId}`;
    audio.srcObject = remoteStream;
    audio.autoplay = true;
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    
    audioContainerRef.current.appendChild(audio);
    
    audio.play().catch(err => {
      console.warn(`[Cruising] Autoplay fallito per ${presenceId}.`, err);
    });
  }, []);

  const leaveChannel = useCallback(() => {
    console.log("[Cruising] Chiusura sessione...");
    if (peerRef.current) peerRef.current.destroy();
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    
    if (audioContainerRef.current) {
      audioContainerRef.current.innerHTML = '';
    }
    
    setIsActive(false);
    setUnits([]);
    setActiveCarovanaId(null);
    setIsSpeaking(false);
  }, []);

  const joinChannel = useCallback(async (carovanaId: string, username: string, avatarUrl: string, role: string, carName?: string) => {
    if (isActive) leaveChannel();

    const PeerClass = (window as any).Peer;
    if (!PeerClass) return;

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

      const myPeerId = `lwd-${carovanaId}-${username.replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;
      
      // Configurazione ICE Servers ottimizzata per reti mobili (4G/5G)
      // Aggiunti server STUN multipli e configurazione TURN più robusta
      const peer = new PeerClass(myPeerId, {
        debug: 1,
        config: {
          'iceServers': [
            { 'urls': 'stun:stun.l.google.com:19302' },
            { 'urls': 'stun:stun1.l.google.com:19302' },
            { 'urls': 'stun:stun2.l.google.com:19302' },
            { 'urls': 'stun:global.stun.twilio.com:3478' },
            {
              // Server TURN di backup (Metered) - Configurazione UDP e TCP (fondamentale per mobile)
              urls: [
                'turn:open.metered.ca:3478?transport=udp',
                'turn:open.metered.ca:3478?transport=tcp',
                'turn:open.metered.ca:443?transport=tcp' // Porta 443 spesso bypassa i firewall mobili
              ],
              username: '5adb9880780dccfb855a62d9',
              credential: 'Ink+Z3uyHb+fOamN'
            }
          ],
          'iceCandidatePoolSize': 10,
          'sdpSemantics': 'unified-plan'
        }
      });

      peer.on('open', (id: string) => {
        console.log(`[Cruising] Connesso con ID: ${id}`);
        setIsActive(true);
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

                // Logica di connessione: chi ha l'ID alfabeticamente minore avvia la chiamata
                if (id < presenceId && !peerRef.current.connections[presenceId]) {
                  console.log(`[Cruising] Avvio chiamata verso: ${presenceId}`);
                  const call = peerRef.current.call(presenceId, streamRef.current!, {
                    metadata: { username }
                  });
                  
                  if (call) {
                    call.on('stream', (remoteStream: MediaStream) => {
                      playRemoteStream(presenceId, remoteStream);
                    });
                    
                    call.on('error', (err: any) => {
                      console.error(`[Cruising] Errore chiamata verso ${presenceId}:`, err);
                    });
                  }
                }
              }
            });
            setUnits(activeUnits);
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
              await channel.track({ username, avatarUrl, role, carName });
            }
          });
        
        channelRef.current = channel;
      });

      peer.on('call', (call: any) => {
        console.log(`[Cruising] Ricevuta chiamata da: ${call.peer}`);
        call.answer(streamRef.current!);
        call.on('stream', (remoteStream: MediaStream) => {
          playRemoteStream(call.peer, remoteStream);
        });
      });

      peer.on('error', (err: any) => {
        console.error(`[Cruising] PeerJS Error:`, err);
        // Gestione riconnessione automatica per instabilità rete mobile
        if (err.type === 'network' || err.type === 'disconnected' || err.type === 'peer-unavailable') {
          console.log("[Cruising] Tentativo di riconnessione...");
          setTimeout(() => {
            if (isActive && peer && !peer.destroyed) peer.reconnect();
          }, 3000);
        }
      });

      peerRef.current = peer;
    } catch (err) {
      console.error('[Cruising] Errore inizializzazione:', err);
    }
  }, [isActive, leaveChannel, playRemoteStream]);

  const toggleMic = useCallback((speaking: boolean) => {
    if (!streamRef.current) return;
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
      isActive, isSpeaking, units, activeCarovanaId, lastAlert,
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