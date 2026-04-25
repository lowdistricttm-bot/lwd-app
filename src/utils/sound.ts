"use client";

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3";
const ROGER_BEEP_URL = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3";
const ALERT_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3";

let isAudioUnlocked = false;
let globalAudioContext: AudioContext | null = null;

/**
 * Sblocca l'audio in modo definitivo per iOS.
 * Deve essere chiamato direttamente nell'evento onClick.
 */
export const unlockAudio = async () => {
  if (isAudioUnlocked) return true;
  
  try {
    // 1. Crea o riprendi l'AudioContext (fondamentale per WebRTC su iOS)
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!globalAudioContext) {
      globalAudioContext = new AudioContextClass();
    }

    if (globalAudioContext?.state === 'suspended') {
      await globalAudioContext.resume();
    }

    // 2. Riproduci un buffer di silenzio (metodo più affidabile di new Audio())
    const buffer = globalAudioContext?.createBuffer(1, 1, 22050);
    const source = globalAudioContext?.createBufferSource();
    if (source && buffer) {
      source.buffer = buffer;
      source.connect(globalAudioContext!.destination);
      source.start(0);
    }

    isAudioUnlocked = true;
    console.log("[Sound] Audio engine unlocked via AudioContext");
    return true;
  } catch (err) {
    console.error("[Sound] Audio unlock critical failure:", err);
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