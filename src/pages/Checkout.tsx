"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ShoppingBag, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useWcCreateOrder, useWcShippingMethods } from '@/hooks/use-woocommerce';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const Checkout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { items, total, clearCart } = useCart();
  const createOrder = useWcCreateOrder();
  const { data: shippingMethods, isLoading: loadingShipping } = useWcShippingMethods();
  
  const [isFinished, setIsFinished] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userWpId, setUserWpId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', address: '', city: '', postcode: '',
  });

  const shippingInfo = useMemo(() => {
    if (!shippingMethods) return { fee: 10, title: 'Spedizione Standard' };

    const freeShipping = shippingMethods.find((m: any) => m.method_id === 'free_shipping' && m.enabled);
    const flatRate = shippingMethods.find((m: any) => m.method_id === 'flat_rate' && m.enabled);

    if (freeShipping) {
      const minAmount = parseFloat(freeShipping.settings?.min_amount?.value || '0');
      if (total >= minAmount) {
        return { fee: 0, title: freeShipping.title || 'Spedizione Gratuita' };
      }
    }

    if (flatRate) {
      const cost = parseFloat(flatRate.settings?.cost?.value || '10');
      return { fee: cost, title: flatRate.title || 'Tariffa Fissa' };
    }

    return { fee: 10, title: 'Spedizione Standard' };
  }, [shippingMethods, total]);

  const finalTotal = total + shippingInfo.fee;

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setFormData(prev => ({
          ...prev,
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
          email: user.email || ''
        }));

        // Recuperiamo il wp_id dal profilo per collegare l'ordine
        const { data: profile } = await supabase
          .from('profiles')
          .select('wp_id')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile?.wp_id) {
          setUserWpId(profile.wp_id);
        }
      }
    };
    loadUserData();
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const lineItems = items.map(item => ({
        product_id: item.id,
        variation_id: item.variationId,
        quantity: item.quantity
      }));

      const orderPayload = {
        payment_method: "cod",
        payment_method_title: "Pagamento su WhatsApp",
        set_paid: false,
        customer_id: userWpId ? parseInt(userWpId) : 0, // Collega l'ordine all'account corretto
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
        shipping_lines: [
          {
            method_id: shippingInfo.fee === 0 ? "free_shipping" : "flat_rate",
            method_title: shippingInfo.title,
            total: shippingInfo.fee.toString()
          }
        ],
        meta_data: [
          { key: '_supabase_user_id', value: user?.id || '' },
          { key: '_created_via', value: 'Low District App' }
        ]
      };

      const order = await createOrder.mutateAsync(orderPayload);
      setOrderId(order.id);
      setIsFinished(true);
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['wc-orders'] });
      showSuccess("Ordine creato con successo!");
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleWhatsAppGarage = () => {
    const message = `Ciao Low District! Ho appena effettuato l'ordine #${orderId}. Vorrei procedere con il pagamento.`;
    const whatsappUrl = `https://wa.me/393200290721?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-transparent text-white flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center max-w-2xl mx-auto w-full"
          >
            <div className="w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center mb-8 shadow-2xl">
              <CheckCircle2 size={48} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">Ordine Ricevuto</h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-12 italic leading-relaxed">
              Il tuo ordine #{orderId} è stato registrato nel District. <br />
              Riceverai una mail di conferma a breve.
            </p>
            <div className="w-full space-y-4">
              <Button onClick={handleWhatsAppGarage} className="w-full bg-[#25D366]/90 backdrop-blur-md hover:bg-[#128C7E] hover:scale-[1.05] active:scale-[0.98] text-white py-8 text-lg font-black uppercase italic tracking-widest rounded-full transition-all shadow-lg shadow-[#25D366]/10 border-none">
                <WhatsAppIcon className="mr-3 w-6 h-6" /> Paga su WhatsApp
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full border-white/10 text-zinc-500 hover:bg-white/5 hover:text-white py-8 text-[10px] font-black uppercase tracking-widest rounded-full italic transition-all">
                Torna alla Home <ArrowRight className="ml-2" size={16} />
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col">
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top)+2rem)] pb-32 px-6 max-w-7xl mx-auto w-full">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 uppercase text-[9px] font-black tracking-widest transition-colors">
          <ChevronLeft size={14} /> Torna al Carrello
        </button>
        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-12">Checkout</h1>
        
        {loadingShipping ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-zinc-500" size={40} />
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Sincronizzazione tariffe...</p>
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-8 space-y-6 rounded-[2.5rem] shadow-2xl">
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Dati di Spedizione</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[8px] font-black uppercase text-zinc-600 ml-4">Nome *</Label>
                    <Input required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="bg-black/40 border-white/5 rounded-full h-12 px-6 text-xs font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[8px] font-black uppercase text-zinc-600 ml-4">Cognome *</Label>
                    <Input required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="bg-black/40 border-white/5 rounded-full h-12 px-6 text-xs font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[8px] font-black uppercase text-zinc-600 ml-4">Email *</Label>
                  <Input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-black/40 border-white/5 rounded-full h-12 px-6 text-xs font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[8px] font-black uppercase text-zinc-600 ml-4">Telefono *</Label>
                  <Input required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="bg-black/40 border-white/5 rounded-full h-12 px-6 text-xs font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[8px] font-black uppercase text-zinc-600 ml-4">Indirizzo *</Label>
                  <Input required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="bg-black/40 border-white/5 rounded-full h-12 px-6 text-xs font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[8px] font-black uppercase text-zinc-600 ml-4">Città *</Label>
                    <Input required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="bg-black/40 border-white/5 rounded-full h-12 px-6 text-xs font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[8px] font-black uppercase text-zinc-600 ml-4">CAP *</Label>
                    <Input required value={formData.postcode} onChange={(e) => setFormData({...formData, postcode: e.target.value})} className="bg-black/40 border-white/5 rounded-full h-12 px-6 text-xs font-bold" />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 italic mb-8">Riepilogo Ordine</h3>
                <div className="space-y-5 mb-8">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.variationId}`} className="flex justify-between text-xs">
                      <span className="text-zinc-400 font-bold uppercase tracking-widest">{item.name} x{item.quantity}</span>
                      <span className="font-black italic">{(item.price * item.quantity).toFixed(2)} €</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs border-t border-white/5 pt-5">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest">{shippingInfo.title}</span>
                    <span className="font-black italic">{shippingInfo.fee === 0 ? "GRATIS" : `${shippingInfo.fee.toFixed(2)} €`}</span>
                  </div>
                </div>
                <div className="border-t border-white/5 pt-6 flex justify-between items-end">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Totale</span>
                  <span className="text-3xl font-black italic tracking-tighter">{finalTotal.toFixed(2)} €</span>
                </div>
              </div>
              <Button type="submit" disabled={createOrder.isPending} className="w-full bg-white text-black hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] py-8 text-sm font-black uppercase italic tracking-widest rounded-full transition-all duration-500 shadow-2xl border-none">
                {createOrder.isPending ? <Loader2 className="animate-spin" /> : "Conferma Ordine"}
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default Checkout;