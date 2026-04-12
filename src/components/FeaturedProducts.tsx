"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { showSuccess } from '@/utils/toast';

const products = [
  { id: 1, name: "Classic Logo Hoodie", price: "€55.00", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800", tag: "Best Seller" },
  { id: 2, name: "Stance Culture Tee", price: "€30.00", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800", tag: "New" },
  { id: 3, name: "Low District Sticker Pack", price: "€12.00", image: "https://images.unsplash.com/photo-1572375927902-d62360355c57?auto=format&fit=crop&q=80&w=800", tag: "Essential" },
  { id: 4, name: "Limited Edition Cap", price: "€25.00", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800", tag: "Limited" }
];

const FeaturedProducts = () => {
  return (
    <section className="py-24 bg-black px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-red-600 font-bold tracking-widest uppercase mb-2">Merchandise</h2>
            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter">LATEST DROPS</h3>
          </div>
          <Link to="/shop" className="text-white border-b border-red-600 pb-1 font-bold uppercase tracking-widest hover:text-red-600 transition-colors">
            View All Products
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="aspect-[4/5] overflow-hidden bg-zinc-900 mb-4 relative">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-1 tracking-widest">{product.tag}</div>
                <button 
                  onClick={() => showSuccess(`${product.name} aggiunto al carrello!`)}
                  className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"
                >
                  <ShoppingCart size={20} />
                </button>
              </div>
              <h4 className="text-white font-bold text-lg mb-1">{product.name}</h4>
              <p className="text-gray-400 font-medium">{product.price}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;