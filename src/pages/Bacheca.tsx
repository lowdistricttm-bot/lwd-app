"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import ActivityItem from '@/components/ActivityItem';
import { useBPActivity } from '@/hooks/use-buddypress';
import { Loader2, Plus, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const Bacheca = () => {
  const { data: activities, isLoading, error } = useBPActivity();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-24 px-4 md:px-6 max-w-3xl mx-auto w-full">
        <header className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">
              Community Feed
            </h2>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">
              Bacheca
            </h1>
          </div>
          <button className="w-12 h-12 bg-red-600 flex items-center justify-center hover:bg-white hover:text-black transition-all">
            <Plus size={24} />
          </button>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-red-600" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Caricamento attività...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 border border-red-600/20 bg-red-600/5 p-8">
            <p className="text-sm font-black uppercase tracking-widest text-red-600">Errore di connessione</p>
            <p className="text-xs text-zinc-500 mt-2">Impossibile recuperare i dati dal sito ufficiale.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activities?.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Bacheca;