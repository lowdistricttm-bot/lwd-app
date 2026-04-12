"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, CreditCard, Truck, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { wcPost } from '@/lib/woocommerce';

const Checkout = () => {
  const { total, clearCart, cart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    address_1: '',
    city: '',
    postcode: '',
    email: '',
    phone: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const createWooOrder = async () => {
    setIsProcessing(true);
    try {
      const orderData = {
        payment_method: "bacs", // Qui andrebbe il metodo scelto (es. stripe)
        payment_method_title: "Bonifico Bancario / Carta",
        set_paid: false,
        billing: formData,
        shipping: formData,
        line_items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      };

      const response = await wcPost('/orders', orderData);
      console.log('Ordine creato:', response);
      
      setStep(3);
      showSuccess("Ordine creato con successo!");
      clearCart();
    } catch (err: any) {
      showError(err.message || "Errore durante la creazione dell'ordine");
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8 animate-bounce">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">Ordine Ricevuto!</h1>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest max-w-xs mx-auto mb-12">
          Grazie per il tuo acquisto. Riceverai a breve una mail con i dettagli della spedizione.
        </p>
        <Button 
          onClick={() => navigate('/')}
          className="bg-white text-black hover:bg-red-600 hover:text-white px-12 py-6 font-black uppercase tracking-widest rounded-none italic transition-all"
        >
          Torna alla Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="px-6 py-8 flex items-center gap-4 border-b border-white/5">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-black tracking-tighter uppercase italic">
          {step === 1 ? "Spedizione" : "Pagamento"}
        </h1>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-12">
          <div className={`h-1 flex-1 ${step >= 1 ? 'bg-red-600' : 'bg-zinc-800'}`}></div>
          <div className={`h-1 flex-1 ${step >= 2 ? 'bg-red-600' : 'bg-zinc-800'}`}></div>
        </div>

        {step === 1 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nome</Label>
                <Input id="first_name" value={formData.first_name} onChange={handleInputChange} className="bg-zinc-900 border-white/5 rounded-none py-6" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cognome</Label>
                <Input id="last_name" value={formData.last_name} onChange={handleInputChange} className="bg-zinc-900 border-white/5 rounded-none py-6" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={handleInputChange} className="bg-zinc-900 border-white/5 rounded-none py-6" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_1" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Indirizzo</Label>
              <Input id="address_1" value={formData.address_1} onChange={handleInputChange} className="bg-zinc-900 border-white/5 rounded-none py-6" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Città</Label>
                <Input id="city" value={formData.city} onChange={handleInputChange} className="bg-zinc-900 border-white/5 rounded-none py-6" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postcode" className="text-[10px] font-black uppercase tracking-widest text-gray-500">CAP</Label>
                <Input id="postcode" value={formData.postcode} onChange={handleInputChange} className="bg-zinc-900 border-white/5 rounded-none py-6" />
              </div>
            </div>
            <Button 
              onClick={() => setStep(2)}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-8 text-lg font-black uppercase tracking-widest rounded-none italic"
            >
              Continua al Pagamento
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-zinc-900 p-6 border border-white/5 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <CreditCard className="text-red-600" />
                  <span className="text-sm font-bold uppercase tracking-widest">Carta di Credito</span>
                </div>
              </div>
              <div className="space-y-4">
                <Input placeholder="Numero Carta" className="bg-black border-white/10 rounded-none py-6" />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="MM/AA" className="bg-black border-white/10 rounded-none py-6" />
                  <Input placeholder="CVV" className="bg-black border-white/10 rounded-none py-6" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <div className="flex justify-between items-center mb-8">
                <span className="text-gray-400 font-black uppercase tracking-widest text-sm">Totale da pagare</span>
                <span className="text-3xl font-black italic">€{total.toFixed(2)}</span>
              </div>
              
              <Button 
                onClick={createWooOrder}
                disabled={isProcessing}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-8 text-xl font-black uppercase tracking-widest rounded-none italic shadow-2xl shadow-red-600/20"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Elaborazione...</span>
                ) : "Conferma e Paga"}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-12 flex items-center justify-center gap-8 opacity-30">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span className="text-[8px] font-black uppercase tracking-widest">Secure SSL</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck size={16} />
            <span className="text-[8px] font-black uppercase tracking-widest">Official Shipping</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;