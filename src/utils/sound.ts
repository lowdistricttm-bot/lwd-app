"use client";

// URL di un suono di notifica pulito e moderno
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3";

export const playNotificationSound = async () => {
  try {
    // 1. Feedback Aptico (Vibrazione) tramite Web API standard
    // Funziona su Android e molti browser mobile senza pacchetti extra
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50]); // Pattern di vibrazione leggero
    }

    // 2. Riproduzione Audio tramite Web API standard
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.volume = 0.5;
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        // L'audio potrebbe essere bloccato se l'utente non ha ancora interagito con la pagina
        console.log("[Sound] Riproduzione audio in attesa di interazione utente.");
      });
    }
  } catch (err) {
    console.error("[Sound] Errore sistema audio:", err);
  }
};