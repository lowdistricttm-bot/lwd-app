"use client";

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, X, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useCreateActivity } from '@/hooks/use-buddypress';
import { showSuccess, showError } from '@/utils/toast';

const CreatePostDialog = () => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  
  const createActivity = useCreateActivity();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) {
      showError("Scrivi qualcosa prima di pubblicare");
      return;
    }

    try {
      await createActivity.mutateAsync({ 
        content, 
        userId: user.id 
      });
      showSuccess("Post pubblicato con successo!");
      setOpen(false);
      setContent("");
      setImage(null);
    } catch (err: any) {
      showError(err.message || "Errore durante la pubblicazione. Riprova.");
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-3 bg-zinc-900/50 border border-white/5 p-4 rounded-2xl w-full mb-8 hover:bg-zinc-900 transition-all group">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
          </div>
          <span className="text-gray-500 text-sm font-medium">Cosa c'è di nuovo nel tuo garage?</span>
          <ImagePlus className="ml-auto text-gray-600 group-hover:text-red-600 transition-colors" size={20} />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[500px] p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-white/5">
          <DialogTitle className="text-xl font-black uppercase tracking-tighter italic">Crea Post</DialogTitle>
          <DialogDescription className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
            Condividi un aggiornamento con la community di Low District
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            </div>
            <Textarea 
              placeholder="Racconta i progressi del tuo progetto..." 
              className="bg-transparent border-none focus-visible:ring-0 text-lg resize-none p-0 min-h-[120px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {image && (
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10">
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button"
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ImagePlus size={20} />
              <span className="text-xs font-bold uppercase tracking-widest">Foto/Video</span>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            
            <Button 
              type="submit" 
              disabled={!content.trim() || createActivity.isPending}
              className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest px-8 rounded-none italic"
            >
              {createActivity.isPending ? <Loader2 className="animate-spin" /> : "Pubblica"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;