"use client";

import React from 'react';
import { ChevronLeft, User, Shield, Smartphone, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationToggle from '@/components/NotificationToggle';

const Settings = () => {
  const navigate = useNavigate();

  const sections = [
    { icon: User, label: 'Profilo', desc: 'Gestisci i tuoi dati personali' },
    { icon: Shield, label: 'Privacy', desc: 'Sicurezza e permessi' },
    { icon: HelpCircle, label: 'Supporto', desc: 'Centro assistenza e FAQ' },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="px-6 py-8 flex items-center gap-4 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-black tracking-tighter uppercase">Impostazioni</h1>
      </div>

      <div className="p-6 space-y-8">
        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Notifiche</h2>
          <NotificationToggle />
        </section>

        <section className="space-y-4">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Account</h2>
          {sections.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/50 border border-white/5 rounded-xl cursor-pointer hover:bg-zinc-900 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg">
                  <item.icon size={20} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <div className="pt-8">
          <button className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-colors">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;