"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useGarage, Vehicle } from '@/hooks/use-garage';
import { useAdmin } from '@/hooks/use-admin';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import ImageLightbox from './ImageLightbox';
import VehicleLogbook from './VehicleLogbook';
import StanceAnalyzer from './StanceAnalyzer';
import { Plus, Car, Trash2, Camera, Loader2, X, Edit3, Heart, Gauge, Book, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { supabase } from "@/integrations/supabase/client";

const GarageTab = ({ userId, isOwnProfile = true }: { userId?: string, isOwnProfile?: boolean }) => {
  const { vehicles, isLoading, addVehicle, updateVehicle, deleteVehicle, toggleLike } = useGarage(userId);
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeLogbook, setActiveLogbook] = useState<string | null>(null);
  const [activeAnalyzer, setActiveAnalyzer] = useState<string | null>(null);
  const [lightboxData, setLightboxData] = useState<{ images: string[], index: number } | null>(null);
  
  const [formData, setFormData] = useState({ brand: '', model: '', year: '', license_plate: '', suspension_type: 'STATIC', description: '' });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addVehicle.mutateAsync({ ...formData, files: selectedFiles });
    setIsFormOpen(false);
  };

  if (isLoading) return <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-zinc-500" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black italic uppercase">{isOwnProfile ? "Il Mio Garage" : "Garage"}</h3>
        {isOwnProfile && (
          <Button onClick={() => setIsFormOpen(true)} className="bg-white text-black rounded-full h-10 px-6 font-black uppercase italic text-[10px] shadow-xl">
            <Plus size={16} className="mr-2" /> Aggiungi
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input required placeholder="MARCA" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value.toUpperCase()})} className="bg-black/40 border-white/5 rounded-full h-12 px-6" />
                <Input required placeholder="MODELLO" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value.toUpperCase()})} className="bg-black/40 border-white/5 rounded-full h-12 px-6" />
              </div>
              <div onClick={() => fileInputRef.current?.click()} className="h-24 border-2 border-dashed border-white/10 rounded-[1.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all">
                <Camera size={24} className="text-zinc-600 mb-2" />
                <span className="text-[8px] font-black uppercase text-zinc-500">{selectedFiles.length} Foto Selezionate</span>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" multiple onChange={e => setSelectedFiles(Array.from(e.target.files || []))} />
              <Button type="submit" className="w-full bg-white text-black rounded-full h-14 font-black uppercase italic">Salva Veicolo</Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {vehicles?.map((vehicle) => (
          <motion.div key={vehicle.id} className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden group">
            <div className="aspect-video relative overflow-hidden">
              <img src={vehicle.images?.[0]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700" />
              <div className="absolute top-5 right-5 flex gap-2">
                <button onClick={() => setActiveAnalyzer(vehicle.images?.[0] || null)} className="p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-black transition-all shadow-xl"><Sparkles size={18} /></button>
                {isOwnProfile && <button onClick={() => setActiveLogbook(vehicle.id)} className="p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-black transition-all shadow-xl"><Book size={18} /></button>}
              </div>
            </div>
            <div className="p-8">
              <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-1">{vehicle.brand} {vehicle.model}</h4>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">{vehicle.suspension_type} • {vehicle.year}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modali */}
      <AnimatePresence>
        {activeLogbook && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveLogbook(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-zinc-950 border border-white/10 w-full max-w-2xl max-h-[80vh] rounded-[3rem] p-8 overflow-hidden">
              <VehicleLogbook vehicleId={activeLogbook} onClose={() => setActiveLogbook(null)} />
            </motion.div>
          </div>
        )}
        {activeAnalyzer && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveAnalyzer(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-zinc-950 border border-white/10 w-full max-w-2xl rounded-[3rem] overflow-hidden">
              <StanceAnalyzer imageUrl={activeAnalyzer} onClose={() => setActiveAnalyzer(null)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GarageTab;