"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, ChevronLeft, ShoppingBag } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
  });

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <ShoppingBag size={64} className="text-zinc-800 mb-6" />
        <h1 className="text-2xl font-black uppercase italic mb-4">Il carrello è vuoto</h1>
        <Button onClick={() => navigate('/shop')} className="bg-zinc-800 text-white rounded-none font-black uppercase italic px-8">Torna allo Shop</Button>
      </div>
    );
  }

  const handleWhatsAppCheckout = () => {
    const orderDetails = items.map(item => 
      `- ${item.name} ${item.size ? `(Taglia: ${item.size})` : ''} x${item.quantity} - €${(item.price * item.quantity).toFixed(2)}`
    ).join('%0A');

    const message = `Ciao Low District! Vorrei completare questo ordine:%0A%0A*Prodotti:*%0A${orderDetails}%0A%0A*Totale:* €${total.toFixed(2)}%0A%0A*Dati Spedizione:*%0A${formData.firstName} ${formData.lastName}%0A${formData.address}, ${formData.city}%0ATel: ${formData.phone}`;
    
    const whatsappUrl = `https://wa.me/393515551234?text=${message}`; // Sostituire con il numero reale
    
    window.open(whatsappUrl, '_blank');
    clearCart();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-32 px-6 max-w-4xl mx-auto w-full">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 uppercase text-[10px] font-black tracking-widest">
          <ChevronLeft size={16} /> Torna al Carrello
        </button>

        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-12">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-zinc-900/50 border border-white/5 p-8 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 italic">Dati di Spedizione</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500">Nome</Label>
                  <Input 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="bg-transparent border-zinc-800 rounded-none h-12" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500">Cognome</Label>
                  <Input 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="bg-transparent border-zinc-800 rounded-none h-12" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-zinc-500">Telefono</Label>
                <Input 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="bg-transparent border-zinc-800 rounded-none h-12" 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-zinc-500">Indirizzo</Label>
                <Input 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="bg-transparent border-zinc-800 rounded-none h-12" 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-zinc-500">Città</Label>
                <Input 
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="bg-transparent border-zinc-800 rounded-none h-12" 
                />
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
              onClick={handleWhatsAppCheckout}
              disabled={!formData.firstName || !formData.phone}
              className="w-full bg-zinc-800 hover:bg-white hover:text-black text-white py-8 text-lg font-black uppercase tracking-widest rounded-none italic"
            >
              <MessageSquare className="mr-2" size={20} /> Paga su WhatsApp
            </Button>
            <p className="text-[9px] text-zinc-500 text-center uppercase font-bold tracking-widest">
              Verrai reindirizzato a WhatsApp per confermare l'ordine e ricevere i dati per il pagamento.
            </p>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Checkout;