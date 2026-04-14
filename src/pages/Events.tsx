"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { useEvents, Event, useUserApplications } from '@/hooks/use-events';
import { useGarage } from '@/hooks/use-garage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Car, Loader2, Calendar, MapPin, ChevronRight, CheckCircle2, AlertCircle, X, Instagram, Phone, User, Map, Mail, Camera, Trash2, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";

const Events = () => {
  const navigate = useNavigate();
  const interiorInputRef = useRef<HTMLInputElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [manageApp, setManageApp] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', city: '', instagram: '', vehicleId: '', modifications: ''
  });

  const [interiorFiles, setInteriorFiles] = useState<File[]>([]);
  const [interiorPreviews, setInteriorPreviews] = useState<string[]>([]);

  const { events, isLoading: eventsLoading, applyToEvent, cancelApplication } = useEvents();
  const { vehicles, isLoading: vehiclesLoading } = useGarage();
  const { data: userApps, isLoading: appsLoading } = useUserApplications();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setFormData(prev => ({ ...prev, email: session.user.email || '', fullName: session.user.user_metadata?.full_name || '' }));
      }
    });
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !formData.vehicleId) return;
    try {
      await applyToEvent.mutateAsync({ eventId: selectedEvent.id, ...formData, interiorFiles });
      setSelectedEvent(null);
    } catch (error) {}
  };

  const getAppForEvent = (eventId: string) => userApps?.find(app => app.event_id === eventId);

  if (!user && !eventsLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Navbar /><main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle size={48} className="text-zinc-800 mb-6" /><h1 className="text-2xl font-black uppercase italic mb-4">Accesso Riservato</h1>
          <Button onClick={() => navigate('/login')} className="bg-red-600 rounded-none font-black uppercase italic px-12 py-6">Accedi Ora</Button>
        </main><BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-32 px-6 max-w-4xl mx-auto w-full">
        <header className="mb-12">
          <h2 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">District Calendar</h2>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">Eventi & Selezioni</h1>
        </header>

        {eventsLoading || appsLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600" size={40} /></div>
        ) : (
          <div className="space-y-6">
            {events?.map((event) => {
              const existingApp = getAppForEvent(event.id);
              return (
                <motion.div key={event.id} className="bg-zinc-900/40 border border-white/5 p-6 group hover:border-red-600/30 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4">
                      <span className={cn(
                        "text-[8px] font-black uppercase px-2 py-0.5 italic",
                        existingApp?.status === 'pending' && "bg-zinc-800 text-zinc-400",
                        existingApp?.status === 'approved' && "bg-green-600 text-white",
                        existingApp?.status === 'rejected' && "bg-red-600 text-white",
                        !existingApp && "bg-green-600 text-white"
                      )}>
                        {existingApp ? `STATO: ${existingApp.status === 'pending' ? 'IN ATTESA' : existingApp.status.toUpperCase()}` : "Iscrizioni Aperte"}
                      </span>
                      <h3 className="text-2xl font-black italic uppercase tracking-tighter">{event.title}</h3>
                    </div>
                    
                    {existingApp ? (
                      <Button 
                        onClick={() => setManageApp(existingApp)}
                        className="bg-zinc-800 text-white hover:bg-white hover:text-black rounded-none font-black uppercase italic text-[10px] tracking-widest h-12 px-8"
                      >
                        <Settings2 size={14} className="mr-2" /> Gestisci Selezione
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => setSelectedEvent(event)}
                        className="bg-white text-black hover:bg-red-600 hover:text-white rounded-none font-black uppercase italic text-[10px] tracking-widest h-12 px-8"
                      >
                        Candidati <ChevronRight size={14} className="ml-2" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Modal Gestione Selezione */}
        <AnimatePresence>
          {manageApp && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setManageApp(null)} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]" />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-x-0 bottom-0 z-[101] bg-zinc-950 border-t border-white/10 p-8 rounded-t-[2rem] max-h-[80vh] overflow-y-auto">
                <div className="max-w-md mx-auto text-center space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black italic uppercase">La tua Selezione</h3>
                    <button onClick={() => setManageApp(null)}><X size={24} /></button>
                  </div>
                  
                  <div className="bg-zinc-900 p-6 border border-white/5">
                    <p className="text-[10px] font-black uppercase text-zinc-500 mb-2">Stato Attuale</p>
                    <p className="text-2xl font-black italic uppercase text-red-600">
                      {manageApp.status === 'pending' ? 'IN ATTESA' : manageApp.status.toUpperCase()}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs text-zinc-500 font-bold uppercase">Vuoi modificare la tua candidatura? <br/> Devi prima annullare quella attuale.</p>
                    <Button 
                      onClick={async () => {
                        await cancelApplication.mutateAsync(manageApp.id);
                        setManageApp(null);
                      }}
                      className="w-full bg-red-600 hover:bg-white hover:text-black text-white py-6 rounded-none font-black uppercase italic tracking-widest"
                    >
                      <Trash2 size={16} className="mr-2" /> Annulla Candidatura
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Modal Candidatura */}
        <AnimatePresence>
          {selectedEvent && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedEvent(null)} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]" />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-x-0 bottom-0 z-[101] bg-zinc-950 border-t border-white/10 p-8 rounded-t-[2rem] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleApply} className="max-w-2xl mx-auto pb-12">
                  <div className="flex justify-between items-start mb-8">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">{selectedEvent.title}</h3>
                    <button type="button" onClick={() => setSelectedEvent(null)}><X size={24} /></button>
                  </div>
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-zinc-500">Nome e Cognome</Label>
                        <Input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="bg-transparent border-zinc-800 rounded-none h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-zinc-500">Email</Label>
                        <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-transparent border-zinc-800 rounded-none h-12" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-zinc-500">Telefono</Label>
                        <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-transparent border-zinc-800 rounded-none h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-zinc-500">Instagram</Label>
                        <Input required value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="bg-transparent border-zinc-800 rounded-none h-12" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase text-zinc-500">Seleziona Veicolo</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {vehicles?.map(v => (
                          <button key={v.id} type="button" onClick={() => setFormData({...formData, vehicleId: v.id})} className={cn("p-4 border text-left transition-all", formData.vehicleId === v.id ? "bg-red-600 border-red-600" : "bg-zinc-900 border-white/5")}>
                            <p className="text-xs font-black uppercase italic">{v.brand} {v.model}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-zinc-500">Modifiche Principali</Label>
                      <Textarea value={formData.modifications} onChange={e => setFormData({...formData, modifications: e.target.value})} className="bg-transparent border-zinc-800 rounded-none min-h-[100px]" />
                    </div>
                    <Button type="submit" disabled={applyToEvent.isPending} className="w-full bg-red-600 py-8 font-black uppercase italic tracking-widest rounded-none">
                      Invia Candidatura
                    </Button>
                  </div>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
      <Footer /><BottomNav />
    </div>
  );
};

export default Events;