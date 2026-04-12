"use client";

import React from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { showSuccess } from '@/utils/toast';

const cars = [
  { id: 1, owner: "Marco_LD", car: "BMW M3 E46 Static", image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1000", likes: "1.2k", comments: "48" },
  { id: 2, owner: "Sara_Stance", car: "VW Golf MK4 Airride", image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1000", likes: "856", comments: "24" }
];

const GaragePreview = () => {
  return (
    <section className="py-8 bg-black">
      <div className="px-6 mb-6 flex items-center justify-between">
        <h3 className="text-xl font-black tracking-tighter uppercase">Community Garage</h3>
        <Link to="/garage" className="text-red-600 text-xs font-bold uppercase tracking-widest">View All</Link>
      </div>
      
      <div className="space-y-8">
        {cars.map((post) => (
          <div key={post.id} className="border-b border-white/5 pb-8">
            <div className="px-6 flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.owner}`} alt="avatar" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{post.owner}</p>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">{post.car}</p>
              </div>
            </div>
            
            <div className="aspect-square w-full overflow-hidden bg-zinc-900">
              <img src={post.image} alt={post.car} className="w-full h-full object-cover" />
            </div>
            
            <div className="px-6 mt-4 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => showSuccess(`Hai messo like all'auto di ${post.owner}!`)}
                  className="flex items-center gap-2 text-white hover:text-red-600 transition-colors"
                >
                  <Heart size={22} />
                  <span className="text-xs font-bold">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-white">
                  <MessageCircle size={22} />
                  <span className="text-xs font-bold">{post.comments}</span>
                </button>
              </div>
              <button onClick={() => showSuccess('Link copiato negli appunti!')} className="text-white">
                <Share2 size={22} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GaragePreview;