"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import AddVehicleDialog from '@/components/AddVehicleDialog';
import { Car, CheckCircle2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

const Garage = () => {
  const [myVehicles, setMyVehicles] = useState([
    { id: 1, brand: "BMW", model: "M3 E46", year: "2003", suspension: "static", active: true, image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800" }
  ]);

  const addVehicle = (vehicle: any) => {
    setMyVehicles([...myVehicles, { ...vehicle, active: false }]);
  };

  const setActive = (id: number) => {
    setMyVehicles(myVehicles.map(v => ({ ...v, active: v.id === id })));
    showSuccess("Veicolo principale aggiornato!");
  };

  const deleteVehicle = (id: number) => {
    setMyVehicles(myVehicles.filter(v => v.id !== id));
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      <div className="pt-24 px-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">Il Mio Garage</h1>
            <p className="text-gray-500 text-sm uppercase tracking-widest font-bold mt-1">Gestisci i tuoi progetti</p>
          </div>
          <AddVehicleDialog onAdd={addVehicle} />
        </div>

        <div className="grid grid-cols-1 gap-6">
          {myVehicles.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
              <Car className="mx-auto text-gray-700 mb-4" size={48} />
              <p className="text-gray-500 font-bold uppercase tracking-widest">Il tuo garage è vuoto</p>
            </div>
          ) : (
            myVehicles.map((v) => (
              <div 
                key={v.id} 
                className={cn(
                  "group relative overflow-hidden bg-zinc-900/50 border transition-all duration-500",
                  v.active ? "border-red-600/50 ring-1 ring-red-600/20" : "border-white/5 hover:border-white/20"
                )}
              >
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-64 h-48 overflow-hidden">
                    <img src={v.image} alt={v.model} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black uppercase tracking-widest text-red-600">{v.suspension}</span>
                          <span className="text-xs font-bold text-gray-500">{v.year}</span>
                        </div>
                        <h3 className="text-2xl font-black tracking-tighter uppercase">{v.brand} {v.model}</h3>
                      </div>
                      {v.active && (
                        <div className="flex items-center gap-1 bg-red-600/10 text-red-600 px-3 py-1 rounded-full">
                          <CheckCircle2 size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Attivo</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-6">
                      {!v.active && (
                        <button 
                          onClick={() => setActive(v.id)}
                          className="text-xs font-black uppercase tracking-widest border border-white/10 px-4 py-2 hover:bg-white hover:text-black transition-colors"
                        >
                          Imposta come principale
                        </button>
                      )}
                      <button 
                        onClick={() => deleteVehicle(v.id)}
                        className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Community Section Link */}
        <div className="mt-20 pt-10 border-t border-white/5">
          <h2 className="text-xl font-black tracking-tighter uppercase mb-6">Esplora la Community</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-video bg-zinc-900 overflow-hidden relative group cursor-pointer">
              <img src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-black uppercase tracking-widest">Top Rated</span>
              </div>
            </div>
            <div className="aspect-video bg-zinc-900 overflow-hidden relative group cursor-pointer">
              <img src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-black uppercase tracking-widest">New Entries</span>
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

export default Garage;