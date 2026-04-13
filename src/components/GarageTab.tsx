"use client";

import React, { useState, useRef } from 'react';
import { useGarage, Vehicle } from '@/hooks/use-garage';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Plus, Car, Trash2, Camera, Loader2, X } from 'lucide-react';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addVehicle.mutateAsync({
      ...formData,
      file: selectedFile || undefined
    });
    setIsAdding(false);
    setFormData({ brand: '', model: '', year: '', license_plate: '', suspension_type: '', description: '' });
    setSelectedFile(null);
    setPreviewUrl(null);
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
                  <Label className="text-[10px] font-black uppercase text-zinc-500">Foto Veicolo</Label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="h-12 border border-dashed border-zinc-800 flex items-center justify-center cursor-pointer hover:border-red-600 transition-colors"
                  >
                    {previewUrl ? (
                      <span className="text-[10px] font-black uppercase text-red-600">Foto Selezionata</span>
                    ) : (
                      <Camera size={18} className="text-zinc-600" />
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
              </div>

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
                {vehicle.image_url ? (
                  <img src={vehicle.image_url} alt={vehicle.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-800">
                    <Car size={48} />
                  </div>
                )}
                <button 
                  onClick={() => deleteVehicle.mutate(vehicle.id)}
                  className="absolute top-4 right-4 p-2 bg-black/60 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
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