import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Registrazione Service Worker con aggiornamento forzato automatico
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('SW registrato con successo');
        
        // Forza l'aggiornamento se viene trovato un nuovo worker
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('Nuova versione rilevata. Ricaricamento in corso...');
                // Notifica l'utente o ricarica direttamente
                window.location.reload();
              }
            };
          }
        };
      })
      .catch(err => console.error('Errore registrazione SW:', err));
  });

  // Gestione del cambio di controller (quando il nuovo SW prende il comando)
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      window.location.reload();
      refreshing = true;
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);