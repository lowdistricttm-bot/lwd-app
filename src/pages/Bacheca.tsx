"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import ActivityItem from '@/components/ActivityItem';
import CreatePostModal from '@/components/CreatePostModal';
import { useBPActivity } from '@/hooks/use-buddypress';
import { Loader2, Plus, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Bacheca = () => {
  const { data: activities, isLoading, error, refetch } = useBPActivity();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  
  const hasWpToken = !!localStorage.getItem('wp-jwt');
  const isAuthError = error?.message.includes('401') || !hasWpToken;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-24 px-4 md:px-6 max-w-3xl mx-auto w-full">
        <header className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">
              Community Feed
            </h2>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">
              Bacheca
            </h1>
          </div>
          <button 
            onClick={() => setIsPostModalOpen(true)}
            className="w-12 h-12 bg-red-600 flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-lg shadow-red-600/20"
          >
            <Plus size={24} />
          </button>
        </header>

        {!hasWpToken && (
          <div className="mb-8 p-4 bg-red-600/10 border border-red-600/20 flex items-center gap-4">
            <AlertCircle className="text-red-600 shrink-0" size={20} />
            <p className="text-[10px] font-black uppercase tracking-widest text-red-600">
              Sessione WordPress non rilevata. Per interagire, effettua nuovamente il login.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-red-600" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sincronizzazione con il District...</p>
          </div>
        ) : isAuthError && !activities ? (
          <div className="text-center py-20 border border-white/5 bg-zinc-900/30 p-10">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="text-red-600" size={24} />
            </div>
            <h3 className="text-xl font-black uppercase italic mb-4">Accesso Riservato</h3>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-8">
              La bacheca richiede una sessione attiva sul sito ufficiale. <br /> 
              Effettua il login per vedere i post e interagire.
            </p>
            <Button 
              onClick={() => window.location.href = '/login'}
              className="bg-white text-black hover:bg-red-600 hover:text-white rounded-none px-8 py-6 text-[10px] font-black uppercase tracking-widest italic"
            >
              Vai al Login
            </Button>
          </div>
        ) : error ? (
          <div className="text-center py-20 border border-red-600/20 bg-red-600/5 p-8">
            <p className="text-sm font-black uppercase tracking-widest text-red-600">Errore di rete</p>
            <p className="text-xs text-zinc-500 mt-2">{error.message}</p>
            <Button onClick={() => refetch()} className="mt-4 bg-zinc-900 text-white rounded-none text-[10px] font-black uppercase">Riprova</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {activities?.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
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