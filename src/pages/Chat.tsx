"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useMessages } from '@/hooks/use-messages';
import { ChevronLeft, Send, User, Loader2, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [otherUserProfile, setOtherUserProfile] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { chatMessages, loadingChat, sendMessage } = useMessages(userId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id || null));
    
    if (userId) {
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle().then(({ data }) => {
        setOtherUserProfile(data);
      });
    }
  }, [userId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !userId) return;
    try {
      await sendMessage.mutateAsync({ receiverId: userId, content: message });
      setMessage('');
    } catch (err) {
      console.error("Errore invio messaggio:", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 h-20 px-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-zinc-400 hover:text-white">
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

      <main ref={scrollRef} className="flex-1 pt-24 pb-24 px-6 overflow-y-auto space-y-4">
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
                <div className={cn(
                  "max-w-[80%] p-4 text-sm font-medium shadow-lg",
                  isMe 
                    ? "bg-red-600 text-white rounded-2xl rounded-tr-none" 
                    : "bg-zinc-900 text-zinc-200 rounded-2xl rounded-tl-none border border-white/5"
                )}>
                  {msg.content}
                  <p className={cn(
                    "text-[7px] mt-1 uppercase font-black opacity-50",
                    isMe ? "text-right" : "text-left"
                  )}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-xl border-t border-white/5">
        <form onSubmit={handleSend} className="max-w-2xl mx-auto flex gap-2">
          <Input 
            placeholder="Scrivi un messaggio..." 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            className="bg-zinc-900 border-zinc-800 rounded-none h-12 font-bold uppercase text-xs tracking-widest focus-visible:ring-red-600 placeholder:text-zinc-700"
          />
          <button 
            type="submit" 
            disabled={!message.trim() || sendMessage.isPending}
            className="w-12 h-12 bg-red-600 flex items-center justify-center hover:bg-white hover:text-black transition-all shrink-0 disabled:opacity-50"
          >
            {sendMessage.isPending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;