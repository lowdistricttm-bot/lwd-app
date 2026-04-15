"use client";

import { Capacitor } from '@capacitor/core';

// URL di un suono di notifica pulito e moderno
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3";

export const playNotificationSound = async () => {
  try {
    const isNative = Capacitor.isNativePlatform();

    // 1. Feedback Aptico (Vibrazione) - Solo su Native con caricamento dinamico
    if (isNative) {
      try {
        // Carichiamo il plugin solo se siamo su mobile per evitare errori di build su web
        const { Haptics, NotificationType } = await import('@capacitor/haptics');
        await Haptics.notification({
          type: NotificationType.Success
        });
      } catch (hapticErr) {
        console.warn("[Sound] Plugin Haptics non disponibile:", hapticErr);
      }
    }

    // 2. Riproduzione Audio
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.volume = 0.6;
    
    if (isNative) {
      audio.preload = "auto";
    }

    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("[Sound] Riproduzione audio bloccata (normale su Web senza interazione):", error);
      });
    }
  } catch (err) {
    console.error("[Sound] Errore critico sistema audio:", err);
  }
};