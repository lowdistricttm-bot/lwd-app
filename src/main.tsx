import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Registrazione Service Worker con gestione errori avanzata per conflitti di Lock
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Utilizziamo un piccolo timeout per evitare collisioni durante il caricamento immediato
    setTimeout(() => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log('[SW] Registrato con successo');
          
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[SW] Nuova versione disponibile.');
                }
              };
            }
          };
        })
        .catch(err => {
          // Gestione specifica per l'errore di Lock "steal" o interruzioni di rete
          const isLockError = err.name === 'AbortError' || 
                             err.message?.includes('Lock broken') || 
                             err.message?.includes('steal');
          
          if (!isLockError) {
            console.error('[SW] Errore registrazione:', err);
          } else {
            // Log silenzioso per errori di lock comuni durante il refresh o navigazione rapida
            console.warn('[SW] Registrazione interrotta o gestita da un altro processo.');
          }
        });
    }, 200); // Aumentato leggermente il delay per stabilità
  });
}

createRoot(document.getElementById("root")!).render(<App />);