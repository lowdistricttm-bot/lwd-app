"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { ShoppingCart, Filter } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const products = [
  { id: 1, name: "Classic Logo Hoodie", price: "€55.00", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800" },
  { id: 2, name: "Stance Culture Tee", price: "€30.00", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800" },
  { id: 3, name: "Low District Sticker Pack", price: "€12.00", image: "https://images.unsplash.com/photo-1572375927902-d62360355c57?auto=format&fit=crop&q=80&w=800" },
  { id: 4, name: "Limited Edition Cap", price: "€25.00", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800" },
  { id: 5, name: "Windbreaker Jacket", price: "€75.00", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800" },
  { id: 6, name: "Lanyard Keyring", price: "€8.00", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800" },
];

const Shop = () => {
  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">Shop</h1>
          <button className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-none border border-white/10">
            <Filter size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Filtra</span>
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
          {products.map((product) => (
            <div key={product.id} className="group">
              <div className="aspect-[4/5] bg-zinc-900 overflow-hidden mb-4 relative">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <button 
                  onClick={() => showSuccess(`${product.name} aggiunto al carrello!`)}
                  className="absolute bottom-4 right-4 bg-red-600 text-white p-3 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
                >
                  <ShoppingCart size={20} />
                </button>
              </div>
              <h3 className="font-bold text-lg">{product.name}</h3>
              <p className="text-gray-400">{product.price}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Shop;