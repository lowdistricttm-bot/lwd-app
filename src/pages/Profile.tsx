"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { 
  User, Settings, LogOut, Car, MessageSquare, 
  Camera, Bell, Shield, CreditCard,
  ChevronRight, Plus, ShoppingBag, Package, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useWcUserOrders } from '@/hooks/use-woocommerce';
import { useBPMember } from '@/hooks/use-buddypress';
import { useProfileSync } from '@/hooks/use-profile-sync';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activity');

  const username = user?.user_metadata?.username || user?.email?.split('@')[0];
  
  // Sync profile with BuddyPress
  useProfileSync(username);

  const { data: orders, isLoading: loadingOrders } = useWcUserOrders(user?.email);
  const { data: bpMember, isLoading: loadingBP } = useBPMember(username);

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
    localStorage.removeItem('wp-jwt');
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const displayUsername = username || 'Membro';

  const tabs = [
    { id: 'activity', label: 'Feed', icon: MessageSquare },
    { id: 'orders', label: 'Ordini', icon: ShoppingBag },
    { id: 'garage', label: 'Garage', icon: Car },
    { id: 'profile', label: 'Info', icon: User },
    { id: 'settings', label: 'Set', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pb-32">
        {/* Cover Image */}
        <div className="relative h-48 md:h-64 bg-zinc-900">
          <img 
            src="https://www.lowdistrict.it/wp-content/uploads/DSC01359-1-scaled-e1751832356345.jpg" 
            className="w-full h-full object-cover opacity-40 grayscale"
            alt="Cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
          
          <div className="absolute -bottom-12 left-6 flex items-end gap-4">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-zinc-900 border-4 border-black rounded-none overflow-hidden shadow-2xl flex items-center justify-center">
                {bpMember?.avatar_urls?.full ? (
                  <img src={bpMember.avatar_urls.full} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-zinc-800" />
                )}
              </div>
              <button className="absolute bottom-1 right-1 p-1.5 bg-red-600 text-white rounded-none hover:bg-white hover:text-black transition-all">
                <Camera size={12} />
              </button>
            </div>
            <div className="mb-2">
              <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter leading-none">
                {displayUsername}
              </h1>
              <p className="text-red-600 text-[8px] font-black uppercase tracking-[0.3em] italic mt-1">
                Official Member
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 px-4 md:px-12 max-w-6xl mx-auto">
          <div className="grid grid-cols-5 border border-white/5 bg-zinc-900/30 mb-10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 py-4 transition-all border-b-2",
                  activeTab === tab.id 
                    ? "border-red-600 text-white bg-white/5" 
                    : "border-transparent text-zinc-600 hover:text-zinc-400"
                )}
              >
                <tab.icon size={18} className={activeTab === tab.id ? "text-red-600" : ""} />
                <span className="text-[8px] font-black uppercase tracking-widest hidden sm:block">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'activity' && (
                <motion.div 
                  key="activity"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-zinc-900/30 border border-white/5 p-12 text-center"
                >
                  <MessageSquare className="mx-auto text-zinc-800 mb-6" size={48} />
                  <h3 className="text-xl font-black italic uppercase mb-2">Nessuna attività</h3>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-8">
                    Non hai ancora pubblicato nulla nella bacheca.
                  </p>
                  <Button 
                    onClick={() => navigate('/bacheca')}
                    className="bg-white text-black hover:bg-red-600 hover:text-white rounded-none px-10 py-6 text-[10px] font-black uppercase italic tracking-widest"
                  >
                    Inizia a condividere
                  </Button>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div 
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-black italic uppercase mb-6">I miei Ordini</h3>
                  {loadingOrders ? (
                    <div className="py-20 text-center"><Clock className="animate-spin mx-auto text-red-600" /></div>
                  ) : orders?.length > 0 ? (
                    <div className="space-y-3">
                      {orders.map((order: any) => (
                        <div key={order.id} className="bg-zinc-900/50 border border-white/5 p-6 flex items-center justify-between group hover:border-red-600/30 transition-all">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-zinc-800 flex items-center justify-center text-zinc-600">
                              <Package size={20} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Ordine #{order.id}</p>
                              <p className="text-sm font-bold uppercase italic">{order.status}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black tracking-tighter">€{order.total}</p>
                            <p className="text-[9px] text-zinc-600 font-bold uppercase">{new Date(order.date_created).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-zinc-900/30 border border-white/5 p-12 text-center">
                      <ShoppingBag className="mx-auto text-zinc-800 mb-6" size={48} />
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Nessun ordine trovato.</p>
                    </div>
                  )}
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
                      <Plus size={14} className="mr-2" /> Aggiungi
                    </Button>
                  </div>
                  <div className="bg-zinc-900/50 border border-white/5 p-8 flex items-center gap-8 group hover:border-red-600/30 transition-all cursor-pointer">
                    <div className="w-20 h-20 bg-zinc-800 flex items-center justify-center shrink-0">
                      <Car size={32} className="text-zinc-700 group-hover:text-red-600 transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black uppercase italic mb-1">Nuovo Progetto</h4>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Configura la tua build.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div 
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="bg-zinc-900/50 border border-white/5 p-8">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6">Account Info</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1">Email</p>
                        <p className="text-xs font-bold">{user?.email}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1">Membro dal</p>
                        <p className="text-xs font-bold uppercase">
                          {loadingBP ? "Caricamento..." : bpMember?.registered_since || "N/D"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-zinc-900/50 border border-white/5 p-8">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6">Badge</h3>
                    <div className="bg-red-600/10 border border-red-600/20 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-red-600 italic inline-block">
                      Official Member
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  {[
                    { icon: Bell, label: 'Notifiche Push' },
                    { icon: Shield, label: 'Privacy' },
                    { icon: CreditCard, label: 'Pagamenti' },
                  ].map((item, i) => (
                    <button key={i} className="w-full flex items-center justify-between p-5 bg-zinc-900/30 border border-white/5 hover:bg-zinc-900/50 transition-all group">
                      <div className="flex items-center gap-4">
                        <item.icon size={16} className="text-zinc-500 group-hover:text-red-600" />
                        <span className="text-[10px] font-black uppercase italic">{item.label}</span>
                      </div>
                      <ChevronRight size={14} className="text-zinc-800 group-hover:text-white" />
                    </button>
                  ))}
                  <Button 
                    onClick={handleLogout} 
                    variant="outline" 
                    className="w-full mt-8 border-red-600/20 text-red-600 hover:bg-red-600 hover:text-white rounded-none font-black uppercase text-[10px] tracking-widest italic h-14"
                  >
                    <LogOut className="mr-2" size={14} /> Logout Sessione
                  </Button>
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