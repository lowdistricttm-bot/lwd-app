"use client";

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3";
const ROGER_BEEP_URL = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3";
const ALERT_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3";

let isAudioUnlocked = false;

/**
 * Sblocca l'audio sui browser mobili. 
 * DEVE essere chiamato direttamente dentro un evento onClick.
 */
export const unlockAudio = async () => {
  if (isAudioUnlocked) return true;
  
  try {
    // 1. Sveglia l'AudioContext
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const context = new AudioContext();
      if (context.state === 'suspended') {
        await context.resume();
      }
    }

    // 2. Riproduci un suono silenzioso per forzare il browser a permettere l'audio
    const silentAudio = new Audio();
    // WAV silenzioso di 100ms
    silentAudio.src = "data:audio/wav;base64,UklGRigAAABXQVZFWm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";
    await silentAudio.play();
    
    isAudioUnlocked = true;
    console.log("[Sound] Audio engine unlocked successfully");
    return true;
  } catch (err) {
    console.warn("[Sound] Audio unlock failed:", err);
    return false;
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