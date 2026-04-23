"use client";

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3";
const ROGER_BEEP_URL = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3";
const ALERT_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3";

let isAudioUnlocked = false;

/**
 * Sblocca l'audio sui browser mobili. 
 * Deve essere chiamato all'interno di un evento di click dell'utente.
 */
export const unlockAudio = async () => {
  if (isAudioUnlocked) return;
  
  try {
    // Creiamo un contesto audio silenzioso per "svegliare" il motore audio del browser
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const context = new AudioContext();
      if (context.state === 'suspended') {
        await context.resume();
      }
    }

    // Riproduciamo un suono brevissimo e muto per confermare lo sblocco
    const silentAudio = new Audio();
    silentAudio.src = "data:audio/wav;base64,UklGRigAAABXQVZFWm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";
    await silentAudio.play();
    
    isAudioUnlocked = true;
    console.log("[Sound] Audio engine unlocked successfully");
  } catch (err) {
    console.warn("[Sound] Audio unlock failed:", err);
  }
};

export const playNotificationSound = async () => {
  try {
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.volume = 0.5;
    await audio.play();
  } catch (e) {}
};

export const playRogerBeep = async () => {
  try {
    const audio = new Audio(ROGER_BEEP_URL);
    audio.volume = 0.3;
    await audio.play();
  } catch (e) {}
};

export const playAlertSound = async () => {
  try {
    const audio = new Audio(ALERT_SOUND_URL);
    audio.volume = 0.6;
    await audio.play();
  } catch (e) {}
};

export const speakAlert = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'it-IT';
  utterance.pitch = 1.1;
  utterance.rate = 1.0;
  utterance.volume = 1.0;
  window.speechSynthesis.speak(utterance);
};