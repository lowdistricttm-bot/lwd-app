"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import AdminApplicationCard from '@/components/AdminApplicationCard';
import { useAdmin } from '@/hooks/use-admin';
import { 
  Loader2, 
  XCircle, 
  AlertTriangle,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminApplications = () => {
  const navigate = useNavigate();
  const { isAdmin, checkingAdmin, allApplications, loadingApps, loadError, updateStatus } = useAdmin();

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-zinc-500" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Verifica permessi admin...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <XCircle size={64} className="text-zinc-800 mb-6" />
        <h1 className="text-2xl font-black uppercase italic mb-4">Accesso Negato</h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8">Non hai i permessi necessari per accedere a questa sezione.</p>
        <Button onClick={() => navigate('/')} className="bg-white text-black rounded-none font-black uppercase italic px-8 h-12">Torna alla Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-32 px-4 md:px-6 max-w-4xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 text-zinc-500 hover:text-white mb-4 uppercase text-[10px] font-black tracking-widest transition-colors"
            >
              <ChevronLeft size={14} /> Torna al Profilo
            </button>
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">Admin Control Panel</h2>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">Gestione Selezioni</h1>
          </div>
          
          <div className="bg-zinc-900/50 border border-white/5 px-6 py-4 flex items-center gap-4">
            <div className="text-right">
              <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">Totale</p>
              <p className="text-2xl font-black italic">{allApplications?.length || 0}</p>
            </div>
            <div className="w-[1px] h-8 bg-white/10" />
            <div className="text-right">
              <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">In Attesa</p>
              <p className="text-2xl font-black italic text-white">
                {allApplications?.filter((a: any) => a.status === 'pending').length || 0}
              </p>
            </div>
          </div>
        </div>

        {loadError && (
          <div className="bg-zinc-900/20 border border-zinc-700 p-6 mb-8 flex items-center gap-4">
            <AlertTriangle className="text-zinc-500" />
            <p className="text-xs font-bold uppercase">Errore nel caricamento dei dati.</p>
          </div>
        )}

        {loadingApps ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-zinc-500" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Recupero candidature...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allApplications?.map((app: any) => (
              <AdminApplicationCard 
                key={app.id} 
                app={app} 
                onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })}
                isUpdating={updateStatus.isPending}
              />
            ))}
            {allApplications?.length === 0 && (
              <div className="text-center py-20 border border-white/5 bg-zinc-900/30">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Nessuna candidatura presente.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default AdminApplications;