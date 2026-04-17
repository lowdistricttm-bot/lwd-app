"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import AdminApplicationCard from '@/components/AdminApplicationCard';
import { useAdmin } from '@/hooks/use-admin';
import { 
  Loader2, 
  XCircle, 
  AlertTriangle,
  ChevronLeft,
  Clock,
  CheckCircle2,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminApplications = () => {
  const navigate = useNavigate();
  const { canVote, checkingAdmin, allApplications, loadingApps, loadError, updateStatus } = useAdmin();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-zinc-500" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Verifica permessi...</p>
      </div>
    );
  }

  if (!canVote) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <XCircle size={64} className="text-zinc-800 mb-6" />
        <h1 className="text-2xl font-black uppercase italic mb-4">Accesso Negato</h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8">Non hai i permessi necessari.</p>
        <button onClick={() => navigate('/')} className="bg-white text-black h-12 px-8 rounded-full font-black uppercase italic">Home</button>
      </div>
    );
  }

  const pendingApps = allApplications?.filter((a: any) => a.status === 'pending') || [];
  const completedApps = allApplications?.filter((a: any) => a.status !== 'pending') || [];
  
  const displayedApps = activeTab === 'pending' ? pendingApps : completedApps;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-32 px-6 max-w-4xl mx-auto w-full">
        <div className="mb-12">
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 uppercase text-[10px] font-black tracking-widest transition-colors"
          >
            <ChevronLeft size={16} /> Torna alla Dashboard
          </button>
          <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">Admin Control Panel</h2>
          <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase">Selezioni</h1>
        </div>

        <div className="flex bg-zinc-900/50 backdrop-blur-md rounded-full p-1 mb-10 border border-white/5">
          <button 
            onClick={() => setActiveTab('pending')}
            className={cn(
              "flex-1 flex items-center justify-center gap-3 py-3 px-4 rounded-full transition-all duration-500",
              activeTab === 'pending' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Clock size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest italic">In Attesa ({pendingApps.length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={cn(
              "flex-1 flex items-center justify-center gap-3 py-3 px-4 rounded-full transition-all duration-500",
              activeTab === 'completed' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <CheckCircle2 size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Completate ({completedApps.length})</span>
          </button>
        </div>

        {loadError && (
          <div className="bg-zinc-900/20 border border-zinc-700 p-6 mb-8 flex items-center gap-4 rounded-3xl">
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
          <div className="space-y-6">
            {displayedApps.map((app: any) => (
              <AdminApplicationCard 
                key={app.id} 
                app={app} 
                onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })}
                isUpdating={updateStatus.isPending}
              />
            ))}
            {displayedApps.length === 0 && (
              <div className="text-center py-24 bg-zinc-900/20 border border-white/5 rounded-[2.5rem]">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                  {activeTab === 'pending' ? 'Nessuna candidatura in attesa.' : 'Nessuna candidatura gestita.'}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default AdminApplications;