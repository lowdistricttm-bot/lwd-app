"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import ProductCard from '@/components/ProductCard';
import { Search, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWcProducts, useWcCategories } from '@/hooks/use-woocommerce';

const Shop = () => {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories, isLoading: loadingCats } = useWcCategories();
  const { data: products, isLoading: loadingProducts } = useWcProducts(
    activeCategoryId ? `category=${activeCategoryId}` : ""
  );

  const filteredProducts = products?.filter((p: any) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      
      <div className="relative h-[40vh] w-full flex items-center justify-center overflow-hidden pt-16">
        <img 
          src="https://www.lowdistrict.it/wp-content/uploads/DSC01359-1-scaled-e1751832356345.jpg" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale"
          alt="Shop Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        <div className="relative z-10 text-center px-6">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-2 italic">SHOP</h1>
          <p className="text-red-600 text-xs font-black uppercase tracking-[0.4em]">LIVE FROM LOWDISTRICT.IT</p>
        </div>
      </div>

      <div className="px-6 max-w-7xl mx-auto -mt-8 relative z-20">
        {/* Categories Filter Dinamico */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-8">
          <button
            onClick={() => setActiveCategoryId(null)}
            className={cn(
              "whitespace-nowrap px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all border italic",
              activeCategoryId === null 
                ? "bg-red-600 border-red-600 text-white" 
                : "bg-zinc-900 border-white/5 text-gray-500 hover:border-white/20"
            )}
          >
            TUTTI
          </button>
          {categories?.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={cn(
                "whitespace-nowrap px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all border italic",
                activeCategoryId === cat.id 
                  ? "bg-red-600 border-red-600 text-white" 
                  : "bg-zinc-900 border-white/5 text-gray-500 hover:border-white/20"
              )}
              dangerouslySetInnerHTML={{ __html: cat.name.toUpperCase() }}
            />
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-12 py-8 border-t border-white/5">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Cerca nel catalogo reale..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border-none py-5 pl-12 pr-4 text-sm focus:ring-1 focus:ring-red-600 outline-none font-bold"
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-between gap-6 bg-zinc-900 px-8 py-5 text-[10px] font-black uppercase tracking-widest italic">
              ORDINA PER <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {loadingProducts ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-red-600" size={40} />
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Sincronizzazione con il sito...</p>
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

        {!loadingProducts && filteredProducts?.length === 0 && (
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