"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CheckCircle2, XCircle, Car, MapPin, Calendar, Trash2, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useEvents } from '@/hooks/use-events';
import { useBodyLock } from '@/hooks/use-body-lock';

interface ManageApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
}

const ManageApplicationModal = ({ isOpen, onClose, application }: ManageApplicationModalProps) => {
  const { cancelApplication } = useEvents();

  // Blocco background
  useBodyLock(isOpen);

  if (!application) return null;

  const handleCancel = async () => {
    const confirmMsg = application.status === 'rejected' 
      ? "Vuoi rimuovere questa candidatura rifiutata per poterti candidare di nuovo?" 
      : "Sei sicuro di voler annullare questa candidatura?";
      
    if (confirm(confirmMsg)) {
      await cancelApplication.mutateAsync(application.id);
      onClose();
    }
  };

  const canUserCancel = application.status === 'pending' || application.status === 'rejected';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="fixed inset-0 bg-black/80 z-[150] touch-none" 
          />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[151] bg-black border-t border-white/10 p-6 rounded-t-[2.5rem] max-h-[85dvh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
            style={{ 
              touchAction: 'pan-y',
              overscrollBehavior: 'contain'
            }}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />
            
            <div className="max-w-2xl mx-auto space-y-8 pb-[calc(4rem+env(safe-area-inset-bottom))]">
              <div className="flex justify-between items-start">
                <div>
                  <span className={cn(
                    "text-[8px] font-black uppercase px-2 py-0.5 italic flex items-center gap-1.5 mb-2 w-fit",
                    application.status === 'pending' && "bg-zinc-800 text-zinc-400",
                    application.status === 'approved' && "bg-white text-black",
                    application.status === 'rejected' && "bg-zinc-700 text-white"
                  )}>
                    {application.status === 'pending' && <Clock size={10} />}
                    {application.status === 'approved' && <CheckCircle2 size={10} />}
                    {application.status === 'rejected' && <XCircle size={10} />}
                    Stato: {application.status === 'pending' ? 'In Attesa' : application.status === 'approved' ? 'Approvata' : 'Negata'}
                  </span>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">{application.events?.title}</h3>
                </div>
                <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white bg-white/5 rounded-full transition-colors"><X size={24} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/5 p-6 space-y-4 rounded-[1.5rem]">
                    <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Dettagli Evento</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-zinc-300">
                        <MapPin size={14} className="text-white" />
                        <span className="text-xs font-bold uppercase">{application.events?.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-zinc-300">
                        <Calendar size={14} className="text-white" />
                        <span className="text-xs font-bold uppercase">
                          {new Date(application.events?.date).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-6 space-y-4 rounded-[1.5rem]">
                    <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Veicolo Candidato</h4>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-black border border-white/10 overflow-hidden shrink-0 rounded-xl">
                        {application.vehicles?.image_url ? (
                          <img src={application.vehicles.image_url} className="w-full h-full object-cover" alt="Veicolo" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-700"><Car size={20} /></div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase italic">{application.vehicles?.brand} {application.vehicles?.model}</p>
                        <p className="text-[9px] font-bold uppercase text-zinc-500">{application.vehicles?.suspension_type}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/5 p-6 space-y-4 rounded-[1.5rem]">
                    <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Note Candidatura</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed italic">
                      {application.status === 'pending' 
                        ? "La tua candidatura è in fase di revisione da parte dello staff. Riceverai una notifica in caso di approvazione."
                        : application.status === 'approved'
                        ? "Congratulazioni! Il tuo progetto è stato selezionato per questo evento. Controlla la tua email per i dettagli logistici."
                        : "Purtroppo il tuo progetto non è stato selezionato per questo evento. Non scoraggiarti, continua a lavorare sul tuo progetto!"}
                    </p>
                  </div>

                  {canUserCancel && (
                    <Button 
                      onClick={handleCancel}
                      disabled={cancelApplication.isPending}
                      variant="outline"
                      className="w-full border-white/10 text-zinc-500 hover:bg-red-600 hover:text-white hover:border-red-600 rounded-full font-black uppercase italic text-[10px] tracking-widest h-14 transition-all"
                    >
                      {cancelApplication.isPending ? <Loader2 className="animate-spin" /> : <><Trash2 size={14} className="mr-2" /> {application.status === 'rejected' ? 'Rimuovi e Riprova' : 'Annulla Candidatura'}</>}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ManageApplicationModal;