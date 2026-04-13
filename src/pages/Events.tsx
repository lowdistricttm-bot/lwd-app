"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { useEvents, Event } from '@/hooks/use-events';
import { useGarage } from '@/hooks/use-garage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Car, Loader2, Calendar, MapPin, ChevronRight, CheckCircle2, AlertCircle, X, Instagram, Phone, User, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";

const Events = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [user, setUser] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    instagram: '',
    vehicleId: '',
    modifications: ''
  });

  const { events, isLoading: eventsLoading, applyToEvent } = useEvents();
  const { vehicles, isLoading: vehiclesLoading } = useGarage();

  // Trova il veicolo selezionato per controllare la descrizione
  const selectedVehicle = useMemo(() => 
    vehicles?.find(v => v.id === formData.vehicleId),
  [vehicles, formData.vehicleId]);

  // Verifica se il veicolo ha già una descrizione nel garage
  const hasGarageDescription = !!selectedVehicle?.description?.trim();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setFormData(prev => ({
          ...prev,
          email: session.user.email || '',
          fullName: session.user.user_metadata?.full_name || ''
        }));
      }
    });
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !formData.vehicleId) return;
    
    // Se il veicolo ha una descrizione nel garage, usiamo quella
    const finalModifications = hasGarageDescription 
      ? selectedVehicle.description 
      : formData.modifications;

    try {
      await applyToEvent.mutateAsync({
        eventId: selectedEvent.id,
        ...formData,
        modifications: finalModifications
      });
      setSelectedEvent(null);
      setFormData(prev => ({ ...prev, vehicleId: '', modifications: '' }));
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
                    <span className="text-[8px] font-black uppercase px-2 py-0.5 italic bg-green-600 text-white">
                      Iscrizioni Aperte
                    </span>
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
                <form onSubmit={handleApply} className="max-w-2xl mx-auto pb-12">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">Invia Selezione</h2>
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter">{selectedEvent.title}</h3>
                    </div>
                    <button type="button" onClick={() => setSelectedEvent(null)} className="p-2 text-zinc-500 hover:text-white">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-10">
                    {/* Locandina */}
                    {selectedEvent.image_url && (
                      <div className="aspect-video bg-zinc-900 border border-white/5 overflow-hidden">
                        <img src={selectedEvent.image_url} alt="Locandina" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Dati Personali */}
                    <div className="space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-widest italic text-red-600 border-b border-white/5 pb-2">1. Dati Personali</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2"><User size={12}/> Nome e Cognome</Label>
                          <Input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="bg-transparent border-zinc-800 rounded-none h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2"><Phone size={12}/> Cellulare</Label>
                          <Input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-transparent border-zinc-800 rounded-none h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2"><Map size={12}/> Città</Label>
                          <Input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="bg-transparent border-zinc-800 rounded-none h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2"><Instagram size={12}/> Instagram</Label>
                          <Input required placeholder="@username" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="bg-transparent border-zinc-800 rounded-none h-12" />
                        </div>
                      </div>
                    </div>

                    {/* Selezione Veicolo */}
                    <div className="space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-widest italic text-red-600 border-b border-white/5 pb-2">2. Il tuo Progetto</h4>
                      {vehiclesLoading ? (
                        <Loader2 className="animate-spin mx-auto text-red-600" />
                      ) : vehicles?.length === 0 ? (
                        <div className="p-8 border border-dashed border-zinc-800 text-center">
                          <p className="text-zinc-500 text-[10px] font-bold uppercase mb-4">Aggiungi prima un veicolo nel garage</p>
                          <Button type="button" onClick={() => navigate('/profile')} variant="outline" className="rounded-none text-[9px] font-black uppercase">Vai al Garage</Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {vehicles?.map((vehicle) => (
                            <button
                              key={vehicle.id}
                              type="button"
                              onClick={() => setFormData({...formData, vehicleId: vehicle.id})}
                              className={cn(
                                "flex items-center gap-4 p-4 border transition-all text-left",
                                formData.vehicleId === vehicle.id ? "bg-red-600 border-red-600 text-white" : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/20"
                              )}
                            >
                              <div className="w-12 h-12 bg-black/20 flex items-center justify-center shrink-0"><Car size={20} /></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-black uppercase italic truncate">{vehicle.brand} {vehicle.model}</p>
                                <p className="text-[9px] font-bold uppercase opacity-60">{vehicle.suspension_type} • {vehicle.year}</p>
                              </div>
                              {formData.vehicleId === vehicle.id && <CheckCircle2 size={20} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Modifiche - Mostrato solo se il veicolo NON ha una descrizione nel garage */}
                    {!hasGarageDescription && formData.vehicleId && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4"
                      >
                        <h4 className="text-xs font-black uppercase tracking-widest italic text-red-600 border-b border-white/5 pb-2">3. Lista Modifiche</h4>
                        <Label className="text-[10px] font-black uppercase text-zinc-500">Descrivi le modifiche (Estetiche, Meccaniche, Interni)</Label>
                        <Textarea 
                          required
                          placeholder="Esempio: Cerchi BBS RS, Assetto a ghiera KW V3, Interni Recaro..."
                          value={formData.modifications}
                          onChange={e => setFormData({...formData, modifications: e.target.value})}
                          className="bg-transparent border-zinc-800 rounded-none min-h-[150px] text-sm" 
                        />
                      </motion.div>
                    )}

                    {hasGarageDescription && (
                      <div className="p-4 bg-zinc-900/30 border border-white/5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic">
                          Verrà utilizzata la descrizione del progetto già presente nel tuo Garage.
                        </p>
                      </div>
                    )}

                    <div className="pt-6 border-t border-white/5">
                      <Button 
                        type="submit"
                        disabled={!formData.vehicleId || applyToEvent.isPending}
                        className="w-full bg-red-600 hover:bg-white hover:text-black text-white py-8 text-sm font-black uppercase italic tracking-widest rounded-none italic"
                      >
                        {applyToEvent.isPending ? <Loader2 className="animate-spin" /> : 'Invia Candidatura Ufficiale'}
                      </Button>
                      <p className="text-[9px] text-zinc-600 text-center mt-4 uppercase font-bold tracking-widest">
                        Inviando la candidatura accetti che i tuoi dati vengano trattati per la selezione dell'evento.
                      </p>
                    </div>
                  </div>
                </form>
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