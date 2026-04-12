"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import EventApplicationDialog from '@/components/EventApplicationDialog';
import { Calendar, MapPin, Loader2 } from 'lucide-react';
import { useWcEvents } from '@/hooks/use-woocommerce';

const Events = () => {
  const { data: events, isLoading } = useWcEvents();

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-12 italic">Eventi Ufficiali</h1>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sincronizzazione eventi...</p>
          </div>
        ) : events?.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/5">
            <p className="text-gray-500 font-black uppercase tracking-widest">Nessun evento in programma</p>
          </div>
        ) : (
          <div className="space-y-8">
            {events?.map((event: any) => (
              <div key={event.id} className="flex flex-col md:flex-row gap-8 p-6 bg-zinc-900/50 border border-white/5 hover:border-red-600/50 transition-colors">
                <div className="w-full md:w-72 h-48 overflow-hidden bg-zinc-800">
                  <img src={event.images[0]?.src} alt={event.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-red-600 text-xs font-black uppercase tracking-widest">
                        {event.stock_status === 'instock' ? 'Iscrizioni Aperte' : 'Sold Out'}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black uppercase italic mb-4" dangerouslySetInnerHTML={{ __html: event.name }} />
                    <div className="space-y-2 mb-6">
                      <p className="flex items-center gap-2 text-gray-400 text-sm font-bold uppercase tracking-tight">
                        <MapPin size={16} className="text-red-600" /> {event.attributes?.find((a: any) => a.name === 'Location')?.options[0] || 'TBA'}
                      </p>
                    </div>
                  </div>
                  
                  {event.stock_status === 'instock' ? (
                    <EventApplicationDialog eventTitle={event.name} />
                  ) : (
                    <button disabled className="w-full md:w-max bg-zinc-800 text-gray-500 px-8 py-3 font-bold uppercase tracking-widest cursor-not-allowed">
                      Chiuso
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Events;