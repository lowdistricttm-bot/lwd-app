"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { ChevronLeft, Smartphone, Crosshair, RefreshCcw, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CamberHelper = () => {
  const navigate = useNavigate();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [rawAngle, setRawAngle] = useState(0);
  const [offset, setOffset] = useState(0);

  const targetAngle = useRef(0);
  const currentAngle = useRef(0);
  const animationRef = useRef<number>(0);

  // Algoritmo di smoothing estremo per rendere la lettura ultra-precisa e stabile
  const updateAngle = () => {
    currentAngle.current += (targetAngle.current - currentAngle.current) * 0.05;
    setRawAngle(currentAngle.current);
    animationRef.current = requestAnimationFrame(updateAngle);
  };

  useEffect(() => {
    animationRef.current = requestAnimationFrame(updateAngle);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const handleOrientation = (event: DeviceOrientationEvent) => {
    if (event.beta !== null) {
      // Calcoliamo l'angolo rispetto alla verticale (90 gradi)
      let angle = 90 - event.beta;
      targetAngle.current = angle;
    }
  };

  const requestAccess = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
          setHasPermission(true);
        } else {
          setHasPermission(false);
        }
      } catch (error) {
        console.error(error);
        setHasPermission(false);
      }
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
      setHasPermission(true);
    }
  };

  const calibrate = () => {
    setOffset(rawAngle);
  };

  const resetCalibration = () => {
    setOffset(0);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Calcolo dell'angolo assoluto:
  // Assumiamo che la ruota sia sempre in "Camber Negativo" per le auto stance.
  // Limitiamo a un massimo di 10 gradi assoluti come richiesto.
  let displayAngle = Math.abs(rawAngle - offset);
  displayAngle = Math.min(10, displayAngle);
  
  // Precisione a due cifre decimali
  const formattedAngle = displayAngle.toFixed(2);

  return (
    <div className="min-h-screen text-white flex flex-col bg-transparent">
      <Navbar />
      
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top)+2rem)] pb-32 px-6 max-w-lg mx-auto w-full">
        <header className="mb-10">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 uppercase text-[10px] font-black tracking-widest transition-colors"
          >
            <ChevronLeft size={16} /> Torna Indietro
          </button>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl rotate-12">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="-rotate-12">
                <g transform="rotate(15 12 12)">
                  <rect x="5" y="2" width="14" height="20" rx="3" />
                  <line x1="5" y1="8" x2="19" y2="8" />
                  <line x1="5" y1="16" x2="19" y2="16" />
                </g>
              </svg>
            </div>
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] italic">Garage Tools</h2>
          </div>
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase">Camber Helper</h1>
        </header>

        {hasPermission === null ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 text-center space-y-6"
          >
            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto border border-white/5">
              <Smartphone size={32} className="text-zinc-400" />
            </div>
            <div>
              <h3 className="text-xl font-black italic uppercase mb-2">Inizializza Sensori</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 leading-relaxed">
                Questo strumento utilizza i sensori ultra-precisi del tuo telefono per calcolare l'inclinazione millimetrica del cerchio. È necessario consentire l'accesso al giroscopio.
              </p>
            </div>
            <Button 
              onClick={requestAccess}
              className="w-full bg-white text-black rounded-full h-14 font-black uppercase tracking-widest italic shadow-xl hover:scale-105 transition-all"
            >
              Consenti Accesso
            </Button>
          </motion.div>
        ) : hasPermission === false ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-[2.5rem] p-8 text-center space-y-4">
            <AlertTriangle size={40} className="mx-auto text-red-500" />
            <h3 className="text-lg font-black italic uppercase text-red-500">Permesso Negato</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Impossibile accedere ai sensori. Ricarica la pagina o controlla le impostazioni di sistema del tuo browser per riprovare.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="bg-zinc-950 rounded-[3rem] border border-white/5 p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
              
              <div className="text-center mb-8 relative z-10">
                <div className="flex items-baseline justify-center gap-1">
                  {/* Prefisso negativo forzato per lo stile stance */}
                  <span className="text-4xl font-black text-red-500">{displayAngle > 0.1 ? '-' : ''}</span>
                  <span className="text-7xl font-black italic tracking-tighter tabular-nums">{formattedAngle}</span>
                  <span className="text-4xl font-black">°</span>
                </div>
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-widest mt-2",
                  displayAngle > 0.1 ? "text-red-500" : "text-zinc-500"
                )}>
                  {displayAngle > 0.1 ? 'Camber Negativo (Stance)' : 'Ruota Dritta (0°)'}
                </p>
              </div>

              {/* Rappresentazione visiva ruota */}
              <div className="relative h-64 flex items-center justify-center">
                {/* Linee guida vettura (Assi) */}
                <div className="absolute inset-0 flex justify-center pointer-events-none opacity-20">
                  <div className="h-full w-[1px] bg-white border-l border-dashed border-white/50" />
                  <div className="absolute top-1/2 w-full h-[1px] bg-white border-t border-dashed border-white/50" />
                </div>

                {/* 
                  Visualizzazione: Ruotiamo la SVG usando "displayAngle" positivo 
                  in modo che la parte superiore si inclini verso l'interno (destra) simulando il camber negativo.
                */}
                <svg viewBox="-100 -100 200 200" className="w-full h-full max-w-[250px] relative z-10 overflow-visible">
                  <g style={{ transform: `rotate(${displayAngle}deg)` }}>
                    <defs>
                      <linearGradient id="rim-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#444" />
                        <stop offset="50%" stopColor="#222" />
                        <stop offset="100%" stopColor="#111" />
                      </linearGradient>
                    </defs>
                    
                    {/* Gomma */}
                    <rect x="-40" y="-80" width="80" height="160" rx="10" fill="#111" stroke="#222" strokeWidth="4" />
                    
                    {/* Cerchio */}
                    <rect x="-30" y="-60" width="60" height="120" rx="4" fill="url(#rim-gradient)" stroke="#555" strokeWidth="2" />
                    
                    {/* Dettagli interni cerchio (Mozzo) */}
                    <circle cx="0" cy="0" r="12" fill="#000" stroke="#555" strokeWidth="2" />
                    <circle cx="0" cy="-30" r="4" fill="#000" />
                    <circle cx="0" cy="30" r="4" fill="#000" />
                  </g>
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={calibrate}
                variant="outline"
                className="h-16 bg-white/5 border-white/10 text-white rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-white/10 hover:text-white shadow-xl"
              >
                <Crosshair size={18} />
                <span className="text-[9px] font-black uppercase tracking-widest italic">Tara a Zero</span>
              </Button>
              <Button 
                onClick={resetCalibration}
                variant="outline"
                className="h-16 bg-white/5 border-white/10 text-white rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-white/10 hover:text-white shadow-xl"
              >
                <RefreshCcw size={18} />
                <span className="text-[9px] font-black uppercase tracking-widest italic">Resetta Tara</span>
              </Button>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] shadow-xl">
              <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.3em] mb-4">Istruzioni per l'uso</h4>
              <ol className="space-y-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 leading-relaxed">
                <li className="flex gap-3"><span className="text-white">1.</span> Assicurati che l'auto sia in piano perfetto.</li>
                <li className="flex gap-3"><span className="text-white">2.</span> Se hai una cover irregolare sul telefono, rimuovila per una misurazione millimetrica.</li>
                <li className="flex gap-3"><span className="text-white">3.</span> Appoggia il telefono in verticale contro i bordi estremi del cerchio (evitando le razze concave).</li>
                <li className="flex gap-3"><span className="text-white">4.</span> Non importa su quale lato dell'auto misuri, l'app calcolerà automaticamente i gradi di camber.</li>
              </ol>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default CamberHelper;