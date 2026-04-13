"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { useWcProducts } from '@/hooks/use-woocommerce';
import { Loader2, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const Shop = () => {
  const { data: products, isLoading } = useWcProducts("per_page=20");

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-24 px-6 max-w-7xl mx-auto w-full">
        <header className="mb-12">
          <h2 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">
            Official Merch
          </h2>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">
            Shop Online
          </h1>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-red-600" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Caricamento prodotti...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {products?.map((product: any, i: number) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group"
              >
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-[4/5] bg-zinc-900 overflow-hidden relative mb-4">
                    <img 
                      src={product.images[0]?.src} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {product.on_sale && (
                      <div className="absolute top-4 left-4 bg-red-600 text-white text-[8px] font-black uppercase px-2 py-1 italic">
                        Sale
                      </div>
                    )}
                  </div>
                  <h3 className="text-xs font-black uppercase italic tracking-tight mb-1 group-hover:text-red-600 transition-colors" dangerouslySetInnerHTML={{ __html: product.name }} />
                  <p className="text-sm font-black tracking-tighter">€{product.price}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Shop;