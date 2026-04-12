"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, CreditCard, Truck, ShieldCheck } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const Checkout = () => {
  const { total, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulazione pagamento
    setTimeout(() => {
      showSuccess("Ordine completato con successo!");
      clearCart();
      navigate('/profile');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="px-6 py-8 flex items-center gap-4 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-black tracking-tighter uppercase italic">Checkout</h1>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        <form onSubmit={handlePayment} className="space-y-10">
          <section className="space-y-6">
            <h2 className="text-xs font-black text-red-600 uppercase tracking-[0.3em]">1. Spedizione</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nome</Label>
                <Input className="bg-zinc-900 border-white/5 rounded-none py-6" required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cognome</Label>
                <Input className="bg-zinc-900 border-white/5 rounded-none py-6" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Indirizzo</Label>
              <Input className="bg-zinc-900 border-white/5 rounded-none py-6" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Città</Label>
                <Input className="bg-zinc-900 border-white/5 rounded-none py-6" required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">CAP</Label>
                <Input className="bg-zinc-900 border-white/5 rounded-none py-6" required />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xs font-black text-red-600 uppercase tracking-[0.3em]">2. Pagamento</h2>
            <div className="bg-zinc-900 p-6 border border-white/5 space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <CreditCard className="text-gray-500" />
                <span className="text-sm font-bold uppercase tracking-widest">Carta di Credito</span>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Numero Carta</Label>
                <Input placeholder="0000 0000 0000 0000" className="bg-black border-white/10 rounded-none py-6" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Scadenza</Label>
                  <Input placeholder="MM/AA" className="bg-black border-white/10 rounded-none py-6" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">CVV</Label>
                  <Input placeholder="123" className="bg-black border-white/10 rounded-none py-6" required />
                </div>
              </div>
            </div>
          </section>

          <div className="pt-10 border-t border-white/10">
            <div className="flex justify-between items-center mb-8">
              <span className="text-gray-500 font-black uppercase tracking-widest text-xs">Totale da pagare</span>
              <span className="text-3xl font-black italic">€{total.toFixed(2)}</span>
            </div>
            <Button 
              type="submit"
              disabled={isProcessing}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-8 text-xl font-black uppercase tracking-widest rounded-none italic"
            >
              {isProcessing ? "Elaborazione..." : "Paga Ora"}
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-2 gap-4 mt-12">
          <div className="flex items-center gap-3 text-gray-500">
            <ShieldCheck size={18} />
            <span className="text-[8px] font-black uppercase tracking-widest">Pagamento Criptato</span>
          </div>
          <div className="flex items-center gap-3 text-gray-500">
            <Truck size={18} />
            <span className="text-[8px] font-black uppercase tracking-widest">Consegna in 48h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;