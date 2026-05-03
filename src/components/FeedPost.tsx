"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Heart, MessageSquare, User, MoreHorizontal, Send, Loader2, CornerDownRight, Trash2, Camera, X, Share2, Edit3, Music, Volume2, VolumeX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Post, useSocialFeed } from '@/hooks/use-social-feed';
import { useAdmin } from '@/hooks/use-admin';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { supabase } from "@/integrations/supabase/client";
import ImageLightbox from './ImageLightbox';
import SharePostModal from './SharePostModal';
import LikesModal from './LikesModal';
import EditPostModal from './EditPostModal';
import VideoPlayer from './VideoPlayer';
import { Link, useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';
import { useTranslation } from '@/hooks/use-translation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const isVideo = (url: string) => url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('video');

let globalFeedMuteState = false;

const CommentItem = ({ 
  comment, 
  allComments, 
  onReply, 
  onDelete, 
  currentUserId, 
  onImageClick 
}: { 
  comment: any, 
  allComments: any[], 
  onReply: (id: string, name: string) => void, 
  onDelete: (id: string) => void, 
  currentUserId: string | null, 
  onImageClick: (url: string) => void 
}) => {
  const replies = allComments.filter(c => c.parent_id === comment.id);
  const canDelete = currentUserId === comment.user_id;

  return (
    <div className="space-y-4">
      <div className="flex gap-3 group/comment">
        <div className="w-8 h-8 bg-zinc-800 border border-white/10 overflow-hidden rounded-full shrink-0">
          {comment.profiles?.avatar_url ? (
            <img src={comment.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={14} /></div>
          )}
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase italic tracking-widest text-white">
                {comment.profiles?.username || 'Membro'}
              </span>
              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: it })}
              </span>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover/comment:opacity-100 transition-opacity">
              <button 
                onClick={() => onReply(comment.id, comment.profiles?.username || 'Membro')}
                className="text-[8px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
              >
                Rispondi
              </button>
              {canDelete && (
                <button 
                  onClick={() => onDelete(comment.id)}
                  className="text-zinc-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>
          
          <div className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-3 border border-white/5">
            <p className="text-[11px] text-zinc-300 leading-relaxed font-medium italic">{comment.content}</p>
            {comment.media_url && (
              <div 
                className="mt-3 rounded-xl overflow-hidden border border-white/10 max-w-[200px] cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => onImageClick(comment.media_url)}
              >
                {comment.media_type === 'video' ? (
                  <video src={comment.media_url} className="w-full aspect-video object-cover" />
                ) : (
                  <img src={comment.media_url} className="w-full object-cover" alt="" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {replies.length > 0 && (
        <div className="ml-11 space-y-4 border-l border-white/5 pl-4">
          {replies.map((reply, idx) => (
            <CommentItem 
              key={`reply-${reply.id}-${idx}`} 
              comment={reply} 
              allComments={allComments}
              onReply={onReply}
              onDelete={onDelete}
              currentUserId={currentUserId}
              onImageClick={onImageClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FeedPost = ({ post }: { post: Post }) => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { toggleLike, addComment, deletePost, deleteComment } = useSocialFeed();
  const { role } = useAdmin();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { amount: 0.6 });

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentFile, setCommentFile] = useState<File | null>(null);
  const [commentPreview, setCommentPreview] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string, name: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [lightboxData, setLightboxData] = useState<{ images: string[], index: number } | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [isMuted, setIsMuted] = useState(globalFeedMuteState); 
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const commentFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id || null));
  }, []);

  useEffect(() => {
    const handleMuteChange = (e: any) => setIsMuted(e.detail);
    window.addEventListener('feedMuteChange', handleMuteChange);
    return () => window.removeEventListener('feedMuteChange', handleMuteChange);
  }, []);

  useEffect(() => {
    if (post.music_metadata?.audio_url) {
      audioRef.current = new Audio(post.music_metadata.audio_url);
      audioRef.current.loop = true;
      audioRef.current.volume = isMuted ? 0 : 0.4;
      return () => {
        audioRef.current?.pause();
        audioRef.current = null;
      };
    }
  }, [post.music_metadata]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 0.4;
      if (isInView && !isMuted) audioRef.current.play().catch(() => {});
      else audioRef.current.pause();
    }
  }, [isInView, isMuted]);

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    globalFeedMuteState = newState;
    window.dispatchEvent(new CustomEvent('feedMuteChange', { detail: newState }));
  };

  const handleLike = () => {
    if (!currentUserId) { navigate('/login'); return; }
    if (!post.is_liked) {
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 1000);
    }
    toggleLike.mutate(post.id);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) { navigate('/login'); return; }
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

  const isAuthor = currentUserId === post.user_id;
  const mainComments = post.comments?.filter(c => !c.parent_id) || [];
  const images = post.images || [];
  const likedBy = post.liked_by || [];

  return (
    <>
      <motion.div 
        ref={containerRef}
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className={cn(
          "bg-zinc-900/30 backdrop-blur-xl border border-white/5 mb-8 overflow-hidden group rounded-[2.5rem] shadow-2xl transition-all duration-500",
          isInView ? "ring-1 ring-white/20 scale-[1.01]" : "opacity-60 scale-100"
        )}
      >
        <div className="p-5 flex items-center justify-between">
          <Link to={`/profile/${post.user_id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-11 h-11 bg-zinc-800 border border-white/10 overflow-hidden rounded-full">
              {post.profiles?.avatar_url ? (
                <img src={post.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={20} /></div>
              )}
            </div>
            <div className="flex flex-col">
              <h4 className="text-[10px] font-black uppercase italic tracking-widest text-white">{post.profiles?.username}</h4>
              <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: it })}
              </p>
            </div>
          </Link>
          
          <div className="flex items-center gap-2">
            {post.music_metadata && (
              <button onClick={toggleMute} className={cn("p-2 rounded-full text-white transition-all", isMuted ? "bg-white/5" : "bg-zinc-800")}>
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} className="animate-pulse" />}
              </button>
            )}
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-zinc-600 hover:text-white p-2 bg-white/5 rounded-full"><MoreHorizontal size={18} /></button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 rounded-2xl p-2">
                  <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="text-[9px] font-black uppercase italic text-white rounded-xl py-3 px-4">
                    <Edit3 size={14} className="mr-2" /> Modifica
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => deletePost.mutate(post.id)} className="text-[9px] font-black uppercase italic text-red-400 rounded-xl py-3 px-4">
                    <Trash2 size={14} className="mr-2" /> Elimina
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="px-6 pb-5">
          <p className="text-sm text-zinc-200 leading-relaxed font-medium italic">{post.content}</p>
        </div>

        {images.length > 0 && (
          <div className={cn("grid gap-1 bg-black/20 mx-4 rounded-[1.5rem] overflow-hidden border border-white/5", images.length === 1 ? "grid-cols-1" : "grid-cols-2")} onDoubleClick={handleLike}>
            {images.map((url, idx) => (
              <div key={`img-${post.id}-${idx}`} className={cn("aspect-square bg-zinc-950 overflow-hidden relative", images.length === 3 && idx === 0 ? "row-span-2 h-full" : "")}>
                {isVideo(url) ? <VideoPlayer src={url} className="w-full h-full" initialMuted={isMuted} /> : <img src={url} className="w-full h-full object-cover" alt="" onClick={() => setLightboxData({ images, index: idx })} />}
              </div>
            ))}
          </div>
        )}

        <div className="p-5 flex flex-col gap-5">
          {likedBy.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] font-bold uppercase tracking-widest text-zinc-500 px-1">
              <div className="flex -space-x-2 mr-1">
                {likedBy.slice(0, 3).map((liker, i) => (
                  <div key={`avatar-${post.id}-${liker.user_id}-${i}`} className="w-5 h-5 rounded-full border-2 border-black bg-zinc-800 overflow-hidden">
                    {liker.avatar_url ? <img src={liker.avatar_url} className="w-full h-full object-cover" alt="" /> : <User size={8} className="m-auto h-full" />}
                  </div>
                ))}
              </div>
              <span className="text-zinc-600 italic">Piace a</span>
              {likedBy.length <= 2 ? likedBy.map((liker, idx) => (
                <React.Fragment key={`liker-name-${post.id}-${liker.user_id}-${idx}`}>
                  <Link to={`/profile/${liker.user_id}`} className="text-zinc-300 hover:text-white transition-colors italic">{liker.username}</Link>
                  {idx < likedBy.length - 1 && <span className="text-zinc-800">•</span>}
                </React.Fragment>
              )) : (
                <>
                  <Link to={`/profile/${likedBy[0].user_id}`} className="text-zinc-300 hover:text-white transition-colors italic">{likedBy[0].username}</Link>
                  <span className="text-zinc-800">•</span>
                  <button onClick={() => setIsLikesModalOpen(true)} className="text-zinc-300 hover:text-white italic">e altri {likedBy.length - 1}</button>
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-6 px-1">
            <button onClick={handleLike} className={cn("flex items-center gap-2.5 transition-all group", post.is_liked ? "text-white" : "text-zinc-500 hover:text-white")}>
              <div className={cn("p-2 rounded-full", post.is_liked ? "bg-red-500/10" : "bg-white/5")}>
                <Heart size={20} fill={post.is_liked ? "currentColor" : "none"} className={cn(post.is_liked && "text-red-500")} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{post.likes_count || 0}</span>
            </button>

            <button onClick={() => setShowComments(!showComments)} className={cn("flex items-center gap-2.5 transition-colors group", showComments ? "text-white" : "text-zinc-500 hover:text-white")}>
              <div className={cn("p-2 rounded-full", showComments ? "bg-blue-500/10" : "bg-white/5")}>
                <MessageSquare size={20} className={cn(showComments && "text-blue-400")} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{post.comments?.length || 0}</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showComments && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/5 bg-black/40 overflow-hidden">
              <div className="p-5 space-y-6">
                {mainComments.length > 0 ? (
                  <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                    {mainComments.map((comment: any, idx: number) => (
                      <CommentItem 
                        key={`comment-${comment.id}-${idx}`} 
                        comment={comment} 
                        allComments={post.comments || []} 
                        onReply={(id, name) => setReplyingTo({ id, name })}
                        onDelete={(id) => deleteComment.mutate(id)}
                        currentUserId={currentUserId}
                        onImageClick={(url) => setLightboxData({ images: [url], index: 0 })}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 opacity-30">
                    <MessageSquare size={32} className="mx-auto mb-2" />
                    <p className="text-[9px] font-black uppercase tracking-widest">Nessun commento</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <ImageLightbox images={lightboxData?.images || []} initialIndex={lightboxData?.index || 0} isOpen={!!lightboxData} onClose={() => setLightboxData(null)} />
      <LikesModal isOpen={isLikesModalOpen} onClose={() => setIsLikesModalOpen(false)} likes={likedBy} />
      {isAuthor && <EditPostModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} post={post} />}
    </>
  );
};

export default FeedPost;