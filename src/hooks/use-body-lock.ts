"use client";

import { useEffect } from 'react';

/**
 * Hook per bloccare lo scroll del body e gestire il riposizionamento dei layout mobile
 * quando la tastiera viene chiusa.
 */
export const useBodyLock = (isOpen: boolean) => {
  useEffect(() => {
    if (!isOpen) return;

    // Salviamo lo stile originale
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const originalPosition = document.body.style.position;
    const originalWidth = document.body.style.width;

    // Calcoliamo la larghezza della scrollbar per evitare il "salto" del layout
    const scrollBarGap = window.innerWidth - document.documentElement.clientWidth;

    // Blocchiamo il body
    document.body.style.overflow = 'hidden';
    document.body.style.width = '100%';
    if (scrollBarGap > 0) {
      document.body.style.paddingRight = `${scrollBarGap}px`;
    }

    // FIX TASTIERA MOBILE: Quando un input perde il focus (tastiera chiusa),
    // forziamo il browser a ricalcolare il layout e riattaccare i modal al bordo inferiore.
    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Piccolo delay per permettere alla tastiera di iniziare la chiusura
        setTimeout(() => {
          window.scrollTo(0, window.scrollY);
          // Forza un ricalcolo del viewport per gli elementi fixed
          document.documentElement.style.height = '100.1%';
          setTimeout(() => {
            document.documentElement.style.height = '100%';
          }, 10);
        }, 50);
      }
    };

    window.addEventListener('focusout', handleFocusOut);

    // Rendiamo il contenuto principale non interagibile
    const root = document.getElementById('root');
    if (root) {
      root.style.pointerEvents = 'none';
      root.style.userSelect = 'none';
      root.setAttribute('aria-hidden', 'true');
      root.style.transition = 'transform 0.3s ease, filter 0.3s ease';
      root.style.filter = 'brightness(0.5) blur(2px)';
    }

    return () => {
      window.removeEventListener('focusout', handleFocusOut);
      
      // Ripristiniamo tutto alla chiusura
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.body.style.position = originalPosition;
      document.body.style.width = originalWidth;

      if (root) {
        root.style.pointerEvents = 'auto';
        root.style.userSelect = 'auto';
        root.removeAttribute('aria-hidden');
        root.style.filter = '';
      }
    };
  }, [isOpen]);
};