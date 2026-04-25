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
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const playRemoteStream = useCallback((presenceId: string, remoteStream: MediaStream) => {
    if (audioElementsRef.current.has(presenceId)) {
      const oldAudio = audioElementsRef.current.get(presenceId);
      oldAudio?.pause();
      audioElementsRef.current.delete(presenceId);
    }

    const audio = new Audio();
    audio.srcObject = remoteStream;
    audio.autoplay = true;
    audio.play().catch(err => {
      console.warn(`[Cruising] Autoplay blocked for peer ${presenceId}:`, err);
    });
    
    audioElementsRef.current.set(presenceId, audio);
  }, []);

  const leaveChannel = useCallback(() => {
    if (peerRef.current) peerRef.current.destroy();
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    
    audioElementsRef.current.forEach(audio => {
      audio.pause();
      audio.srcObject = null;
    });
    audioElementsRef.current.clear();
    
    setIsActive(false);
    setUnits([]);
    setActiveCarovanaId(null);
    setIsSpeaking(false);
  }, []);

  const joinChannel = useCallback(async (carovanaId: string, username: string, avatarUrl: string, role: string, carName?: string) => {
    await unlockAudio();

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

      const peerId = `lwd-${carovanaId}-${username.replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;
      
      // Configurazione con server TURN di Metered (Credenziali Utente)
      const peer = new PeerClass(peerId, {
        debug: 1,
        config: {
          'iceServers': [
            { 'urls': 'stun:stun.l.google.com:19302' },
            { 'urls': 'stun:stun1.l.google.com:19302' },
            {
              urls: 'turn:open.metered.ca:3478?transport=udp',
              username: '5adb9880780dccfb855a62d9',
              credential: 'Ink+Z3uyHb+fOamN'
            },
            {
              urls: 'turn:open.metered.ca:3478?transport=tcp',
              username: '5adb9880780dccfb855a62d9',
              credential: 'Ink+Z3uyHb+fOamN'
            },
            {
              urls: 'turns:open.metered.ca:443?transport=tcp',
              username: '5adb9880780dccfb855a62d9',
              credential: 'Ink+Z3uyHb+fOamN'
            }
          ],
          'iceTransportPolicy': 'all'
        }
      });

      peer.on('open', (id: string) => {
        setIsActive(true);
        setActiveCarovanaId(carovanaId);
        setCurrentUsername(username);
        
        const channel = supabase.channel(`cruising-${carovanaId}`, {
          config: {
            presence: {
              key: id,
            },
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

                if (peerRef.current && !peerRef.current.connections[presenceId]) {
                  const call = peerRef.current.call(presenceId, streamRef.current!);
                  call.on('stream', (remoteStream: MediaStream) => {
                    playRemoteStream(presenceId, remoteStream);
                  });
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
        call.answer(streamRef.current!);
        call.on('stream', (remoteStream: MediaStream) => {
          playRemoteStream(call.peer, remoteStream);
        });
      });

      peerRef.current = peer;
    } catch (err) {
      console.error('[Cruising] Error:', err);
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