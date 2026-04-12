"use client";

import React from 'react';
import { ChevronLeft, User, Shield, CreditCard, Bell, HelpCircle, ListChecks } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import NotificationToggle from '@/components/NotificationToggle';

const Settings = () => {
  const navigate = useNavigate();

  const sections = [
    { icon: User, label: 'Profilo', desc: 'Gestisci i tuoi dati personali', href: '/profile' },
    { icon: ListChecks, label: 'Le Mie Selezioni', desc: 'Stato candidature eventi', href: '/selections' },
    { icon: CreditCard, label: 'Pagamenti', desc: 'Metodi di pagamento salvati', href: '/payments' },
    { icon: Shield, label: 'Privacy', desc: 'Sicurezza e permessi', href: '#' },
    { icon: HelpCircle, label: 'Supporto', desc: 'Centro assistenza e FAQ', href: '#' },
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

        <section className="space-y-3">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Account & App</h2>
          {sections.map((item, i) => (
            <Link 
              key={i} 
              to={item.href}
              className="flex items-center justify-between p-4 bg-zinc-900/50 border border-white/5 rounded-2xl cursor-pointer hover:bg-zinc-900 hover:border-white/10 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/5 rounded-xl">
                  <item.icon size={20} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">{item.desc}</p>
                </div>
              </div>
              <ChevronLeft size={16} className="text-gray-700 rotate-180" />
            </Link>
          ))}
        </section>

        <div className="pt-8">
          <button className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/10">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;