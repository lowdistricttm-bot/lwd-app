"use client";

import React, { useState, useRef } from 'react';
import { useGarage, Vehicle } from '@/hooks/use-garage';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Plus, Car, Trash2, Camera, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GarageTab = () => {
  const { vehicles, isLoading, addVehicle, deleteVehicle } = useGarage();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    license_plate: '',
    suspension_type: '',
    description: ''
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles = [...selectedFiles, ...files].slice(0, 6);
      setSelectedFiles(newFiles);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const removePreview = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addVehicle.mutateAsync({
      ...formData,
      files: selectedFiles
    });
    setIsAdding(false);
    setFormData({ brand: '', model: '', year: '', license_plate: '', suspension_type: '', description: '' });
    setSelectedFiles([]);
    setPreviews([]);
  };

  if (isLoading) return <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-red-600" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black italic uppercase">Il Mio Garage</h3>
        {!isAdding && (
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-red-600 hover:bg-white hover:text-black text-white rounded-none font-black uppercase italic text-[10px] tracking-widest"
          >
            <Plus size={14} className="mr-2" /> Aggiungi Veicolo
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
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
                    className="bg-transparent border-zinc-800 rounded-none h-12" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500">Modello</Label>
                  <Input 
                    required
                    value={formData.model}
                    onChange={e => setFormData({...formData, model: e.target.value})}
                    className="bg-transparent border-zinc-800 rounded-none h-12" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500">Anno</Label>
                  <Input 
                    value={formData.year}
                    onChange={e => setFormData({...formData, year: e.target.value})}
                    className="bg-transparent border-zinc-800 rounded-none h-12" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500">Targa</Label>
                  <Input 
                    value={formData.license_plate}
                    onChange={e => setFormData({...formData, license_plate: e.target.value})}
                    className="bg-transparent border-zinc-800 rounded-none h-12" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500">Assetto</Label>
                  <Input 
                    placeholder="es. Statico, Aria..."
                    value={formData.suspension_type}
                    onChange={e => setFormData({...formData, suspension_type: e.target.value})}
                    className="bg-transparent border-zinc-800 rounded-none h-12" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500">Foto Veicolo (Max 6)</Label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="h-12 border border-dashed border-zinc-800 flex items-center justify-center cursor-pointer hover:border-red-600 transition-colors"
                  >
                    <Camera size={18} className="text-zinc-600 mr-2" />
                    <span className="text-[10px] font-black uppercase text-zinc-500">
                      {previews.length > 0 ? `${previews.length}/6 Foto` : 'Seleziona Foto'}
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

              {previews.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {previews.map((url, i) => (
                    <div key={i} className="aspect-square relative bg-zinc-800 border border-white/5">
                      <img src={url} className="w-full h-full object-cover" alt="Preview" />
                      <button 
                        type="button"
                        onClick={() => removePreview(i)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white flex items-center justify-center rounded-full"
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
                  className="bg-transparent border-zinc-800 rounded-none min-h-[100px]" 
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={addVehicle.isPending}
                  className="flex-1 bg-red-600 hover:bg-white hover:text-black text-white rounded-none h-12 font-black uppercase italic tracking-widest"
                >
                  {addVehicle.isPending ? <Loader2 className="animate-spin" /> : 'Salva Veicolo'}
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
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
        {vehicles?.length === 0 && !isAdding ? (
          <div className="col-span-full bg-zinc-900/30 border border-white/5 p-12 text-center">
            <Car className="mx-auto text-zinc-800 mb-6" size={48} />
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Il tuo garage è vuoto.</p>
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
                        className="w-full h-full object-cover shrink-0 snap-center" 
                        alt={`${vehicle.model} ${idx + 1}`} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-800">
                    <Car size={48} />
                  </div>
                )}
                
                {vehicle.images && vehicle.images.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {vehicle.images.map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-full bg-white/30" />
                    ))}
                  </div>
                )}

                <button 
                  onClick={() => deleteVehicle.mutate(vehicle.id)}
                  className="absolute top-4 right-4 p-2 bg-black/60 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-10"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-black italic uppercase tracking-tighter">{vehicle.brand} {vehicle.model}</h4>
                    <p className="text-red-600 text-[9px] font-black uppercase tracking-widest italic">{vehicle.year}</p>
                  </div>
                  {vehicle.license_plate && (
                    <div className="bg-white text-black px-2 py-1 text-[9px] font-black tracking-widest border border-black">
                      {vehicle.license_plate}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {vehicle.suspension_type && (
                    <p className="text-[10px] font-bold uppercase text-zinc-400">
                      <span className="text-zinc-600">Assetto:</span> {vehicle.suspension_type}
                    </p>
                  )}
                  {vehicle.description && (
                    <p className="text-xs text-zinc-500 line-clamp-2 italic">{vehicle.description}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default GarageTab;