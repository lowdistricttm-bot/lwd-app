"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, MessageCircle, Truck, ShieldCheck, CheckCircle2, Loader2, Phone, CreditCard } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { wcPost } from '@/lib/woocommerce';
import { useAuth } from '@/hooks/use-auth';

const Checkout = () => {
  const { total, clearCart, cart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    address_1: '',
    city: '',
    postcode: '',
    email: user?.email || '',
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
        customer_id: user?.id || 0,
        payment_method: "cod", 
        payment_method_title: "WhatsApp / Contatto Diretto",
        set_paid: false,
        billing: {
          ...formData,
        },
        shipping: {
          ...formData
        },
        line_items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        customer_note: "ORDINE EFFETTUATO TRAMITE APP LOW DISTRICT"
      };

      await wcPost('/orders', orderData);
      
      setStep(3);
      showSuccess("ORDINE INVIATO CON SUCCESSO!");
      clearCart();
    } catch (err: any) {
      showError(err.message?.toUpperCase() || "ERRORE DURANTE LA PRENOTAZIONE");
    } finally {
      setIsProcessing(false);
    }
  };

  const openWhatsApp = () => {
    const message = `CIAO LOW DISTRICT! HO APPENA EFFETTUATO UN ORDINE DALL'APP.\n\nNOME: ${formData.first_name.toUpperCase()} ${formData.last_name.toUpperCase()}\nTOTALE: €${total.toFixed(2)}\n\nVORREI PROCEDERE CON IL PAGAMENTO.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/393200290721?text=${encodedMessage}`, '_blank');
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8 animate-bounce">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">ORDINE RICEVUTO!</h1>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest max-w-xs mx-auto mb-12">
          IL TUO ORDINE È STATO SINCRONIZZATO. CLICCA QUI SOTTO PER FINALIZZARE IL PAGAMENTO SU WHATSAPP.
        </p>
        
        <div className="space-y-4 w-full max-w-xs">
          <Button 
            onClick={openWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-8 font-black uppercase tracking-widest rounded-none italic flex items-center justify-center gap-3"
          >
            <MessageCircle size={24} /> PAGA SU WHATSAPP
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full border-white/10 text-gray-500 hover:text-white py-6 font-black uppercase tracking-widest rounded-none italic"
          >
            TORNA ALLA HOME
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
          {step === 1 ? "SPEDIZIONE" : "RIEPILOGO"}
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
                <Label htmlFor="first_name" className="text-[10px] font-black uppercase tracking-widest text-gray-500">NOME</Label>
                <Input id="first_name" value={formData.first_name} onChange={handleInputChange} className="bg-zinc-900 border-white/5 rounded-none py-6 focus:ring-red-600" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-[10px] font-black uppercase tracking-widest text-gray-500">COGNOME</Label>
                <Input id="last_name" value={formData.last_name} onChange={handleInputChange} className="bg-zinc-900 border-white/5 rounded-none py-6 focus:ring-red-600" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-gray-500">EMAIL</Label>
              <Input id="email" type="email" value={formData.email} onChange={handleInputChange} className="bg-zinc-900 border-white/5 rounded-none py-6 focus:ring-red-600" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-gray-500">TELEFONO / WHATSAPP</Label>
              <Input id="phone" type="tel" value={formData.phone} onChange={handleInputChange} className="bg-zinc-900 border-white/5 rounded-none py-6 focus:ring-red-600" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_1" className="text-[10px] font-black uppercase tracking-widest text-gray-500">INDIRIZZO E NUMERO CIVICO</Label>
              <Input id="address_1" value={formData.address_1} onChange={handleInputChange} className="bg-zinc-900 border-white/5 rounded-none py-6 focus:ring-red-600" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-[10px] font-black uppercase tracking-widest text-gray-500">CITTÀ</Label>
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
              CONTINUA AL RIEPILOGO
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-zinc-900 p-6 border border-white/5 space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-600/10 rounded-full">
                  <CreditCard className="text-red-600" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest">RIEPILOGO ORDINE</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">SINCRONIZZATO CON LOWDISTRICT.IT</p>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-white/5">
                {cart.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-gray-400 font-bold uppercase">{item.quantity}X {item.name.toUpperCase()} {item.size ? `(${item.size})` : ''}</span>
                    <span className="text-white font-black">€{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <div className="flex justify-between items-center mb-8">
                <span className="text-gray-400 font-black uppercase tracking-widest text-sm">TOTALE FINALE</span>
                <span className="text-3xl font-black italic">€{total.toFixed(2)}</span>
              </div>
              
              <Button 
                onClick={finalizeOrder}
                disabled={isProcessing}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-8 text-xl font-black uppercase tracking-widest rounded-none italic shadow-2xl shadow-red-600/20"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> SINCRONIZZAZIONE...</span>
                ) : "CONFERMA E CREA ORDINE"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;