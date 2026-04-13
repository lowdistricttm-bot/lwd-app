"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, Share2, User, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Post, useSocialFeed } from '@/hooks/use-social-feed';
import { cn } from '@/lib/utils';

interface FeedPostProps {
  post: Post;
}

const FeedPost = ({ post }: FeedPostProps) => {
  const { toggleLike } = useSocialFeed();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/40 border border-white/5 mb-6 overflow-hidden group"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-800 border border-white/10 overflow-hidden">
            {post.profiles?.avatar_url ? (
              <img src={post.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                <User size={18} />
              </div>
            )}
          </div>
          <div>
            <h4 className="text-xs font-black italic uppercase tracking-tight">
              {post.profiles?.username || 'Membro'}
            </h4>
            <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: it })}
            </p>
          </div>
        </div>
        <button className="text-zinc-600 hover:text-white transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <p className="text-sm text-zinc-300 leading-relaxed font-medium">
          {post.content}
        </p>
      </div>

      {/* Image if exists */}
      {post.image_url && (
        <div className="aspect-square bg-zinc-950 overflow-hidden">
          <img 
            src={post.image_url} 
            alt="Post content" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
        </div>
      )}

      {/* Actions */}
      <div className="p-4 flex items-center gap-6 border-t border-white/5">
        <button 
          onClick={() => toggleLike.mutate(post.id)}
          className={cn(
            "flex items-center gap-2 transition-all",
            post.is_liked ? "text-red-600" : "text-zinc-500 hover:text-white"
          )}
        >
          <Heart size={18} fill={post.is_liked ? "currentColor" : "none"} />
          <span className="text-[10px] font-black uppercase">{post.likes_count || 0}</span>
        </button>
        
        <button className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
          <MessageSquare size={18} />
          <span className="text-[10px] font-black uppercase">{post.comments_count || 0}</span>
        </button>
        
        <button className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors ml-auto">
          <Share2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default FeedPost;