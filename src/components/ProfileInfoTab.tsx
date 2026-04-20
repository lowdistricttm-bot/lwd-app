"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Instagram, Facebook, Music2, Globe, Edit3, Save, X, User, Quote, MapPin } from 'lucide-react';
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
    city: '',
    instagram_handle: '',
    facebook_handle: '',
    tiktok_handle: '',
    website_url: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        bio: profile.bio || '',
        city: profile.city || '',
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
      const { error } = await supabase
        .from('profiles')
        .update({
          bio: formData.bio,
          city: formData.city,
          instagram_handle: formData.instagram_handle,
          facebook_handle: formData.facebook_handle,
          tiktok_handle: formData.tiktok_handle,
          website_url: formData.website_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;
      
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
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black italic uppercase tracking-tighter">Modifica Info</h3>
          <div className="flex gap-3">
            <button onClick={() => setIsEditing(false)} className="text-[10px] font-black uppercase italic text-zinc-500 hover:text-white transition-colors">Annulla</button>
            <button 
              onClick={handleSave} 
              disabled={loading} 
              className="bg-white text-black hover:bg-zinc-200 rounded-full h-10 px-6 text-[10px] font-black uppercase italic transition-all shadow-xl shadow-white/5"
            >
              {loading ? "Salvataggio..." : "Salva"}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <Label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-4">Biografia</Label>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6">
              <Textarea 
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                placeholder="Scrivi qualcosa su di te e sui tuoi progetti..."
                className="bg-transparent border-none focus-visible:ring-0 p-0 min-h-[120px] text-sm italic text-white placeholder:text-zinc-700 resize-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-4">Città di Residenza</Label>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-1">
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-zinc-500" />
                <Input 
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value.toUpperCase()})}
                  placeholder="ES: MILANO"
                  className="bg-transparent border-none focus-visible:ring-0 p-0 h-12 text-xs font-bold text-white placeholder:text-zinc-800"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-4">Social & Link</Label>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden">
              {[
                { icon: Instagram, field: 'instagram_handle', placeholder: '@username', label: 'Instagram' },
                { icon: Music2, field: 'tiktok_handle', placeholder: '@username', label: 'TikTok' },
                { icon: Facebook, field: 'facebook_handle', placeholder: 'facebook.com/tuonome', label: 'Facebook' },
                { icon: Globe, field: 'website_url', placeholder: 'https://...', label: 'Sito Web' }
              ].map((item, i, arr) => (
                <div key={item.field} className={cn("flex items-center gap-4 p-5", i !== arr.length - 1 && "border-b border-white/5")}>
                  <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center text-zinc-400">
                    <item.icon size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[8px] font-black uppercase text-zinc-600 mb-1">{item.label}</p>
                    <Input 
                      value={(formData as any)[item.field]}
                      onChange={e => setFormData({...formData, [item.field]: e.target.value})}
                      placeholder={item.placeholder}
                      className="bg-transparent border-none focus-visible:ring-0 p-0 h-auto text-xs font-bold text-white placeholder:text-zinc-800"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black italic uppercase tracking-tighter">Informazioni</h3>
        {isOwnProfile && (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white hover:text-black rounded-full font-black uppercase italic text-[10px] tracking-widest h-10 px-6 transition-all flex items-center gap-2"
          >
            <Edit3 size={14} /> Modifica
          </button>
        )}
      </div>

      <div className="space-y-10">
        {/* Bio Section */}
        <div className="space-y-4">
          <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.3em] italic ml-4">Biografia</h4>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
            <Quote className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32 rotate-12" />
            {profile?.bio ? (
              <p className="text-zinc-200 leading-relaxed italic font-medium text-sm whitespace-pre-wrap relative z-10">
                {profile.bio}
              </p>
            ) : (
              <p className="text-zinc-700 text-xs italic font-bold uppercase tracking-widest">Nessuna biografia inserita.</p>
            )}
          </div>
        </div>

        {/* City Section */}
        <div className="space-y-4">
          <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.3em] italic ml-4">Posizione</h4>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-6 flex items-center gap-4 shadow-2xl">
            <div className="w-10 h-10 bg-black/40 rounded-2xl flex items-center justify-center text-zinc-500 border border-white/5">
              <MapPin size={18} className={cn(profile?.city && "text-white")} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-0.5">Città</span>
              <span className="text-xs font-bold text-white italic uppercase">
                {profile?.city || 'Non specificata'}
              </span>
            </div>
          </div>
        </div>

        {/* Socials Section */}
        <div className="space-y-4">
          <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.3em] italic ml-4">Social & Link</h4>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
            {[
              { icon: Instagram, label: 'Instagram', value: profile?.instagram_handle, href: profile?.instagram_handle ? `https://instagram.com/${profile.instagram_handle.replace('@', '')}` : null, color: "text-pink-500" },
              { icon: Music2, label: 'TikTok', value: profile?.tiktok_handle, href: profile?.tiktok_handle ? `https://tiktok.com/@${profile.tiktok_handle.replace('@', '')}` : null, color: "text-white" },
              { icon: Facebook, label: 'Facebook', value: profile?.facebook_handle, href: profile?.facebook_handle?.startsWith('http') ? profile.facebook_handle : `https://${profile?.facebook_handle}`, color: "text-blue-500" },
              { icon: Globe, label: 'Website', value: profile?.website_url, href: profile?.website_url, color: "text-emerald-400" }
            ].map((social, i, arr) => (
              <div key={i} className={cn("flex items-center justify-between p-6 group", i !== arr.length - 1 && "border-b border-white/5")}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black/40 rounded-2xl flex items-center justify-center text-zinc-500 group-hover:bg-white/10 transition-all border border-white/5">
                    <social.icon size={18} className={cn("transition-colors", social.value && social.color)} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-0.5">{social.label}</span>
                    <span className="text-xs font-bold text-white italic truncate max-w-[150px] block">
                      {social.value || 'Non collegato'}
                    </span>
                  </div>
                </div>
                {social.value ? (
                  <a 
                    href={social.href || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-10 px-6 bg-white text-black rounded-full flex items-center justify-center text-[9px] font-black uppercase italic tracking-widest hover:scale-105 transition-all shadow-lg"
                  >
                    Visita
                  </a>
                ) : (
                  <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center opacity-20">
                    <X size={14} />
                  </div>
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