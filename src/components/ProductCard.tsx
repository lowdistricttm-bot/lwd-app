"use client";

import React from 'react';
import { Plus, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/use-cart';

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
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const numericPrice = parseFloat(product.price.replace('€', '').replace(',', '.'));
    
    addToCart({
      id: product.id,
      name: product.name,
      price: numericPrice,
      image: product.image,
      quantity: 1
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="aspect-[3/4] bg-zinc-900 overflow-hidden relative mb-5">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="bg-red-600 text-white text-[8px] font-black uppercase px-2 py-1 tracking-widest italic">
              New Drop
            </span>
          )}
          {product.isLimited && (
            <span className="bg-white text-black text-[8px] font-black uppercase px-2 py-1 tracking-widest italic">
              Limited
            </span>
          )}
        </div>

        {/* Quick Add Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button 
            onClick={handleQuickAdd}
            className="bg-white text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-500 flex items-center gap-2"
          >
            <ShoppingBag size={14} /> Quick Add
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-[9px] text-red-600 font-black uppercase tracking-[0.2em] italic" dangerouslySetInnerHTML={{ __html: product.category }} />
        <h3 className="font-bold text-white text-sm md:text-base leading-tight group-hover:text-red-600 transition-colors" dangerouslySetInnerHTML={{ __html: product.name }} />
        <p className="text-white font-black tracking-tighter text-lg italic">{product.price}</p>
      </div>
    </motion.div>
  );
};

export default ProductCard;