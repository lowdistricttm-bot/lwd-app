"use client";

import { useEffect } from 'react';

/**
 * Hook per bloccare lo scroll del body in modo definitivo su mobile
 * e gestire il riposizionamento dei layout senza scatti.
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
      height: document.body.style.height,
      paddingRight: document.body.style.paddingRight
    };

    // Calcoliamo la scrollbar width per evitare il "salto" orizzontale su desktop
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    // BLOCCO TOTALE: Usiamo position fixed per "congelare" il body nella posizione attuale
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      // RIPRISTINO: Rimuoviamo il blocco fixed e torniamo alla posizione originale
      document.body.style.position = originalStyle.position;
      document.body.style.top = originalStyle.top;
      document.body.style.width = originalStyle.width;
      document.body.style.height = originalStyle.height;
      document.body.style.overflow = originalStyle.overflow;
      document.body.style.paddingRight = originalStyle.paddingRight;

      // Riportiamo l'utente dove si trovava prima dell'apertura del modal
      // Usiamo requestAnimationFrame per assicurarci che il layout sia pronto
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    };
  }, [isOpen]);
};