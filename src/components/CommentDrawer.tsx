"use client";

import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { MessageCircle, Send } from 'lucide-react';

const CommentDrawer = ({ count }: { count: string }) => {
  const [comment, setComment] = useState("");

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
            <DrawerTitle className="text-center text-sm font-black uppercase tracking-widest">Commenti</DrawerTitle>
          </DrawerHeader>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 shrink-0 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User${i}`} alt="" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white mb-1">User_{i} <span className="text-gray-500 font-normal ml-2">2h</span></p>
                  <p className="text-sm text-gray-400">Fitment incredibile! 🔥</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-white/5 bg-zinc-950">
            <div className="flex items-center gap-3 bg-zinc-900 rounded-full px-4 py-2">
              <input 
                type="text" 
                placeholder="Aggiungi un commento..." 
                className="bg-transparent border-none flex-1 text-sm focus:ring-0 outline-none"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button className="text-red-600 font-bold text-xs uppercase tracking-widest">Invia</button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CommentDrawer;