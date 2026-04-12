import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nuova versione disponibile, ricarica la pagina
                window.location.reload();
              }
            };
          }
        };
      })
      .catch(err => console.error('SW registration failed:', err));
  });
}

createRoot(document.getElementById("root")!).render(<App />);