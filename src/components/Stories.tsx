"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Loader2, User, AtSign, X, Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStories } from '@/hooks/use-stories';
import { supabase } from "@/integrations/supabase/client";
import StoryViewer from './StoryViewer';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { showError } from '@/utils/toast';
import { Input } from './ui/input';

const Stories = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { stories, isLoading, uploadStory } = useStories();
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Stato per il caricamento con menzioni
  const [isMentionModalOpen, setIsMentionModalOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMentions, setSelectedMentions] = useState<any[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        setUserProfile(data);
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const searchUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${searchQuery}%`)
        .neq('id', currentUser?.id)
        .limit(5);
      setSearchResults(data || []);
    };
    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, currentUser]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (!currentUser) {
      showError("Accedi per partecipare");
      navigate('/login');
      return;
    }
    setPendingFiles(files);
    setIsMentionModalOpen(true);
  };

  const handleFinalUpload = async () => {
    const mentionIds = selectedMentions.map(m => m.id);
    await uploadStory.mutateAsync({ files: pendingFiles, mentions: mentionIds });
    resetModal();
  };

  const resetModal = () => {
    setIsMentionModalOpen(false);
    setPendingFiles([]);
    setSelectedMentions([]);
    setSearchQuery('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleMention = (user: any) => {
    if (selectedMentions.find(m => m.id === user.id)) {
      setSelectedMentions(prev => prev.filter(m => m.id !== user.id));
    } else {
      setSelectedMentions(prev => [...prev, user]);
      setSearchQuery('');
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar py-6 px-6 bg-black border-b border-white/5">
      <div className="flex flex-col items-center gap-2 shrink-0">
        <div className="relative">
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" multiple onChange={handleFileSelect} />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-16 h-16 rounded-full border-[2.5px] border-zinc-800 flex items-center justify-center bg-zinc-900 overflow-hidden"
          >
            {uploadStory.isPending ? <Loader2 className="animate-spin text-zinc-400" size={20} /> : userProfile?.avatar_url ? <img src={userProfile.avatar_url} className="w-full h-full object-cover" /> : <User size={24} className="text-zinc-700" />}
          </button>
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-black shadow-lg"><Plus size={12} className="text-black font-bold" /></div>
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">La tua storia</span>
      </div>

      {stories?.map((userGroup: any, index: number) => (
        <button key={userGroup.user_id} onClick={() => setSelectedUserIndex(index)} className="flex flex-col items-center gap-2 shrink-0">
          <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-zinc-700 via-zinc-400 to-white">
            <div className="w-full h-full rounded-full border-[2.5px] border-black overflow-hidden bg-zinc-900">
              {userGroup.avatar_url ? <img src={userGroup.avatar_url} className="w-full h-full object-cover" /> : <User size={24} className="m-auto text-zinc-700" />}
            </div>
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300 truncate w-16 text-center">{userGroup.username}</span>
        </button>
      ))}

      <AnimatePresence>
        {isMentionModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8">
              <div className="text-center">
                <AtSign size={40} className="mx-auto mb-4 text-white" />
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Menziona qualcuno?</h2>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Riceveranno un messaggio nei Direct</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                  <Input 
                    placeholder="CERCA USERNAME..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 rounded-none h-14 pl-12 font-black uppercase text-xs"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedMentions.map(user => (
                    <div key={user.id} className="bg-white text-black px-3 py-1.5 flex items-center gap-2 rounded-full">
                      <span className="text-[10px] font-black uppercase italic">@{user.username}</span>
                      <button onClick={() => toggleMention(user)}><X size={12} /></button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {searchResults.map(user => (
                    <button key={user.id} onClick={() => toggleMention(user)} className="w-full flex items-center justify-between p-3 bg-zinc-900/50 border border-white/5 hover:bg-zinc-800 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800">
                          {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <User size={14} className="m-auto h-full" />}
                        </div>
                        <span className="text-xs font-black italic uppercase">@{user.username}</span>
                      </div>
                      {selectedMentions.find(m => m.id === user.id) && <Check size={16} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={resetModal} className="flex-1 h-14 border border-white/10 font-black uppercase italic text-xs tracking-widest">Annulla</button>
                <button onClick={handleFinalUpload} disabled={uploadStory.isPending} className="flex-1 h-14 bg-white text-black font-black uppercase italic text-xs tracking-widest flex items-center justify-center gap-2">
                  {uploadStory.isPending ? <Loader2 className="animate-spin" /> : 'Pubblica'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedUserIndex !== null && stories && (
        <StoryViewer allStories={stories} initialUserIndex={selectedUserIndex} onClose={() => setSelectedUserIndex(null)} />
      )}
    </div>
  );
};

export default Stories;