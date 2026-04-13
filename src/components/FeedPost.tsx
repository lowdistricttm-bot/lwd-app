"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, User, MoreHorizontal, Send, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Post, useSocialFeed } from '@/hooks/use-social-feed';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';

interface FeedPostProps {
  post: Post;
}

const FeedPost = ({ post }: FeedPostProps) => {
  const { toggleLike, addComment } = useSocialFeed();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await addComment.mutateAsync({ postId: post.id, content: commentText });
      setCommentText('');
    } catch (err) {}
  };

  const isVideo = post.image_url?.match(/\.(mp4|webm|ogg|mov)$/i);

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

      {/* Media */}
      {post.image_url && (
        <div className="aspect-square bg-zinc-950 overflow-hidden">
          {isVideo ? (
            <video src={post.image_url} className="w-full h-full object-cover" controls />
          ) : (
            <img 
              src={post.image_url} 
              alt="Post content" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
          )}
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
        
        <button 
          onClick={() => setShowComments(!showComments)}
          className={cn(
            "flex items-center gap-2 transition-colors",
            showComments ? "text-white" : "text-zinc-500 hover:text-white"
          )}
        >
          <MessageSquare size={18} />
          <span className="text-[10px] font-black uppercase">{post.comments?.length || 0}</span>
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-black/20 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {post.comments?.map((comment: any) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-6 h-6 bg-zinc-800 shrink-0 overflow-hidden">
                    {comment.profiles?.avatar_url && <img src={comment.profiles.avatar_url} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase italic text-zinc-400">
                      {comment.profiles ? `${comment.profiles.first_name || ''} ${comment.profiles.last_name || ''}`.trim() : 'Membro'}
                    </p>
                    <p className="text-xs text-zinc-300">{comment.content}</p>
                  </div>
                </div>
              ))}

              <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                <Input 
                  placeholder="Scrivi un commento..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 rounded-none h-10 text-xs font-bold uppercase tracking-widest"
                />
                <button 
                  type="submit"
                  disabled={addComment.isPending}
                  className="w-10 h-10 bg-red-600 flex items-center justify-center hover:bg-white hover:text-black transition-all shrink-0"
                >
                  {addComment.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FeedPost;