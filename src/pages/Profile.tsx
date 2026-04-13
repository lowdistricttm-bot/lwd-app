"use client";

import React, { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { Settings as SettingsIcon, User as UserIcon, Loader2, RefreshCw, Camera } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useBpProfile, useBpActivity } from '@/hooks/use-buddypress';

const Profile = () => {
  const [activeTab, setActiveTab] = useState<'activity' | 'info'>('activity');
  const { user, logout, refreshUser, isLoading, isRefreshing } = useAuth();
  const { data: profileData, isLoading: isProfileLoading } = useBpProfile(user?.id);
  const { data: activityData } = useBpActivity(user?.id);
  
  const location = useLocation();
  const myActivities = useMemo(() => activityData?.pages.flat() || [], [activityData]);

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
          <div className="relative">
            <div className="w-24 h-24 rounded-[2rem] bg-zinc-900 border-2 border-red-600 p-1 rotate-3 overflow-hidden">
              <img src={user.avatar || "https://www.lowdistrict.it/wp-content/uploads/placeholder.png"} className="w-full h-full rounded-[1.8rem] object-cover -rotate-3" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={refreshUser} className="p-3 bg-zinc-900 rounded-2xl">
              <RefreshCw size={20} className={cn(isRefreshing && "animate-spin text-red-600")} />
            </button>
            <Link to="/settings" className="p-3 bg-zinc-900 rounded-2xl"><SettingsIcon size={20} /></Link>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase italic">{user.display_name}</h1>
          <p className="text-red-600 text-xs font-black uppercase tracking-widest">@{user.username}</p>
        </div>

        <div className="flex justify-between mb-8 border-b border-white/5">
          <button onClick={() => setActiveTab('activity')} className={cn("pb-4 text-[9px] font-black uppercase flex-1", activeTab === 'activity' ? "border-b-2 border-red-600 text-white" : "text-gray-600")}>La Mia Bacheca</button>
          <button onClick={() => setActiveTab('info')} className={cn("pb-4 text-[9px] font-black uppercase flex-1", activeTab === 'info' ? "border-b-2 border-red-600 text-white" : "text-gray-600")}>Info Profilo</button>
        </div>

        <div className="space-y-6">
          {activeTab === 'activity' ? (
            myActivities.length === 0 ? (
              <p className="text-center text-gray-500 text-[10px] font-black uppercase py-20">Nessuna attività recente</p>
            ) : (
              myActivities.map((act: any) => (
                <div key={act.id} className="bg-zinc-900/30 border border-white/5 p-5 rounded-2xl">
                  <div className="text-sm text-gray-300 mb-2" dangerouslySetInnerHTML={{ __html: act.content.rendered }} />
                  <span className="text-[9px] text-gray-500 font-black uppercase">{new Date(act.date).toLocaleDateString()}</span>
                </div>
              ))
            )
          ) : (
            <div className="space-y-4">
              {isProfileLoading ? <Loader2 className="animate-spin mx-auto" /> : (
                profileData?.map((group: any) => (
                  <div key={group.id} className="space-y-3">
                    <h3 className="text-[10px] font-black text-red-600 uppercase tracking-widest">{group.name}</h3>
                    {group.fields?.map((field: any) => (
                      <div key={field.id} className="bg-zinc-900/50 p-4 border border-white/5">
                        <p className="text-[8px] text-gray-500 font-black uppercase mb-1">{field.name}</p>
                        <p className="text-sm font-bold">{field.value?.rendered || 'Non specificato'}</p>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <Button onClick={logout} variant="outline" className="w-full mt-12 border-white/10 text-gray-500 font-black uppercase italic">Esci</Button>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;