"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { playRogerBeep, playAlertSound } from '@/utils/sound';

export interface CruisingUnit {
  id: string;
  username: string;
  isSpeaking: boolean;
  carName?: string;
}

export const useCruisingMode = (carovanaId: string, username: string, carName?: string) => {
  const [isActive, setIsActive] = useState(false);
  const [units, setUnits] = useState<CruisingUnit[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const peerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<any>(null);

  const joinChannel = useCallback(async () => {
    const PeerClass = (window as any).Peer;
    if (!PeerClass) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      stream.getAudioTracks().forEach(track => track.enabled = false);

      const peer = new PeerClass(`lwd-${carovanaId}-${username.replace(/\s+/g, '-')}`);

      peer.on('open', (id: string) => {
        setIsActive(true);
        channelRef.current?.send({
          type: 'broadcast',
          event: 'unit_joined',
          payload: { id, username, carName }
        });
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
      console.error('[Cruising] Errore microfono:', err);
    }
  }, [carovanaId, username, carName]);

  const leaveChannel = useCallback(() => {
    peerRef.current?.destroy();
    streamRef.current?.getTracks().forEach(track => track.stop());
    setIsActive(false);
    setUnits([]);
  }, []);

  const toggleMic = useCallback((speaking: boolean) => {
    if (!streamRef.current) return;
    streamRef.current.getAudioTracks().forEach(track => track.enabled = speaking);
    setIsSpeaking(speaking);

    if (!speaking) playRogerBeep();

    channelRef.current?.send({
      type: 'broadcast',
      event: 'speaking_state',
      payload: { username, isSpeaking: speaking }
    });
  }, [username]);

  const sendAlert = useCallback((type: string, message: string) => {
    playAlertSound();
    channelRef.current?.send({
      type: 'broadcast',
      event: 'road_alert',
      payload: { type, message, sender: username }
    });
  }, [username]);

  useEffect(() => {
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
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [carovanaId]);

  return { isActive, isSpeaking, units, joinChannel, leaveChannel, toggleMic, sendAlert };
};