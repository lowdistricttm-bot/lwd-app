import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Registrazione Service Worker per PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registrato con successo:', registration.scope);
      })
      .catch(err => {
        console.log('Registrazione SW fallita:', err);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);