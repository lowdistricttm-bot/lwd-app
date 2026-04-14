"use client";

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWcProduct, useWcVariations } from '@/hooks/use-woocommerce';
import { useCart } from '@/hooks/use-cart';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { data: product, isLoading } = useWcProduct(id);
  const { data: variations } = useWcVariations(product?.id);
  
  const [selectedVariation, setSelectedVariation] = useState<any>(null);

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
      quantity: 1,
      size: selectedVariation?.attributes?.[0]?.option
    });
  };

  const hasVariations = product.type === 'variable' && variations && variations.length > 0;

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 uppercase text-[10px] font-black tracking-widest">
          <ChevronLeft size={16} /> Torna allo Shop
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[4/5] bg-zinc-900 overflow-hidden relative">
            <img src={product.images[0]?.src} alt={product.name} className="w-full h-full object-cover" />
          </div>

          <div className="flex flex-col">
            <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em] mb-2">{product.categories[0]?.name}</p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4 italic" dangerouslySetInnerHTML={{ __html: product.name }} />
            <p className="text-3xl font-black tracking-tighter mb-8">{selectedVariation ? `€${selectedVariation.price}` : `€${product.price}`}</p>
            
            <div className="space-y-8 mb-12">
              <div className="text-zinc-400 leading-relaxed text-lg prose prose-invert" dangerouslySetInnerHTML={{ __html: product.short_description || product.description }} />

              {hasVariations && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Seleziona Taglia</p>
                  <div className="flex flex-wrap gap-3">
                    {variations.map((v: any) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariation(v)}
                        disabled={v.stock_status !== 'instock'}
                        className={cn(
                          "min-w-[60px] h-[60px] border flex items-center justify-center text-sm font-black uppercase transition-all",
                          selectedVariation?.id === v.id ? "border-white bg-white text-black" : "border-white/10 bg-zinc-900 text-zinc-400 hover:border-white/30",
                          v.stock_status !== 'instock' && "opacity-20 cursor-not-allowed line-through"
                        )}
                      >
                        {v.attributes[0]?.option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button 
              onClick={handleAddToCart}
              disabled={product.stock_status !== "instock" || (hasVariations && !selectedVariation)}
              className="w-full bg-white hover:bg-zinc-200 text-black py-8 text-lg font-black uppercase tracking-widest rounded-none italic"
            >
              <ShoppingBag className="mr-2" size={20} /> 
              {product.stock_status !== "instock" ? "Esaurito" : (hasVariations && !selectedVariation) ? "Seleziona Taglia" : "Aggiungi al Carrello"}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default ProductDetail;