"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useMessages } from '@/hooks/use-messages';
import { ChevronLeft, Send, User, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { chatMessages, loadingChat, sendMessage } = useMessages(userId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id || null));
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !userId) return;
    await sendMessage.mutateAsync({ receiverId: userId, content: message });
    setMessage('');
  };

  const otherUser = chatMessages?.[0]?.sender_id === userId ? chatMessages[0].sender : chatMessages?.[0]?.receiver;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 h-20 px-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-zinc-400 hover:text-white"><ChevronLeft size={24} /></button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-800 rounded-full overflow-hidden border border-white/10">
            {otherUser?.avatar_url ? <img src={otherUser.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User size={18} /></div>}
          </div>
          <h4 className="text-sm font-black italic uppercase tracking-tight">{otherUser?.username || 'Chat'}</h4>
        </div>
      </nav>

      <main ref={scrollRef} className="flex-1 pt-24 pb-24 px-6 overflow-y-auto space-y-4">
        {loadingChat ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600" /></div>
        ) : (
          chatMessages?.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[80%] p-4 text-sm font-medium",
                  isMe ? "bg-red-600 text-white rounded-2xl rounded-tr-none" : "bg-zinc-900 text-zinc-200 rounded-2xl rounded-tl-none"
                )}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-white/5">
        <form onSubmit={handleSend} className="max-w-2xl mx-auto flex gap-2">
          <Input 
            placeholder="Scrivi un messaggio..." 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            className="bg-zinc-900 border-zinc-800 rounded-none h-12 font-bold uppercase text-xs tracking-widest"
          />
          <button type="submit" className="w-12 h-12 bg-red-600 flex items-center justify-center hover:bg-white hover:text-black transition-all shrink-0">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;