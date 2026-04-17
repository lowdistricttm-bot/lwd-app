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

  const latestPosts = posts?.slice(0, 6) || [];

  return (
    <section className="py-12 px-6 bg-transparent overflow-hidden min-h-[400px]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">District Live</h2>
            <h3 className="text-3xl xs:text-4xl md:text-6xl font-black italic tracking-tighter uppercase whitespace-nowrap">
              Community Activity
            </h3>
          </div>
          
          {user && (
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Link to="/bacheca" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                Entra nella Bacheca <MessageSquare size={16} className="group-hover:scale-110 transition-transform" />
              </Link>
            </motion.div>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-zinc-800" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700 italic">Sincronizzazione District...</p>
          </div>
        ) : !user ? (
          /* --- AVVISO PER UTENTI NON LOGGATI --- */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative w-full bg-zinc-900/20 border border-white/5 p-8 md:p-16 overflow-hidden group"
          >
            {/* Background Decorativo */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 opacity-[0.02] pointer-events-none">
              <ShieldCheck size={300} />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-zinc-900 border border-white/10 flex items-center justify-center rotate-45 mb-10 group-hover:border-white/30 transition-colors duration-700">
                <Lock size={32} className="text-white -rotate-45" />
              </div>
              
              <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] mb-4 italic">Area Riservata</h4>
              <h3 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-6 leading-none">
                Sblocca il District Feed
              </h3>
              
              <p className="text-zinc-400 text-xs md:text-sm font-bold uppercase tracking-widest leading-relaxed mb-10 italic">
                Accedi per visualizzare i post in tempo reale, <br className="hidden md:block" /> 
                interagire con i membri, commentare e mettere like ai progetti.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button 
                  onClick={() => navigate('/login')}
                  className="bg-white text-black hover:bg-zinc-200 rounded-none h-14 px-10 font-black uppercase italic tracking-widest transition-all group/btn"
                >
                  Accedi Ora <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
                <a 
                  href="https://www.lowdistrict.it/account" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center border border-white/10 text-white hover:bg-white/5 h-14 px-10 text-[10px] font-black uppercase tracking-widest italic transition-all whitespace-nowrap"
                >
                  Registrati sul Sito
                </a>
              </div>
            </div>
          </motion.div>
        ) : latestPosts.length === 0 ? (
          <div className="text-center py-20 border border-white/5 bg-zinc-900/10">
            <MessageSquare className="mx-auto text-zinc-900 mb-4" size={48} />
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Il District è silenzioso oggi. Sii il primo a pubblicare!</p>
          </div>
        ) : (
          /* --- CAROUSEL PER UTENTI LOGGATI --- */
          <div className="embla overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
            <div className="embla__container flex gap-6">
              {latestPosts.map((post, i) => {
                const firstMedia = post.images?.[0] || post.image_url;
                const mediaIsVideo = firstMedia ? isVideo(firstMedia) : false;

                return (
                  <motion.div 
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => navigate(`/post/${post.id}`)}
                    className="embla__slide flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0 bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-all group flex flex-col"
                  >
                    <div className="p-6 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-800 rounded-full overflow-hidden border border-white/10">
                          {post.profiles?.avatar_url ? (
                            <img src={post.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-700"><User size={14} /></div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase italic truncate">{post.profiles?.username || 'Membro'}</p>
                          <p className="text-[8px] text-zinc-600 font-bold uppercase">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: it })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="aspect-video bg-black relative overflow-hidden">
                      {firstMedia ? (
                        <>
                          {mediaIsVideo ? (
                            <video 
                              src={firstMedia} 
                              className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                              muted
                              playsInline
                              loop
                            />
                          ) : (
                            <img 
                              src={firstMedia} 
                              className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
                              alt="" 
                            />
                          )}
                          {mediaIsVideo && (
                            <div className="absolute top-3 right-3 text-white/50">
                              <Play size={14} fill="currentColor" />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-950">
                          <MessageSquare size={32} className="text-zinc-800" />
                        </div>
                      )}
                    </div>

                    <div className={cn("p-6 flex-1 flex flex-col", !post.content && "pt-4")}>
                      {post.content && (
                        <p className="text-xs text-zinc-400 line-clamp-2 mb-6 italic font-medium">
                          "{post.content}"
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-zinc-700 pt-4 border-t border-white/5 mt-auto">
                        <div className="flex items-center gap-1.5">
                          <Heart size={12} className={cn(post.is_liked && "text-white fill-white")} />
                          <span className="text-[9px] font-black">{post.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageSquare size={12} />
                          <span className="text-[9px] font-black">{post.comments?.length || 0}</span>
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