"use client";

import React, { useEffect } from 'react';
import { Loader2, ShieldCheck, Lock } from 'lucide-react';

const Checkout = () => {
  useEffect(() => {
    // Reindirizzamento automatico al checkout del sito
    const timer = setTimeout(() => {
      window.location.href = "https://www.lowdistrict.it/checkout/";
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <Loader2 className="animate-spin text-red-600" size={64} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Lock size={20} className="text-white" />
        </div>
      </div>
      
      <h1 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">Connessione Sicura</h1>
      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
        Ti stiamo trasferendo sul server sicuro di Low District per completare il pagamento.
      </p>

      <div className="mt-12 flex items-center gap-4 opacity-30">
        <ShieldCheck size={24} />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Encrypted Transaction</span>
      </div>
    </div>
  );
};

export default Checkout;