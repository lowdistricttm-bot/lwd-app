"use client";

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import FeedPost from '@/components/FeedPost';
import { Loader2, ChevronLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      if (!postId) return null;
      
      // Recuperiamo il post singolo con i dati del profilo
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('*, profiles:user_id(username, first_name, last_name, avatar_url)')
        .eq('id', postId)
        .single();

      if (postError) throw postError;

      // Recuperiamo i commenti e i like per questo post
      const { data: comments } = await supabase
        .from('comments')
        .select('*, profiles(first_name, last_name, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      const { data: { user } } = await supabase.auth.getUser();
      let isLiked = false;
      if (user) {
        const { data: userLike } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle();
        isLiked = !!userLike;
      }

      const profile = postData.profiles;
      const username = profile 
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Membro District'
        : 'Membro District';

      return {
        ...postData,
        profiles: {
          username,
          avatar_url: profile?.avatar_url
        },
        likes_count: likesCount || 0,
        is_liked: isLiked,
        comments: comments || []
      };
    },
    enabled: !!postId
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-24 px-4 md:px-6 max-w-2xl mx-auto w-full">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 uppercase text-[10px] font-black tracking-widest transition-colors"
        >
          <ChevronLeft size={16} /> Torna indietro
        </button>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-red-600" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Caricamento post...</p>
          </div>
        ) : error || !post ? (
          <div className="text-center py-20 border border-white/5 bg-zinc-900/30 p-8">
            <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
            <p className="text-sm font-black uppercase tracking-widest text-zinc-500">Post non trovato</p>
            <Button onClick={() => navigate('/bacheca')} className="mt-6 bg-white text-black rounded-none font-black uppercase italic px-8">Vai alla Bacheca</Button>
          </div>
        ) : (
          <FeedPost post={post} />
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default PostDetail;