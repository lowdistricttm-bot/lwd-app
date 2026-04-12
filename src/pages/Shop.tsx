"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import ProductCard from '@/components/ProductCard';
import { Filter, Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = ["All", "Hoodies", "T-Shirts", "Accessories", "Stickers", "Limited"];

const products = [
  { id: 1, name: "LD 'Static' Hoodie - Black", price: "€65.00", category: "Hoodies", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800", isNew: true },
  { id: 2, name: "Respect the Fitment Tee", price: "€35.00", category: "T-Shirts", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800", isNew: true },
  { id: 3, name: "Low District Sticker Pack v2", price: "€15.00", category: "Stickers", image: "https://images.unsplash.com/photo-1572375927902-d62360355c57?auto=format&fit=crop&q=80&w=800" },
  { id: 4, name: "Carbon Fiber Keychain", price: "€12.00", category: "Accessories", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800", isLimited: true },
  { id: 5, name: "LD Racing Windbreaker", price: "€85.00", category: "Accessories", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800" },
  { id: 6, name: "Stance Culture Cap", price: "€28.00", category: "Accessories", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800" },
];

const Shop = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      
      {/* Hero Shop / Collection Banner */}
      <div className="relative h-[40vh] w-full flex items-center justify-center overflow-hidden pt-16">
        <img 
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale"
          alt="Shop Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        <div className="relative z-10 text-center px-6">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-4">Merchandising</h1>
          <p className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-[0.3em]">Official Low District Gear</p>
        </div>
      </div>

      <div className="px-6 max-w-7xl mx-auto -mt-10 relative z-20">
        {/* Categories Scrollable */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "whitespace-nowrap px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all border",
                activeCategory === cat 
                  ? "bg-red-600 border-red-600 text-white" 
                  : "bg-zinc-900 border-white/5 text-gray-500 hover:border-white/20"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-12 py-6 border-y border-white/5">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Cerca prodotti..." 
              className="w-full bg-zinc-900 border-none py-4 pl-12 pr-4 text-sm focus:ring-1 focus:ring-red-600 outline-none"
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-between gap-4 bg-zinc-900 px-6 py-4 text-[10px] font-black uppercase tracking-widest">
              Ordina per <ChevronDown size={14} />
            </button>
            <button className="p-4 bg-zinc-900 text-white">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-16">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-32 text-center">
            <p className="text-gray-500 font-bold uppercase tracking-widest">Nessun prodotto trovato in questa categoria.</p>
          </div>
        )}
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Shop;