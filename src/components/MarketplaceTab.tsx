"use client";

import React, { useState } from 'react';
import { useUserMarketplace, MarketplaceItem, useMarketplace } from '@/hooks/use-marketplace';
import { Loader2, Tag, Euro, Edit3, Trash2, ChevronRight, ShoppingBag, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import MarketplaceItemDetailModal from './MarketplaceItemDetailModal';
import CreateMarketplaceItemModal from './CreateMarketplaceItemModal';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const MarketplaceTab = ({ userId, isOwnProfile }: { userId: string, isOwnProfile: boolean }) => {
  const navigate = useNavigate();
  const { data: items, isLoading } = useUserMarketplace(userId);
  const { deleteItem } = useMarketplace();
  
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [editingItem, setEditingItem] = useState<MarketplaceItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleDelete = async (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questo annuncio?")) {
      await deleteItem.mutateAsync(id);
      setSelectedItem(null);
    }
  };

  const handleEdit = (item: MarketplaceItem) => {
    setEditingItem(item);
    setSelectedItem(null);
    setIsCreateModalOpen(true);
  };

  if (isLoading) return <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-zinc-500" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black italic uppercase tracking-tighter">I Miei Annunci</h3>
        {isOwnProfile && (
          <Button 
            onClick={() => { setEditingItem(null); setIsCreateModalOpen(true); }}
            className="bg-white/10 text-white border border-white/10 rounded-full h-10 px-6 font-black uppercase italic text-[10px] shadow-xl hover:bg-white/20 transition-all"
          >
            <Plus size={16} className="mr-2" /> Nuovo Annuncio
          </Button>
        )}
      </div>

      {items?.length === 0 ? (
        <div className="bg-zinc-900/30 border border-white/5 p-12 text-center rounded-[2.5rem]">
          <ShoppingBag className="mx-auto text-zinc-800 mb-6" size={48} />
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Non hai ancora pubblicato annunci nel Marketplace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items?.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedItem(item)}
              className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-4 rounded-[2rem] group hover:border-white/20 transition-all cursor-pointer flex flex-col"
            >
              <div className="flex gap-5">
                <div className="w-24 h-24 bg-zinc-950 rounded-2xl overflow-hidden shrink-0 border border-white/5">
                  {item.images?.[0] ? (
                    <img src={item.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-800"><Tag size={24} /></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-black italic uppercase truncate pr-4 text-white">{item.title}</h4>
                    <span className="text-xs font-black italic text-white shrink-0">{item.price} €</span>
                  </div>
                  <p className="text-[8px] font-bold uppercase text-zinc-500 tracking-widest mb-3">
                    Categoria: {item.category}
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                      className="p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      className="p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="ml-auto flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-white transition-colors">
                      Dettagli <ChevronRight size={12} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedItem && (
        <MarketplaceItemDetailModal 
          isOpen={!!selectedItem} 
          onClose={() => setSelectedItem(null)} 
          item={selectedItem}
          isOwnItem={isOwnProfile}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <CreateMarketplaceItemModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        editItem={editingItem} 
      />
    </div>
  );
};

export default MarketplaceTab;