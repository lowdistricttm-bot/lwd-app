"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Loader2, Send, Tag, Euro, LayoutGrid, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useMarketplace, MARKETPLACE_CATEGORIES, MarketplaceItem } from '@/hooks/use-marketplace';
import { useBodyLock } from '@/hooks/use-body-lock';
import { cn } from '@/lib/utils';

interface CreateMarketplaceItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: MarketplaceItem | null;
}

const CreateMarketplaceItemModal = ({ isOpen, onClose, editItem }: CreateMarketplaceItemModalProps) => {
  const { createItem, updateItem } = useMarketplace();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'wheels'
  });
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    if (editItem) {
      setFormData({
        title: editItem.title,
        description: editItem.description,
        price: editItem.price.toString(),
        category: editItem.category
      });
      setExistingImages(editItem.images || []);
      setPreviews([]);
      setSelectedFiles([]);
    } else {
      setFormData({ title: '', description: '', price: '', category: 'wheels' });
      setExistingImages([]);
      setPreviews([]);
      setSelectedFiles([]);
    }
  }, [editItem, isOpen]);

  useBodyLock(isOpen);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalCount = existingImages.length + selectedFiles.length + files.length;
    if (totalCount > 5) {
      alert("Puoi caricare massimo 5 foto in totale.");
      return;
    }
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);
    setPreviews(newFiles.map(file => URL.createObjectURL(file)));
  };

  const removeNewFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    setPreviews(newFiles.map(file => URL.createObjectURL(file)));
  };

  const removeExistingImage = (index: number) => {
    const newImages = [...existingImages];
    newImages.splice(index, 1);
    setExistingImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (existingImages.length === 0 && selectedFiles.length === 0) {
      alert("Carica almeno una foto.");
      return;
    }

    if (editItem) {
      await updateItem.mutateAsync({
        id: editItem.id,
        ...formData,
        price: parseFloat(formData.price),
        files: selectedFiles,
        existingImages: existingImages
      });
    } else {
      await createItem.mutateAsync({
        ...formData,
        price: parseFloat(formData.price),
        files: selectedFiles
      });
    }
    
    onClose();
  };

  const inputClass = "bg-white/5 border-white/10 rounded-full h-14 px-6 font-bold text-xs tracking-widest focus-visible:ring-white/20 transition-all placeholder:text-zinc-700";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] touch-none" />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[201] bg-zinc-950 border-t border-white/10 p-6 rounded-t-[2.5rem] max-h-[92dvh] overflow-y-auto shadow-2xl"
            style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />
            
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 pb-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                    {editItem ? 'Modifica Annuncio' : 'Nuovo Annuncio'}
                  </h2>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-1">
                    {editItem ? 'Aggiorna i dettagli del tuo oggetto' : 'Vendi i tuoi componenti nel District'}
                  </p>
                </div>
                <button type="button" onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Titolo Oggetto</Label>
                  <div className="relative">
                    <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                    <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value.toUpperCase()})} className={cn(inputClass, "pl-12")} placeholder="ES: CERCHI BBS RS 17\" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Prezzo (€)</Label>
                    <div className="relative">
                      <Euro className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                      <Input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className={cn(inputClass, "pl-12")} placeholder="0.00" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Categoria</Label>
                    <div className="relative">
                      <LayoutGrid className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                      <select 
                        value={formData.category} 
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className={cn(inputClass, "w-full pl-12 appearance-none bg-zinc-900")}
                      >
                        {MARKETPLACE_CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.label.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Foto (Max 5)</Label>
                  <div className="flex flex-wrap gap-3">
                    {/* Existing Images */}
                    {existingImages.map((url, i) => (
                      <div key={`existing-${i}`} className="relative w-24 h-24 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                        <img src={url} className="w-full h-full object-cover" alt="Existing" />
                        <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-1.5 right-1.5 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-600 transition-colors"><X size={12} /></button>
                      </div>
                    ))}
                    
                    {/* New Previews */}
                    {previews.map((url, i) => (
                      <div key={`new-${i}`} className="relative w-24 h-24 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                        <img src={url} className="w-full h-full object-cover" alt="Preview" />
                        <button type="button" onClick={() => removeNewFile(i)} className="absolute top-1.5 right-1.5 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-600 transition-colors"><X size={12} /></button>
                      </div>
                    ))}

                    {(existingImages.length + selectedFiles.length) < 5 && (
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()} 
                        className="w-24 h-24 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-white/30 transition-all group"
                      >
                        <Camera size={24} className="text-zinc-600 group-hover:text-white mb-1" />
                        <span className="text-[7px] font-black uppercase text-zinc-600">Aggiungi</span>
                      </button>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Descrizione Dettagliata</Label>
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                    <Textarea 
                      required 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                      placeholder="Descrivi le condizioni, compatibilità e dettagli..."
                      className="bg-transparent border-none focus-visible:ring-0 p-0 min-h-[120px] text-sm italic text-white placeholder:text-zinc-800 resize-none" 
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={createItem.isPending || updateItem.isPending || (existingImages.length === 0 && selectedFiles.length === 0)}
                  className="w-full bg-white text-black hover:bg-zinc-200 h-16 rounded-full font-black uppercase italic tracking-[0.2em] transition-all duration-500 shadow-2xl mt-4"
                >
                  {createItem.isPending || updateItem.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <><Save size={18} className="mr-2" /> {editItem ? 'Salva Modifiche' : 'Pubblica Annuncio'}</>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateMarketplaceItemModal;