"use client";

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSocialFeed } from '@/hooks/use-social-feed';
import { MessageSquare, User, Heart, Play, LogIn, ArrowRight, ShieldCheck, Loader2, Sparkles, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import { Button } from './ui/button';

const LatestActivities = () => {
  const navigate = useNavigate();
  const { posts, isLoading } = useSocialFeed();
  const [user, setUser] = useState<any>(null);
  
  const [emblaRef] = useEmblaCarousel({ 
    align: 'start', 
    containScroll: 'trimSnaps',
    dragFree: true 
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const isVideo = (url: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('video');
  };

  const latestPosts = posts?.slice(0, 9) || [];

  return (
    <section className="py-12 px-6 bg-transparent overflow-hidden min-h-[350px]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h2 className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.4em] mb-1 italic">District Live</h2>
            <h3 className="text-2xl xs:text-3xl md:text-4xl font-black italic tracking-tighter uppercase whitespace-nowrap">
              Community Activity
            </h3>
          </div>
          
          {user && (
            <Link to="/bacheca" className="group flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
              Entra nella Bacheca <MessageSquare size={12} className="group-hover:scale-110 transition-transform" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-zinc-800" size={32} />
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-700 italic">Sincronizzazione...</p>
          </div>
        ) : !user ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative w-full bg-zinc-900/20 border border-white/5 p-8 md:p-12 overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
              <div className="w-14 h-14 bg-zinc-900 border border-white/10 flex items-center justify-center rotate-45 mb-6">
                <Lock size={20} className="text-white -rotate-45" />
              </div>
              <h3 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter mb-4">Sblocca il District Feed</h3>
              <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-8 italic">Accedi per visualizzare i post in tempo reale.</p>
              <Button onClick={() => navigate('/login')} className="bg-white text-black hover:bg-zinc-200 rounded-none h-12 px-8 text-[10px] font-black uppercase italic tracking-widest transition-all">Accedi Ora</Button>
            </div>
          </motion.div>
        ) : (
          <div className="embla overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
            <div className="embla__container flex gap-3">
              {latestPosts.map((post, i) => {
                const firstMedia = post.images?.[0] || post.image_url;
                const mediaIsVideo = firstMedia ? isVideo(firstMedia) : false;

                return (
                  <motion.div 
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => navigate(`/post/${post.id}`)}
                    className="embla__slide flex-[0_0_65%] sm:flex-[0_0_40%] md:flex-[0_0_31%] min-w-0 bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-all group flex flex-col"
                  >
                    <div className="p-3 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-zinc-800 rounded-full overflow-hidden border border-white/10">
                          {post.profiles?.avatar_url && <img src={post.profiles.avatar_url} className="w-full h-full object-cover" alt="" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[8px] font-black uppercase italic truncate">{post.profiles?.username || 'Membro'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="aspect-video bg-black relative overflow-hidden">
                      {firstMedia ? (
                        <>
                          {mediaIsVideo ? (
                            <video src={firstMedia} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" muted playsInline loop />
                          ) : (
                            <img src={firstMedia} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" alt="" />
                          )}
                          {mediaIsVideo && <div className="absolute top-2 right-2 text-white/50"><Play size={10} fill="currentColor" /></div>}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-950"><MessageSquare size={18} className="text-zinc-800" /></div>
                      )}
                    </div>

                    <div className="p-3 flex-1 flex flex-col">
                      {post.content ? (
                        <p className="text-[8px] text-zinc-500 line-clamp-1 mb-3 italic font-medium">"{post.content}"</p>
                      ) : (
                        <div className="mb-3 h-3" />
                      )}
                      <div className="flex items-center gap-3 text-zinc-700 pt-2 border-t border-white/5 mt-auto">
                        <div className="flex items-center gap-1">
                          <Heart size={8} className={cn(post.is_liked && "text-white fill-white")} />
                          <span className="text-[7px] font-black">{post.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare size={8} />
                          <span className="text-[7px] font-black">{post.comments?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestActivities;