"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Users, User, Loader2, Send, ShieldAlert, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useAdmin } from '@/hooks/use-admin';
import { useBodyLock } from '@/hooks/use-body-lock';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

interface AdminNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminNotificationModal = ({ isOpen, onClose }: AdminNotificationModalProps) => {
  const { allUsers, loadingUsers, isAdmin } = useAdmin();
  const [targetType, setTargetType] = useState<'all' | 'single'>('all');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useBodyLock(isOpen);

  const filteredUsers = allUsers?.filter(u => 
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.first_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5) || [];

  const handleSend = async () => {
    if (!message.trim()) {
      showError("Inserisci un messaggio");
      return;
    }

    if (targetType === 'single' && !selectedUserId) {
      showError("Seleziona un destinatario");
      return;
    }

    setIsSending(true);
    try {
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      if (!adminUser) throw new Error("Sessione scaduta");

      if (targetType === 'all') {
        // Recuperiamo tutti gli ID degli utenti
        const { data: profiles, error: pError } = await supabase.from('profiles').select('id');
        if (pError) throw pError;

        if (profiles) {
          const notifications = profiles.map(p => ({
            user_id: p.id,
            actor_id: adminUser.id,
            type: 'admin_announcement',
            content: message,
            is_read: false
          }));

          // Inserimento massivo (Supabase gestisce fino a migliaia di righe)
          const { error } = await supabase.from('notifications').insert(notifications);
          if (error) throw error;
        }
      } else {
        // Invio a utente singolo
        const { error } = await supabase.from('notifications').insert({
          user_id: selectedUserId,
          actor_id: adminUser.id,
          type: 'admin_announcement',
          content: message,
          is_read: false
        });
        if (error) throw error;
      }

      showSuccess(targetType === 'all' ? "Annuncio inviato a tutti!" : "Notifica inviata!");
      setMessage('');
      setSelectedUserId('');
      setSearchQuery('');
      onClose();
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsSending(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] touch-none" 
          />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[201] bg-zinc-950 border-t border-white/10 p-6 rounded-t-[2.5rem] max-h-[90dvh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
            style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 shrink-0" />
            
            <div className="max-w-2xl mx-auto space-y-10 pb-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                    <Bell className="text-white" /> Centro Notifiche
                  </h2>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-1">Comunicazioni Ufficiali District</p>
                </div>
                <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="space-y-8">
                {/* Selezione Target */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-4">Destinatari</label>
                  <div className="flex bg-white/5 p-1 rounded-full border border-white/5">
                    <button 
                      onClick={() => setTargetType('all')}
                      className={cn(
                        "flex-1 py-3 rounded-full text-[10px] font-black uppercase italic transition-all",
                        targetType === 'all' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      <Users size={14} className="inline mr-2" /> Tutti gli Utenti
                    </button>
                    <button 
                      onClick={() => setTargetType('single')}
                      className={cn(
                        "flex-1 py-3 rounded-full text-[10px] font-black uppercase italic transition-all",
                        targetType === 'single' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      <User size={14} className="inline mr-2" /> Utente Singolo
                    </button>
                  </div>
                </div>

                {/* Ricerca Utente (se single) */}
                {targetType === 'single' && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                      <Input 
                        placeholder="CERCA USERNAME..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white/5 border-white/10 rounded-full h-14 pl-12 text-xs font-bold uppercase tracking-widest"
                      />
                    </div>
                    
                    {searchQuery.length > 0 && (
                      <div className="bg-white/5 border border-white/10 rounded-[1.5rem] overflow-hidden">
                        {filteredUsers.map(u => (
                          <button 
                            key={u.id}
                            onClick={() => { setSelectedUserId(u.id); setSearchQuery(u.username); }}
                            className={cn(
                              "w-full flex items-center gap-4 p-4 transition-all border-b border-white/5 last:border-0",
                              selectedUserId === u.id ? "bg-white/10" : "hover:bg-white/5"
                            )}
                          >
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border border-white/10">
                              {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : <User size={16} className="m-auto h-full text-zinc-600" />}
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-black uppercase italic text-white">{u.username}</p>
                              <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">{u.role}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Messaggio */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-4">Contenuto Messaggio</label>
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                    <Textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Scrivi qui l'annuncio o il messaggio privato..."
                      className="bg-transparent border-none focus-visible:ring-0 p-0 min-h-[150px] text-sm italic text-white placeholder:text-zinc-800 resize-none"
                    />
                  </div>
                </div>

                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex items-start gap-4">
                  <ShieldAlert size={20} className="text-zinc-500 shrink-0" />
                  <p className="text-[9px] font-bold uppercase text-zinc-500 leading-relaxed">
                    Attenzione: l'invio a "Tutti gli utenti" genererà una notifica per ogni membro del District. Usa questa funzione con responsabilità per annunci importanti.
                  </p>
                </div>

                <Button 
                  onClick={handleSend}
                  disabled={isSending || (targetType === 'single' && !selectedUserId)}
                  className="w-full bg-white text-black hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] h-16 rounded-full font-black uppercase italic tracking-[0.2em] transition-all duration-500 shadow-2xl shadow-white/10"
                >
                  {isSending ? <Loader2 className="animate-spin" /> : <><Send size={18} className="mr-2 -rotate-12" /> Invia Ora</>}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdminNotificationModal;