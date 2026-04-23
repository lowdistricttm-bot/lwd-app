"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useGarage, Vehicle } from '@/hooks/use-garage';
import { useAdmin } from '@/hooks/use-admin';
import { useLeaderboards } from '@/hooks/use-leaderboards';
import { useWeather } from '@/hooks/use-weather';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import ImageLightbox from './ImageLightbox';
import VehicleLogbook from './VehicleLogbook';
import StanceAnalyzer from './StanceAnalyzer';
import VehicleDetailModal from './VehicleDetailModal';
import RankBadge from './RankBadge';
import TrophyBar from './TrophyBar';
import RainCheck from './RainCheck';
import { 
  Plus, Car, Trash2, Camera, Loader2, X, Edit3, Heart, 
  Gauge, Book, Sparkles, ChevronRight, Calendar, CreditCard,
  Wrench, ArrowRightLeft, Smartphone, CloudRain, Sun, Cloud, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MediaItem {
  id: string;
  type: 'existing' | 'new';
  url: string;
  file?: File;
}

// Icona personalizzata per il Camber Helper (Ruota inclinata)
const CamberIcon = ({ className }: { className?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <g transform="rotate(-15 12 12)">
      <rect x="8" y="2" width="8" height="20" rx="1.5" />
      <rect x="10" y="5" width="4" height="14" rx="0.5" opacity="0.4" />
    </g>
  </svg>
);

const GarageTab = ({ userId, isOwnProfile = true }: { userId?: string, isOwnProfile?: boolean }) => {
  const navigate = useNavigate();
  const { vehicles, isLoading, addVehicle, updateVehicle, deleteVehicle, toggleLike } = useGarage(userId);
  const { t } = useTranslation();
  const { role, canVote } = useAdmin(); 
  const { topScored, mostLiked } = useLeaderboards();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [activeLogbook, setActiveLogbook] = useState<string | null>(null);
  const [activeAnalyzer, setActiveAnalyzer] = useState<{ url: string, id: string } | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isRainCheckOpen, setIsRainCheckOpen] = useState(false);
  const [isLocationAlertOpen, setIsLocationAlertOpen] = useState(false);
  const [lightboxData, setLightboxData] = useState<{ images: string[], index: number } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userCity, setUserCity] = useState<string | undefined>(undefined);
  
  const { data: weather } = useWeather(userCity);
  
  const [formData, setFormData] = useState({ 
    brand: '', model: '', year: '', license_plate: '', 
    suspension_type: 'STATIC', description: '' 
  });
  
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
      if (user && isOwnProfile) {
        supabase.from('profiles').select('city').eq('id', user.id).maybeSingle().then(({ data }) => {
          if (data?.city) setUserCity(data.city);
        });
      }
    });
  }, [isOwnProfile]);

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
      await updateVehicle.mutateAsync({ id: editingVehicle.id, ...formData, files, existingImages });
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

  const handleRainCheckClick = () => {
    if (!userCity) {
      setIsLocationAlertOpen(true);
      return;
    }
    setIsRainCheckOpen(true);
  };

  const getVehicleRank = (id: string) => {
    const scoreRank = topScored?.findIndex(v => v.id === id);
    if (scoreRank !== undefined && scoreRank !== -1 && scoreRank < 3) return { rank: scoreRank + 1, type: 'score' as const };
    const likeRank = mostLiked?.findIndex(v => v.id === id);
    if (likeRank !== undefined && likeRank !== -1 && likeRank < 3) return { rank: likeRank + 1, type: 'likes' as const };
    return null;
  };

  const WeatherIcon = () => {
    if (!weather) return <CloudRain size={18} />;
    if (weather.canWash) return <Sun size={18} className="text-yellow-400" />;
    if (weather.currentCondition === 'Rainy') return <CloudRain size={18} className="text-blue-400" />;
    return <Cloud size={18} className="text-zinc-400" />;
  };

  if (isLoading) return <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-zinc-500" /></div>;

  return (
    <div className="space-y-8">
      {/* Sezione Tools Globali */}
      {isOwnProfile && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => navigate('/fitment')}
              variant="outline"
              className="h-14 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 font-black uppercase italic text-[10px] tracking-widest shadow-xl flex flex-col items-center justify-center gap-1"
            >
              <ArrowRightLeft size={18} />
              <span>Fitment Calc</span>
            </Button>
            <Button 
              onClick={() => navigate('/camber')}
              variant="outline"
              className="h-14 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 font-black uppercase italic text-[10px] tracking-widest shadow-xl flex flex-col items-center justify-center gap-1"
            >
              <CamberIcon />
              <span>Camber Helper</span>
            </Button>
          </div>
          
          <Button 
            onClick={handleRainCheckClick}
            variant="outline"
            className="w-full h-14 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 font-black uppercase italic text-[10px] tracking-widest shadow-xl flex flex-col items-center justify-center gap-1"
          >
            <motion.div
              animate={{ 
                scale: weather?.canWash ? [1, 1.1, 1] : 1,
                rotate: weather?.canWash ? [0, 10, -10, 0] : 0
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <WeatherIcon />
            </motion.div>
            <span>Rain-Check: Meteo Detailing</span>
          </Button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black italic uppercase tracking-tighter">
          {isOwnProfile ? "Il Mio Garage" : "Garage"}
        </h3>
        {isOwnProfile && (
          <Button 
            onClick={handleOpenAdd} 
            className="bg-white/10 text-white border border-white/10 rounded-full h-10 px-6 font-black uppercase italic text-[10px] shadow-xl hover:bg-white/20 transition-all"
          >
            <Plus size={16} className="mr-2" /> Aggiungi
          </Button>
        )}
      </div>

      {vehicles?.length === 0 ? (
        <div className="bg-zinc-900/20 border border-dashed border-white/10 p-16 text-center rounded-[3rem]">
          <Car className="mx-auto text-zinc-800 mb-6" size={48} />
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">
            {isOwnProfile ? "Il tuo garage è vuoto. Aggiungi il tuo primo progetto!" : "Questo utente non ha ancora aggiunto veicoli."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles?.map((v, i) => {
            const rankInfo = getVehicleRank(v.id);
            const mainImage = v.images?.[0] || v.image_url;
            return (
              <motion.div 
                key={v.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedVehicle(v)}
                className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-white/20 transition-all duration-500 cursor-pointer shadow-2xl"
              >
                <div className="aspect-video relative overflow-hidden bg-zinc-950">
                  {mainImage ? (
                    <img src={mainImage} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-900"><Car size={64} /></div>
                  )}
                  <div className="absolute top-5 left-5 flex flex-col gap-2">
                    {rankInfo && <RankBadge rank={rankInfo.rank} type={rankInfo.type} />}
                    <span className="bg-white text-black text-[8px] font-black uppercase px-3 py-1.5 italic rounded-lg shadow-xl">
                      {v.suspension_type}
                    </span>
                    {v.stance_score && (
                      <span className="bg-black/60 backdrop-blur-md text-white text-[8px] font-black uppercase px-3 py-1.5 italic rounded-lg border border-white/10 flex items-center gap-1.5">
                        <Sparkles size={10} /> {v.stance_score}
                      </span>
                    )}
                  </div>
                  {isOwnProfile && (
                    <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-[-10px] group-hover:translate-y-0">
                      <button onClick={(e) => handleOpenEdit(e, v)} className="p-3 bg-white text-black rounded-full hover:scale-110 transition-all shadow-xl"><Edit3 size={16} /></button>
                      <button onClick={(e) => handleDelete(e, v.id)} className="p-3 bg-red-600 text-white rounded-full hover:scale-110 transition-all shadow-xl"><Trash2 size={16} /></button>
                    </div>
                  )}
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-1">{v.brand}</h4>
                      <p className="text-sm font-black uppercase italic text-zinc-500">{v.model}</p>
                    </div>
                    <div className="flex items-center gap-2 text-red-500">
                      <Heart size={16} fill="currentColor" />
                      <span className="text-xs font-black">{v.likes_count || 0}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[7px] font-black uppercase text-zinc-600 mb-1">Anno</p>
                      <p className="text-xs font-black italic">{v.year || 'N/A'}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[7px] font-black uppercase text-zinc-600 mb-1">Targa</p>
                      <p className="text-xs font-black italic">{v.license_plate || '---'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {isOwnProfile && (
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          onClick={(e) => { e.stopPropagation(); setActiveLogbook(v.id); }}
                          variant="outline"
                          className="h-12 rounded-full border-white/10 text-white hover:bg-white/5 font-black uppercase italic text-[9px] tracking-widest"
                        >
                          <Book size={14} className="mr-2" /> Diario
                        </Button>
                        <Button 
                          onClick={(e) => { e.stopPropagation(); setActiveAnalyzer({ url: mainImage || '', id: v.id }); }}
                          className="h-12 rounded-full bg-white text-black hover:bg-zinc-200 font-black uppercase italic text-[9px] tracking-widest shadow-xl"
                        >
                          <Sparkles size={14} className="mr-2" /> Analizza
                        </Button>
                      </div>
                    )}
                    <Button 
                      onClick={() => setSelectedVehicle(v)}
                      variant="ghost"
                      className="w-full h-10 text-zinc-500 hover:text-white text-[8px] font-black uppercase tracking-[0.3em] italic"
                    >
                      Vedi Dettagli Progetto <ChevronRight size={12} className="ml-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFormOpen(false)} className="fixed inset-0 bg-black/80 z-[250] touch-none" />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-[251] bg-black border-t border-white/10 p-6 rounded-t-[2.5rem] h-[92dvh] overflow-y-auto shadow-2xl"
              style={{ overscrollBehavior: 'contain', paddingTop: 'calc(2rem + env(safe-area-inset-top))' }}
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 shrink-0" />
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 pb-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">{editingVehicle ? 'Modifica Veicolo' : 'Nuovo Veicolo'}</h2>
                  <button type="button" onClick={() => setIsFormOpen(false)} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={24} /></button>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Marca</Label>
                      <Input required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value.toUpperCase()})} className="bg-white/5 border border-white/10 rounded-full h-14 px-6 font-bold text-xs tracking-widest text-white" placeholder="ES: BMW" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Modello</Label>
                      <Input required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value.toUpperCase()})} className="bg-white/5 border border-white/10 rounded-full h-14 px-6 font-bold text-xs tracking-widest text-white" placeholder="ES: M3 E46" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Anno</Label>
                      <Input value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="bg-white/5 border border-white/10 rounded-full h-14 px-6 font-bold text-xs tracking-widest text-white" placeholder="2004" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Targa</Label>
                      <Input value={formData.license_plate} onChange={e => setFormData({...formData, license_plate: e.target.value.toUpperCase()})} className="bg-white/5 border border-white/10 rounded-full h-14 px-6 font-bold text-xs tracking-widest text-white" placeholder="AA000BB" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Tipo Assetto</Label>
                    <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
                      {['STATIC', 'AIR'].map(type => (
                        <button key={type} type="button" onClick={() => setFormData({...formData, suspension_type: type})} className={cn("flex-1 py-3 rounded-full text-[10px] font-black uppercase italic transition-all", formData.suspension_type === type ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300")}>{type}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Foto Progetto (Max 6)</Label>
                    <div className="flex flex-wrap gap-3">
                      {mediaItems.map((item) => (
                        <div key={item.id} className="relative w-24 h-24 bg-black border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                          <img src={item.url} className="w-full h-full object-cover" alt="" />
                          <button type="button" onClick={() => removeItem(item.id)} className="absolute top-1.5 right-1.5 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-600 transition-colors"><X size={12} /></button>
                        </div>
                      ))}
                      {mediaItems.length < 6 && (
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="w-24 h-24 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-white/30 transition-all group">
                          <Camera size={24} className="text-zinc-600 group-hover:text-white mb-1" />
                          <span className="text-[7px] font-black uppercase text-zinc-600">Aggiungi</span>
                        </button>
                      )}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Descrizione Progetto</Label>
                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                      <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Descrivi le modifiche, i cerchi, l'assetto..." className="bg-transparent border-none focus-visible:ring-0 p-0 min-h-[120px] text-sm italic text-white placeholder:text-zinc-800 resize-none" />
                    </div>
                  </div>
                  <Button type="submit" disabled={addVehicle.isPending || updateVehicle.isPending} className="w-full bg-white text-black hover:bg-zinc-200 h-16 rounded-full font-black uppercase italic tracking-[0.2em] transition-all duration-500 shadow-2xl mt-4 border-none">
                    {addVehicle.isPending || updateVehicle.isPending ? <Loader2 className="animate-spin" /> : <><Car size={18} className="mr-2" /> {editingVehicle ? 'Aggiorna Veicolo' : 'Salva Veicolo'}</>}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}

        {activeLogbook && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveLogbook(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-black border border-white/10 w-full max-w-2xl h-[80vh] rounded-[3rem] overflow-hidden shadow-2xl p-8">
              <VehicleLogbook vehicleId={activeLogbook} onClose={() => setActiveLogbook(null)} />
            </motion.div>
          </div>
        )}

        {activeAnalyzer && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveAnalyzer(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-black border border-white/10 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl">
              <StanceAnalyzer imageUrl={activeAnalyzer.url} vehicleId={activeAnalyzer.id} onClose={() => setActiveAnalyzer(null)} />
            </motion.div>
          </div>
        )}

        {isRainCheckOpen && userCity && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsRainCheckOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md">
              <RainCheck city={userCity} />
              <button 
                onClick={() => setIsRainCheckOpen(false)}
                className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </motion.div>
          </div>
        )}

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
      </AnimatePresence>

      <AlertDialog open={isLocationAlertOpen} onOpenChange={setIsLocationAlertOpen}>
        <AlertDialogContent className="bg-black border border-white/10 rounded-[2rem] shadow-2xl">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center rounded-2xl rotate-12">
                <MapPin size={32} className="text-white -rotate-12" />
              </div>
            </div>
            <AlertDialogTitle className="text-white font-black uppercase italic text-center">Città non impostata</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-xs font-bold uppercase leading-relaxed text-center">
              Per usare il Rain-Check e ricevere i consigli sul lavaggio, devi prima impostare la tua città nel profilo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
            <AlertDialogAction 
              onClick={() => { setIsLocationAlertOpen(false); navigate('/profile?tab=profile'); }} 
              className="rounded-full bg-white text-black hover:bg-zinc-200 font-black uppercase italic text-[10px] w-full h-14 transition-all"
            >
              Vai al Profilo
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-full border border-white/10 text-white hover:bg-white/5 font-black uppercase italic text-[10px] w-full h-14 mt-0 transition-all">
              Chiudi
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ImageLightbox images={lightboxData?.images || []} initialIndex={lightboxData?.index || 0} isOpen={!!lightboxData} onClose={() => setLightboxData(null)} />
    </div>
  );
};

export default GarageTab;