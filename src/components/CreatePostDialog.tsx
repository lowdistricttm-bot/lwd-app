"use client";

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2, X, Film } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useCreatePost } from '@/hooks/use-posts';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

const CreatePostDialog = () => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const createPost = useCreatePost();
  
  const defaultAvatar = "https://www.lowdistrict.it/wp-content/uploads/placeholder.png";

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const uploadMedia = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('post_media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('post_media')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !previewUrl) return;
    if (!user) return;

    setIsUploading(true);
    try {
      let imageUrl = undefined;
      const file = fileInputRef.current?.files?.[0];
      
      if (file) {
        imageUrl = await uploadMedia(file) || undefined;
      }

      await createPost.mutateAsync({ 
        content: content.trim(),
        user_id: String(user.id),
        user_name: user.display_name,
        user_avatar: user.avatar || defaultAvatar,
        image_url: imageUrl
      });

      showSuccess("Post pubblicato!");
      setOpen(false);
      setContent("");
      setPreviewUrl(null);
    } catch (err) {
      showError("Errore durante la pubblicazione.");
    } finally {
      setIsUploading(false);
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
          <DialogDescription className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
            Condividi foto o video del tuo progetto con la community.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-white/10">
              <img src={user.avatar || defaultAvatar} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-4">
              <Textarea 
                placeholder="Racconta i progressi del tuo progetto..." 
                className="bg-transparent border-none focus-visible:ring-0 text-lg resize-none p-0 min-h-[100px] placeholder:text-gray-700"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              
              {previewUrl && (
                <div className="relative rounded-xl overflow-hidden border border-white/10">
                  <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-60 object-cover" />
                  <button 
                    type="button"
                    onClick={() => { setPreviewUrl(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex gap-2">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
              >
                <ImagePlus size={24} />
              </button>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
              >
                <Film size={24} />
              </button>
            </div>
            
            <Button 
              type="submit" 
              disabled={(!content.trim() && !previewUrl) || isUploading} 
              className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest px-8 py-6 rounded-none italic"
            >
              {isUploading ? <Loader2 className="animate-spin" size={16} /> : "Pubblica"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;