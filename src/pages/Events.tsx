"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { useEvents, Event, useUserApplications } from '@/hooks/use-events';
import { useGarage } from '@/hooks/use-garage';
import { useAdmin } from '@/hooks/use-admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Car, Loader2, ChevronRight, X, MapPin, Camera, Trash2, Settings2, Calendar, Plus, Edit3, Clock, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import { showError } from '@/utils/toast';
import EventAdminModal from '@/components/EventAdminModal';
import ManageApplicationModal from '@/components/ManageApplicationModal';
import { useTranslation } from '@/hooks/use-translation';

const Events = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const interiorInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [manageApp, setManageApp] = useState<any>(null);
  
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', city: '', instagram: '', vehicleId: '', modifications: '' });
  const [interiorFiles, setInteriorFiles] = useState<File[]>([]);
  const [interiorPreviews, setInteriorPreviews] = useState<string[]>([]);

  const { events, isLoading: eventsLoading, applyToEvent, deleteEvent } = useEvents();
  const { vehicles } = useGarage();
  const { data: userApps, isLoading: appsLoading, refetch: refetchApps } = useUserApplications();
  const { isAdmin } = useAdmin();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setFormData(prev => ({ ...prev, fullName: session.user.user_metadata?.full_name || '', email: session.user.email || '' }));
      }
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalFiles = [...interiorFiles, ...files].slice(0, 6);
    setInteriorFiles(totalFiles);
    setInteriorPreviews(totalFiles.map(file => URL.createObjectURL(file)));
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !formData.vehicleId || interiorFiles.length < 3) {
      showError(language === 'it' ? "Compila tutti i campi e carica almeno 3 foto" : "Fill all fields and upload at least 3 photos");
      return;
    }
    try {
      await applyToEvent.mutateAsync({ eventId: selectedEvent.id, ...formData, interiorFiles });
      setSelectedEvent(null);
      setInteriorFiles([]);
      setInteriorPreviews([]);
      await refetchApps();
    } catch (error) {}
  };

  const btnBaseClass = "rounded-full font-black uppercase italic text-[10px] tracking-widest h-12 w-full sm:w-48 backdrop-blur-md transition-all flex items-center justify-center gap-2 border shadow-lg";

  return (
    <div className="min-h-screen text-white flex flex-col bg-transparent">
      <Navbar />
      <main className="flex-1 pt-24 pb-32 px-6 max-w-4xl mx-auto w-full">
        <header className="mb-12 flex items-end justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">{t.events.subtitle}</h2>
            <h1 className="text-3xl md:text-6xl font-black italic uppercase tracking-tighter truncate">{t.events.title}</h1>
          </div>
          {isAdmin && (
            <Button onClick={() => { setEditingEvent(null); setIsAdminModalOpen(true); }} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl ml-4 shrink-0"><Plus size={24} /></Button>
          )}
        </header>

        {eventsLoading || appsLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-500" size={40} /></div>
        ) : (
          <div className="space-y-8">
            {events?.map((event) => {
              const existingApp = userApps?.find(app => app.event_id === event.id);
              return (
                <motion.div key={event.id} className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-white/20 transition-all duration-500">
                  <div className="flex flex-col md:flex-row">
                    {event.image_url && (
                      <div className="md:w-56 h-56 md:h-auto shrink-0 overflow-hidden">
                        <img src={event.image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={event.title} />
                      </div>
                    )}
                    <div className="flex-1 p-8 flex flex-col items-center justify-center text-center gap-8">
                      <div className="space-y-4 w-full">
                        <span className={cn(
                          "text-[8px] font-black uppercase px-3 py-1 italic rounded-full inline-flex items-center gap-1.5",
                          existingApp?.status === 'pending' ? "bg-zinc-800 text-zinc-400" : existingApp?.status === 'approved' ? "bg-white text-black" : "bg-zinc-700 text-white"
                        )}>
                          {existingApp ? <Clock size={10} /> : <Calendar size={10} />}
                          {existingApp ? `${t.events.manageApp.status}: ${existingApp.status.toUpperCase()}` : t.events.statusOpen}
                        </span>
                        <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight truncate">{event.title}</h3>
                        <div className="flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase text-zinc-500">
                          <span className="flex items-center gap-1.5"><MapPin size={14} /> {event.location}</span>
                          <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(event.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                        <button onClick={() => setViewingEvent(event)} className={cn(btnBaseClass, "bg-white/10 border-white/10 text-white hover:bg-white/20")}>{t.events.viewEvent} <ChevronRight size={14} /></button>
                        {existingApp ? (
                          <button onClick={() => setManageApp(existingApp)} className={cn(btnBaseClass, "bg-zinc-800 text-white border-white/10 hover:bg-zinc-700")}>{t.events.manage} <Settings2 size={14} /></button>
                        ) : (
                          <button onClick={() => { if(!user) navigate('/login'); else setSelectedEvent(event); }} disabled={event.status !== 'open'} className={cn(btnBaseClass, event.status === 'open' ? "bg-white text-black border-white/20 hover:scale-105" : "bg-zinc-900 text-zinc-600 cursor-not-allowed")}>
                            {!user && <Lock size={12} />} {t.events.apply} <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <AnimatePresence>
          {/* Modal Visualizza Evento */}
          {viewingEvent && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingEvent(null)} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150]" />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-x-0 bottom-0 z-[151] bg-zinc-950 border-t border-white/10 p-8 rounded-t-[2rem] max-h-[85vh] overflow-y-auto">
                <div className="max-w-2xl mx-auto space-y-8 pb-12">
                  <div className="flex justify-between items-start">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">{viewingEvent.title}</h3>
                    <button onClick={() => setViewingEvent(null)} className="p-2 text-zinc-500 hover:text-white"><X size={24} /></button>
                  </div>
                  {viewingEvent.image_url && (
                    <div className="aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-white/5">
                      <img src={viewingEvent.image_url} className="w-full h-full object-cover" alt={viewingEvent.title} />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl">
                      <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">{t.events.date}</p>
                      <p className="text-sm font-bold uppercase">{new Date(viewingEvent.date).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl">
                      <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">{t.events.location}</p>
                      <p className="text-sm font-bold uppercase">{viewingEvent.location}</p>
                    </div>
                  </div>
                  {viewingEvent.description && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{t.events.description}</h4>
                      <p className="text-sm text-zinc-300 leading-relaxed italic">{viewingEvent.description}</p>
                    </div>
                  )}
                  {viewingEvent.program && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{t.events.program}</h4>
                      <p className="text-sm text-zinc-300 leading-relaxed italic whitespace-pre-wrap">{viewingEvent.program}</p>
                    </div>
                  )}
                  {isAdmin && (
                    <div className="pt-6 flex gap-4">
                      <Button onClick={() => { setEditingEvent(viewingEvent); setViewingEvent(null); setIsAdminModalOpen(true); }} className="flex-1 bg-white text-black font-black uppercase italic rounded-full h-12"><Edit3 size={14} className="mr-2" /> Modifica</Button>
                      <Button onClick={() => { if(confirm("Eliminare evento?")) { deleteEvent.mutate(viewingEvent.id); setViewingEvent(null); } }} variant="destructive" className="flex-1 font-black uppercase italic rounded-full h-12"><Trash2 size={14} className="mr-2" /> Elimina</Button>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}

          {/* Modal Invia Selezione / Apply */}
          {selectedEvent && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedEvent(null)} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150]" />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-x-0 bottom-0 z-[151] bg-zinc-950 border-t border-white/10 p-8 rounded-t-[2rem] max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">{t.events.apply}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{selectedEvent.title}</p>
                  </div>
                  <button onClick={() => setSelectedEvent(null)} className="p-2 text-zinc-500 hover:text-white"><X size={24} /></button>
                </div>

                <form onSubmit={handleApply} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-zinc-500">{t.events.form.name}</Label>
                      <Input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="bg-transparent border-zinc-800 rounded-none h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-zinc-500">{t.events.form.email}</Label>
                      <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-transparent border-zinc-800 rounded-none h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-zinc-500">{t.events.form.phone}</Label>
                      <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-transparent border-zinc-800 rounded-none h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-zinc-500">{t.events.form.city}</Label>
                      <Input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="bg-transparent border-zinc-800 rounded-none h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-zinc-500">{t.events.form.instagram}</Label>
                      <Input required value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} placeholder="@username" className="bg-transparent border-zinc-800 rounded-none h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-zinc-500">{t.events.form.selectVehicle}</Label>
                      <select required value={formData.vehicleId} onChange={e => setFormData({...formData, vehicleId: e.target.value})} className="w-full bg-transparent border border-zinc-800 rounded-none h-12 px-3 text-sm italic">
                        <option value="" className="bg-zinc-950">Seleziona un veicolo...</option>
                        {vehicles?.map(v => (
                          <option key={v.id} value={v.id} className="bg-zinc-950">{v.brand} {v.model}</option>
                        ))}
                      </select>
                      {vehicles?.length === 0 && <p className="text-[10px] text-red-500 mt-1 italic">Devi prima aggiungere un veicolo nel tuo Garage.</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-zinc-500">Modifiche Principali</Label>
                    <Textarea value={formData.modifications} onChange={e => setFormData({...formData, modifications: e.target.value})} placeholder="Descrivi brevemente le modifiche..." className="bg-transparent border-zinc-800 rounded-none min-h-[80px]" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-zinc-500 flex items-center justify-between">
                      <span>{t.events.form.interiorPhotos}</span>
                      <span>{interiorFiles.length}/6</span>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {interiorPreviews.map((url, i) => (
                        <div key={i} className="relative w-20 h-20 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
                          <img src={url} className="w-full h-full object-cover" alt="Interior preview" />
                          <button type="button" onClick={() => {
                            const newFiles = [...interiorFiles]; newFiles.splice(i, 1);
                            const newPreviews = [...interiorPreviews]; newPreviews.splice(i, 1);
                            setInteriorFiles(newFiles); setInteriorPreviews(newPreviews);
                          }} className="absolute top-1 right-1 p-1 bg-black/60 rounded-full hover:bg-zinc-800"><X size={10} /></button>
                        </div>
                      ))}
                      {interiorFiles.length < 6 && (
                        <button type="button" onClick={() => interiorInputRef.current?.click()} className="w-20 h-20 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center hover:border-white transition-colors">
                          <Camera size={16} className="text-zinc-600 mb-1" />
                        </button>
                      )}
                      <input type="file" ref={interiorInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                    </div>
                  </div>

                  <Button type="submit" disabled={applyToEvent.isPending || interiorFiles.length < 3 || !formData.vehicleId} className="w-full bg-white text-black hover:bg-zinc-200 h-14 rounded-full font-black uppercase italic tracking-widest transition-all mt-4">
                    {applyToEvent.isPending ? <Loader2 className="animate-spin" /> : t.events.form.submit}
                  </Button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <EventAdminModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} event={editingEvent} />
        <ManageApplicationModal isOpen={!!manageApp} onClose={() => setManageApp(null)} application={manageApp} />
      </main>
      <BottomNav />
    </div>
  );
};

export default Events;