"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { useSocialFeed } from '@/hooks/use-social-feed';
import { Loader2, MessageSquare, User, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

const LatestActivities = () => {
  const { posts, isLoading } = useSocialFeed();
  const latestPosts = posts?.slice(0, 3) || [];

  if (isLoading) return null;

  return (
    <section className="py-24 px-6 bg-zinc-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">District Live</h2>
            <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">Community <br /> Activity</h3>
          </div>
          <Link to="/bacheca" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
            Entra nella Bacheca <MessageSquare size={16} className="group-hover:scale-110 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestPosts.map((post, i) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-zinc-900/30 border border-white/5 p-6 hover:border-white/10 transition-all"
            >
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
              
              <p className="text-xs text-zinc-400 line-clamp-2 mb-4 italic font-medium">
                "{post.content}"
              </p>

              <div className="flex items-center gap-4 text-zinc-700">
                <div className="flex items-center gap-1.5">
                  <Heart size={12} />
                  <span className="text-[9px] font-black">{post.likes_count || 0}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare size={12} />
                  <span className="text-[9px] font-black">{post.comments?.length || 0}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestActivities;