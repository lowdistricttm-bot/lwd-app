"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import EmailSettingsModal from '@/components/EmailSettingsModal';
import { useAdmin } from '@/hooks/use-admin';
import { 
  Loader2, 
  XCircle, 
  ChevronLeft,
  ClipboardCheck,
  Users,
  Mail,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, isStaff, isSupport, canVote, checkingAdmin, role } = useAdmin();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-zinc-500" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Verifica permessi...</p>
      </div>
    );
  }

  if (!canVote) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <XCircle size={64} className="text-zinc-800 mb-6" />
        <h1 className="text-2xl font-black uppercase italic mb-4">Accesso Negato</h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8">Non hai i permessi necessari.</p>
        <button onClick={() => navigate('/')} className="bg-white text-black h-12 px-8 rounded-full font-black uppercase italic">Home</button>
      </div>
    );
  }

  const menuItems = [
    {
      title: "Gestione Selezioni",
      desc: isAdmin || isStaff 
        ? "Approva o rifiuta le candidature agli eventi" 
        : "Visualizza e vota le candidature agli eventi",
      icon: ClipboardCheck,
      action: () => navigate('/admin/applications'),
      show: true
    },
    {
      title: "Gestione Membri",
      desc: "Modifica i ruoli e i gradi degli utenti del District",
      icon: Users,
      action: () => navigate('/admin/users'),
      show: isAdmin === true
    },
    {
      title: "Configurazione Email",
      desc: "Personalizza i template delle notifiche automatiche",
      icon: Mail,
      action: () => setIsEmailModalOpen(true),
      show: isAdmin === true
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-32 px-6 max-w-2xl mx-auto w-full">
        <div className="mb-12">
          <button 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 uppercase text-[10px] font-black tracking-widest transition-colors"
          >
            <ChevronLeft size={16} /> Torna al Profilo
          </button>
          <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">Admin Control Panel</h2>
          <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase">Dashboard</h1>
          <div className="flex items-center gap-2 mt-4 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/10">
            <ShieldCheck size={14} className="text-white" />
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Accesso: {role?.toUpperCase()}</span>
          </div>
        </div>

        <div className="space-y-4">
          {menuItems.filter(item => item.show).map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className="w-full bg-zinc-900/40 backdrop-blur-md border border-white/5 p-6 flex items-center justify-between group hover:bg-zinc-800/60 hover:border-white/20 transition-all duration-500 text-left rounded-[2rem]"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500">
                  <item.icon size={24} className="group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase italic tracking-tight">{item.title}</h3>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400 mt-1 transition-colors">{item.desc}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-zinc-700 group-hover:text-white transition-all translate-x-[-10px] group-hover:translate-x-0" />
            </button>
          ))}
        </div>
      </main>

      {isAdmin === true && <EmailSettingsModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />}
      <BottomNav />
    </div>
  );
};

export default AdminDashboard;