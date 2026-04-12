"use client";

import React, { useState } from 'react';
import { Heart, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { showSuccess } from '@/utils/toast';
import { motion, AnimatePresence } from 'framer-motion';
import CommentDrawer from './CommentDrawer';
import { cn } from '@/lib/utils';

const cars = [
  { id: 1, owner: "Marco_LD", car: "BMW M3 E46 Static", image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1000", likes: 1240, comments: "48" },
  { id: 2, owner: "Sara_Stance", car: "VW Golf MK4 Airride", image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1000", likes: 856, comments: "24" }
];

const GaragePreview = () => {
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
  const [showHeart, setShowHeart] = useState<number | null>(null);

  const handleLike = (id: number) => {
    setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
    if (!likedPosts[id]) {
      showSuccess("Aggiunto ai preferiti!");
    }
  };

  const handleDoubleTap = (id: number) => {
    if (!likedPosts[id]) {
      handleLike(id);
    }
    setShowHeart(id);
    setTimeout(() => setShowHeart(null), 1000);
  };

  return (
    <section className="py-8 bg-black">
      <div className="px-6 mb-6 flex items-center justify-between">
        <h3 className="text-xl font-black tracking-tighter uppercase italic">Community Garage</h3>
        <Link to="/garage" className="text-red-600 text-[10px] font-black uppercase tracking-widest border-b border-red-600/30">View All</Link>
      </div>
      
      <div className="space-y-12">
        {cars.map((post) => (
          <div key={post.id} className="border-b border-white/5 pb-8">
            <div className="px-6 flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-zinc-800 p-[1px] bg-gradient-to-tr from-red-600 to-orange-500">
                <div className="w-full h-full rounded-full border-2 border-black overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.owner}`} alt="avatar" />
                </div>
              </div>
              <div>
                <p className="text-sm font-black text-white italic">{post.owner}</p>
                <p className="text-[9px] text-gray-500 uppercase font-black tracking-tighter">{post.car}</p>
              </div>
            </div>
            
            <div 
              className="relative aspect-square w-full overflow-hidden bg-zinc-900 cursor-pointer"
              onDoubleClick={() => handleDoubleTap(post.id)}
            >
              <img src={post.image} alt={post.car} className="w-full h-full object-cover" />
              
              <AnimatePresence>
                {showHeart === post.id && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                  >
                    <Heart size={100} fill="white" className="text-white drop-shadow-2xl" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="px-6 mt-4 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => handleLike(post.id)}
                  className={cn(
                    "flex items-center gap-2 transition-all active:scale-125",
                    likedPosts[post.id] ? "text-red-600" : "text-white"
                  )}
                >
                  <Heart size={24} fill={likedPosts[post.id] ? "currentColor" : "none"} />
                  <span className="text-xs font-black italic">
                    {likedPosts[post.id] ? post.likes + 1 : post.likes}
                  </span>
                </button>
                
                <CommentDrawer count={post.comments} />
              </div>
              <button onClick={() => showSuccess('Link copiato!')} className="text-white hover:text-red-600 transition-colors">
                <Share2 size={22} />
              </button>
            </div>

            <div className="px-6 mt-3">
              <p className="text-xs text-gray-400 leading-relaxed">
                <span className="font-black text-white mr-2 italic">{post.owner}</span>
                Finalmente montato il nuovo assetto statico. Il fitment ora è perfetto. #lowdistrict #static #fitment
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GaragePreview;