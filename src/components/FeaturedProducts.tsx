"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/use-cart';
import { useWcProducts } from '@/hooks/use-woocommerce';

const FeaturedProducts = () => {
  const { addToCart } = useCart();
  const { data: products, isLoading } = useWcProducts("per_page=4");

  const handleAdd = (product: any) => {
    const numericPrice = parseFloat(product.price.replace('€', '').replace(',', '.'));
    addToCart({
      id: product.id,
      name: product.name,
      price: numericPrice,
      image: product.images[0]?.src || "",
      quantity: 1
    });
  };

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="animate-spin text-red-600" size={32} />
      </div>
    );
  }

  return (
    <section className="py-24 bg-black px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-red-600 font-black tracking-widest uppercase mb-2 text-[10px]">Merchandise</h2>
            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase">LATEST DROPS</h3>
          </div>
          <Link to="/shop" className="text-white border-b border-red-600 pb-1 font-black uppercase tracking-widest text-[10px] hover:text-red-600 transition-colors italic">
            View All Products
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products?.map((product: any, index: number) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <Link to={`/product/${product.id}`}>
                <div className="aspect-[4/5] overflow-hidden bg-zinc-900 mb-4 relative">
                  <img 
                    src={product.images[0]?.src} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  {product.on_sale && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white text-[8px] font-black uppercase px-2 py-1 tracking-widest italic">Sale</div>
                  )}
                </div>
              </Link>
              <h4 className="text-white font-bold text-sm mb-1 uppercase italic tracking-tighter truncate" dangerouslySetInnerHTML={{ __html: product.name }} />
              <div className="flex items-center justify-between">
                <p className="text-red-600 font-black italic">€{product.price}</p>
                <button 
                  onClick={() => handleAdd(product)}
                  className="text-white/40 hover:text-red-600 transition-colors"
                >
                  <ShoppingCart size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;