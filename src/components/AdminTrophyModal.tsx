"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, User, Car, Loader2, Send, Search, ShieldCheck, Award, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useTrophies } from '@/hooks/use-trophies';
import { useAdmin } from '@/hooks/use-admin';
import { useBodyLock } from '@/hooks/use-body-lock';
import { supabase } from "@/integrations/supabase/client";
import { cn } from '@/lib/utils';

interface AdminTrophyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminTrophyModal = ({ isOpen, onClose }: AdminTrophyModalProps) => {
  const { availableTrophies, awardTrophy } = useTrophies();
  const { allUsers } = useAdmin();
  
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedTrophy, setSelectedTrophy] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [userVehicles, setUserVehicles] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  useBodyLock(isOpen);

  useEffect(() => {
    if (selectedUser) {
      setLoadingVehicles(true);
      supabase.from('vehicles').select('*').eq('user_id', selectedUser.id)
        .then(({ data }) => {
          setUserVehicles(data || []);
          setLoadingVehicles(false);
        });
    } else {
      setUserVehicles([]);
      setSelectedVehicle('');
    }
  }, [selectedUser]);

  const filteredUsers = allUsers?.filter(u => 
    u.username?.toLowerCase().includes(search.toLowerCase()) || 
    u.first_name?.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 6) || [];

  const handleAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedTrophy) return;

    await awardTrophy.mutateAsync({
      userId: selectedUser.id,
      trophyId: selectedTrophy,
      vehicleId: selectedVehicle || undefined
    });
    
    onClose();
  };

  const inputClass = "bg-white/5 border-white/10 rounded-full h-14 px-6 font-bold text-xs tracking-widest focus-visible:ring-white/20 transition-all placeholder:text-zinc-700";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] touch-none" />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[301] bg-zinc-950 border-t border-white/10 p-6 rounded-t-[2.5rem] max-h-[90dvh] overflow-y-auto shadow-2xl"
            style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />
            
            <form onSubmit={handleAward} className="max-w-2xl mx-auto space-y-8 pb-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Assegna Trofeo</h2>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-1">Riconoscimento ufficiale District</p>
                </div>
                <button type="button" onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                {/* Ricerca Utente */}
                <div className="space-y-3">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4 italic">1. Seleziona Vincitore</Label>
                  {selectedUser ? (
                    <div className="bg-zinc-900 border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-black border border-white/10">
                          {selectedUser.avatar_url ? <img src={selectedUser.avatar_url} className="w-full h-full object-cover" /> : <User size={20} className="m-auto h-full text-zinc-700" />}
                        </div>
                        <span className="text-sm font-black uppercase italic text-white">@{selectedUser.username}</span>
                      </div>
                      <button type="button" onClick={() => setSelectedUser(null)} className="p-2 bg-white/5 rounded-full hover:bg-red-500/20 transition-colors"><X size={16} /></button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                        <Input placeholder="CERCA USERNAME..." value={search} onChange={(e) => setSearch(e.target.value)} className={cn(inputClass, "pl-12")} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {filteredUsers.map(u => (
                          <button key={u.id} type="button" onClick={() => setSelectedUser(u)} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-all">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                              {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : <User size={14} className="m-auto h-full text-zinc-700" />}
                            </div>
                            <span className="text-[10px] font-black uppercase italic truncate text-zinc-400">{u.username}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Selezione Trofeo */}
                <div className="space-y-3">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4 italic">2. Scegli il Premio</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto no-scrollbar p-1">
                    {availableTrophies?.map(t => (
                      <button 
                        key={t.id} 
                        type="button" 
                        onClick={() => setSelectedTrophy(t.id)}
                        className={cn(
                          "p-4 rounded-2xl border text-left transition-all flex items-center justify-between group",
                          selectedTrophy === t.id ? "bg-white text-black border-white" : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <Trophy size={18} className={cn(selectedTrophy === t.id ? "text-black" : "text-yellow-500")} />
                          <div>
                            <p className="text-xs font-black uppercase italic">{t.title}</p>
                            <p className={cn("text-[8px] font-bold uppercase", selectedTrophy === t.id ? "text-black/60" : "text-zinc-600")}>{t.event_name}</p>
                          </div>
                        </div>
                        {selectedTrophy === t.id && <Check size={18} strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selezione Veicolo */}
                {selectedUser && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4 italic">3. Collega al Veicolo (Opzionale)</Label>
                    {loadingVehicles ? (
                      <Loader2 className="animate-spin mx-auto text-zinc-500" />
                    ) : userVehicles.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {userVehicles.map(v => (
                          <button 
                            key={v.id} 
                            type="button" 
                            onClick={() => setSelectedVehicle(v.id)}
                            className={cn(
                              "p-3 rounded-xl border text-left transition-all flex items-center gap-3",
                              selectedVehicle === v.id ? "bg-white text-black border-white" : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10"
                            )}
                          >
                            <Car size={14} />
                            <span className="text-[9px] font-black uppercase italic truncate">{v.brand} {v.model}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[9px] font-bold uppercase text-zinc-600 italic ml-4">L'utente non ha veicoli nel garage.</p>
                    )}
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={awardTrophy.isPending || !selectedUser || !selectedTrophy}
                  className="w-full bg-zinc-900 text-white border border-white/10 hover:bg-zinc-800 h-16 rounded-full font-black uppercase italic tracking-[0.2em] transition-all duration-500 shadow-2xl mt-4"
                >
                  {awardTrophy.isPending ? <Loader2 className="animate-spin" /> : <><Send size={18} className="mr-2 -rotate-12" /> Conferma Assegnazione</>}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdminTrophyModal;