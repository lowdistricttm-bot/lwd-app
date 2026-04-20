"use client";

import React from 'react';
import { useMarketplace } from '@/hooks/use-marketplace';
import { Loader2, ShoppingBag, Tag, Trash2, Euro, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const MarketplaceTab = ({ userId, isOwnProfile }: { userId: string, isOwnProfile: boolean }) => {
  const { items, isLoading, deleteItem } = useMarketplace('all');
  
  // Filtriamo gli annunci per mostrare solo quelli dell'utente del profilo
  const userItems = items?.filter(item => item.seller_id === userId) || [];

  if (isLoading) return <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-zinc-500" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black italic uppercase tracking-tighter">
          {isOwnProfile ? "I Miei Annunci" : "Annunci in Vendita"}
        </h3>
      </div>

      {userItems.length === 0 ? (
        <div className="bg-zinc-900/30 border border-white/5 p-12 text-center rounded-[2rem]">
          <Tag className="mx-auto text-zinc-800 mb-6" size={48} />
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
            {isOwnProfile ? "Non hai ancora pubblicato annunci." : "Questo utente non ha annunci attivi."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {userItems.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/50 border border-white/5 rounded-[2rem] overflow-hidden group"
            >
              <div className="aspect-video relative bg-zinc-950">
                {item.images?.[0] ? (
                  <img src={item.images[0]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-800"><Tag size={32} /></div>
                )}
                <div className="absolute top-4 left-4 bg-white text-black px-3 py-1 rounded-full text-[9px] font-black italic shadow-xl">
                  {item.price} €
                </div>
                
                {isOwnProfile && (
                  <button 
                    onClick={() => { if(confirm("Eliminare annuncio?")) deleteItem.mutate(item.id); }}
                    className="absolute top-4 right-4 p-2.5 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              
              <div className="p-6">
                <h4 className="text-sm font-black italic uppercase tracking-tight mb-2 truncate">{item.title}</h4>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-4 line-clamp-1">{item.category}</p>
                
                {!isOwnProfile && (
                  <Button 
                    onClick={() => window.location.href = `/chat/${userId}`}
                    className="w-full bg-white/5 border border-white/10 hover:bg-white hover:text-black rounded-full h-10 text-[9px] font-black uppercase italic transition-all"
                  >
                    <MessageSquare size={12} className="mr-2" /> Contatta Venditore
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplaceTab;