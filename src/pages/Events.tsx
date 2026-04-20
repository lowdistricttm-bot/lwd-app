"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useEvents, Event, useUserApplications } from '@/hooks/use-events';
import { useMeets, Meet } from '@/hooks/use-meets';
import { useAdmin } from '@/hooks/use-admin';
import { useBodyLock } from '@/hooks/use-body-lock';
import { Button } from '@/components/ui/button';
import { Car, Loader2, ChevronRight, X, MapPin, Calendar, Plus, Settings2, Lock, User as UserIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import EventAdminModal from '@/components/EventAdminModal';
import ManageApplicationModal from '@/components/ManageApplicationModal';
import CreateMeetModal from '@/components/CreateMeetModal';
import { useTranslation } from '@/hooks/use-translation';

const Events = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { role, isAdmin } = useAdmin();
  
  const [viewMode, setViewMode] = useState<'official' | 'meets'>('official');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isMeetModalOpen, setIsMeetModalOpen] = useState(false);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [manageApp, setManageApp] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const { events, isLoading: eventsLoading } = useEvents();
  const { meets, isLoading: meetsLoading, deleteMeet } = useMeets();
  const { data: userApps, isLoading: appsLoading } = useUserApplications();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
  }, []);

  useBodyLock(!!viewingEvent || !!manageApp || isEventModalOpen || isMeetModalOpen);

  const isSubscriber = role === 'subscriber';

  return (
    <div className="min-h-screen text-white flex flex-col bg-transparent">
      <Navbar />
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top)+2rem)] pb-32 px-6 max-w-4xl mx-auto w-full">
        
        <header className="mb-12">
          <div className="flex items-end justify-between mb-8">
            <div className="min-w-0 flex-1">
              <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">District Calendar</h2>
              <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase truncate">Eventi</h1>
            </div>
            {user && !isSubscriber && (
              <Button 
                onClick={() => viewMode === 'official' ? setIsEventModalOpen(true) : setIsMeetModalOpen(true)} 
                className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl ml-4 shrink-0"
              >
                <Plus size={24} />
              </Button>
            )}
          </div>

          <div className="flex bg-zinc-900/50 backdrop-blur-md rounded-full p-1 border border-white/5">
            <button 
              onClick={() => setViewMode('official')}
              className={cn(
                "flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest italic transition-all duration-500",
                viewMode === 'official' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Ufficiali
            </button>
            <button 
              onClick={() => setViewMode('meets')}
              className={cn(
                "flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest italic transition-all duration-500",
                viewMode === 'meets' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              District Meets
            </button>
          </div>
        </header>

        {(eventsLoading || meetsLoading || appsLoading) ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-500" size={40} /></div>
        ) : (
          <div className="space-y-8">
            {viewMode === 'official' ? (
              events?.map((event) => {
                const existingApp = userApps?.find(app => app.event_id === event.id);
                return (
                  <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-white/20 transition-all duration-500">
                    <div className="flex flex-col md:flex-row">
                      {event.image_url && (
                        <div className="md:w-56 h-56 md:h-auto shrink-0 overflow-hidden">
                          <img src={event.image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                        </div>
                      )}
                      <div className="flex-1 p-8 flex flex-col justify-center gap-6">
                        <div>
                          <span className={cn(
                            "text-[8px] font-black uppercase px-3 py-1 italic rounded-full inline-flex items-center gap-1.5 mb-3",
                            existingApp ? "bg-white text-black" : "bg-zinc-800 text-zinc-400"
                          )}>
                            {existingApp ? <Settings2 size={10} /> : <Calendar size={10} />}
                            {existingApp ? `STATO: ${existingApp.status.toUpperCase()}` : event.status.toUpperCase()}
                          </span>
                          <h3 className="text-2xl font-black italic uppercase tracking-tight">{event.title}</h3>
                          <div className="flex gap-4 mt-2 text-[10px] font-black uppercase text-zinc-500">
                            <span className="flex items-center gap-1.5"><MapPin size={14} /> {event.location}</span>
                            <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(event.date).toLocaleDateString('it-IT')}</span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => setViewingEvent(event)} className="flex-1 bg-white/10 border border-white/10 h-12 rounded-full text-[10px] font-black uppercase italic hover:bg-white/20 transition-all">Dettagli</button>
                          {existingApp ? (
                            <button onClick={() => setManageApp(existingApp)} className="flex-1 bg-zinc-800 h-12 rounded-full text-[10px] font-black uppercase italic hover:bg-zinc-700 transition-all">Gestisci</button>
                          ) : (
                            <button onClick={() => !user ? navigate('/login') : null} disabled={event.status !== 'open'} className="flex-1 bg-white text-black h-12 rounded-full text-[10px] font-black uppercase italic hover:scale-105 transition-all disabled:opacity-30">Invia Selezione</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              meets?.map((meet) => (
                <motion.div key={meet.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-white/20 transition-all duration-500">
                  <div className="flex flex-col md:flex-row">
                    {meet.image_url && (
                      <div className="md:w-56 h-56 md:h-auto shrink-0 overflow-hidden">
                        <img src={meet.image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                      </div>
                    )}
                    <div className="flex-1 p-8 flex flex-col justify-center gap-6">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
                            {meet.profiles?.avatar_url && <img src={meet.profiles.avatar_url} className="w-full h-full object-cover" />}
                          </div>
                          <span className="text-[9px] font-black uppercase italic text-zinc-500">Organizzato da @{meet.profiles?.username}</span>
                        </div>
                        {user?.id === meet.user_id && (
                          <button onClick={() => deleteMeet.mutate(meet.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tight">{meet.title}</h3>
                        <div className="flex gap-4 mt-2 text-[10px] font-black uppercase text-zinc-500">
                          <span className="flex items-center gap-1.5"><MapPin size={14} /> {meet.location}</span>
                          <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(meet.date).toLocaleString('it-IT')}</span>
                        </div>
                        <p className="mt-4 text-sm text-zinc-400 italic line-clamp-2">{meet.description}</p>
                      </div>
                      <button onClick={() => navigate(`/chat/${meet.user_id}`)} className="w-full bg-white/5 border border-white/10 h-12 rounded-full text-[10px] font-black uppercase italic hover:bg-white hover:text-black transition-all">Contatta Organizzatore</button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            
            {((viewMode === 'official' && events?.length === 0) || (viewMode === 'meets' && meets?.length === 0)) && (
              <div className="text-center py-24 bg-zinc-900/20 border border-dashed border-white/10 rounded-[3rem]">
                <Calendar size={48} className="mx-auto text-zinc-800 mb-6" />
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Nessun evento in programma.</p>
              </div>
            )}
          </div>
        )}

        <EventAdminModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} />
        <CreateMeetModal isOpen={isMeetModalOpen} onClose={() => setIsMeetModalOpen(false)} />
        <ManageApplicationModal isOpen={!!manageApp} onClose={() => setManageApp(null)} application={manageApp} />
      </main>
    </div>
  );
};

export default Events;