"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMessages } from '@/hooks/use-messages';
import { ChevronLeft, Send, User, Loader2, Mail, Camera, X, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [otherUserProfile, setOtherUserProfile] = useState<any>(null);
  const [msgToDelete, setMsgToDelete] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const longPressTimer = useRef<any>(null);
  
  const { chatMessages, loadingChat, sendMessage, deleteMessage } = useMessages(userId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id || null));
    
    if (userId) {
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle().then(({ data }) => {
        setOtherUserProfile(data);
      });
    }
  }, [userId]);

  useEffect(() => {
    if (userId && currentUserId && chatMessages) {
      const markAsRead = async () => {
        const { error } = await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('sender_id', userId)
          .eq('receiver_id', currentUserId)
          .eq('is_read', false);
        
        if (!error) {
          queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
        }
      };
      markAsRead();
    }
  }, [userId, currentUserId, chatMessages, queryClient]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !selectedFile) || !userId) return;
    
    try {
      await sendMessage.mutateAsync({ 
        receiverId: userId, 
        content: message,
        file: selectedFile || undefined
      });
      setMessage('');
      removeFile();
    } catch (err) {
      console.error("Errore invio messaggio:", err);
    }
  };

  const startLongPress = (msgId: string, isMe: boolean) => {
    if (!isMe) return;
    longPressTimer.current = setTimeout(() => {
      setMsgToDelete(msgId);
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }, 600);
  };

  const endLongPress = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const confirmDelete = () => {
    if (msgToDelete) {
      deleteMessage.mutate(msgToDelete);
      setMsgToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 h-[calc(4rem+env(safe-area-inset-top))] px-6 flex items-center gap-4">
        <button onClick={() => navigate('/messages')} className="p-2 text-zinc-400 hover:text-white transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-800 rounded-full overflow-hidden border border-white/10">
            {otherUserProfile?.avatar_url ? (
              <img src={otherUserProfile.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={18} className="text-zinc-600" />
              </div>
            )}
          </div>
          <div>
            <h4 className="text-sm font-black italic uppercase tracking-tight">
              {otherUserProfile?.username || 'Membro District'}
            </h4>
            <p className="text-[8px] text-green-500 font-black uppercase tracking-widest">Online</p>
          </div>
        </div>
      </nav>

      <main ref={scrollRef} className="flex-1 pt-[calc(5rem+env(safe-area-inset-top))] pb-32 px-6 overflow-y-auto space-y-4 custom-scrollbar">
        {loadingChat ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-red-600" size={32} />
          </div>
        ) : chatMessages?.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
            <Mail size={48} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Inizia la conversazione</p>
          </div>
        ) : (
          chatMessages?.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                <motion.div 
                  onMouseDown={() => startLongPress(msg.id, isMe)}
                  onMouseUp={endLongPress}
                  onMouseLeave={endLongPress}
                  onTouchStart={() => startLongPress(msg.id, isMe)}
                  onTouchEnd={endLongPress}
                  whileTap={isMe ? { scale: 0.95 } : {}}
                  className={cn(
                    "max-w-[80%] p-4 text-sm font-medium shadow-lg relative select-none cursor-pointer",
                    isMe 
                      ? "bg-red-600 text-white rounded-2xl rounded-tr-none" 
                      : "bg-zinc-900 text-zinc-200 rounded-2xl rounded-tl-none border border-white/5"
                  )}
                >
                  {msg.image_url && (
                    <div className="mb-2 rounded-lg overflow-hidden bg-black/20">
                      <img src={msg.image_url} alt="Sent" className="w-full h-auto max-h-60 object-cover" />
                    </div>
                  )}
                  {msg.content && <p>{msg.content}</p>}
                  <p className={cn(
                    "text-[7px] mt-1 uppercase font-black opacity-50",
                    isMe ? "text-right" : "text-left"
                  )}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </motion.div>
              </div>
            );
          })
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-xl border-t border-white/5 z-50 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence>
            {previewUrl && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-4 relative inline-block"
              >
                <img src={previewUrl} className="h-20 w-20 object-cover rounded-lg border border-white/10" alt="Preview" />
                <button 
                  onClick={removeFile}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg"
                >
                  <X size={12} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSend} className="flex gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 bg-zinc-900 flex items-center justify-center hover:text-red-600 transition-all shrink-0 border border-zinc-800"
            >
              <Camera size={20} />
            </button>
            <Input 
              placeholder="Scrivi un messaggio..." 
              value={message} 
              onChange={(e) => setMessage(e.target.value)}
              className="bg-zinc-900 border-zinc-800 rounded-none h-12 font-bold uppercase text-xs tracking-widest focus-visible:ring-red-600 placeholder:text-zinc-700"
            />
            <button 
              type="submit" 
              disabled={(!message.trim() && !selectedFile) || sendMessage.isPending}
              className="w-12 h-12 bg-red-600 flex items-center justify-center hover:bg-white hover:text-black transition-all shrink-0 disabled:opacity-50"
            >
              {sendMessage.isPending ? <Loader2 className="animate-spin" /> : <Send size={20} />}
            </button>
          </form>
        </div>
      </div>

      <AlertDialog open={!!msgToDelete} onOpenChange={() => setMsgToDelete(null)}>
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black italic uppercase tracking-tighter">Elimina Messaggio?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
              Questa azione rimuoverà il messaggio per tutti i partecipanti alla chat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-none border-zinc-800 font-black uppercase italic text-[10px] tracking-widest">Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="rounded-none bg-red-600 hover:bg-white hover:text-black font-black uppercase italic text-[10px] tracking-widest">Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Chat;