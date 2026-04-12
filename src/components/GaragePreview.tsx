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
    <section className="bg-black py-12">
      <div className="max-w-xl mx-auto">
        <div className="px-4 py-6 flex items-center justify-between border-b border-white/5 mb-4">
          <div>
            <h3 className="text-lg font-black tracking-tighter uppercase italic">Community Garage</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">I migliori progetti della scena</p>
          </div>
          <Link to="/garage" className="text-red-600 text-xs font-black uppercase tracking-widest border border-red-600/20 px-4 py-2 hover:bg-red-600 hover:text-white transition-all">
            Vedi tutti
          </Link>
        </div>
        
        <div className="space-y-12">
          {cars.map((post) => (
            <div key={post.id} className="bg-zinc-900/20 border border-white/5 md:rounded-3xl overflow-hidden">
              {/* Post Header */}
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]">
                    <div className="w-full h-full rounded-full border-2 border-black overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.owner}`} alt="" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-black leading-none mb-1 uppercase italic">{post.owner}</p>
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
                    <Send size={24} strokeWidth={2} />
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
                  <span className="font-black text-white mr-2 uppercase italic">{post.owner}</span>
                  Finalmente montato il nuovo assetto statico. Il fitment ora è perfetto. 🔥 #lowdistrict #static #fitment
                </p>
                <button className="text-xs font-bold text-white/40 uppercase tracking-widest mt-2 hover:text-white transition-colors">
                  Mostra tutti e {post.comments} i commenti
                </button>
                <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em] mt-4">2 ore fa</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GaragePreview;