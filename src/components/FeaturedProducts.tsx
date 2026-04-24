"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { useWcProducts } from '@/hooks/use-woocommerce';
import { Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const FeaturedProducts = () => {
  const { data: products, isLoading } = useWcProducts("per_page=4&status=publish");

  if (isLoading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="animate-spin text-zinc-800" size={32} />
    </div>
  );

  return (
    <section className="py-12 px-6 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">Official Merch</h2>
            <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">Nuovi Drop</h3>
          </div>
          <Link to="/shop" className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white border-b border-white/20 pb-1 hover:border-white transition-all">
            Vedi Tutto <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {products?.map((product: any, i: number) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <Link to={`/product/${product.id}`}>
                <div className="aspect-[4/5] bg-[#e5e5e5] overflow-hidden relative mb-4">
                  <img 
                    src={product.images[0]?.src} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <h4 className="text-[10px] font-black uppercase italic tracking-tight mb-1 group-hover:text-zinc-400 transition-colors truncate" dangerouslySetInnerHTML={{ __html: product.name }} />
              </Link>
            </motion.div>
          ))}
        </div>

        <Link to="/shop" className="flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] text-white border border-white/10 py-6 mt-12 italic hover:bg-white/5 transition-all">
          Esplora lo Shop <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
};

export default FeaturedProducts;