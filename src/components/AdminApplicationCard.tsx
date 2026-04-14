"use client";

import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Car, 
  User, 
  Instagram, 
  MapPin, 
  Clock,
  Phone,
  Image as LucideImage,
  Camera,
  ChevronDown,
  ChevronUp,
  UserCheck
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

  // Recupero immagini dal veicolo (Garage) e dalla candidatura (Interni)
  const vehicleImages = app.vehicles?.images || (app.vehicles?.image_url ? [app.vehicles.image_url] : []);
  const interiorImages = app.interior_urls || [];

  return (
    <div className="bg-zinc-900/40 border border-white/5 overflow-hidden flex flex-col transition-all hover:border-white/10">
      {/* Header */}
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
              <span className="text-[9px] text-red-600 font-black uppercase tracking-widest italic truncate">
                {app.full_name || 'Nome non fornito'}
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
              {/* Info Candidato */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-white/5">
                <div className="bg-black/40 px-4 py-3 border border-white/5 flex items-center gap-3">
                  <UserCheck size={14} className="text-red-600" />
                  <span className="text-[9px] font-black uppercase tracking-widest truncate">{app.full_name}</span>
                </div>
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
                    <p className="text-[11px] text-zinc-200 leading-relaxed italic whitespace-pre-wrap">{app.modifications || 'Nessuna modifica indicata.'}</p>
                  </div>
                </div>

                {/* Media Gallery */}
                <div className="lg:w-1/2 p-6">
                  <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-4 flex items-center gap-2">
                    <Camera size={12} className="text-red-600" /> Media Progetto
                  </h4>
                  
                  <div className="space-y-6">
                    {/* Foto Garage */}
                    <div>
                      <p className="text-[7px] font-black uppercase text-zinc-600 mb-2 tracking-widest">Foto Garage</p>
                      <div className="grid grid-cols-4 gap-2">
                        {vehicleImages.map((url: string, idx: number) => (
                          <div key={idx} className="aspect-square bg-zinc-900 border border-white/5 overflow-hidden">
                            <img src={url} className="w-full h-full object-cover" alt="Garage" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Foto Interni */}
                    <div>
                      <p className="text-[7px] font-black uppercase text-red-600 mb-2 tracking-widest">Foto Interni (Candidatura)</p>
                      <div className="grid grid-cols-4 gap-2">
                        {interiorImages.map((url: string, idx: number) => (
                          <div key={idx} className="aspect-square bg-zinc-900 border border-red-600/10 overflow-hidden">
                            <img src={url} className="w-full h-full object-cover" alt="Interni" />
                          </div>
                        ))}
                      </div>
                    </div>
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