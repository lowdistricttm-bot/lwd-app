"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { motion } from 'framer-motion';
import { ShoppingBag, Search, Plus, MessageSquare, Tag, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Marketplace = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('all');

  const { data: items, isLoading } = useQuery({
    queryKey: ['marketplace', category],
    queryFn: async () => {
      let query = supabase.from('marketplace_items').select('*, profiles:seller_id(username, avatar_url)');
      if (category !== 'all') query = query.eq('category', category);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen text-white flex flex-col bg-transparent">
      <Navbar />
      <main className="flex-1 pt-24 pb-32 px-6 max-w-7xl mx-auto w-full">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">District Marketplace</h2>
            <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase">Bacheca Annunci</h1>
          </div>
          <Button className="bg-white text-black rounded-full h-14 px-8 font-black uppercase italic shadow-xl">
            <Plus size={18} className="mr-2" /> Pubblica Annuncio
          </Button>
        </header>

        <div className="flex gap-4 overflow-x-auto no-scrollbar mb-10 pb-2">
          {['all', 'wheels', 'interior', 'exterior', 'performance'].map((cat) => (
            <button 
              key={cat} 
              onClick={() => setCategory(cat)}
              className={cn(
                "px-6 py-2.5 rounded-full text-[10px] font-black uppercase italic border transition-all",
                category === cat ? "bg-white text-black border-white" : "bg-white/5 text-zinc-500 border-white/10 hover:border-white/30"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-zinc-500" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items?.map((item) => (
              <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-white/20 transition-all">
                <div className="aspect-square bg-zinc-950 relative">
                  {item.images?.[0] && <img src={item.images[0]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" />}
                  <div className="absolute top-5 left-5 bg-white text-black px-4 py-1.5 rounded-full text-[10px] font-black italic shadow-xl">{item.price} €</div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-black italic uppercase tracking-tight">{item.title}</h3>
                    <span className="text-[8px] font-black uppercase text-zinc-500 bg-white/5 px-2 py-1 rounded-md">{item.category}</span>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden">
                        {item.profiles?.avatar_url && <img src={item.profiles.avatar_url} className="w-full h-full object-cover" />}
                      </div>
                      <span className="text-[9px] font-black uppercase italic text-zinc-400">{item.profiles?.username}</span>
                    </div>
                    <Button onClick={() => navigate(`/chat/${item.seller_id}`)} className="bg-white/5 hover:bg-white hover:text-black rounded-full h-10 px-5 text-[9px] font-black uppercase italic transition-all">
                      Contatta
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Marketplace;