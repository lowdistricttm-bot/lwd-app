"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Car } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const AddVehicleDialog = ({ onAdd }: { onAdd: (vehicle: any) => void }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    suspension: 'static',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ ...formData, id: Date.now() });
    showSuccess(`${formData.brand} ${formData.model} aggiunto al garage!`);
    setOpen(false);
    setFormData({ brand: '', model: '', year: '', suspension: 'static', image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="bg-red-600 p-3 rounded-full shadow-lg shadow-red-600/20 hover:scale-110 transition-transform">
          <Plus size={24} className="text-white" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tighter uppercase">Aggiungi Veicolo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="brand" className="text-xs font-bold uppercase tracking-widest text-gray-400">Marca</Label>
            <Input 
              id="brand" 
              placeholder="es. BMW, VW, Audi..." 
              className="bg-white/5 border-white/10 rounded-none focus:ring-red-600"
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model" className="text-xs font-bold uppercase tracking-widest text-gray-400">Modello</Label>
            <Input 
              id="model" 
              placeholder="es. M3 E46, Golf MK4..." 
              className="bg-white/5 border-white/10 rounded-none focus:ring-red-600"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year" className="text-xs font-bold uppercase tracking-widest text-gray-400">Anno</Label>
              <Input 
                id="year" 
                type="number" 
                placeholder="2024" 
                className="bg-white/5 border-white/10 rounded-none focus:ring-red-600"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Assetto</Label>
              <Select value={formData.suspension} onValueChange={(v) => setFormData({...formData, suspension: v})}>
                <SelectTrigger className="bg-white/5 border-white/10 rounded-none focus:ring-red-600">
                  <SelectValue placeholder="Seleziona" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  <SelectItem value="static">Static</SelectItem>
                  <SelectItem value="air">Airride</SelectItem>
                  <SelectItem value="stock">Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest py-6 rounded-none">
            Salva nel Garage
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVehicleDialog;