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
            <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase truncate">{t.events.title}</h1>
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
                        <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight">{event.title}</h3>
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

        <EventAdminModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} event={editingEvent} />
        <ManageApplicationModal isOpen={!!manageApp} onClose={() => setManageApp(null)} application={manageApp} />
      </main>
      <BottomNav />
    </div>
  );
};

export default Events;