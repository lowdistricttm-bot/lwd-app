"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import GarageTab from '@/components/GarageTab';
import ApplicationsTab from '@/components/ApplicationsTab';
import ProfilePostGridItem from '@/components/ProfilePostGridItem';
import CreatePostModal from '@/components/CreatePostModal';
import ImageLightbox from '@/components/ImageLightbox';
import ProfileInfoTab from '@/components/ProfileInfoTab';
import SettingsTab from '@/components/SettingsTab';
import HighlightsBar from '@/components/HighlightsBar';
import { useSocialFeed } from '@/hooks/use-social-feed';
import { useAdmin } from '@/hooks/use-admin';
import { usePresence } from '@/hooks/use-presence';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  User, Settings, Car, MessageSquare, ShoppingBag, Loader2, Camera, ShieldCheck, ClipboardCheck, ChevronRight, Plus, Mail, Share2, Edit2, LogIn, AlertCircle, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useWcUserOrders } from '@/hooks/use-woocommerce';
import { showSuccess, showError } from '@/utils/toast';
import { useTranslation } from '@/hooks/use-translation';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { compressImage, validateVideo } from '@/utils/media';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DEFAULT_AVATAR = "https://www.lowdistrict.it/wp-content/uploads/immagine-profilo-sito-new-scaled.jpg";
const DEFAULT_COVER = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop&sat=-100";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { canVote } = useAdmin();
  const { isUserOnline, getLastSeen } = usePresence();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isUsernameNoticeOpen, setIsUsernameNoticeOpen] = useState(false);
  const [lightboxData, setLightboxData] = useState<{ images: string[], index: number } | null>(null);
  const [dbLastSeen, setDbLastSeen] = useState<string | null>(null);
  
  const { posts, isLoading: loadingPosts } = useSocialFeed();
  const targetUserId = userId || currentUser?.id;
  const isOwnProfile = !userId || userId === currentUser?.id;
  const isOnline = isUserOnline(targetUserId);
  const lastSeen = getLastSeen(targetUserId) || dbLastSeen;

  const { data: orders, isLoading: loadingOrders, refetch: refetchOrders } = useWcUserOrders(isOwnProfile ? currentUser?.email : undefined);

  useEffect(() => {
    if (activeTab === 'orders') refetchOrders();
  }, [activeTab, refetchOrders]);

  const fetchProfile = async (id: string) => {
    const { data: profileData, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
    if (error) console.error("[Profile] Errore caricamento:", error);
    setProfile(profileData);
    
    if (profileData?.last_seen_at) {
      setDbLastSeen(formatDistanceToNow(new Date(profileData.last_seen_at), { addSuffix: true, locale: it }));
    }
    
    if (!activeTab) {
      const role = profileData?.role || 'subscriber';
      if (role === 'subscriber') {
        setActiveTab(isOwnProfile ? 'garage' : 'profile');
      } else {
        setActiveTab('activity');
      }
    }
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

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${targetUserId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Profilo di ${profile?.username}`, url: profileUrl });
      } else {
        await navigator.clipboard.writeText(profileUrl);
        showSuccess(language === 'it' ? "Link copiato!" : "Link copied!");
      }
    } catch (err) {}
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    let file = e.target.files?.[0];
    if (!file || !currentUser || !isOwnProfile) return;
    
    const isAvatar = type === 'avatar';
    if (isAvatar) setUploadingAvatar(true); else setUploadingCover(true);
    
    try {
      if (file.type.startsWith('video/')) {
        const validation = await validateVideo(file);
        if (!validation.ok) throw new Error(validation.error);
      } else {
        file = await compressImage(file);
      }

      const publicUrl = await uploadToCloudinary(file);
      const { error: updateError } = await supabase.from('profiles').upsert({ id: currentUser.id, [isAvatar ? 'avatar_url' : 'cover_url']: publicUrl, updated_at: new Date().toISOString() });
      if (updateError) throw updateError;

      showSuccess(isAvatar ? "Foto profilo aggiornata!" : "Copertina aggiornata!");
      await fetchProfile(currentUser.id);
    } catch (error: any) {
      showError(error.message);
    } finally {
      if (isAvatar) setUploadingAvatar(false); else setUploadingCover(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-zinc-500" size={40} /></div>;

  const userRole = profile?.role || 'subscriber';
  const isTargetSubscriber = userRole === 'subscriber';

  const tabs = [];
  if (!isTargetSubscriber) tabs.push({ id: 'activity', label: t.profile.posts, icon: MessageSquare });
  if (isOwnProfile || !isTargetSubscriber) tabs.push({ id: 'garage', label: t.nav.garage, icon: Car });
  if (isOwnProfile) {
    tabs.push({ id: 'orders', label: t.profile.orders, icon: ShoppingBag });
    tabs.push({ id: 'selections', label: t.profile.selections, icon: ClipboardCheck });
  }
  tabs.push({ id: 'profile', label: t.profile.info, icon: User });
  if (isOwnProfile) tabs.push({ id: 'settings', label: t.profile.settings, icon: Settings });

  const userPosts = posts?.filter(p => p.user_id === targetUserId) || [];

  return (
    <div className="min-h-screen text-white flex flex-col bg-transparent">
      <Navbar />
      <main className="flex-1 pb-32 pt-16">
        {/* Cover Section */}
        <div className="relative aspect-[2/1] md:h-80 md:aspect-auto bg-zinc-900 group/cover">
          <div className="absolute inset-0 overflow-hidden" onClick={() => !isOwnProfile && setLightboxData({ images: [profile?.cover_url || DEFAULT_COVER], index: 0 })}>
            <img src={profile?.cover_url || DEFAULT_COVER} className="w-full h-full object-cover transition-all duration-700 hover:scale-105" alt="Cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {isOwnProfile && (
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/cover:opacity-100 transition-opacity flex flex-col items-center justify-center z-30">
                <button onClick={(e) => { e.stopPropagation(); coverInputRef.current?.click(); }} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl">
                  <Camera size={24} />
                </button>
              </div>
            )}
            <input type="file" ref={coverInputRef} className="hidden" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, 'cover')} />
          </div>
        </div>

        {/* Profile Info Section (Aligned to Cover Edge) */}
        <div className="px-6 md:px-12 max-w-6xl mx-auto relative">
          <div className="flex items-start gap-4 md:gap-6 -mt-12 md:-mt-16">
            {/* Avatar */}
            <div className="relative group/avatar shrink-0 z-20">
              <div onClick={() => !isOwnProfile && setLightboxData({ images: [profile?.avatar_url || DEFAULT_AVATAR], index: 0 })} className="w-24 h-24 md:w-32 md:h-32 bg-zinc-900 border-4 border-black rounded-full overflow-hidden shadow-2xl flex items-center justify-center relative">
                {uploadingAvatar ? <Loader2 className="animate-spin text-zinc-500" /> : (profile?.avatar_url || DEFAULT_AVATAR) ? <img src={profile?.avatar_url || DEFAULT_AVATAR} alt="Avatar" className="w-full h-full object-cover" /> : <User size={40} className="text-zinc-800" />}
                {isOwnProfile && (
                  <button onClick={(e) => { e.stopPropagation(); avatarInputRef.current?.click(); }} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity bg-black/40 rounded-full">
                    <Camera size={24} className="text-white" />
                  </button>
                )}
              </div>
              <input type="file" ref={avatarInputRef} className="hidden" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, 'avatar')} />
            </div>

            {/* Text Info - Pulled up to align with cover line */}
            <div className="pt-12 md:pt-16 flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-sm md:text-xl font-black italic uppercase tracking-tighter leading-none">{profile?.username || 'Utente'}</h1>
                <div className="flex items-center gap-1.5 shrink-0">
                  {!isOwnProfile && currentUser && (!isTargetSubscriber || canVote) && (
                    <button onClick={() => navigate(`/chat/${profile.id}`)} className="p-1.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all"><Mail size={14} /></button>
                  )}
                  <button onClick={handleShareProfile} className="p-1.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all"><Share2 size={14} /></button>
                  {isOwnProfile && (
                    <button onClick={() => setIsUsernameNoticeOpen(true)} className="p-1.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all"><Edit2 size={12} /></button>
                  )}
                </div>
              </div>
              
              <div className="mt-0 flex items-center gap-3">
                <p className="text-zinc-500 text-[7px] font-black uppercase tracking-[0.2em] italic leading-none">
                  {t.profile.roles[userRole] || t.profile.roles.member}
                </p>
                <div className="flex items-center gap-1">
                  <div className={cn(
                    "w-1 h-1 rounded-full",
                    isOnline ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-zinc-600"
                  )} />
                  <p className={cn(
                    "text-[6px] font-black uppercase tracking-widest leading-none",
                    isOnline ? "text-green-500" : "text-zinc-600"
                  )}>
                    {isOnline ? 'Online' : lastSeen ? `Ultimo accesso ${lastSeen}` : 'Offline'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="mt-12">
            {!isTargetSubscriber && targetUserId && <HighlightsBar userId={targetUserId} isOwnProfile={isOwnProfile} />}

            {isOwnProfile && (userRole === 'admin' || userRole === 'staff' || userRole === 'support') && (
              <button onClick={() => navigate('/admin')} className="w-full mb-8 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-3xl flex items-center justify-between group hover:bg-white hover:text-black transition-all duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-black/10 transition-colors">
                    {userRole === 'admin' ? <ShieldCheck size={18} /> : <Users size={18} />}
                  </div>
                  <p className="text-xs font-black uppercase italic tracking-widest">DASHBOARD {userRole.toUpperCase()}</p>
                </div>
                <ChevronRight size={20} />
              </button>
            )}

            <div className="flex bg-zinc-900/50 backdrop-blur-md rounded-full p-1 mb-8 border border-white/5 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)} 
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full transition-all duration-500 whitespace-nowrap",
                    activeTab === tab.id ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  <tab.icon size={16} />
                  <span className="text-[9px] font-black uppercase tracking-widest hidden sm:block">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === 'activity' && (
                  <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-black italic uppercase">{isOwnProfile ? t.profile.myPosts : t.profile.posts}</h3>
                      {isOwnProfile && <Button onClick={() => setIsPostModalOpen(true)} className="bg-primary text-white hover:scale-105 rounded-full text-[10px] font-black uppercase italic tracking-widest h-10 px-6 shadow-lg shadow-primary/20"><Plus size={14} className="mr-2" /> {t.feed.newPost}</Button>}
                    </div>
                    {loadingPosts ? <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-zinc-500" /></div> : userPosts.length > 0 ? <div className="grid grid-cols-3 gap-1 md:gap-4">{userPosts.map((post) => <ProfilePostGridItem key={post.id} post={post} />)}</div> : <div className="bg-zinc-900/30 border border-white/5 p-12 rounded-[2rem] text-center"><MessageSquare className="mx-auto text-zinc-800 mb-6" size={48} /><p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{isOwnProfile ? t.profile.noPosts : t.feed.noPosts}</p></div>}
                  </motion.div>
                )}
                {activeTab === 'garage' && <motion.div key="garage" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><GarageTab userId={targetUserId} isOwnProfile={isOwnProfile} /></motion.div>}
                {activeTab === 'orders' && <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><h3 className="text-xl font-black italic uppercase mb-6">{t.profile.orders}</h3>{loadingOrders ? <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-zinc-500" /></div> : orders?.length > 0 ? <div className="space-y-4">{orders.map((order: any) => <div key={order.id} className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl group hover:border-white/20 transition-all"><div className="flex flex-col md:flex-row justify-between gap-4"><div className="space-y-2"><div className="flex items-center gap-3"><span className="bg-white text-black text-[8px] font-black uppercase px-2 py-0.5 italic rounded-full">#{order.id}</span><span className="bg-zinc-800 text-white text-[8px] font-black uppercase px-2 py-0.5 italic rounded-full">{order.status.toUpperCase()}</span></div><h4 className="text-sm font-black italic uppercase tracking-tight">{order.line_items.length} Prodotti</h4></div><div className="text-right flex flex-col justify-center"><p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest mb-1">{t.checkout.total}</p><p className="text-2xl font-black italic tracking-tighter">€{order.total}</p></div></div></div>)}</div> : <div className="bg-zinc-900/30 border border-white/5 p-12 rounded-[2rem] text-center"><ShoppingBag className="mx-auto text-zinc-800 mb-6" size={48} /><p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{t.profile.noOrders}</p></div>}</motion.div>}
                {activeTab === 'selections' && <motion.div key="selections" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><ApplicationsTab /></motion.div>}
                {activeTab === 'profile' && <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><ProfileInfoTab profile={profile} isOwnProfile={isOwnProfile} onUpdate={() => fetchProfile(targetUserId)} /></motion.div>}
                {activeTab === 'settings' && <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><SettingsTab /></motion.div>}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <AlertDialog open={isUsernameNoticeOpen} onOpenChange={setIsUsernameNoticeOpen}>
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-[2rem]">
          <AlertDialogHeader><AlertDialogTitle className="text-white font-black uppercase italic">{t.profile.usernameNoticeTitle}</AlertDialogTitle><AlertDialogDescription className="text-zinc-500 text-xs font-bold uppercase leading-relaxed">{t.profile.usernameNoticeDesc}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col"><AlertDialogAction onClick={() => window.location.href = 'mailto:info@lowdistrict.it'} className="rounded-full bg-white text-black hover:bg-zinc-200 font-black uppercase italic text-[10px] w-full h-12 transition-all">{t.profile.contactAdmin}</AlertDialogAction><AlertDialogCancel className="rounded-full border-white/10 text-white hover:bg-white/5 font-black uppercase italic text-[10px] w-full h-12 mt-0 transition-all">{t.feed.cancel}</AlertDialogCancel></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreatePostModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} />
      <ImageLightbox images={lightboxData?.images || []} initialIndex={lightboxData?.index || 0} isOpen={!!lightboxData} onClose={() => setLightboxData(null)} />
      <BottomNav />
    </div>
  );
};

export default Profile;