"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FeedPost from '@/components/FeedPost';
import CreatePostModal from '@/components/CreatePostModal';
import { useSocialFeed } from '@/hooks/use-social-feed';
import { useAdmin } from '@/hooks/use-admin';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Plus, AlertCircle, LogIn, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

const Bacheca = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { posts, isLoading, refetch } = useSocialFeed();
  const { role } = useAdmin();
  const { user, isLoading: authLoading } = useAuth();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const isSubscriber = role === 'subscriber';

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    if ('vibrate' in navigator) navigator.vibrate(10);
    refetch().finally(() => setIsRefreshing(false));
  };

  return (
    <div className="min-h-screen text-white flex flex-col bg-transparent">
      <Navbar />
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top)+2rem)] pb-32 px-4 md:px-6 max-w-2xl mx-auto w-full">
        <header className="mb-12 flex items-end justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">{t.feed.subtitle}</h2>
            <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase truncate">{t.feed.title}</h1>
          </div>
          {user && (
            <div className="flex gap-3 ml-4 shrink-0">
              <button onClick={handleManualRefresh} className="w-12 h-12 bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all shadow-lg border border-white/10">
                <RefreshCw size={20} className={cn(isRefreshing && "animate-spin")} />
              </button>
              {!isSubscriber && (
                <button onClick={() => setIsPostModalOpen(true)} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl shadow-white/20">
                  <Plus size={24} />
                </button>
              )}
            </div>
          )}
        </header>

        {authLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-500" size={40} /></div>
        ) : !user ? (
          <div className="mb-8 p-8 bg-white/10 backdrop-blur-md border border-white/10 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="text-white shrink-0" size={32} />
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-white">{t.feed.private}</p>
                <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Accedi per partecipare alle discussioni del District.</p>
              </div>
            </div>
            <Button onClick={() => navigate('/login')} className="bg-white text-black hover:scale-105 rounded-full text-[10px] font-black uppercase tracking-widest h-12 px-8 italic shadow-xl">
              <LogIn size={16} className="mr-2" /> {t.auth.login}
            </Button>
          </div>
        ) : null}

        {isLoading && !posts ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-zinc-500" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t.feed.syncing}</p>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => <FeedPost key={post.id} post={post} />)}
          </div>
        ) : user && !isLoading && (
          <div className="text-center py-20 opacity-20">
            <p className="text-sm font-black uppercase tracking-widest text-zinc-500">{t.feed.noPosts}</p>
          </div>
        )}
      </main>
      <CreatePostModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} />
    </div>
  );
};

export default Bacheca;