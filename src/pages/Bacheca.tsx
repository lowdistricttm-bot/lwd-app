"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import ActivityItem from '@/components/ActivityItem';
import CreatePostModal from '@/components/CreatePostModal';
import { useBPActivity } from '@/hooks/use-buddypress';
import { Loader2, Plus, AlertCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Bacheca = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: activities, isLoading, error, refetch } = useBPActivity();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [hasWpToken, setHasWpToken] = useState(!!localStorage.getItem('wp-jwt'));

  // Aggiorna lo stato del token ogni volta che l'utente torna su questa pagina
  useEffect(() => {
    const token = localStorage.getItem('wp-jwt');
    setHasWpToken(!!token);
    if (token) refetch(); // Ricarica i dati se l'utente ha appena fatto il login
  }, [location.pathname, refetch]);

  const handleCreatePost = () => {
    if (hasWpToken) {
      setIsPostModalOpen(true);
    } else {
      navigate('/login');
    }
  };

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
            onClick={handleCreatePost}
            className="w-12 h-12 bg-red-600 flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-lg shadow-red-600/20"
          >
            <Plus size={24} />
          </button>
        </header>

        {!hasWpToken && (
          <div className="mb-8 p-6 bg-zinc-900/50 border border-red-600/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="text-red-600 shrink-0" size={24} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-red-600">
                  Sincronizzazione Richiesta
                </p>
                <p className="text-[9px] text-zinc-500 font-bold uppercase mt-1">
                  Accedi per pubblicare post e interagire con il District.
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/login')}
              className="bg-red-600 hover:bg-white hover:text-black text-white rounded-none text-[9px] font-black uppercase tracking-widest h-10 px-6 italic"
            >
              <LogIn size={14} className="mr-2" /> Accedi
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-red-600" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sincronizzazione con il District...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 border border-red-600/20 bg-red-600/5 p-8">
            <AlertCircle className="mx-auto text-red-600 mb-4" size={32} />
            <p className="text-sm font-black uppercase tracking-widest text-red-600">Errore di connessione</p>
            <p className="text-[10px] text-zinc-500 mt-2 uppercase font-bold">Controlla la tua connessione o riprova più tardi.</p>
            <Button onClick={() => refetch()} variant="outline" className="mt-6 border-white/10 text-[10px] font-black uppercase">Ricarica</Button>
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