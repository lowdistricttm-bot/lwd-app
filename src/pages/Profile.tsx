"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { Settings as SettingsIcon, MapPin, User as UserIcon, MessageSquare, Loader2, RefreshCw, Package, ChevronRight, Heart, Car, Ticket, Camera, ExternalLink } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useWcUserOrders } from '@/hooks/use-woocommerce';
import { usePosts } from '@/hooks/use-posts';
import { showSuccess } from '@/utils/toast';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const Profile = () => {
  const [activeTab, setActiveTab] = useState<'activity' | 'orders' | 'applications'>('activity');
  const { user, logout, refreshUser, isLoading, isRefreshing } = useAuth();
  const { data: allOrders, isLoading: isLoadingOrders } = useWcUserOrders(user?.id);
  const { data: postsData, isLoading: isLoadingPosts } = usePosts();
  
  const navigate = useNavigate();
  const location = useLocation();
  const defaultAvatar = "https://www.lowdistrict.it/wp-content/uploads/placeholder.png";

  // Filtriamo i post di Supabase per mostrare solo quelli dell'utente corrente
  const myPosts = useMemo(() => {
    const allPosts = postsData?.pages.flat() || [];
    if (!user?.id) return [];
    const userIdStr = String(user.id);
    return allPosts.filter((post: any) => String(post.user_id) === userIdStr);
  }, [postsData, user?.id]);

  const { merchOrders, eventApplications } = useMemo(() => {
    const orders = allOrders || [];
    const merch = orders.filter((o: any) => 
      !o.line_items.some((item: any) => 
        item.name.toLowerCase().includes('evento') || 
        item.name.toLowerCase().includes('selection')
      )
    );
    const apps = orders.filter((o: any) => 
      o.line_items.some((item: any) => 
        item.name.toLowerCase().includes('evento') || 
        item.name.toLowerCase().includes('selection')
      )
    );
    return { merchOrders: merch, eventApplications: apps };
  }, [allOrders]);

  const handleRefresh = async () => {
    await refreshUser();
    showSuccess("Dati aggiornati");
  };

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-red-600" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <Navbar />
        <UserIcon size={48} className="text-gray-800 mb-6" />
        <h1 className="text-2xl font-black uppercase italic mb-8">Area Riservata</h1>
        <Link to="/auth" state={{ from: location.pathname }}>
          <Button className="bg-red-600 px-12 py-6 rounded-none italic font-black uppercase">Accedi</Button>
        </Link>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      <div className="pt-24 px-6 max-w-2xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div className="w-24 h-24 rounded-[2rem] bg-zinc-900 border-2 border-red-600 p-1 rotate-3 overflow-hidden">
            <img src={user.avatar || defaultAvatar} className="w-full h-full rounded-[1.8rem] object-cover -rotate-3" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleRefresh} className="p-3 bg-zinc-900 rounded-2xl">
              <RefreshCw size={20} className={cn(isRefreshing && "animate-spin text-red-600")} />
            </button>
            <Link to="/settings" className="p-3 bg-zinc-900 rounded-2xl"><SettingsIcon size={20} /></Link>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase italic">{user.display_name}</h1>
          <p className="text-red-600 text-xs font-black uppercase tracking-widest">@{user.username}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 py-6 border-y border-white/5 mb-8">
          <div className="text-center border-r border-white/5">
            <p className="font-black text-xl italic">{myPosts.length}</p>
            <p className="text-[8px] text-gray-500 uppercase font-black">Post</p>
          </div>
          <div className="text-center border-r border-white/5">
            <p className="font-black text-xl italic">{merchOrders.length}</p>
            <p className="text-[8px] text-gray-500 uppercase font-black">Ordini</p>
          </div>
          <div className="text-center">
            <p className="font-black text-xl italic">{eventApplications.length}</p>
            <p className="text-[8px] text-gray-500 uppercase font-black">Selezioni</p>
          </div>
        </div>

        <div className="flex justify-between mb-8 border-b border-white/5">
          <button onClick={() => setActiveTab('activity')} className={cn("pb-4 text-[9px] font-black uppercase flex-1", activeTab === 'activity' ? "border-b-2 border-red-600 text-white" : "text-gray-600")}>Bacheca App</button>
          <button onClick={() => setActiveTab('orders')} className={cn("pb-4 text-[9px] font-black uppercase flex-1", activeTab === 'orders' ? "border-b-2 border-red-600 text-white" : "text-gray-600")}>Ordini</button>
          <button onClick={() => setActiveTab('applications')} className={cn("pb-4 text-[9px] font-black uppercase flex-1", activeTab === 'applications' ? "border-b-2 border-red-600 text-white" : "text-gray-600")}>Candidature</button>
        </div>

        <div className="space-y-6">
          {activeTab === 'activity' && (
            myPosts.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-white/5 rounded-3xl">
                <MessageSquare className="mx-auto text-gray-800 mb-4" size={40} />
                <p className="text-gray-500 text-[10px] font-black uppercase">Nessun post nell'app</p>
              </div>
            ) : (
              myPosts.map((post: any) => (
                <div key={post.id} className="bg-zinc-900/30 border border-white/5 p-5 rounded-2xl">
                  <p className="text-sm text-gray-300 mb-4">{post.content}</p>
                  {post.image_url && <img src={post.image_url} className="rounded-xl w-full mb-4" />}
                  <span className="text-[9px] text-gray-500 font-black uppercase">
                    {post.created_at ? format(new Date(post.created_at), 'dd MMM yyyy', { locale: it }) : 'Recentemente'}
                  </span>
                </div>
              ))
            )
          )}
          
          {activeTab === 'orders' && (
            merchOrders.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-white/5 rounded-3xl">
                <Package className="mx-auto text-gray-800 mb-4" size={40} />
                <p className="text-gray-500 text-[10px] font-black uppercase">Nessun ordine trovato</p>
              </div>
            ) : (
              merchOrders.map((order: any) => (
                <div key={order.id} className="bg-zinc-900/30 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase italic">Ordine #{order.id}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{order.status}</p>
                  </div>
                  <p className="font-black italic">€{order.total}</p>
                </div>
              ))
            )
          )}

          {activeTab === 'applications' && (
            eventApplications.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-white/5 rounded-3xl">
                <Ticket className="mx-auto text-gray-800 mb-4" size={40} />
                <p className="text-gray-500 text-[10px] font-black uppercase">Nessuna candidatura</p>
              </div>
            ) : (
              eventApplications.map((app: any) => (
                <div key={app.id} className="bg-zinc-900/30 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase italic">{app.line_items[0]?.name}</p>
                    <p className="text-[10px] text-red-600 font-black uppercase tracking-widest">{app.status}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-700" />
                </div>
              ))
            )
          )}
        </div>

        <Button onClick={logout} variant="outline" className="w-full mt-12 border-white/10 text-gray-500 font-black uppercase italic">Esci</Button>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;