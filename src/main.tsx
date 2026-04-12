import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Sistema di gestione aggiornamenti PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        // Controlla se c'è un aggiornamento in attesa
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nuova versione pronta: forza il ricaricamento della pagina
                console.log('Nuova versione rilevata, ricarico...');
                window.location.reload();
              }
            };
          }
        };
      })
      .catch(err => console.error('Errore registrazione SW:', err));
  });

  // Forza il ricaricamento se il Service Worker cambia
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      window.location.reload();
      refreshing = true;
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);