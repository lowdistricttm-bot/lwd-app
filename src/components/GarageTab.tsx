"use client";

import React, { useState, useRef } from 'react';
import { useGarage, Vehicle } from '@/hooks/use-garage';
import { useAdmin } from '@/hooks/use-admin';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import ImageLightbox from './ImageLightbox';
import VehicleLogbook from './VehicleLogbook';
import StanceAnalyzer from './StanceAnalyzer';
import { 
  Plus, Car, Trash2, Camera, Loader2, X, Edit3, Heart, 
  Gauge, Book, Sparkles, ChevronRight, Calendar 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

const GarageTab = ({ userId, isOwnProfile = true }: { userId?: string, isOwnProfile?: boolean }) => {
  const { vehicles, isLoading, addVehicle, updateVehicle, deleteVehicle, toggleLike } = useGarage(userId);
  const { t } = useTranslation();
  const { canVote } = useAdmin();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [activeLogbook, setActiveLogbook] = useState<string | null>(null);
  const [activeAnalyzer, setActiveAnalyzer] = useState<string | null>(null);
  const [lightboxData, setLightboxData] = useState<{ images: string[], index: number } | null>(null);
  
  const [formData, setFormData] = useState({ 
    brand: '', model: '', year: '', license_plate: '', 
    suspension_type: 'STATIC', description: '' 
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setFormData({ brand: '', model: '', year: '', license_plate: '', suspension_type: 'STATIC', description: '' });
    setSelectedFiles([]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setFormData({ 
      brand: v.brand, model: v.model, year: v.year || '', 
      license_plate: v.license_plate || '', 
      suspension_type: v.suspension_type || 'STATIC', 
      description: v.description || '' 
    });
    setSelectedFiles([]);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      await updateVehicle.mutateAsync({ 
        id: editingVehicle.id, 
        ...formData, 
        files: selectedFiles,
        existingImages: editingVehicle.images 
      });
    } else {
      await addVehicle.mutateAsync({ ...formData, files: selectedFiles });
    }
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Sei sicuro di voler rimuovere questo veicolo dal tuo garage?")) {
      await deleteVehicle.mutateAsync(id);
    }
  };

  if (isLoading) return <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-zinc-500" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black italic uppercase tracking-tighter">
          {isOwnProfile ? "Il Mio Garage" : "Garage"}
        </h3>
        {isOwnProfile && (
          <Button onClick={handleOpenAdd} className="bg-white text-black rounded-full h-10 px-6 font-black uppercase italic text-[10px] shadow-xl hover:scale-105 transition-all">
            <Plus size={16} className="mr-2" /> Aggiungi
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-zinc-900/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-lg font-black italic uppercase">{editingVehicle ? 'Modifica Veicolo' : 'Nuovo Progetto'}</h4>
              <button onClick={() => setIsFormOpen(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Marca</Label>
                  <Input required placeholder="ES: BMW" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value.toUpperCase()})} className="bg-black/40 border-white/5 rounded-full h-12 px-6 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Modello</Label>
                  <Input required placeholder="ES: M3 E46" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value.toUpperCase()})} className="bg-black/40 border-white/5 rounded-full h-12 px-6 font-bold" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Anno</Label>
                  <Input placeholder="ES: 2003" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="bg-black/40 border-white/5 rounded-full h-12 px-6 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Targa</Label>
                  <Input placeholder="ES: AA000BB" value={formData.license_plate} onChange={e => setFormData({...formData, license_plate: e.target.value.toUpperCase()})} className="bg-black/40 border-white/5 rounded-full h-12 px-6 font-bold" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Tipo Assetto</Label>
                <select 
                  value={formData.suspension_type} 
                  onChange={e => setFormData({...formData, suspension_type: e.target.value})}
                  className="w-full bg-black/40 border border-white/5 rounded-full h-12 px-6 text-xs font-bold appearance-none"
                >
                  <option value="STATIC">STATIC</option>
                  <option value="AIR RIDE">AIR RIDE</option>
                  <option value="HYDRAULIC">HYDRAULIC</option>
                  <option value="OEM+">OEM+</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Descrizione Progetto</Label>
                <Textarea placeholder="Racconta la storia del tuo veicolo..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-black/40 border-white/5 rounded-[1.5rem] min-h-[100px] p-6 text-sm italic" />
              </div>

              <div onClick={() => fileInputRef.current?.click()} className="h-32 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all group">
                <Camera size={32} className="text-zinc-600 mb-2 group-hover:text-white transition-colors" />
                <span className="text-[10px] font-black uppercase text-zinc-500 group-hover:text-white">{selectedFiles.length > 0 ? `${selectedFiles.length} Foto Selezionate` : 'Carica Foto Progetto'}</span>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={e => setSelectedFiles(Array.from(e.target.files || []))} />
              
              <Button type="submit" disabled={addVehicle.isPending || updateVehicle.isPending} className="w-full bg-white text-black rounded-full h-16 font-black uppercase italic tracking-widest shadow-2xl">
                {(addVehicle.isPending || updateVehicle.isPending) ? <Loader2 className="animate-spin" /> : editingVehicle ? 'Aggiorna Veicolo' : 'Salva nel Garage'}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {vehicles?.map((vehicle) => {
          const isPublic = vehicle.profiles?.license_plate_privacy === 'public';
          const canSeePlate = isOwnProfile || canVote || isPublic;
          const mainImage = vehicle.images?.[0] || vehicle.image_url;

          return (
            <motion.div key={vehicle.id} className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-white/20 transition-all duration-500 shadow-2xl">
              <div 
                className={cn("aspect-video relative overflow-hidden", isOwnProfile && "cursor-pointer")} 
                onClick={() => isOwnProfile ? setLightboxData({ images: vehicle.images || [], index: 0 }) : null}
              >
                {mainImage ? (
                  <img src={mainImage} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" alt={vehicle.model} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-800"><Car size={64} /></div>
                )}
                
                <div className="absolute top-5 left-5 flex flex-col gap-2">
                  <span className="bg-white/90 backdrop-blur-md text-black text-[8px] font-black uppercase px-3 py-1.5 italic rounded-full shadow-2xl">
                    {vehicle.suspension_type}
                  </span>
                  {vehicle.license_plate && canSeePlate && (
                    <span className="bg-black/60 backdrop-blur-md text-white text-[8px] font-black uppercase px-3 py-1.5 italic rounded-full border border-white/10">
                      {vehicle.license_plate}
                    </span>
                  )}
                </div>

                {isOwnProfile && (
                  <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveAnalyzer(mainImage || null); }} 
                      className="p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-black transition-all shadow-xl"
                      title="AI Analyzer"
                    >
                      <Sparkles size={18} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveLogbook(vehicle.id); }} 
                      className="p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-black transition-all shadow-xl"
                      title="Diario di Bordo"
                    >
                      <Book size={18} />
                    </button>
                  </div>
                )}

                <div className="absolute bottom-5 right-5">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleLike.mutate(vehicle.id); }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 backdrop-blur-md border rounded-full transition-all shadow-2xl",
                      vehicle.is_liked ? "bg-red-500 border-red-500 text-white" : "bg-black/40 border-white/10 text-white hover:bg-white/20"
                    )}
                  >
                    <Heart size={14} fill={vehicle.is_liked ? "currentColor" : "none"} />
                    <span className="text-[10px] font-black">{vehicle.likes_count || 0}</span>
                  </button>
                </div>
              </div>

              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-1">{vehicle.brand} {vehicle.model}</h4>
                    <div className="flex items-center gap-3 text-zinc-500">
                      <span className="text-[10px] font-black uppercase tracking-widest italic flex items-center gap-1.5">
                        <Calendar size={12} /> {vehicle.year || 'N/A'}
                      </span>
                      <span className="text-zinc-800">•</span>
                      <span className="text-[10px] font-black uppercase tracking-widest italic flex items-center gap-1.5">
                        <Gauge size={12} /> {vehicle.suspension_type}
                      </span>
                    </div>
                  </div>
                  
                  {isOwnProfile && (
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenEdit(vehicle)} className="p-2.5 bg-white/5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDelete(vehicle.id)} className="p-2.5 bg-white/5 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {vehicle.description && (
                  <p className="text-xs text-zinc-400 italic leading-relaxed line-clamp-3 mb-6">
                    {vehicle.description}
                  </p>
                )}

                {isOwnProfile && (
                  <div className="pt-6 border-t border-white/5 flex justify-end items-center">
                    <button 
                      onClick={() => setActiveLogbook(vehicle.id)}
                      className="text-[9px] font-black uppercase tracking-widest text-white italic flex items-center gap-2 group"
                    >
                      Dettagli Progetto <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {vehicles?.length === 0 && (
          <div className="col-span-full py-24 text-center bg-zinc-900/20 border border-dashed border-white/10 rounded-[3rem]">
            <Car size={48} className="mx-auto text-zinc-800 mb-6" />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Il garage è vuoto. Inizia a caricare i tuoi progetti.</p>
            {isOwnProfile && <Button onClick={handleOpenAdd} className="mt-8 bg-white text-black rounded-full px-8 h-12 font-black uppercase italic">Aggiungi Veicolo</Button>}
          </div>
        )}
      </div>

      {/* Modali */}
      <AnimatePresence>
        {activeLogbook && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveLogbook(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-zinc-950 border border-white/10 w-full max-w-2xl max-h-[85vh] rounded-[3rem] p-8 overflow-hidden shadow-2xl">
              <VehicleLogbook vehicleId={activeLogbook} onClose={() => setActiveLogbook(null)} />
            </motion.div>
          </div>
        )}
        {activeAnalyzer && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveAnalyzer(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-zinc-950 border border-white/10 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl">
              <StanceAnalyzer imageUrl={activeAnalyzer} onClose={() => setActiveAnalyzer(null)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ImageLightbox 
        images={lightboxData?.images || []} 
        initialIndex={lightboxData?.index || 0} 
        isOpen={!!lightboxData} 
        onClose={() => setLightboxData(null)} 
      />
    </div>
  );
};

export default GarageTab;