"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import EmailSettingsModal from '@/components/EmailSettingsModal';
import AdminNotificationModal from '@/components/AdminNotificationModal';
import AdminTrophyModal from '@/components/AdminTrophyModal';
import AdminMysteryBoxModal from '@/components/AdminMysteryBoxModal';
import { useAdmin } from '@/hooks/use-admin';
import { useRoleRequests } from '@/hooks/use-role-requests';
import { 
  Loader2, 
  XCircle, 
  ChevronLeft,
  ClipboardCheck,
  Users,
  Mail,
  ShieldCheck,
  ChevronRight,
  Bell,
  Sparkles,
  Check,
  X,
  User,
  Trophy,
  Gift
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, isStaff, isSupport, canVote, checkingAdmin, role, allApplications } = useAdmin();
  const { allRequests, loadingAll, handleRequest } = useRoleRequests();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isTrophyModalOpen, setIsTrophyModalOpen] = useState(false);
  const [isMysteryModalOpen, setIsMysteryModalOpen] = useState(false);
  const [showRequests, setShowRequests] = useState(false);

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

  const pendingAppsCount = allApplications?.filter((a: any) => a.status === 'pending').length || 0;

  const menuItems = [
    {
      title: "Centro Notifiche",
      desc: "Invia annunci a tutta la community",
      icon: Bell,
      action: () => setIsNotifModalOpen(true),
      show: isAdmin || isStaff
    },
    {
      title: "Gestione Selezioni",
      desc: isAdmin || isStaff 
        ? "Approva o rifiuta le candidature" 
        : "Visualizza e vota le candidature agli eventi",
      icon: ClipboardCheck,
      action: () => navigate('/admin/applications'),
      show: true,
      badge: pendingAppsCount
    },
    {
      title: "Richieste Upgrade",
      desc: `Gestisci le richieste (${allRequests?.length || 0} in attesa)`,
      icon: Sparkles,
      action: () => setShowRequests(!showRequests),
      show: isAdmin || isStaff,
      badge: allRequests?.length || 0
    },
    {
      title: "Gestione Membri",
      desc: "Modifica i ruoli e i gradi degli utenti del District",
      icon: Users,
      action: () => navigate('/admin/users'),
      show: isAdmin === true
    },
    {
      title: "Assegna Trofei",
      desc: "Premia i vincitori degli eventi fisici con badge digitali",
      icon: Trophy,
      action: () => setIsTrophyModalOpen(true),
      show: isAdmin || isStaff
    },
    {
      title: "Mystery Box",
      desc: "Configura la box mensile a stock limitato",
      icon: Gift,
      action: () => setIsMysteryModalOpen(true),
      show: isAdmin || isStaff
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
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top)+2rem)] pb-32 px-6 max-w-7xl mx-auto w-full">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.filter(item => item.show).map((item, i) => (
            <div key={i} className="flex flex-col">
              <button
                onClick={item.action}
                className="w-full bg-zinc-900/40 backdrop-blur-md border border-white/5 p-6 flex items-center justify-between group hover:bg-zinc-800/60 hover:border-white/20 transition-all duration-500 text-left rounded-[2rem] h-full"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500 relative shrink-0">
                    <item.icon size={24} className="group-hover:scale-110 transition-transform" />
                    {item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-black text-[10px] font-black flex items-center justify-center rounded-full border-2 border-black">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black italic uppercase tracking-tight">{item.title}</h3>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400 mt-1 transition-colors leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight size={20} className={cn("text-zinc-700 group-hover:text-white transition-all translate-x-[-10px] group-hover:translate-x-0 shrink-0", showRequests && item.title === "Richieste Upgrade" && "rotate-90")} />
              </button>

              {/* Sezione Espandibile Richieste Upgrade */}
              {item.title === "Richieste Upgrade" && showRequests && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="space-y-3 mt-4"
                >
                  {loadingAll ? (
                    <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-zinc-800" /></div>
                  ) : allRequests?.length === 0 ? (
                    <p className="text-[9px] font-black uppercase text-zinc-600 italic py-4 bg-white/5 p-4 rounded-2xl">Nessuna richiesta in attesa.</p>
                  ) : (
                    allRequests?.map((req) => (
                      <div key={req.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-left-2">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-900 border border-white/10">
                            {req.profiles?.avatar_url ? <img src={req.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={16} className="m-auto h-full text-zinc-700" />}
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase italic">@{req.profiles?.username}</p>
                            <p className="text-[8px] font-bold uppercase text-zinc-500">Richiede: {req.requested_role.toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleRequest.mutate({ requestId: req.id, userId: req.user_id, status: 'approved', role: req.requested_role })}
                            disabled={handleRequest.isPending}
                            className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg"
                          >
                            <Check size={18} strokeWidth={3} />
                          </button>
                          <button 
                            onClick={() => handleRequest.mutate({ requestId: req.id, userId: req.user_id, status: 'rejected', role: req.requested_role })}
                            disabled={handleRequest.isPending}
                            className="w-10 h-10 bg-zinc-800 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg"
                          >
                            <X size={18} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </main>

      {isAdmin === true && <EmailSettingsModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />}
      {(isAdmin || isStaff) && <AdminNotificationModal isOpen={isNotifModalOpen} onClose={() => setIsNotifModalOpen(false)} />}
      {(isAdmin || isStaff) && <AdminTrophyModal isOpen={isTrophyModalOpen} onClose={() => setIsTrophyModalOpen(false)} />}
      {(isAdmin || isStaff) && <AdminMysteryBoxModal isOpen={isMysteryModalOpen} onClose={() => setIsMysteryModalOpen(false)} />}
    </div>
  );
};

export default AdminDashboard;