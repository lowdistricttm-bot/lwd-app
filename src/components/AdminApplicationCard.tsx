"use client";

import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Car, 
  User, 
  Instagram, 
  MapPin, 
  Calendar,
  Clock,
  Phone,
  Image as LucideImage,
  Camera,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminApplicationCardProps {
  app: any;
  onUpdateStatus: (id: string, status: 'approved' | 'rejected') => void;
  isUpdating: boolean;
}

const AdminApplicationCard = ({ app, onUpdateStatus, isUpdating }: AdminApplicationCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const vehicleImages = app.vehicles?.images || (app.vehicles?.image_url ? [app.vehicles.image_url] : []);
  const interiorImages = app.interior_urls || [];
  const allMedia = [...vehicleImages, ...interiorImages];

  return (
    <div className="bg-zinc-900/40 border border-white/5 overflow-hidden flex flex-col transition-all hover:border-white/10">
      {/* Header Ridotto (Sempre Visibile) */}
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
              <span className="text-[8px] text-red-600 font-black uppercase tracking-widest italic truncate">
                {app.full_name}
              </span>
              <span className="text-[8px] text-zinc-600 font-bold uppercase">• {app.events?.title}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={cn(
            "hidden sm:flex px-3 py-1 text-[8px] font-black uppercase italic tracking-widest items-center gap-1.5",
            app.status === 'pending' && "bg-zinc-800 text-zinc-400",
            app.status === 'approved' && "bg-green-600 text-white",
            app.status === 'rejected' && "bg-red-600 text-white"
          )}>
            {app.status === 'pending' ? 'IN ATTESA' : app.status.toUpperCase()}
          </div>
          <div className="p-2 text-zinc-500 group-hover:text-white transition-colors">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      {/* Contenuto Espanso */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="border-t border-white/5 bg-black/20">
              {/* Contatti Rapidi */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-white/5">
                <div className="bg-black/40 px-4 py-3 border border-white/5 flex items-center gap-3">
                  <Instagram size={14} className="text-red-600" />
                  <span className="text-[9px] font-black uppercase tracking-widest truncate">{app.instagram || 'N/A'}</span>
                </div>
                <div className="bg-black/40 px-4 py-3 border border-white/5 flex items-center gap-3">
                  <Phone size={14} className="text-red-600" />
                  <span className="text-[9px] font-black uppercase tracking-widest truncate">{app.phone || 'N/A'}</span>
                </div>
                <div className="bg-black/40 px-4 py-3 border border-white/5 flex items-center gap-3">
                  <MapPin size={14} className="text-red-600" />
                  <span className="text-[9px] font-black uppercase tracking-widest truncate">{app.city || 'N/A'}</span>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row">
                {/* Scheda Tecnica */}
                <div className="lg:w-1/2 p-6 space-y-6 border-r border-white/5">
                  <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                    <Car size={12} className="text-red-600" /> Scheda Tecnica
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[7px] text-zinc-600 font-bold uppercase">Marca e Modello</p>
                      <p className="text-sm font-black uppercase italic">{app.vehicles?.brand} {app.vehicles?.model}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[7px] text-zinc-600 font-bold uppercase">Assetto</p>
                      <p className="text-sm font-black uppercase italic text-red-600">{app.vehicles?.suspension_type}</p>
                    </div>
                  </div>
                  <div className="bg-red-600/5 p-4 border border-red-600/10">
                    <p className="text-[7px] text-red-600 font-bold uppercase mb-1">Modifiche</p>
                    <p className="text-[11px] text-zinc-200 leading-relaxed italic">{app.modifications || 'Nessuna modifica indicata.'}</p>
                  </div>
                </div>

                {/* Media Gallery */}
                <div className="lg:w-1/2 p-6">
                  <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-4 flex items-center gap-2">
                    <Camera size={12} className="text-red-600" /> Media ({allMedia.length})
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {allMedia.slice(0, 6).map((url, idx) => (
                      <div key={idx} className="aspect-square bg-zinc-900 border border-white/5 overflow-hidden relative">
                        <img src={url} className="w-full h-full object-cover" alt="Media" />
                        <div className="absolute top-1 left-1 bg-black/60 px-1 py-0.5 text-[6px] font-black uppercase italic text-white">
                          {idx < vehicleImages.length ? 'G' : 'I'}
                        </div>
                      </div>
                    ))}
                    {allMedia.length === 0 && (
                      <div className="col-span-3 py-8 flex flex-col items-center justify-center border border-dashed border-white/10 text-zinc-700">
                        <LucideImage size={24} className="mb-2" />
                        <p className="text-[7px] font-black uppercase">Nessuna foto</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Azioni */}
              <div className="p-6 bg-zinc-900/50 border-t border-white/5 flex gap-3">
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStatus(app.id, 'approved');
                  }}
                  disabled={app.status === 'approved' || isUpdating}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-none font-black uppercase italic text-[9px] tracking-widest h-10"
                >
                  Approva
                </Button>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStatus(app.id, 'rejected');
                  }}
                  disabled={app.status === 'rejected' || isUpdating}
                  variant="outline"
                  className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-none font-black uppercase italic text-[9px] tracking-widest h-10"
                >
                  Nega
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminApplicationCard;