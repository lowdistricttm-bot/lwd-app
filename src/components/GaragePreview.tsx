"use client";

import React, { useEffect, useRef, useMemo } from 'react';
import { Heart, MessageCircle, Share2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBpActivity, useActivityActions } from '@/hooks/use-buddypress';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

const ActivityItem = ({ activity }: { activity: any }) => {
  const { user } = useAuth();
  const { favoriteActivity } = useActivityActions();

  return (
    <div className="bg-zinc-900/20 border border-white/5 rounded-3xl overflow-hidden mb-8">
      <div className="px-4 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-red-600/20">
          <img 
            src={activity.user_avatar?.thumb || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.user_id}`} 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-black uppercase italic" dangerouslySetInnerHTML={{ __html: activity.display_name || activity.name }} />
          <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">
            {formatDistanceToNow(new Date(activity.date), { addSuffix: true, locale: it })}
          </p>
        </div>
      </div>
      
      <div className="px-4 pb-4">
        <div 
          className="text-sm leading-relaxed text-gray-300 activity-content" 
          dangerouslySetInnerHTML={{ __html: activity.content.rendered }} 
        />
      </div>

      <div className="px-4 py-4 flex items-center gap-6 border-t border-white/5">
        <button 
          onClick={() => favoriteActivity.mutate(activity.id)}
          className="flex items-center gap-2 text-white hover:text-red-600 transition-all"
        >
          <Heart size={22} />
          <span className="text-xs font-black">{activity.favorite_count || 0}</span>
        </button>
        
        <button className="flex items-center gap-2 text-white hover:text-red-600 transition-all">
          <MessageCircle size={22} />
          <span className="text-xs font-black">{activity.comment_count || 0}</span>
        </button>

        <button className="text-white hover:text-red-600 transition-colors ml-auto">
          <Share2 size={22} />
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

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600" /></div>;

  return (
    <section className="px-4">
      <div className="space-y-4">
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