"use client";

import imageCompression from 'browser-image-compression';
import { showLoading, dismissToast } from './toast';

export const compressImage = async (file: File) => {
  // Se non è un'immagine, restituisci il file originale
  if (!file.type.startsWith('image/')) return file;

  const options = {
    maxSizeMB: 1,            // Dimensione massima 1MB
    maxWidthOrHeight: 1920,  // Risoluzione massima Full HD / 2K
    useWebWorker: true,
    initialQuality: 0.8      // Qualità iniziale 80%
  };

  const toastId = showLoading(`Ottimizzazione ${file.name}...`);
  try {
    const compressedFile = await imageCompression(file, options);
    dismissToast(toastId);
    return compressedFile;
  } catch (error) {
    console.error("Errore compressione:", error);
    dismissToast(toastId);
    return file; // In caso di errore, invia l'originale
  }
};

export const validateVideo = (file: File): Promise<{ ok: boolean; error?: string }> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('video/')) return resolve({ ok: true });

    // Limite dimensione video: 20MB per risparmiare spazio
    const MAX_VIDEO_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_VIDEO_SIZE) {
      return resolve({ ok: false, error: "Il video supera i 20MB. Carica un file più leggero." });
    }

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      if (video.duration > 31) {
        resolve({ ok: false, error: "Il video supera i 30 secondi." });
      } else {
        resolve({ ok: true });
      }
    };
    video.onerror = () => resolve({ ok: false, error: "Formato video non supportato." });
    video.src = URL.createObjectURL(file);
  });
};