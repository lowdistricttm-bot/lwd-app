"use client";

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { products } from '@/data/products';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, ShoppingBag, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === Number(id));
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  if (!product) return <div>Prodotto non trovato</div>;

  const handleAddToCart = () => {
    if (product.sizes && !selectedSize) {
      showSuccess("Per favore seleziona una taglia");
      return;
    }
    showSuccess(`${product.name} aggiunto al carrello!`);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      
      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 uppercase text-[10px] font-black tracking-widest"
        >
          <ChevronLeft size={16} /> Torna allo Shop
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Immagine Prodotto */}
          <div className="aspect-[4/5] bg-zinc-900 overflow-hidden relative">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            {product.isLimited && (
              <div className="absolute top-6 left-6 bg-white text-black px-4 py-1 text-[10px] font-black uppercase tracking-widest">
                Limited Edition
              </div>
            )}
          </div>

          {/* Info Prodotto */}
          <div className="flex flex-col">
            <p className="text-red-600 text-xs font-black uppercase tracking-[0.3em] mb-2">{product.category}</p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4 italic">{product.name}</h1>
            <p className="text-3xl font-black tracking-tighter mb-8">{product.price}</p>
            
            <div className="space-y-8 mb-12">
              <p className="text-gray-400 leading-relaxed text-lg">
                {product.description}
              </p>

              {product.sizes && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Seleziona Taglia</p>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "w-14 h-14 flex items-center justify-center border font-black text-sm transition-all",
                          selectedSize === size 
                            ? "bg-red-600 border-red-600 text-white" 
                            : "border-white/10 text-gray-400 hover:border-white/30"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Disponibilità</p>
                <p className={cn(
                  "text-sm font-bold",
                  product.stock < 10 ? "text-amber-500" : "text-green-500"
                )}>
                  {product.stock < 10 ? `Solo ${product.stock} rimasti!` : "In Stock"}
                </p>
              </div>
            </div>

            <Button 
              onClick={handleAddToCart}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-8 text-lg font-black uppercase tracking-widest rounded-none italic shadow-2xl shadow-red-600/20"
            >
              <ShoppingBag className="mr-2" size={20} /> Aggiungi al Carrello
            </Button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mt-12 pt-12 border-t border-white/5">
              <div className="text-center space-y-2">
                <Truck size={20} className="mx-auto text-gray-500" />
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Spedizione 24/48h</p>
              </div>
              <div className="text-center space-y-2">
                <ShieldCheck size={20} className="mx-auto text-gray-500" />
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Pagamento Sicuro</p>
              </div>
              <div className="text-center space-y-2">
                <RefreshCcw size={20} className="mx-auto text-gray-500" />
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Reso 14 Giorni</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default ProductDetail;