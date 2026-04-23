"use client";

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMarketplace } from '@/hooks/use-marketplace';
import { Tag, ArrowRight, Loader2, Euro, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { useTranslation } from '@/hooks/use-translation';

const LatestMarketplaceItems = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { items, isLoading } = useMarketplace('all');
  
  const [emblaRef] = useEmblaCarousel({ 
    align: 'start', 
    containScroll: 'trimSnaps',
    dragFree: true 
  });

  if (isLoading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="animate-spin text-zinc-500" size={32} />
    </div>
  );

  const latestItems = items?.slice(0, 6) || [];

  return (
    <section className="py-12 px-6 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div className="min-w-0 flex-1">
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">District Marketplace</h2>
            <h3 className="text-2xl sm:text-3xl md:text-5xl font-black italic tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis">Ultimi Annunci</h3>
          </div>
          <Link to="/marketplace" className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white border-b border-white/20 pb-1 hover:border-white transition-all shrink-0 ml-4">
            {t?.home?.viewAll || 'VEDI TUTTO'} <ArrowRight size={14} />
          </Link>
        </div>

        {latestItems.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/20 border border-dashed border-white/5 rounded-[2rem]">
            <ShoppingBag size={40} className="mx-auto text-zinc-800 mb-4" />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">Nessun annuncio recente nel Marketplace</p>
          </div>
        ) : (
          <div className="embla overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
            <div className="embla__container flex gap-4">
              {latestItems.map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => navigate('/marketplace')}
                  className="embla__slide flex-[0_0_80%] sm:flex-[0_0_45%] md:flex-[0_0_30%] min-w-0 bg-zinc-900/40 backdrop-blur-xl border border-white/5 hover:border-white/10 transition-all group rounded-[2rem] overflow-hidden shadow-2xl"
                >
                  <div className="aspect-square relative overflow-hidden bg-zinc-950">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-900"><Tag size={48} /></div>
                    )}
                    <div className="absolute top-4 left-4">
                      <div className="bg-white text-black px-3 py-1 rounded-full text-[10px] font-black italic shadow-xl flex items-center gap-1.5">
                        <Euro size={12} /> {item.price}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h4 className="text-lg font-black italic uppercase tracking-tight mb-2 truncate text-white group-hover:text-zinc-300 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic mb-4">
                      Categoria: {item.category}
                    </p>
                    
                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                      <span className="text-[8px] font-black uppercase italic text-zinc-600">@{item.profiles?.username}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-white italic flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Dettagli <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <Link to="/marketplace" className="flex md:hidden items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white border border-white/10 py-5 mt-8 italic hover:bg-white/5 transition-all rounded-full">
          {t?.home?.viewAll || 'VEDI TUTTO'} <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
};

export default LatestMarketplaceItems;