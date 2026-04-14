"use client";

// URL di un suono di notifica pulito e moderno
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3";

export const playNotificationSound = () => {
  try {
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.volume = 0.5;
    
    // I browser bloccano l'audio se l'utente non ha ancora interagito con la pagina.
    // Usiamo una promessa per gestire eventuali blocchi silenziosamente.
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("[Sound] Riproduzione bloccata dal browser fino all'interazione dell'utente.");
      });
    }
  } catch (err) {
    console.error("[Sound] Errore riproduzione audio:", err);
  }
};