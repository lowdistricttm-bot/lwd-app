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
        // Usiamo una variabile per il nome del pacchetto per impedire a Vite di analizzarlo staticamente.
        // Questo evita l'errore 'Failed to resolve import' se il pacchetto non è ancora installato.
        const hapticsPackageName = '@capacitor/haptics';
        const hapticsModule = await import(/* @vite-ignore */ hapticsPackageName);
        
        if (hapticsModule && hapticsModule.Haptics) {
          await hapticsModule.Haptics.notification({
            type: hapticsModule.NotificationType.Success
          });
        }
      } catch (hapticErr) {
        // Silenziamo l'errore se il plugin non è installato o non risolto
        console.warn("[Sound] Feedback aptico non disponibile o pacchetto non trovato.");
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