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
  Phone,
  Image as ImageIcon,
  Camera
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

        {loadingApps ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-red-600" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Recupero candidature...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12">
            {allApplications?.map((app: any) => {
              const vehicleImages = app.vehicles?.images || (app.vehicles?.image_url ? [app.vehicles.image_url] : []);
              const interiorImages = app.interior_urls || [];
              const allMedia = [...vehicleImages, ...interiorImages];

              return (
                <div key={app.id} className="bg-zinc-900/40 border border-white/5 overflow-hidden flex flex-col">
                  {/* Header Candidato */}
                  <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-zinc-800 rounded-full overflow-hidden border-2 border-red-600/20">
                        {app.profiles?.avatar_url ? (
                          <img src={app.profiles.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={24} /></div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">{app.profiles?.username || 'Membro District'}</h3>
                        <p className="text-red-600 text-[10px] font-black uppercase tracking-widest italic">{app.full_name}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <div className="bg-black/40 px-4 py-3 border border-white/5 flex items-center gap-3">
                        <Instagram size={16} className="text-red-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{app.instagram || 'N/A'}</span>
                      </div>
                      <div className="bg-black/40 px-4 py-3 border border-white/5 flex items-center gap-3">
                        <Phone size={16} className="text-red-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{app.phone || 'N/A'}</span>
                      </div>
                      <div className="bg-black/40 px-4 py-3 border border-white/5 flex items-center gap-3">
                        <MapPin size={16} className="text-red-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{app.city || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row">
                    {/* Scheda Tecnica */}
                    <div className="lg:w-1/2 p-8 space-y-8 border-r border-white/5">
                      <div>
                        <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-6 flex items-center gap-2">
                          <Car size={14} className="text-red-600" /> Scheda Tecnica Veicolo
                        </h4>
                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-1">
                            <p className="text-[8px] text-zinc-600 font-bold uppercase">Marca e Modello</p>
                            <p className="text-lg font-black uppercase italic">{app.vehicles?.brand} {app.vehicles?.model}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[8px] text-zinc-600 font-bold uppercase">Assetto</p>
                            <p className="text-lg font-black uppercase italic text-red-600">{app.vehicles?.suspension_type}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[8px] text-zinc-600 font-bold uppercase">Anno</p>
                            <p className="text-lg font-black uppercase italic">{app.vehicles?.year || 'N/A'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[8px] text-zinc-600 font-bold uppercase">Targa</p>
                            <p className="text-lg font-black uppercase italic">{app.vehicles?.license_plate || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-black/20 p-6 border border-white/5">
                          <p className="text-[8px] text-zinc-600 font-bold uppercase mb-2">Descrizione Progetto (Garage)</p>
                          <p className="text-xs text-zinc-400 leading-relaxed italic">{app.vehicles?.description || 'Nessuna descrizione.'}</p>
                        </div>
                        <div className="bg-red-600/5 p-6 border border-red-600/10">
                          <p className="text-[8px] text-red-600 font-bold uppercase mb-2">Modifiche per l'Evento</p>
                          <p className="text-xs text-zinc-200 leading-relaxed font-medium italic">{app.modifications || 'Nessuna modifica specifica indicata.'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Media Gallery */}
                    <div className="lg:w-1/2 p-8 bg-black/20">
                      <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-6 flex items-center gap-2">
                        <Camera size={14} className="text-red-600" /> Media Progetto ({allMedia.length})
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto no-scrollbar pr-2">
                        {allMedia.map((url, idx) => (
                          <div key={idx} className="aspect-square bg-zinc-900 border border-white/5 overflow-hidden group/img relative">
                            <img src={url} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" alt="Media" />
                            <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 text-[7px] font-black uppercase italic text-white">
                              {idx < vehicleImages.length ? 'Garage' : 'Interni'}
                            </div>
                          </div>
                        ))}
                        {allMedia.length === 0 && (
                          <div className="col-span-2 aspect-video flex flex-col items-center justify-center border border-dashed border-white/10 text-zinc-700">
                            <ImageIcon size={32} className="mb-2" />
                            <p className="text-[8px] font-black uppercase">Nessuna foto disponibile</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Azioni */}
                  <div className="p-8 bg-zinc-900/50 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "px-6 py-3 text-[10px] font-black uppercase italic tracking-widest flex items-center gap-2",
                        app.status === 'pending' && "bg-zinc-800 text-zinc-400",
                        app.status === 'approved' && "bg-green-600 text-white",
                        app.status === 'rejected' && "bg-red-600 text-white"
                      )}>
                        {app.status === 'pending' ? 'IN ATTESA' : app.status.toUpperCase()}
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Calendar size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{app.events?.title}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                      <Button 
                        onClick={() => updateStatus.mutate({ id: app.id, status: 'approved' })}
                        disabled={app.status === 'approved' || updateStatus.isPending}
                        className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white rounded-none font-black uppercase italic text-[10px] tracking-widest h-12 px-8"
                      >
                        Approva
                      </Button>
                      <Button 
                        onClick={() => updateStatus.mutate({ id: app.id, status: 'rejected' })}
                        disabled={app.status === 'rejected' || updateStatus.isPending}
                        variant="outline"
                        className="flex-1 sm:flex-none border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-none font-black uppercase italic text-[10px] tracking-widest h-12 px-8"
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