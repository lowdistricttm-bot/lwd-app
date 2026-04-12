"use client";

import React from 'react';
import { ChevronLeft, User, Shield, CreditCard, Bell, HelpCircle, ListChecks, Languages } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import NotificationToggle from '@/components/NotificationToggle';
import { useTranslation } from '@/hooks/use-translation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Settings = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useTranslation();

  const sections = [
    { icon: User, label: t.settings.account, desc: 'Gestisci i tuoi dati personali', href: '/profile' },
    { icon: ListChecks, label: t.settings.selections, desc: 'Stato candidature eventi', href: '/selections' },
    { icon: CreditCard, label: t.settings.payments, desc: 'Metodi di pagamento salvati', href: '/payments' },
    { icon: Shield, label: 'Privacy', desc: 'Sicurezza e permessi', href: '#' },
    { icon: HelpCircle, label: 'Supporto', desc: 'Centro assistenza e FAQ', href: '#' },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="px-6 py-8 flex items-center gap-4 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-black tracking-tighter uppercase">{t.settings.title}</h1>
      </div>

      <div className="p-6 space-y-8">
        {/* Selettore Lingua */}
        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{t.settings.language}</h2>
          <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-white/5 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/5 rounded-xl">
                <Languages size={20} className="text-gray-400" />
              </div>
              <p className="text-sm font-bold text-white">{language === 'it' ? 'Italiano' : 'English'}</p>
            </div>
            <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
              <SelectTrigger className="w-[120px] bg-zinc-800 border-none text-xs font-bold uppercase tracking-widest">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white">
                <SelectItem value="it">Italiano</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{t.settings.notifications}</h2>
          <NotificationToggle />
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{t.settings.account}</h2>
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
            {t.settings.logout}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;