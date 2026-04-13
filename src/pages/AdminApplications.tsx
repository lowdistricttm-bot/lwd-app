"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { useAdmin } from '@/hooks/use-admin';
import { Loader2, CheckCircle, XCircle, ExternalLink, Car, User, Instagram, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const AdminApplications = () => {
  const navigate = useNavigate();
  const { isAdmin, checkingAdmin, allApplications, loadingApps, updateStatus } = useAdmin();

  if (checkingAdmin) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-red-600" size={40} /></div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <XCircle size={64} className="text-red-600 mb-6" />
        <h1 className="text-2xl font-black uppercase italic mb-4">Accesso Negato</h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8">Non hai i permessi per accedere a questa sezione.</p>
        <Button onClick={() => navigate('/')} className="bg-white text-black rounded-none font-black uppercase italic">Torna alla Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-32 px-6 max-w-6xl mx-auto w-full">
        <header className="mb-12">
          <h2 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">Admin Panel</h2>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">Gestione Selezioni</h1>
        </header>

        {loadingApps ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600" size={40} /></div>
        ) : allApplications?.length === 0 ? (
          <div className="text-center py-20 border border-white/5 bg-zinc-900/30">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Nessuna candidatura da revisionare.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {allApplications?.map((app: any) => (
              <div key={app.id} className="bg-zinc-900/40 border border-white/5 p-6 flex flex-col lg:flex-row gap-8">
                {/* Info Veicolo */}
                <div className="lg:w-1/3 space-y-4">
                  <div className="aspect-video bg-zinc-950 border border-white/5 overflow-hidden">
                    {app.vehicles?.image_url ? (
                      <img src={app.vehicles.image_url} className="w-full h-full object-cover" alt="Veicolo" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-800"><Car size={48} /></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">{app.vehicles?.brand} {app.vehicles?.model}</h3>
                    <p className="text-red-600 text-[9px] font-black uppercase tracking-widest italic">{app.vehicles?.suspension_type} • {app.vehicles?.year}</p>
                  </div>
                </div>

                {/* Info Candidato */}
                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-zinc-400">
                      <User size={14} className="text-red-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{app.profiles?.username || 'Membro'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-400">
                      <Instagram size={14} className="text-red-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Instagram</span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-400">
                      <Mail size={14} className="text-red-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Email</span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-400">
                      <MapPin size={14} className="text-red-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Città</span>
                    </div>
                  </div>

                  <div className="bg-black/40 p-4 border border-white/5">
                    <p className="text-[9px] font-black uppercase text-zinc-500 mb-2 italic">Modifiche Dichiarate:</p>
                    <p className="text-xs text-zinc-300 leading-relaxed">{app.vehicles?.description || 'Nessuna descrizione'}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "text-[10px] font-black uppercase px-3 py-1 italic",
                      app.status === 'pending' && "bg-zinc-800 text-zinc-400",
                      app.status === 'approved' && "bg-green-600 text-white",
                      app.status === 'rejected' && "bg-red-600 text-white"
                    )}>
                      Stato: {app.status}
                    </span>
                  </div>
                </div>

                {/* Azioni */}
                <div className="lg:w-48 flex flex-col gap-2 justify-center">
                  <Button 
                    onClick={() => updateStatus.mutate({ id: app.id, status: 'approved' })}
                    disabled={app.status === 'approved' || updateStatus.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-none font-black uppercase italic text-[10px] tracking-widest h-12"
                  >
                    <CheckCircle size={16} className="mr-2" /> Approva
                  </Button>
                  <Button 
                    onClick={() => updateStatus.mutate({ id: app.id, status: 'rejected' })}
                    disabled={app.status === 'rejected' || updateStatus.isPending}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-none font-black uppercase italic text-[10px] tracking-widest h-12"
                  >
                    <XCircle size={16} className="mr-2" /> Nega
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default AdminApplications;