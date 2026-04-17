"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { useWcProducts, useWcCategories } from '@/hooks/use-woocommerce';
import { Loader2, Filter, X, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

const Shop = () => {
  const { t, language } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategoryId = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: allCategories, isLoading: loadingCats } = useWcCategories();
  
  const mainCategories = useMemo(() => 
    allCategories?.filter((cat: any) => cat.parent === 0) || [], 
  [allCategories]);

  const abbigliamentoCat = useMemo(() => 
    allCategories?.find((cat: any) => cat.slug === 'abbigliamento'),
  [allCategories]);

  const isAbbigliamentoActive = useMemo(() => {
    if (currentCategoryId === 'all' || !abbigliamentoCat) return false;
    if (currentCategoryId === abbigliamentoCat.id.toString()) return true;
    const currentCat = allCategories?.find((cat: any) => cat.id.toString() === currentCategoryId);
    return currentCat?.parent === abbigliamentoCat.id;
  }, [currentCategoryId, abbigliamentoCat, allCategories]);

  const subCategories = useMemo(() => 
    allCategories?.filter((cat: any) => cat.parent === abbigliamentoCat?.id) || [],
  [allCategories, abbigliamentoCat]);

  // Costruzione parametri per l'API WooCommerce
  const productParams = useMemo(() => {
    let params = `per_page=100`;
    if (currentCategoryId !== 'all') {
      params += `&category=${currentCategoryId}`;
    }
    if (searchQuery) {
      params += `&search=${encodeURIComponent(searchQuery)}`;
    }
    return params;
  }, [currentCategoryId, searchQuery]);
    
  const { data: products, isLoading: loadingProducts } = useWcProducts(productParams);

  const handleCategorySelect = (id: string) => {
    if (id === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', id);
    }
    setSearchParams(searchParams);
    setIsFilterOpen(false);
  };

  const clearSearch = () => {
    searchParams.delete('search');
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen text-white flex flex-col bg-transparent">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-24 px-6 max-w-7xl mx-auto w-full">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="min-w-0 flex-1">
              <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">
                {searchQuery ? t.shop.results : t.shop.subtitle}
              </h2>
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-6xl font-black italic tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                {searchQuery ? `"${searchQuery}"` : t.shop.title}
              </h1>
              {searchQuery && (
                <button 
                  onClick={clearSearch}
                  className="mt-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={14} /> {language === 'it' ? 'Rimuovi Filtro Ricerca' : 'Remove Search Filter'}
                </button>
              )}
            </div>

            <div className="hidden md:flex items-center gap-6 overflow-x-auto no-scrollbar pb-2">
              <button 
                onClick={() => handleCategorySelect('all')}
                className={cn(
                  "text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 pb-1",
                  currentCategoryId === 'all' ? "text-white border-white" : "text-zinc-500 border-transparent hover:text-white"
                )}
              >
                {t.shop.all}
              </button>
              {mainCategories.map((cat: any) => (
                <button 
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id.toString())}
                  className={cn(
                    "text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 pb-1",
                    (currentCategoryId === cat.id.toString() || (cat.slug === 'abbigliamento' && isAbbigliamentoActive)) 
                      ? "text-white border-white" 
                      : "text-zinc-500 border-transparent hover:text-white"
                  )}
                  dangerouslySetInnerHTML={{ __html: cat.name }}
                />
              ))}
            </div>

            <button 
              onClick={() => setIsFilterOpen(true)}
              className="md:hidden flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md border border-white/10 px-4 py-3 text-[9px] font-black uppercase tracking-widest italic"
            >
              <Filter size={14} /> {t.shop.filter}
            </button>
          </div>

          <AnimatePresence>
            {isAbbigliamentoActive && subCategories.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 overflow-x-auto no-scrollbar py-4 border-t border-white/5"
              >
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 shrink-0">{t.shop.subcategories}:</span>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleCategorySelect(abbigliamentoCat!.id.toString())}
                    className={cn(
                      "px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border backdrop-blur-md transition-all",
                      currentCategoryId === abbigliamentoCat!.id.toString() 
                        ? "bg-white/90 text-black border-white" 
                        : "bg-transparent text-zinc-400 border-white/10 hover:border-white/30"
                    )}
                  >
                    {language === 'it' ? 'Tutto Abbigliamento' : 'All Clothing'}
                  </button>
                  {subCategories.map((sub: any) => (
                    <button 
                      key={sub.id}
                      onClick={() => handleCategorySelect(sub.id.toString())}
                      className={cn(
                        "px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border backdrop-blur-md transition-all",
                        currentCategoryId === sub.id.toString() 
                          ? "bg-white/90 text-black border-white" 
                          : "bg-transparent text-zinc-400 border-white/10 hover:border-white/30"
                      )}
                      dangerouslySetInnerHTML={{ __html: sub.name }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <AnimatePresence>
          {isFilterOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFilterOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="fixed right-0 top-0 bottom-0 w-4/5 bg-zinc-950 z-[101] p-8 border-l border-white/10 overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-12">
                  <h3 className="text-xl font-black italic uppercase">{t.shop.categories}</h3>
                  <button onClick={() => setIsFilterOpen(false)}><X size={24} /></button>
                </div>
                <div className="space-y-8">
                  <button 
                    onClick={() => handleCategorySelect('all')}
                    className={cn(
                      "block w-full text-left text-sm font-black uppercase tracking-widest italic",
                      currentCategoryId === 'all' ? "text-white" : "text-zinc-500"
                    )}
                  >
                    {language === 'it' ? 'Tutti i Prodotti' : 'All Products'}
                  </button>
                  
                  {mainCategories.map((cat: any) => {
                    const isMainActive = currentCategoryId === cat.id.toString();
                    const hasSubs = cat.slug === 'abbigliamento' && subCategories.length > 0;
                    
                    return (
                      <div key={cat.id} className="space-y-4">
                        <button 
                          onClick={() => handleCategorySelect(cat.id.toString())}
                          className={cn(
                            "block w-full text-left text-sm font-black uppercase tracking-widest italic",
                            (isMainActive || (cat.slug === 'abbigliamento' && isAbbigliamentoActive)) ? "text-white" : "text-zinc-500"
                          )}
                          dangerouslySetInnerHTML={{ __html: cat.name }}
                        />
                        
                        {hasSubs && (
                          <div className="pl-4 space-y-3 border-l border-white/5">
                            {subCategories.map((sub: any) => (
                              <button 
                                key={sub.id}
                                onClick={() => handleCategorySelect(sub.id.toString())}
                                className={cn(
                                  "block w-full text-left text-[9px] font-black uppercase tracking-widest italic",
                                  currentCategoryId === sub.id.toString() ? "text-white" : "text-zinc-600"
                                )}
                                dangerouslySetInnerHTML={{ __html: sub.name }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {loadingProducts || loadingCats ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-zinc-500" size={40} />
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">SINCRONIZZAZIONE...</p>
          </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-20 border border-white/5 bg-zinc-900/30 flex flex-col items-center gap-6">
            <SearchIcon size={48} className="text-zinc-800" />
            <div>
              <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">{t.shop.noProducts}</p>
              {searchQuery && <p className="text-zinc-700 text-[8px] font-bold uppercase mt-2">{t.shop.noProductsDesc}</p>}
            </div>
            {searchQuery && (
              <Button 
                onClick={clearSearch}
                variant="outline"
                className="border-white/10 backdrop-blur-md text-white rounded-none font-black uppercase italic text-[9px] tracking-widest h-12 px-8"
              >
                {t.shop.showAll}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {products?.map((product: any, i: number) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group"
              >
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-[4/5] bg-zinc-900 overflow-hidden relative mb-4">
                    <img 
                      src={product.images[0]?.src} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {product.on_sale && (
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-black text-[8px] font-black uppercase px-2 py-1 italic">
                        {t.shop.sale}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xs font-black uppercase italic tracking-tight mb-1 group-hover:text-zinc-400 transition-colors" dangerouslySetInnerHTML={{ __html: product.name }} />
                  <p className="text-sm font-black tracking-tighter">€{product.price}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Shop;