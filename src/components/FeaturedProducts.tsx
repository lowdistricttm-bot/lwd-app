"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/use-cart';

const products = [
  { 
    id: 10675, 
    name: "EXTREME STICKER 2025", 
    price: "€30.00", 
    image: "https://www.lowdistrict.it/wp-content/uploads/new4.png", 
    tag: "New Drop" 
  },
  { 
    id: 11171, 
    name: "HOODIE NEW LOGO 2026", 
    price: "€75.00", 
    image: "https://www.lowdistrict.it/wp-content/uploads/unisex-heavy-blend-hoodie-black-front-680d3b04b9913.jpg", 
    tag: "Premium" 
  },
  { 
    id: 10758, 
    name: "WINDSHIELD STICKER", 
    price: "€15.00", 
    image: "https://www.lowdistrict.it/wp-content/uploads/new6.png", 
    tag: "Essential" 
  },
  { 
    id: 17001, 
    name: "T-SHIRT OVERSIZE SIGNED", 
    price: "€40.00", 
    image: "https://www.lowdistrict.it/wp-content/uploads/tshirt-over-grigio.png", 
    tag: "Limited" 
  }
];

const FeaturedProducts = () => {
  const { addToCart } = useCart();

  const handleAdd = (product: any) => {
    const numericPrice = parseFloat(product.price.replace('€', '').replace(',', '.'));
    addToCart({
      id: product.id,
      name: product.name,
      price: numericPrice,
      image: product.image,
      quantity: 1
    });
  };

  return (
    <section className="py-24 bg-black px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-red-600 font-bold tracking-widest uppercase mb-2">Merchandise</h2>
            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter">LATEST DROPS</h3>
          </div>
          <Link to="/shop" className="text-white border-b border-red-600 pb-1 font-bold uppercase tracking-widest hover:text-red-600 transition-colors">
            View All Products
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="aspect-[4/5] overflow-hidden bg-zinc-900 mb-4 relative">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-1 tracking-widest">{product.tag}</div>
                <button 
                  onClick={() => handleAdd(product)}
                  className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"
                >
                  <ShoppingCart size={20} />
                </button>
              </div>
              <h4 className="text-white font-bold text-lg mb-1 uppercase italic tracking-tighter">{product.name}</h4>
              <p className="text-red-600 font-black italic">{product.price}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;