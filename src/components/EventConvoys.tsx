"use client";

import React, { useState } from 'react';
import { useConvoys, Convoy } from '@/hooks/use-convoys';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Users, Plus, ChevronRight, Loader2, Car } from 'lucide-react';
import { Button } from './ui/button';
import CreateConvoyModal from './CreateConvoyModal';
import ConvoyDetailModal from './ConvoyDetailModal';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface EventConvoysProps {
  eventId: string;
  eventTitle: string;
  currentUserId: string | null;
}

const EventConvoys = ({ eventId, eventTitle, currentUserId }: EventConvoysProps) => {
  const { convoys, isLoading } = useConvoys(eventId);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedConvoy, setSelectedConvoy] = useState<Convoy | null>(null);

  if (isLoading) return <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-zinc-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <div>
          <h3 className="text-lg font-black italic uppercase tracking-tighter">Run to the Show</h3>
          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Viaggia in gruppo verso l'evento</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg"
        >
          <Plus size={20} />
        </button>
      </div>

      {convoys?.length === 0 ? (
        <div className="bg-white/5 border border-dashed border-white/10 p-10 text-center rounded-[2rem]">
          <Car className="mx-auto text-zinc-800 mb-4" size={32} />
          <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest italic">Nessun convoglio creato per questo evento.</p>
          <button onClick={() => setIsCreateOpen(true)} className="mt-4 text-[9px] font-black uppercase text-white border-b border-white/20 pb-0.5">Crea il primo</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {convoys?.map((convoy) => (
            <motion.div 
              key={convoy.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedConvoy(convoy)}
              className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-5 rounded-[2rem] group hover:border-white/20 transition-all cursor-pointer shadow-xl"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-base font-black italic uppercase tracking-tight text-white group-hover:text-zinc-300 transition-colors">{convoy.title}</h4>
                  <div className="flex items-center gap-3 mt-2 text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-white" />
                      <span className="text-[9px] font-black uppercase italic">{convoy.start_location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-white" />
                      <span className="text-[9px] font-black uppercase italic">{format(new Date(convoy.start_time), 'HH:mm')}</span>
                    </div>
                  </div>
                </div>
                {convoy.is_joined && (
                  <span className="bg-white text-black text-[7px] font-black uppercase px-2 py-1 italic rounded-md shadow-lg">UNISCITI</span>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {convoy.convoy_participants?.slice(0, 3).map((p, i) => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-zinc-800 overflow-hidden">
                        {p.profiles?.avatar_url ? <img src={p.profiles.avatar_url} className="w-full h-full object-cover" /> : <Users size={10} className="m-auto h-full text-zinc-700" />}
                      </div>
                    ))}
                  </div>
                  <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">
                    {convoy.convoy_participants?.length || 0} Auto in parata
                  </span>
                </div>
                <ChevronRight size={16} className="text-zinc-700 group-hover:text-white transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <CreateConvoyModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        eventId={eventId} 
        eventTitle={eventTitle} 
      />

      {selectedConvoy && (
        <ConvoyDetailModal 
          isOpen={!!selectedConvoy} 
          onClose={() => setSelectedConvoy(null)} 
          convoy={selectedConvoy} 
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};

export default EventConvoys;