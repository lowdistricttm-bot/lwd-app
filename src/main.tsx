import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Registrazione Service Worker senza ricarica forzata automatica
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('SW registrato con successo');
        
        // Controlla aggiornamenti in background senza forzare il refresh
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('Nuova versione disponibile. Sarà attiva al prossimo riavvio manuale.');
              }
            };
          }
        };
      })
      .catch(err => console.error('Errore registrazione SW:', err));
  });
}

createRoot(document.getElementById("root")!).render(<App />);