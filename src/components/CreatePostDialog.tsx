"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useCreateActivity } from '@/hooks/use-buddypress';
import { showSuccess, showError } from '@/utils/toast';

const CreatePostDialog = () => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const { user } = useAuth();
  const createActivity = useCreateActivity();
  
  const defaultAvatar = "https://www.lowdistrict.it/wp-content/uploads/placeholder.png";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    try {
      await createActivity.mutateAsync({ content });
      showSuccess("Post pubblicato sul sito!");
      setOpen(false);
      setContent("");
    } catch (err: any) {
      showError("Errore durante la pubblicazione");
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
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
              <img src={user.avatar || defaultAvatar} alt="" className="w-full h-full object-cover" />
            </div>
            <Textarea 
              placeholder="Racconta i progressi del tuo progetto..." 
              className="bg-transparent border-none focus-visible:ring-0 text-lg resize-none p-0 min-h-[120px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
              Il post apparirà sulla bacheca del sito
            </p>
            
            <Button type="submit" disabled={!content.trim() || createActivity.isPending} className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest px-8 rounded-none italic">
              {createActivity.isPending ? <Loader2 className="animate-spin" /> : "Pubblica"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;