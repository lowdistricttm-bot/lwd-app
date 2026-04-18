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

  if (checkingFollow) return <div className="flex-1 h-14 bg-white/5 animate-pulse rounded-full" />;

  return (
    <Button
      onClick={() => toggleFollow.mutate()}
      disabled={toggleFollow.isPending}
      className={cn(
        "rounded-full font-black uppercase italic text-xs tracking-[0.2em] h-14 px-10 transition-all duration-500 shadow-2xl",
        isFollowing 
          ? "bg-zinc-800 text-white border border-white/10 hover:bg-red-600 hover:border-red-600" 
          : "bg-white text-black hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
    >
      {toggleFollow.isPending ? (
        <Loader2 className="animate-spin" size={18} />
      ) : isFollowing ? (
        <><UserMinus size={18} className="mr-3" /> Segui già</>
      ) : (
        <><UserPlus size={18} className="mr-3" /> Segui</>
      )}
    </Button>
  );
};

export default FollowButton;