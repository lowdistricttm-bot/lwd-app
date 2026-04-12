"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import ProductCard from '@/components/ProductCard';
import ShopSkeleton from '@/components/ShopSkeleton';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWcProducts, useWcCategories, useWcTags } from '@/hooks/use-woocommerce';
import { motion, AnimatePresence } from 'framer-motion';

const Shop = () => {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activeTagId, setActiveTagId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const { data: categories } = useWcCategories();
  const { data: tags } = useWcTags();
  
  let params = "";
  if (activeCategoryId) params += `category=${activeCategoryId}`;
  if (activeTagId) params += `${params ? '&' : ''}tag=${activeTagId}`;

  const { data: products, isLoading } = useWcProducts(params);

  const filteredProducts = products?.filter((p: any) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      
      {/* Header Immersivo */}
      <div className="relative h-[35vh] flex items-end pb-12 px-6 overflow-hidden">
        <img 
          src="https://www.lowdistrict.it/wp-content/uploads/DSC01359-1-scaled-e1751832356345.jpg" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale scale-110"
          alt="Shop Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-none"
          >
            The <span className="text-red-600">Drop</span>
          </motion.h1>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mt-2">Official Merchandise & Parts</p>
        </div>
      </div>

      <div className="px-6 max-w-7xl mx-auto">
        {/* Barra di Navigazione Shop */}
        <div className="sticky top-16 z-30 bg-black/80 backdrop-blur-md py-6 -mx-6 px-6 border-b border-white/5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
              <button
                onClick={() => setActiveCategoryId(null)}
                className={cn(
                  "whitespace-nowrap px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all italic border",
                  activeCategoryId === null 
                    ? "bg-white text-black border-white" 
                    : "bg-zinc-900 border-white/5 text-gray-500 hover:border-white/20"
                )}
              >
                All
              </button>
              {categories?.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={cn(
                    "whitespace-nowrap px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all border italic",
                    activeCategoryId === cat.id 
                      ? "bg-red-600 border-red-600 text-white" 
                      : "bg-zinc-900 border-white/5 text-gray-500 hover:border-white/20"
                  )}
                  dangerouslySetInnerHTML={{ __html: cat.name.toUpperCase() }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="p-2.5 bg-zinc-900 border border-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <Search size={18} />
              </button>
            </div>
          </div>

          {/* Search Overlay Animato */}
          <AnimatePresence>
            {showSearch && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pt-4"
              >
                <div className="relative">
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Search products..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border-none py-4 pl-4 pr-12 text-sm font-bold focus:ring-1 focus:ring-red-600 outline-none"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      <X size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collezioni (Tag) */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-8">
          <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest shrink-0">Collections:</span>
          {tags?.map((tag: any) => (
            <button
              key={tag.id}
              onClick={() => setActiveTagId(activeTagId === tag.id ? null : tag.id)}
              className={cn(
                "whitespace-nowrap px-4 py-1.5 text-[9px] font-bold uppercase tracking-tighter transition-all rounded-full border",
                activeTagId === tag.id 
                  ? "bg-red-600/10 text-red-600 border-red-600/50" 
                  : "bg-transparent border-white/10 text-gray-500 hover:border-white/30"
              )}
              dangerouslySetInnerHTML={{ __html: tag.name.toUpperCase() }}
            />
          ))}
        </div>

        {/* Grid Prodotti */}
        <div className="py-8">
          {isLoading ? (
            <ShopSkeleton />
          ) : filteredProducts?.length === 0 ? (
            <div className="py-32 text-center">
              <p className="text-gray-500 font-black uppercase tracking-widest">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-16">
              {filteredProducts?.map((product: any) => (
                <ProductCard 
                  key={product.id} 
                  product={{
                    id: product.id,
                    name: product.name,
                    price: `€${product.price}`,
                    image: product.images[0]?.src || "https://via.placeholder.com/600x800",
                    category: product.categories[0]?.name || "General",
                    isNew: product.date_created_gmt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
                  }} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Shop;