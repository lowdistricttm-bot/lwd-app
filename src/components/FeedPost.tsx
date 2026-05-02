"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, User, MoreHorizontal, Send, Loader2, CornerDownRight, Trash2, Camera, X, Share2, Edit3, Music, Volume2, VolumeX } from 'lucide-react';
// ... (altri import invariati)
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

// Componente CommentItem integrato per gestire i commenti e le risposte
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
          {replies.map(reply => (
            <CommentItem 
              key={reply.id} 
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
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const commentFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id || null));
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
      if (!isMuted) {
        audioRef.current.play().catch(() => console.log("Autoplay blocked"));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMuted]);

  const handleLike = () => {
    if (!currentUserId) {
      showError(language === 'it' ? "Accedi per mettere like" : "Login to like");
      navigate('/login');
      return;
    }
    if (!post.is_liked) {
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 1000);
    }
    toggleLike.mutate(post.id);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      showError(language === 'it' ? "Accedi per commentare" : "Login to comment");
      navigate('/login');
      return;
    }
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

  const handleShareClick = () => {
    if (!currentUserId) {
      navigate('/login');
      return;
    }
    if (role === 'subscriber') {
      showError(language === 'it' ? "L'inoltro dei post è riservato ai membri ufficiali." : "Forwarding posts is reserved for official members.");
      return;
    }
    setIsShareModalOpen(true);
  };

  const handleNativeShare = async () => {
    const username = post.profiles?.username || 'Membro';
    const shareData = {
      title: `Post di ${username} | Low District`,
      text: `Guarda questo post di ${username} su Low District!`,
      url: `${window.location.origin}/post/${post.id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        showSuccess(language === 'it' ? "Link post copiato!" : "Post link copied!");
      }
    } catch (err) {
      console.error('Errore condivisione:', err);
    }
  };

  const handleDeletePost = () => {
    if (confirm(language === 'it' ? "Sei sicuro di voler eliminare questo post?" : "Are you sure you want to delete this post?")) {
      deletePost.mutate(post.id);
    }
  };

  const isAuthor = currentUserId === post.user_id;
  const mainComments = post.comments?.filter(c => !c.parent_id) || [];
  const images = post.images || [];
  const likedBy = post.liked_by || [];

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-zinc-900/30 backdrop-blur-xl border border-white/5 mb-8 overflow-hidden group rounded-[2.5rem] shadow-2xl"
      >
        {/* Header */}
        <div className="p-5 flex items-center justify-between">
          <Link to={`/profile/${post.user_id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-11 h-11 bg-zinc-800 border border-white/10 overflow-hidden rounded-full">
              {post.profiles?.avatar_url ? (
                <img src={post.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={20} /></div>
              )}
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase italic tracking-widest text-white">{post.profiles?.username}</h4>
              <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: it })}
              </p>
            </div>
          </Link>
          
          <div className="flex items-center gap-2">
            {post.music_metadata && (
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 bg-white/5 rounded-full text-white hover:bg-white/10 transition-all"
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} className="animate-pulse" />}
              </button>
            )}
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-zinc-600 hover:text-white p-2 bg-white/5 rounded-full transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 rounded-2xl p-2">
                  <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="text-[9px] font-black uppercase tracking-widest italic text-white focus:bg-white/10 focus:text-white cursor-pointer rounded-xl py-3 px-4 mb-1">
                    <Edit3 size={14} className="mr-2" /> Modifica Post
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeletePost} className="text-[9px] font-black uppercase tracking-widest italic text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer rounded-xl py-3 px-4">
                    <Trash2 size={14} className="mr-2" /> Elimina Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-5">
          <p className="text-sm text-zinc-200 leading-relaxed font-medium italic">
            {post.content}
          </p>
          
          {post.music_metadata && (
            <div className="mt-4 flex items-center gap-2 bg-white/5 border border-white/10 p-2 pr-4 rounded-full w-fit">
              <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-black animate-spin-slow">
                <Music size={12} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase italic text-white leading-none">{post.music_metadata.title}</span>
                <span className="text-[7px] font-bold uppercase text-zinc-500 leading-none mt-1">{post.music_metadata.artist}</span>
              </div>
            </div>
          )}
        </div>

        {images.length > 0 && (
          <div 
            className={cn(
              "grid gap-1 bg-black/20 relative mx-4 rounded-[1.5rem] overflow-hidden border border-white/5",
              images.length === 1 ? "grid-cols-1" : "grid-cols-2"
            )}
            onDoubleClick={handleLike}
          >
            {images.map((url, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "aspect-square bg-zinc-950 overflow-hidden relative",
                  images.length === 3 && idx === 0 ? "row-span-2 h-full" : ""
                )}
              >
                {isVideo(url) ? (
                  <VideoPlayer src={url} className="w-full h-full" />
                ) : (
                  <img 
                    src={url} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000 cursor-pointer" 
                    alt="" 
                    onClick={() => setLightboxData({ images, index: idx })}
                  />
                )}
              </div>
            ))}

            <AnimatePresence>
              {showHeartPop && (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 1 }}
                  exit={{ scale: 2, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                >
                  <Heart size={100} className="text-white fill-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="p-5 flex flex-col gap-5">
          {likedBy.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] font-bold uppercase tracking-widest text-zinc-500 px-1">
              <div className="flex -space-x-2 mr-1">
                {likedBy.slice(0, 3).map((liker, i) => (
                  <div key={i} className="w-5 h-5 rounded-full border-2 border-black bg-zinc-800 overflow-hidden">
                    {liker.avatar_url ? (
                      <img src={liker.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <User size={8} className="m-auto h-full" />
                    )}
                  </div>
                ))}
              </div>
              <span className="text-zinc-600 italic">Piace a</span>
              
              {likedBy.length <= 2 ? (
                likedBy.map((liker, idx) => (
                  <React.Fragment key={liker.user_id}>
                    <Link to={`/profile/${liker.user_id}`} className="text-zinc-300 hover:text-white transition-colors italic">{liker.username}</Link>
                    {idx < likedBy.length - 1 && <span className="text-zinc-800">•</span>}
                  </React.Fragment>
                ))
              ) : (
                <>
                  <Link to={`/profile/${likedBy[0].user_id}`} className="text-zinc-300 hover:text-white transition-colors italic">{likedBy[0].username}</Link>
                  <span className="text-zinc-800">•</span>
                  <button onClick={() => setIsLikesModalOpen(true)} className="text-zinc-300 hover:text-white transition-colors italic">
                    e altri {likedBy.length - 1}
                  </button>
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-6 px-1">
            <button 
              onClick={handleLike} 
              className={cn(
                "flex items-center gap-2.5 transition-all group", 
                post.is_liked ? "text-white" : "text-zinc-500 hover:text-white"
              )}
            >
              <div className={cn(
                "p-2 rounded-full transition-colors",
                post.is_liked ? "bg-red-500/10" : "bg-white/5 group-hover:bg-white/10"
              )}>
                <Heart size={20} fill={post.is_liked ? "currentColor" : "none"} className={cn(post.is_liked && "text-red-500")} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{post.likes_count || 0}</span>
            </button>

            <button 
              onClick={() => setShowComments(!showComments)} 
              className={cn(
                "flex items-center gap-2.5 transition-colors group", 
                showComments ? "text-white" : "text-zinc-500 hover:text-white"
              )}
            >
              <div className={cn(
                "p-2 rounded-full transition-colors",
                showComments ? "bg-blue-500/10" : "bg-white/5 group-hover:bg-white/10"
              )}>
                <MessageSquare size={20} className={cn(showComments && "text-blue-400")} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{post.comments?.length || 0}</span>
            </button>
            
            <button 
              onClick={handleShareClick} 
              className="flex items-center gap-2.5 text-zinc-500 hover:text-white transition-colors group"
            >
              <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                <Send size={20} className="-rotate-12" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Invia</span>
            </button>

            <button 
              onClick={handleNativeShare} 
              className="flex items-center gap-2.5 text-zinc-500 hover:text-white transition-colors ml-auto group"
            >
              <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                <Share2 size={20} />
              </div>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showComments && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }} 
              className="border-t border-white/5 bg-black/40 overflow-hidden"
            >
              <div className="p-5 space-y-6">
                {mainComments.length > 0 ? (
                  <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {mainComments.map((comment: any) => (
                      <CommentItem 
                        key={comment.id} 
                        comment={comment} 
                        allComments={post.comments || []} 
                        onReply={(id, name) => {
                          if (!currentUserId) {
                            showError(language === 'it' ? "Accedi per rispondere" : "Login to reply");
                            navigate('/login');
                            return;
                          }
                          setReplyingTo({ id, name });
                        }}
                        onDelete={(id) => deleteComment.mutate(id)}
                        currentUserId={currentUserId}
                        onImageClick={(url) => setLightboxData({ images: [url], index: 0 })}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 opacity-30">
                    <MessageSquare size={32} className="mx-auto mb-2" />
                    <p className="text-[9px] font-black uppercase tracking-widest">Nessun commento. Sii il primo!</p>
                  </div>
                )}

                <div className="pt-5 border-t border-white/5">
                  {!currentUserId ? (
                    <div className="text-center py-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-3">Accedi per partecipare alla discussione</p>
                      <Button onClick={() => navigate('/login')} className="bg-white text-black rounded-full text-[9px] font-black uppercase italic h-9 px-6 shadow-xl">Accedi</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {replyingTo && (
                        <div className="flex items-center justify-between bg-white/5 px-4 py-2 rounded-full border border-white/10 animate-in slide-in-from-bottom-2">
                          <p className="text-[9px] font-black uppercase text-zinc-400 italic flex items-center gap-2">
                            <CornerDownRight size={10} /> Risposta a {replyingTo.name}
                          </p>
                          <button onClick={() => setReplyingTo(null)} className="text-[9px] text-zinc-500 hover:text-white uppercase font-black">Annulla</button>
                        </div>
                      )}
                      
                      {commentPreview && (
                        <div className="relative w-24 h-24 mb-2 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
                          {commentFile?.type.startsWith('video/') ? (
                            <video src={commentPreview} className="w-full h-full object-cover" />
                          ) : (
                            <img src={commentPreview} className="w-full h-full object-cover" alt="" />
                          )}
                          <button onClick={() => { setCommentFile(null); setCommentPreview(null); }} className="absolute top-1.5 right-1.5 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-500 transition-colors"><X size={12} /></button>
                        </div>
                      )}

                      <form onSubmit={handleAddComment} className="flex gap-3 items-center">
                        <input type="file" ref={commentFileInputRef} className="hidden" accept="image/*,video/*" onChange={handleCommentFileChange} />
                        <button 
                          type="button" 
                          onClick={() => commentFileInputRef.current?.click()} 
                          className="w-11 h-11 bg-white/5 border border-white/10 text-zinc-400 flex items-center justify-center rounded-full hover:text-white hover:bg-white/10 transition-all shrink-0"
                        >
                          <Camera size={18} />
                        </button>
                        <div className="flex-1 relative">
                          <Input 
                            placeholder="Scrivi un commento..." 
                            value={commentText} 
                            onChange={(e) => setCommentText(e.target.value)} 
                            className="bg-white/5 border-white/10 rounded-full h-11 px-5 text-xs font-bold uppercase tracking-widest focus-visible:ring-white/20 placeholder:text-zinc-600" 
                          />
                        </div>
                        <button 
                          type="submit" 
                          disabled={addComment.isPending || (!commentText.trim() && !commentFile)} 
                          className="w-11 h-11 bg-white text-black flex items-center justify-center rounded-full hover:scale-105 active:scale-95 transition-all shrink-0 shadow-xl disabled:opacity-50"
                        >
                          {addComment.isPending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} strokeWidth={2.5} className="-rotate-12" />}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <ImageLightbox images={lightboxData?.images || []} initialIndex={lightboxData?.index || 0} isOpen={!!lightboxData} onClose={() => setLightboxData(null)} />
      
      <SharePostModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        postId={post.id}
        postImageUrl={post.images?.[0]}
        postContent={post.content}
      />

      <LikesModal 
        isOpen={isLikesModalOpen}
        onClose={() => setIsLikesModalOpen(false)}
        likes={likedBy}
      />

      {isAuthor && (
        <EditPostModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          post={post}
        />
      )}
    </>
  );
};

export default FeedPost;