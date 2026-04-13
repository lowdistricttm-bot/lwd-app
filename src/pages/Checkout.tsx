"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, MessageCircle, CheckCircle2, Loader2, CreditCard } from 'lucide-react';
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
        billing: { ...formData },
        shipping: { ...formData },
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
      showError("ERRORE DURANTE LA PRENOTAZIONE");
    } finally {
      setIsProcessing(false);
    }
  };

  const openWhatsApp = () => {
    const message = `CIAO LOW DISTRICT! HO APPENA EFFETTUATO UN ORDINE DALL'APP.\n\nNOME: ${formData.first_name.toUpperCase()} ${formData.last_name.toUpperCase()}\nTOTALE: €${total.toFixed(2)}`;
    window.open(`https://wa.me/393200290721?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 size={48} className="text-green-500 mb-8 animate-bounce" />
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">ORDINE RICEVUTO!</h1>
        <Button onClick={openWhatsApp} className="w-full bg-[#25D366] py-8 font-black uppercase italic rounded-none flex items-center justify-center gap-3">
          <MessageCircle size={24} /> PAGA SU WHATSAPP
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="px-6 py-8 flex items-center gap-4 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-2"><ChevronLeft size={24} /></button>
        <h1 className="text-2xl font-black uppercase italic">CHECKOUT</h1>
      </div>
      <div className="p-6 max-w-2xl mx-auto space-y-8">
        <div className="space-y-4">
          <Input id="first_name" placeholder="NOME" value={formData.first_name} onChange={handleInputChange} className="bg-zinc-900 border-white/5 py-6" />
          <Input id="email" placeholder="EMAIL" type="email" value={formData.email} onChange={handleInputChange} className="bg-zinc-900 border-white/5 py-6" />
          <Button onClick={finalizeOrder} disabled={isProcessing} className="w-full bg-red-600 py-8 font-black uppercase italic rounded-none">
            {isProcessing ? "INVIO..." : "CONFERMA ORDINE"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;