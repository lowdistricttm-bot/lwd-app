"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Users, User, Loader2, Send, Search, ShieldAlert } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useAdmin } from '@/hooks/use-admin';
import { useBodyLock } from '@/hooks/use-body-lock';
import { cn } from '@/lib/utils';

interface AdminNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminNotificationModal = ({ isOpen, onClose }: AdminNotificationModalProps) => {
  const { allUsers, loadingUsers, sendAdminNotification } = useAdmin();
  const [target, setTarget] = useState<'all' | string>('all');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  useBodyLock(isOpen);

  const filteredUsers = allUsers?.filter(u => 
    u.username?.toLowerCase().includes(search.toLowerCase()) || 
    u.first_name?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    await sendAdminNotification.mutateAsync({
      targetUserId: target,
      content: message
    });
    
    setMessage('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] touch-none" 
          />
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[201] bg-black/60 backdrop-blur-2xl border-t border-white/10 p-6 rounded-t-[2.5rem] max-h-[90dvh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
            style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />
            
            <form onSubmit={handleSend} className="max-w-2xl mx-auto space-y-8 pb-[calc(4rem+env(safe-area-inset-bottom))]">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Centro Notifiche</h2>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-1">Invia comunicazioni ufficiali</p>
                </div>
                <button type="button" onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-4">Destinatario</Label>
                  <div className="flex bg-zinc-900/50 p-1 rounded-full border border-white/5">
                    <button 
                      type="button"
                      onClick={() => setTarget('all')}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[10px] font-black uppercase italic transition-all",
                        target === 'all' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      <Users size={14} /> Tutti gli utenti
                    </button>
                    <button 
                      type="button"
                      onClick={() => setTarget('')}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[10px] font-black uppercase italic transition-all",
                        target !== 'all' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      <User size={14} /> Utente Singolo
                    </button>
                  </div>
                </div>

                {target !== 'all' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="relative">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                      <Input 
                        placeholder="CERCA USERNAME..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-white/5 border-white/10 rounded-full h-12 pl-12 text-[10px] font-black uppercase tracking-widest"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto no-scrollbar p-1">
                      {filteredUsers.map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setTarget(u.id)}
                          className={cn(
                            "p-3 rounded-2xl border text-left transition-all flex items-center gap-3",
                            target === u.id ? "bg-white border-white text-black" : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10"
                          )}
                        >
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                            {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : <User size={12} className="m-auto h-full" />}
                          </div>
                          <span className="text-[9px] font-black uppercase italic truncate">{u.username || 'Utente'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-4">Messaggio</Label>
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                    <Textarea 
                      required 
                      value={message} 
                      onChange={e => setMessage(e.target.value)} 
                      placeholder="Scrivi qui il contenuto della notifica..." 
                      className="bg-transparent border-none focus-visible:ring-0 p-0 min-h-[120px] text-sm italic text-white placeholder:text-zinc-800 resize-none" 
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={sendAdminNotification.isPending || !message.trim() || (target !== 'all' && !target)}
                  className="w-full bg-white text-black hover:bg-zinc-200 h-16 rounded-full font-black uppercase italic tracking-[0.2em] transition-all duration-500 shadow-2xl shadow-white/10"
                >
                  {sendAdminNotification.isPending ? <Loader2 className="animate-spin" /> : <><Send size={18} className="mr-2 -rotate-12" /> Invia Notifica</>}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdminNotificationModal;