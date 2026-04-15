"use client";

import { Capacitor } from '@capacitor/core';
import { Haptics, NotificationType } from '@capacitor/haptics';

// URL di un suono di notifica pulito e moderno
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3";

export const playNotificationSound = async () => {
  try {
    const isNative = Capacitor.isNativePlatform();

    // 1. Feedback Aptico (Vibrazione) - Solo su Native
    if (isNative) {
      await Haptics.notification({
        type: NotificationType.Success
      });
    }

    // 2. Riproduzione Audio
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.volume = 0.6;
    
    // Su piattaforme native, forziamo il caricamento immediato
    if (isNative) {
      audio.preload = "auto";
    }

    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("[Sound] Riproduzione bloccata o fallita:", error);
        
        // Se siamo su web e fallisce, non possiamo fare molto senza interazione.
        // Se siamo su native e fallisce, di solito è un problema di permessi o file.
      });
    }
  } catch (err) {
    console.error("[Sound] Errore critico sistema audio:", err);
  }
};