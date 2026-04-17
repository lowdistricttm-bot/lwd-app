"use client";

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSocialFeed } from '@/hooks/use-social-feed';
import { MessageSquare, User, Heart, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';

const LatestActivities = () => {
  const navigate = useNavigate();
  const { posts, isLoading } = useSocialFeed();
  
  const [emblaRef] = useEmblaCarousel({ 
    align: 'start', 
    containScroll: 'trimSnaps',
    dragFree: true 
  });

  if (isLoading) return null;
  
  const latestPosts = posts?.slice(0, 6) || [];
  if (latestPosts.length === 0) return null;

  const isVideo = (url: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('video');
  };

  return (
    <section className="py-24 px-6 bg-zinc-950 border-t border-white/5 overflow-hidden">
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
                  className="embla__slide flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0 bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-all group"
                >
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

                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-zinc-800 rounded-full overflow-hidden border border-white/10">
                        {post.profiles?.avatar_url ? (
                          <img src={post.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-700"><User size={14} /></div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase italic truncate">{post.profiles?.username}</p>
                        <p className="text-[8px] text-zinc-600 font-bold uppercase">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: it })}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-zinc-400 line-clamp-2 mb-4 italic font-medium h-8">
                      "{post.content}"
                    </p>

                    <div className="flex items-center gap-4 text-zinc-700 pt-4 border-t border-white/5">
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
      </div>
    </section>
  );
};

export default LatestActivities;