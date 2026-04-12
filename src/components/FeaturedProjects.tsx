"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const projects = [
  {
    id: 1,
    title: "BMW M3 E46 Static",
    owner: "StanceMaster",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800",
    tag: "Static"
  },
  {
    id: 2,
    title: "Golf MK4 Airride",
    owner: "LowLife",
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800",
    tag: "Airride"
  },
  {
    id: 3,
    title: "Audi RS3 Widebody",
    owner: "QuattroKing",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=800",
    tag: "Static"
  }
];

const FeaturedProjects = () => {
  return (
    <section className="py-24 bg-black overflow-hidden">
      <div className="px-6 max-w-7xl mx-auto mb-12 flex items-end justify-between">
        <div>
          <h2 className="text-red-600 font-black tracking-widest uppercase mb-2 text-[10px]">Community</h2>
          <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase">Featured Projects</h3>
        </div>
        <Link to="/community" className="text-white/40 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic">
          Explore All <ChevronRight size={14} />
        </Link>
      </div>

      <div className="flex gap-6 overflow-x-auto no-scrollbar px-6 pb-8">
        {projects.map((project, i) => (
          <motion.div 
            key={project.id}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="min-w-[300px] md:min-w-[450px] aspect-[16/10] relative group overflow-hidden"
          >
            <img 
              src={project.image} 
              alt={project.title} 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-2">
                <Star size={12} className="text-red-600 fill-red-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-red-600">{project.tag}</span>
              </div>
              <h4 className="text-2xl font-black uppercase italic text-white mb-1">{project.title}</h4>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">By @{project.owner}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProjects;