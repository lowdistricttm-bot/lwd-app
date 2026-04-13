"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { 
  User, Settings, LogOut, Car, Grid, Heart, 
  MessageSquare, Camera, Bell, Shield, CreditCard,
  ChevronRight, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activity');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/login');
      else setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Membro';

  const tabs = [
    { id: 'activity', label: 'Attività', icon: MessageSquare },
    { id: 'profile', label: 'Profilo', icon: User },
    { id: 'garage', label: 'Garage', icon: Car },
    { id: 'settings', label: 'Impostazioni', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pb-32">
        {/* BuddyPress Cover Image */}
        <div className="relative h-56 md:h-80 bg-zinc-900">
          <img 
            src="https://www.lowdistrict.it/wp-content/uploads/DSC01359-1-scaled-e1751832356345.jpg" 
            className="w-full h-full object-cover opacity-50 grayscale"
            alt="Cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
          
          <div className="absolute -bottom-16 left-6 md:left-12 flex flex-col md:flex-row md:items-end gap-6">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-zinc-900 border-4 border-black rounded-none overflow-hidden shadow-2xl flex items-center justify-center">
                <User size={60} className="text-zinc-800" />
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-red-600 text-white rounded-none hover:bg-white hover:text-black transition-all shadow-lg">
                <Camera size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Profile Header Info */}
        <div className="mt-20 px-6 md:px-12 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-2">
                {username}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-red-600 text-[10px] font-black uppercase tracking-[0.3em] italic">
                  Official Member
                </span>
                <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                  @ {username.toLowerCase().replace(/\s+/g, '')}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <Button onClick={handleLogout} variant="outline" className="flex-1 md:flex-none border-red-600/20 text-red-600 hover:bg-red-600 hover:text-white roundedthink
The previous response was cut off while writing the `src/pages/Profile.tsx` file. I need to continue the code from where it stopped.

The last line was:
`<Button onClick={handleLogout} variant="outline" className="flex-1 md:flex-none border-red-600/20 text-red-600 hover:bg-red-600 hover:text-white rounded`

I will continue from `-none font-black uppercase text-[10px] tracking-widest italic h-12 px-6">`.

Wait, I should probably rewrite the whole file or at least the remaining part correctly within the `<dyad-write>` tag. The instructions say "Only use ONE <dyad-write> block per file". Since the previous one was incomplete, I'll provide the full file now to ensure it's correct.

Actually, looking at the previous output, it was truncated. I will provide the full `src/pages/Profile.tsx` file.

Plan:
1. Provide the full `src/pages/Profile.tsx` file.
2. Ensure it matches the BuddyPress style requested.
3. Include the tabs, garage, activity, etc.
4. Add the summary.-none font-black uppercase text-[10px] tracking-widest italic h-12 px-6">
                <LogOut className="mr-2" size={14} /> Logout
              </Button>
            </div>
          </div>

          {/* BuddyPress Style Tabs */}
          <div className="flex border-b border-white/5 mb-10 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-8 py-5 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap",
                  activeTab === tab.id 
                    ? "border-red-600 text-white bg-white/5" 
                    : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/2"
                )}
              >
                <tab.icon size={14} className={activeTab === tab.id ? "text-red-600" : ""} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Area */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'activity' && (
                <motion.div 
                  key="activity"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-zinc-900/30 border border-white/5 p-12 text-center">
                    <MessageSquare className="mx-auto text-zinc-800 mb-6" size={48} />
                    <h3 className="text-xl font-black italic uppercase mb-2">Nessuna attività</h3>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-8">
                      Non hai ancora pubblicato nulla nella bacheca del District.
                    </p>
                    <Button className="bg-white text-black hover:bg-red-600 hover:text-white rounded-none px-10 py-6 text-[10px] font-black uppercase italic tracking-widest">
                      Inizia a condividere
                    </Button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div 
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="bg-zinc-900/50 border border-white/5 p-8">
                    <h3 className="text-sm font-black uppercase italic mb-6 flex items-center gap-2">
                      <User size={16} className="text-red-600" /> Informazioni Base
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">Nome Visualizzato</p>
                        <p className="text-sm font-bold uppercase">{username}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">Email Account</p>
                        <p className="text-sm font-bold">{user?.email}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">Membro dal</p>
                        <p className="text-sm font-bold uppercase">
                          {new Date(user?.created_at).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-900/50 border border-white/5 p-8">
                    <h3 className="text-sm font-black uppercase italic mb-6 flex items-center gap-2">
                      <Shield size={16} className="text-red-600" /> Badge & Ruoli
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      <div className="bg-red-600/10 border border-red-600/20 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-red-600 italic">
                        Official Member
                      </div>
                      <div className="bg-zinc-800 border border-white/5 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">
                        Early Adopter
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'garage' && (
                <motion.div 
                  key="garage"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black italic uppercase">I miei Progetti</h3>
                    <Button className="bg-red-600 hover:bg-white hover:text-black rounded-none text-[10px] font-black uppercase italic tracking-widest h-10">
                      <Plus size={14} className="mr-2" /> Aggiungi Veicolo
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-zinc-900/50 border border-white/5 p-8 flex items-center gap-8 group hover:border-red-600/30 transition-all cursor-pointer">
                      <div className="w-24 h-24 bg-zinc-800 flex items-center justify-center shrink-0">
                        <Car size={40} className="text-zinc-700 group-hover:text-red-600 transition-colors" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black uppercase italic mb-1">Nuovo Progetto</h4>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Configura la tua build e mostrala alla community.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl"
                >
                  <div className="space-y-2">
                    {[
                      { icon: Bell, label: 'Notifiche Push', desc: 'Gestisci gli avvisi per like e commenti' },
                      { icon: Shield, label: 'Privacy e Sicurezza', desc: 'Cambia password e visibilità profilo' },
                      { icon: CreditCard, label: 'Metodi di Pagamento', desc: 'Gestisci le tue carte per lo shop' },
                    ].map((item, i) => (
                      <button key={i} className="w-full flex items-center justify-between p-6 bg-zinc-900/30 border border-white/5 hover:bg-zinc-900/50 transition-all group">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-red-600 transition-colors">
                            <item.icon size={20} />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-black uppercase italic tracking-tight">{item.label}</p>
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{item.desc}</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-zinc-700 group-hover:text-white transition-all" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Profile;