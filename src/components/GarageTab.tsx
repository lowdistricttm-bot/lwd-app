"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useGarage, Vehicle } from '@/hooks/use-garage';
import { useAdmin } from '@/hooks/use-admin';
import { useLeaderboards } from '@/hooks/use-leaderboards';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import ImageLightbox from './ImageLightbox';
import VehicleLogbook from './VehicleLogbook';
import StanceAnalyzer from './StanceAnalyzer';
import VehicleDetailModal from './VehicleDetailModal';
import RankBadge from './RankBadge';
import { 
  Plus, Car, Trash2, Camera, Loader2, X, Edit3, Heart, 
  Gauge, Book, Sparkles, ChevronRight, Calendar, CreditCard, GripVertical 
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { supabase } from "@/integrations/supabase/client";

interface MediaItem {
  id: string;
  type: 'existing' | 'new';
  url: string;
  file?: File;
}

const GarageTab = ({ userId, isOwnProfile = true }: { userId?: string, isOwnProfile?: boolean }) => {
  const { vehicles, isLoading, addVehicle, updateVehicle, deleteVehicle, toggleLike } = useGarage(userId);
  const { t } = useTranslation();
  const { role, canVote } = useAdmin(); 
  const { topScored, mostLiked } = useLeaderboards();
  
  const isProUser = role && role !== 'subscriber';
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [activeLogbook, setActiveLogbook] = useState<string | null>(null);
  const [activeAnalyzer, setActiveAnalyzer] = useState<{ url: string, id: string } | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [lightboxData, setLightboxData] = useState<{ images: string[], index: number } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ 
    brand: '', model: '', year: '', license_plate: '', 
    suspension_type: 'STATIC', description: '' 
  });
  
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setFormData({ brand: '', model: '', year: '', license_plate: '', suspension_type: 'STATIC', description: '' });
    setMediaItems([]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, v: Vehicle) => {
    e.stopPropagation();
    setEditingVehicle(v);
    setFormData({ 
      brand: v.brand, model: v.model, year: v.year || '', 
      license_plate: v.license_plate || '', 
      suspension_type: v.suspension_type || 'STATIC', 
      description: v.description || '' 
    });
    
    const existing: MediaItem[] = (v.images || []).map((url, i) => ({
      id: `existing-${i}-${Date.now()}`,
      type: 'existing',
      url
    }));
    setMediaItems(existing);
    setIsFormOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 6 - mediaItems.length;
    
    if (remainingSlots <= 0) return;

    const newItems: MediaItem[] = files.slice(0, remainingSlots).map(file => ({
      id: `new-${Math.random()}-${Date.now()}`,
      type: 'new',
      url: URL.createObjectURL(file),
      file
    }));

    setMediaItems(prev => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeItem = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const files = mediaItems.filter(m => m.type === 'new').map(m => m.file!);
    const existingImages = mediaItems.filter(m => m.type === 'existing').map(m => m.url);

    if (editingVehicle) {
      await updateVehicle.mutateAsync({ 
        id: editingVehicle.id, 
        ...formData, 
        files,
        existingImages 
      });
    } else {
      await addVehicle.mutateAsync({ ...formData, files });
    }
    setIsFormOpen(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Sei sicuro di voler rimuovere questo veicolo dal tuo garage?")) {
      await deleteVehicle.mutateAsync(id);
    }
  };

  const getVehicleRank = (id: string) => {
    const scoreRank = topScored?.findIndex(v => v.id === id);
    if (scoreRank !== undefined && scoreRank !== -1 && scoreRank < 3) return { rank: scoreRank + 1, type: 'score' as const };
    
    const likeRank = mostLiked?.findIndex(v => v.id === id);
    if (likeRank !== undefined && likeRank !== -1 && likeRank < 3) return { rank: likeRank + 1, type: 'likes' as const };
    
    return null;
  };

  if (isLoading) return <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-zinc-500" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black italic uppercase tracking-tighter">
          {isOwnProfile ? "Il Mio Garage" : "Garage"}
        </h3>
        {isOwnProfile && (
          <Button 
            onClick={handleOpenAdd} 
            className="bg-zinc-900 text-white border border-white/10 rounded-full h-10 px-6 font-black uppercase italic text-[10px] shadow-xl hover:bg-zinc-800 transition-all"
          >
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
                  <option value="AIR">AIR</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Descrizione Progetto</Label>
                <Textarea placeholder="Racconta la storia del tuo veicolo..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-black/40 border-white/5 rounded-[1.5rem] min-h-[100px] p-6 text-sm italic" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-4">
                  <Label className="text-[9px] font-black uppercase text-zinc-500">Foto Progetto (Max 6)</Label>
                  <span className="text-[8px] font-black uppercase text-zinc-600 italic">Trascina per ordinare</span>
                </div>
                
                <Reorder.Group 
                  axis="x" 
                  values={mediaItems} 
                  onReorder={setMediaItems}
                  className="flex flex-wrap gap-3"
                >
                  {mediaItems.map((item, index) => (
                    <Reorder.Item 
                      key={item.id} 
                      value={item}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group cursor-grab active:cursor-grabbing"
                    >
                      <img src={item.url} className="w-full h-full object-cover" alt="" />
                      {index === 0 && (
                        <div className="absolute top-0 left-0 right-0 bg-white text-black text-[6px] font-black uppercase py-0.5 text-center">
                          Principale
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <GripVertical size={14} className="text-white" />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeItem(item.id)}
                        className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                      >
                        <X size={10} />
                      </button>
                    </Reorder.Item>
                  ))}

                  {mediaItems.length < 6 && (
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()} 
                      className="w-20 h-20 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all group"
                    >
                      <Camera size={20} className="text-zinc-600 group-hover:text-white transition-colors" />
                    </button>
                  )}
                </Reorder.Group>
                <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFileChange} />
              </div>
              
              <Button 
                type="submit" 
                disabled={addVehicle.isPending || updateVehicle.isPending} 
                className="w-full bg-white text-black hover:bg-zinc-200 rounded-full h-16 font-black uppercase italic tracking-widest shadow-2xl transition-all border-none"
              >
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
          const rankInfo = getVehicleRank(vehicle.id);

          return (
            <motion.div 
              key={vehicle.id} 
              onClick={() => setSelectedVehicle(vehicle)}
              className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-white/20 transition-all duration-500 shadow-2xl cursor-pointer"
            >
              <div className="aspect-video relative overflow-hidden">
                {mainImage ? (
                  <img src={mainImage} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" alt={vehicle.model} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-800"><Car size={64} /></div>
                )}
                
                <div className="absolute top-5 left-5 flex flex-col gap-2">
                  {rankInfo && <RankBadge rank={rankInfo.rank} type={rankInfo.type} />}
                  <span className="bg-zinc-900/80 backdrop-blur-md text-white border border-white/10 text-[8px] font-black uppercase px-3 py-1.5 italic rounded-full shadow-2xl w-fit">
                    {vehicle.suspension_type}
                  </span>
                  {vehicle.stance_score && (
                    <div className="bg-black/60 backdrop-blur-md text-white border border-white/20 text-[8px] font-black uppercase px-3 py-1.5 italic rounded-full flex items-center gap-1.5 shadow-xl w-fit">
                      <Sparkles size={10} /> LOW SCORE: {vehicle.stance_score}
                    </div>
                  )}
                </div>

                <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {isOwnProfile && isProUser && (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveAnalyzer({ url: mainImage || '', id: vehicle.id }); }} 
                        className="p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-black transition-all shadow-xl"
                        title="Low Score Analyzer"
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
                    </>
                  )}
                </div>

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
                  <div className="space-y-3">
                    <h4 className="text-2xl font-black italic uppercase tracking-tighter leading-none">{vehicle.brand} {vehicle.model}</h4>
                    
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center gap-3 text-zinc-500">
                        <span className="text-[10px] font-black uppercase tracking-widest italic flex items-center gap-1.5">
                          <Calendar size={12} className="text-white" /> {vehicle.year || 'N/A'}
                        </span>
                        <span className="text-zinc-800">•</span>
                        <span className="text-[10px] font-black uppercase tracking-widest italic flex items-center gap-1.5">
                          <Gauge size={12} className="text-white" /> {vehicle.suspension_type}
                        </span>
                      </div>

                      {vehicle.license_plate && canSeePlate && (
                        <div className="flex items-center gap-2 bg-zinc-800 text-white border border-white/10 px-2.5 py-1 rounded-lg w-fit shadow-lg">
                          <CreditCard size={12} />
                          <span className="text-[10px] font-black uppercase italic tracking-widest">{vehicle.license_plate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {isOwnProfile && (
                    <div className="flex gap-2">
                      <button onClick={(e) => handleOpenEdit(e, vehicle)} className="p-2.5 bg-white/5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={(e) => handleDelete(e, vehicle.id)} className="p-2.5 bg-white/5 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all">
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

                <div className="pt-6 border-t border-white/5 flex justify-end items-center">
                  <button 
                    className="text-[9px] font-black uppercase tracking-widest text-white italic flex items-center gap-2 group"
                  >
                    Dettagli Progetto <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {vehicles?.length === 0 && (
          <div className="col-span-full py-24 text-center bg-zinc-900/20 border border-dashed border-white/10 rounded-[3rem]">
            <Car size={48} className="mx-auto text-zinc-800 mb-6" />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Il garage è vuoto. Inizia a caricare i tuoi progetti.</p>
            {isOwnProfile && (
              <Button 
                onClick={handleOpenAdd} 
                className="mt-8 bg-zinc-900 text-white border border-white/10 rounded-full px-8 h-12 font-black uppercase italic hover:bg-zinc-800 transition-all"
              >
                Aggiungi Veicolo
              </Button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedVehicle && (
          <VehicleDetailModal 
            isOpen={!!selectedVehicle} 
            onClose={() => setSelectedVehicle(null)} 
            vehicle={selectedVehicle}
            isOwnProfile={isOwnProfile}
            onLike={(id) => toggleLike.mutate(id)}
            currentUserId={currentUserId}
          />
        )}
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
              <StanceAnalyzer imageUrl={activeAnalyzer.url} vehicleId={activeAnalyzer.id} onClose={() => setActiveAnalyzer(null)} />
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