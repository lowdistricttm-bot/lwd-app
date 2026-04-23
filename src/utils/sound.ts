"use client";

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3";
const ROGER_BEEP_URL = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3";
const ALERT_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3";

// Istanze persistenti per evitare ritardi di caricamento
let notificationAudio: HTMLAudioElement | null = null;
let alertAudio: HTMLAudioElement | null = null;
let rogerBeepAudio: HTMLAudioElement | null = null;
let isUnlocked = false;

/**
 * Inizializza e sblocca gli elementi audio. 
 * Deve essere chiamato a seguito di un'interazione utente (clic).
 */
export const unlockAudio = async () => {
  if (isUnlocked) return;
  
  try {
    if (!notificationAudio) notificationAudio = new Audio(NOTIFICATION_SOUND_URL);
    if (!alertAudio) alertAudio = new Audio(ALERT_SOUND_URL);
    if (!rogerBeepAudio) rogerBeepAudio = new Audio(ROGER_BEEP_URL);

    // Play/Pause silenzioso per sbloccare il contesto su iOS/Android
    const audios = [notificationAudio, alertAudio, rogerBeepAudio];
    for (const a of audios) {
      a.muted = true;
      await a.play();
      a.pause();
      a.currentTime = 0;
      a.muted = false;
    }
    
    isUnlocked = true;
    console.log("[Sound] Audio Engine Unlocked");
  } catch (err) {
    console.warn("[Sound] Sblocco audio fallito:", err);
  }
};

export const playNotificationSound = () => {
  if (!notificationAudio) notificationAudio = new Audio(NOTIFICATION_SOUND_URL);
  notificationAudio.currentTime = 0;
  notificationAudio.volume = 0.5;
  notificationAudio.play().catch(() => {});
};

export const playRogerBeep = () => {
  if (!rogerBeepAudio) rogerBeepAudio = new Audio(ROGER_BEEP_URL);
  rogerBeepAudio.currentTime = 0;
  rogerBeepAudio.volume = 0.3;
  rogerBeepAudio.play().catch(() => {});
};

export const playAlertSound = () => {
  if (!alertAudio) alertAudio = new Audio(ALERT_SOUND_URL);
  alertAudio.currentTime = 0;
  alertAudio.volume = 0.8; // Aumentato volume per allerta stradale
  alertAudio.play().catch(async () => {
    // Se fallisce (es. sessione scaduta), riprova a sbloccare
    await unlockAudio();
    alertAudio?.play();
  });
};

/**
 * Legge un testo ad alta voce usando la sintesi vocale del browser.
 */
export const speakAlert = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'it-IT';
  utterance.pitch = 1.0;
  utterance.rate = 1.1; // Leggermente più veloce per urgenza
  utterance.volume = 1.0;
  
  window.speechSynthesis.speak(utterance);
};