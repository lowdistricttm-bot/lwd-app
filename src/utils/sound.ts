"use client";

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3";
const ROGER_BEEP_URL = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3";
const ALERT_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3";

let audioInstance: HTMLAudioElement | null = null;
let isAudioUnlocked = false;

export const unlockAudio = async () => {
  if (isAudioUnlocked) return;
  try {
    if (!audioInstance) audioInstance = new Audio(NOTIFICATION_SOUND_URL);
    audioInstance.muted = true;
    await audioInstance.play();
    audioInstance.pause();
    audioInstance.currentTime = 0;
    audioInstance.muted = false;
    isAudioUnlocked = true;
  } catch (err) {}
};

export const playNotificationSound = async () => {
  const audio = new Audio(NOTIFICATION_SOUND_URL);
  audio.volume = 0.5;
  audio.play().catch(() => {});
};

export const playRogerBeep = async () => {
  const audio = new Audio(ROGER_BEEP_URL);
  audio.volume = 0.3;
  audio.play().catch(() => {});
};

export const playAlertSound = async () => {
  const audio = new Audio(ALERT_SOUND_URL);
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

/**
 * Legge un testo ad alta voce usando la sintesi vocale del browser.
 */
export const speakAlert = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  
  // Interrompi eventuali messaggi in corso
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'it-IT';
  utterance.pitch = 1.1;
  utterance.rate = 1.0;
  utterance.volume = 1.0;
  
  window.speechSynthesis.speak(utterance);
};