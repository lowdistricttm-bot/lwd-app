"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import GarageTab from '@/components/GarageTab';
import { 
  User, 
  Settings, 
  LogOut, 
  Car, 
  MessageSquare, 
  ShoppingBag, 
  Loader2,
  Camera,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useWcUserOrders } from '@/hooks/use-woocommerce';
import { showSuccess, showError } from '@/utils/toast';

const DEFAULT_COVER = "https://www.lowdistrict.it/wp-content/uploads/DSC01359-1-scaled-e1751832356345.jpg";

const Profile = () => {
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [activeTab, setActiveTab] = useState('activity');

  const { data: orders, isLoading: loadingOrders } = useWcUserOrders(user?.email);

  const fetchProfile = async (userId: string) => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfile(profileData);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      
      setUser(session.user);
      await fetchProfile(session.user.id);
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const isAvatar = type === 'avatar';
    if (isAvatar) setUploadingAvatar(true);
    else setUploadingCover(true);

    try {
      const fileExt = file.name.split('.').pop();
      const bucket = isAvatar ? 'avatars' : 'covers';
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const updateData: any = { id: user.id, updated_at: new Date().toISOString() };
      if (isAvatar) updateData.avatar_url = publicUrl;
      else updateData.cover_url = publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert(updateData);

      if (updateError) throw updateError;

      showSuccess(isAvatar ? "Foto profilo aggiornata!" : "Copertina aggiornata!");
      await fetchProfile(user.id);
    } catch (error: any) {
      showError("Errore durante il caricamento: " + error.message);
    } finally {
      if (isAvatar) setUploadingAvatar(false);
      else setUploadingCover(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );

  const displayName = profile?.username || 
                     (profile?.first_name || profile?.last_name ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : null) || 
                     user?.email?.split('@')[0] || 
                     'User';

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
        {/* Cover Section */}
        <div className="relative h-56 md:h-80 bg-zinc-900">
          <div 
            className="absolute inset-0 group/cover cursor-pointer overflow-hidden"
            onClick={() => coverInputRef.current?.click()}
          >
            <img 
              src={profile?.cover_url || DEFAULT_COVER} 
              className="w-full h-full object-cover opacity-60 grayscale group-hover/cover:grayscale-0 group-hover/cover:scale-105 transition-all duration-700"
              alt="Cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-all duration-300 bg-black/20 backdrop-blur-[2px]">
              <div className="flex flex-col items-center gap-2">
                {uploadingCover ? (
                  <Loader2 size={32} className="animate-spin text-white" />
                ) : (
                  <>
                    <Camera size={32} className="text-white" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic">Cambia Copertina</span>
                  </>
                )}
              </div>
            </div>

            <input 
              type="file" 
              ref={coverInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleFileUpload(e, 'cover')}
            />
          </div>

          <div className="absolute -bottom-12 left-6 flex items-end gap-4 z-20">
            <div className="relative group/avatar">
              <input 
                type="file" 
                ref={avatarInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleFileUpload(e, 'avatar')}
              />
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  avatarInputRef.current?.click();
                }}
                className="w-24 h-24 md:w-32 md:h-32 bg-zinc-900 border-4 border-white rounded-full overflow-hidden shadow-2xl flex items-center justify-center cursor-pointer relative"
              >
                {uploadingAvatar ? (
                  <Loader2 className="animate-spin text-red-600" />
                ) : profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover group-hover/avatar:opacity-50 transition-opacity" />
                ) : (
                  <User size={40} className="text-zinc-800" />
                )}
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity bg-black/40 rounded-full">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
            </div>
            <div className="mb-2">
              <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter leading-none">
                {displayName}
              </h1>
              <p className="text-red-600 text-[8px] font-black uppercase tracking-[0.3em] italic mt-1">
                {profile?.is_admin ? 'DISTRICT ADMIN' : 'OFFICIAL MEMBER'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 px-4 md:px-12 max-w-6xl mx-auto">
          {profile?.is_admin && (
            <div className="mb-8">
              <Button 
                onClick={() => navigate('/admin/applications')}
                className="w-full bg-red-600 hover:bg-white hover:text-black text-white rounded-none h-14 font-black uppercase italic tracking-widest transition-all"
              >
                <ShieldCheck className="mr-2" /> Dashboard Amministratore
              </Button>
            </div>
          )}

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
                  className="bg-zinc-900/30 border border-white/5 p-12 text-center"
                >
                  <MessageSquare className="mx-auto text-zinc-800 mb-6" size={48} />
                  <h3 className="text-xl font-black italic uppercase mb-2">Attività Recenti</h3>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-8">
                    I tuoi post appariranno qui.
                  </p>
                  <Button 
                    onClick={() => navigate('/bacheca')}
                    className="bg-white text-black hover:bg-red-600 hover:text-white rounded-none px-10 py-6 text-[10px] font-black uppercase italic tracking-widest"
                  >
                    Vai alla Bacheca
                  </Button>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <h3 className="text-xl font-black italic uppercase mb-6">Ordini Shop</h3>
                  {loadingOrders ? (
                    <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-red-600" /></div>
                  ) : orders?.length > 0 ? (
                    <div className="space-y-3">
                      {orders.map((order: any) => (
                        <div key={order.id} className="bg-zinc-900/50 border border-white/5 p-6 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Ordine #{order.id}</p>
                            <p className="text-sm font-bold uppercase italic">{order.status}</p>
                          </div>
                          <p className="text-sm font-black tracking-tighter">€{order.total}</p>
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
                <motion.div key="garage" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <GarageTab />
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                  <Button 
                    onClick={handleLogout} 
                    variant="outline" 
                    className="w-full border-red-600/20 text-red-600 hover:bg-red-600 hover:text-white rounded-none font-black uppercase text-[10px] tracking-widest italic h-14"
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