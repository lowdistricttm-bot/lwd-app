"use client";

import { useEffect } from 'react';

/**
 * Hook per bloccare lo scroll del body in modo definitivo su mobile
 * e gestire il riposizionamento dei layout.
 */
export const useBodyLock = (isOpen: boolean) => {
  useEffect(() => {
    if (!isOpen) return;

    // Salviamo la posizione attuale dello scroll
    const scrollY = window.scrollY;
    
    // Salviamo gli stili originali per ripristinarli
    const originalStyle = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      height: document.body.style.height
    };

    // BLOCCO TOTALE: Usiamo position fixed per "congelare" il body nella posizione attuale
    // Questo impedisce lo scroll su iOS Safari al 100%
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';

    // FIX TASTIERA MOBILE: Forza il ricalcolo del layout alla chiusura
    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setTimeout(() => {
          // Forza il browser a ricalcolare le dimensioni del viewport
          window.scrollTo(0, window.scrollY);
          document.documentElement.style.height = '100.1%';
          setTimeout(() => {
            document.documentElement.style.height = '100%';
          }, 10);
        }, 100);
      }
    };

    window.addEventListener('focusout', handleFocusOut);

    return () => {
      window.removeEventListener('focusout', handleFocusOut);
      
      // RIPRISTINO: Rimuoviamo il blocco fixed e torniamo alla posizione originale
      document.body.style.position = originalStyle.position;
      document.body.style.top = originalStyle.top;
      document.body.style.width = originalStyle.width;
      document.body.style.height = originalStyle.height;
      document.body.style.overflow = originalStyle.overflow;

      // Riportiamo l'utente dove si trovava prima dell'apertura del modal
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);
};