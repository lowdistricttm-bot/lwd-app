"use client";

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSocialFeed } from '@/hooks/use-social-feed';
import { MessageSquare, User, Heart, Play, LogIn, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import { Button } from './ui/button';
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

const LatestActivities = () => {
  const navigate = useNavigate();
  const { posts, isLoading } = useSocialFeed();
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
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

  const handlePostClick = (postId: string) => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      navigate(`/post/${postId}`);
    }
  };

  const latestPosts = posts?.slice(0, 6) || [];

  return (
    <section className="py-24 px-6 bg-zinc-950 border-t border-white/5 overflow-hidden min-h-[400px]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">District Live</h2>
            <h3 className="text-3xl xs:text-4xl md:text-6xl font-black italic tracking-tighter uppercase whitespace-nowrap">
              Community Activity
            </h3>
          </div>
          
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Link to="/bacheca" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
              Entra nella Bacheca <MessageSquare size={16} className="group-hover:scale-110 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-zinc-800" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700 italic">Sincronizzazione District...</p>
          </div>
        ) : latestPosts.length === 0 ? (
          <div className="text-center py-20 border border-white/5 bg-zinc-900/10">
            <MessageSquare className="mx-auto text-zinc-900 mb-4" size={48} />
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Il District è silenzioso oggi. Sii il primo a pubblicare!</p>
          </div>
        ) : (
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
                    onClick={() => handlePostClick(post.id)}
                    className="embla__slide flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0 bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-all group flex flex-col"
                  >
                    {/* 1. Author Info Header */}
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

                    {/* 2. Media Preview */}
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
                      {!user && (
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ShieldCheck size={32} className="text-white/50" />
                        </div>
                      )}
                    </div>

                    {/* 3. Content & Stats */}
                    <div className="p-6 flex-1 flex flex-col">
                      <p className="text-xs text-zinc-400 line-clamp-2 mb-6 italic font-medium h-8">
                        {post.content ? `"${post.content}"` : ""}
                      </p>

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

      {/* Modal Invito Registrazione */}
      <AlertDialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-none">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-zinc-900 border border-white/10 flex items-center justify-center rotate-45">
                <ShieldCheck size={32} className="text-white -rotate-45" />
              </div>
            </div>
            <AlertDialogTitle className="text-white font-black uppercase italic text-center">Entra nel District</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 text-xs font-bold uppercase leading-relaxed text-center">
              Per visualizzare i post completi, i media in alta qualità e interagire con la community Low District, devi far parte del club.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
            <AlertDialogAction 
              onClick={() => navigate('/login')} 
              className="rounded-none bg-white text-black font-black uppercase italic text-[10px] w-full h-12"
            >
              Accedi Ora <ArrowRight size={14} className="ml-2" />
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-none border-white/10 text-white font-black uppercase italic text-[10px] w-full h-12 mt-0">
              Continua a Esplorare
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default LatestActivities;