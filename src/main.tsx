import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Registrazione Service Worker con percorso assoluto e gestione errori
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then(reg => {
        console.log('[SW] Registrato con successo:', reg.scope);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('[SW] Errore registrazione:', err);
        }
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);