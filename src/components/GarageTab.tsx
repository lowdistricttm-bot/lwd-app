"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useGarage, Vehicle } from '@/hooks/use-garage';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import ImageLightbox from './ImageLightbox';
import { Plus, Car, Trash2, Camera, Loader2, X, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GarageTabProps {
  userId?: string;
  isOwnProfile?: boolean;
}

const GarageTab = ({ userId, isOwnProfile = true }: GarageTabProps) => {
  const { vehicles, isLoading, addVehicle, updateVehicle, deleteVehicle } = useGarage(userId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lightboxData, setLightboxData] = useState<{ images: string[], index: number } | null>(null);
  
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

  if (isLoading) return <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-zinc-500" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black italic uppercase">Garage</h3>
        {isOwnProfile && !isFormOpen && (
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="bg-white text-black hover:bg-zinc-200 rounded-none font-black uppercase italic text-[10px] tracking-widest"
          >
            <Plus size={14} className="mr-2" /> Aggiungi Veicolo
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isOwnProfile && isFormOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-zinc-900/50 border border-white/10 p-6 overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500">Marca</Label>
                  <Input 
                    required
                    value={formData.brand}
                    onChange={e => setFormData({...formData, brand: e.target.value})}
                    className="bg-transparent border-zinc-800 rounded-none h-12 text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500">Modello</Label>
                  <Input 
                    required
                    value={formData.model}
                    onChange={e => setFormData({...formData, model: e.target.value})}
                    className="bg-transparent border-zinc-800 rounded-none h-12 text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500">Anno</Label>
                  <Input 
                    value={formData.year}
                    onChange={e => setFormData({...formData, year: e.target.value})}
                    className="bg-transparent border-zinc-800 rounded-none h-12 text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500">Targa</Label>
                  <Input 
                    value={formData.license_plate}
                    onChange={e => setFormData({...formData, license_plate: e.target.value})}
                    className="bg-transparent border-zinc-800 rounded-none h-12 text-sm" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500">Tipo Assetto</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['STATIC', 'AIR'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({...formData, suspension_type: type})}
                        className={cn(
                          "h-12 border font-black uppercase italic text-xs tracking-widest transition-all",
                          formData.suspension_type === type 
                            ? "bg-white border-white text-black" 
                            : "bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-600"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500">Foto Veicolo (Max 6)</Label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="h-12 border border-dashed border-zinc-800 flex items-center justify-center cursor-pointer hover:border-white transition-colors"
                  >
                    <Camera size={18} className="text-zinc-600 mr-2" />
                    <span className="text-[10px] font-black uppercase text-zinc-500">
                      {existingImages.length + selectedFiles.length}/6 Foto
                    </span>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    multiple 
                    onChange={handleFileChange} 
                  />
                </div>
              </div>

              {(existingImages.length > 0 || previews.length > 0) && (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {existingImages.map((url, i) => (
                    <div key={`existing-${i}`} className="aspect-square relative bg-zinc-800 border border-white/5">
                      <img src={url} className="w-full h-full object-cover" alt="Existing" />
                      <button 
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-zinc-700 text-white flex items-center justify-center rounded-full"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {previews.map((url, i) => (
                    <div key={`new-${i}`} className="aspect-square relative bg-zinc-800 border border-white/5 opacity-70">
                      <img src={url} className="w-full h-full object-cover" alt="New" />
                      <button 
                        type="button"
                        onClick={() => removeNewPreview(i)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-zinc-600 text-white flex items-center justify-center rounded-full"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-zinc-500">Descrizione Progetto</Label>
                <Textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="bg-transparent border-zinc-800 rounded-none min-h-[100px] text-sm" 
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={addVehicle.isPending || updateVehicle.isPending}
                  className="flex-1 bg-white text-black hover:bg-zinc-200 rounded-none h-12 font-black uppercase italic tracking-widest"
                >
                  {(addVehicle.isPending || updateVehicle.isPending) ? <Loader2 className="animate-spin" /> : editingId ? 'Aggiorna Veicolo' : 'Salva Veicolo'}
                </Button>
                <Button 
                  type="button" 
                  onClick={handleCloseForm}
                  variant="outline"
                  className="border-zinc-800 rounded-none h-12 font-black uppercase italic tracking-widest"
                >
                  Annulla
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vehicles?.length === 0 && !isFormOpen ? (
          <div className="col-span-full bg-zinc-900/30 border border-white/5 p-12 text-center">
            <Car className="mx-auto text-zinc-800 mb-6" size={48} />
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Nessun veicolo nel garage.</p>
          </div>
        ) : (
          vehicles?.map((vehicle) => (
            <motion.div 
              key={vehicle.id}
              layout
              className="bg-zinc-900/50 border border-white/5 overflow-hidden group"
            >
              <div className="aspect-video bg-zinc-950 relative overflow-hidden">
                {vehicle.images && vehicle.images.length > 0 ? (
                  <div className="flex h-full overflow-x-auto no-scrollbar snap-x snap-mandatory">
                    {vehicle.images.map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        onClick={() => setLightboxData({ images: vehicle.images || [], index: idx })}
                        className="w-full h-full object-cover shrink-0 snap-center cursor-pointer" 
                        alt={`${vehicle.model} ${idx + 1}`} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-800"><Car size={48} /></div>
                )}
                
                {isOwnProfile && (
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
                    <button onClick={() => handleEdit(vehicle)} className="p-2 bg-black/60 text-white hover:bg-white hover:text-black transition-colors"><Edit3 size={16} /></button>
                    <button onClick={() => deleteVehicle.mutate(vehicle.id)} className="p-2 bg-black/60 text-white hover:bg-zinc-800 transition-colors"><Trash2 size={16} /></button>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-black italic uppercase tracking-tighter">{vehicle.brand} {vehicle.model}</h4>
                    <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest italic">{vehicle.year}</p>
                  </div>
                  {isOwnProfile && vehicle.license_plate && (
                    <div className="bg-white text-black px-2 py-1 text-[9px] font-black tracking-widest border border-black">{vehicle.license_plate}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase text-zinc-400"><span className="text-zinc-600">Assetto:</span> {vehicle.suspension_type}</p>
                  {vehicle.description && <p className="text-xs text-zinc-500 line-clamp-2 italic">{vehicle.description}</p>}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

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