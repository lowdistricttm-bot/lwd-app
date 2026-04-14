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
import ImageLightbox from '@/components/ImageLightbox';
import { useSocialFeed } from '@/hooks/use-social-feed';
import { useWpAuth } from '@/hooks/use-wp-auth';
import { 
  User, Settings, LogOut, Car, MessageSquare, ShoppingBag, Loader2, Camera, ShieldCheck, ClipboardCheck, ChevronRight, Plus, Mail, Calendar, Package, Users, Edit2, Check, X, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useWcUserOrders } from '@/hooks/use-woocommerce';
import { showSuccess, showError } from '@/utils/toast';

const DEFAULT_COVER = "https://www.lowdistrict.it/wp-content/uploads/DSC01359-1-scaled-e1751832356345.jpg";

const roleLabels: Record<string, string> = {
  'admin': 'ADMIN',
  'staff': 'MEMBRO DELLO STAFF',
  'support': 'SUPPORTO STAFF',
  'member': 'MEMBRO UFFICIALE'
};

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
  const [lightboxData, setLightboxData] = useState<{ images: string[], index: number } | null>(null);
  
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const { updateUsername, isLoading: isUpdatingUsername } = useWpAuth();

  const { posts, isLoading: loadingPosts } = useSocialFeed();
  const targetUserId = userId || currentUser?.id;
  const isOwnProfile = !userId || userId === currentUser?.id;

  const { data: orders, isLoading: loadingOrders, refetch: refetchOrders } = useWcUserOrders(isOwnProfile ? currentUser?.email : undefined);

  useEffect(() => {
    if (activeTab === 'orders') refetchOrders();
  }, [activeTab, refetchOrders]);

  const fetchProfile = async (id: string) => {
    const { data: profileData, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
    if (error) console.error("[Profile] Errore caricamento:", error);
    setProfile(profileData);
    if (profileData?.username) setNewUsername(profileData.username);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && !userId) {
        navigate('/login');
        return;
      }
      setCurrentUser(session?.user || null);
      if (userId) await fetchProfile(userId);
      else if (session?.user) await fetchProfile(session.user.id);
      setLoading(false);
    };
    checkUser();
  }, [navigate, userId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !isOwnProfile) return;
    const isAvatar = type === 'avatar';
    if (isAvatar) setUploadingAvatar(true); else setUploadingCover(true);
    try {
      const fileExt = file.name.split('.').pop();
      const bucket = isAvatar ? 'avatars' : 'covers';
      const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
      const updateData: any = { id: currentUser.id, updated_at: new Date().toISOString() };
      if (isAvatar) updateData.avatar_url = publicUrl; else updateData.cover_url = publicUrl;
      const { error: updateError } = await supabase.from('profiles').upsert(updateData);
      if (updateError) throw updateError;
      showSuccess(isAvatar ? "Foto profilo aggiornata!" : "Copertina aggiornata!");
      await fetchProfile(currentUser.id);
    } catch (error: any) {
      showError("Errore durante il caricamento: " + error.message);
    } finally {
      if (isAvatar) setUploadingAvatar(false); else setUploadingCover(false);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!newUsername.trim() || newUsername === profile?.username) {
      setIsEditingUsername(false);
      return;
    }

    const success = await updateUsername(newUsername);
    if (success) {
      await fetchProfile(currentUser.id);
      setIsEditingUsername(false);
    }
  };

  const handleShareProfile = async () => {
    if (!profile) return;
    
    const shareData = {
      title: `Profilo di ${displayName} | Low District`,
      text: `Guarda il progetto stance di ${displayName} su Low District!`,
      url: `${window.location.origin}/profile/${profile.id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        showSuccess("Link profilo copiato negli appunti!");
      }
    } catch (err) {
      console.error('Errore condivisione:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-zinc-500" size={40} /></div>;

  const displayName = profile?.username || 
                     (isOwnProfile ? currentUser?.user_metadata?.username : null) ||
                     (profile?.first_name || profile?.last_name ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : null) || 
                     'Membro District';

  const userRole = profile?.role || (profile?.is_admin ? 'admin' : 'member');
  const roleLabel = roleLabels[userRole] || 'MEMBRO UFFICIALE';

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
        <div className="relative h-56 md:h-80 bg-zinc-900">
          <div className={cn("absolute inset-0 overflow-hidden cursor-pointer")} onClick={() => setLightboxData({ images: [profile?.cover_url || DEFAULT_COVER], index: 0 })}>
            <img src={profile?.cover_url || DEFAULT_COVER} className={cn("w-full h-full object-cover opacity-60 grayscale transition-all duration-700 hover:grayscale-0 hover:scale-105")} alt="Cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
            {isOwnProfile && (
              <button 
                onClick={(e) => { e.stopPropagation(); coverInputRef.current?.click(); }}
                className="absolute top-4 right-4 p-3 bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white hover:text-black transition-all z-30"
              >
                <Camera size={20} />
              </button>
            )}
            <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'cover')} />
          </div>
          <div className="absolute -bottom-12 left-6 flex items-end gap-4 z-20">
            <div className="relative group/avatar">
              <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar')} />
              <div onClick={() => setLightboxData({ images: [profile?.avatar_url || ""], index: 0 })} className="w-24 h-24 md:w-32 md:h-32 bg-zinc-900 border-4 border-white rounded-full overflow-hidden shadow-2xl flex items-center justify-center relative cursor-pointer">
                {uploadingAvatar ? <Loader2 className="animate-spin text-zinc-500" /> : profile?.avatar_url ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : <User size={40} className="text-zinc-800" />}
                {isOwnProfile && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); avatarInputRef.current?.click(); }}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity bg-black/40 rounded-full"
                  >
                    <Camera size={24} className="text-white" />
                  </button>
                )}
              </div>
            </div>
            <div className="mb-2">
              <div className="flex items-center gap-3">
                {isEditingUsername ? (
                  <div className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md p-1 border border-white/10">
                    <Input 
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="bg-transparent border-none h-8 text-lg font-black uppercase italic tracking-tighter focus-visible:ring-0 w-40"
                      autoFocus
                    />
                    <button onClick={handleUsernameUpdate} disabled={isUpdatingUsername} className="p-1 text-green-500 hover:text-green-400">
                      {isUpdatingUsername ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />}
                    </button>
                    <button onClick={() => { setIsEditingUsername(false); setNewUsername(profile?.username || ''); }} className="p-1 text-red-500 hover:text-red-400">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter leading-none">{displayName}</h1>
                    {isOwnProfile && (
                      <button onClick={() => setIsEditingUsername(true)} className="p-1.5 text-zinc-500 hover:text-white transition-colors">
                        <Edit2 size={14} />
                      </button>
                    )}
                  </div>
                )}
                {!isOwnProfile && currentUser && <button onClick={() => navigate(`/chat/${profile.id}`)} className="p-2 bg-zinc-800 text-white hover:bg-white hover:text-black transition-all shadow-lg"><Mail size={18} /></button>}
              </div>
              <p className="text-zinc-500 text-[8px] font-black uppercase tracking-[0.3em] italic mt-1">{roleLabel}</p>
            </div>
          </div>
        </div>

        <div className="mt-20 px-4 md:px-12 max-w-6xl mx-auto">
          {/* Share Card Integrata */}
          <button 
            onClick={handleShareProfile}
            className="w-full mb-6 bg-zinc-900/40 border border-white/5 p-4 flex items-center justify-between group hover:bg-white hover:text-black transition-all duration-500"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/5 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                <Share2 size={18} className="group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase italic tracking-widest">
                  {isOwnProfile ? 'Condividi il tuo profilo' : 'Condividi questo profilo'}
                </p>
                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.2em] group-hover:text-black/60 transition-colors">
                  {isOwnProfile ? 'Fatti conoscere nel District' : 'Mostra questo progetto alla community'}
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-zinc-800 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
          </button>

          <div className={cn("grid border border-white/5 bg-zinc-900/30 mb-6", isOwnProfile ? "grid-cols-6" : "grid-cols-3")}>
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex flex-col items-center justify-center gap-2 py-4 transition-all border-b-2", activeTab === tab.id ? "border-white text-white bg-white/5" : "border-transparent text-zinc-600 hover:text-zinc-400")}>
                <tab.icon size={18} className={activeTab === tab.id ? "text-white" : ""} />
                <span className="text-[8px] font-black uppercase tracking-widest hidden sm:block">{tab.label}</span>
              </button>
            ))}
          </div>

          {isOwnProfile && (userRole === 'admin' || userRole === 'staff' || userRole === 'support') && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 bg-zinc-900 border-l-4 border-white p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-800 flex items-center justify-center shrink-0">
                  {userRole === 'admin' ? <ShieldCheck className="text-white" size={24} /> : <Users className="text-white" size={24} />}
                </div>
                <div>
                  <h2 className="text-lg font-black italic uppercase tracking-tighter">Dashboard {userRole.toUpperCase()}</h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    {userRole === 'support' ? 'Vota le selezioni della community' : 'Gestisci selezioni, eventi e community'}
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate('/admin/applications')} className="bg-white text-black hover:bg-zinc-200 rounded-none px-8 h-12 font-black uppercase italic tracking-widest transition-all group">Entra Ora <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} /></Button>
            </motion.div>
          )}

          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'activity' && (
                <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black italic uppercase">{isOwnProfile ? 'I Miei Post' : `Post di ${displayName}`}</h3>
                    {isOwnProfile && <Button onClick={() => setIsPostModalOpen(true)} className="bg-white text-black hover:bg-zinc-200 rounded-none text-[10px] font-black uppercase italic tracking-widest h-10 px-6 transition-all"><Plus size={14} className="mr-2" /> Nuovo Post</Button>}
                  </div>
                  {loadingPosts ? <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-zinc-500" /></div> : posts?.filter(p => p.user_id === targetUserId).length > 0 ? <div className="grid grid-cols-1 gap-4">{posts.filter(p => p.user_id === targetUserId).map((post) => <FeedPost key={post.id} post={post} />)}</div> : <div className="bg-zinc-900/30 border border-white/5 p-12 text-center"><MessageSquare className="mx-auto text-zinc-800 mb-6" size={48} /><p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{isOwnProfile ? 'Non hai ancora pubblicato nulla.' : 'Nessun post presente.'}</p></div>}
                </motion.div>
              )}

              {activeTab === 'orders' && isOwnProfile && (
                <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <h3 className="text-xl font-black italic uppercase mb-6">I Miei Ordini</h3>
                  {loadingOrders ? (
                    <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-zinc-500" /></div>
                  ) : orders?.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order: any) => (
                        <div key={order.id} className="bg-zinc-900/50 border border-white/5 p-6 group hover:border-white/20 transition-all">
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <span className="bg-white text-black text-[8px] font-black uppercase px-2 py-0.5 italic">#{order.id}</span>
                                <span className="bg-zinc-800 text-white text-[8px] font-black uppercase px-2 py-0.5 italic">
                                  {order.status.toUpperCase()}
                                </span>
                              </div>
                              <h4 className="text-sm font-black italic uppercase tracking-tight">
                                {order.line_items.length} {order.line_items.length === 1 ? 'Prodotto' : 'Prodotti'}
                              </h4>
                            </div>
                            <div className="text-right flex flex-col justify-center">
                              <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest mb-1">Totale Ordine</p>
                              <p className="text-2xl font-black italic tracking-tighter">€{order.total}</p>
                            </div>
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

              {activeTab === 'garage' && <motion.div key="garage" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><GarageTab userId={targetUserId} isOwnProfile={isOwnProfile} /></motion.div>}
              {activeTab === 'selections' && isOwnProfile && <motion.div key="selections" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><ApplicationsTab /></motion.div>}
              {activeTab === 'settings' && isOwnProfile && <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2"><Button onClick={handleLogout} variant="outline" className="w-full border-white/10 text-zinc-400 hover:bg-white hover:text-black rounded-none font-black uppercase text-[10px] tracking-widest italic h-14"><LogOut className="mr-2" size={14} /> Logout Sessione</Button></motion.div>}
            </AnimatePresence>
          </div>
        </div>
      </main>
      <CreatePostModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} />
      <ImageLightbox 
        images={lightboxData?.images || []} 
        initialIndex={lightboxData?.index || 0} 
        isOpen={!!lightboxData} 
        onClose={() => setLightboxData(null)} 
      />
      <Footer /><BottomNav />
    </div>
  );
};

export default Profile;