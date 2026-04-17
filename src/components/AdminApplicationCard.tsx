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
  Trash2,
  Image as ImageIcon
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
  const [lightboxData, setLightboxData] = useState<{ images: string[], index: number } | null>(null);
  const { canManage, canVote, castVote, deleteApplication } = useAdmin();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  if (!app) return null;

  const vehicleImages = Array.isArray(app.vehicles?.images) ? app.vehicles.images : (app.vehicles?.image_url ? [app.vehicles.image_url] : []);
  const interiorImages = Array.isArray(app.interior_urls) ? app.interior_urls : [];
  const allImages = [...vehicleImages, ...interiorImages];
  
  const votes = Array.isArray(app.application_votes) ? app.application_votes : [];
  const approveVotes = votes.filter((v: any) => v.vote === 'approve');
  const rejectVotes = votes.filter((v: any) => v.vote === 'reject');
  
  const approveVoters = approveVotes.map((v: any) => v.profiles?.username || 'Utente').join(', ');
  const rejectVoters = rejectVotes.map((v: any) => v.profiles?.username || 'Utente').join(', ');
  
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
        "bg-zinc-900/40 backdrop-blur-md border overflow-hidden flex flex-col transition-all duration-500 rounded-[2rem]",
        isPending ? "border-white/5" : "border-white/10 opacity-80",
        isExpanded && "border-white/20 bg-zinc-900/60"
      )}>
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-6 flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 bg-zinc-800 rounded-full overflow-hidden border border-white/10 shrink-0">
              {app.profiles?.avatar_url ? (
                <img src={app.profiles.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={24} /></div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black italic uppercase tracking-tight truncate">
                {app.profiles?.username || 'Utente'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
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
              "px-4 py-1.5 text-[8px] font-black uppercase italic tracking-widest rounded-full",
              app.status === 'pending' && "bg-zinc-800 text-zinc-400",
              app.status === 'approved' && "bg-white text-black",
              app.status === 'rejected' && "bg-zinc-700 text-white"
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
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border-b border-white/5">
                  {[
                    { icon: UserCheck, val: app.full_name },
                    { icon: Instagram, val: app.instagram || 'N/A' },
                    { icon: Phone, val: app.phone || 'N/A' },
                    { icon: MapPin, val: app.city || 'N/A' }
                  ].map((item, i) => (
                    <div key={i} className="bg-white/5 px-4 py-3 rounded-2xl border border-white/5 flex items-center gap-3">
                      <item.icon size={14} className="text-zinc-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest truncate text-zinc-300">{item.val}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-1/2 p-8 space-y-8 border-r border-white/5">
                    <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2 italic">
                      <Car size={12} className="text-zinc-400" /> Scheda Tecnica
                    </h4>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <p className="text-[7px] text-zinc-600 font-bold uppercase">Marca e Modello</p>
                        <p className="text-base font-black uppercase italic">{app.vehicles?.brand} {app.vehicles?.model}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[7px] text-zinc-600 font-bold uppercase">Assetto</p>
                        <p className="text-base font-black uppercase italic text-zinc-400">{app.vehicles?.suspension_type}</p>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <p className="text-[7px] text-zinc-600 font-bold uppercase mb-2">Targa Veicolo (Sempre Visibile Staff)</p>
                        <div className="flex items-center gap-3 bg-white text-black p-3 rounded-xl border border-black shadow-xl w-fit">
                          <CreditCard size={16} />
                          <p className="text-sm font-black uppercase italic tracking-widest">{app.vehicles?.license_plate || 'NON INDICATA'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/5 p-6 rounded-[1.5rem] border border-white/5">
                      <p className="text-[7px] text-zinc-500 font-bold uppercase mb-2 italic">Modifiche</p>
                      <p className="text-xs text-zinc-300 leading-relaxed italic whitespace-pre-wrap">{app.modifications || 'Nessuna modifica indicata.'}</p>
                    </div>
                  </div>

                  <div className="lg:w-1/2 p-8">
                    <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-6 flex items-center gap-2 italic">
                      <Camera size={12} className="text-zinc-400" /> Media Progetto ({allImages.length})
                    </h4>
                    
                    <div className="space-y-8">
                      <div>
                        <p className="text-[7px] font-black uppercase text-zinc-600 mb-3 tracking-widest">Esterni</p>
                        <div className="grid grid-cols-4 gap-3">
                          {vehicleImages.map((url: string, idx: number) => (
                            <div key={`ext-${idx}`} className="aspect-square bg-zinc-900 rounded-xl border border-white/5 overflow-hidden cursor-pointer group/img" onClick={() => setLightboxData({ images: allImages, index: idx })}>
                              <img src={url} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" alt="Esterno" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {interiorImages.length > 0 && (
                        <div>
                          <p className="text-[7px] font-black uppercase text-zinc-600 mb-3 tracking-widest">Interni</p>
                          <div className="grid grid-cols-4 gap-3">
                            {interiorImages.map((url: string, idx: number) => (
                              <div key={`int-${idx}`} className="aspect-square bg-zinc-900 rounded-xl border border-white/5 overflow-hidden cursor-pointer group/img relative" onClick={() => setLightboxData({ images: allImages, index: vehicleImages.length + idx })}>
                                <img src={url} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" alt="Interno" />
                                <div className="absolute top-1.5 right-1.5">
                                  <ImageIcon size={10} className="text-white/40" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-zinc-900/50 border-t border-white/5 flex flex-col gap-8">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest italic">Votazione Staff</p>
                      <div className="flex gap-6">
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
                      <div className="flex gap-4">
                        <Button 
                          onClick={(e) => { e.stopPropagation(); castVote.mutate({ applicationId: app.id, vote: 'approve' }); }}
                          disabled={castVote.isPending}
                          className={cn(
                            "flex-1 rounded-full font-black uppercase italic text-[9px] tracking-widest h-12 transition-all shadow-lg",
                            myVote === 'approve' ? "bg-green-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                          )}
                        >
                          {castVote.isPending ? <Loader2 className="animate-spin" /> : <><ThumbsUp size={14} className="mr-2" /> Vota SI</>}
                        </Button>
                        <Button 
                          onClick={(e) => { e.stopPropagation(); castVote.mutate({ applicationId: app.id, vote: 'reject' }); }}
                          disabled={castVote.isPending}
                          className={cn(
                            "flex-1 rounded-full font-black uppercase italic text-[9px] tracking-widest h-12 transition-all shadow-lg",
                            myVote === 'reject' ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                          )}
                        >
                          {castVote.isPending ? <Loader2 className="animate-spin" /> : <><ThumbsDown size={14} className="mr-2" /> Vota NO</>}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-4 pt-6 border-t border-white/5">
                    <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest italic">Azioni Definitive</p>
                    <div className="flex gap-4">
                      {canManage && isPending && (
                        <>
                          <Button 
                            onClick={(e) => { e.stopPropagation(); onUpdateStatus(app.id, 'approved'); }}
                            disabled={isUpdating}
                            className="flex-1 bg-white text-black hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] rounded-full font-black uppercase italic text-[10px] tracking-widest h-14 transition-all duration-300 shadow-xl"
                          >
                            APPROVA
                          </Button>
                          <Button 
                            onClick={(e) => { e.stopPropagation(); onUpdateStatus(app.id, 'rejected'); }}
                            disabled={isUpdating}
                            className="flex-1 bg-zinc-800 text-white hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] rounded-full font-black uppercase italic text-[10px] tracking-widest h-14 transition-all duration-300 shadow-xl"
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
                          className="flex-1 border-zinc-800 text-zinc-500 hover:bg-red-600 hover:text-white hover:border-red-600 rounded-full font-black uppercase italic text-[10px] tracking-widest h-14 transition-all"
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
        images={lightboxData?.images || []} 
        initialIndex={lightboxData?.index || 0} 
        isOpen={!!lightboxData} 
        onClose={() => setLightboxData(null)} 
      />
    </>
  );
};

export default AdminApplicationCard;