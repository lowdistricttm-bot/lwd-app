"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import FeedPost from '@/components/FeedPost';
import { usePost } from '@/hooks/use-social-feed';
import { Loader2, ChevronLeft, Lock, LogIn, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { supabase } from "@/integrations/supabase/client";
import { motion } from 'framer-motion';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: post, isLoading, error } = usePost(postId);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
  }, []);

  // Se non è loggato e il post non viene caricato (bloccato da RLS)
  if (isLoggedIn === false && !post && !isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full text-center space-y-8"
          >
            <div className="w-20 h-20 bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto rotate-45">
              <Lock size={32} className="text-white -rotate-45" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] italic">Contenuto Riservato</h2>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter">Entra nel District</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                Per visualizzare i post e i progetti della community Low District è necessario essere autenticati.
              </p>
            </div>

            <div className="pt-4 space-y-4">
              <Button 
                onClick={() => navigate('/login')}
                className="w-full bg-white text-black hover:bg-zinc-200 rounded-none h-16 font-black uppercase italic tracking-widest transition-all group"
              >
                <LogIn size={18} className="mr-2" /> Accedi Ora <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <button 
                onClick={() => navigate('/')}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors"
              >
                Torna alla Home
              </button>
            </div>
          </motion.div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-24 px-4 md:px-6 max-w-2xl mx-auto w-full">
        <header className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 uppercase text-[10px] font-black tracking-widest transition-colors"
          >
            <ChevronLeft size={16} /> Torna Indietro
          </button>
          <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">
            District Post
          </h2>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">
            Dettaglio Post
          </h1>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-zinc-500" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Caricamento post...</p>
          </div>
        ) : error || !post ? (
          <div className="text-center py-20 border border-white/5 bg-zinc-900/30 p-8">
            <Lock className="mx-auto text-zinc-800 mb-4" size={48} />
            <p className="text-sm font-black uppercase tracking-widest text-zinc-500">Accesso Richiesto</p>
            <p className="text-[10px] text-zinc-600 mt-2 uppercase font-bold">Devi essere loggato per visualizzare questo contenuto.</p>
            <Button 
              onClick={() => navigate('/login')}
              className="mt-8 bg-white text-black hover:bg-zinc-200 rounded-none font-black uppercase italic px-8 h-12 transition-all"
            >
              Vai al Login
            </Button>
          </div>
        ) : (
          <FeedPost post={post} />
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default PostDetail;