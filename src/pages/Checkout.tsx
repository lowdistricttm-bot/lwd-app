"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, MessageCircle, Truck, ShieldCheck, CheckCircle2, Loader2, Phone } from 'lucide-react';
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
    phone: '',
    country: 'IT',
    state: 'MI'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const finalizeOrder = async () => {
    setIsProcessing(true);
    try {
      const orderData = {
        payment_method: "cod", 
        payment_method_title: "WhatsApp / Contatto Diretto",
        set_paid: false,
        billing: {
          ...formData,
          email: formData.email,
          phone: formData.phone
        },
        shipping: {
          ...formData
        },
        line_items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        customer_note: "Ordine effettuato tramite App - Finalizzazione via WhatsApp"
      };

      const response = await wcPost('/orders', orderData);
      console.log('Order created:', response);
      
      setStep(3);
      showSuccess("Ordine inviato con successo!");
      clearCart();
    } catch (err: any) {
      console.error('Checkout Error:', err);
      showError(err.message || "Errore durante la prenotazione. Riprova.");
    } finally {
      setIsProcessing(false);
    }
  };

  const openWhatsApp = () => {
    const message = `Ciao Low District! Ho appena effettuato un ordine dall'App.\n\nNome: ${formData.first_name} ${formData.last_name}\nTotale: €${total.toFixed(2)}\n\nVorrei procedere con il pagamento.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/393200290721?text=${encodedMessage}`, '_blank');
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8 animate-bounce">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">Ordine Ricevuto!</h1>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest max-w-xs mx-auto mb-12">
          Il tuo ordine è stato ricevuto correttamente. Clicca qui sotto per finalizzare il pagamento su WhatsApp.
        </p>
        
        <div className="space-y-4 w-full max-w-xs">
          <Button 
            onClick={openWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-8 font-black uppercase tracking-widest rounded-none italic flex items-center justify-center gap-3"
          >
            <MessageCircle size={24} /> Paga su WhatsApp
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full border-white/10 text-gray-500 hover:text-white py-6 font-black uppercase tracking-widest rounded-none italic"
          >
            Torna alla Home
          </Button>
        </div>
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
          {step === 1 ? "Spedizione" : "Riepilogo"}
        </h1>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex gap-2 mb-12">
          <div className={`h-1 flex-1 ${step >= 1 ? 'bg-red-600' : 'bg-zinc-800'}`}></div>
          <div className={`h-1 flex-1 ${step >= 2 ? 'bg-red-600' : 'bg-zinc-800'}`}></div>
        </div>

        {step === 1 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nome</Label>
                <Input id="first_name" value={formData.first_name} onChange={handleInputChange} className="bg-zinc-900 border-white/5 rounded-none py-6 focus:ring-red-600" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cognome</Label>
                <Input id="last_name" value={formData.last_name} onChange={handleInputChange} className="bg-zinc-900 border-white/5 rounded-none py-6 focus:ring-red-600" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={handleInputChange} className="bg-zinc-900 border-white/5 rounded-none py-6 focus:ring-red-600" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Telefono / WhatsApp</Label>
              <Input id="phone" type="tel" value={formData.phone} onChange={handleInputChange} className="bg-zinc-900 border-white/5 rounded-none py-6 focus:ring-red-600" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_1" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Indirizzo e Numero Civico</Label>
              <Input id="address_1" value={formData.address_1} onChange={handleInputChange} className="bg-zinc-900 border-white/5 rounded-none py-6 focus:ring-red-600" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Città</Label>
                <Input id="city" value={formData.city} onChange={handleInputChange} className="bg-zinc-900 border-white/5 rounded-none py-6 focus:ring-red-600" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postcode" className="text-[10px] font-black uppercase tracking-widest text-gray-500">CAP</Label>
                <Input id="postcode" value={formData.postcode} onChange={handleInputChange} className="bg-zinc-900 border-white/5 rounded-none py-6 focus:ring-red-600" required />
              </div>
            </div>
            <Button 
              onClick={() => setStep(2)}
              disabled={!formData.email || !formData.first_name || !formData.address_1}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-8 text-lg font-black uppercase tracking-widest rounded-none italic"
            >
              Continua al Riepilogo
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-zinc-900 p-6 border border-white/5 space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-600/10 rounded-full">
                  <Phone className="text-red-600" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest">Finalizzazione Ordine</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">L'ordine verrà creato direttamente sul sito web</p>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-bold uppercase tracking-widest">Spedizione a:</span>
                  <span className="text-white font-black uppercase tracking-tighter">{formData.first_name} {formData.last_name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-bold uppercase tracking-widest">Indirizzo:</span>
                  <span className="text-white font-black uppercase tracking-tighter text-right">{formData.address_1}, {formData.city}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <div className="flex justify-between items-center mb-8">
                <span className="text-gray-400 font-black uppercase tracking-widest text-sm">Totale Ordine</span>
                <span className="text-3xl font-black italic">€{total.toFixed(2)}</span>
              </div>
              
              <Button 
                onClick={finalizeOrder}
                disabled={isProcessing}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-8 text-xl font-black uppercase tracking-widest rounded-none italic shadow-2xl shadow-red-600/20"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Invio in corso...</span>
                ) : "Conferma e Invia Ordine"}
              </Button>
              
              <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest text-center mt-6 leading-relaxed">
                Cliccando su conferma, il tuo ordine verrà creato nel database del sito web. <br />
                Potrai poi procedere al pagamento tramite WhatsApp.
              </p>
            </div>
          </div>
        )}

        <div className="mt-12 flex items-center justify-center gap-8 opacity-30">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span className="text-[8px] font-black uppercase tracking-widest">Official Store</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck size={16} />
            <span className="text-[8px] font-black uppercase tracking-widest">Fast Shipping</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;