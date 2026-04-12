"use client";

import React from 'react';
import { ShoppingCart, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { showSuccess } from '@/utils/toast';

interface ProductProps {
  product: {
    id: number;
    name: string;
    price: string;
    image: string;
    category: string;
    isNew?: boolean;
    isLimited?: boolean;
  };
}

const ProductCard = ({ product }: ProductProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group cursor-pointer"
    >
      <div className="aspect-[3/4] bg-zinc-900 overflow-hidden relative mb-4">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isNew && (
            <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-1 tracking-widest">
              New Drop
            </span>
          )}
          {product.isLimited && (
            <span className="bg-white text-black text-[10px] font-black uppercase px-2 py-1 tracking-widest">
              Limited
            </span>
          )}
        </div>

        {/* Quick Add Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            showSuccess(`${product.name} aggiunto al carrello!`);
          }}
          className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{product.category}</p>
        <h3 className="font-bold text-white text-sm md:text-base group-hover:text-red-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-white font-black tracking-tighter">{product.price}</p>
      </div>
    </motion.div>
  );
};

export default ProductCard;