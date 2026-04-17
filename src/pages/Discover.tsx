"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { useDiscover } from '@/hooks/use-discover';
import { useGarage } from '@/hooks/use-garage';
import { Loader2, Car, Search, LayoutGrid, StretchHorizontal, User, ChevronRight, ShieldCheck, Sparkles, Calendar, Gauge, Users, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ImageLightbox from '@/components/ImageLightbox';
import { useTranslation } from '@/hooks/use-translation';

const Discover = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [lightboxData, setLightboxData] = useState<{ images: string[], index: number } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { vehicles, users, newMembers, isLoading } = useDiscover(debouncedSearch);
  const { toggleLike } = useGarage();

  const getRoleLabel = (role: string) => {
    return t.profile.roles[role] || t.profile.roles.member;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-32 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <header className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-8">
            <div className="space-y-2">
              <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] italic">
                {debouncedSearch ? "Risultati Ricerca" : "District Showroom"}
              </h2>
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
                {debouncedSearch ? `"${debouncedSearch}"` : "Esplora"}
              </h1>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input 
                  type="text"
                  placeholder="CERCA AUTO O MEMBRI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-none h-14 pl-12 text-[11px] font-black uppercase tracking-widest focus:border-white/20 focus:bg-zinc-900 transition-all placeholder:text-zinc-700"
                />
                {isLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-zinc-600" size={16} />}
              </div>

              <div className="flex border border-white/10 bg-zinc-900/50 p-1 h-14">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "flex-1 sm:w-14 flex items-center justify-center gap-2 px-4 transition-all", 
                    viewMode === 'grid' ? "bg-white text-black" : "text-zinc-500 hover:text-white"
                  )}
                >
                  <LayoutGrid size={18} />
                  <span className="text-[9px] font-black uppercase tracking-widest sm:hidden">Griglia</span>
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "flex-1 sm:w-14 flex items-center justify-center gap-2 px-4 transition-all", 
                    viewMode === 'list' ? "bg-white text-black" : "text-zinc-500 hover:text-white"
                  )}
                >
                  <StretchHorizontal size={18} />
                  <span className="text-[9px] font-black uppercase tracking-widest sm:hidden">Lista</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Sezione Utenti */}
        <AnimatePresence>
          {debouncedSearch && users && users.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 space-y-6"
            >
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2 italic border-b border-white/5 pb-4">
                <Users size={12} /> Membri Trovati
              </h3>
              <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
                {users.map((user) => (
                  <button 
                    key={user.id}
                    onClick={() => navigate(`/profile/${user.id}`)}
                    className="flex flex-col items-center gap-3 shrink-0 group"
                  >
                    <div className="w-24 h-24 rounded-full p-[3px] bg-zinc-800 group-hover:bg-white transition-all duration-500">
                      <div className="w-full h-full rounded-full border-4 border-black overflow-hidden bg-zinc-900">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-700"><User size={32} /></div>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-black uppercase italic truncate w-28">{user.username}</p>
                      {user.is_admin && <p className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Staff</p>}
                    </div>
                  </button>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Sezione Nuovi Membri */}
        {!debouncedSearch && newMembers && newMembers.length > 0 && (
          <section className="mb-14">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2 italic mb-6">
              <Sparkles size={12} /> Nuovi nel District
            </h3>
            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
              {newMembers.map((member) => (
                <button 
                  key={member.id}
                  onClick={() => navigate(`/profile/${member.id}`)}
                  className="flex flex-col items-center gap-3 shrink-0 group"
                >
                  <div className="w-16 h-16 rounded-full p-[2px] bg-zinc-900 border border-white/10 group-hover:border-white transition-all duration-500">
                    <div className="w-full h-full rounded-full overflow-hidden bg-zinc-950">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-800"><User size={24} /></div>
                      )}
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase italic truncate w-20 text-center text-zinc-500 group-hover:text-white transition-colors">
                    {member.username}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2 italic">
              <Car size={12} /> {debouncedSearch ? "Progetti Corrispondenti" : "Ultimi Progetti Caricati"}
            </h3>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="animate-spin text-zinc-500" size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Sincronizzazione Garage...</p>
            </div>
          ) : (
            <div className={cn(
              "grid gap-6",
              viewMode === 'grid' ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"
            )}>
              <AnimatePresence mode="popLayout">
                {vehicles?.map((vehicle, i) => {
                  const roleLabel = getRoleLabel(vehicle.profiles?.role || 'member');
                  
                  return (
                    <motion.div 
                      key={vehicle.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "bg-zinc-900/30 border border-white/5 overflow-hidden group hover:border-white/20 transition-all duration-500",
                        viewMode === 'list' && "flex flex-col md:flex-row items-stretch md:h-48"
                      )}
                    >
                      <div 
                        className={cn(
                          "bg-zinc-950 relative overflow-hidden cursor-pointer shrink-0",
                          viewMode === 'grid' ? "aspect-[4/5]" : "aspect-video md:w-72"
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
                        
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          <span className="bg-white text-black text-[8px] font-black uppercase px-2 py-1 italic shadow-2xl">
                            {vehicle.suspension_type}
                          </span>
                        </div>

                        {/* Like Badge */}
                        <div className="absolute bottom-4 right-4">
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleLike.mutate(vehicle.id); }}
                            className={cn(
                              "flex items-center gap-1.5 px-2 py-1 backdrop-blur-md border transition-all",
                              vehicle.is_liked ? "bg-red-500 border-red-500 text-white" : "bg-black/40 border-white/10 text-white hover:bg-white/20"
                            )}
                          >
                            <Heart size={10} fill={vehicle.is_liked ? "currentColor" : "none"} />
                            <span className="text-[8px] font-black">{vehicle.likes_count || 0}</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col justify-between flex-1 min-w-0">
                        <div className={cn(
                          "flex flex-col gap-4",
                          viewMode === 'list' && "md:flex-row md:items-center md:justify-between h-full"
                        )}>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="text-lg md:text-xl font-black italic uppercase tracking-tight truncate leading-none">
                                {vehicle.brand}
                              </h4>
                              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest bg-white/5 px-1.5 py-0.5">
                                {vehicle.year || 'N/A'}
                              </span>
                            </div>
                            <p className="text-xs font-black uppercase text-zinc-400 italic truncate">
                              {vehicle.model}
                            </p>
                            
                            {viewMode === 'list' && vehicle.description && (
                              <p className="text-[11px] text-zinc-500 italic line-clamp-2 mt-3 leading-relaxed hidden md:block">
                                {vehicle.description}
                              </p>
                            )}
                          </div>

                          {viewMode === 'list' && (
                            <div className="hidden md:flex items-center gap-12 px-8 border-x border-white/5">
                              <div className="space-y-1">
                                <p className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Assetto</p>
                                <div className="flex items-center gap-2 text-zinc-300">
                                  <Gauge size={12} />
                                  <span className="text-[10px] font-black uppercase italic">{vehicle.suspension_type}</span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Apprezzamenti</p>
                                <div className="flex items-center gap-2 text-zinc-300">
                                  <Heart size={12} className={vehicle.is_liked ? "text-red-500 fill-red-500" : ""} />
                                  <span className="text-[10px] font-black uppercase italic">{vehicle.likes_count || 0} Like</span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className={cn(
                            "flex items-center justify-between",
                            viewMode === 'list' && "md:w-64 md:pl-8"
                          )}>
                            <button 
                              onClick={() => navigate(`/profile/${vehicle.user_id}`)}
                              className="flex items-center gap-3 hover:opacity-70 transition-opacity group/user text-left"
                            >
                              {viewMode === 'list' && (
                                <div className="w-8 h-8 bg-zinc-800 rounded-full overflow-hidden border border-white/10 group-hover/user:border-white transition-colors">
                                  {vehicle.profiles?.avatar_url ? (
                                    <img src={vehicle.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={14} /></div>
                                  )}
                                </div>
                              )}
                              <div className="flex flex-col items-start">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-black uppercase italic text-zinc-300 group-hover/user:text-white transition-colors">
                                    {vehicle.profiles?.username}
                                  </span>
                                  {vehicle.profiles?.is_admin && <ShieldCheck size={10} className="text-white" />}
                                </div>
                                <span className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest leading-none">
                                  {roleLabel}
                                </span>
                              </div>
                            </button>

                            <button 
                              onClick={() => navigate(`/profile/${vehicle.user_id}?tab=garage`)}
                              className="md:hidden p-2 text-zinc-500 hover:text-white transition-colors"
                            >
                              <ChevronRight size={20} />
                            </button>
                          </div>
                        </div>
                        
                        {viewMode === 'grid' && (
                          <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                            <button 
                              onClick={() => navigate(`/profile/${vehicle.user_id}?tab=garage`)}
                              className="group flex items-center gap-2 text-[9px] font-black uppercase italic text-zinc-400 hover:text-white transition-all"
                            >
                              Vedi Progetto <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        )}

                        {viewMode === 'list' && (
                          <div className="hidden md:block ml-6">
                            <button 
                              onClick={() => navigate(`/profile/${vehicle.user_id}?tab=garage`)}
                              className="h-10 px-6 bg-white text-black hover:bg-zinc-200 transition-all text-[9px] font-black uppercase italic tracking-widest flex items-center gap-2"
                            >
                              Vedi Progetto <ChevronRight size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
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