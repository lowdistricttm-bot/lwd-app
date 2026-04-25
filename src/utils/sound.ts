"use client";

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3";
const ROGER_BEEP_URL = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3";
const ALERT_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3";

let isAudioUnlocked = false;
let globalAudioContext: AudioContext | null = null;

/**
 * Restituisce l'AudioContext globale o ne crea uno se non esiste.
 */
export const getGlobalAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!globalAudioContext) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    globalAudioContext = new AudioContextClass();
  }
  return globalAudioContext;
};

/**
 * Sblocca l'audio in modo definitivo per iOS.
 * Utilizza sia AudioContext che un elemento audio silente per garantire i permessi.
 */
export const unlockAudio = async () => {
  if (isAudioUnlocked) return true;
  
  try {
    const context = getGlobalAudioContext();
    if (!context) return false;

    if (context.state === 'suspended') {
      await context.resume();
    }

    // 1. Sblocco tramite AudioContext (per effetti sonori)
    const buffer = context.createBuffer(1, 1, 22050);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);

    // 2. Sblocco tramite HTMLAudioElement (fondamentale per flussi voce su iOS)
    const silentAudio = new Audio();
    // WAV silente di 1 secondo
    silentAudio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
    await silentAudio.play().catch(() => {});

    isAudioUnlocked = true;
    console.log("[Sound] Audio engine fully unlocked via hybrid method");
    return true;
  } catch (err) {
    console.error("[Sound] Audio unlock critical failure:", err);
    return false;
  }
};

export const playNotificationSound = async () => {
  try {
    const context = getGlobalAudioContext();
    if (context?.state === 'suspended') await context.resume();
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.volume = 0.5;
    await audio.play();
  } catch (e) {}
};

export const playRogerBeep = async () => {
  try {
    const context = getGlobalAudioContext();
    if (context?.state === 'suspended') await context.resume();
    const audio = new Audio(ROGER_BEEP_URL);
    audio.volume = 0.3;
    await audio.play();
  } catch (e) {}
};

export const playAlertSound = async () => {
  try {
    const context = getGlobalAudioContext();
    if (context?.state === 'suspended') await context.resume();
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