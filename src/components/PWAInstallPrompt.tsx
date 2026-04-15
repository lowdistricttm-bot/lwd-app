"use client";

import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Download, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Verifica se l'app è già in modalità standalone (già installata)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');

    if (isStandalone) return;

    // 2. Rileva la piattaforma
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    if (isIos) setPlatform('ios');
    else if (isAndroid) setPlatform('android');

    // 3. Gestione Android (evento beforeinstallprompt)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Mostra il prompt dopo 3 secondi per non essere troppo invasivi all'inizio
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Gestione iOS (mostra sempre se non standalone, dopo un delay)
    if (isIos && !isStandalone) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallAndroid = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-24 left-4 right-4 z-[100] md:left-auto md:right-8 md:bottom-8 md:w-80"
      >
        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black">
          <button 
            onClick={() => setShowPrompt(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-white"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shrink-0">
              <Smartphone className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-white">Installa l'App</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Low District Official</p>
            </div>
          </div>

          {platform === 'ios' ? (
            <div className="space-y-4">
              <p className="text-xs text-gray-300 leading-relaxed">
                Per installare l'app sul tuo iPhone:
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[11px] text-white font-medium">
                  <div className="p-1.5 bg-white/5 rounded-lg"><Share size={16} className="text-blue-400" /></div>
                  <span>1. Clicca sul tasto "Condividi" in basso</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-white font-medium">
                  <div className="p-1.5 bg-white/5 rounded-lg"><PlusSquare size={16} /></div>
                  <span>2. Seleziona "Aggiungi alla schermata Home"</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-gray-300 leading-relaxed">
                Aggiungi Low District alla tua home per un'esperienza completa e veloce.
              </p>
              <button 
                onClick={handleInstallAndroid}
                className="w-full bg-white text-black py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all"
              >
                <Download size={16} /> Installa Ora
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;