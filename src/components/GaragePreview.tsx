"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Heart, MessageCircle, Send, MoreHorizontal, Share2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import CommentDrawer from './CommentDrawer';
import CreatePostDialog from './CreatePostDialog';
import { cn } from '@/lib/utils';
import { usePosts } from '@/hooks/use-posts';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

const GaragePreview = () => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = usePosts();
  
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const observerTarget = useRef(null);

  const allPosts = useMemo(() => {
    return data?.pages.flat() || [];
  }, [data?.pages]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '400px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleLike = (id: string) => {
    setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Caricamento Community...</p>
      </div>
    );
  }

  return (
    <section className="bg-black py-12">
      <div className="max-w-xl mx-auto px-4">
        <CreatePostDialog />

        <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
          <div>
            <h3 className="text-lg font-black tracking-tighter uppercase italic">Community Feed</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">App Database</p>
          </div>
        </div>
        
        <div className="space-y-12">
          {allPosts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/5 rounded-3xl">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Nessun post presente. Sii il primo!</p>
            </div>
          ) : (
            allPosts.map((post: any) => (
              <div key={post.id} className="bg-zinc-900/20 border border-white/5 rounded-3xl overflow-hidden">
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full p-[2px] bg-red-600">
                      <div className="w-full h-full rounded-full border-2 border-black overflow-hidden">
                        <img 
                          src={post.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-black leading-none mb-1 uppercase italic">
                        {post.user_name || 'Membro Low District'}
                      </p>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                        {post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: it }) : 'Recentemente'}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 text-white/40 hover:text-white transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                
                <div className="px-4 pb-4">
                  <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">
                    {post.content}
                  </p>
                  {post.image_url && (
                    <div className="mt-4 rounded-2xl overflow-hidden border border-white/5">
                      <img src={post.image_url} alt="" className="w-full h-auto" />
                    </div>
                  )}
                </div>

                <div className="px-4 py-4 flex items-center justify-between border-t border-white/5">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={cn("transition-all active:scale-125", likedPosts[post.id] ? "text-red-600" : "text-white")}
                    >
                      <Heart size={26} strokeWidth={2} fill={likedPosts[post.id] ? "currentColor" : "none"} />
                    </button>
                    <CommentDrawer count="0" />
                    <button className="text-white hover:text-red-600 transition-colors">
                      <Share2 size={24} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div ref={observerTarget} className="h-20 flex items-center justify-center mt-8">
          {isFetchingNextPage && <Loader2 className="animate-spin text-red-600" size={24} />}
        </div>
      </div>
    </section>
  );
};

export default GaragePreview;