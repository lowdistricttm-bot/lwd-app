"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useMarketplace, MARKETPLACE_CATEGORIES } from '@/hooks/use-marketplace';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Plus, MessageSquare, Tag, Filter, Loader2, User, Trash2, Euro, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import CreateMarketplaceItemModal from '@/components/CreateMarketplaceItemModal';
import ImageLightbox from '@/components/ImageLightbox';

const Marketplace = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [lightboxData, setLightboxData] = useState<{ images: string[], index: number } | null>(null);

  const { items, isLoading, deleteItem } = useMarketplace(category);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id || null));
  }, []);

  const handleContact = (sellerId: string) => {
    if (!currentUserId) {
      navigate('/login');
      return;
    }
    navigate(`/chat/${sellerId}`);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Vuoi eliminare questo annuncio?")) {
      deleteItem.mutate(id);
    }
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
          <Button 
            onClick={() => currentUserId ? setIsCreateModalOpen(true) : navigate('/login')}
            className="bg-white text-black rounded-full h-14 px-8 font-black uppercase italic shadow-xl hover:scale-105 transition-all"
          >
            <Plus size={18} className="mr-2" /> Pubblica Annuncio
          </Button>
        </header>

        <div className="flex gap-4 overflow-x-auto no-scrollbar mb-10 pb-2">
          <button 
            onClick={() => setCategory('all')}
            className={cn(
              "px-6 py-2.5 rounded-full text-[10px] font-black uppercase italic border transition-all whitespace-nowrap",
              category === 'all' ? "bg-white text-black border-white" : "bg-white/5 text-zinc-500 border-white/10 hover:border-white/30"
            )}
          >
            TUTTI
          </button>
          {MARKETPLACE_CATEGORIES.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => setCategory(cat.id)}
              className={cn(
                "px-6 py-2.5 rounded-full text-[10px] font-black uppercase italic border transition-all whitespace-nowrap",
                category === cat.id ? "bg-white text-black border-white" : "bg-white/5 text-zinc-500 border-white/10 hover:border-white/30"
              )}
            >
              {cat.label.toUpperCase()}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-zinc-500" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Sincronizzazione Annunci...</p>
          </div>
        ) : items?.length === 0 ? (
          <div className="text-center py-24 bg-zinc-900/20 border border-dashed border-white/10 rounded-[3rem]">
            <ShoppingBag size={48} className="mx-auto text-zinc-800 mb-6" />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Nessun annuncio trovato in questa categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items?.map((item, i) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-white/20 transition-all duration-500 shadow-2xl"
              >
                <div 
                  className="aspect-square bg-zinc-950 relative overflow-hidden cursor-pointer"
                  onClick={() => setLightboxData({ images: item.images, index: 0 })}
                >
                  {item.images?.[0] ? (
                    <img src={item.images[0]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-900"><Tag size={64} /></div>
                  )}
                  <div className="absolute top-5 left-5 bg-white text-black px-4 py-1.5 rounded-full text-[10px] font-black italic shadow-xl flex items-center gap-1.5">
                    <Euro size={12} /> {item.price}
                  </div>
                  <div className="absolute top-5 right-5">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[8px] font-black uppercase px-3 py-1.5 italic rounded-full border border-white/10">
                      {MARKETPLACE_CATEGORIES.find(c => c.id === item.category)?.label || item.category}
                    </span>
                  </div>
                  {currentUserId === item.seller_id && (
                    <button 
                      onClick={(e) => handleDelete(e, item.id)}
                      className="absolute bottom-5 left-5 p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-red-600 transition-all shadow-xl z-10 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-black italic uppercase tracking-tight leading-none">{item.title}</h3>
                  </div>
                  
                  <p className="text-xs text-zinc-400 italic leading-relaxed line-clamp-2 mb-8">
                    {item.description}
                  </p>

                  <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                    <button 
                      onClick={() => navigate(`/profile/${item.seller_id}`)}
                      className="flex items-center gap-3 hover:opacity-70 transition-opacity"
                    >
                      <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
                        {item.profiles?.avatar_url ? <img src={item.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={14} className="m-auto h-full text-zinc-600" />}
                      </div>
                      <span className="text-[9px] font-black uppercase italic text-zinc-500">@{item.profiles?.username}</span>
                    </button>
                    
                    <Button 
                      onClick={() => handleContact(item.seller_id)}
                      className="bg-white/5 hover:bg-white hover:text-black rounded-full h-10 px-6 text-[9px] font-black uppercase italic transition-all border border-white/10"
                    >
                      Contatta <ChevronRight size={14} className="ml-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <CreateMarketplaceItemModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <ImageLightbox images={lightboxData?.images || []} initialIndex={lightboxData?.index || 0} isOpen={!!lightboxData} onClose={() => setLightboxData(null)} />
    </div>
  );
};

export default Marketplace;