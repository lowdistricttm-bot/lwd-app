"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { useMessages } from '@/hooks/use-messages';
import { User, MessageSquare, ChevronRight, Loader2, Plus, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import NewChatModal from '@/components/NewChatModal';

const Messages = () => {
  const navigate = useNavigate();
  const { conversations, loadingConvs, deleteConversation } = useMessages();
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  const handleDeleteConversation = (e: React.MouseEvent, otherId: string, username: string) => {
    e.stopPropagation();
    if (window.confirm(`Vuoi eliminare definitivamente la conversazione con ${username}?`)) {
      deleteConversation.mutate(otherId);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-32 px-6 max-w-2xl mx-auto w-full">
        <header className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">Direct</h2>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">Messaggi</h1>
          </div>
          <button 
            onClick={() => setIsNewChatOpen(true)}
            className="w-12 h-12 bg-red-600 flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-lg shadow-red-600/20"
          >
            <Plus size={24} />
          </button>
        </header>

        {loadingConvs ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600" size={40} /></div>
        ) : conversations?.length === 0 ? (
          <div className="text-center py-20 border border-white/5 bg-zinc-900/30">
            <MessageSquare className="mx-auto text-zinc-800 mb-6" size={48} />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Nessuna conversazione attiva.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations?.map((conv: any) => (
              <div 
                key={conv.otherId}
                onClick={() => navigate(`/chat/${conv.otherId}`)}
                className="w-full bg-zinc-900/40 border border-white/5 p-4 flex items-center gap-4 hover:border-red-600/30 transition-all group cursor-pointer relative"
              >
                <div className="w-14 h-14 bg-zinc-800 rounded-full overflow-hidden border border-white/10 shrink-0">
                  {conv.otherUser?.avatar_url ? (
                    <img src={conv.otherUser.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={24} /></div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-black italic uppercase tracking-tight truncate">
                      {conv.otherUser?.username || 'Membro District'}
                    </h4>
                    <span className="text-[8px] text-zinc-600 font-bold uppercase">
                      {formatDistanceToNow(new Date(conv.lastMessage.created_at), { addSuffix: true, locale: it })}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 truncate font-medium">
                    {conv.lastMessage.content}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => handleDeleteConversation(e, conv.otherId, conv.otherUser?.username || 'Membro')}
                    className="p-2 text-zinc-800 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                    title="Elimina conversazione"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight size={16} className="text-zinc-800 group-hover:text-red-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <NewChatModal isOpen={isNewChatOpen} onClose={() => setIsNewChatOpen(false)} />
      <BottomNav />
    </div>
  );
};

export default Messages;