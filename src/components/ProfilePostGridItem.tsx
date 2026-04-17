"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Layers, MessageSquare, Heart } from 'lucide-react';
import { Post } from '@/hooks/use-social-feed';
import { cn } from '@/lib/utils';

interface ProfilePostGridItemProps {
  post: Post;
}

const ProfilePostGridItem = ({ post }: ProfilePostGridItemProps) => {
  const navigate = useNavigate();
  const images = post.images || [];
  const firstMedia = images[0] || post.image_url;
  
  const isVideo = (url: string) => url?.match(/\.(mp4|webm|ogg|mov)$/i) || url?.includes('video');
  const hasMultipleImages = images.length > 1;
  const isMediaVideo = firstMedia ? isVideo(firstMedia) : false;

  return (
    <div 
      onClick={() => navigate(`/post/${post.id}`)}
      className="relative aspect-square bg-zinc-900 overflow-hidden cursor-pointer group"
    >
      {firstMedia ? (
        <>
          {isMediaVideo ? (
            <video 
              src={firstMedia} 
              className="w-full h-full object-cover"
              muted
              playsInline
            />
          ) : (
            <img 
              src={firstMedia} 
              alt="" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
          )}
          
          {/* Icone in alto a destra (Video o Carosello) */}
          <div className="absolute top-2 right-2 text-white drop-shadow-md">
            {isMediaVideo ? (
              <Play size={16} fill="currentColor" />
            ) : hasMultipleImages ? (
              <Layers size={16} fill="currentColor" className="rotate-90" />
            ) : null}
          </div>
        </>
      ) : (
        /* Fallback per post di solo testo */
        <div className="w-full h-full flex items-center justify-center p-4 bg-zinc-950 border border-white/5">
          <p className="text-[8px] font-black uppercase italic text-zinc-500 line-clamp-4 text-center">
            {post.content}
          </p>
        </div>
      )}

      {/* Overlay al passaggio del mouse (Like e Commenti) */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 md:gap-6">
        <div className="flex items-center gap-1.5 text-white">
          <Heart size={18} fill="currentColor" />
          <span className="text-xs font-black">{post.likes_count || 0}</span>
        </div>
        <div className="flex items-center gap-1.5 text-white">
          <MessageSquare size={18} fill="currentColor" />
          <span className="text-xs font-black">{post.comments?.length || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePostGridItem;