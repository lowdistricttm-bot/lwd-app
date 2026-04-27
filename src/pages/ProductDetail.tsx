"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { ChevronLeft, Loader2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWcProduct, useWcVariations } from '@/hooks/use-woocommerce';
import { useCart } from '@/hooks/use-cart';
import { motion } from 'framer-motion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { data: product, isLoading } = useWcProduct(id);
  const { data: variations } = useWcVariations(product?.id);
  
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Sincronizza l'indice delle miniature con lo scorrimento del carosello
  useEffect(() => {
    if (!api) return;
    
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollTo = (index: number) => {
    api?.scrollTo(index);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-500" size={40} />
      </div>
    );
  }

  if (!product) return <div className="min-h-screen bg-transparent flex items-center justify-center">Prodotto non trovato</div>;

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
    <div className="min-h-screen bg-transparent text-white pb-32">
      <Navbar />
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top)+2rem)] px-6 max-w-7xl mx-auto w-full">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 uppercase text-[9px] font-black tracking-widest transition-colors"
        >
          <ChevronLeft size={14} /> Torna allo Shop
        </button>

        {/* CONTENITORE PRINCIPALE (FONDAMENTALE) */}
        <div className="flex flex-col md:flex-row gap-12 items-start">
          
          {/* Contenitore Immagini e Miniature */}
          <div className="w-full md:w-1/2 space-y-6">
            {/* Carosello Principale */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full aspect-square md:aspect-[4/5] bg-white rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative group"
            >
              <Carousel setApi={setApi} className="w-full h-full">
                <CarouselContent className="h-full ml-0">
                  {product.images.map((img: any, index: number) => (
                    <CarouselItem key={index} className="pl-0 h-full flex items-center justify-center bg-white">
                      <img 
                        src={img.src} 
                        alt={`${product.name} ${index}`} 
                        className="w-full h-full object-contain p-4 md:p-8" 
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
              
              {/* Badge numero foto */}
              {product.images.length > 1 && (
                <div className="absolute bottom-6 right-8 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-[8px] font-black uppercase tracking-widest z-10">
                  {current + 1} / {product.images.length}
                </div>
              )}
            </motion.div>

            {/* Miniature Sotto */}
            {product.images.length > 1 && (
              <div className="flex flex-wrap gap-3 justify-center md:justify-start px-2">
                {product.images.map((img: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => scrollTo(index)}
                    className={cn(
                      "w-16 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 bg-white",
                      current === index 
                        ? "border-white scale-110 shadow-lg shadow-white/20" 
                        : "border-transparent opacity-40 hover:opacity-100"
                    )}
                  >
                    <img src={img.src} className="w-full h-full object-contain p-1" alt="thumbnail" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Prodotto */}
          <div className="w-full md:w-1/2 flex flex-col space-y-10 md:sticky md:top-[calc(4rem+env(safe-area-inset-top)+2rem)]">
            <div className="flex flex-col items-center md:items-start">
              <h1 
                className="text-[10px] font-black tracking-[0.4em] uppercase italic text-zinc-500 mb-2 text-center md:text-left" 
                dangerouslySetInnerHTML={{ __html: product.name }} 
              />
              <p className="text-3xl md:text-5xl font-black tracking-tight text-white italic text-center md:text-left">
                {selectedVariation ? selectedVariation.price : product.price} €
              </p>
            </div>
            
            <div className="text-zinc-400 leading-relaxed text-sm font-medium italic prose prose-invert max-w-none text-center md:text-left" 
                 dangerouslySetInnerHTML={{ __html: product.short_description || product.description }} />

            {/* Varianti / Taglie */}
            {hasVariations && (
              <div className="space-y-5 flex flex-col items-center md:items-start">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Seleziona Taglia</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  {variations.map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariation(v)}
                      disabled={v.stock_status !== 'instock'}
                      className={cn(
                        "min-w-[64px] h-12 border rounded-full flex items-center justify-center text-[9px] font-black uppercase tracking-widest transition-all duration-500 shadow-lg",
                        selectedVariation?.id === v.id 
                          ? "border-white bg-white text-black scale-105" 
                          : "border-white/10 bg-white/5 backdrop-blur-md text-zinc-500 hover:border-white/30 hover:text-white",
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
            <div className="space-y-5 flex flex-col items-center md:items-start">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Quantità</p>
              <div className="flex items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-full w-fit overflow-hidden h-12 shadow-xl">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center text-[10px] font-black italic">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Tasto Acquisto */}
            <div className="pt-6">
              <Button 
                onClick={handleAddToCart}
                disabled={product.stock_status !== "instock" || (hasVariations && !selectedVariation)}
                className="w-full bg-white text-black hover:bg-zinc-200 h-16 rounded-full flex items-center justify-center gap-3 transition-all duration-500 shadow-2xl group border-none"
              >
                <div className="p-2 bg-black/5 rounded-full group-hover:bg-black/10 transition-colors">
                  <ShoppingCart size={18} className="text-black" />
                </div>
                <span className="text-[10px] font-black uppercase italic tracking-[0.2em]">
                  {product.stock_status !== "instock" ? "Esaurito" : (hasVariations && !selectedVariation) ? "Seleziona Taglia" : "Aggiungi al Carrello"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;