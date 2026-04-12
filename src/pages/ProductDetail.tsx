"use client";

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, ShoppingBag, ShieldCheck, Truck, RefreshCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';
import { useWcProduct } from '@/hooks/use-woocommerce';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useWcProduct(id);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={40} />
      </div>
    );
  }

  if (!product) return <div className="min-h-screen bg-black flex items-center justify-center">Prodotto non trovato</div>;

  const handleAddToCart = () => {
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
          <div className="aspect-[4/5] bg-zinc-900 overflow-hidden relative">
            <img src={product.images[0]?.src} alt={product.name} className="w-full h-full object-cover" />
          </div>

          <div className="flex flex-col">
            <p className="text-red-600 text-xs font-black uppercase tracking-[0.3em] mb-2">
              {product.categories[0]?.name}
            </p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4 italic" dangerouslySetInnerHTML={{ __html: product.name }} />
            <p className="text-3xl font-black tracking-tighter mb-8">€{product.price}</p>
            
            <div className="space-y-8 mb-12">
              <div 
                className="text-gray-400 leading-relaxed text-lg prose prose-invert"
                dangerouslySetInnerHTML={{ __html: product.description || product.short_description }}
              />

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Disponibilità</p>
                <p className={cn(
                  "text-sm font-bold",
                  product.stock_status === "instock" ? "text-green-500" : "text-red-500"
                )}>
                  {product.stock_status === "instock" ? "In Stock" : "Esaurito"}
                </p>
              </div>
            </div>

            <Button 
              onClick={handleAddToCart}
              disabled={product.stock_status !== "instock"}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-8 text-lg font-black uppercase tracking-widest rounded-none italic shadow-2xl shadow-red-600/20"
            >
              <ShoppingBag className="mr-2" size={20} /> {product.stock_status === "instock" ? "Aggiungi al Carrello" : "Esaurito"}
            </Button>

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