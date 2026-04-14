"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import GarageTab from '@/components/GarageTab';
import ApplicationsTab from '@/components/ApplicationsTab';
import FeedPost from '@/components/FeedPost';
import CreatePostModal from '@/components/CreatePostModal';
import { useSocialFeed } from '@/hooks/use-social-feed';
import { 
  User, 
  Settings, 
  LogOut, 
  Car, 
  MessageSquare, 
  ShoppingBag, 
  Loader2,
  Camera,
  ShieldCheck,
  ClipboardCheck,
  ChevronRight,
  Plus,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useWcUserOrders } from '@/hooks/use-woocommerce';
import { showSuccess, showError } from '@/utils/toast';

const DEFAULT_COVER = "https://www.lowdistrict.it/wp-content/uploads/DSC01359-1-scaled-e1751832356345.jpg";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [activeTab, setActiveTab] = useState('activity');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const { posts, isLoading: loadingPosts } = useSocialFeed();
  
  const targetUserId = userId || currentUser?.id;
  const isOwnProfile = !userId || userId === currentUser?.id;

  const { data: orders, isLoading: loadingOrders } = useWcUserOrders(isOwnProfile ? currentUser?.email : undefined);

  const userPosts = posts?.filter(p => p.user_id === targetUserId) || [];

  const fetchProfile = async (id: string) => {
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) console.error("[Profile] Errore caricamento:", error);
    setProfile(profileData);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && !userId) {
        navigate('/login');
        return;
      }
      
      setCurrentUser(session?.user || null);
      if (userId) {
        await fetchProfile(userId);
      } else if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    checkUser();
  }, [navigate, userId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !isOwnProfile) return;

    const isAvatar = type === 'avatar';
    if (isAvatar) setUploadingAvatar(true);
    else setUploadingCover(true);

    try {
      const fileExt = file.name.split('.').pop();
      const bucket = isAvatar ? 'avatars' : 'covers';
      const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const updateData: any = { id: currentUser.id, updated_at: new Date().toISOString() };
      if (isAvatar) updateData.avatar_url = publicUrl;
      else updateData.cover_url = publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert(updateData);

      if (updateError) throw updateError;

      showSuccess(isAvatar ? "Foto profilo aggiornata!" : "Copertina aggiornata!");
      await fetchProfile(currentUser.id);
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

  // Priorità: Nome + Cognome > Username > User
  const displayName = (profile?.first_name || profile?.last_name) 
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
    : (profile?.username || 'User');

  const tabs = isOwnProfile ? [
    { id: 'activity', label: 'Feed', icon: MessageSquare },
    { id: 'orders', label: 'Ordini', icon: ShoppingBag },
    { id: 'garage', label: 'Garage', icon: Car },
    { id: 'selections', label: 'Selezioni', icon: ClipboardCheck },
    { id: 'profile', label: 'Info', icon: User },
    { id: 'settings', label: 'Set', icon: Settings },
  ] : [
    { id: 'activity', label: 'Feed', icon: MessageSquare },
    { id: 'garage', label: 'Garage', icon: Car },
    { id: 'profile', label: 'Info', icon: User },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pb-32">
        {/* Cover Section */}
        <div className="relative h-56 md:h-80 bg-zinc-900">
          <div 
            className={cn(
              "absolute inset-0 overflow-hidden",
              isOwnProfile ? "group/cover cursor-pointer" : ""
            )}
            onClick={() => isOwnProfile && coverInputRef.current?.click()}
          >
            <img 
              src={profile?.cover_url || DEFAULT_COVER} 
              className={cn(
                "w-full h-full object-cover opacity-60 grayscale transition-all duration-700",
                isOwnProfile ? "group-hover/cover:grayscale-0 group-hover/cover:scale-105" : ""
              )}
              alt="Cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
            
            {isOwnProfile && (
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
            )}

            <input 
              type="file" 
              ref={coverInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleFileUpload(e, 'cover')}
            />
          </div>

          <div className="absolute -bottom-12 left-6 flex items-end gap-4 z-20">
            <div className={cn("relative", isOwnProfile ? "group/avatar" : "")}>
              <input 
                type="file" 
                ref={avatarInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleFileUpload(e, 'avatar')}
              />
              <div 
                onClick={(e) => {
                  if (!isOwnProfile) return;
                  e.stopPropagation();
                  avatarInputRef.current?.click();
                }}
                className={cn(
                  "w-24 h-24 md:w-32 md:h-32 bg-zinc-900 border-4 border-white rounded-full overflow-hidden shadow-2xl flex items-center justify-center relative",
                  isOwnProfile ? "cursor-pointer" : ""
                )}
              >
                {uploadingAvatar ? (
                  <Loader2 className="animate-spin text-red-600" />
                ) : profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className={cn("w-full h-full object-cover transition-opacity", isOwnProfile ? "group-hover/avatar:opacity-50" : "")} />
                ) : (
                  <User size={40} className="text-zinc-800" />
                )}
                
                {isOwnProfile && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity bg-black/40 rounded-full">
                    <Camera size={24} className="text-white" />
                  </div>
                )}
              </div>
            </div>
            <div className="mb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter leading-none">
                  {displayName}
                </h1>
                {!isOwnProfile && currentUser && (
                  <button 
                    onClick={() => navigate(`/chat/${profile.id}`)}
                    className="p-2 bg-red-600 text-white hover:bg-white hover:text-black transition-all shadow-lg"
                  >
                    <Mail size={18} />
                  </button>
                )}
              </div>
              <p className="text-red-600 text-[8px] font-black uppercase tracking-[0.3em] italic mt-1">
                {profile?.is_admin ? 'DISTRICT ADMIN' : 'OFFICIAL MEMBER'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 px-4 md:px-12 max-w-6xl mx-auto">
          {/* Tab Bar */}
          <div className={cn(
            "grid border border-white/5 bg-zinc-900/30 mb-6",
            isOwnProfile ? "grid-cols-6" : "grid-cols-3"
          )}>
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

          {/* Admin Dashboard Box */}
          {isOwnProfile && profile?.is_admin && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 bg-zinc-900 border-l-4 border-red-600 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-black italic uppercase tracking-tighter">Dashboard Amministrazione</h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Gestisci selezioni, eventi e community</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/admin/applications')}
                className="bg-white text-black hover:bg-red-600 hover:text-white rounded-none px-8 h-12 font-black uppercase italic tracking-widest transition-all group"
              >
                Entra Ora <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
              </Button>
            </motion.div>
          )}

          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'activity' && (
                <motion.div 
                  key="activity"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black italic uppercase">{isOwnProfile ? 'I Miei Post' : `Post di ${displayName}`}</h3>
                    {isOwnProfile && (
                      <Button 
                        onClick={() => setIsPostModalOpen(true)}
                        className="bg-red-600 hover:bg-white hover:text-black text-white rounded-none text-[10px] font-black uppercase italic tracking-widest h-10 px-6 transition-all"
                      >
                        <Plus size={14} className="mr-2" /> Nuovo Post
                      </Button>
                    )}
                  </div>

                  {loadingPosts ? (
                    <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-red-600" /></div>
                  ) : userPosts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {userPosts.map((post) => (
                        <FeedPost key={post.id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-zinc-900/30 border border-white/5 p-12 text-center">
                      <MessageSquare className="mx-auto text-zinc-800 mb-6" size={48} />
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                        {isOwnProfile ? 'Non hai ancora pubblicato nulla.' : 'Nessun post presente.'}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'orders' && isOwnProfile && (
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
                  <GarageTab userId={targetUserId} isOwnProfile={isOwnProfile} />
                </motion.div>
              )}

              {activeTab === 'selections' && isOwnProfile && (
                <motion.div key="selections" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <ApplicationsTab />
                </motion.div>
              )}

              {activeTab === 'settings' && isOwnProfile && (
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

      <CreatePostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
      />

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Profile;