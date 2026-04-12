"use client";

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { useCart } from '@/hooks/use-cart';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, total, itemCount } = useCart();
  const navigate = useNavigate();
  
  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag size={40} className="text-gray-700" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 italic">Il carrello è vuoto</h1>
          <p className="text-gray-500 mb-8 uppercase text-xs font-bold tracking-widest">Non hai ancora aggiunto nulla</p>
          <Link to="/shop">
            <Button className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest px-12 py-6 rounded-none italic">
              Torna allo Shop
            </Button>
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      <div className="pt-24 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-12 italic">Il Tuo Carrello</h1>

        <div className="space-y-6 mb-12">
          {cart.map((item) => (
            <div key={`${item.id}-${item.size}`} className="flex gap-4 p-4 bg-zinc-900/50 border border-white/5">
              <div className="w-24 h-24 bg-zinc-800 shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg leading-tight uppercase italic" dangerouslySetInnerHTML={{ __html: item.name }} />
                    {item.size && <p className="text-[10px] text-red-600 font-black uppercase tracking-widest mt-1">Taglia: {item.size}</p>}
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-600 hover:text-red-600 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-4 bg-black border border-white/10 p-1">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-red-600"><Minus size={14} /></button>
                    <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-red-600"><Plus size={14} /></button>
                  </div>
                  <p className="font-black text-lg">€{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 p-8 border-t-4 border-red-600">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 font-black uppercase tracking-widest text-xs">Totale Provvisorio</span>
            <span className="text-3xl font-black italic">€{total.toFixed(2)}</span>
          </div>
          
          <Button 
            onClick={handleCheckout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-8 text-xl font-black uppercase tracking-widest rounded-none italic flex items-center justify-center gap-4 shadow-2xl shadow-red-600/20"
          >
            Procedi al Checkout <ArrowRight size={24} />
          </Button>

          <div className="mt-6 flex items-center justify-center gap-2 text-gray-500">
            <ShieldCheck size={16} />
            <span className="text-[9px] font-black uppercase tracking-widest">Pagamento sicuro e crittografato</span>
          </div>
        </div>
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Cart;