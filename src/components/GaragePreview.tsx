"use client";

import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Share2, Loader2 } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { motion, AnimatePresence } from 'framer-motion';
import CommentDrawer from './CommentDrawer';
import CreatePostDialog from './CreatePostDialog';
import { cn } from '@/lib/utils';
import { useBbActivity } from '@/hooks/use-buddyboss';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

const GaragePreview = () => {
  const { data: activities, isLoading, error } = useBbActivity();
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
  const [showHeart, setShowHeart] = useState<number | null>(null);

  const handleLike = (id: number) => {
    setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDoubleTap = (id: number) => {
    if (!likedPosts[id]) handleLike(id);
    setShowHeart(id);
    setTimeout(() => setShowHeart(null), 800);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Caricamento Bacheca...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 px-6">
        <p className="text-red-600 font-bold uppercase text-xs">Impossibile caricare i post.</p>
      </div>
    );
  }

  return (
    <section className="bg-black py-12">
      <div className="max-w-xl mx-auto px-4">
        <CreatePostDialog />

        <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
          <div>
            <h3 className="text-lg font-black tracking-tighter uppercase italic">Attività Community</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Live dal sito web</p>
          </div>
        </div>
        
        <div className="space-y-12">
          {activities?.map((post: any) => (
            <div key={post.id} className="bg-zinc-900/20 border border-white/5 rounded-3xl overflow-hidden">
              {/* Post Header */}
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]">
                    <div className="w-full h-full rounded-full border-2 border-black overflow-hidden">
                      <img src={post.user_avatar?.thumb || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`} alt="" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-black leading-none mb-1 uppercase italic">
                      {post.name}
                    </p>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                      {post.date ? formatDistanceToNow(new Date(post.date), { addSuffix: true, locale: it }) : 'Recentemente'}
                    </p>
                  </div>
                </div>
                <button className="p-2 text-white/40 hover:text-white transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              
              {/* Post Content (BuddyBoss content can be HTML) */}
              <div className="px-4 pb-4">
                <div 
                  className="text-sm leading-relaxed text-gray-300 prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>

              {/* Post Media (if any) */}
              {post.bp_media_ids && post.bp_media_ids.length > 0 && (
                <div 
                  className="relative aspect-square w-full overflow-hidden bg-zinc-900 cursor-pointer"
                  onDoubleClick={() => handleDoubleTap(post.id)}
                >
                  {/* Nota: BuddyBoss media richiede spesso un'ulteriore chiamata o un plugin specifico per l'URL diretto */}
                  {/* Per ora mostriamo un placeholder se l'URL non è immediato nel feed base */}
                  <img 
                    src={post.content.match(/src="([^"]+)"/)?.[1] || "https://www.lowdistrict.it/wp-content/uploads/DSC01359-1-scaled-e1751832356345.jpg"} 
                    alt="" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}
              
              {/* Post Actions */}
              <div className="px-4 py-4 flex items-center justify-between border-t border-white/5">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={cn("transition-all active:scale-125", likedPosts[post.id] ? "text-red-600" : "text-white")}
                  >
                    <Heart size={26} strokeWidth={2} fill={likedPosts[post.id] ? "currentColor" : "none"} />
                  </button>
                  <CommentDrawer count={post.comment_count || "0"} />
                  <button className="text-white hover:text-red-600 transition-colors">
                    <Share2 size={24} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GaragePreview;