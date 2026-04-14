"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { useAdmin } from '@/hooks/use-admin';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Car, 
  User, 
  Instagram, 
  Mail, 
  MapPin, 
  Calendar,
  AlertTriangle,
  ChevronLeft,
  Clock,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const AdminApplications = () => {
  const navigate = useNavigate();
  const { isAdmin, checkingAdmin, allApplications, loadingApps, loadError, updateStatus } = useAdmin();

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-red-600" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Verifica permessi admin...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <XCircle size={64} className="text-red-600 mb-6" />
        <h1 className="text-2xl font-black uppercase italic mb-4">Accesso Negato</h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8">Non hai i permessi necessari per accedere a questa sezione.</p>
        <Button onClick={() => navigate('/')} className="bg-white text-black rounded-none font-black uppercase italic px-8 h-12">Torna alla Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-32 px-6 max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 text-zinc-500 hover:text-white mb-4 uppercase text-[10px] font-black tracking-widest transition-colors"
            >
              <ChevronLeft size={14} /> Torna al Profilo
            </button>
            <h2 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">Admin Control Panel</h2>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">Gestione Selezioni</h1>
          </div>
          
          <div className="bg-zinc-900/50 border border-white/5 px-6 py-4 flex items-center gap-4">
            <div className="text-right">
              <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">Totale Candidature</p>
              <p className="text-2xl font-black italic">{allApplications?.length || 0}</p>
            </div>
            <div className="w-[1px] h-8 bg-white/10" />
            <div className="text-right">
              <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">In Attesa</p>
              <p className="text-2xl font-black italic text-red-600">
                {allApplications?.filter((a: any) => a.status === 'pending').length || 0}
              </p>
            </div>
          </div>
        </div>

        {loadError && (
          <div className="bg-red-900/20 border border-red-600/50 p-6 mb-8 flex items-center gap-4">
            <AlertTriangle className="text-red-600" />
            <p className="text-xs font-bold uppercase">Errore nel caricamento dei dati. Riprova tra poco.</p>
          </div>
        )}

        {loadingApps ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-red-600" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Recupero candidature dal database...</p>
          </div>
        ) : allApplications?.length === 0 ? (
          <div className="text-center py-24 border border-white/5 bg-zinc-900/30">
            <Clock className="mx-auto text-zinc-800 mb-6" size={48} />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Nessuna candidatura presente nel sistema.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {allApplications?.map((app: any) => (
              <div key={app.id} className="bg-zinc-900/40 border border-white/5 overflow-hidden flex flex-col lg:flex-row">
                {/* Media & Vehicle Info */}
                <div className="lg:w-1/3 relative">
                  <div className="aspect-video lg:h-full bg-zinc-950 overflow-hidden">
                    {app.vehicles?.image_url ? (
                      <img src={app.vehicles.image_url} className="w-full h-full object-cover" alt="Veicolo" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-800"><Car size={48} /></div>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black p-6">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">{app.vehicles?.brand} {app.vehicles?.model}</h3>
                    <p className="text-red-600 text-[9px] font-black uppercase tracking-widest italic">{app.vehicles?.suspension_type} • {app.vehicles?.year}</p>
                  </div>
                </div>

                {/* Candidate Details */}
                <div className="flex-1 p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest border-b border-white/5 pb-2">Candidato</h4>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-800 rounded-full overflow-hidden border border-white/10">
                          {app.profiles?.avatar_url ? (
                            <img src={app.profiles.avatar_url} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={16} /></div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase italic">{app.profiles?.username || 'Membro'}</p>
                          <p className="text-[9px] text-zinc-500 font-bold uppercase">{app.full_name || `${app.profiles?.first_name} ${app.profiles?.last_name}`}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest border-b border-white/5 pb-2">Evento</h4>
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-red-600" />
                        <div>
                          <p className="text-xs font-black uppercase italic">{app.events?.title}</p>
                          <p className="text-[9px] text-zinc-500 font-bold uppercase">{app.events?.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-black/40 p-4 border border-white/5 flex items-center gap-3">
                      <Instagram size={16} className="text-red-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest truncate">{app.instagram || 'N/A'}</span>
                    </div>
                    <div className="bg-black/40 p-4 border border-white/5 flex items-center gap-3">
                      <Phone size={16} className="text-red-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest truncate">{app.phone || 'N/A'}</span>
                    </div>
                    <div className="bg-black/40 p-4 border border-white/5 flex items-center gap-3">
                      <MapPin size={16} className="text-red-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest truncate">{app.city || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="bg-black/40 p-6 border border-white/5">
                    <p className="text-[9px] font-black uppercase text-zinc-500 mb-3 italic">Scheda Tecnica Veicolo:</p>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[8px] text-zinc-600 font-bold uppercase">Marca/Modello</p>
                          <p className="text-xs font-black uppercase italic">{app.vehicles?.brand} {app.vehicles?.model}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-zinc-600 font-bold uppercase">Assetto</p>
                          <p className="text-xs font-black uppercase italic">{app.vehicles?.suspension_type}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[8px] text-zinc-600 font-bold uppercase">Descrizione Garage</p>
                        <p className="text-xs text-zinc-300 leading-relaxed font-medium">{app.vehicles?.description || 'Nessuna descrizione nel garage.'}</p>
                      </div>
                      {app.modifications && (
                        <div className="pt-4 border-t border-white/5">
                          <p className="text-[8px] text-red-600 font-bold uppercase">Modifiche per questo evento</p>
                          <p className="text-xs text-zinc-300 leading-relaxed font-medium italic">{app.modifications}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                    <div className={cn(
                      "px-6 py-3 text-[10px] font-black uppercase italic tracking-widest flex items-center gap-2",
                      app.status === 'pending' && "bg-zinc-800 text-zinc-400",
                      app.status === 'approved' && "bg-green-600 text-white",
                      app.status === 'rejected' && "bg-red-600 text-white"
                    )}>
                      {app.status === 'pending' && <Clock size={14} />}
                      {app.status === 'approved' && <CheckCircle size={14} />}
                      {app.status === 'rejected' && <XCircle size={14} />}
                      Stato: {app.status === 'pending' ? 'IN ATTESA' : app.status.toUpperCase()}
                    </div>

                    <div className="flex-1" />

                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button 
                        onClick={() => updateStatus.mutate({ id: app.id, status: 'approved' })}
                        disabled={app.status === 'approved' || updateStatus.isPending}
                        className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white rounded-none font-black uppercase italic text-[10px] tracking-widest h-12 px-6"
                      >
                        Approva
                      </Button>
                      <Button 
                        onClick={() => updateStatus.mutate({ id: app.id, status: 'rejected' })}
                        disabled={app.status === 'rejected' || updateStatus.isPending}
                        variant="outline"
                        className="flex-1 sm:flex-none border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-none font-black uppercase italic text-[10px] tracking-widest h-12 px-6"
                      >
                        Nega
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default AdminApplications;