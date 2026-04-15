"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Heart, Share2, User, Send, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { BPActivity, useBPActions } from '@/hooks/use-buddypress';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

const ActivityItem = ({ activity }: { activity: BPActivity }) => {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const { favoriteMutation, commentMutation } = useBPActions();

  const handleLike = () => {
    favoriteMutation.mutate(activity.id);
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentMutation.mutate({ activityId: activity.id, content: commentText });
    setCommentText('');
    setShowCommentInput(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Low District Community',
      text: `Guarda questo post di ${activity.user_name} su Low District!`,
      url: `https://www.lowdistrict.it/attivita/p/${activity.id}/`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copiato negli appunti!");
      }
    } catch (err) {
      console.error('Errore condivisione:', err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 border border-white/5 p-6 mb-4 hover:border-white/20 transition-all group"
    >
      <div className="flex gap-4 mb-4">
        <div className="w-12 h-12 bg-zinc-800 overflow-hidden border border-white/10 shrink-0">
          {activity.user_avatar?.thumb ? (
            <img src={activity.user_avatar.thumb} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600">
              <User size={20} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-black italic tracking-tight truncate">
              {activity.user_name || 'Membro Low District'}
            </h4>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
              {formatDistanceToNow(new Date(activity.date), { addSuffix: true, locale: it })}
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-0.5" 
             dangerouslySetInnerHTML={{ __html: activity.action }} />
        </div>
      </div>

      <div 
        className="text-zinc-300 text-sm leading-relaxed mb-6 prose prose-invert max-w-none
                   prose-p:mb-2 prose-a:text-white prose-img:rounded-none"
        dangerouslySetInnerHTML={{ __html: activity.content.rendered }}
      />

      <div className="flex items-center gap-6 pt-4 border-t border-white/5">
        <button 
          onClick={handleLike}
          disabled={favoriteMutation.isPending}
          className={cn(
            "flex items-center gap-2 transition-colors",
            favoriteMutation.isPending ? "opacity-50" : "text-zinc-500 hover:text-white"
          )}
        >
          {favoriteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} />}
          <span className="text-[10px] font-black uppercase">Like</span>
        </button>
        
        <button 
          onClick={() => setShowCommentInput(!showCommentInput)}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
        >
          <MessageSquare size={16} />
          <span className="text-[10px] font-black uppercase">Commenta</span>
        </button>
        
        <button 
          onClick={handleShare}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors ml-auto"
        >
          <Share2 size={16} />
        </button>
      </div>

      <AnimatePresence>
        {showCommentInput && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleComment}
            className="mt-4 pt-4 border-t border-white/5 overflow-hidden"
          >
            <div className="flex gap-2">
              <Input 
                placeholder="Scrivi un commento..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="bg-zinc-950 border-zinc-800 rounded-none h-10 text-xs font-bold uppercase tracking-widest"
              />
              <button 
                type="submit"
                disabled={commentMutation.isPending}
                className="w-10 h-10 bg-zinc-700 flex items-center justify-center hover:bg-white hover:text-black transition-all shrink-0"
              >
                {commentMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ActivityItem;