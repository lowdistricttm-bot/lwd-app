"use client";

import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { showSuccess } from '@/utils/toast';
import { motion, AnimatePresence } from 'framer-motion';
import CommentDrawer from './CommentDrawer';
import { cn } from '@/lib/utils';

const cars = [
  { id: 1, owner: "marco_ld", car: "BMW M3 E46 Static", location: "Milano, Italy", image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1000", likes: 1240, comments: "48" },
  { id: 2, owner: "sara_stance", car: "VW Golf MK4 Airride", location: "Roma, Italy", image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1000", likes: 856, comments: "24" }
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
    <section className="bg-black">
      <div className="px-4 py-4 flex items-center justify-between border-b border-white/5">
        <h3 className="text-[15px] font-bold tracking-tight">Community Garage</h3>
        <Link to="/garage" className="text-red-600 text-[12px] font-semibold">Vedi tutti</Link>
      </div>
      
      <div className="pb-20">
        {cars.map((post) => (
          <div key={post.id} className="mb-4">
            {/* Post Header */}
            <div className="px-3 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]">
                  <div className="w-full h-full rounded-full border-2 border-black overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.owner}`} alt="" />
                  </div>
                </div>
                <div>
                  <p className="text-[13px] font-bold leading-none mb-0.5">{post.owner}</p>
                  <p className="text-[11px] text-white/60 leading-none">{post.location}</p>
                </div>
              </div>
              <MoreHorizontal size={18} className="text-white/60" />
            </div>
            
            {/* Post Image */}
            <div 
              className="relative aspect-square w-full overflow-hidden bg-zinc-900 cursor-pointer"
              onDoubleClick={() => handleDoubleTap(post.id)}
            >
              <img src={post.image} alt="" className="w-full h-full object-cover" />
              
              <AnimatePresence>
                {showHeart === post.id && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                  >
                    <Heart size={80} fill="white" className="text-white drop-shadow-2xl" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Post Actions */}
            <div className="px-3 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleLike(post.id)}
                  className={cn("transition-all active:scale-125", likedPosts[post.id] ? "text-[#ed4956]" : "text-white")}
                >
                  <Heart size={24} strokeWidth={2} fill={likedPosts[post.id] ? "currentColor" : "none"} />
                </button>
                <CommentDrawer count={post.comments} />
                <button className="text-white">
                  <Send size={22} strokeWidth={2} />
                </button>
              </div>
              <button 
                onClick={() => setSavedPosts(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                className={cn("transition-all", savedPosts[post.id] ? "text-white" : "text-white")}
              >
                <Bookmark size={24} strokeWidth={2} fill={savedPosts[post.id] ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Post Info */}
            <div className="px-3 space-y-1.5">
              <p className="text-[13px] font-bold">Piace a {likedPosts[post.id] ? post.likes + 1 : post.likes} persone</p>
              <p className="text-[13px] leading-snug">
                <span className="font-bold mr-2">{post.owner}</span>
                Finalmente montato il nuovo assetto statico. Il fitment ora è perfetto. 🔥 #lowdistrict #static #fitment
              </p>
              <button className="text-[13px] text-white/50">Mostra tutti e {post.comments} i commenti</button>
              <p className="text-[10px] text-white/40 uppercase tracking-tight">2 ore fa</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GaragePreview;