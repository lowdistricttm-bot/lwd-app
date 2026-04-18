"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useMessages } from '@/hooks/use-messages';
import { useStories } from '@/hooks/use-stories';
import { usePresence } from '@/hooks/use-presence';
import { useAdmin } from '@/hooks/use-admin';
import { ChevronLeft, Send, User, Loader2, Mail, Trash2, Camera, X, Plus, Play, AtSign, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from 'framer-motion';
import ImageLightbox from '@/components/ImageLightbox';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { showError } from '@/utils/toast';
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
import { useTranslation } from '@/hooks/use-translation';

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { canVote } = useAdmin();
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [otherUserProfile, setOtherUserProfile] = useState<any>(null);
  const [dbLastSeen, setDbLastSeen] = useState<string | null>(null);
  const [lightboxData, setLightboxData] = useState<{ images: string[], index: number } | null>(null);
  const [deleteMessageTarget, setDeleteMessageTarget] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDragging = useRef(false);
  
  const { chatMessages, loadingChat, sendMessage, markAsRead, deleteMessage } = useMessages(userId);
  const { reshareStory } = useStories();
  
  const { isUserOnline, getLastSeen } = usePresence();
  const isOnline = isUserOnline(userId);
  const lastSeen = getLastSeen(userId) || dbLastSeen;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login');
      else { setCurrentUserId(session.user.id); }
    });
    
    if (userId) {
      supabase.from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            if (data.role === 'subscriber' && !canVote) {
              showError("Non hai i permessi per contattare questo utente.");
              navigate('/messages');
              return;
            }
            setOtherUserProfile(data);
            if (data.last_seen_at) {
              setDbLastSeen(formatDistanceToNow(new Date(data.last_seen_at), { addSuffix: true, locale: it }));
            }
          }
        });
      markAsRead.mutate(userId);
    }
  }, [userId, navigate, canVote]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatMessages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles = [...selectedFiles, ...files].slice(0, 10);
      setSelectedFiles(newFiles);
      setPreviews(newFiles.map(file => URL.createObjectURL(file)));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newFiles.map(file => URL.createObjectURL(file)));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && selectedFiles.length === 0) || !userId) return;
    await sendMessage.mutateAsync({ receiverId: userId, content: message, files: selectedFiles });
    setMessage('');
    setSelectedFiles([]);
    setPreviews([]);
  };

  const handleReshare = async (url: string, originalAuthorId: string) => {
    await reshareStory.mutateAsync({ storyUrl: url, originalAuthorId });
    navigate('/');
  };

  const handleDeleteMessage = async () => {
    if (deleteMessageTarget) {
      await deleteMessage.mutateAsync(deleteMessageTarget);
      setDeleteMessageTarget(null);
    }
  };

  if (loadingChat) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-zinc-500" size={40} /></div>;

  return (
    <div className="min-h-screen text-white flex flex-col bg-transparent">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/10 h-20 px-6 flex items-center gap-4 pt-[env(safe-area-inset-top)]">
        <button onClick={() => navigate(-1)} className="p-2 text-zinc-400 hover:text-white"><ChevronLeft size={24} strokeWidth={2.5} /></button>
        
        <button 
          onClick={() => navigate(`/profile/${userId}`)}
          className="flex items-center gap-3 hover:opacity-70 transition-opacity text-left"
        >
          <div className="w-10 h-10 bg-zinc-900 rounded-full overflow-hidden border border-white/10">
            {otherUserProfile?.avatar_url ? (
              <img src={otherUserProfile.avatar_url} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><User size={18} strokeWidth={1.5} className="text-zinc-600" /></div>
            )}
          </div>
          <div>
            <h4 className="text-sm font-black italic uppercase tracking-tight leading-none">
              {otherUserProfile?.username || 'Membro District'}
            </h4>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                isOnline ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-zinc-600"
              )} />
              <p className={cn(
                "text-[8px] font-black uppercase tracking-widest transition-colors duration-500",
                isOnline ? "text-green-500" : "text-zinc-400"
              )}>
                {isOnline ? 'Online' : lastSeen ? `Ultimo accesso ${lastSeen}` : 'Offline'}
              </p>
            </div>
          </div>
        </button>
      </nav>

      <main ref={scrollRef} className="flex-1 pt-24 pb-[140px] px-6 overflow-y-auto space-y-6 custom-scrollbar overflow-x-hidden">
        {chatMessages?.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          const isMention = msg.content.includes('Ti ha menzionato');
          const msgImages = msg.images || [];

          return (
            <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
              <div className="relative max-w-[85%] w-fit">
                
                <div className={cn(
                  "absolute inset-0 flex items-center justify-end px-5 rounded-2xl",
                  isMe ? "bg-zinc-900/40" : "bg-zinc-900/60 border border-white/5"
                )}>
                  <Trash2 size={18} strokeWidth={2} className="text-red-500" />
                </div>

                <motion.div
                  drag="x"
                  dragSnapToOrigin={true}
                  dragConstraints={{ left: -80, right: 0 }}
                  dragElastic={0.1}
                  onDragStart={() => {
                    isDragging.current = true;
                  }}
                  onDragEnd={(_, info) => {
                    setTimeout(() => {
                      isDragging.current = false;
                    }, 150);
                    if (info.offset.x < -50) {
                      setDeleteMessageTarget(msg.id);
                    }
                  }}
                  className={cn(
                    "relative z-10 shadow-2xl overflow-hidden rounded-2xl", 
                    isMe 
                      ? "bg-blue-600 text-white rounded-tr-sm" 
                      : "bg-zinc-800 text-white rounded-tl-sm border border-white/5",
                    isMention && "border-white/20 bg-zinc-900 backdrop-blur-2xl"
                  )}
                >
                  {msgImages.length > 0 && (
                    <div 
                      className="relative aspect-[3/4] w-64 bg-black/50 cursor-pointer" 
                      onClick={(e) => {
                        if (isDragging.current) {
                          e.preventDefault();
                          e.stopPropagation();
                          return;
                        }
                        setLightboxData({ images: msgImages, index: 0 });
                      }}
                    >
                      {msgImages[0].match(/\.(mp4|webm|ogg|mov)$/i) || msgImages[0].includes('video') ? (
                        <video src={msgImages[0]} className="w-full h-full object-cover" controls />
                      ) : (
                        <img src={msgImages[0]} className="w-full h-full object-cover" />
                      )}
                      {isMention && (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                          <AtSign size={32} strokeWidth={2} className="mb-2 text-white drop-shadow-lg" />
                          <p className="text-[10px] font-black uppercase tracking-widest mb-4 text-white drop-shadow-lg">Sei stato menzionato!</p>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if(!isDragging.current) handleReshare(msgImages[0], msg.sender_id); 
                            }}
                            disabled={reshareStory.isPending}
                            className="bg-white text-black px-6 py-2.5 rounded-full text-[9px] font-black uppercase italic flex items-center gap-2 hover:scale-105 transition-all shadow-xl"
                          >
                            {reshareStory.isPending ? <Loader2 size={12} className="animate-spin" /> : <><RefreshCw size={12} strokeWidth={2.5} /> Aggiungi</>}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {msg.content && (
                    <div className={cn("p-4", isMention && "bg-black/40")}>
                      <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                      <p className={cn("text-[7px] uppercase font-black mt-2", isMe ? "text-white/50" : "text-zinc-500")}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          );
        })}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/60 backdrop-blur-2xl border-t border-white/10 z-50 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          
          {previews.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {previews.map((url, i) => (
                <div key={i} className="relative w-16 h-16 shrink-0 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
                  {selectedFiles[i]?.type.startsWith('video/') ? (
                    <video src={url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={url} className="w-full h-full object-cover" alt="Preview" />
                  )}
                  <button 
                    type="button" 
                    onClick={() => removeFile(i)} 
                    className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-white/20 transition-colors backdrop-blur-md"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSend} className="flex gap-3 items-center">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,video/*" 
              multiple 
              onChange={handleFileChange} 
            />
            
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              className="w-12 h-12 bg-white/5 border border-white/10 text-zinc-400 rounded-full flex items-center justify-center hover:text-white hover:bg-white/10 transition-all shrink-0 backdrop-blur-md"
            >
              <Camera size={20} />
            </button>

            <div className="flex-1 relative">
              <Input 
                placeholder="Messaggio" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                className="bg-white/5 border-white/10 rounded-full h-12 px-6 font-medium text-sm focus-visible:ring-white/0 focus:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-zinc-500 backdrop-blur-md" 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={sendMessage.isPending || (!message.trim() && selectedFiles.length === 0)} 
              className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shrink-0 disabled:opacity-50"
            >
              {sendMessage.isPending ? <Loader2 size={20} className="animate-spin text-black" /> : <Send size={20} strokeWidth={2.5} className="-rotate-12" />}
            </button>
          </form>
        </div>
      </div>

      <AlertDialog open={!!deleteMessageTarget} onOpenChange={() => setDeleteMessageTarget(null)}>
        <AlertDialogContent className="bg-black/60 backdrop-blur-2xl border-white/10 rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-black uppercase italic">{t.messages.deleteMsg || "Elimina Messaggio"}</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-xs font-bold uppercase">
              Questa azione eliminerà il messaggio per entrambi gli utenti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2">
            <AlertDialogAction onClick={handleDeleteMessage} className="rounded-full bg-white text-black font-black uppercase italic text-[10px] h-12 hover:bg-zinc-200">
              Elimina Definitivamente
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-full border-white/10 text-white bg-transparent hover:bg-white/10 font-black uppercase italic text-[10px] h-12 mt-0 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
              Annulla
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ImageLightbox images={lightboxData?.images || []} initialIndex={lightboxData?.index || 0} isOpen={!!lightboxData} onClose={() => setLightboxData(null)} />
    </div>
  );
};

export default Chat;