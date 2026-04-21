import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Disabilitiamo temporaneamente il Service Worker per diagnosticare il crash di WebKit
/*
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log('[SW] Registrato con successo');
        })
        .catch(err => {
          console.error('[SW] Errore registrazione:', err);
        });
    }, 200);
  });
}
*/

createRoot(document.getElementById("root")!).render(<App />);