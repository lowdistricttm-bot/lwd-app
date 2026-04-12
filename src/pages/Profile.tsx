"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { Settings as SettingsIcon, MapPin, Link as LinkIcon, User as UserIcon, Users, MessageSquare, Loader2, RefreshCw, Package, ChevronRight, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useWcCustomerCount, useWcUserOrders } from '@/hooks/use-woocommerce';
import { useBpActivity, useBpMemberData } from '@/hooks/use-buddypress';
import { showSuccess } from '@/utils/toast';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const Profile = () => {
  const [activeTab, setActiveTab] = useState<'activity' | 'orders'>('activity');
  const [imgError, setImgError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());
  
  const { user, logout, refreshUser, isLoading, isRefreshing } = useAuth();
  const { data: customerCount } = useWcCustomerCount();
  const { data: orders, isLoading: isLoadingOrders } = useWcUserOrders(user?.id);
  const { data: activityData, isLoading: isLoadingActivity } = useBpActivity(user?.id);
  const { data: memberData } = useBpMemberData(user?.id);
  
  const location = useLocation();
  const defaultAvatar = "https://www.lowdistrict.it/wp-content/uploads/placeholder.png";

  const activities = useMemo(() => activityData?.pages.flat() || [], [activityData]);

  useEffect(() => {
    if (user) refreshUser();
  }, []);

  const handleRefresh = async () => {
    setImgError(false);
    setRefreshKey(Date.now());
    await refreshUser();
    showSuccess("Profilo sincronizzato con il sito");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sincronizzazione dati...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <Navbar />
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
          <UserIcon size={40} className="text-gray-700" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 italic">Area Riservata</h1>
        <p className="text-gray-500 mb-8 uppercase text-[10px] font-black tracking-widest">Accedi per gestire il tuo garage e i tuoi ordini</p>
        <Link to="/auth" state={{ from: location.pathname }}>
          <Button className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest px-12 py-6 rounded-none italic">
            Accedi / Registrati
          </Button>
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
          <div className="relative">
            <div className="w-24 h-24 rounded-[2rem] bg-zinc-900 border-2 border-red-600 p-1 rotate-3 flex items-center justify-center overflow-hidden">
              <img 
                key={`${user.avatar}-${refreshKey}`}
                src={imgError || !user.avatar ? defaultAvatar : user.avatar} 
                alt="avatar" 
                crossOrigin="anonymous"
                className="w-full h-full rounded-[1.8rem] object-cover -rotate-3" 
                onError={() => setImgError(true)}
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
              MEMBER
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="p-3 bg-zinc-900 border border-white/5 rounded-2xl hover:bg-zinc-800 transition-all disabled:opacity-50"
            >
              <RefreshCw size={20} className={cn("text-gray-400", isRefreshing && "animate-spin text-red-600")} />
            </button>
            <Link to="/settings" className="p-3 bg-zinc-900 border border-white/5 rounded-2xl hover:bg-zinc-800 transition-all">
              <SettingsIcon size={20} />
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tighter uppercase mb-1 italic">{user.display_name}</h1>
          <p className="text-red-600 text-xs font-black uppercase tracking-widest mb-4">@{user.username}</p>
          
          <div className="flex flex-wrap gap-4 text-gray-500 text-[10px] font-black uppercase tracking-tight mb-6">
            <span className="flex items-center gap-1"><MapPin size={14} /> {memberData?.xprofile?.groups?.[0]?.fields?.find((f: any) => f.name === 'Città')?.value || 'Community Member'}</span>
            <span className="flex items-center gap-1"><LinkIcon size={14} /> lowdistrict.it</span>
          </div>

          <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600/10 rounded-xl">
                <Users className="text-red-600" size={18} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Membri Community</span>
            </div>
            <span className="text-xl font-black italic">{customerCount || "..."}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/5 mb-8">
          <div className="text-center">
            <p className="font-black text-2xl tracking-tighter italic">{activities.length}</p>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Post</p>
          </div>
          <div className="text-center">
            <p className="font-black text-2xl tracking-tighter italic">{orders?.length || 0}</p>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Ordini</p>
          </div>
          <div className="text-center">
            <p className="font-black text-2xl tracking-tighter italic">0</p>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Amici</p>
          </div>
        </div>

        <div className="flex gap-8 mb-8 border-b border-white/5">
          <button 
            onClick={() => setActiveTab('activity')}
            className={cn(
              "pb-4 text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'activity' ? "border-b-2 border-red-600 text-white" : "text-gray-600"
            )}
          >
            Attività
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={cn(
              "pb-4 text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'orders' ? "border-b-2 border-red-600 text-white" : "text-gray-600"
            )}
          >
            Ordini & Selezioni
          </button>
        </div>

        {activeTab === 'activity' ? (
          <div className="space-y-6">
            {isLoadingActivity ? (
              <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-red-600" /></div>
            ) : activities.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-white/5">
                <MessageSquare className="mx-auto text-gray-800 mb-4" size={40} />
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Nessun post pubblicato</p>
              </div>
            ) : (
              activities.map((post: any) => (
                <div key={post.id} className="bg-zinc-900/30 border border-white/5 p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">
                      {format(new Date(post.date), 'dd MMM yyyy', { locale: it })}
                    </span>
                    <Heart size={14} className="text-gray-700" />
                  </div>
                  <div 
                    className="text-sm text-gray-300 prose prose-invert max-w-none line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {isLoadingOrders ? (
              <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-red-600" /></div>
            ) : !orders || orders.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-white/5">
                <Package className="mx-auto text-gray-800 mb-4" size={40} />
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Nessun ordine trovato</p>
              </div>
            ) : (
              orders.map((order: any) => (
                <div key={order.id} className="bg-zinc-900/50 border border-white/5 p-4 flex items-center gap-4 group">
                  <div className="w-12 h-12 shrink-0 overflow-hidden bg-zinc-800 rounded-xl">
                    <img 
                      src={order.line_items[0]?.image?.src || defaultAvatar} 
                      alt="" 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" 
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-xs uppercase tracking-tight italic truncate max-w-[150px]">
                        {order.line_items[0]?.name}
                      </h3>
                      <span className={cn(
                        "text-[8px] font-black uppercase px-2 py-0.5",
                        order.status === 'completed' ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                      )}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">
                      #{order.id} • €{order.total}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-700" />
                </div>
              ))
            )}
          </div>
        )}

        <div className="mt-12">
          <Button 
            onClick={logout}
            variant="outline" 
            className="w-full border-white/10 text-gray-500 hover:text-red-600 hover:border-red-600/50 font-black uppercase tracking-widest py-6 rounded-none italic"
          >
            Disconnetti Account
          </Button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;