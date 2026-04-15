"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Instagram, Facebook, Music2, Globe, Edit3, Save, X, User } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

interface ProfileInfoTabProps {
  profile: any;
  isOwnProfile: boolean;
  onUpdate: () => void;
}

const ProfileInfoTab = ({ profile, isOwnProfile, onUpdate }: ProfileInfoTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    instagram_handle: '',
    facebook_handle: '',
    tiktok_handle: '',
    website_url: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        bio: profile.bio || '',
        instagram_handle: profile.instagram_handle || '',
        facebook_handle: profile.facebook_handle || '',
        tiktok_handle: profile.tiktok_handle || '',
        website_url: profile.website_url || ''
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Verifichiamo prima se le colonne esistono o se l'update fallisce per colonne mancanti
      const { error } = await supabase
        .from('profiles')
        .update({
          bio: formData.bio,
          instagram_handle: formData.instagram_handle,
          facebook_handle: formData.facebook_handle,
          tiktok_handle: formData.tiktok_handle,
          website_url: formData.website_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) {
        console.error("Errore salvataggio profilo:", error);
        if (error.message?.includes("column") && error.message?.includes("does not exist")) {
          throw new Error("Il database non è ancora aggiornato. Riprova tra qualche istante o contatta l'assistenza.");
        }
        throw error;
      }
      
      showSuccess("Informazioni aggiornate!");
      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      showError(err.message || "Errore durante il salvataggio");
    } finally {
      setLoading(false);
    }
  };

  if (isEditing && isOwnProfile) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black italic uppercase">Modifica Info</h3>
          <div className="flex gap-2">
            <Button onClick={() => setIsEditing(false)} variant="outline" className="border-white/10 h-10 px-4 rounded-none text-[10px] font-black uppercase italic">Annulla</Button>
            <Button onClick={handleSave} disabled={loading} className="bg-white text-black h-10 px-6 rounded-none text-[10px] font-black uppercase italic">
              {loading ? "Salvataggio..." : "Salva"}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-zinc-500">Biografia</Label>
            <Textarea 
              value={formData.bio}
              onChange={e => setFormData({...formData, bio: e.target.value})}
              placeholder="Scrivi qualcosa su di te e sui tuoi progetti..."
              className="bg-zinc-900/50 border-zinc-800 rounded-none min-h-[120px] text-sm italic"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2">
                <Instagram size={12} /> Instagram (Username)
              </Label>
              <Input 
                value={formData.instagram_handle}
                onChange={e => setFormData({...formData, instagram_handle: e.target.value})}
                placeholder="@username"
                className="bg-zinc-900/50 border-zinc-800 rounded-none h-12 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2">
                <Music2 size={12} /> TikTok (Username)
              </Label>
              <Input 
                value={formData.tiktok_handle}
                onChange={e => setFormData({...formData, tiktok_handle: e.target.value})}
                placeholder="@username"
                className="bg-zinc-900/50 border-zinc-800 rounded-none h-12 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2">
                <Facebook size={12} /> Facebook (Link Profilo)
              </Label>
              <Input 
                value={formData.facebook_handle}
                onChange={e => setFormData({...formData, facebook_handle: e.target.value})}
                placeholder="facebook.com/tuonome"
                className="bg-zinc-900/50 border-zinc-800 rounded-none h-12 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2">
                <Globe size={12} /> Sito Web / Portfolio
              </Label>
              <Input 
                value={formData.website_url}
                onChange={e => setFormData({...formData, website_url: e.target.value})}
                placeholder="https://..."
                className="bg-zinc-900/50 border-zinc-800 rounded-none h-12 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black italic uppercase">Informazioni</h3>
        {isOwnProfile && (
          <Button 
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="border-white/10 hover:bg-white hover:text-black rounded-none font-black uppercase italic text-[10px] tracking-widest h-10 px-6"
          >
            <Edit3 size={14} className="mr-2" /> Modifica Info
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest italic border-b border-white/5 pb-2">Biografia</h4>
            {profile?.bio ? (
              <p className="text-zinc-300 leading-relaxed italic font-medium text-sm whitespace-pre-wrap">
                {profile.bio}
              </p>
            ) : (
              <p className="text-zinc-600 text-xs italic">Nessuna biografia inserita.</p>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest italic border-b border-white/5 pb-2">Social & Link</h4>
          <div className="space-y-4">
            {[
              { icon: Instagram, label: 'Instagram', value: profile?.instagram_handle, href: profile?.instagram_handle ? `https://instagram.com/${profile.instagram_handle.replace('@', '')}` : null },
              { icon: Music2, label: 'TikTok', value: profile?.tiktok_handle, href: profile?.tiktok_handle ? `https://tiktok.com/@${profile.tiktok_handle.replace('@', '')}` : null },
              { icon: Facebook, label: 'Facebook', value: profile?.facebook_handle, href: profile?.facebook_handle?.startsWith('http') ? profile.facebook_handle : `https://${profile?.facebook_handle}` },
              { icon: Globe, label: 'Website', value: profile?.website_url, href: profile?.website_url }
            ].map((social, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors">
                    <social.icon size={14} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{social.label}</span>
                </div>
                {social.value ? (
                  <a 
                    href={social.href || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] font-black uppercase italic text-white border-b border-white/20 hover:border-white transition-all"
                  >
                    Visita
                  </a>
                ) : (
                  <span className="text-[8px] font-bold uppercase text-zinc-800">N/A</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfoTab;