"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, ChevronLeft, ShoppingBag, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useWcCreateOrder } from '@/hooks/use-woocommerce';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const createOrder = useWcCreateOrder();
  
  const [isFinished, setIsFinished] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postcode: '',
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        setFormData(prev => ({
          ...prev,
          email: user.email || '',
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
        }));
      }
    });
  }, []);

  if (items.length === 0 && !isFinished) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <ShoppingBag size={64} className="text-zinc-800 mb-6" />
        <h1 className="text-2xl font-black uppercase italic mb-4">Il carrello è vuoto</h1>
        <Button onClick={() => navigate('/shop')} className="bg-zinc-800 text-white rounded-none font-black uppercase italic px-8">Torna allo Shop</Button>
      </div>
    );
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const lineItems = items.map(item => ({
      product_id: item.id,
      variation_id: item.variationId,
      quantity: item.quantity
    }));

    const orderPayload = {
      payment_method: "cod",
      payment_method_title: "Pagamento alla Consegna / WhatsApp",
      set_paid: false,
      billing: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        address_1: formData.address,
        city: formData.city,
        postcode: formData.postcode,
        country: "IT",
        email: formData.email,
        phone: formData.phone
      },
      shipping: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        address_1: formData.address,
        city: formData.city,
        postcode: formData.postcode,
        country: "IT"
      },
      line_items: lineItems,
      customer_id: 0 // WooCommerce gestirà l'associazione tramite email se esistente
    };

    try {
      const order = await createOrder.mutateAsync(orderPayload);
      setOrderId(order.id);
      setIsFinished(true);
      clearCart();
      showSuccess("Ordine creato con successo!");
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleWhatsAppGarage = () => {
    const message = `Ciao Low District! Ho appena effettuato l'ordine #${orderId}. Vorrei parlare con il Garage per i dettagli.`;
    const whatsappUrl = `https://wa.me/393200290721?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-2xl mx-auto">
          <CheckCircle2 size={80} className="text-white mb-8" />
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">Ordine Ricevuto</h1>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-12">
            Il tuo ordine #{orderId} è stato registrato nel District. <br />
            Riceverai una mail di conferma a breve.
          </p>

          <div className="w-full space-y-4">
            <Button 
              onClick={handleWhatsAppGarage}
              className="w-full bg-white text-black hover:bg-zinc-200 py-8 text-lg font-black uppercase tracking-widest rounded-none italic"
            >
              <MessageSquare className="mr-2" size={20} /> Garage su WhatsApp
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full border-white/10 text-zinc-500 hover:text-white py-8 text-sm font-black uppercase tracking-widest rounded-none italic"
            >
              Torna alla Home <ArrowRight className="ml-2" size={16} />
            </Button>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-32 px-6 max-w-4xl mx-auto w-full">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 uppercase text-[10px] font-black tracking-widest">
          <ChevronLeft size={16} /> Torna al Carrello
        </button>

        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-12">Checkout</h1>

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-zinc-900/50 border border-white/5 p-8 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 italic">Dati di Spedizione</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500">Nome *</Label>
                  <Input 
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="bg-transparent border-zinc-800 rounded-none h-12" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500">Cognome *</Label>
                  <Input 
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="bg-transparent border-zinc-800 rounded-none h-12" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-zinc-500">Email *</Label>
                <Input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-transparent border-zinc-800 rounded-none h-12" 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-zinc-500">Telefono *</Label>
                <Input 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="bg-transparent border-zinc-800 rounded-none h-12" 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-zinc-500">Indirizzo *</Label>
                <Input 
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="bg-transparent border-zinc-800 rounded-none h-12" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500">Città *</Label>
                  <Input 
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="bg-transparent border-zinc-800 rounded-none h-12" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500">CAP *</Label>
                  <Input 
                    required
                    value={formData.postcode}
                    onChange={(e) => setFormData({...formData, postcode: e.target.value})}
                    className="bg-transparent border-zinc-800 rounded-none h-12" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-zinc-900/50 border border-white/5 p-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 italic mb-6">Riepilogo Ordine</h3>
              <div className="space-y-4 mb-8">
                {items.map((item) => (
                  <div key={`${item.id}-${item.variationId}`} className="flex justify-between text-sm">
                    <span className="text-zinc-400">{item.name} x{item.quantity}</span>
                    <span className="font-black">€{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/5 pt-6 flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Totale</span>
                <span className="text-3xl font-black italic tracking-tighter">€{total.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              type="submit"
              disabled={createOrder.isPending}
              className="w-full bg-white text-black hover:bg-zinc-200 py-8 text-lg font-black uppercase italic tracking-widest rounded-none"
            >
              {createOrder.isPending ? <Loader2 className="animate-spin" /> : "Conferma Ordine"}
            </Button>
            <p className="text-[9px] text-zinc-500 text-center uppercase font-bold tracking-widest">
              L'ordine verrà inviato direttamente al sistema ufficiale Low District.
            </p>
          </div>
        </form>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Checkout;