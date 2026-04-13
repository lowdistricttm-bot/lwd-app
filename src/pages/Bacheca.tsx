"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import FeedPost from '@/components/FeedPost';
import CreatePostModal from '@/components/CreatePostModal';
import { useSocialFeed } from '@/hooks/use-social-feed';
import { Loader2, Plus, AlertCircle, LogIn, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from "@/integrations/supabase/client";

const Bacheca = () => {
  const navigate = useNavigate();
  const { posts, isLoading, error } = useSocialFeed();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleCreatePost = () => {
    if (user) {
      setIsPostModalOpen(true);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-24 px-4 md:px-6 max-w-2xl mx-auto w-full">
        <header className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">
              District Feed
            </h2>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">
              Bacheca
            </h1>
          </div>
          <button 
            onClick={handleCreatePost}
            className="w-12 h-12 bg-red-600 flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-lg shadow-red-600/20"
          >
            <Plus size={24} />
          </button>
        </header>

        {error && (
          <div className="mb-8 p-6 bg-red-900/20 border border-red-600/50 flex items-center gap-4">
            <AlertCircle className="text-red-600" />
            <p className="text-xs font-bold uppercase">Errore nel caricamento del feed. Riprova più tardi.</p>
          </div>
        )}

        {!user && !isLoading && (
          <div className="mb-8 p-6 bg-zinc-900/50 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="text-zinc-500 shrink-0" size={24} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Community Privata
                </p>
                <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1">
                  Accedi per partecipare alle discussioni del District.
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/login')}
              className="bg-white text-black hover:bg-red-600 hover:text-white rounded-none text-[9px] font-black uppercase tracking-widest h-10 px-6 italic"
            >
              <LogIn size={14} className="mr-2" /> Accedi
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-red-600" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sincronizzazione District...</p>
          </div>
        ) : posts?.length === 0 ? (
          <div className="text-center py-20 border border-white/5 bg-zinc-900/30 p-8">
            <p className="text-sm font-black uppercase tracking-widest text-zinc-500">Nessun post presente</p>
            <p className="text-[10px] text-zinc-600 mt-2 uppercase font-bold">Inaugura la bacheca con il tuo primo post!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {posts?.map((post) => (
              <FeedPost key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>

      <CreatePostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
      />

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Bacheca;