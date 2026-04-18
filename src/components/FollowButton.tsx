"use client";

import React from 'react';
import { useFollow } from '@/hooks/use-follow';
import { Button } from './ui/button';
import { Loader2, UserPlus, UserMinus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  userId: string;
  className?: string;
}

const FollowButton = ({ userId, className }: FollowButtonProps) => {
  const { isFollowing, checkingFollow, toggleFollow } = useFollow(userId);

  if (checkingFollow) return <div className="w-24 h-10 bg-white/5 animate-pulse rounded-full" />;

  return (
    <Button
      onClick={() => toggleFollow.mutate()}
      disabled={toggleFollow.isPending}
      className={cn(
        "rounded-full font-black uppercase italic text-[10px] tracking-widest h-10 px-6 transition-all duration-500 shadow-xl",
        isFollowing 
          ? "bg-zinc-800 text-white border border-white/10 hover:bg-red-600 hover:border-red-600" 
          : "bg-white text-black hover:bg-zinc-200",
        className
      )}
    >
      {toggleFollow.isPending ? (
        <Loader2 className="animate-spin" size={14} />
      ) : isFollowing ? (
        <><UserMinus size={14} className="mr-2" /> Segui già</>
      ) : (
        <><UserPlus size={14} className="mr-2" /> Segui</>
      )}
    </Button>
  );
};

export default FollowButton;