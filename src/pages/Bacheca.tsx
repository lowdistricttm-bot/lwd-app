"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import FeedPost from '@/components/FeedPost';
import CreatePostModal from '@/components/CreatePostModal';
import { useSocialFeed } from '@/hooks/use-social-feed';
import { useAdmin } from '@/hooks/use-admin';
import { Loader2, Plus, AlertCircle, LogIn, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

const Bacheca = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { posts, isLoading, error } = useSocialFeed();
  const { role } = useAdmin();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const isSubscriber = role === 'subscriber';

  const handleCreatePost = () => {
    if (user) {
      setIsPostModalOpen(true);
    } else {
      navigate('/login');
    }
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    if ('vibrate' in navigator) navigator.vibrate(10);
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-24 px-4 md:px-6 max-w-2xl mx-auto w-full">
        <header className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">{t.feed.subtitle}</h2>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">{t.feed.title}</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={handleManualRefresh} className="w-12 h-12 bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 transition-all shadow-lg border border-white/5">
              <RefreshCw size={20} className={cn(isRefreshing && "animate-spin")} />
            </button>
            {/* Nascondi il tasto + se l'utente è un semplice iscritto */}
            {!isSubscriber && (
              <button onClick={handleCreatePost} className="w-12 h-12 bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition-all shadow-lg shadow-white/5">
                <Plus size={24} />
              </button>
            )}
          </div>
        </header>

        {error && (
          <div className="mb-8 p-6 bg-zinc-900/20 border border-zinc-700 flex items-center gap-4">
            <AlertCircle className="text-zinc-500" />
            <p className="text-xs font-bold uppercase">{t.errors.connection}</p>
          </div>
        )}

        {!user && (
          <div className="mb-8 p-6 bg-zinc-900/50 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="text-zinc-500 shrink-0" size={24} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t.feed.private}</p>
                <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1">Accedi per partecipare alle discussioni del District.</p>
              </div>
            </div>
            <Button onClick={() => navigate('/login')} className="bg-white text-black hover:bg-zinc-200 rounded-none text-[9px] font-black uppercase tracking-widest h-10 px-6 italic"><LogIn size={14} className="mr-2" /> {t.auth.login}</Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-zinc-500" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t.feed.syncing}</p>
          </div>
        ) : (posts?.length === 0 && user) ? (
          <div className="text-center py-20 border border-white/5 bg-zinc-900/30 p-8">
            <p className="text-sm font-black uppercase tracking-widest text-zinc-500">{t.feed.noPosts}</p>
            <p className="text-[10px] text-zinc-600 mt-2 uppercase font-bold">{t.feed.noPostsDesc}</p>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-2">
            {posts.map((post) => <FeedPost key={post.id} post={post} />)}
          </div>
        ) : null}
      </main>

      <CreatePostModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} />
      <Footer /><BottomNav />
    </div>
  );
};

export default Bacheca;