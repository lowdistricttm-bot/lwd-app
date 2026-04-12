"use client";

import React from 'react';
import { ChevronLeft, Plus, CreditCard, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { showSuccess } from '@/utils/toast';

const PaymentMethods = () => {
  const navigate = useNavigate();

  const cards = [
    { id: 1, brand: 'Visa', last4: '4242', expiry: '12/25', isDefault: true },
    { id: 2, brand: 'Mastercard', last4: '8888', expiry: '08/24', isDefault: false },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="px-6 py-8 flex items-center gap-4 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-black tracking-tighter uppercase">Metodi di Pagamento</h1>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-4">
          {cards.map((card) => (
            <div key={card.id} className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-white/5 rounded flex items-center justify-center">
                    <CreditCard size={20} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white">•••• •••• •••• {card.last4}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">{card.brand} • Scade {card.expiry}</p>
                  </div>
                </div>
                <button onClick={() => showSuccess('Metodo rimosso')} className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
              {card.isDefault && (
                <div className="mt-4 inline-block bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 tracking-widest">
                  Predefinito
                </div>
              )}
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => showSuccess('Funzionalità in arrivo')}
          className="w-full py-4 border border-dashed border-white/10 flex items-center justify-center gap-2 text-gray-400 hover:text-white hover:border-white/30 transition-all rounded-2xl"
        >
          <Plus size={20} />
          <span className="text-xs font-bold uppercase tracking-widest">Aggiungi Carta</span>
        </button>

        <div className="pt-10">
          <p className="text-[10px] text-gray-600 uppercase font-bold leading-relaxed text-center">
            I tuoi dati di pagamento sono criptati e gestiti in sicurezza tramite protocolli bancari certificati.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;