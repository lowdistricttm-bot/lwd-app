"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Save, Loader2, Calendar, Euro, Package, Check, Search, Ticket } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useMysteryBox } from '@/hooks/use-mystery-box';
import { useWcProducts } from '@/hooks/use-woocommerce';
import { useBodyLock } from '@/hooks/use-body-lock';
import { cn } from '@/lib/utils';

interface AdminMysteryBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminMysteryBoxModal = ({ isOpen, onClose }: AdminMysteryBoxModalProps) => {
  const { createOrUpdateBox } = useMysteryBox();
  const { data: products } = useWcProducts("per_page=100");
  
  const [formData, setFormData] = useState({
    title: 'DISTRICT MYSTERY BOX',
    description: 'La selezione definitiva di Low District. Prodotti detailing, sticker e forse un Golden Ticket!',
    price: '30',
    total_quantity: '50',
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    has_golden_ticket: true
  });

  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [search, setSearch] = useState('');

  useBodyLock(isOpen);

  const filteredProducts = products?.filter((p: any) => 
    p.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5) || [];

  const toggleProduct = (id: number) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createOrUpdateBox.mutateAsync({
      ...formData,
      price: parseFloat(formData.price),
      total_quantity: parseInt(formData.total_quantity),
      expires_at: new Date(formData.expires_at).toISOString(),
      included_product_ids: selectedProducts
    });
    onClose();
  };

  const inputClass = "bg-white/5 border-white/10 rounded-full h-14 px-6 font-bold text-xs tracking-widest focus-visible:ring-white/20 text-white";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 z-[300] touch-none" />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[301] bg-black border-t border-white/10 p-6 rounded-t-[2.5rem] max-h-[94dvh] overflow-y-auto shadow-2xl"
            style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />
            
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 pb-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Configura Mystery Box</h2>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-1">Campagna Mensile Low District</p>
                </div>
                <button type="button" onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Titolo Campagna</Label>
                  <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value.toUpperCase()})} className={inputClass} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Prezzo (€)</Label>
                    <div className="relative">
                      <Euro className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                      <Input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className={cn(inputClass, "pl-12")} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Quantità Totale</Label>
                    <div className="relative">
                      <Package className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                      <Input required type="number" value={formData.total_quantity} onChange={e => setFormData({...formData, total_quantity: e.target.value})} className={cn(inputClass, "pl-12")} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Scadenza Campagna</Label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                    <Input required type="datetime-local" value={formData.expires_at} onChange={e => setFormData({...formData, expires_at: e.target.value})} className={cn(inputClass, "pl-12")} />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Prodotti Inclusi (Selezione dallo Shop)</Label>
                  <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                    <Input placeholder="CERCA PRODOTTI..." value={search} onChange={e => setSearch(e.target.value)} className="bg-white/5 border-white/10 rounded-xl h-10 pl-10 text-[10px] font-black uppercase" />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {filteredProducts.map((p: any) => (
                      <button 
                        key={p.id} 
                        type="button" 
                        onClick={() => toggleProduct(p.id)}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all flex items-center justify-between",
                          selectedProducts.includes(p.id) ? "bg-white text-black border-white" : "bg-white/5 border-white/5 text-zinc-400"
                        )}
                      >
                        <span className="text-[10px] font-black uppercase italic truncate" dangerouslySetInnerHTML={{ __html: p.name }} />
                        {selectedProducts.includes(p.id) && <Check size={14} strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Ticket size={20} className="text-yellow-500" />
                    <div>
                      <p className="text-[10px] font-black uppercase italic">Golden Ticket</p>
                      <p className="text-[8px] font-bold text-zinc-500 uppercase">Includi possibilità di ingresso gratuito</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={formData.has_golden_ticket} 
                    onChange={e => setFormData({...formData, has_golden_ticket: e.target.checked})}
                    className="w-6 h-6 rounded-full border-white/10 bg-black checked:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Descrizione Box</Label>
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                    <Textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-transparent border-none focus-visible:ring-0 p-0 min-h-[80px] text-sm italic text-white placeholder:text-zinc-800 resize-none" />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={createOrUpdateBox.isPending}
                  className="w-full bg-white text-black hover:bg-zinc-200 h-16 rounded-full font-black uppercase italic tracking-[0.2em] transition-all duration-500 shadow-2xl mt-4 border-none"
                >
                  {createOrUpdateBox.isPending ? <Loader2 className="animate-spin" /> : <><Save size={18} className="mr-2" /> Attiva Mystery Box</>}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdminMysteryBoxModal;