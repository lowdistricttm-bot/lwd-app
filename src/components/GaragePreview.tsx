"use client";

import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { showSuccess } from '@/utils/toast';
import { motion, AnimatePresence } from 'framer-motion';
import CommentDrawer from './CommentDrawer';
import CreatePostDialog from './CreatePostDialog';
import { cn } from '@/lib/utils';

const activities = [
  { 
    id: 1, 
    user: "marco_ld", 
    action: "ha aggiornato il suo stato",
    content: "Finalmente montato il nuovo assetto statico. Il fitment ora è perfetto. 🔥 #lowdistrict #static #fitment",
    location: "Milano, Italy", 
    image: "https://www.lowdistrict.it/wp-content/uploads/DSC01359-1-scaled-e1751832356345.jpg", 
    likes: 1240, 
    comments: "48",
    time: "2 ore fa"
  },
  { 
    id: 2, 
    user: "stance_daily", 
    action: "ha pubblicato una nuova foto",
    content: "Sunset vibes con la nuova configurazione. Cosa ne pensate? 🌅",
    location: "Roma, Italy", 
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000", 
    likes: 856, 
    comments: "24",
    time: "5 ore fa"
  }
];

const GaragePreview = () => {
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<number, boolean>>({});
  const [showHeart, setShowHeart] = useState<number | null>(null);

  const handleLike = (id: number) => {
    setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDoubleTap = (id: number) => {
    if (!likedPosts[id]) handleLike(id);
    setShowHeart(id);
    setTimeout(() => setShowHeart(null), 800);
  };

  return (
    <section className="bg-black py-12">
      <div className="max-w-xl mx-auto px-4">
        <CreatePostDialog />

        <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
          <div>
            <h3 className="text-lg font-black tracking-tighter uppercase italic">Attività Community</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Cosa succede in Low District</p>
          </div>
          <div className="flex gap-2">
            <button className="text-[9px] font-black uppercase tracking-widest bg-zinc-900 px-3 py-1.5 border border-white/5 text-white">Tutti</button>
            <button className="text-[9px] font-black uppercase tracking-widest text-gray-500 px-3 py-1.5">Amici</button>
          </div>
        </div>
        
        <div className="space-y-12">
          {activities.map((post) => (
            <div key={post.id} className="bg-zinc-900/20 border border-white/5 rounded-3xl overflow-hidden">
              {/* Post Header */}
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]">
                    <div className="w-full h-full rounded-full border-2 border-black overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user}`} alt="" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-black leading-none mb-1 uppercase italic">
                      {post.user} <span className="text-[10px] text-white/40 font-bold lowercase not-italic">{post.action}</span>
                    </p>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{post.location}</p>
                  </div>
                </div>
                <button className="p-2 text-white/40 hover:text-white transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              
              {/* Post Image */}
              <div 
                className="relative aspect-square w-full overflow-hidden bg-zinc-900 cursor-pointer"
                onDoubleClick={() => handleDoubleTap(post.id)}
              >
                <img src={post.image} alt="" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                
                <AnimatePresence>
                  {showHeart === post.id && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                    >
                      <Heart size={100} fill="white" className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Post Actions */}
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={cn("transition-all active:scale-125", likedPosts[post.id] ? "text-red-600" : "text-white")}
                  >
                    <Heart size={26} strokeWidth={2} fill={likedPosts[post.id] ? "currentColor" : "none"} />
                  </button>
                  <CommentDrawer count={post.comments} />
                  <button className="text-white hover:text-red-600 transition-colors">
                    <Share2 size={24} strokeWidth={2} />
                  </button>
                </div>
                <button 
                  onClick={() => setSavedPosts(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                  className={cn("transition-all", savedPosts[post.id] ? "text-red-600" : "text-white")}
                >
                  <Bookmark size={26} strokeWidth={2} fill={savedPosts[post.id] ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Post Info */}
              <div className="px-4 pb-6 space-y-2">
                <p className="text-sm font-black uppercase italic tracking-tight">
                  {likedPosts[post.id] ? post.likes + 1 : post.likes} Likes
                </p>
                <p className="text-sm leading-relaxed text-gray-300">
                  <span className="font-black text-white mr-2 uppercase italic">{post.user}</span>
                  {post.content}
                </p>
                <button className="text-xs font-bold text-white/40 uppercase tracking-widest mt-2 hover:text-white transition-colors">
                  Visualizza tutti i commenti
                </button>
                <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em] mt-4">{post.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GaragePreview;