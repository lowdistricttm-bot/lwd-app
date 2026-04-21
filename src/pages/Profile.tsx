"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import Navbar from '@/components/Navbar';
import GarageTab from '@/components/GarageTab';
import ApplicationsTab from '@/components/ApplicationsTab';
import MarketplaceTab from '@/components/MarketplaceTab';
import ProfilePostGridItem from '@/components/ProfilePostGridItem';
import CreatePostModal from '@/components/CreatePostModal';
import ImageLightbox from '@/components/ImageLightbox';
import ProfileInfoTab from '@/components/ProfileInfoTab';
import SettingsTab from '@/components/SettingsTab';
import HighlightsBar from '@/components/HighlightsBar';
import FollowButton from '@/components/FollowButton';
import FollowListModal from '@/components/FollowListModal';
import OrderDetailModal from '@/components/OrderDetailModal';
import { useSocialFeed } from '@/hooks/use-social-feed';
import { useAdmin } from '@/hooks/use-admin';
import { usePresence } from '@/hooks/use-presence';
import { useFollow } from '@/hooks/use-follow';
import { useAuth } from '@/hooks/use-auth';
import { useRoleRequests } from '@/hooks/use-role-requests';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  User, Settings, Car, MessageSquare, ShoppingBag, Loader2, Camera, ShieldCheck, ClipboardCheck, ChevronRight, Plus, Mail, Share2, Edit2, Truck, ExternalLink, ShieldAlert, Tag, Sparkles, Clock
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
  const { role, canVote } = useAdmin();
  const { isUserOnline, getLastSeen } = usePresence();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const { myRequest, sendRequest } = useRoleRequests();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isUsernameNoticeOpen, setIsUsernameNoticeOpen] = useState(false);
  const [isRestrictedOpen, setIsRestrictedOpen] = useState(false);
  const [lightboxData, setLightboxData] = useState<{ images: string[], index: number } | null>(null);
  const [dbLastSeen, setDbLastSeen] = useState<string | null>(null);
  const [followModal, setFollowModal] = useState<{ type: 'followers' | 'following', isOpen: boolean } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const { posts, isLoading: loadingPosts, refetch: refetchPosts } = useSocialFeed();
  const targetUserId = userId || currentUser?.id;
  const isOwnProfile = !userId || userId === currentUser?.id;
  const isOnline = isUserOnline(targetUserId);
  const lastSeen = getLastSeen(targetUserId) || dbLastSeen;

  const { counts, loadingCounts } = useFollow(targetUserId);
  
  const { data: orders, isLoading: loadingOrders, refetch: refetchOrders } = useWcUserOrders(
    isOwnProfile ? currentUser?.email : undefined,
    isOwnProfile ? profile?.wp_id : undefined
  );

  useEffect(() => {
    if (activeTab === 'orders') refetchOrders();
    if (activeTab === 'activity') refetchPosts();
  }, [activeTab, refetchOrders, refetchPosts]);

  const fetchProfile = async (id: string) => {
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('id, username, first_name, last_name, avatar_url, cover_url, role, is_admin, bio, city, instagram_handle, facebook_handle, tiktok_handle, website_url, wp_id, last_seen_at, license_plate_privacy')
      .eq('id', id)
      .maybeSingle();
      
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
    if (authLoading) return;
    
    if (!currentUser && !userId) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      if (userId) await fetchProfile(userId);
      else if (currentUser) await fetchProfile(currentUser.id);
      setLoading(false);
    };
    
    loadProfile();
  }, [authLoading, currentUser, userId, navigate]);

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

  const handleMessageClick = () => {
    const targetRole = profile?.role || 'subscriber';
    const isTargetStaff = ['admin', 'staff', 'support'].includes(targetRole);
    
    if (role === 'subscriber' && !isTargetStaff) {
      setIsRestrictedOpen(true);
    } else {
      navigate(`/chat/${profile.id}`);
    }
  };

  const handleUpgradeRequest = async () => {
    if (myRequest) {
      setIsRestrictedOpen(false);
      setActiveTab('profile');
      return;
    }
    await sendRequest.mutateAsync('subscriber_plus');
    setIsRestrictedOpen(false);
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
      const { error: updateError } = await supabase.from('profiles').upsert({ 
        id: currentUser.id, 
        [isAvatar ? 'avatar_url' : 'cover_url']: publicUrl, 
        updated_at: new Date().toISOString() 
      });
      if (updateError) throw updateError;

      showSuccess(isAvatar ? "Foto profilo aggiornata!" : "Copertina aggiornata!");
      await fetchProfile(currentUser.id);
    } catch (error: any) {
      showError(error.message);
    } finally {
      if (isAvatar) setUploadingAvatar(false); else setUploadingCover(false);
    }
  };

  const translateOrderStatus = (status: string) => {
    const map: Record<string, string> = {
      'pending': 'In attesa di pagamento',
      'processing': 'In lavorazione',
      'on-hold': 'In sospeso',
      'completed': 'Completato',
      'cancelled': 'Annullato',
      'refunded': 'Rimborsato',
      'failed': 'Fallito',
      'checkout-draft': 'Bozza'
    };
    return (map[status] || status).toUpperCase();
  };

  const getTrackingInfo = (order: any) => {
    const meta = order.meta_data || [];
    const official = meta.find((m: any) => m.key === '_wc_shipment_tracking_items');
    if (official && Array.isArray(official.value) && official.value.length > 0) {
      const item = official.value[0];
      return { number: item.tracking_number, provider: item.tracking_provider, url: item.custom_tracking_link || item.tracking_link };
    }
    const yithCode = meta.find((m: any) => m.key === '_ywto_tracking_code' || m.key === 'ywto_tracking_code')?.value;
    const yithCarrier = meta.find((m: any) => m.key === '_ywto_carrier_name' || m.key === 'ywto_carrier_name')?.value;
    const yithUrl = meta.find((m: any) => m.key === '_ywto_tracking_url' || m.key === 'ywto_tracking_url')?.value;
    if (yithCode) return { number: yithCode, provider: yithCarrier, url: yithUrl };
    return null;
  };

  if (loading || authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-zinc-500" size={40} /></div>;

  const userRole = profile?.role || 'subscriber';
  const isTargetSubscriber = userRole === 'subscriber';

  const tabs = [];
  if (!isTargetSubscriber) tabs.push({ id: 'activity', label: t.profile.posts, icon: MessageSquare });
  if (isOwnProfile || !isTargetSubscriber) tabs.push({ id: 'garage', label: t.nav.garage, icon: Car });
  if (isOwnProfile) {
    tabs.push({ id: 'marketplace', label: 'Market', icon: Tag });
    tabs.push({ id: 'orders', label: t.profile.orders, icon: ShoppingBag });
    tabs.push({ id: 'selections', label: t.profile.selections, icon: ClipboardCheck });
  }
  tabs.push({ id: 'profile', label: t.profile.info, icon: User });
  if (isOwnProfile) tabs.push({ id: 'settings', label: t.profile.settings, icon: Settings });

  const userPosts = posts?.filter(p => p.user_id === targetUserId) || [];

  return (
    <div className="min-h-screen text-white flex flex-col bg-transparent">
      <Navbar />
      <main className="flex-1 pb-32 pt-[calc(4rem+env(safe-area-inset-top))]">
        {/* Cover Section */}
        <div className="relative aspect-[2.5/1] md:h-64 md:aspect-auto bg-zinc-900 group/cover">
          <div className="absolute inset-0 overflow-hidden" onClick={() => !isOwnProfile && setLightboxData({ images: [profile?.cover_url || DEFAULT_COVER], index: 0 })}>
            <img src={profile?.cover_url || DEFAULT_COVER} className="w-full h-full object-cover transition-all duration-700 hover:scale-105" alt="Cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {isOwnProfile && (
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/cover:opacity-100 transition-opacity flex flex-col items-center justify-center z-30">
                <button onClick={(e) => { e.stopPropagation(); coverInputRef.current?.click(); }} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl">
                  <Camera size={20} />
                </button>
              </div>
            )}
            <input type="file" ref={coverInputRef} className="hidden" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, 'cover')} />
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="px-5 md:px-12 max-w-6xl mx-auto relative">
          <div className="flex flex-col items-center text-center -mt-12 md:-mt-16">
            <div className="relative group/avatar z-20 mb-6">
              <div onClick={() => !isOwnProfile && setLightboxData({ images: [profile?.avatar_url || DEFAULT_AVATAR], index: 0 })} className={cn("w-24 h-24 md:w-36 md:h-36 bg-zinc-900 border-[4px] rounded-full overflow-hidden flex items-center justify-center relative transition-all duration-500", isOnline ? "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]")}>
                {uploadingAvatar ? <Loader2 className="animate-spin text-zinc-500" /> : (profile?.avatar_url || DEFAULT_AVATAR) ? <img src={profile?.avatar_url || DEFAULT_AVATAR} alt="Avatar" className="w-full h-full object-cover" /> : <User size={32} className="text-zinc-800" />}
                {isOwnProfile && <button onClick={(e) => { e.stopPropagation(); avatarInputRef.current?.click(); }} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity bg-black/40 rounded-full"><Camera size={20} className="text-white" /></button>}
              </div>
              <input type="file" ref={avatarInputRef} className="hidden" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, 'avatar')} />
            </div>

            <div className="flex flex-col items-center w-full max-w-xl">
              <div className="flex items-center justify-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter leading-none">{profile?.username || 'Utente'}</h1>
                <div className="flex items-center gap-1.5">
                  {!isOwnProfile && currentUser && (userRole !== 'subscriber' || canVote) && (
                    <button 
                      onClick={handleMessageClick} 
                      className="w-7 h-7 bg-white/5 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all flex items-center justify-center border border-white/10 shadow-lg"
                    >
                      <Mail size={14} />
                    </button>
                  )}
                  <button onClick={handleShareProfile} className="w-7 h-7 bg-white/5 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all flex items-center justify-center border border-white/10 shadow-lg"><Share2 size={14} /></button>
                  {isOwnProfile && <button onClick={() => setIsUsernameNoticeOpen(true)} className="w-7 h-7 bg-white/5 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all flex items-center justify-center border border-white/10 shadow-lg"><Edit2 size={12} /></button>}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-6">
                <p className="text-zinc-500 text-[8px] font-black uppercase tracking-[0.2em] italic leading-none">{t.profile.roles[userRole] || t.profile.roles.member}</p>
                <div className="flex items-center gap-1.5">
                  <div className={cn("w-1.5 h-1.5 rounded-full", isOnline ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500")} />
                  <p className={cn("text-[8px] font-black uppercase tracking-widest leading-none", isOnline ? 'Online' : lastSeen ? `Accesso ${lastSeen}` : 'Offline')}>{isOnline ? 'Online' : lastSeen ? `Accesso ${lastSeen}` : 'Offline'}</p>
                </div>
              </div>

              <div className="flex justify-center gap-8 md:gap-12 mb-8">
                <button onClick={() => setFollowModal({ type: 'followers', isOpen: true })} className="flex flex-col items-center group"><span className="text-xl font-black italic tracking-tighter leading-none mb-1">{loadingCounts ? '...' : counts?.followers}</span><span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">{t.profile.followers}</span></button>
                <button onClick={() => setFollowModal({ type: 'following', isOpen: true })} className="flex flex-col items-center group"><span className="text-xl font-black italic tracking-tighter leading-none mb-1">{loadingCounts ? '...' : counts?.following}</span><span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">{t.profile.following}</span></button>
                <div className="flex flex-col items-center"><span className="text-xl font-black italic tracking-tighter leading-none mb-1">{userPosts.length}</span><span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">{t.profile.posts}</span></div>
              </div>

              {/* Upgrade Section for Subscribers */}
              {isOwnProfile && userRole === 'subscriber' && (
                <div className="w-full max-w-md mb-8">
                  {myRequest && myRequest.status === 'pending' ? (
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-zinc-500" />
                        <div className="text-left">
                          <p className="text-[10px] font-black uppercase italic">Richiesta Upgrade</p>
                          <p className="text-[8px] font-bold uppercase text-zinc-500">Stato: {myRequest.status.toUpperCase()}</p>
                        </div>
                      </div>
                      <span className="text-[8px] font-black uppercase bg-zinc-800 px-3 py-1.5 rounded-full text-zinc-400 italic">In Revisione</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => sendRequest.mutate('subscriber_plus')}
                      disabled={sendRequest.isPending}
                      className="w-full bg-white text-black hover:bg-zinc-200 p-4 rounded-2xl flex items-center justify-between group transition-all shadow-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                          <Sparkles size={20} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-black uppercase italic">Diventa ISCRITTO+</p>
                          <p className="text-[8px] font-bold uppercase text-zinc-500">Sblocca post, storie e messaggi</p>
                        </div>
                      </div>
                      {sendRequest.isPending ? <Loader2 className="animate-spin" size={18} /> : <ChevronRight size={20} />}
                    </button>
                  )}
                </div>
              )}

              {!isOwnProfile && currentUser && (!isTargetSubscriber || canVote) && <FollowButton userId={targetUserId} className="w-full sm:w-64 h-12 mb-6" />}

              {isOwnProfile && (userRole === 'admin' || userRole === 'staff' || userRole === 'support') && <button onClick={() => navigate('/admin')} className="w-full mb-8 bg-white/10 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl flex items-center justify-between group hover:bg-white hover:text-black transition-all duration-500 shadow-xl"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-black/10 transition-colors"><ShieldCheck size={16} /></div><p className="text-[10px] font-black uppercase italic tracking-widest">DASHBOARD {userRole.toUpperCase()}</p></div><ChevronRight size={18} /></button>}
            </div>
          </div>

          <div className="mt-4">
            {!isTargetSubscriber && targetUserId && <HighlightsBar userId={targetUserId} isOwnProfile={isOwnProfile} />}

            <div className="flex bg-zinc-900/50 backdrop-blur-md rounded-full p-1 mb-6 border border-white/5 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-full transition-all duration-500 whitespace-nowrap", activeTab === tab.id ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300")}><tab.icon size={14} /><span className="text-[8px] font-black uppercase tracking-widest hidden sm:block">{tab.label}</span></button>
              ))}
            </div>

            <div className="min-h-[300px]">
              <AnimatePresence mode="wait">
                {activeTab === 'activity' && (
                  <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-black italic uppercase">{isOwnProfile ? t.profile.myPosts : t.profile.posts}</h3>
                      {isOwnProfile && <Button onClick={() => setIsPostModalOpen(true)} className="bg-white text-black hover:scale-105 rounded-full text-[9px] font-black uppercase italic tracking-widest h-9 px-5 shadow-lg shadow-white/20"><Plus size={12} className="mr-2" /> {t.feed.newPost}</Button>}
                    </div>
                    {loadingPosts && !userPosts.length ? <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-zinc-500" /></div> : userPosts.length > 0 ? <div className="grid grid-cols-3 gap-1 md:gap-4">{userPosts.map((post) => <ProfilePostGridItem key={post.id} post={post} />)}</div> : <div className="text-center py-20 opacity-20"><MessageSquare className="mx-auto text-zinc-800 mb-4" size={40} /><p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">{isOwnProfile ? t.profile.noPosts : t.feed.noPosts}</p></div>}
                  </motion.div>
                )}
                {activeTab === 'garage' && <motion.div key="garage" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><GarageTab userId={targetUserId} isOwnProfile={isOwnProfile} /></motion.div>}
                {activeTab === 'marketplace' && <motion.div key="marketplace" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><MarketplaceTab userId={targetUserId} isOwnProfile={isOwnProfile} /></motion.div>}
                {activeTab === 'orders' && (
                  <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h3 className="text-lg font-black italic uppercase mb-4">{t.profile.orders}</h3>
                    {loadingOrders ? <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-zinc-500" /></div> : orders?.length > 0 ? <div className="space-y-3">{orders.map((order: any) => { const tracking = getTrackingInfo(order); const totalItems = order.line_items.reduce((acc: number, item: any) => acc + item.quantity, 0); return <div key={order.id} onClick={() => setSelectedOrder(order)} className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-5 rounded-2xl group hover:border-white/20 transition-all shadow-xl cursor-pointer"><div className="flex flex-col md:flex-row justify-between gap-3"><div className="space-y-1.5"><div className="flex items-center gap-2"><span className="bg-white text-black text-[7px] font-black uppercase px-1.5 py-0.5 italic rounded-full">#{order.id}</span><span className={cn("text-[7px] font-black uppercase px-1.5 py-0.5 italic rounded-full text-white", order.status === 'completed' && "bg-green-600", order.status === 'pending' && "bg-blue-600", order.status === 'on-hold' && "bg-orange-500", !['completed', 'pending', 'on-hold'].includes(order.status) && "bg-zinc-800")}>{translateOrderStatus(order.status)}</span></div><h4 className="text-xs font-black italic uppercase tracking-tight">{totalItems} {totalItems === 1 ? 'Prodotto' : 'Prodotti'}</h4><p className="text-[8px] text-zinc-500 font-bold uppercase">Effettuato il {new Date(order.date_created).toLocaleDateString('it-IT')}</p></div><div className="text-right flex flex-col justify-center"><p className="text-[7px] font-black uppercase text-zinc-600 tracking-widest mb-0.5">{t.checkout.total}</p><p className="text-xl font-black italic tracking-tighter">{order.total} €</p></div></div>{tracking && <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-500"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white"><Truck size={16} /></div><div><p className="text-[7px] font-black uppercase text-zinc-500 tracking-widest">Tracking {tracking.provider || 'Spedizione'}</p>{tracking.url ? <a href={tracking.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] font-black uppercase italic text-white tracking-tight hover:text-zinc-300 transition-colors flex items-center gap-1">{tracking.number} <ExternalLink size={8} className="opacity-50" /></a> : <p className="text-[10px] font-black uppercase italic text-white tracking-tight">{tracking.number}</p>}</div></div>{tracking.url && <a href={tracking.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 bg-white text-black px-3 py-1.5 rounded-full text-[8px] font-black uppercase italic hover:bg-zinc-200 transition-all shadow-lg">Segui <ExternalLink size={10} /></a>}</div>}</div>; })}</div> : <div className="text-center py-20 opacity-20"><ShoppingBag className="mx-auto text-zinc-800 mb-4" size={40} /><p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">{t.profile.noOrders}</p></div>}
                  </motion.div>
                )}
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
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-black uppercase italic">{t.profile.usernameNoticeTitle}</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 text-xs font-bold uppercase leading-relaxed">{t.profile.usernameNoticeDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
            <AlertDialogAction onClick={() => window.location.href = 'mailto:info@lowdistrict.it'} className="rounded-full bg-white text-black hover:bg-zinc-200 font-black uppercase italic text-[10px] w-full h-12 transition-all">{t.profile.contactAdmin}</AlertDialogAction>
            <AlertDialogCancel className="rounded-full border-white/10 text-white hover:bg-white/5 font-black uppercase italic text-[10px] w-full h-12 mt-0 transition-all">{t.feed.cancel}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isRestrictedOpen} onOpenChange={setIsRestrictedOpen}>
        <AlertDialogContent className="bg-black/60 backdrop-blur-2xl border-white/10 rounded-[2rem]">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center rounded-2xl rotate-12">
                <ShieldAlert size={32} className="text-white -rotate-12" />
              </div>
            </div>
            <AlertDialogTitle className="text-white font-black uppercase italic text-center">Accesso Limitato</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-xs font-bold uppercase leading-relaxed text-center">
              I messaggi privati sono una funzione esclusiva riservata ai membri ufficiali del District.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
            <button 
              onClick={handleUpgradeRequest}
              disabled={sendRequest.isPending}
              className="rounded-full bg-white text-black hover:bg-zinc-200 font-black uppercase italic text-[10px] w-full h-14 transition-all flex items-center justify-center gap-2 shadow-xl"
            >
              {sendRequest.isPending ? <Loader2 className="animate-spin" size={14} /> : <><Sparkles size={14} /> {myRequest && myRequest.status === 'pending' ? 'Vedi Stato Richiesta' : 'Richiedi Upgrade ISCRITTO+'}</>}
            </button>
            <AlertDialogAction 
              onClick={() => window.open('https://www.lowdistrict.it/selection-lwdstrct/', '_blank')} 
              className="rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 font-black uppercase italic text-[10px] w-full h-14 transition-all"
            >
              Invia Selezione Ufficiale
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-full border-white/10 text-white hover:bg-white/5 font-black uppercase italic text-[10px] w-full h-14 mt-0 transition-all">
              Chiudi
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreatePostModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} />
      <ImageLightbox images={lightboxData?.images || []} initialIndex={lightboxData?.index || 0} isOpen={!!lightboxData} onClose={() => setLightboxData(null)} />
      <OrderDetailModal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} order={selectedOrder} />
      
      {followModal && (
        <FollowListModal 
          isOpen={followModal.isOpen} 
          onClose={() => setFollowModal(null)} 
          userId={targetUserId} 
          username={profile?.username || 'Utente'} 
          type={followModal.type} 
        />
      )}
    </div>
  );
};

export default Profile;