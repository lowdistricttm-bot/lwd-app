"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import { useMarketplace, MARKETPLACE_CATEGORIES, MarketplaceItem } from '@/hooks/use-marketplace';
import { useAuth } from '@/hooks/use-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Tag, Loader2, User, Trash2, Euro, ChevronRight, Lock, LogIn, Search, SlidersHorizontal, X, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import CreateMarketplaceItemModal from '@/components/CreateMarketplaceItemModal';
import MarketplaceItemDetailModal from '@/components/MarketplaceItemDetailModal';
import ImageLightbox from '@/components/ImageLightbox';
import { useTranslation } from '@/hooks/use-translation';

const Marketplace = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [editingItem, setEditingItem] = useState<MarketplaceItem | null>(null);
  const [lightboxData, setLightboxData] = useState<{ images: string[], index: number } | null>(null);

  const { items, isLoading, deleteItem } = useMarketplace(category);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMinPrice = minPrice === '' || item.price >= parseFloat(minPrice);
      const matchesMaxPrice = maxPrice === '' || item.price <= parseFloat(maxPrice);
      return matchesSearch && matchesMinPrice && matchesMaxPrice;
    });
  }, [items, searchQuery, minPrice, maxPrice]);

  const handleDelete = (id: string) => {
    if (confirm("Vuoi eliminare questo annuncio?")) {
      deleteItem.mutate(id);
      setSelectedItem(null);
    }
  };

  const handleEdit = (item: MarketplaceItem) => {
    setEditingItem(item);
    setSelectedItem(null);
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="min-h-screen text-white flex flex-col bg-transparent">
      <Navbar />
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top)+2rem)] pb-32 px-6 max-w-7xl mx-auto w-full">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">District Marketplace</h2>
            <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase">Bacheca Annunci</h1>
          </div>
          {user && (
            <Button onClick={() => setIsCreateModalOpen(true)} className="bg-white text-black rounded-full h-14 px-8 font-black uppercase italic shadow-xl hover:scale-105 transition-all">
              <Plus size={18} className="mr-2" /> Pubblica Annuncio
            </Button>
          )}
        </header>

        {authLoading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-zinc-500" size={40} /></div>
        ) : !user ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-white/10 backdrop-blur-md border border-white/10 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-zinc-900 border border-white/10 flex items-center justify-center rotate-45 shrink-0"><Lock size={32} className="text-white -rotate-45" /></div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-white">Area Riservata</p>
                <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Accedi per visualizzare e pubblicare annunci nel Marketplace.</p>
              </div>
            </div>
            <Button onClick={() => navigate('/login')} className="bg-white text-black hover:scale-105 rounded-full text-[10px] font-black uppercase tracking-widest h-12 px-8 italic shadow-xl">Accedi Ora</Button>
          </motion.div>
        ) : (
          <>
            <div className="flex flex-col gap-6 mb-10">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <Input placeholder="CERCA NEGLI ANNUNCI..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-white/5 border-white/10 rounded-full h-14 pl-14 pr-6 text-xs font-black uppercase italic tracking-widest focus:bg-white/10 transition-all" />
                </div>
                <Button onClick={() => setShowFilters(!showFilters)} className={cn("h-14 w-14 rounded-full border transition-all", showFilters ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white")}><SlidersHorizontal size={20} /></Button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <p className="text-[8px] font-black uppercase text-zinc-500 ml-4 italic">Range di Prezzo (€)</p>
                        <div className="flex gap-3">
                          <Input type="number" placeholder="MIN" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="bg-black/40 border-white/5 rounded-full h-12 px-6 text-xs font-bold" />
                          <Input type="number" placeholder="MAX" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="bg-black/40 border-white/5 rounded-full h-12 px-6 text-xs font-bold" />
                        </div>
                      </div>
                      <div className="flex items-end justify-end gap-3">
                        <Button variant="ghost" onClick={() => { setMinPrice(''); setMaxPrice(''); setSearchQuery(''); setCategory('all'); }} className="text-[9px] font-black uppercase italic text-zinc-500 hover:text-white">Reset Filtri</Button>
                        <Button onClick={() => setShowFilters(false)} className="bg-white text-black rounded-full h-12 px-8 text-[9px] font-black uppercase italic">Applica</Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                <button onClick={() => setCategory('all')} className={cn("px-6 py-2.5 rounded-full text-[10px] font-black uppercase italic border transition-all whitespace-nowrap", category === 'all' ? "bg-white text-black border-white" : "bg-white/5 text-zinc-500 border-white/10 hover:border-white/30")}>TUTTI</button>
                {MARKETPLACE_CATEGORIES.map((cat) => (
                  <button key={cat.id} onClick={() => setCategory(cat.id)} className={cn("px-6 py-2.5 rounded-full text-[10px] font-black uppercase italic border transition-all whitespace-nowrap", category === cat.id ? "bg-white text-black border-white" : "bg-white/5 text-zinc-500 border-white/10 hover:border-white/30")}>{cat.label.toUpperCase()}</button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center gap-4"><Loader2 className="animate-spin text-zinc-500" size={40} /><p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Sincronizzazione Annunci...</p></div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-24 bg-zinc-900/20 border border-dashed border-white/10 rounded-[3rem]"><ShoppingBag size={48} className="mx-auto text-zinc-800 mb-6" /><p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Nessun annuncio trovato con questi filtri.</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredItems.map((item, i) => (
                  <motion.div 
                    key={`market-item-${item.id}-${i}`} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: i * 0.05 }} 
                    onClick={() => setSelectedItem(item)}
                    className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-white/20 transition-all duration-500 shadow-2xl cursor-pointer"
                  >
                    <div className="aspect-square bg-zinc-950 relative overflow-hidden">
                      {item.images?.[0] ? <img src={item.images[0]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" alt="" /> : <div className="w-full h-full flex items-center justify-center text-zinc-900"><Tag size={64} /></div>}
                      <div className="absolute top-5 left-5 bg-white text-black px-4 py-1.5 rounded-full text-[10px] font-black italic shadow-xl flex items-center gap-1.5"><Euro size={12} /> {item.price}</div>
                      <div className="absolute top-5 right-5"><span className="bg-black/60 backdrop-blur-md text-white text-[8px] font-black uppercase px-3 py-1.5 italic rounded-full border border-white/10">{MARKETPLACE_CATEGORIES.find(c => c.id === item.category)?.label || item.category}</span></div>
                    </div>
                    <div className="p-8">
                      <h3 className="text-xl font-black italic uppercase tracking-tight leading-none mb-4">{item.title}</h3>
                      <p className="text-xs text-zinc-400 italic leading-relaxed line-clamp-2 mb-8">{item.description}</p>
                      <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/profile/${item.seller_id}`); }} className="flex items-center gap-3 hover:opacity-70 transition-opacity">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-white/10">{item.profiles?.avatar_url ? <img src={item.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={14} className="m-auto h-full text-zinc-600" />}</div>
                          <span className="text-[9px] font-black uppercase italic text-zinc-500">@{item.profiles?.username}</span>
                        </button>
                        <div className="text-[9px] font-black uppercase tracking-widest text-white italic flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Dettagli <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <CreateMarketplaceItemModal 
        isOpen={isCreateModalOpen} 
        onClose={handleCloseCreateModal} 
        editItem={editingItem} 
      />

      {selectedItem && (
        <MarketplaceItemDetailModal 
          isOpen={!!selectedItem} 
          onClose={() => setSelectedItem(null)} 
          item={selectedItem}
          isOwnItem={user?.id === selectedItem.seller_id}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <ImageLightbox images={lightboxData?.images || []} initialIndex={lightboxData?.index || 0} isOpen={!!lightboxData} onClose={() => setLightboxData(null)} />
    </div>
  );
};

export default Marketplace;