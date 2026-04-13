"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { useEvents, Event } from '@/hooks/use-events';
import { useGarage } from '@/hooks/use-garage';
import { Button } from '@/components/ui/button';
import { Car, Loader2, Calendar, MapPin, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";

const Events = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const { events, isLoading: eventsLoading, applyToEvent } = useEvents();
  const { vehicles, isLoading: vehiclesLoading } = useGarage();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleApply = async () => {
    if (!selectedEvent || !selectedVehicleId) return;
    
    try {
      await applyToEvent.mutateAsync(selectedEvent.id, selectedVehicleId);
      setSelectedEvent(null);
      setSelectedVehicleId(null);
    } catch (error) {}
  };

  if (!user && !eventsLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle size={48} className="text-zinc-800 mb-6" />
          <h1 className="text-2xl font-black uppercase italic mb-4">Accesso Riservato</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8 max-w-xs">
            Devi essere loggato per visualizzare e candidarti agli eventi del District.
          </p>
          <Button onClick={() => navigate('/login')} className="bg-red-600 rounded-none font-black uppercase italic px-12 py-6">Accedi Ora</Button>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-32 px-6 max-w-4xl mx-auto w-full">
        <header className="mb-12">
          <h2 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">
            District Calendar
          </h2>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">
            Eventi & Selezioni
          </h1>
        </header>

        {eventsLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-red-600" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sincronizzazione eventi...</p>
          </div>
        ) : events?.length === 0 ? (
          <div className="text-center py-20 border border-white/5 bg-zinc-900/30">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Nessun evento in programma al momento.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {events?.map((event) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/40 border border-white/5 p-6 group hover:border-red-600/30 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[8px] font-black uppercase px-2 py-0.5 italic",
                        event.status === 'open' ? "bg-green-600 text-white" : "bg-zinc-800 text-zinc-500"
                      )}>
                        {event.status === 'open' ? 'Iscrizioni Aperte' : 'Chiuso'}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">{event.title}</h3>
                    <div className="flex flex-wrap gap-4 text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-red-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {new Date(event.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-red-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{event.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setSelectedEvent(event)}
                    disabled={event.status !== 'open'}
                    className="bg-white text-black hover:bg-red-600 hover:text-white rounded-none font-black uppercase italic text-[10px] tracking-widest h-12 px-8"
                  >
                    Candidati <ChevronRight size={14} className="ml-2" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {selectedEvent && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedEvent(null)}
                className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]"
              />
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="fixed inset-x-0 bottom-0 z-[101] bg-zinc-950 border-t border-white/10 p-8 rounded-t-[2rem] max-h-[90vh] overflow-y-auto"
              >
                <div className="max-w-2xl mx-auto">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">Candidatura Evento</h2>
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter">{selectedEvent.title}</h3>
                    </div>
                    <button onClick={() => setSelectedEvent(null)} className="p-2 text-zinc-500 hover:text-white">
                      <AlertCircle size={24} />
                    </button>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-zinc-900/50 p-6 border border-white/5">
                      <p className="text-zinc-400 text-sm leading-relaxed italic mb-4">{selectedEvent.description}</p>
                      <div className="flex gap-6">
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          Data: <span className="text-white">{new Date(selectedEvent.date).toLocaleDateString()}</span>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          Luogo: <span className="text-white">{selectedEvent.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest italic text-red-600">Seleziona il tuo veicolo</h4>
                      
                      {vehiclesLoading ? (
                        <div className="py-8 text-center"><Loader2 className="animate-spin mx-auto text-red-600" /></div>
                      ) : vehicles?.length === 0 ? (
                        <div className="p-8 border border-dashed border-zinc-800 text-center">
                          <p className="text-zinc-500 text-[10px] font-bold uppercase mb-4">Non hai veicoli nel garage</p>
                          <Button onClick={() => navigate('/profile')} variant="outline" className="rounded-none text-[9px] font-black uppercase">Vai al Garage</Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {vehicles?.map((vehicle) => (
                            <button
                              key={vehicle.id}
                              onClick={() => setSelectedVehicleId(vehicle.id)}
                              className={cn(
                                "flex items-center gap-4 p-4 border transition-all text-left",
                                selectedVehicleId === vehicle.id 
                                  ? "bg-red-600 border-red-600 text-white" 
                                  : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/20"
                              )}
                            >
                              <div className="w-12 h-12 bg-black/20 flex items-center justify-center shrink-0">
                                <Car size={20} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-black uppercase italic truncate">{vehicle.brand} {vehicle.model}</p>
                                <p className="text-[9px] font-bold uppercase opacity-60">{vehicle.suspension_type} • {vehicle.year}</p>
                              </div>
                              {selectedVehicleId === vehicle.id && <CheckCircle2 size={20} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <Button 
                        onClick={handleApply}
                        disabled={!selectedVehicleId || applyToEvent.isPending}
                        className="w-full bg-red-600 hover:bg-white hover:text-black text-white py-8 text-sm font-black uppercase tracking-widest rounded-none italic"
                      >
                        {applyToEvent.isPending ? <Loader2 className="animate-spin" /> : 'Invia Candidatura Ufficiale'}
                      </Button>
                      <p className="text-[9px] text-zinc-600 text-center mt-4 uppercase font-bold tracking-widest">
                        La tua candidatura verrà revisionata dallo staff. Riceverai una notifica in caso di approvazione.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Events;