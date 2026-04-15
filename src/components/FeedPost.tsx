"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, User, MoreHorizontal, Send, Loader2, CornerDownRight, Trash2, Edit3, Camera, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Post, useSocialFeed } from '@/hooks/use-social-feed';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { supabase } from "@/integrations/supabase/client";
import ImageLightbox from './ImageLightbox';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CommentItem = ({ 
  comment, 
  allComments, 
  onReply, 
  onDelete, 
  currentUserId, 
  onImageClick,
  level = 0 
}: { 
  comment: any, 
  allComments: any[], 
  onReply: (id: string, name: string) => void, 
  onDelete: (id: string) => void, 
  currentUserId: string | null,
  onImageClick: (url: string) => void,
  level?: number
}) => {
  const replies = allComments.filter(c => c.parent_id === comment.id);
  const username = comment.profiles?.username || 'Membro';

  return (
    <div className={cn("space-y-4", level > 0 ? "ml-6 md:ml-10" : "")}>
      <div className="flex gap-3">
        {level > 0 && <CornerDownRight size={14} className="text-zinc-800 mt-2 shrink-0" />}
        <div className={cn("bg-zinc-800 shrink-0 overflow-hidden", level > 0 ? "w-6 h-6" : "w-8 h-8")}>
          {comment.profiles?.avatar_url && <img src={comment.profiles.avatar_url} className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1">
          <div className={cn(
            "bg-zinc-900/80 p-3 rounded-2xl rounded-tl-none relative group/comment",
            level > 0 ? "bg-zinc-900/40 border border-white/5" : ""
          )}>
            <p className="text-[9px] font-black uppercase italic text-zinc-400 mb-1">{username}</p>
            <p className="text-xs text-zinc-200">{comment.content}</p>
            
            {comment.image_url && (
              <div 
                className="mt-2 max-w-[200px] aspect-square bg-zinc-950 overflow-hidden cursor-pointer border border-white/5"
                onClick={() => onImageClick(comment.image_url)}
              >
                <img src={comment.image_url} className="w-full h-full object-cover" alt="Comment attachment" />
              </div>
            )}

            {currentUserId === comment.user_id && (
              <button 
                onClick={() => onDelete(comment.id)}
                className="absolute top-2 right-2 opacity-0 group-hover/comment:opacity-100 text-zinc-600 hover:text-white transition-all"
              >
                <Trash2 size={level > 0 ? 10 : 12} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1 ml-1">
            <span className="text-[8px] text-zinc-600 font-bold uppercase">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: it })}
            </span>
            <button 
              onClick={() => onReply(comment.id, username)}
              className="text-[9px] font-black uppercase text-zinc-500 hover:text-white transition-colors"
            >
              Rispondi
            </button>
          </div>
        </div>
      </div>

      {replies.length > 0 && (
        <div className="space-y-4">
          {replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              allComments={allComments} 
              onReply={onReply} 
              onDelete={onDelete} 
              currentUserId={currentUserId}
              onImageClick={onImageClick}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FeedPost = ({ post }: { post: Post }) => {
  const { toggleLike, addComment, deletePost, deleteComment } = useSocialFeed();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentFile, setCommentFile] = useState<File | null>(null);
  const [commentPreview, setCommentPreview] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string, name: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [lightboxData, setLightboxData] = useState<{ images: string[], index: number } | null>(null);
  const commentFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id || null));
  }, []);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() && !commentFile) return;
    try {
      await addComment.mutateAsync({ 
        postId: post.id, 
        content: commentText,
        parentId: replyingTo?.id,
        file: commentFile || undefined
      });
      setCommentText('');
      setCommentFile(null);
      setCommentPreview(null);
      setReplyingTo(null);
    } catch (err) {}
  };

  const handleCommentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCommentFile(file);
      setCommentPreview(URL.createObjectURL(file));
    }
  };

  const isAuthor = currentUserId === post.user_id;
  const mainComments = post.comments?.filter(c => !c.parent_id) || [];
  const images = post.images || [];

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/40 border border-white/5 mb-6 overflow-hidden group">
        <div className="p-4 flex items-center justify-between">
          <Link to={`/profile/${post.user_id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-zinc-800 border border-white/10 overflow-hidden">
              {post.profiles?.avatar_url && <img src={post.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />}
            </div>
            <div>
              <h4 className="text-xs font-black italic uppercase tracking-tight">{post.profiles?.username}</h4>
              <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: it })}
              </p>
            </div>
          </Link>
          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild><button className="text-zinc-600 hover:text-white p-2"><MoreHorizontal size={18} /></button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 rounded-none">
                <DropdownMenuItem onClick={() => deletePost.mutate(post.id)} className="text-[10px] font-black uppercase tracking-widest italic text-zinc-400 focus:bg-zinc-800 focus:text-white cursor-pointer"><Trash2 size={14} className="mr-2" /> Elimina</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="px-4 pb-4"><p className="text-sm text-zinc-300 leading-relaxed font-medium">{post.content}</p></div>

        {images.length > 0 && (
          <div className={cn(
            "grid gap-0.5 bg-black border-y border-white/5",
            images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : "grid-cols-2"
          )}>
            {images.map((url, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "aspect-square bg-zinc-950 overflow-hidden cursor-pointer relative",
                  images.length === 3 && idx === 0 ? "row-span-2" : ""
                )}
                onClick={() => setLightboxData({ images, index: idx })}
              >
                <img src={url} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt="" />
              </div>
            ))}
          </div>
        )}

        <div className="p-4 flex items-center gap-6 border-t border-white/5">
          <button onClick={() => toggleLike.mutate(post.id)} className={cn("flex items-center gap-2 transition-all", post.is_liked ? "text-white" : "text-zinc-500 hover:text-white")}>
            <Heart size={18} fill={post.is_liked ? "currentColor" : "none"} />
            <span className="text-[10px] font-black uppercase">{post.likes_count || 0}</span>
          </button>
          <button onClick={() => setShowComments(!showComments)} className={cn("flex items-center gap-2 transition-colors", showComments ? "text-white" : "text-zinc-500 hover:text-white")}>
            <MessageSquare size={18} />
            <span className="text-[10px] font-black uppercase">{post.comments?.length || 0}</span>
          </button>
        </div>

        <AnimatePresence>
          {showComments && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/5 bg-black/20 overflow-hidden">
              <div className="p-4 space-y-6">
                {mainComments.map((comment: any) => (
                  <CommentItem 
                    key={comment.id} 
                    comment={comment} 
                    allComments={post.comments || []} 
                    onReply={(id, name) => setReplyingTo({ id, name })}
                    onDelete={(id) => deleteComment.mutate(id)}
                    currentUserId={currentUserId}
                    onImageClick={(url) => setLightboxData({ images: [url], index: 0 })}
                  />
                ))}

                <div className="pt-4 border-t border-white/5">
                  {replyingTo && (
                    <div className="flex items-center justify-between mb-2 px-2">
                      <p className="text-[9px] font-black uppercase text-zinc-400 italic">Risposta a {replyingTo.name}</p>
                      <button onClick={() => setReplyingTo(null)} className="text-[9px] text-zinc-600 hover:text-white uppercase font-bold">Annulla</button>
                    </div>
                  )}
                  
                  {commentPreview && (
                    <div className="relative w-20 h-20 mb-4 bg-zinc-900 border border-white/10 overflow-hidden">
                      <img src={commentPreview} className="w-full h-full object-cover" alt="" />
                      <button onClick={() => { setCommentFile(null); setCommentPreview(null); }} className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full"><X size={10} /></button>
                    </div>
                  )}

                  <form onSubmit={handleAddComment} className="flex gap-2 items-center">
                    <input type="file" ref={commentFileInputRef} className="hidden" accept="image/*" onChange={handleCommentFileChange} />
                    <button type="button" onClick={() => commentFileInputRef.current?.click()} className="w-10 h-10 bg-zinc-900 text-zinc-500 flex items-center justify-center hover:text-white transition-all shrink-0"><Camera size={16} /></button>
                    <Input placeholder="Scrivi un commento..." value={commentText} onChange={(e) => setCommentText(e.target.value)} className="bg-zinc-900 border-zinc-800 rounded-none h-10 text-xs font-bold uppercase tracking-widest" />
                    <button type="submit" disabled={addComment.isPending} className="w-10 h-10 bg-zinc-700 flex items-center justify-center hover:bg-white hover:text-black transition-all shrink-0">
                      {addComment.isPending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <ImageLightbox images={lightboxData?.images || []} initialIndex={lightboxData?.index || 0} isOpen={!!lightboxData} onClose={() => setLightboxData(null)} />
    </>
  );
};

export default FeedPost;