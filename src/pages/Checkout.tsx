"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, CreditCard, Truck, ShieldCheck, AlertCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const Checkout = () => {
  const { total, clearCart, cart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // NOTA PER L'UTENTE: 
    // Per ricevere soldi reali, qui dobbiamo chiamare l'API di Stripe.
    // Esempio: const { error } = await stripe.confirmPayment(...);
    
    try {
      // Simuliamo una chiamata al server per creare l'ordine
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showSuccess("Pagamento ricevuto! Riceverai una mail di conferma.");
      clearCart();
      navigate('/profile');
    } catch (err) {
      showError("Errore durante il pagamento. Riprova.");
    } finally {
      setIsProcessing(false);
    }
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
        <div className="mb-8 p-4 bg-red-600/10 border border-red-600/20 rounded-xl flex gap-3">
          <AlertCircle className="text-red-600 shrink-0" size={20} />
          <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
            Modalità Demo: Per attivare i pagamenti reali è necessario collegare un account Stripe o PayPal.
          </p>
        </div>

        <form onSubmit={handlePayment} className="space-y-10">
          {/* Sezione Spedizione */}
          <section className="space-y-6">
            <h2 className="text-xs font-black text-red-600 uppercase tracking-[0.3em]">1. Spedizione</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nome</Label>
                <Input className="bg-zinc-900 border-white/5 rounded-none py-6 focus:ring-red-600" required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cognome</Label>
                <Input className="bg-zinc-900 border-white/5 rounded-none py-6 focus:ring-red-600" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Indirizzo</Label>
              <Input className="bg-zinc-900 border-white/5 rounded-none py-6 focus:ring-red-600" required />
            </div>
          </section>

          {/* Sezione Pagamento */}
          <section className="space-y-6">
            <h2 className="text-xs font-black text-red-600 uppercase tracking-[0.3em]">2. Pagamento</h2>
            <div className="bg-zinc-900 p-6 border border-white/5 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <CreditCard className="text-gray-500" />
                  <span className="text-sm font-bold uppercase tracking-widest">Carta di Credito</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-5 bg-white/10 rounded"></div>
                  <div className="w-8 h-5 bg-white/10 rounded"></div>
                </div>
              </div>
              
              {/* Qui andrà lo Stripe Card Element */}
              <div className="space-y-4">
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
            </div>
          </section>

          {/* Riepilogo e Bottone */}
          <div className="pt-10 border-t border-white/10">
            <div className="space-y-2 mb-8">
              <div className="flex justify-between text-xs text-gray-500 font-bold uppercase tracking-widest">
                <span>Subtotale</span>
                <span>€{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 font-bold uppercase tracking-widest">
                <span>Spedizione</span>
                <span className="text-green-500">Gratis</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-gray-400 font-black uppercase tracking-widest text-sm">Totale</span>
                <span className="text-3xl font-black italic">€{total.toFixed(2)}</span>
              </div>
            </div>
            
            <Button 
              type="submit"
              disabled={isProcessing}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-8 text-xl font-black uppercase tracking-widest rounded-none italic shadow-2xl shadow-red-600/20"
            >
              {isProcessing ? "Elaborazione..." : "Conferma Ordine"}
            </Button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-8 mt-12 opacity-50">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span className="text-[8px] font-black uppercase tracking-widest">Secure SSL</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck size={16} />
            <span className="text-[8px] font-black uppercase tracking-widest">Fast Delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;