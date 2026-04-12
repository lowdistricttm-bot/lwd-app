"use client";

import React, { useState } from 'react';
import { Heart, MessageCircle, Send, MoreHorizontal, Share2, Loader2, AlertCircle, RefreshCw, Image as ImageIcon } from 'lucide-react';
import CommentDrawer from './CommentDrawer';
import CreatePostDialog from './CreatePostDialog';
import { cn } from '@/lib/utils';
import { useBpActivity } from '@/hooks/use-buddypress';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

const GaragePreview = () => {
  const { data: activities, isLoading, error, refetch } = useBpActivity();
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});

  const handleLike = (id: number) => {
    setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sincronizzazione Community...</p>
      </div>
    );
  }

  if (error) {
    const err = error as any;
    return (
      <div className="text-center py-16 px-6 bg-zinc-900/30 border border-white/5 rounded-3xl mx-4">
        <AlertCircle className="mx-auto text-red-600 mb-4" size={32} />
        <h3 className="text-sm font-black uppercase tracking-tighter mb-2">Accesso alla Bacheca</h3>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed mb-6">
          {err.message}
        </p>
        <Button 
          onClick={() => refetch()}
          className="bg-white text-black hover:bg-red-600 hover:text-white font-black uppercase tracking-widest text-[10px] px-8 py-4 rounded-none italic"
        >
          <RefreshCw size={14} className="mr-2" /> Riprova
        </Button>
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
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Live dal sito web</p>
          </div>
        </div>
        
        <div className="space-y-12">
          {activities?.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Nessuna attività trovata</p>
            </div>
          ) : (
            activities?.map((post: any) => (
              <div key={post.id} className="bg-zinc-900/20 border border-white/5 rounded-3xl overflow-hidden">
                {/* Header del Post */}
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]">
                      <div className="w-full h-full rounded-full border-2 border-black overflow-hidden">
                        <img 
                          src={post.user_avatar?.thumb || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`} 
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
                        {post.date ? formatDistanceToNow(new Date(post.date), { addSuffix: true, locale: it }) : 'Recentemente'}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 text-white/40 hover:text-white transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                
                {/* Contenuto Testuale */}
                <div className="px-4 pb-4">
                  <div 
                    className="activity-content text-sm leading-relaxed text-gray-300 prose prose-invert max-w-none break-words"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </div>

                {/* Visualizzazione Media (se presenti come array separato) */}
                {post.media && post.media.length > 0 && (
                  <div className={cn(
                    "grid gap-1 mb-2",
                    post.media.length === 1 ? "grid-cols-1" : "grid-cols-2"
                  )}>
                    {post.media.map((item: any, idx: number) => (
                      <div key={idx} className="aspect-square bg-zinc-800 overflow-hidden">
                        <img 
                          src={item.url || item} 
                          alt="Post media" 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer Azioni */}
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
      </div>

      <style>{`
        .activity-content img {
          width: 100%;
          height: auto;
          border-radius: 1rem;
          margin-top: 1rem;
          margin-bottom: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .activity-content a {
          color: #ef4444;
          font-weight: 800;
          text-decoration: none;
        }
        .activity-content blockquote {
          border-left: 4px solid #ef4444;
          padding-left: 1rem;
          font-style: italic;
          color: #9ca3af;
        }
      `}</style>
    </section>
  );
};

export default GaragePreview;