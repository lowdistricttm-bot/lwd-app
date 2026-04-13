"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, User, MoreHorizontal, Send, Loader2, CornerDownRight, Trash2, Edit3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Post, useSocialFeed } from '@/hooks/use-social-feed';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { supabase } from "@/integrations/supabase/client";
import EditPostModal from './EditPostModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FeedPostProps {
  post: Post;
}

const FeedPost = ({ post }: FeedPostProps) => {
  const { toggleLike, addComment, deletePost, deleteComment } = useSocialFeed();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string, name: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await addComment.mutateAsync({ 
        postId: post.id, 
        content: commentText,
        parentId: replyingTo?.id 
      });
      setCommentText('');
      setReplyingTo(null);
    } catch (err) {}
  };

  const isVideo = post.image_url?.match(/\.(mp4|webm|ogg|mov)$/i);
  const isAuthor = currentUserId === post.user_id;

  const mainComments = post.comments?.filter(c => !c.parent_id) || [];
  const getReplies = (parentId: string) => post.comments?.filter(c => c.parent_id === parentId) || [];

  return (
    <>
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
          
          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-zinc-600 hover:text-white transition-colors p-2">
                  <MoreHorizontal size={18} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 rounded-none">
                <DropdownMenuItem 
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-[10px] font-black uppercase tracking-widest italic focus:bg-white focus:text-black cursor-pointer"
                >
                  <Edit3 size={14} className="mr-2" /> Modifica
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => deletePost.mutate(post.id)}
                  className="text-[10px] font-black uppercase tracking-widest italic text-red-600 focus:bg-red-600 focus:text-white cursor-pointer"
                >
                  <Trash2 size={14} className="mr-2" /> Elimina
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
              <div className="p-4 space-y-6">
                {mainComments.map((comment: any) => (
                  <div key={comment.id} className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-zinc-800 shrink-0 overflow-hidden">
                        {comment.profiles?.avatar_url && <img src={comment.profiles.avatar_url} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1">
                        <div className="bg-zinc-900/80 p-3 rounded-2xl rounded-tl-none relative group/comment">
                          <p className="text-[10px] font-black uppercase italic text-red-600 mb-1">
                            {comment.profiles ? `${comment.profiles.first_name || ''} ${comment.profiles.last_name || ''}`.trim() : 'Membro'}
                          </p>
                          <p className="text-xs text-zinc-200">{comment.content}</p>
                          
                          {currentUserId === comment.user_id && (
                            <button 
                              onClick={() => deleteComment.mutate(comment.id)}
                              className="absolute top-2 right-2 opacity-0 group-hover/comment:opacity-100 text-zinc-600 hover:text-red-600 transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 ml-1">
                          <span className="text-[8px] text-zinc-600 font-bold uppercase">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: it })}
                          </span>
                          <button 
                            onClick={() => {
                              const name = comment.profiles ? `${comment.profiles.first_name || ''}` : 'Membro';
                              setReplyingTo({ id: comment.id, name });
                            }}
                            className="text-[9px] font-black uppercase text-zinc-500 hover:text-white transition-colors"
                          >
                            Rispondi
                          </button>
                        </div>
                      </div>
                    </div>

                    {getReplies(comment.id).map((reply: any) => (
                      <div key={reply.id} className="flex gap-3 ml-10">
                        <CornerDownRight size={14} className="text-zinc-800 mt-2 shrink-0" />
                        <div className="w-6 h-6 bg-zinc-800 shrink-0 overflow-hidden">
                          {reply.profiles?.avatar_url && <img src={reply.profiles.avatar_url} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1">
                          <div className="bg-zinc-900/40 p-2 rounded-xl rounded-tl-none border border-white/5 relative group/reply">
                            <p className="text-[9px] font-black uppercase italic text-zinc-400 mb-0.5">
                              {reply.profiles ? `${reply.profiles.first_name || ''} ${reply.profiles.last_name || ''}`.trim() : 'Membro'}
                            </p>
                            <p className="text-[11px] text-zinc-400">{reply.content}</p>
                            
                            {currentUserId === reply.user_id && (
                              <button 
                                onClick={() => deleteComment.mutate(reply.id)}
                                className="absolute top-2 right-2 opacity-0 group-hover/reply:opacity-100 text-zinc-600 hover:text-red-600 transition-all"
                              >
                                <Trash2 size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                <div className="pt-4 border-t border-white/5">
                  {replyingTo && (
                    <div className="flex items-center justify-between mb-2 px-2">
                      <p className="text-[9px] font-black uppercase text-red-600 italic">
                        Risposta a {replyingTo.name}
                      </p>
                      <button onClick={() => setReplyingTo(null)} className="text-[9px] text-zinc-600 hover:text-white uppercase font-bold">Annulla</button>
                    </div>
                  )}
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <Input 
                      placeholder={replyingTo ? "Scrivi una risposta..." : "Scrivi un commento..."}
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <EditPostModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        post={post} 
      />
    </>
  );
};

export default FeedPost;