"use client";

import React from 'react';
import { useUserApplications } from '@/hooks/use-events';
import { Loader2, Calendar, MapPin, CheckCircle2, XCircle, Clock, Car } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const ApplicationsTab = () => {
  const { data: applications, isLoading } = useUserApplications();

  if (isLoading) return <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-red-600" /></div>;

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-black italic uppercase">Le Mie Selezioni</h3>

      {applications?.length === 0 ? (
        <div className="bg-zinc-900/30 border border-white/5 p-12 text-center">
          <Calendar className="mx-auto text-zinc-800 mb-6" size={48} />
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Non hai ancora inviato candidature.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {applications?.map((app: any) => (
            <motion.div 
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/50 border border-white/5 overflow-hidden"
            >
              <div className="p-6 flex flex-col md:flex-row gap-6">
                {/* Event Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-[8px] font-black uppercase px-2 py-0.5 italic flex items-center gap-1.5",
                      app.status === 'pending' && "bg-zinc-800 text-zinc-400",
                      app.status === 'approved' && "bg-green-600 text-white",
                      app.status === 'rejected' && "bg-red-600 text-white"
                    )}>
                      {app.status === 'pending' && <Clock size={10} />}
                      {app.status === 'approved' && <CheckCircle2 size={10} />}
                      {app.status === 'rejected' && <XCircle size={10} />}
                      Stato: {app.status === 'pending' ? 'In Attesa' : app.status === 'approved' ? 'Approvata' : 'Negata'}
                    </span>
                    <span className="text-[8px] text-zinc-600 font-bold uppercase">
                      Inviata il {new Date(app.applied_at).toLocaleDateString('it-IT')}
                    </span>
                  </div>

                  <h4 className="text-xl font-black italic uppercase tracking-tighter">
                    {app.events?.title || 'Evento Low District'}
                  </h4>

                  <div className="flex flex-wrap gap-4 text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-red-600" />
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        {app.events?.date ? new Date(app.events.date).toLocaleDateString('it-IT') : 'TBD'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-red-600" />
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        {app.events?.location || 'TBD'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="md:w-48 shrink-0">
                  <div className="bg-black/40 border border-white/5 p-3 flex items-center gap-3">
                    <div className="w-12 h-12 bg-zinc-800 border border-white/10 overflow-hidden shrink-0">
                      {app.vehicles?.image_url ? (
                        <img src={app.vehicles.image_url} className="w-full h-full object-cover" alt="Veicolo" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700"><Car size={16} /></div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase italic truncate">{app.vehicles?.brand} {app.vehicles?.model}</p>
                      <p className="text-[8px] font-bold uppercase text-zinc-600">{app.vehicles?.suspension_type}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {app.status === 'approved' && (
                <div className="bg-green-600/10 border-t border-green-600/20 p-4">
                  <p className="text-[9px] text-green-500 font-black uppercase italic text-center">
                    Complimenti! Il tuo progetto è stato selezionato. Riceverai presto istruzioni via email.
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationsTab;