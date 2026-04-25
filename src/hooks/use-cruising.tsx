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
  const wakeLockRef = useRef<any>(null);

  /**
   * Riproduzione Audio Diretta: Utilizza elementi <audio> HTML5 iniettati nel DOM.
   * Questo metodo è il più affidabile su iOS/Android per flussi voce WebRTC.
   */
  const playRemoteStream = useCallback((presenceId: string, remoteStream: MediaStream) => {
    console.log(`[Cruising] Attivazione sink audio per: ${presenceId}`);
    
    // 1. Rimuovi eventuale sink precedente per questo peer
    const existing = document.getElementById(`sink-${presenceId}`);
    if (existing) existing.remove();

    // 2. Crea un elemento audio reale
    const audio = document.createElement('audio');
    audio.id = `sink-${presenceId}`;
    audio.srcObject = remoteStream;
    audio.autoplay = true;
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    
    // IMPORTANTE: L'audio deve essere NON muto e aggiunto al DOM per essere udibile su mobile
    audio.muted = false; 
    audio.volume = 1.0;
    
    // Nascondi l'elemento ma lascialo nel DOM
    audio.style.display = 'none';
    document.body.appendChild(audio);

    // 3. Assicurati che l'AudioContext globale sia attivo (sincronizzazione permessi)
    const context = getGlobalAudioContext();
    if (context?.state === 'suspended') context.resume();
    
    // 4. Tenta il play immediato
    audio.play().catch(err => {
      console.warn(`[Cruising] Playback auto-bloccato per ${presenceId}. L'utente deve interagire.`, err);
    });
  }, []);

  /**
   * Gestione WakeLock: Impedisce al dispositivo di entrare in standby mentre la radio è attiva.
   */
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && isActive) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          console.log("[Cruising] Screen Wake Lock attivo");
        } catch (err) {
          console.warn("[Cruising] Wake Lock non supportato o negato");
        }
      }
    };

    if (isActive) {
      requestWakeLock();
    } else {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    }

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, [isActive]);

  const leaveChannel = useCallback(() => {
    console.log("[Cruising] Chiusura sessione radio...");
    if (peerRef.current) peerRef.current.destroy();
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    
    // Rimuovi tutti i sink audio dal DOM
    const sinks = document.querySelectorAll('[id^="sink-"]');
    sinks.forEach(s => s.remove());
    
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
      // Richiesta microfono con parametri ottimizzati per la voce
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1
        } 
      });
      streamRef.current = stream;
      // Inizialmente muto (PTT mode)
      stream.getAudioTracks().forEach(track => track.enabled = false);

      const myPeerId = `lwd-${carovanaId}-${username.replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;
      
      // CONFIGURAZIONE RESILIENTE PER RETI MOBILI (5G/4G)
      const peer = new PeerClass(myPeerId, {
        debug: 1,
        config: {
          'iceServers': [
            { 'urls': 'stun:stun.l.google.com:19302' },
            {
              // Server TURN Metered con priorità alla porta 443 TCP per bypassare i firewall carrier
              urls: [
                'turn:lwdstrct.metered.live:443?transport=tcp', 
                'turn:lwdstrct.metered.live:3478?transport=udp',
                'turn:lwdstrct.metered.live:3478?transport=tcp'
              ],
              username: '5adb9880780dccfb855a62d9',
              credential: 'Ink+Z3uyHb+fOamN'
            }
          ],
          'iceCandidatePoolSize': 10,
          'iceTransportPolicy': 'all',
          'sdpSemantics': 'unified-plan'
        }
      });

      peer.on('open', (id: string) => {
        console.log(`[Cruising] Radio connessa. ID Unità: ${id}`);
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

                // Logica di chiamata automatica (Full Mesh)
                if (id < presenceId && !peerRef.current.connections[presenceId]) {
                  const call = peerRef.current.call(presenceId, streamRef.current!, {
                    metadata: { username }
                  });
                  
                  if (call) {
                    call.on('stream', (remoteStream: MediaStream) => {
                      playRemoteStream(presenceId, remoteStream);
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
        call.answer(streamRef.current!);
        call.on('stream', (remoteStream: MediaStream) => {
          playRemoteStream(call.peer, remoteStream);
        });
      });

      peer.on('error', (err: any) => {
        console.error(`[Cruising] PeerJS Error:`, err);
        // Riconnessione automatica per instabilità di rete mobile
        if (err.type === 'network' || err.type === 'disconnected' || err.type === 'peer-unavailable') {
          setTimeout(() => {
            if (isActive && peer && !peer.destroyed) {
              console.log("[Cruising] Tentativo di riconnessione...");
              peer.reconnect();
            }
          }, 3000);
        }
      });

      peerRef.current = peer;
    } catch (err) {
      console.error('[Cruising] Errore inizializzazione radio:', err);
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