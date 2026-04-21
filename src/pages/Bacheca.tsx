"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FeedPost from '@/components/FeedPost';
import CreatePostModal from '@/components/CreatePostModal';
import { useSocialFeed } from '@/hooks/use-social-feed';
import { useAdmin } from '@/hooks/use-admin';
import { useAuth } from '@/hooks/use-auth';
import { useRoleRequests } from '@/hooks/use-role-requests';
import { Loader2, Plus, AlertCircle, LogIn, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Bacheca = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { posts, isLoading, refetch } = useSocialFeed();
  const { role } = useAdmin();
  const { user, isLoading: authLoading } = useAuth();
  const { myRequest, sendRequest } = useRoleRequests();
  
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRestrictedOpen, setIsRestrictedOpen] = useState(false);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const isSubscriber = role === 'subscriber';

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    if ('vibrate' in navigator) navigator.vibrate(10);
    refetch().finally(() => setIsRefreshing(false));
  };

  const handleCreateClick = () => {
    if (isSubscriber) {
      setIsRestrictedOpen(true);
    } else {
      setIsPostModalOpen(true);
    }
  };

  const handleUpgradeRequest = async () => {
    if (myRequest) {
      setIsRestrictedOpen(false);
      navigate('/profile?tab=profile');
      return;
    }
    await sendRequest.mutateAsync('subscriber_plus');
    setIsRestrictedOpen(false);
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
              <button 
                onClick={handleCreateClick} 
                className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl shadow-white/20"
              >
                <Plus size={24} />
              </button>
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

      <AlertDialog open={isRestrictedOpen} onOpenChange={setIsRestrictedOpen}>
        <AlertDialogContent className="bg-black/60 backdrop-blur-2xl border-white/10 rounded-[2rem]">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center rounded-2xl rotate-12">
                <ShieldAlert size={32} className="text-white -rotate-12" />
              </div>
            </div>
            <AlertDialogTitle className="text-white font-black uppercase italic text-center">Accesso Limitato</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-xs font-bold uppercase leading-relaxed text-center">
              La pubblicazione di post è una funzione esclusiva riservata ai membri ufficiali del District e agli Iscritti+.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
            <button 
              onClick={handleUpgradeRequest}
              disabled={sendRequest.isPending}
              className="rounded-full bg-white text-black hover:bg-zinc-200 font-black uppercase italic text-[10px] w-full h-14 transition-all flex items-center justify-center gap-2 shadow-xl"
            >
              {sendRequest.isPending ? <Loader2 className="animate-spin" size={14} /> : <><Sparkles size={14} /> {myRequest ? 'Vedi Stato Richiesta' : 'Richiedi Upgrade ISCRITTO+'}</>}
            </button>
            <AlertDialogAction 
              onClick={() => window.open('https://www.lowdistrict.it/selection-lwdstrct/', '_blank')} 
              className="rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 font-black uppercase italic text-[10px] w-full h-14 transition-all"
            >
              Invia Selezione Ufficiale
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-full border-white/10 text-white hover:bg-white/5 font-black uppercase italic text-[10px] w-full h-14 mt-0 transition-all">
              Chiudi
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Bacheca;