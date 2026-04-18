"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, MapPin, CreditCard, Truck, ExternalLink, ShoppingBag, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

const OrderDetailModal = ({ isOpen, onClose, order }: OrderDetailModalProps) => {
  // Scroll Lock Logic
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  if (!order) return null;

  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      'pending': 'In attesa di pagamento',
      'processing': 'In lavorazione',
      'on-hold': 'In sospeso',
      'completed': 'Completato',
      'cancelled': 'Annullato',
      'refunded': 'Rimborsato',
      'failed': 'Fallito'
    };
    return (map[status] || status).toUpperCase();
  };

  const getTracking = () => {
    const meta = order.meta_data || [];
    const official = meta.find((m: any) => m.key === '_wc_shipment_tracking_items');
    if (official?.value?.[0]) return { number: official.value[0].tracking_number, url: official.value[0].custom_tracking_link || official.value[0].tracking_link };
    
    const yithCode = meta.find((m: any) => m.key === '_ywto_tracking_code' || m.key === 'ywto_tracking_code')?.value;
    const yithUrl = meta.find((m: any) => m.key === '_ywto_tracking_url' || m.key === 'ywto_tracking_url')?.value;
    if (yithCode) return { number: yithCode, url: yithUrl };

    return null;
  };

  const tracking = getTracking();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200]" 
          />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[201] bg-zinc-950 border-t border-white/10 p-6 pb-12 rounded-t-[2.5rem] max-h-[90vh] overflow-y-auto custom-scrollbar"
            style={{ touchAction: 'pan-y' }}
          >
            <div className="max-w-2xl mx-auto space-y-8">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-white text-black text-[10px] font-black uppercase px-2 py-1 italic rounded-lg">ORDINE #{order.id}</span>
                    <span className={cn(
                      "text-[10px] font-black uppercase px-2 py-1 italic rounded-lg text-white",
                      order.status === 'completed' && "bg-green-600",
                      order.status === 'pending' && "bg-blue-600",
                      order.status === 'on-hold' && "bg-orange-500",
                      !['completed', 'pending', 'on-hold'].includes(order.status) && "bg-zinc-800"
                    )}>
                      {translateStatus(order.status)}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Dettagli Ordine</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1 flex items-center gap-2">
                    <Calendar size={12} /> {new Date(order.date_created).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white bg-white/5 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Tracking Section (if available) */}
              {tracking && (
                <div className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                      <Truck size={20} />
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">Spedizione Tracciata</p>
                      <p className="text-xs font-black uppercase italic text-white">{tracking.number}</p>
                    </div>
                  </div>
                  {tracking.url && (
                    <a href={tracking.url} target="_blank" rel="noopener noreferrer" className="bg-white text-black px-5 py-2 rounded-full text-[9px] font-black uppercase italic flex items-center gap-2 hover:bg-zinc-200 transition-all">
                      Traccia <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              )}

              {/* Items List */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 flex items-center gap-2">
                  <Package size={12} /> Prodotti Acquistati
                </h4>
                <div className="bg-white/5 border border-white/5 rounded-[2rem] overflow-hidden">
                  {order.line_items.map((item: any, idx: number) => (
                    <div key={idx} className={cn("p-5 flex gap-4", idx !== order.line_items.length - 1 && "border-b border-white/5")}>
                      <div className="w-16 h-20 bg-black/40 rounded-xl overflow-hidden shrink-0 border border-white/5">
                        {item.image?.src ? (
                          <img src={item.image.src} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-800"><ShoppingBag size={20} /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h5 className="text-sm font-black uppercase italic truncate" dangerouslySetInnerHTML={{ __html: item.name }} />
                        <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Quantità: {item.quantity}</p>
                        <p className="text-xs font-black italic mt-2">{item.total} €</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 flex items-center gap-2">
                    <MapPin size={12} /> Indirizzo Spedizione
                  </h4>
                  <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] text-xs text-zinc-300 leading-relaxed italic">
                    <p className="font-black text-white mb-1 uppercase">{order.shipping.first_name} {order.shipping.last_name}</p>
                    <p>{order.shipping.address_1}</p>
                    <p>{order.shipping.postcode} {order.shipping.city} ({order.shipping.state})</p>
                    <p className="mt-3 text-zinc-500 font-bold uppercase tracking-widest">{order.billing.phone}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 flex items-center gap-2">
                    <CreditCard size={12} /> Riepilogo Pagamento
                  </h4>
                  <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-500">
                      <span>Subtotale</span>
                      <span className="text-zinc-300">{order.total - order.shipping_total} €</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-500">
                      <span>Spedizione</span>
                      <span className="text-zinc-300">{order.shipping_total} €</span>
                    </div>
                    <div className="pt-3 border-t border-white/5 flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase text-white">Totale</span>
                      <span className="text-2xl font-black italic text-white">{order.total} €</span>
                    </div>
                    <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest pt-2 text-right italic">
                      Metodo: {order.payment_method_title}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OrderDetailModal;