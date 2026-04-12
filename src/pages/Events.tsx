"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import EventApplicationDialog from '@/components/EventApplicationDialog';
import ApprovedParticipants from '@/components/ApprovedParticipants';
import { Calendar, MapPin, Loader2, Info } from 'lucide-react';
import { useWcEvents } from '@/hooks/use-woocommerce';

const Events = () => {
  const { data: events, isLoading } = useWcEvents();

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">Eventi Ufficiali</h1>
          <p className="text-gray-500 text-xs font-black uppercase tracking-[0.3em] mt-2">The Stance Selection Process</p>
        </div>
        
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
          <div className="space-y-12">
            {events?.map((event: any) => (
              <div key={event.id} className="group">
                <div className="flex flex-col md:flex-row gap-8 p-8 bg-zinc-900/30 border border-white/5 hover:border-red-600/30 transition-all duration-500 relative overflow-hidden">
                  {/* Background Accent */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-red-600/10 transition-all"></div>
                  
                  <div className="w-full md:w-96 h-64 overflow-hidden bg-zinc-800 relative z-10">
                    <img src={event.images[0]?.src} alt={event.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between relative z-10">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-red-600 text-white text-[8px] font-black uppercase px-2 py-1 tracking-widest italic">
                          {event.stock_status === 'instock' ? 'Iscrizioni Aperte' : 'Sold Out'}
                        </span>
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">ID: #{event.id}</span>
                      </div>
                      
                      <h2 className="text-3xl md:text-4xl font-black uppercase italic mb-6 leading-none" dangerouslySetInnerHTML={{ __html: event.name }} />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="flex items-center gap-3 text-gray-400">
                          <div className="p-2 bg-white/5 rounded-lg"><MapPin size={18} className="text-red-600" /></div>
                          <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-600">Location</p>
                            <p className="text-xs font-bold uppercase">{event.attributes?.find((a: any) => a.name === 'Location')?.options[0] || 'TBA'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400">
                          <div className="p-2 bg-white/5 rounded-lg"><Calendar size={18} className="text-red-600" /></div>
                          <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-600">Data</p>
                            <p className="text-xs font-bold uppercase">Prossimamente</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      {event.stock_status === 'instock' ? (
                        <EventApplicationDialog eventTitle={event.name} />
                      ) : (
                        <button disabled className="w-full md:w-max bg-zinc-800 text-gray-500 px-8 py-4 font-black uppercase tracking-widest cursor-not-allowed italic">
                          Iscrizioni Chiuse
                        </button>
                      )}
                      <button className="flex items-center justify-center gap-2 px-6 py-4 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all italic">
                        <Info size={14} /> Info Regolamento
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Sezione Partecipanti Approvati per questo evento */}
                <ApprovedParticipants />
              </div>
            ))}
          </div>
        )}

        <div className="mt-24 p-10 bg-zinc-900/50 border border-white/5 text-center">
          <h3 className="text-xl font-black uppercase italic mb-4">Come funziona la selezione?</h3>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto font-bold uppercase tracking-tight leading-relaxed">
            Ogni candidatura viene esaminata dal nostro team. Valutiamo il fitment, la pulizia del progetto e l'originalità. 
            Riceverai una notifica push e una mail se il tuo veicolo verrà approvato per l'area espositiva.
          </p>
        </div>
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Events;