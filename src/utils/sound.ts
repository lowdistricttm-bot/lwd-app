"use client";

import { Capacitor } from '@capacitor/core';

// URL di un suono di notifica pulito e moderno
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3";

export const playNotificationSound = async () => {
  try {
    const isNative = Capacitor.isNativePlatform();

    // 1. Feedback Aptico (Vibrazione) - Solo su Native
    if (isNative) {
      try {
        // Usiamo un import dinamico con commento ignore per Vite
        // Questo impedisce a Vite di bloccare la build se il pacchetto non è presente
        const { Haptics, NotificationType } = await import(/* @vite-ignore */ '@capacitor/haptics');
        
        if (Haptics) {
          await Haptics.notification({
            type: NotificationType.Success
          });
        }
      } catch (hapticErr) {
        // Silenziamo l'errore se il plugin non è installato o disponibile
        console.warn("[Sound] Feedback aptico non disponibile.");
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
        console.log("[Sound] Riproduzione audio limitata dal sistema:", error);
      });
    }
  } catch (err) {
    console.error("[Sound] Errore critico sistema audio:", err);
  }
};