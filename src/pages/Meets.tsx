"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import { useMeets, Meet } from '@/hooks/use-meets';
import { useAdmin } from '@/hooks/use-admin';
import { useAuth } from '@/hooks/use-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Plus, User, Loader2, ChevronRight, Trash2, RefreshCw, Clock, AlertCircle, LogIn, Info, Search, Navigation, X, Map as MapIcon, List, MapPinned, CheckCircle2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CreateMeetModal from '@/components/CreateMeetModal';
import MeetMap from '@/components/MeetMap';
import MeetDetailModal from '@/components/MeetDetailModal';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/use-translation';
import { showSuccess } from '@/utils/toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Meets = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { meets, isLoading, deleteMeet, toggleParticipation, refetch } = useMeets();
  const { role } = useAdmin();
  const { user, isLoading: authLoading } = useAuth();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMeet, setSelectedMeet] = useState<Meet | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLocationAlertOpen, setIsLocationAlertOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilteringNearMe, setIsFilteringNearMe] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle().then(({ data }) => {
        setUserProfile(data);
      });
    }
  }, [user]);

  const handleManualRefresh = () => {
    if (!user) return;
    setIsRefreshing(true);
    if ('vibrate' in navigator) navigator.vibrate(15);
    window.location.reload();
  };

  const handleNearMe = () => {
    if (!userProfile?.city) {
      setIsLocationAlertOpen(true);
      return;
    }
    setIsFilteringNearMe(!isFilteringNearMe);
    if (!isFilteringNearMe) {
      showSuccess(`Filtrando per incontri vicino a ${userProfile.city}`);
    }
  };

  const filteredMeets = useMemo(() => {
    let result = meets || [];
    if (searchQuery) {
      result = result.filter(meet => 
        meet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meet.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (isFilteringNearMe && userProfile?.city) {
      result = result.filter(meet => 
        meet.location.toLowerCase().includes(userProfile.city.toLowerCase())
      );
    }
    return result;
  }, [meets, searchQuery, isFilteringNearMe, userProfile]);

  const canOrganize = role && ['admin', 'staff', 'support', 'member'].includes(role);

  const handleCreateClose = (newMeet?: Meet) => {
    setIsCreateModalOpen(false);
    if (newMeet) {
      // Se è stato creato un nuovo incontro, lo impostiamo come selezionato 
      // per aprire automaticamente la modale di dettaglio da cui può essere condiviso
      setSelectedMeet(newMeet);
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col bg-transparent">
      <Navbar />
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top)+2rem)] pb-32 px-4 md:px-6 max-w-7xl mx-auto w-full">
        <header className="mb-12 flex items-end justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">Community Gatherings</h2>
            <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase truncate">District Meet</h1>
          </div>
          
          {user && (
            <div className="flex gap-3 ml-4 shrink-0">
              <button 
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="w-12 h-12 bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all shadow-lg border border-white/10 disabled:opacity-50"
              >
                <RefreshCw size={20} className={cn(isRefreshing && "animate-spin")} />
              </button>
              
              {canOrganize && (
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl shadow-white/20"
                >
                  <Plus size={24} />
                </button>
              )}
            </div>
          )}
        </header>

        {authLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-500" size={40} /></div>
        ) : !user ? (
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
              <LogIn size={16} className="mr-2" /> {t.auth.login}
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center shrink-0"><Info size={20} className="text-zinc-400" /></div>
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white italic">Incontri Spontanei</h4>
                <div className="text-[9px] text-zinc-500 font-bold uppercase leading-relaxed italic">
                  <p>Questi incontri sono creati dagli utenti e non sono eventi ufficiali Low District.</p>
                  <p className="mt-2 text-zinc-300 font-black">Lo staff non si assume alcuna responsabilità sull'incontro stesso.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-10">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <Input 
                    placeholder="CERCA PER CITTÀ O TITOLO..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-full h-14 pl-14 pr-6 text-xs font-black uppercase italic tracking-widest focus-visible:ring-white/10 transition-all"
                  />
                </div>
                
                <button 
                  onClick={handleNearMe}
                  className={cn(
                    "h-14 px-6 rounded-full border transition-all flex items-center justify-center gap-3 font-black uppercase italic text-[10px] tracking-widest shadow-xl",
                    isFilteringNearMe ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  )}
                >
                  <MapPinned size={18} />
                  Vicino a me
                </button>
              </div>
              
              <div className="flex bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-1 h-14">
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "flex-1 sm:w-14 flex items-center justify-center gap-2 px-4 rounded-full transition-all duration-500",
                    viewMode === 'list' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-white"
                  )}
                >
                  <List size={18} />
                  <span className="text-[9px] font-black uppercase tracking-widest sm:hidden">Lista</span>
                </button>
                <button 
                  onClick={() => setViewMode('map')}
                  className={cn(
                    "flex-1 sm:w-14 flex items-center justify-center gap-2 px-4 rounded-full transition-all duration-500",
                    viewMode === 'map' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-white"
                  )}
                >
                  <MapIcon size={18} />
                  <span className="text-[9px] font-black uppercase tracking-widest sm:hidden">Mappa</span>
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {viewMode === 'map' ? (
                <motion.div 
                  key="map-view"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-10"
                >
                  <MeetMap meets={filteredMeets || []} onSelectMeet={setSelectedMeet} />
                </motion.div>
              ) : (
                <motion.div 
                  key="list-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10"
                >
                  {filteredMeets?.length === 0 ? (
                    <div className="col-span-full text-center py-24 bg-zinc-900/20 border border-dashed border-white/10 rounded-[3rem]">
                      <MapPin size={48} className="mx-auto text-zinc-800 mb-6" />
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                        {searchQuery ? `Nessun incontro trovato a "${searchQuery}"` : "Nessun incontro in programma."}
                      </p>
                    </div>
                  ) : (
                    filteredMeets?.map((meet) => (
                      <motion.div 
                        key={meet.id} 
                        onClick={() => setSelectedMeet(meet)}
                        className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-white/20 transition-all duration-500 shadow-2xl cursor-pointer"
                      >
                        <div className="aspect-video relative overflow-hidden bg-zinc-950">
                          {meet.image_url ? (
                            <img src={meet.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-900"><MapPin size={64} /></div>
                          )}
                          <div className="absolute top-5 left-5">
                            <div className="bg-white text-black px-4 py-1.5 rounded-full text-[10px] font-black italic shadow-xl flex items-center gap-1.5">
                              <Calendar size={12} /> {format(new Date(meet.date), 'dd MMM', { locale: it }).toUpperCase()}
                            </div>
                          </div>
                          {user?.id === meet.user_id && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteMeet.mutate(meet.id); }}
                              className="absolute top-5 right-5 p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-red-600 transition-all shadow-xl z-10"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>

                        <div className="p-8">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none">{meet.title}</h3>
                            {meet.is_participating && (
                              <div className="bg-green-500/20 text-green-500 p-1.5 rounded-full border border-green-500/20">
                                <CheckCircle2 size={14} />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2 mb-6">
                            <div className="flex items-center gap-2 text-zinc-500">
                              <MapPin size={12} className="text-white" />
                              <span className="text-[10px] font-black uppercase tracking-widest italic truncate">{meet.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-500">
                              <Clock size={12} className="text-white" />
                              <span className="text-[10px] font-black uppercase tracking-widest italic">{format(new Date(meet.date), 'HH:mm')}</span>
                            </div>
                          </div>

                          {/* Preview Partecipanti */}
                          <div className="flex items-center gap-3 mb-8">
                            <div className="flex -space-x-2">
                              {meet.participants?.slice(0, 4).map((p, i) => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-zinc-800 overflow-hidden">
                                  {p.profiles?.avatar_url ? <img src={p.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={10} className="m-auto h-full" />}
                                </div>
                              ))}
                            </div>
                            <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">
                              {meet.participants?.length || 0} Partecipanti
                            </span>
                          </div>

                          <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                            <div className="flex gap-3">
                              <Button 
                                onClick={(e) => { e.stopPropagation(); toggleParticipation.mutate(meet.id); }}
                                disabled={toggleParticipation.isPending}
                                className={cn(
                                  "flex-1 h-12 rounded-full font-black uppercase italic text-[9px] tracking-widest transition-all shadow-lg border",
                                  meet.is_participating 
                                    ? "bg-zinc-800 text-white border-white/10 hover:bg-red-600 hover:border-red-600" 
                                    : "bg-white text-black border-white hover:bg-zinc-200"
                                )}
                              >
                                {toggleParticipation.isPending ? <Loader2 className="animate-spin" size={14} /> : meet.is_participating ? 'ANNULLA' : 'PARTECIPA'}
                              </Button>
                              <Button 
                                onClick={(e) => { e.stopPropagation(); setSelectedMeet(meet); }}
                                variant="outline"
                                className="flex-1 h-12 rounded-full font-black uppercase italic text-[9px] tracking-widest border-white/10 text-white hover:bg-white/5"
                              >
                                DETTAGLI
                              </Button>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
                                {meet.profiles?.avatar_url ? <img src={meet.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={14} className="m-auto h-full text-zinc-600" />}
                              </div>
                              <span className="text-[9px] font-black uppercase italic text-zinc-500">@{meet.profiles?.username}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </main>

      <CreateMeetModal isOpen={isCreateModalOpen} onClose={handleCreateClose} />
      
      {selectedMeet && (
        <MeetDetailModal 
          isOpen={!!selectedMeet} 
          onClose={() => setSelectedMeet(null)} 
          meet={selectedMeet} 
        />
      )}

      <AlertDialog open={isLocationAlertOpen} onOpenChange={setIsLocationAlertOpen}>
        <AlertDialogContent className="bg-black border border-white/10 rounded-[2rem] shadow-2xl">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center rounded-2xl rotate-12">
                <MapPin size={32} className="text-white -rotate-12" />
              </div>
            </div>
            <AlertDialogTitle className="text-white font-black uppercase italic text-center">Città non impostata</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-xs font-bold uppercase leading-relaxed text-center">
              Per usare la funzione "Vicino a me", devi prima impostare la tua città nel profilo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
            <AlertDialogAction 
              onClick={() => navigate('/profile?tab=profile')} 
              className="rounded-full bg-white text-black hover:bg-zinc-200 font-black uppercase italic text-[10px] w-full h-14 transition-all"
            >
              Vai al Profilo
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-full border border-white/10 text-white hover:bg-white/5 font-black uppercase italic text-[10px] w-full h-14 mt-0 transition-all">
              Chiudi
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Meets;