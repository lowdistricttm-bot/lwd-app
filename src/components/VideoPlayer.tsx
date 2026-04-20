"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Play, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface VideoPlayerProps {
  src: string;
  className?: string;
  poster?: string;
  autoPlay?: boolean;
  initialMuted?: boolean;
}

const VideoPlayer = ({ src, className, poster, autoPlay = true, initialMuted = false }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && autoPlay) {
            video.play().catch((error) => {
              console.warn("[VideoPlayer] Autoplay blocked. User interaction required for audio.", error);
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.6 }
    );

    observer.observe(video);

    return () => {
      observer.unobserve(video);
    };
  }, [autoPlay, src]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  return (
    <div className={cn("relative w-full h-full bg-black group/video overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-zinc-900/20 backdrop-blur-sm">
          <Loader2 className="animate-spin text-white/20" size={32} />
        </div>
      )}

      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
        webkit-playsinline="true"
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
      />

      {/* Overlay Controls */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
        <div className="flex justify-end">
          <button 
            onClick={toggleMute}
            className="pointer-events-auto p-2 bg-black/40 backdrop-blur-md rounded-full text-white/80 hover:text-white hover:bg-black/60 transition-all"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        <div className="flex justify-center items-center flex-1">
          {!isPlaying && !isLoading && (
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white opacity-0 group-hover/video:opacity-100 transition-opacity">
              <Play size={32} fill="currentColor" />
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <motion.div 
          className="h-full bg-white"
          initial={{ width: 0 }}
          animate={{ 
            width: isPlaying ? "100%" : "0%" 
          }}
          transition={{ 
            duration: videoRef.current?.duration || 0, 
            ease: "linear",
            repeat: Infinity
          }}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;