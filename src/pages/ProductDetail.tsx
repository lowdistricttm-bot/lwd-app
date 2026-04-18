"use client";

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, ShoppingBag, Loader2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWcProduct, useWcVariations } from '@/hooks/use-woocommerce';
import { useCart } from '@/hooks/use-cart';
import { motion } from 'framer-motion';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { data: product, isLoading } = useWcProduct(id);
  const { data: variations } = useWcVariations(product?.id);
  
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-500" size={40} />
      </div>
    );
  }

  if (!product) return <div className="min-h-screen bg-black flex items-center justify-center">Prodotto non trovato</div>;

  const handleAddToCart = () => {
    const priceToUse = selectedVariation ? selectedVariation.price : product.price;
    const numericPrice = parseFloat(priceToUse.replace('€', '').replace(',', '.'));
    
    addToCart({
      id: product.id,
      variationId: selectedVariation?.id,
      name: product.name,
      price: numericPrice,
      image: product.images[0]?.src || "",
      quantity: quantity,
      size: selectedVariation?.attributes?.[0]?.option
    });
    
    setQuantity(1);
  };

  const hasVariations = product.type === 'variable' && variations && variations.length > 0;

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      <Navbar />
      
      <main className="pt-24 px-6 max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-zinc-600 hover:text-white mb-8 uppercase text-[10px] font-black tracking-widest transition-colors"
        >
          <ChevronLeft size={16} /> Torna allo Shop
        </button>

        <div className="flex flex-col gap-10">
          {/* Immagine Prodotto */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="aspect-[4/5] bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl"
          >
            <img src={product.images[0]?.src} alt={product.name} className="w-full h-full object-cover" />
          </motion.div>

          {/* Info Prodotto */}
          <div className="flex flex-col space-y-8">
            <div className="space-y-2">
              <h1 
                className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none" 
                dangerouslySetInnerHTML={{ __html: product.name }} 
              />
              <p className="text-3xl font-black tracking-tighter text-white">
                €{selectedVariation ? selectedVariation.price : product.price}
              </p>
            </div>
            
            <div className="text-zinc-400 leading-relaxed text-base font-medium italic prose prose-invert max-w-none" 
                 dangerouslySetInnerHTML={{ __html: product.short_description || product.description }} />

            {/* Varianti / Taglie */}
            {hasVariations && (
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Seleziona Taglia</p>
                <div className="flex flex-wrap gap-3">
                  {variations.map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariation(v)}
                      disabled={v.stock_status !== 'instock'}
                      className={cn(
                        "min-w-[64px] h-14 border rounded-2xl flex items-center justify-center text-xs font-black uppercase transition-all duration-300",
                        selectedVariation?.id === v.id 
                          ? "border-white bg-white text-black shadow-xl" 
                          : "border-white/10 bg-zinc-900/50 text-zinc-500 hover:border-white/30",
                        v.stock_status !== 'instock' && "opacity-20 cursor-not-allowed line-through"
                      )}
                    >
                      {v.attributes[0]?.option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantità */}
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Quantità</p>
              <div className="flex items-center bg-zinc-900/50 border border-white/5 rounded-2xl w-fit overflow-hidden h-14">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-14 h-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Minus size={18} />
                </button>
                <span className="w-14 text-center text-sm font-black italic">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-14 h-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Tasto Acquisto */}
            <div className="pt-4">
              <Button 
                onClick={handleAddToCart}
                disabled={product.stock_status !== "instock" || (hasVariations && !selectedVariation)}
                className="w-full bg-zinc-200 hover:bg-white text-black h-20 rounded-none flex items-center justify-center gap-4 transition-all duration-500 shadow-2xl group"
              >
                <div className="p-2 bg-black/5 rounded-lg group-hover:bg-black/10 transition-colors">
                  <ShoppingCart size={20} className="text-black" />
                </div>
                <span className="text-lg md:text-xl font-black uppercase italic tracking-widest">
                  {product.stock_status !== "instock" ? "Esaurito" : (hasVariations && !selectedVariation) ? "Seleziona Taglia" : "Aggiungi al Carrello"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default ProductDetail;