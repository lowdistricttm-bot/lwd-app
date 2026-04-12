import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Registrazione Service Worker più robusta
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(registration => {
        console.log('Low District SW pronto:', registration.scope);
      })
      .catch(err => {
        console.error('Errore registrazione SW:', err);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);