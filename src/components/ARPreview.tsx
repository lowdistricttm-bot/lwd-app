"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, RefreshCw, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const ARPreview = ({ productImg, onClose }: { productImg: string, onClose: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (err) {
        console.error("Errore camera:", err);
      }
    }
    startCamera();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  return (
    <div className="fixed inset-0 z-[500] bg-black flex flex-col">
      <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-center">
        <h3 className="text-white font-black uppercase italic tracking-widest text-xs">AR Lifestyle Preview</h3>
        <button onClick={onClose} className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white"><X size={24} /></button>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        
        <motion.div 
          drag
          dragConstraints={{ left: -200, right: 200, top: -300, bottom: 300 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 cursor-grab active:cursor-grabbing"
        >
          <img src={productImg} className="w-full h-full object-contain drop-shadow-2xl" alt="Prodotto" />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black text-white uppercase">Trascina per posizionare</div>
        </motion.div>
      </div>

      <div className="p-8 bg-black flex justify-center gap-8">
        <button className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/10"><div className="w-12 h-12 bg-white rounded-full" /></button>
      </div>
    </div>
  );
};

export default ARPreview;