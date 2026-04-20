"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useMeets } from '@/hooks/use-meets';
import { useAdmin } from '@/hooks/use-admin';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Plus, User, Loader2, ChevronRight, Trash2, RefreshCw, Clock, AlertCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreateMeetModal from '@/components/CreateMeetModal';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/use-translation';

const Meets = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { meets, isLoading, deleteMeet, refetch } = useMeets();
  const { role } = useAdmin();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setCurrentUserId(session?.user?.id || null);
    });
    refetch();
  }, [refetch]);

  const handleManualRefresh = () => {
    if (!user) return;
    setIsRefreshing(true);
    refetch().finally(() => setIsRefreshing(false));
  };

  const isSubscriber = role === 'subscriber';

  return (
    <div className="min-h-screen text-white flex flex-col bg-transparent">
      <Navbar />
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top)+2rem)] pb-32 px-6 max-w-5xl mx-auto w-full">
        <header className="mb-16 flex flex-col items-center text-center gap-8">
          <div className="min-w-0">
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">Community Gatherings</h2>
            <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase">District Meet</h1>
          </div>
          
          {user && (
            <div className="flex items-center justify-center gap-4 w-full">
              <button 
                onClick={handleManualRefresh}
                className="w-14 h-14 bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all shadow-lg border border-white/10 shrink-0"
              >
                <RefreshCw size={22} className={cn(isRefreshing && "animate-spin")} />
              </button>
              
              {!isSubscriber && (
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-white text-black rounded-full h-14 px-10 font-black uppercase italic shadow-xl hover:scale-105 transition-all flex-1 sm:flex-none"
                >
                  <Plus size={20} className="mr-2" /> Organizza Incontro
                </Button>
              )}
            </div>
          )}
        </header>

        {!user ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-white/10 backdrop-blur-md border border-white/10 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <AlertCircle className="text-white shrink-0" size={32} />
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-white">Area Riservata</p>
                <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Accedi per visualizzare gli incontri della community.</p>
              </div>
            </div>
            <Button onClick={() => navigate('/login')} className="bg-white text-black hover:scale-105 rounded-full text-[10px] font-black uppercase tracking-widest h-12 px-8 italic shadow-xl">
              <LogIn size={16} className="mr-2" /> Accedi Ora
            </Button>
          </motion.div>
        ) : isLoading && !meets ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-zinc-500" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Sincronizzazione Meet...</p>
          </div>
        ) : meets?.length === 0 ? (
          <div className="text-center py-24 bg-zinc-900/20 border border-dashed border-white/10 rounded-[3rem]">
            <MapPin size={48} className="mx-auto text-zinc-800 mb-6" />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Nessun incontro in programma. Sii il primo a organizzarne uno!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {meets?.map((meet) => (
              <motion.div 
                key={meet.id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-white/20 transition-all duration-500 shadow-2xl"
              >
                <div className="aspect-video relative overflow-hidden bg-zinc-950">
                  {meet.image_url ? (
                    <img src={meet.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-900"><MapPin size={64} /></div>
                  )}
                  <div className="absolute top-5 left-5">
                    <div className="bg-white text-black px-4 py-1.5 rounded-full text-[10px] font-black italic shadow-xl flex items-center gap-2">
                      <Calendar size={12} /> {format(new Date(meet.date), 'dd MMM', { locale: it }).toUpperCase()}
                    </div>
                  </div>
                  {currentUserId === meet.user_id && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteMeet.mutate(meet.id); }}
                      className="absolute top-5 right-5 p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-red-600 transition-all shadow-xl z-10"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-2">{meet.title}</h3>
                      <div className="flex items-center gap-4 text-zinc-500">
                        <span className="text-[10px] font-black uppercase tracking-widest italic flex items-center gap-1.5">
                          <MapPin size={12} className="text-white" /> {meet.location}
                        </span>
                        <span className="text-zinc-800">•</span>
                        <span className="text-[10px] font-black uppercase tracking-widest italic flex items-center gap-1.5">
                          <Clock size={12} className="text-white" /> {format(new Date(meet.date), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 italic leading-relaxed line-clamp-3 mb-8">
                    {meet.description}
                  </p>

                  <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
                        {meet.profiles?.avatar_url ? <img src={meet.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={14} className="m-auto h-full text-zinc-600" />}
                      </div>
                      <span className="text-[9px] font-black uppercase italic text-zinc-500">Organizzato da @{meet.profiles?.username}</span>
                    </div>
                    <button className="text-[9px] font-black uppercase tracking-widest text-white italic flex items-center gap-2 group">
                      Partecipa <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <CreateMeetModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
};

export default Meets;