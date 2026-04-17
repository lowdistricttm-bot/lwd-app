"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { useDiscover } from '@/hooks/use-discover';
import { Loader2, Car, Search, Grid, List, User, Users, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ImageLightbox from '@/components/ImageLightbox';

const Discover = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [lightboxData, setLightboxData] = useState<{ images: string[], index: number } | null>(null);

  // Debounce per non sovraccaricare il DB durante la digitazione
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { vehicles, users, newMembers, isLoading } = useDiscover(debouncedSearch);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-32 px-4 md:px-6 max-w-7xl mx-auto w-full">
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">
                {debouncedSearch ? "Risultati Ricerca" : "Community Garage"}
              </h2>
              <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">
                {debouncedSearch ? `"${debouncedSearch}"` : "Esplora Progetti"}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input 
                  type="text"
                  placeholder="CERCA AUTO O MEMBRI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/50 border-zinc-800 rounded-none h-12 pl-12 text-[11px] font-black uppercase tracking-widest focus:border-white focus:bg-zinc-900 transition-all placeholder:text-zinc-700"
                />
                {isLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-zinc-600" size={16} />}
              </div>
              <div className="hidden md:flex border border-white/10 bg-zinc-900">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn("p-3 transition-colors", viewMode === 'grid' ? "bg-white text-black" : "text-zinc-500 hover:text-white")}
                >
                  <Grid size={20} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn("p-3 transition-colors", viewMode === 'list' ? "bg-white text-black" : "text-zinc-500 hover:text-white")}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Sezione Utenti (mostrata solo durante la ricerca) */}
        <AnimatePresence>
          {debouncedSearch && users && users.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 space-y-4"
            >
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2 italic">
                <Users size={12} /> Membri Trovati
              </h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                {users.map((user) => (
                  <button 
                    key={user.id}
                    onClick={() => navigate(`/profile/${user.id}`)}
                    className="flex flex-col items-center gap-3 shrink-0 group"
                  >
                    <div className="w-20 h-20 rounded-full p-[2px] bg-zinc-800 group-hover:bg-white transition-all duration-500">
                      <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-zinc-900">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-700"><User size={32} /></div>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase italic truncate w-24">{user.username}</p>
                      {user.is_admin && <p className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest">Staff</p>}
                    </div>
                  </button>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Sezione Nuovi Membri (mostrata quando non si cerca) */}
        {!debouncedSearch && newMembers && newMembers.length > 0 && (
          <section className="mb-16">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2 italic mb-6">
              <Sparkles size={12} /> Nuovi nel District
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {newMembers.map((member) => (
                <button 
                  key={member.id}
                  onClick={() => navigate(`/profile/${member.id}`)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/5 group-hover:border-white transition-all">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-700"><User size={16} /></div>
                    )}
                  </div>
                  <span className="text-[8px] font-black uppercase italic truncate w-full text-center text-zinc-400 group-hover:text-white">
                    {member.username}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Griglia Veicoli */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2 italic">
              <Car size={12} /> {debouncedSearch ? "Progetti Corrispondenti" : "Ultimi Progetti Caricati"}
            </h3>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-zinc-500" size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Sincronizzazione Garage...</p>
            </div>
          ) : vehicles?.length === 0 ? (
            <div className="text-center py-24 border border-white/5 bg-zinc-900/20">
              <Car className="mx-auto text-zinc-800 mb-6" size={64} />
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Nessun veicolo trovato nel District.</p>
            </div>
          ) : (
            <div className={cn(
              "grid gap-6",
              viewMode === 'grid' ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"
            )}>
              <AnimatePresence mode="popLayout">
                {vehicles?.map((vehicle, i) => (
                  <motion.div 
                    key={vehicle.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={cn(
                      "bg-zinc-900/40 border border-white/5 overflow-hidden group hover:border-white/20 transition-all duration-500",
                      viewMode === 'list' && "flex flex-col md:flex-row h-auto md:h-56"
                    )}
                  >
                    <div 
                      className={cn(
                        "bg-zinc-950 relative overflow-hidden cursor-pointer",
                        viewMode === 'grid' ? "aspect-[4/5]" : "aspect-video md:w-80 shrink-0"
                      )}
                      onClick={() => setLightboxData({ images: vehicle.images || [], index: 0 })}
                    >
                      {vehicle.images?.[0] ? (
                        <img 
                          src={vehicle.images[0]} 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                          alt={vehicle.model} 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-800"><Car size={48} /></div>
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                      
                      {/* Badge Assetto */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-white text-black text-[8px] font-black uppercase px-2 py-1 italic shadow-xl">
                          {vehicle.suspension_type}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="min-w-0">
                            <h4 className="text-base md:text-lg font-black italic uppercase tracking-tight truncate leading-tight">
                              {vehicle.brand}
                            </h4>
                            <p className="text-xs font-black uppercase text-zinc-400 italic truncate">
                              {vehicle.model}
                            </p>
                          </div>
                          <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
                            {vehicle.year || 'N/A'}
                          </span>
                        </div>

                        <button 
                          onClick={() => navigate(`/profile/${vehicle.user_id}`)}
                          className="flex items-center gap-3 hover:opacity-70 transition-opacity bg-white/5 p-2 pr-4 rounded-full w-fit"
                        >
                          <div className="w-6 h-6 bg-zinc-800 rounded-full overflow-hidden border border-white/10">
                            {vehicle.profiles?.avatar_url ? (
                              <img src={vehicle.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={12} /></div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-black uppercase italic text-zinc-300">
                              @{vehicle.profiles?.username}
                            </span>
                            {vehicle.profiles?.is_admin && <ShieldCheck size={10} className="text-white" />}
                          </div>
                        </button>
                      </div>
                      
                      {viewMode === 'list' && vehicle.description && (
                        <p className="text-xs text-zinc-500 italic line-clamp-3 mt-4 leading-relaxed">
                          {vehicle.description}
                        </p>
                      )}

                      <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                        <div className="flex gap-2">
                          {/* Qui potremmo aggiungere icone per modifiche specifiche in futuro */}
                        </div>
                        <button 
                          onClick={() => navigate(`/profile/${vehicle.user_id}`)}
                          className="group flex items-center gap-2 text-[9px] font-black uppercase italic text-white transition-all"
                        >
                          Vedi Progetto <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      <ImageLightbox 
        images={lightboxData?.images || []} 
        initialIndex={lightboxData?.index || 0} 
        isOpen={!!lightboxData} 
        onClose={() => setLightboxData(null)} 
      />
      
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Discover;