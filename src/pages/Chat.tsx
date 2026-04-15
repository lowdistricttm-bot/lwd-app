"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useMessages } from '@/hooks/use-messages';
import { ChevronLeft, Send, User, Loader2, Mail, Trash2, Camera, X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from 'framer-motion';
import ImageLightbox from '@/components/ImageLightbox';
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

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [otherUserProfile, setOtherUserProfile] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [lightboxData, setLightboxData] = useState<{ images: string[], index: number } | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { chatMessages, loadingChat, sendMessage, deleteMessage, markAsRead } = useMessages(userId);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login');
      else { setCurrentUserId(session.user.id); setCheckingAuth(false); }
    });
    if (userId) {
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle().then(({ data }) => setOtherUserProfile(data));
      markAsRead.mutate(userId);
    }
  }, [userId, navigate]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatMessages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles = [...selectedFiles, ...files].slice(0, 5);
      setSelectedFiles(newFiles);
      setPreviews(newFiles.map(file => URL.createObjectURL(file)));
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newFiles.map(file => URL.createObjectURL(file)));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && selectedFiles.length === 0) || !userId) return;
    try {
      await sendMessage.mutateAsync({ receiverId: userId, content: message, files: selectedFiles });
      setMessage('');
      setSelectedFiles([]);
      setPreviews([]);
    } catch (err) {}
  };

  const handleDelete = async () => {
    if (deleteTarget) { await deleteMessage.mutateAsync(deleteTarget); setDeleteTarget(null); }
  };

  if (checkingAuth) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-zinc-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 h-20 px-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-zinc-400 hover:text-white"><ChevronLeft size={24} /></button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-800 rounded-full overflow-hidden border border-white/10">
            {otherUserProfile?.avatar_url ? <img src={otherUserProfile.avatar_url} className="w-full h-full object-cover" alt="Avatar" /> : <div className="w-full h-full flex items-center justify-center"><User size={18} className="text-zinc-600" /></div>}
          </div>
          <div>
            <h4 className="text-sm font-black italic uppercase tracking-tight">{otherUserProfile?.username || 'Membro District'}</h4>
            <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Online</p>
          </div>
        </div>
      </nav>

      <main ref={scrollRef} className="flex-1 pt-24 pb-32 px-6 overflow-y-auto space-y-4">
        {loadingChat ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-500" size={32} /></div> : chatMessages?.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20"><Mail size={48} className="mb-4" /><p className="text-[10px] font-black uppercase tracking-widest">Inizia la conversazione</p></div> : chatMessages?.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          const msgImages = msg.images || [];
          return (
            <div key={msg.id} className={cn("flex relative", isMe ? "justify-end" : "justify-start")}>
              {isMe && <div className="absolute inset-y-0 right-0 w-20 bg-zinc-800 flex items-center justify-center rounded-2xl rounded-tr-none"><Trash2 size={16} className="text-white" /></div>}
              <motion.div drag={isMe ? "x" : false} dragConstraints={{ left: -80, right: 0 }} dragElastic={0.1} onDragEnd={(_, info) => { if (info.offset.x < -50) setDeleteTarget(msg.id); }} className={cn("relative max-w-[80%] shadow-lg z-10 overflow-hidden", isMe ? "bg-zinc-800 text-white rounded-2xl rounded-tr-none" : "bg-zinc-900 text-zinc-200 rounded-2xl rounded-tl-none border border-white/5")}>
                {msgImages.length > 0 && (
                  <div className={cn("grid gap-0.5 bg-black", msgImages.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
                    {msgImages.map((url, idx) => (
                      <div key={idx} className="aspect-square bg-zinc-950 cursor-pointer overflow-hidden" onClick={() => setLightboxData({ images: msgImages, index: idx })}>
                        <img src={url} className="w-full h-full object-cover" alt="" />
                      </div>
                    ))}
                  </div>
                )}
                <div className="p-4">
                  {msg.content && <p className="text-sm font-medium">{msg.content}</p>}
                  <p className={cn("text-[7px] mt-1 uppercase font-black opacity-50", isMe ? "text-right" : "text-left")}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </motion.div>
            </div>
          );
        })}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-xl border-t border-white/5 z-50">
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence>
            {previews.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {previews.map((url, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="relative w-20 h-20 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shrink-0">
                    <img src={url} className="w-full h-full object-cover" alt="" />
                    <button onClick={() => removeFile(i)} className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full"><X size={10} /></button>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSend} className="flex gap-2 items-center">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-12 h-12 bg-zinc-900 text-zinc-400 flex items-center justify-center hover:text-white transition-all shrink-0"><Camera size={20} /></button>
            <Input placeholder="Scrivi un messaggio..." value={message} onChange={(e) => setMessage(e.target.value)} className="bg-zinc-900 border-zinc-800 rounded-none h-12 font-bold uppercase text-xs tracking-widest focus-visible:ring-white placeholder:text-zinc-700" />
            <button type="submit" disabled={(!message.trim() && selectedFiles.length === 0) || sendMessage.isPending} className="w-12 h-12 bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition-all shrink-0 disabled:opacity-50">
              {sendMessage.isPending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </form>
        </div>
      </div>

      <ImageLightbox images={lightboxData?.images || []} initialIndex={lightboxData?.index || 0} isOpen={!!lightboxData} onClose={() => setLightboxData(null)} />
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-none">
          <AlertDialogHeader><AlertDialogTitle className="text-white font-black uppercase italic">Elimina Messaggio?</AlertDialogTitle><AlertDialogDescription className="text-zinc-500 text-xs font-bold uppercase">Questa azione eliminerà il messaggio permanentemente.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="rounded-none border-white/10 text-white font-black uppercase italic text-[10px]">Annulla</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="rounded-none bg-zinc-800 text-white font-black uppercase italic text-[10px]">Elimina</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Chat;