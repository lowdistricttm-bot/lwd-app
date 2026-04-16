import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Registrazione Service Worker con gestione errori migliorata
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
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
        // Ignoriamo l'errore del Lock se è un AbortError (comune in Chrome durante i refresh)
        if (err.name !== 'AbortError') {
          console.error('[SW] Errore registrazione:', err);
        }
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);