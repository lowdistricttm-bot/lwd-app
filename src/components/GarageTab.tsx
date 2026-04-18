"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useGarage, Vehicle } from '@/hooks/use-garage';
import { useAdmin } from '@/hooks/use-admin';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import ImageLightbox from './ImageLightbox';
import { Plus, Car, Trash2, Camera, Loader2, X, Edit3, Heart, Gauge } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { supabase } from "@/integrations/supabase/client";

interface GarageTabProps {
  userId?: string;
  isOwnProfile?: boolean;
}

const GarageTab = ({ userId, isOwnProfile = true }: GarageTabProps) => {
  const { vehicles, isLoading, addVehicle, updateVehicle, deleteVehicle, toggleLike } = useGarage(userId);
  const { canVote } = useAdmin();
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lightboxData, setLightboxData] = useState<{ images: string[], index: number } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    license_plate: '',
    suspension_type: 'STATIC',
    description: ''
  });
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id || null));
  }, []);

  const handleEdit = (vehicle: Vehicle) => {
    if (!isOwnProfile) return;
    setEditingId(vehicle.id);
    setFormData({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year || '',
      license_plate: vehicle.license_plate || '',
      suspension_type: vehicle.suspension_type || 'STATIC',
      description: vehicle.description || ''
    });
    setExistingImages(vehicle.images || []);
    setPreviews([]);
    setSelectedFiles([]);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ brand: '', model: '', year: '', license_plate: '', suspension_type: 'STATIC', description: '' });
    setSelectedFiles([]);
    setPreviews([]);
    setExistingImages([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const totalCount = selectedFiles.length + existingImages.length;
      const remaining = 6 - totalCount;
      const newFiles = [...selectedFiles, ...files].slice(0, remaining);
      setSelectedFiles(prev => [...prev, ...newFiles].slice(0, 6 - existingImages.length));
    }
  };

  useEffect(() => {
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
    return () => newPreviews.forEach(url => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewPreview = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwnProfile) return;
    
    if (editingId) {
      await updateVehicle.mutateAsync({
        id: editingId,
        ...formData,
        files: selectedFiles,
        existingImages
      });
    } else {
      await addVehicle.mutateAsync({
        ...formData,
        files: selectedFiles
      });
    }
    handleCloseForm();
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-zinc-500" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Caricamento Garage...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black italic uppercase">
          {isOwnProfile ? (t.garage?.title || "IL MIO GARAGE") : (t.garage?.publicTitle || "GARAGE")}
        </h3>
        {isOwnProfile && !isFormOpen && (
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="bg-white text-black hover:bg-zinc-200 rounded-full font-black uppercase italic text-[10px] tracking-widest h-10 px-6 transition-all duration-300 shadow-xl"
          >
            <Plus size={16} strokeWidth={2.5} className="mr-2" /> {t.garage?.addBtn || "Aggiungi"}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isOwnProfile && isFormOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] mb-8 shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500 ml-4">{t.garage?.brand || "Marca"}</Label>
                  <Input required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="bg-black/40 border-white/5 rounded-full h-14 px-6 text-sm font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500 ml-4">{t.garage?.model || "Modello"}</Label>
                  <Input required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="bg-black/40 border-white/5 rounded-full h-14 px-6 text-sm font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500 ml-4">{t.garage?.year || "Anno"}</Label>
                  <Input value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="bg-black/40 border-white/5 rounded-full h-14 px-6 text-sm font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500 ml-4">Targa</Label>
                  <Input value={formData.license_plate} onChange={e => setFormData({...formData, license_plate: e.target.value})} className="bg-black/40 border-white/5 rounded-full h-14 px-6 text-sm font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500 ml-4">{t.garage?.suspension || "Assetto"}</Label>
                  <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-full border border-white/5">
                    {['STATIC', 'AIR'].map((type) => (
                      <button key={type} type="button" onClick={() => setFormData({...formData, suspension_type: type})} className={cn("h-11 rounded-full font-black uppercase italic text-[10px] tracking-widest transition-all duration-500", formData.suspension_type === type ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300")}>{type}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500 ml-4">Foto Veicolo (Max 6)</Label>
                  <div onClick={() => fileInputRef.current?.click()} className="h-14 border border-dashed border-white/10 rounded-full flex items-center justify-center cursor-pointer hover:border-white/30 transition-colors bg-black/40">
                    <Camera size={18} strokeWidth={2} className="text-zinc-600 mr-2" />
                    <span className="text-[10px] font-black uppercase text-zinc-500">{existingImages.length + selectedFiles.length}/6 Foto</span>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-zinc-500 ml-4">Descrizione Progetto</Label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-black/40 border-white/5 rounded-[1.5rem] min-h-[120px] p-6 text-sm italic" />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={addVehicle.isPending || updateVehicle.isPending} className="flex-1 bg-white text-black hover:bg-zinc-200 rounded-full h-14 font-black uppercase italic tracking-widest transition-all shadow-xl">
                  {(addVehicle.isPending || updateVehicle.isPending) ? <Loader2 className="animate-spin" /> : editingId ? 'Aggiorna' : 'Salva'}
                </Button>
                <Button type="button" onClick={handleCloseForm} variant="outline" className="flex-1 border-white/10 rounded-full h-14 font-black uppercase italic tracking-widest text-zinc-500 hover:bg-white/5">Annulla</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {vehicles?.length === 0 ? (
          <div className="col-span-full bg-white/5 backdrop-blur-xl border border-white/5 p-16 rounded-[2.5rem] text-center">
            <Car className="mx-auto text-zinc-800 mb-6" size={64} strokeWidth={1} />
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{t.garage?.empty || "Nessun veicolo nel garage."}</p>
          </div>
        ) : (
          vehicles?.map((vehicle) => {
            const isPublic = vehicle.profiles?.license_plate_privacy === 'public';
            const canSeePlate = isOwnProfile || canVote || isPublic;

            return (
              <motion.div key={vehicle.id} layout className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-white/20 transition-all duration-500 shadow-2xl">
                <div className="aspect-video bg-zinc-950 relative overflow-hidden">
                  {vehicle.images && vehicle.images.length > 0 ? (
                    <div className="flex h-full overflow-x-auto no-scrollbar snap-x snap-mandatory">
                      {vehicle.images.map((img, idx) => (
                        <img key={idx} src={img} onClick={() => setLightboxData({ images: vehicle.images || [], index: idx })} className="w-full h-full object-cover shrink-0 snap-center cursor-pointer opacity-80 group-hover:opacity-100 transition-opacity duration-700" alt={`${vehicle.model} ${idx + 1}`} />
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-800"><Car size={48} strokeWidth={1.5} /></div>
                  )}
                  
                  {isOwnProfile && (
                    <div className="absolute top-5 right-5 flex gap-3 opacity-0 group-hover:opacity-100 transition-all z-10">
                      <button onClick={() => handleEdit(vehicle)} className="p-3 bg-black/60 backdrop-blur-md text-white hover:bg-white hover:text-black rounded-full transition-all shadow-xl"><Edit3 size={18} strokeWidth={2} /></button>
                      <button onClick={() => { if(confirm("Eliminare questo veicolo?")) deleteVehicle.mutate(vehicle.id); }} className="p-3 bg-black/60 backdrop-blur-md text-white hover:bg-red-600 rounded-full transition-all shadow-xl"><Trash2 size={18} strokeWidth={2} /></button>
                    </div>
                  )}
                  
                  <div className="absolute bottom-5 right-5 z-10">
                     <button onClick={(e) => { e.stopPropagation(); toggleLike.mutate(vehicle.id); }} className={cn("flex items-center gap-2 px-5 py-2.5 backdrop-blur-md border rounded-full transition-all shadow-xl", vehicle.is_liked ? "bg-red-500 border-red-500 text-white" : "bg-black/40 border-white/10 text-white hover:bg-white/20")}>
                      <Heart size={16} strokeWidth={2.5} fill={vehicle.is_liked ? "currentColor" : "none"} />
                      <span className="text-[10px] font-black">{vehicle.likes_count || 0}</span>
                    </button>
                  </div>

                  <div className="absolute top-5 left-5 z-10">
                    <span className="bg-white/90 backdrop-blur-md text-black text-[8px] font-black uppercase px-3 py-1.5 italic rounded-full shadow-2xl">
                      {vehicle.suspension_type}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-1">{vehicle.brand}</h4>
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">{vehicle.model} • {vehicle.year}</p>
                    </div>
                    {vehicle.license_plate && canSeePlate && (
                      <div className="px-4 py-1.5 text-[10px] font-black tracking-widest border rounded-xl flex items-center gap-2 bg-white text-black border-black shadow-lg">
                        {vehicle.license_plate}
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-zinc-400">
                      <Gauge size={14} className="text-zinc-600" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Assetto: <span className="text-white italic">{vehicle.suspension_type}</span></p>
                    </div>
                    {vehicle.description && (
                      <p className="text-sm text-zinc-500 leading-relaxed italic border-t border-white/5 pt-4">
                        {vehicle.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <ImageLightbox images={lightboxData?.images || []} initialIndex={lightboxData?.index || 0} isOpen={!!lightboxData} onClose={() => setLightboxData(null)} />
    </div>
  );
};

export default GarageTab;