"use client";

import { useEffect } from 'react';

// Contatore globale per gestire modal annidati
let lockCount = 0;
let originalStyles: any = null;
let lastScrollY = 0;

/**
 * Hook per bloccare lo scroll del body in modo definitivo su mobile
 * Gestisce correttamente il ripristino del touch e della posizione di scroll.
 */
export const useBodyLock = (isOpen: boolean) => {
  useEffect(() => {
    if (!isOpen) return;

    // Incrementiamo il contatore dei blocchi attivi
    lockCount++;

    // Se è il primo blocco, salviamo gli stili originali
    if (lockCount === 1) {
      lastScrollY = window.scrollY;
      
      originalStyles = {
        overflow: document.body.style.overflow,
        position: document.body.style.position,
        top: document.body.style.top,
        width: document.body.style.width,
        height: document.body.style.height,
        paddingRight: document.body.style.paddingRight,
        touchAction: document.body.style.touchAction,
        pointerEvents: document.body.style.pointerEvents
      };

      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

      // Applichiamo il blocco "congelando" la posizione attuale
      document.body.style.position = 'fixed';
      document.body.style.top = `-${lastScrollY}px`;
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none'; // Previene gesture di sistema interferenti
      
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
    }

    return () => {
      // Decrementiamo al termine
      lockCount--;

      // Ripristiniamo solo se non ci sono altri modal aperti
      if (lockCount <= 0) {
        lockCount = 0; // Sicurezza
        
        if (originalStyles) {
          document.body.style.position = originalStyles.position;
          document.body.style.top = originalStyles.top;
          document.body.style.width = originalStyles.width;
          document.body.style.height = originalStyles.height;
          document.body.style.overflow = originalStyles.overflow;
          document.body.style.paddingRight = originalStyles.paddingRight;
          document.body.style.touchAction = originalStyles.touchAction;
          document.body.style.pointerEvents = originalStyles.pointerEvents;
        }

        // Forza il ripristino immediato della posizione di scroll
        window.scrollTo(0, lastScrollY);
        
        // Pulizia per sicurezza nel prossimo frame
        requestAnimationFrame(() => {
          if (lockCount === 0) {
            window.scrollTo(0, lastScrollY);
          }
        });
      }
    };
  }, [isOpen]);
};