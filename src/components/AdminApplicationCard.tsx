"use client";

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Car, 
  User, 
  Instagram, 
  MapPin, 
  Phone,
  Camera,
  ChevronDown,
  ChevronUp,
  UserCheck,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  CreditCard,
  Trash2
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '@/hooks/use-admin';
import { supabase } from "@/integrations/supabase/client";
import ImageLightbox from './ImageLightbox';

interface AdminApplicationCardProps {
  app: any;
  onUpdateStatus: (id: string, status: 'approved' | 'rejected') => void;
  isUpdating: boolean;
}

const AdminApplicationCard = ({ app, onUpdateStatus, isUpdating }: AdminApplicationCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const { canManage, canVote, castVote, deleteApplication } = useAdmin();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  if (!app) return null;

  const vehicleImages = app.vehicles?.images || (app.vehicles?.image_url ? [app.vehicles.image_url] : []);
  const interiorImages = app.interior_urls || [];
  
  const votes = Array.isArray(app.application_votes) ? app.application_votes : [];
  const approveVotes = votes.filter((v: any) => v.vote === 'approve');
  const rejectVotes = votes.filter((v: any) => v.vote === 'reject');
  
  const approveVoters = approveVotes.map((v: any) => v.profiles?.username || 'Membro').join(', ');
  const rejectVoters = rejectVotes.map((v: any) => v.profiles?.username || 'Membro').join(', ');
  
  const myVote = votes.find((v: any) => v.user_id === currentUserId)?.vote;
  const isPending = app.status === 'pending';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Sei sicuro di voler eliminare questa candidatura? L'utente potrà candidarsi di nuovo.")) {
      deleteApplication.mutate(app.id);
    }
  };

  return (
    <>
      <div className={cn(
        "bg-zinc-900/40 border overflow-hidden flex flex-col transition-all hover:border-white/10",
        isPending ? "border-white/5" : "border-white/10 opacity-80"
      )}>
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-4 md:p-6 flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 bg-zinc-800 rounded-full overflow-hidden border border-white/10 shrink-0">
              {app.profiles?.avatar_url ? (
                <img src={app.profiles.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={20} /></div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm md:text-base font-black italic uppercase tracking-tight truncate">
                {app.profiles?.username || 'Membro District'}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest italic truncate">
                  {app.full_name}
                </span>
                <span className="text-[8px] text-zinc-600 font-bold uppercase">• {app.events?.title}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 mr-4">
              <div className="flex items-center gap-1 text-green-500 text-[10px] font-black" title={approveVoters || 'Nessun voto'}>
                <ThumbsUp size={12} /> {approveVotes.length}
              </div>
              <div className="flex items-center gap-1 text-red-500 text-[10px] font-black" title={rejectVoters || 'Nessun voto'}>
                <ThumbsDown size={12} /> {rejectVotes.length}
              </div>
            </div>
            <div className={cn(
              "px-3 py-1 text-[8px] font-black uppercase italic tracking-widest items-center gap-1.5",
              app.status === 'pending' && "bg-zinc-800 text-zinc-400",
              app.status === 'approved' && "bg-green-600 text-white",
              app.status === 'rejected' && "bg-red-600 text-white"
            )}>
              {app.status === 'pending' ? 'IN ATTESA' : app.status === 'approved' ? 'APPROVATA' : 'RIFIUTATA'}
            </div>
            <div className="p-2 text-zinc-500 group-hover:text-white transition-colors">
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="border-t border-white/5 bg-black/20">
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-white/5">
                  <div className="bg-black/40 px-4 py-3 border border-white/5 flex items-center gap-3">
                    <UserCheck size={14} className="text-zinc-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest truncate">{app.full_name}</span>
                  </div>
                  <div className="bg-black/40 px-4 py-3 border border-white/5 flex items-center gap-3">
                    <Instagram size={14} className="text-zinc-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest truncate">{app.instagram || 'N/A'}</span>
                  </div>
                  <div className="bg-black/40 px-4 py-3 border border-white/5 flex items-center gap-3">
                    <Phone size={14} className="text-zinc-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest truncate">{app.phone || 'N/A'}</span>
                  </div>
                  <div className="bg-black/40 px-4 py-3 border border-white/5 flex items-center gap-3">
                    <MapPin size={14} className="text-zinc-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest truncate">{app.city || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-1/2 p-6 space-y-6 border-r border-white/5">
                    <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                      <Car size={12} className="text-zinc-400" /> Scheda Tecnica
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-[7px] text-zinc-600 font-bold uppercase">Marca e Modello</p>
                        <p className="text-sm font-black uppercase italic">{app.vehicles?.brand} {app.vehicles?.model}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[7px] text-zinc-600 font-bold uppercase">Assetto</p>
                        <p className="text-sm font-black uppercase italic text-zinc-400">{app.vehicles?.suspension_type}</p>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <p className="text-[7px] text-zinc-600 font-bold uppercase">Targa Veicolo</p>
                        <div className="flex items-center gap-2">
                          <CreditCard size={14} className="text-white" />
                          <p className="text-sm font-black uppercase italic text-white">{app.vehicles?.license_plate || 'NON INDICATA'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 border border-white/10">
                      <p className="text-[7px] text-zinc-400 font-bold uppercase mb-1">Modifiche</p>
                      <p className="text-[11px] text-zinc-200 leading-relaxed italic whitespace-pre-wrap">{app.modifications || 'Nessuna modifica indicata.'}</p>
                    </div>
                  </div>

                  <div className="lg:w-1/2 p-6">
                    <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-4 flex items-center gap-2">
                      <Camera size={12} className="text-zinc-400" /> Media Progetto
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {[...vehicleImages, ...interiorImages].map((url: string, idx: number) => (
                        <div key={idx} className="aspect-square bg-zinc-900 border border-white/5 overflow-hidden cursor-pointer" onClick={() => setLightboxImage(url)}>
                          <img src={url} className="w-full h-full object-cover" alt="Media" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-zinc-900/50 border-t border-white/5 flex flex-col gap-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">Votazione Staff</p>
                      <div className="flex gap-4">
                        <div className="flex flex-col items-end">
                          <span className="text-[7px] text-zinc-600 font-bold uppercase">Approvazioni ({approveVotes.length})</span>
                          <span className="text-[8px] text-green-500 font-black italic">{approveVoters || 'Nessuno'}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[7px] text-zinc-600 font-bold uppercase">Rifiuti ({rejectVotes.length})</span>
                          <span className="text-[8px] text-red-500 font-black italic">{rejectVoters || 'Nessuno'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {canVote && isPending && (
                      <div className="flex gap-3">
                        <Button 
                          onClick={(e) => { e.stopPropagation(); castVote.mutate({ applicationId: app.id, vote: 'approve' }); }}
                          disabled={castVote.isPending}
                          className={cn(
                            "flex-1 rounded-none font-black uppercase italic text-[9px] tracking-widest h-10",
                            myVote === 'approve' ? "bg-green-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                          )}
                        >
                          {castVote.isPending ? <Loader2 className="animate-spin" /> : <><ThumbsUp size={14} className="mr-2" /> Vota SI</>}
                        </Button>
                        <Button 
                          onClick={(e) => { e.stopPropagation(); castVote.mutate({ applicationId: app.id, vote: 'reject' }); }}
                          disabled={castVote.isPending}
                          className={cn(
                            "flex-1 rounded-none font-black uppercase italic text-[9px] tracking-widest h-10",
                            myVote === 'reject' ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                          )}
                        >
                          {castVote.isPending ? <Loader2 className="animate-spin" /> : <><ThumbsDown size={14} className="mr-2" /> Vota NO</>}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                    <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">Azioni</p>
                    <div className="flex gap-3">
                      {canManage && isPending && (
                        <>
                          <Button 
                            onClick={(e) => { e.stopPropagation(); onUpdateStatus(app.id, 'approved'); }}
                            disabled={isUpdating}
                            className="flex-1 bg-green-600 text-white hover:bg-green-700 rounded-none font-black uppercase italic text-[10px] tracking-widest h-12"
                          >
                            APPROVA
                          </Button>
                          <Button 
                            onClick={(e) => { e.stopPropagation(); onUpdateStatus(app.id, 'rejected'); }}
                            disabled={isUpdating}
                            className="flex-1 bg-red-600 text-white hover:bg-red-700 rounded-none font-black uppercase italic text-[10px] tracking-widest h-12"
                          >
                            NEGA
                          </Button>
                        </>
                      )}
                      {canManage && !isPending && (
                        <Button 
                          onClick={handleDelete}
                          disabled={deleteApplication.isPending}
                          variant="outline"
                          className="flex-1 border-zinc-800 text-zinc-500 hover:bg-red-600 hover:text-white hover:border-red-600 rounded-none font-black uppercase italic text-[10px] tracking-widest h-12 transition-all"
                        >
                          {deleteApplication.isPending ? <Loader2 className="animate-spin" /> : <><Trash2 size={14} className="mr-2" /> Elimina Candidatura</>}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ImageLightbox 
        src={lightboxImage} 
        isOpen={!!lightboxImage} 
        onClose={() => setLightboxImage(null)} 
      />
    </>
  );
};

export default AdminApplicationCard;