"use client";

import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { useComments } from '@/hooks/use-posts';
import { useAuth } from '@/hooks/use-auth';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

const CommentDrawer = ({ postId, count }: { postId: string, count: number }) => {
  const [commentText, setCommentText] = useState("");
  const { user } = useAuth();
  const { comments, isLoading, addComment } = useComments(postId);

  const handleSend = () => {
    if (!commentText.trim() || !user) return;
    addComment({
      user_id: String(user.id),
      user_name: user.display_name,
      user_avatar: user.avatar || "",
      content: commentText
    });
    setCommentText("");
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="flex items-center gap-2 text-white hover:text-red-600 transition-colors">
          <MessageCircle size={22} />
          <span className="text-xs font-bold">{count}</span>
        </button>
      </DrawerTrigger>
      <DrawerContent className="bg-zinc-950 border-white/10 text-white h-[80vh]">
        <div className="mx-auto w-full max-w-md flex flex-col h-full">
          <DrawerHeader className="border-b border-white/5">
            <DrawerTitle className="text-center text-sm font-black uppercase tracking-widest">Commenti ({count})</DrawerTitle>
          </DrawerHeader>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-red-600" /></div>
            ) : comments?.length === 0 ? (
              <p className="text-center text-gray-500 text-xs uppercase font-bold py-10">Nessun commento. Sii il primo!</p>
            ) : (
              comments?.map((c: any) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 shrink-0 overflow-hidden">
                    <img src={c.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.user_id}`} alt="" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-white">{c.user_name}</p>
                      <span className="text-[9px] text-gray-500 font-bold uppercase">
                        {formatDistanceToNow(new Date(c.created_at), { locale: it })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{c.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {user && (
            <div className="p-6 border-t border-white/5 bg-zinc-950 pb-10">
              <div className="flex items-center gap-3 bg-zinc-900 rounded-full px-4 py-2">
                <input 
                  type="text" 
                  placeholder="Aggiungi un commento..." 
                  className="bg-transparent border-none flex-1 text-sm focus:ring-0 outline-none"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button 
                  onClick={handleSend}
                  disabled={!commentText.trim()}
                  className="text-red-600 font-bold text-xs uppercase tracking-widest disabled:opacity-50"
                >
                  Invia
                </button>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CommentDrawer;