"use client";

import React, { useEffect, useRef, useMemo } from 'react';
import { Heart, MessageCircle, Share2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useBpActivity, useActivityActions } from '@/hooks/use-buddypress';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

const ActivityItem = ({ activity }: { activity: any }) => {
  const { favoriteActivity } = useActivityActions();

  return (
    <div className="bg-zinc-900/20 border border-white/5 rounded-3xl overflow-hidden mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-4 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-red-600/20 bg-zinc-800">
          <img 
            src={activity.user_avatar?.thumb || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.user_id}`} 
            alt="" 
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.src = "https://www.lowdistrict.it/wp-content/uploads/placeholder.png")}
          />
        </div>
        <div>
          <p className="text-sm font-black uppercase italic" dangerouslySetInnerHTML={{ __html: activity.display_name || activity.name || "Membro" }} />
          <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">
            {activity.date ? formatDistanceToNow(new Date(activity.date), { addSuffix: true, locale: it }) : "Recentemente"}
          </p>
        </div>
      </div>
      
      <div className="px-4 pb-4">
        <div 
          className="text-sm leading-relaxed text-gray-300 activity-content break-words" 
          dangerouslySetInnerHTML={{ __html: activity.content?.rendered || "" }} 
        />
      </div>

      <div className="px-4 py-4 flex items-center gap-6 border-t border-white/5">
        <button 
          onClick={() => favoriteActivity.mutate(activity.id)}
          className="flex items-center gap-2 text-white hover:text-red-600 transition-all"
        >
          <Heart size={20} className={activity.is_favorite ? "fill-red-600 text-red-600" : ""} />
          <span className="text-xs font-black">{activity.favorite_count || 0}</span>
        </button>
        
        <button className="flex items-center gap-2 text-white hover:text-red-600 transition-all">
          <MessageCircle size={20} />
          <span className="text-xs font-black">{activity.comment_count || 0}</span>
        </button>

        <button className="text-white hover:text-red-600 transition-colors ml-auto">
          <Share2 size={20} />
        </button>
      </div>
    </div>
  );
};

const GaragePreview = () => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useBpActivity();
  
  const observerTarget = useRef(null);
  const allActivities = useMemo(() => data?.pages.flat() || [], [data]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '400px' }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Caricamento bacheca...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-20 px-6 bg-zinc-900/30 border border-white/5 rounded-3xl mx-4">
      <AlertCircle className="mx-auto text-red-600 mb-4" size={32} />
      <h3 className="text-sm font-black uppercase tracking-tighter mb-2">Errore di Caricamento</h3>
      <p className="text-[10px] text-gray-500 uppercase font-bold mb-6">
        {(error as any).message === "401" ? "Sessione scaduta. Effettua di nuovo il login." : "Impossibile connettersi alla bacheca."}
      </p>
      <Button 
        onClick={() => refetch()}
        className="bg-white text-black hover:bg-red-600 hover:text-white font-black uppercase tracking-widest text-[10px] px-8 py-4 rounded-none italic"
      >
        Riprova
      </Button>
    </div>
  );

  if (allActivities.length === 0) return (
    <div className="text-center py-20 border border-dashed border-white/5 rounded-3xl mx-4">
      <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Nessuna attività trovata</p>
    </div>
  );

  return (
    <section className="px-4">
      <div className="space-y-2">
        {allActivities.map((activity: any) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
      <div ref={observerTarget} className="h-20 flex items-center justify-center">
        {isFetchingNextPage && <Loader2 className="animate-spin text-red-600" />}
      </div>
    </section>
  );
};

export default GaragePreview;