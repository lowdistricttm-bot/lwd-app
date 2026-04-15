"use client";

import { showLoading, dismissToast } from './toast';

/**
 * Comprime un'immagine utilizzando l'API Canvas nativa del browser.
 * Riduce le dimensioni a max 1920px e qualità 0.7 (JPEG).
 */
export const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const toastId = showLoading(`Ottimizzazione ${file.name}...`);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max_size = 1920;

        // Ridimensionamento proporzionale
        if (width > height) {
          if (width > max_size) {
            height *= max_size / width;
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          dismissToast(toastId);
          return resolve(file);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Conversione in Blob (JPEG con qualità 0.7)
        canvas.toBlob((blob) => {
          dismissToast(toastId);
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            // Restituisci il file più piccolo tra l'originale e il compresso
            resolve(compressedFile.size < file.size ? compressedFile : file);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.7);
      };
      img.onerror = () => {
        dismissToast(toastId);
        resolve(file);
      };
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      dismissToast(toastId);
      resolve(file);
    };
    
    reader.readAsDataURL(file);
  });
};

export const validateVideo = (file: File): Promise<{ ok: boolean; error?: string }> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('video/')) return resolve({ ok: true });

    const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB
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