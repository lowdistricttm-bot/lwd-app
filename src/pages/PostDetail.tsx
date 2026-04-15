"use client";

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import FeedPost from '@/components/FeedPost';
import { usePost } from '@/hooks/use-social-feed';
import { Loader2, ChevronLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: post, isLoading, error } = usePost(postId);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-24 px-4 md:px-6 max-w-2xl mx-auto w-full">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 uppercase text-[10px] font-black tracking-widest transition-colors"
        >
          <ChevronLeft size={16} /> Torna Indietro
        </button>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-zinc-500" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Caricamento post...</p>
          </div>
        ) : error || !post ? (
          <div className="text-center py-20 border border-white/5 bg-zinc-900/30 p-8">
            <AlertCircle className="mx-auto text-zinc-800 mb-6" size={48} />
            <p className="text-sm font-black uppercase tracking-widest text-zinc-500">Post non trovato</p>
            <p className="text-[10px] text-zinc-600 mt-2 uppercase font-bold">Il contenuto potrebbe essere stato rimosso o non essere più disponibile.</p>
            <Button 
              onClick={() => navigate('/bacheca')}
              className="mt-8 bg-white text-black rounded-none font-black uppercase italic px-8 h-12"
            >
              Vai alla Bacheca
            </Button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FeedPost post={post} />
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default PostDetail;