"use client";

import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { useWcProducts, useWcCategories } from '@/hooks/use-woocommerce';
import { Loader2, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: categories, isLoading: loadingCats } = useWcCategories();
  
  const productParams = currentCategory === 'all' 
    ? "per_page=100" 
    : `category=${currentCategory}&per_page=100`;
    
  const { data: products, isLoading: loadingProducts } = useWcProducts(productParams);

  const handleCategorySelect = (slug: string) => {
    if (slug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
    setIsFilterOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-24 px-6 max-w-7xl mx-auto w-full">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">
              Official Merch
            </h2>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">
              Shop Online
            </h1>
          </div>

          {/* Desktop Categories */}
          <div className="hidden md:flex items-center gap-6 overflow-x-auto no-scrollbar pb-2">
            <button 
              onClick={() => handleCategorySelect('all')}
              className={cn(
                "text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 pb-1",
                currentCategory === 'all' ? "text-red-600 border-red-600" : "text-zinc-500 border-transparent hover:text-white"
              )}
            >
              Tutti
            </button>
            {categories?.map((cat: any) => (
              <button 
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id.toString())}
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 pb-1",
                  currentCategory === cat.id.toString() ? "text-red-600 border-red-600" : "text-zinc-500 border-transparent hover:text-white"
                )}
                dangerouslySetInnerHTML={{ __html: cat.name }}
              />
            ))}
          </div>

          {/* Mobile Filter Toggle */}
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="md:hidden flex items-center gap-2 bg-zinc-900 border border-white/10 px-4 py-3 text-[10px] font-black uppercase tracking-widest italic"
          >
            <Filter size={14} /> Filtra Categorie
          </button>
        </header>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {isFilterOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFilterOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="fixed right-0 top-0 bottom-0 w-4/5 bg-zinc-950 z-[101] p-8 border-l border-white/10"
              >
                <div className="flex justify-between items-center mb-12">
                  <h3 className="text-xl font-black italic uppercase">Categorie</h3>
                  <button onClick={() => setIsFilterOpen(false)}><X size={24} /></button>
                </div>
                <div className="space-y-6">
                  <button 
                    onClick={() => handleCategorySelect('all')}
                    className={cn(
                      "block w-full text-left text-sm font-black uppercase tracking-widest italic",
                      currentCategory === 'all' ? "text-red-600" : "text-zinc-500"
                    )}
                  >
                    Tutti i Prodotti
                  </button>
                  {categories?.map((cat: any) => (
                    <button 
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id.toString())}
                      className={cn(
                        "block w-full text-left text-sm font-black uppercase tracking-widest italic",
                        currentCategory === cat.id.toString() ? "text-red-600" : "text-zinc-500"
                      )}
                      dangerouslySetInnerHTML={{ __html: cat.name }}
                    />
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {loadingProducts || loadingCats ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-red-600" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sincronizzazione prodotti...</p>
          </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-20 border border-white/5 bg-zinc-900/30">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Nessun prodotto trovato in questa categoria.</p>
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