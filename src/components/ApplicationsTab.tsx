"use client";

import React, { useState } from 'react';
import { useUserApplications } from '@/hooks/use-events';
import { Loader2, Calendar, MapPin, CheckCircle2, XCircle, Clock, Car, ChevronRight, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ManageApplicationModal from './ManageApplicationModal';

const ApplicationsTab = () => {
  const { data: applications, isLoading, refetch } = useUserApplications();
  const [selectedApp, setSelectedApp] = useState<any>(null);

  // Forza il refresh quando il componente viene montato
  React.useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) return (
    <div className="py-20 flex flex-col items-center gap-4">
      <Loader2 className="animate-spin text-zinc-500" size={32} />
      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Sincronizzazione...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-xl font-black italic uppercase tracking-tighter">Le Mie Selezioni</h3>
        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
          {applications?.length || 0} Totali
        </span>
      </div>

      {applications?.length === 0 ? (
        <div className="bg-zinc-900/20 border border-dashed border-white/10 p-16 text-center rounded-[3rem]">
          <Calendar className="mx-auto text-zinc-800 mb-6" size={48} />
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">Non hai ancora inviato candidature per gli eventi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {applications?.map((app: any, i: number) => (
            <motion.div 
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedApp(app)}
              className="bg-zinc-900/40 backdrop-blur-md border border-white/5 overflow-hidden rounded-[2rem] group hover:border-white/20 transition-all duration-500 cursor-pointer shadow-xl"
            >
              <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
                {/* Veicolo Preview */}
                <div className="w-full md:w-32 aspect-video md:aspect-square shrink-0 rounded-2xl overflow-hidden bg-zinc-950 border border-white/5 relative">
                  {app.vehicles?.image_url ? (
                    <img src={app.vehicles.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" alt="Veicolo" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-800"><Car size={32} /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* Info Evento */}
                <div className="flex-1 min-w-0 space-y-4 w-full text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <span className={cn(
                      "text-[8px] font-black uppercase px-3 py-1 italic flex items-center justify-center md:justify-start gap-1.5 rounded-full w-fit mx-auto md:mx-0",
                      app.status === 'pending' && "bg-zinc-800 text-zinc-400",
                      app.status === 'approved' && "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]",
                      app.status === 'rejected' && "bg-zinc-700 text-white"
                    )}>
                      {app.status === 'pending' && <Clock size={10} />}
                      {app.status === 'approved' && <CheckCircle2 size={10} />}
                      {app.status === 'rejected' && <XCircle size={10} />}
                      {app.status === 'pending' ? 'In Attesa' : app.status === 'approved' ? 'Approvata' : 'Negata'}
                    </span>
                    <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">
                      Inviata il {new Date(app.applied_at).toLocaleDateString('it-IT')}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter truncate">
                      {app.events?.title || 'Evento Low District'}
                    </h4>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-white" />
                        <span className="text-[9px] font-black uppercase tracking-widest italic">
                          {app.events?.location || 'TBD'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-white" />
                        <span className="text-[9px] font-black uppercase tracking-widest italic">
                          {app.events?.date ? new Date(app.events.date).toLocaleDateString('it-IT') : 'TBD'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="shrink-0 flex items-center gap-4">
                  <div className="hidden md:flex flex-col items-end">
                    <p className="text-[9px] font-black uppercase italic text-white">{app.vehicles?.brand}</p>
                    <p className="text-[8px] font-bold uppercase text-zinc-600">{app.vehicles?.model}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500 shadow-lg border border-white/5">
                    <Settings2 size={20} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ManageApplicationModal 
        isOpen={!!selectedApp} 
        onClose={() => setSelectedApp(null)} 
        application={selectedApp} 
      />
    </div>
  );
};

export default ApplicationsTab;