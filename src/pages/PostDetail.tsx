"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import FeedPost from '@/components/FeedPost';
import { usePost } from '@/hooks/use-social-feed';
import { Loader2, ChevronLeft, AlertCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { supabase } from "@/integrations/supabase/client";

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
            <AlertCircle className="mx-auto text-zinc-800 mb-4" size={48} />
            <p className="text-sm font-black uppercase tracking-widest text-zinc-500">Post non trovato</p>
            <p className="text-[10px] text-zinc-600 mt-2 uppercase font-bold">Il post potrebbe essere stato rimosso o il link non è corretto.</p>
            <Button 
              onClick={() => navigate('/')}
              className="mt-8 bg-white text-black rounded-none font-black uppercase italic px-8"
            >
              Torna alla Home
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {!isLoggedIn && (
              <div className="p-6 bg-zinc-900/50 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-4">
                  <AlertCircle className="text-zinc-500 shrink-0" size={24} />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Vuoi interagire con questo post?
                    </p>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1">
                      Accedi al District per mettere like e commentare i progetti della community.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/login')}
                  className="bg-white text-black hover:bg-zinc-200 rounded-none text-[9px] font-black uppercase tracking-widest h-10 px-6 italic shrink-0"
                >
                  <LogIn size={14} className="mr-2" /> Accedi Ora
                </Button>
              </div>
            )}
            
            <FeedPost post={post} />
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default PostDetail;