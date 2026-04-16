"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { useDiscover } from '@/hooks/use-discover';
import { Loader2, Car, Search, Grid, List, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ImageLightbox from '@/components/ImageLightbox';

const Discover = () => {
  const navigate = useNavigate();
  const { allVehicles, loadingVehicles } = useDiscover();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxData, setLightboxData] = useState<{ images: string[], index: number } | null>(null);

  const filteredVehicles = allVehicles?.filter(v => 
    v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.profiles?.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-32 px-4 md:px-6 max-w-7xl mx-auto w-full">
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">Community Garage</h2>
              <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">Esplora Progetti</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                <input 
                  type="text"
                  placeholder="CERCA AUTO O UTENTE..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border-zinc-800 rounded-none h-10 pl-10 text-[10px] font-black uppercase tracking-widest focus:border-white transition-all"
                />
              </div>
              <div className="flex border border-white/10 bg-zinc-900">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn("p-2 transition-colors", viewMode === 'grid' ? "bg-white text-black" : "text-zinc-500 hover:text-white")}
                >
                  <Grid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn("p-2 transition-colors", viewMode === 'list' ? "bg-white text-black" : "text-zinc-500 hover:text-white")}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {loadingVehicles ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-zinc-500" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Caricamento Garage...</p>
          </div>
        ) : filteredVehicles?.length === 0 ? (
          <div className="text-center py-20 border border-white/5 bg-zinc-900/30">
            <Car className="mx-auto text-zinc-800 mb-6" size={48} />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Nessun veicolo trovato.</p>
          </div>
        ) : (
          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"
          )}>
            <AnimatePresence mode="popLayout">
              {filteredVehicles?.map((vehicle, i) => (
                <motion.div 
                  key={vehicle.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "bg-zinc-900/40 border border-white/5 overflow-hidden group hover:border-white/20 transition-all",
                    viewMode === 'list' && "flex flex-col md:flex-row h-auto md:h-48"
                  )}
                >
                  <div 
                    className={cn(
                      "bg-zinc-950 relative overflow-hidden cursor-pointer",
                      viewMode === 'grid' ? "aspect-square" : "aspect-video md:w-72 shrink-0"
                    )}
                    onClick={() => setLightboxData({ images: vehicle.images || [], index: 0 })}
                  >
                    {vehicle.images?.[0] ? (
                      <img 
                        src={vehicle.images[0]} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt={vehicle.model} 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-800"><Car size={32} /></div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </div>

                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm md:text-base font-black italic uppercase tracking-tight truncate">
                          {vehicle.brand} {vehicle.model}
                        </h4>
                        <span className="text-[8px] font-black uppercase bg-white text-black px-1.5 py-0.5 italic">
                          {vehicle.suspension_type}
                        </span>
                      </div>
                      <button 
                        onClick={() => navigate(`/profile/${vehicle.user_id}`)}
                        className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                      >
                        <div className="w-5 h-5 bg-zinc-800 rounded-full overflow-hidden border border-white/10">
                          {vehicle.profiles?.avatar_url ? (
                            <img src={vehicle.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <User size={10} className="m-auto h-full text-zinc-600" />
                          )}
                        </div>
                        <span className="text-[9px] font-black uppercase italic text-zinc-400">
                          @{vehicle.profiles?.username}
                        </span>
                      </button>
                    </div>
                    
                    {viewMode === 'list' && vehicle.description && (
                      <p className="text-xs text-zinc-500 italic line-clamp-2 mt-4">
                        {vehicle.description}
                      </p>
                    )}

                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                      <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
                        {vehicle.year || 'N/A'}
                      </span>
                      <button 
                        onClick={() => navigate(`/profile/${vehicle.user_id}`)}
                        className="text-[9px] font-black uppercase italic text-white border-b border-white/20 hover:border-white transition-all"
                      >
                        Vedi Profilo
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
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