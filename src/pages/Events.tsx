"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useEvents, Event, useUserApplications } from '@/hooks/use-events';
import { useGarage } from '@/hooks/use-garage';
import { useAdmin } from '@/hooks/use-admin';
import { useBodyLock } from '@/hooks/use-body-lock';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Car, Loader2, ChevronRight, X, MapPin, Camera, Trash2, Settings2, Calendar, Plus, Edit3, Clock, Lock, CheckCircle2, User as UserIcon, Mail, Phone, Instagram, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import { showError } from '@/utils/toast';
import EventAdminModal from '@/components/EventAdminModal';
import ManageApplicationModal from '@/components/ManageApplicationModal';
import { useTranslation } from '@/hooks/use-translation';

const Events = () => {
  const navigate = useNavigate();
  const [searchParams, searchParamsSetter] = useSearchParams();
  const { t, language } = useTranslation();
  const interiorInputRef = useRef<HTMLInputElement>(null);
  const { user, isLoading: authLoading } = useAuth();
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [manageApp, setManageApp] = useState<any>(null);
  
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', city: '', instagram: '', vehicleId: '', modifications: '' });
  const [interiorFiles, setInteriorFiles] = useState<File[]>([]);
  const [interiorPreviews, setInteriorPreviews] = useState<string[]>([]);

  const { events, isLoading: eventsLoading, applyToEvent, deleteEvent } = useEvents();
  const { vehicles } = useGarage();
  const { data: userApps, isLoading: appsLoading, refetch: refetchApps } = useUserApplications();
  const { isAdmin } = useAdmin();

  const viewEventId = searchParams.get('view');

  // Blocco background per i vari stati modal
  useBodyLock(!!viewingEvent || !!selectedEvent || !!manageApp || isAdminModalOpen);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ 
        ...prev, 
        fullName: user.user_metadata?.full_name || '', 
        email: user.email || '' 
      }));
    }
  }, [user]);

  useEffect(() => {
    if (viewEventId && events && events.length > 0) {
      const ev = events.find(e => e.id === viewEventId);
      if (ev) {
        setViewingEvent(ev);
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('view');
        searchParamsSetter(newParams, { replace: true });
      }
    }
  }, [viewEventId, events, searchParams, searchParamsSetter]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalFiles = [...interiorFiles, ...files].slice(0, 6);
    setInteriorFiles(totalFiles);
    setInteriorPreviews(totalFiles.map(file => URL.createObjectURL(file)));
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !formData.vehicleId || interiorFiles.length < 3) {
      showError(language === 'it' ? "Compila tutti i campi, seleziona un veicolo e carica almeno 3 foto" : "Fill all fields, select a vehicle and upload at least 3 photos");
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

  const formatDateRange = (start: string, end?: string) => {
    const startDate = new Date(start);
    const startDay = startDate.getDate();
    const startMonth = startDate.toLocaleString(language === 'it' ? 'it-IT' : 'en-US', { month: 'long' }).toUpperCase();
    const startYear = startDate.getFullYear();

    if (end) {
      const endDate = new Date(end);
      const endDay = endDate.getDate();
      const endMonth = endDate.toLocaleString(language === 'it' ? 'it-IT' : 'en-US', { month: 'long' }).toUpperCase();
      const endYear = endDate.getFullYear();

      if (startDay !== endDay || startMonth !== endMonth || startYear !== endYear) {
        if (startMonth === endMonth && startYear === endYear) {
          return `${startDay}-${endDay} ${startMonth} ${startYear}`;
        } else if (startYear === endYear) {
          return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${startYear}`;
        } else {
          return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
        }
      }
    }
    
    return `${startDay} ${startMonth} ${startYear}`;
  };

  const btnBaseClass = "rounded-full font-black uppercase italic text-[10px] tracking-widest h-12 w-full sm:w-48 backdrop-blur-md transition-all flex items-center justify-center gap-2 border shadow-lg";

  return (
    <div className="min-h-screen text-white flex flex-col bg-transparent">
      <Navbar />
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top)+2rem)] pb-32 px-6 max-w-4xl mx-auto w-full">
        <header className="mb-12 flex items-end justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">{t.events.subtitle}</h2>
            <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase truncate">{t.events.title}</h1>
          </div>
          {isAdmin && (
            <Button onClick={() => { setEditingEvent(null); setIsAdminModalOpen(true); }} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl ml-4 shrink-0"><Plus size={24} /></Button>
          )}
        </header>

        {eventsLoading || appsLoading || authLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-500" size={40} /></div>
        ) : (
          <div className="space-y-8">
            {events?.map((event) => {
              const existingApp = userApps?.find(app => app.event_id === event.id);
              const getStatusText = () => {
                if (event.status === 'closed') return t.events.statusClosed;
                if (event.status === 'soon') return t.events.statusSoon;
                return t.events.statusOpen;
              };

              return (
                <motion.div key={event.id} className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-white/20 transition-all duration-500">
                  <div className="flex flex-col md:flex-row">
                    {event.image_url && (
                      <div className="md:w-56 h-56 md:h-auto shrink-0 overflow-hidden">
                        <img src={event.image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={event.title} />
                      </div>
                    )}
                    <div className="flex-1 p-8 flex flex-col items-center justify-center text-center gap-8 min-w-0">
                      <div className="space-y-4 w-full">
                        <span className={cn(
                          "text-[8px] font-black uppercase px-3 py-1 italic rounded-full inline-flex items-center gap-1.5 transition-all duration-300",
                          existingApp?.status === 'pending' ? "bg-zinc-800 text-zinc-400" : 
                          existingApp?.status === 'approved' ? "bg-white text-black" : 
                          existingApp?.status === 'rejected' ? "bg-zinc-700 text-white" :
                          event.status === 'open' ? "bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.4)]" : 
                          event.status === 'closed' ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]" :
                          event.status === 'soon' ? "bg-white text-black animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.6)]" :
                          "bg-zinc-800 text-zinc-400"
                        )}>
                          {existingApp ? <Clock size={10} /> : <Calendar size={10} />}
                          {existingApp ? `${t.events.manageApp.status}: ${existingApp.status.toUpperCase()}` : getStatusText()}
                        </span>
                        
                        <div className="w-full overflow-x-auto no-scrollbar">
                          <h3 className="text-[clamp(18px,4vw,24px)] md:text-2xl font-black italic uppercase tracking-tight whitespace-nowrap px-1">
                            {event.title}
                          </h3>
                        </div>

                        <div className="flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase text-zinc-500">
                          <span className="flex items-center gap-1.5"><MapPin size={14} /> {event.location}</span>
                          <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDateRange(event.date, event.end_date)}</span>
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingEvent(null)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] touch-none" />
              <motion.div 
                initial={{ y: '100%' }} 
                animate={{ y: 0 }} 
                exit={{ y: '100%' }} 
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-x-0 bottom-0 z-[151] bg-black/60 backdrop-blur-2xl border-t border-white/10 p-6 pb-12 rounded-t-[2.5rem] max-h-[90dvh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
                style={{ overscrollBehavior: 'contain' }}
              >
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />
                
                <div className="max-w-2xl mx-auto space-y-10 pb-10">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none">
                      {viewingEvent.title}
                    </h3>
                    <button onClick={() => setViewingEvent(null)} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={24} /></button>
                  </div>

                  {viewingEvent.image_url && (
                    <div className="aspect-video bg-zinc-950 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                      <img src={viewingEvent.image_url} className="w-full h-full object-cover" alt={viewingEvent.title} />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-md">
                      <p className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.3em] italic mb-2">{t.events.date}</p>
                      <p className="text-sm font-black uppercase italic text-white tracking-tight">
                        {formatDateRange(viewingEvent.date, viewingEvent.end_date)}
                      </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-md">
                      <p className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.3em] italic mb-2">{t.events.location}</p>
                      <p className="text-sm font-black uppercase italic text-white tracking-tight">
                        {viewingEvent.location}
                      </p>
                    </div>
                  </div>

                  {viewingEvent.description && (
                    <div className="space-y-3 px-2">
                      <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.4em] italic">{t.events.description}</h4>
                      <p className="text-sm font-black uppercase italic text-white leading-relaxed tracking-tight">{viewingEvent.description}</p>
                    </div>
                  )}

                  {viewingEvent.program && (
                    <div className="space-y-3 px-2">
                      <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.4em] italic">{t.events.program}</h4>
                      <p className="text-sm font-black uppercase italic text-white leading-relaxed tracking-tight whitespace-pre-wrap">{viewingEvent.program}</p>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="pt-6 pb-10 flex gap-4">
                      <Button onClick={() => { setEditingEvent(viewingEvent); setViewingEvent(null); setIsAdminModalOpen(true); }} className="flex-1 bg-white text-black font-black uppercase italic rounded-full h-14 shadow-xl"><Edit3 size={16} className="mr-2" /> Modifica</Button>
                      <Button onClick={() => { if(confirm("Eliminare evento?")) { deleteEvent.mutate(viewingEvent.id); setViewingEvent(null); } }} variant="destructive" className="flex-1 font-black uppercase italic rounded-full h-14 shadow-xl"><Trash2 size={16} className="mr-2" /> Elimina</Button>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}

          {/* Modal Invia Selezione / Apply */}
          {selectedEvent && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedEvent(null)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] touch-none" />
              <motion.div 
                initial={{ y: '100%' }} 
                animate={{ y: 0 }} 
                exit={{ y: '100%' }} 
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-x-0 bottom-0 z-[151] bg-black/60 backdrop-blur-2xl border-t border-white/10 p-6 pb-12 rounded-t-[2.5rem] max-h-[90dvh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
                style={{ overscrollBehavior: 'contain' }}
              >
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />
                
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">{t.events.apply}</h3>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-1">{selectedEvent.title}</p>
                  </div>
                  <button onClick={() => setSelectedEvent(null)} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={24} /></button>
                </div>

                <form onSubmit={handleApply} className="max-w-2xl mx-auto space-y-10 pb-10">
                  {/* Sezione Dati Personali */}
                  <div className="space-y-6">
                    <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.4em] italic ml-4">Dati Candidato</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-4">{t.events.form.name}</Label>
                        <div className="relative">
                          <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                          <Input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="bg-white/5 border-white/10 rounded-full h-14 pl-12 font-bold text-xs tracking-widest focus-visible:ring-white/20" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-4">{t.events.form.email}</Label>
                        <div className="relative">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                          <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-white/5 border-white/10 rounded-full h-14 pl-12 font-bold text-xs tracking-widest focus-visible:ring-white/20" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-4">{t.events.form.phone}</Label>
                        <div className="relative">
                          <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                          <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-white/5 border-white/10 rounded-full h-14 pl-12 font-bold text-xs tracking-widest focus-visible:ring-white/20" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-4">{t.events.form.city}</Label>
                        <div className="relative">
                          <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                          <Input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="bg-white/5 border-white/10 rounded-full h-14 pl-12 font-bold text-xs tracking-widest focus-visible:ring-white/20" />
                        </div>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-4">{t.events.form.instagram}</Label>
                        <div className="relative">
                          <Instagram className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                          <Input required value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} placeholder="@username" className="bg-white/5 border-white/10 rounded-full h-14 pl-12 font-bold text-xs tracking-widest focus-visible:ring-white/20" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sezione Veicolo */}
                  <div className="space-y-6">
                    <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.4em] italic ml-4">{t.events.form.selectVehicle}</h4>
                    {vehicles?.length === 0 ? (
                      <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] text-center">
                        <Car size={32} className="mx-auto text-zinc-800 mb-4" />
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Devi prima aggiungere un veicolo nel tuo Garage.</p>
                        <Button onClick={() => navigate('/profile?tab=garage')} className="mt-6 bg-white text-black rounded-full h-10 px-6 text-[9px] font-black uppercase italic">Vai al Garage</Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {vehicles?.map(v => {
                          const isSelected = formData.vehicleId === v.id;
                          const image = v.images?.[0] || v.image_url;
                          return (
                            <div 
                              key={v.id}
                              onClick={() => setFormData({...formData, vehicleId: v.id})}
                              className={cn(
                                "relative rounded-[1.5rem] overflow-hidden cursor-pointer border-2 transition-all duration-500 group",
                                isSelected ? "border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "border-white/5 hover:border-white/20 bg-zinc-900/50"
                              )}
                            >
                              <div className="aspect-video relative bg-zinc-950">
                                {image ? (
                                  <img src={image} className={cn("w-full h-full object-cover transition-all duration-700", isSelected ? "opacity-100 scale-110" : "opacity-40 grayscale group-hover:grayscale-0")} alt="" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Car size={24} className={cn("transition-colors", isSelected ? "text-white" : "text-zinc-800")} />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                
                                <div className="absolute bottom-3 left-3 right-3">
                                  <p className={cn("text-[10px] font-black italic uppercase truncate transition-colors", isSelected ? "text-white" : "text-zinc-500")}>{v.brand}</p>
                                  <p className="text-[8px] text-zinc-600 font-bold uppercase truncate">{v.model}</p>
                                </div>
                                
                                {isSelected && (
                                  <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-xl animate-in zoom-in duration-300">
                                    <CheckCircle2 size={14} className="text-black" />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Sezione Modifiche */}
                  <div className="space-y-4">
                    <Label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-4">Modifiche Principali</Label>
                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                      <Textarea 
                        value={formData.modifications} 
                        onChange={e => setFormData({...formData, modifications: e.target.value})} 
                        placeholder="Descrivi brevemente le modifiche apportate al progetto..." 
                        className="bg-transparent border-none focus-visible:ring-0 p-0 min-h-[120px] text-sm italic text-white placeholder:text-zinc-800 resize-none" 
                      />
                    </div>
                  </div>

                  {/* Sezione Foto Interni */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                      <Label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">{t.events.form.interiorPhotos}</Label>
                      <span className={cn("text-[9px] font-black uppercase italic", interiorFiles.length >= 3 ? "text-green-500" : "text-zinc-600")}>
                        {interiorFiles.length}/6 {interiorFiles.length < 3 && "(Minimo 3)"}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      {interiorPreviews.map((url, i) => (
                        <div key={i} className="relative w-24 h-24 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl animate-in zoom-in duration-300">
                          <img src={url} className="w-full h-full object-cover" alt="Interior preview" />
                          <button type="button" onClick={() => {
                            const newFiles = [...interiorFiles]; newFiles.splice(i, 1);
                            const newPreviews = [...interiorPreviews]; newPreviews.splice(i, 1);
                            setInteriorFiles(newFiles); setInteriorPreviews(newPreviews);
                          }} className="absolute top-1.5 right-1.5 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-600 transition-colors"><X size={12} /></button>
                        </div>
                      ))}
                      {interiorFiles.length < 6 && (
                        <button 
                          type="button" 
                          onClick={() => interiorInputRef.current?.click()} 
                          className="w-24 h-24 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-white/30 hover:bg-white/10 transition-all group"
                        >
                          <Camera size={20} className="text-zinc-600 group-hover:text-white transition-colors mb-1" />
                          <span className="text-[7px] font-black uppercase text-zinc-600 group-hover:text-white">Aggiungi</span>
                        </button>
                      )}
                      <input type="file" ref={interiorInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                      <Info size={14} className="text-zinc-500 shrink-0" />
                      <p className="text-[8px] font-bold uppercase text-zinc-500 leading-relaxed">
                        Carica foto chiare degli interni per aumentare le possibilità di selezione. Sono richieste almeno 3 foto.
                      </p>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={applyToEvent.isPending || interiorFiles.length < 3 || !formData.vehicleId} 
                    className="w-full bg-white text-black hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] h-16 rounded-full font-black uppercase italic tracking-[0.2em] transition-all duration-500 shadow-2xl shadow-white/10 mt-4 mb-10"
                  >
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
    </div>
  );
};

export default Events;