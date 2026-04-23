"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { playRogerBeep, playAlertSound } from '@/utils/sound';

interface CruisingUnit {
  id: string;
  username: string;
  isSpeaking: boolean;
  carName?: string;
}

interface CruisingContextType {
  isActive: boolean;
  isSpeaking: boolean;
  units: CruisingUnit[];
  activeCarovanaId: string | null;
  joinChannel: (carovanaId: string, username: string, carName?: string) => Promise<void>;
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

  const peerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<any>(null);

  const leaveChannel = useCallback(() => {
    if (peerRef.current) peerRef.current.destroy();
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    
    setIsActive(false);
    setUnits([]);
    setActiveCarovanaId(null);
    setIsSpeaking(false);
  }, []);

  const joinChannel = useCallback(async (carovanaId: string, username: string, carName?: string) => {
    if (isActive) leaveChannel();

    // Recuperiamo la classe Peer caricata globalmente dal CDN
    const PeerClass = (window as any).Peer;
    if (!PeerClass) {
      console.error("[Cruising] PeerJS non caricato correttamente dal CDN.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      stream.getAudioTracks().forEach(track => track.enabled = false);

      const peer = new PeerClass(`lwd-${carovanaId}-${username.replace(/\s+/g, '-')}`);

      peer.on('open', (id: string) => {
        setIsActive(true);
        setActiveCarovanaId(carovanaId);
        setCurrentUsername(username);
        
        const channel = supabase.channel(`cruising-${carovanaId}`);
        channel
          .on('broadcast', { event: 'unit_joined' }, ({ payload }) => {
            setUnits(prev => {
              if (prev.find(u => u.id === payload.id)) return prev;
              if (peerRef.current && payload.id !== peerRef.current.id) {
                const call = peerRef.current.call(payload.id, streamRef.current!);
                call.on('stream', (remoteStream: MediaStream) => {
                  const audio = new Audio();
                  audio.srcObject = remoteStream;
                  audio.play();
                });
              }
              return [...prev, { id: payload.id, username: payload.username, carName: payload.carName, isSpeaking: false }];
            });
          })
          .on('broadcast', { event: 'speaking_state' }, ({ payload }) => {
            setUnits(prev => prev.map(u => u.username === payload.username ? { ...u, isSpeaking: payload.isSpeaking } : u));
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              channel.send({
                type: 'broadcast',
                event: 'unit_joined',
                payload: { id, username, carName }
              });
            }
          });
        
        channelRef.current = channel;
      });

      peer.on('call', (call: any) => {
        call.answer(streamRef.current!);
        call.on('stream', (remoteStream: MediaStream) => {
          const audio = new Audio();
          audio.srcObject = remoteStream;
          audio.play();
        });
      });

      peerRef.current = peer;
    } catch (err) {
      console.error('[Cruising] Error:', err);
    }
  }, [isActive, leaveChannel]);

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
      isActive, isSpeaking, units, activeCarovanaId,
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