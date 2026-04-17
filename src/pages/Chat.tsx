"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useMessages } from '@/hooks/use-messages';
import { useStories } from '@/hooks/use-stories';
import { usePresence } from '@/hooks/use-presence';
import { ChevronLeft, Send, User, Loader2, Mail, Trash2, Camera, X, Plus, Play, AtSign, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from 'framer-motion';
import ImageLightbox from '@/components/ImageLightbox';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [otherUserProfile, setOtherUserProfile] = useState<any>(null);
  const [dbLastSeen, setDbLastSeen] = useState<string | null>(null);
  const [lightboxData, setLightboxData] = useState<{ images: string[], index: number } | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { chatMessages, loadingChat, sendMessage, markAsRead } = useMessages(userId);
  const { reshareStory } = useStories();
  
  // Consumiamo lo stato globale
  const { isUserOnline, getLastSeen } = usePresence();
  const isOnline = isUserOnline(userId);
  // Priorità: 1. Stato real-time dal context, 2. Fallback dal DB caricato all'inizio
  const lastSeen = getLastSeen(userId) || dbLastSeen;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login');
      else { setCurrentUserId(session.user.id); }
    });
    
    if (userId) {
      // Carichiamo il profilo e l'ultimo accesso salvato nel DB come fallback iniziale
      supabase.from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
        .then(({ data }) => {
          setOtherUserProfile(data);
          if (data?.last_seen_at) {
            setDbLastSeen(formatDistanceToNow(new Date(data.last_seen_at), { addSuffix: true, locale: it }));
          }
        });
      markAsRead.mutate(userId);
    }
  }, [userId, navigate]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatMessages]);

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

  if (loadingChat) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-zinc-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 h-20 px-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-zinc-400 hover:text-white"><ChevronLeft size={24} /></button>
        
        <button 
          onClick={() => navigate(`/profile/${userId}`)}
          className="flex items-center gap-3 hover:opacity-70 transition-opacity text-left"
        >
          <div className="relative">
            <div className="w-10 h-10 bg-zinc-800 rounded-full overflow-hidden border border-white/10">
              {otherUserProfile?.avatar_url ? (
                <img src={otherUserProfile.avatar_url} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><User size={18} className="text-zinc-600" /></div>
              )}
            </div>
            <AnimatePresence>
              {isOnline && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-black rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                />
              )}
            </AnimatePresence>
          </div>
          <div>
            <h4 className="text-sm font-black italic uppercase tracking-tight leading-none">
              {otherUserProfile?.username || 'Membro District'}
            </h4>
            <p className={cn(
              "text-[8px] font-black uppercase tracking-widest mt-1 transition-colors duration-500",
              isOnline ? "text-green-500" : "text-zinc-500"
            )}>
              {isOnline ? 'Online Ora' : lastSeen ? `Ultimo accesso ${lastSeen}` : 'Offline'}
            </p>
          </div>
        </button>
      </nav>

      <main ref={scrollRef} className="flex-1 pt-24 pb-32 px-6 overflow-y-auto space-y-6 custom-scrollbar">
        {chatMessages?.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          const isMention = msg.content.includes('Ti ha menzionato');
          const msgImages = msg.images || [];

          return (
            <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
              <div className={cn(
                "relative max-w-[85%] shadow-2xl overflow-hidden rounded-3xl", 
                isMe ? "bg-zinc-800 rounded-tr-none" : "bg-zinc-900 rounded-tl-none border border-white/5",
                isMention && "border-white/20 bg-zinc-900"
              )}>
                {msgImages.length > 0 && (
                  <div className="relative aspect-[3/4] w-64 bg-black cursor-pointer" onClick={() => setLightboxData({ images: msgImages, index: 0 })}>
                    <img src={msgImages[0]} className="w-full h-full object-cover" />
                    {isMention && (
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 text-center">
                        <AtSign size={32} className="mb-2 text-white" />
                        <p className="text-[10px] font-black uppercase tracking-widest mb-4">Sei stato menzionato!</p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleReshare(msgImages[0], msg.sender_id); }}
                          disabled={reshareStory.isPending}
                          className="bg-white text-black px-4 py-2 rounded-full text-[9px] font-black uppercase italic flex items-center gap-2 hover:scale-105 transition-all"
                        >
                          {reshareStory.isPending ? <Loader2 size={12} className="animate-spin" /> : <><RefreshCw size={12} /> Aggiungi alla tua storia</>}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-4">
                  <p className="text-sm font-medium">{msg.content}</p>
                  <p className="text-[7px] uppercase font-black opacity-40 mt-2">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-xl border-t border-white/5 z-50">
        <form onSubmit={handleSend} className="max-w-2xl mx-auto flex gap-2">
          <Input placeholder="Scrivi un messaggio..." value={message} onChange={(e) => setMessage(e.target.value)} className="bg-zinc-900 border-zinc-800 rounded-none h-12 font-bold uppercase text-xs tracking-widest" />
          <button type="submit" className="w-12 h-12 bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition-all shrink-0">
            <Send size={20} />
          </button>
        </form>
      </div>

      <ImageLightbox images={lightboxData?.images || []} initialIndex={lightboxData?.index || 0} isOpen={!!lightboxData} onClose={() => setLightboxData(null)} />
    </div>
  );
};

export default Chat;