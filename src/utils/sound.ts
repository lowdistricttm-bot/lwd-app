"use client";

// URL di un suono di notifica pulito e moderno
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3";

// Singleton per l'audio per evitare di creare troppi oggetti e facilitare lo sblocco
let audioInstance: HTMLAudioElement | null = null;
let isAudioUnlocked = false;

/**
 * Sblocca l'audio sui browser mobile. 
 * Deve essere chiamato all'interno di un evento scatenato dall'utente (click/touchstart).
 */
export const unlockAudio = async () => {
  if (isAudioUnlocked) return;

  try {
    if (!audioInstance) {
      audioInstance = new Audio(NOTIFICATION_SOUND_URL);
    }
    
    // Riproduciamo un istante di silenzio per sbloccare il contesto audio
    audioInstance.muted = true;
    await audioInstance.play();
    audioInstance.pause();
    audioInstance.currentTime = 0;
    audioInstance.muted = false;
    
    isAudioUnlocked = true;
    console.log("[Sound] Audio sbloccato correttamente per mobile.");
  } catch (err) {
    console.error("[Sound] Errore durante lo sblocco audio:", err);
  }
};

export const playNotificationSound = async () => {
  try {
    // 1. Feedback Aptico (Vibrazione)
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50]);
    }

    // 2. Riproduzione Audio
    // Se l'istanza non esiste o non è sbloccata, proviamo a crearne una nuova al volo
    // (anche se su mobile potrebbe fallire se non sbloccata prima)
    const audio = isAudioUnlocked && audioInstance ? audioInstance : new Audio(NOTIFICATION_SOUND_URL);
    
    audio.volume = 0.5;
    audio.currentTime = 0;
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn("[Sound] Riproduzione bloccata dal browser. L'utente deve interagire con la pagina.");
      });
    }
  } catch (err) {
    console.error("[Sound] Errore sistema audio:", err);
  }
};