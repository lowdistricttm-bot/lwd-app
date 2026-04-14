"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { useEvents, Event, useUserApplications } from '@/hooks/use-events';
import { useGarage } from '@/hooks/use-garage';
import { useAdmin } from '@/hooks/use-admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car, Loader2, ChevronRight, X, MapPin, Camera, Trash2, Settings2, Calendar, Plus, Edit3, Eye, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import { showError } from '@/utils/toast';
import EventAdminModal from '@/components/EventAdminModal';
import ManageApplicationModal from '@/components/ManageApplicationModal';

const Events = () => {
  const navigate = useNavigate();
  const interiorInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [manageApp, setManageApp] = useState<any>(null);
  
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', city: '', instagram: '', vehicleId: '', modifications: ''
  });

  const [interiorFiles, setInteriorFiles] = useState<File[]>([]);
  const [interiorPreviews, setInteriorPreviews] = useState<string[]>([]);

  const { events, isLoading: eventsLoading, applyToEvent, deleteEvent } = useEvents();
  const { vehicles, isLoading: vehiclesLoading } = useGarage();
  const { data: userApps, isLoading: appsLoading, refetch: refetchApps } = useUserApplications();
  const { isAdmin } = useAdmin();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setFormData(prev => ({ 
          ...prev, 
          fullName: session.user.user_metadata?.full_name || '',
          email: session.user.email || ''
        }));
      }
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalFiles = [...interiorFiles, ...files].slice(0, 6);
    setInteriorFiles(totalFiles);
    
    const newPreviews = totalFiles.map(file => URL.createObjectURL(file));
    setInteriorPreviews(newPreviews);
  };

  const removePreview = (index: number) => {
    setInteriorFiles(prev => prev.filter((_, i) => i !== index));
    setInteriorPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    
    if (!formData.vehicleId) {
      showError("Seleziona un veicolo dal garage");
      return;
    }

    if (interiorFiles.length < 3) {
      showError("Carica almeno 3 foto degli interni");
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

  const getAppForEvent = (eventId: string) => userApps?.find(app => app.event_id === eventId);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Iscrizioni Aperte';
      case 'closed': return 'Iscrizioni Chiuse';
      case 'soon': return 'In Arrivo';
      default: return 'Iscrizioni Aperte';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-32 px-6 max-w-4xl mx-auto w-full">
        <header className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">District Calendar</h2>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">Eventi & Selezioni</h1>
          </div>
          {isAdmin && (
            <Button 
              onClick={() => { setEditingEvent(null); setIsAdminModalOpen(true); }}
              className="w-12 h-12 bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition-all shadow-lg"
            >
              <Plus size={24} />
            </Button>
          )}
        </header>

        {eventsLoading || appsLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-500" size={40} /></div>
        ) : (
          <div className="space-y-6">
            {events?.map((event) => {
              const existingApp = getAppForEvent(event.id);
              return (
                <motion.div key={event.id} className="bg-zinc-900/40 border border-white/5 overflow-hidden group hover:border-white/20 transition-all">
                  <div className="flex flex-col md:flex-row">
                    {event.image_url && (
                      <div className="md:w-48 h-48 md:h-auto shrink-0 overflow-hidden">
                        <img src={event.image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={event.title} />
                      </div>
                    )}
                    <div className="flex-1 p-6 flex flex-col justify-between gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "text-[8px] font-black uppercase px-2 py-0.5 italic flex items-center gap-1.5",
                            existingApp?.status === 'pending' && "bg-zinc-800 text-zinc-400",
                            existingApp?.status === 'approved' && "bg-white text-black",
                            !existingApp && (event.status === 'soon' ? "bg-zinc-700 text-zinc-300" : "bg-white text-black")
                          )}>
                            {existingApp ? (
                              <>
                                {existingApp.status === 'pending' ? <Clock size={10} /> : <Settings2 size={10} />}
                                STATO: {existingApp.status === 'pending' ? 'IN ATTESA' : existingApp.status.toUpperCase()}
                              </>
                            ) : (
                              getStatusLabel(event.status)
                            )}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-[8px] font-black uppercase text-zinc-500">
                              <MapPin size={10} /> {event.location}
                            </div>
                            <div className="flex items-center gap-1 text-[8px] font-black uppercase text-zinc-500">
                              <Calendar size={10} /> {new Date(event.date).toLocaleDateString('it-IT')}
                            </div>
                          </div>
                        </div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">{event.title}</h3>
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        <Button 
                          onClick={() => setViewingEvent(event)}
                          variant="outline"
                          className="border-white/10 text-white hover:bg-white/10 rounded-none font-black uppercase italic text-[9px] tracking-widest h-10 px-6"
                        >
                          <Eye size={14} className="mr-2" /> Programma
                        </Button>

                        {existingApp ? (
                          <Button 
                            onClick={() => setManageApp(existingApp)}
                            className="bg-zinc-800 text-white hover:bg-white hover:text-black rounded-none font-black uppercase italic text-[9px] tracking-widest h-10 px-6"
                          >
                            <Settings2 size={14} className="mr-2" /> Gestisci
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => setSelectedEvent(event)}
                            disabled={event.status !== 'open'}
                            className={cn(
                              "rounded-none font-black uppercase italic text-[9px] tracking-widest h-10 px-6",
                              event.status === 'open' ? "bg-white text-black hover:bg-zinc-200" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                            )}
                          >
                            {event.status === 'open' ? 'Candidati' : 'Iscrizioni Chiuse'} <ChevronRight size={14} className="ml-2" />
                          </Button>
                        )}

                        {isAdmin && (
                          <div className="flex gap-2 ml-auto">
                            <button 
                              onClick={() => { setEditingEvent(event); setIsAdminModalOpen(true); }}
                              className="p-2 bg-zinc-800 text-white hover:bg-white hover:text-black transition-colors"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              onClick={() => { if(confirm('Eliminare questo evento?')) deleteEvent.mutate(event.id); }}
                              className="p-2 bg-zinc-800 text-white hover:bg-red-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Modal Visualizzazione Dettagli Evento */}
        <AnimatePresence>
          {viewingEvent && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingEvent(null)} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]" />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-x-0 bottom-0 z-[101] bg-zinc-950 border-t border-white/10 p-8 rounded-t-[2rem] max-h-[90vh] overflow-y-auto">
                <div className="max-w-3xl mx-auto space-y-8 pb-12">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">{viewingEvent.title}</h3>
                      <div className="flex gap-4 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                        <span className="flex items-center gap-1"><MapPin size={12} /> {viewingEvent.location}</span>
                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(viewingEvent.date).toLocaleDateString('it-IT')}</span>
                      </div>
                    </div>
                    <button onClick={() => setViewingEvent(null)}><X size={24} /></button>
                  </div>

                  {viewingEvent.image_url && (
                    <div className="aspect-video bg-zinc-900 border border-white/5 overflow-hidden">
                      <img src={viewingEvent.image_url} className="w-full h-full object-cover" alt="Locandina" />
                    </div>
                  )}

                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 italic">Programma & Info</h4>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap italic font-medium">
                        {viewingEvent.description}
                      </p>
                    </div>
                  </div>

                  {viewingEvent.status === 'open' && !getAppForEvent(viewingEvent.id) && (
                    <Button 
                      onClick={() => { setViewingEvent(null); setSelectedEvent(viewingEvent); }}
                      className="w-full bg-white text-black py-6 font-black uppercase italic tracking-widest rounded-none"
                    >
                      Candidati Ora
                    </Button>
                  )}
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
                        <Label className="text-[10px] font-black uppercase text-zinc-500">Nome e Cognome *</Label>
                        <Input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="bg-transparent border-zinc-800 rounded-none h-12 text-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-zinc-500">Email *</Label>
                        <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-transparent border-zinc-800 rounded-none h-12 text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-zinc-500">Telefono *</Label>
                        <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-transparent border-zinc-800 rounded-none h-12 text-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-zinc-500">Città *</Label>
                        <Input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="bg-transparent border-zinc-800 rounded-none h-12 text-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-zinc-500">Instagram *</Label>
                        <Input required value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="bg-transparent border-zinc-800 rounded-none h-12 text-sm" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase text-zinc-500">Seleziona Veicolo dal Garage *</Label>
                      <div className="grid grid-cols-1 gap-3">
                        {vehicles?.map(v => (
                          <button 
                            key={v.id} 
                            type="button" 
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev, 
                                vehicleId: v.id,
                                modifications: v.description || ''
                              }));
                            }} 
                            className={cn(
                              "flex items-center gap-4 p-3 border transition-all text-left group", 
                              formData.vehicleId === v.id ? "bg-white text-black border-white" : "bg-zinc-900 border-white/5"
                            )}
                          >
                            <div className="w-16 h-16 bg-black shrink-0 overflow-hidden border border-white/10">
                              {v.images?.[0] ? (
                                <img src={v.images[0]} className="w-full h-full object-cover" alt={v.model} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-800"><Car size={20} /></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black uppercase italic truncate">{v.brand} {v.model}</p>
                              <p className="text-[9px] font-bold uppercase text-zinc-500 group-hover:text-zinc-400">
                                {v.suspension_type} • {v.year}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase text-zinc-500">Foto Interni (Minimo 3) *</Label>
                      <div 
                        onClick={() => interiorInputRef.current?.click()}
                        className="h-24 border border-dashed border-zinc-800 flex flex-col items-center justify-center cursor-pointer hover:border-white transition-colors bg-zinc-900/30"
                      >
                        <Camera size={24} className="text-zinc-600 mb-2" />
                        <span className="text-[9px] font-black uppercase text-zinc-500">Carica Foto Interni</span>
                      </div>
                      <input type="file" ref={interiorInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                      
                      {interiorPreviews.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                          {interiorPreviews.map((url, i) => (
                            <div key={i} className="aspect-square relative bg-zinc-800 border border-white/5">
                              <img src={url} className="w-full h-full object-cover" alt="Preview" />
                              <button type="button" onClick={() => removePreview(i)} className="absolute -top-1 -right-1 w-5 h-5 bg-zinc-700 text-white flex items-center justify-center rounded-full"><X size={10} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button type="submit" disabled={applyToEvent.isPending} className="w-full bg-white text-black py-8 font-black uppercase italic tracking-widest rounded-none">
                      {applyToEvent.isPending ? <Loader2 className="animate-spin" /> : "Invia Candidatura"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <EventAdminModal 
          isOpen={isAdminModalOpen} 
          onClose={() => { setIsAdminModalOpen(false); setEditingEvent(null); }} 
          event={editingEvent}
        />

        <ManageApplicationModal 
          isOpen={!!manageApp} 
          onClose={() => setManageApp(null)} 
          application={manageApp} 
        />
      </main>
      <Footer /><BottomNav />
    </div>
  );
};

export default Events;