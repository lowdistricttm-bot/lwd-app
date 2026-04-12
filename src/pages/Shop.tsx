"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import ProductCard from '@/components/ProductCard';
import { Filter, Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { products } from '@/data/products';

const categories = ["All", "Stickers", "Apparel", "Car Care", "Accessories", "Lifestyle"];

const Shop = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      
      <div className="relative h-[45vh] w-full flex items-center justify-center overflow-hidden pt-16">
        <img 
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale"
          alt="Shop Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        <div className="relative z-10 text-center px-6">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-4 italic">SHOP</h1>
          <p className="text-red-600 text-xs md:text-sm font-black uppercase tracking-[0.4em]">{t.shop.subtitle}</p>
        </div>
      </div>

      <div className="px-6 max-w-7xl mx-auto -mt-12 relative z-20">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "whitespace-nowrap px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all border italic",
                activeCategory === cat 
                  ? "bg-red-600 border-red-600 text-white" 
                  : "bg-zinc-900 border-white/5 text-gray-500 hover:border-white/20"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-12 py-8 border-y border-white/5">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder={t.shop.search} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border-none py-5 pl-12 pr-4 text-sm focus:ring-1 focus:ring-red-600 outline-none font-bold"
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-between gap-6 bg-zinc-900 px-8 py-5 text-[10px] font-black uppercase tracking-widest italic">
              {t.shop.sort} <ChevronDown size={14} />
            </button>
            <button className="p-5 bg-zinc-900 text-white hover:bg-red-600 transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-16">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-32 text-center">
            <p className="text-gray-500 font-black uppercase tracking-widest italic">Nessun prodotto trovato.</p>
          </div>
        )}
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Shop;