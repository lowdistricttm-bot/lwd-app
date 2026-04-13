"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useCreatePost } from '@/hooks/use-posts';
import { showSuccess, showError } from '@/utils/toast';

const CreatePostDialog = () => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const { user } = useAuth();
  const createPost = useCreatePost();
  
  const defaultAvatar = "https://www.lowdistrict.it/wp-content/uploads/placeholder.png";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      showError("Il contenuto del post non può essere vuoto.");
      return;
    }

    if (!user || !user.id) {
      showError("Devi essere loggato per pubblicare.");
      return;
    }

    try {
      console.log("[CreatePost] Tentativo di pubblicazione...", {
        content,
        user_id: String(user.id),
        user_name: user.display_name
      });

      await createPost.mutateAsync({ 
        content: content.trim(),
        user_id: String(user.id),
        user_name: user.display_name,
        user_avatar: user.avatar || defaultAvatar
      });

      showSuccess("Post pubblicato nella community!");
      setOpen(false);
      setContent("");
    } catch (err: any) {
      console.error("[CreatePost] Errore durante la creazione:", err);
      showError(err.message || "Errore durante la pubblicazione. Riprova tra poco.");
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-3 bg-zinc-900/50 border border-white/5 p-4 rounded-2xl w-full mb-8 hover:bg-zinc-900 transition-all group">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
            <img src={user.avatar || defaultAvatar} alt="" className="w-full h-full object-cover" />
          </div>
          <span className="text-gray-500 text-sm font-medium">Cosa c'è di nuovo nel tuo garage?</span>
          <ImagePlus className="ml-auto text-gray-600 group-hover:text-red-600 transition-colors" size={20} />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[500px] p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-white/5">
          <DialogTitle className="text-xl font-black uppercase tracking-tighter italic">Crea Post</DialogTitle>
          <DialogDescription className="text-xs text-gray-500 uppercase font-bold tracking-widest">
            Condividi i tuoi progressi con la community di Low District
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-white/10">
              <img src={user.avatar || defaultAvatar} alt="" className="w-full h-full object-cover" />
            </div>
            <Textarea 
              placeholder="Racconta i progressi del tuo progetto..." 
              className="bg-transparent border-none focus-visible:ring-0 text-lg resize-none p-0 min-h-[120px] placeholder:text-gray-700"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={createPost.isPending}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest max-w-[200px]">
              Il post sarà visibile a tutti i membri dell'app
            </p>
            
            <Button 
              type="submit" 
              disabled={!content.trim() || createPost.isPending} 
              className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest px-8 py-6 rounded-none italic shadow-lg shadow-red-600/20"
            >
              {createPost.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} /> Invio...
                </span>
              ) : "Pubblica"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;