"use client";

import { showLoading, dismissToast } from './toast';

/**
 * Comprime un'immagine utilizzando l'API Canvas nativa del browser.
 * Riduce le dimensioni a max 1080px e converte in WebP con qualità 0.7.
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
        const max_size = 1080; // Ridotto a 1080px come richiesto

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

        // Conversione in WebP con qualità 0.7
        canvas.toBlob((blob) => {
          dismissToast(toastId);
          if (blob) {
            // Cambiamo l'estensione in .webp
            const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const compressedFile = new File([blob], newFileName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/webp', 0.7);
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

/**
 * Valida il video controllando peso (max 10MB) e durata.
 */
export const validateVideo = (file: File): Promise<{ ok: boolean; error?: string }> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('video/')) return resolve({ ok: true });

    const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // Ridotto a 10MB come richiesto
    if (file.size > MAX_VIDEO_SIZE) {
      return resolve({ ok: false, error: `Il video "${file.name}" supera i 10MB. Carica un file più leggero.` });
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