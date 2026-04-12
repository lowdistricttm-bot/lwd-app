"use client";

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, ShoppingBag, ShieldCheck, Truck, RefreshCcw, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWcProduct, useWcVariations } from '@/hooks/use-woocommerce';
import { useCart } from '@/hooks/use-cart';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { data: product, isLoading } = useWcProduct(id);
  const { data: variations, isLoading: isLoadingVariations } = useWcVariations(product?.id);
  
  const [selectedVariation, setSelectedVariation] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={40} />
      </div>
    );
  }

  if (!product) return <div className="min-h-screen bg-black flex items-center justify-center">Prodotto non trovato</div>;

  const handleAddToCart = () => {
    const priceToUse = selectedVariation ? selectedVariation.price : product.price;
    const numericPrice = parseFloat(priceToUse.replace('€', '').replace(',', '.'));
    
    addToCart({
      id: product.id,
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
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 uppercase text-[10px] font-black tracking-widest"
        >
          <ChevronLeft size={16} /> Torna allo Shop
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[4/5] bg-zinc-900 overflow-hidden relative">
            <img src={product.images[0]?.src} alt={product.name} className="w-full h-full object-cover" />
            {product.on_sale && (
              <div className="absolute top-6 left-6 bg-red-600 text-white text-[10px] font-black uppercase px-4 py-2 tracking-widest italic">
                Sale
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-red-600 text-xs font-black uppercase tracking-[0.3em] mb-2">
              {product.categories[0]?.name}
            </p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4 italic" dangerouslySetInnerHTML={{ __html: product.name }} />
            <p className="text-3xl font-black tracking-tighter mb-8">
              {selectedVariation ? `€${selectedVariation.price}` : `€${product.price}`}
            </p>
            
            <div className="space-y-8 mb-12">
              <div 
                className="text-gray-400 leading-relaxed text-lg prose prose-invert"
                dangerouslySetInnerHTML={{ __html: product.short_description || product.description }}
              />

              {/* Selezione Varianti (Taglie) */}
              {hasVariations && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Seleziona Taglia</p>
                  <div className="flex flex-wrap gap-3">
                    {variations.map((v: any) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariation(v)}
                        disabled={v.stock_status !== 'instock'}
                        className={cn(
                          "min-w-[60px] h-[60px] border flex items-center justify-center text-sm font-black uppercase transition-all",
                          selectedVariation?.id === v.id 
                            ? "border-red-600 bg-red-600 text-white" 
                            : "border-white/10 bg-zinc-900 text-gray-400 hover:border-white/30",
                          v.stock_status !== 'instock' && "opacity-20 cursor-not-allowed line-through"
                        )}
                      >
                        {v.attributes[0]?.option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Disponibilità</p>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", product.stock_status === "instock" ? "bg-green-500" : "bg-red-500")} />
                  <p className={cn(
                    "text-xs font-bold uppercase tracking-widest",
                    product.stock_status === "instock" ? "text-green-500" : "text-red-500"
                  )}>
                    {product.stock_status === "instock" ? "In Stock - Pronto per la spedizione" : "Esaurito"}
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleAddToCart}
              disabled={product.stock_status !== "instock" || (hasVariations && !selectedVariation)}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-8 text-lg font-black uppercase tracking-widest rounded-none italic shadow-2xl shadow-red-600/20"
            >
              <ShoppingBag className="mr-2" size={20} /> 
              {product.stock_status !== "instock" 
                ? "Esaurito" 
                : (hasVariations && !selectedVariation) 
                  ? "Seleziona Taglia" 
                  : "Aggiungi al Carrello"}
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