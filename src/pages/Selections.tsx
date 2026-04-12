"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { Clock, CheckCircle2, XCircle, ChevronRight, Loader2, Package } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useWcUserOrders } from '@/hooks/use-woocommerce';
import { format } from 'date-fns';
import { it } from 'date-fns/locale/it';

const Selections = () => {
  const { user } = useAuth();
  const { data: orders, isLoading } = useWcUserOrders(user?.id);

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      <div className="pt-24 px-6 max-w-2xl mx-auto">
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 italic">Le Mie Selezioni</h1>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-8">Monitora lo stato delle tue candidature dal sito</p>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Recupero dati dal server...</p>
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/5 rounded-3xl">
            <Package className="mx-auto text-gray-800 mb-4" size={40} />
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Nessuna candidatura trovata</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-zinc-900/50 border border-white/5 p-4 flex items-center gap-4 group cursor-pointer hover:border-white/10 transition-all">
                <div className="w-16 h-16 shrink-0 overflow-hidden bg-zinc-800 rounded-xl">
                  <img 
                    src={order.line_items[0]?.image?.src || "https://www.lowdistrict.it/wp-content/uploads/placeholder.png"} 
                    alt="" 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" 
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-black text-sm uppercase tracking-tight italic">
                      {order.line_items[0]?.name || "Evento"}
                    </h3>
                    <ChevronRight size={16} className="text-gray-600" />
                  </div>
                  <p className="text-[10px] text-gray-500 mb-3 font-bold uppercase">
                    Ordine #{order.id} • {format(new Date(order.date_created), 'dd MMM yyyy', { locale: it })}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    {order.status === 'completed' ? (
                      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-green-500 bg-green-500/10 px-2 py-1">
                        <CheckCircle2 size={12} /> Approvato
                      </div>
                    ) : order.status === 'processing' || order.status === 'pending' ? (
                      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-1">
                        <Clock size={12} /> In Revisione
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-1">
                        <XCircle size={12} /> {order.status}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Selections;